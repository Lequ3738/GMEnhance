// GMEnhance — code-completion enhancement for GameMaker 8.0 (gm82save-style)
//
// Works inside GM80_CodeEditor_Completion_BuildList (sub_58DCD8), verified via
// IDA similarity vs GM 8.1 sub_6BA714 (0.657). Two features:
//
//  1) "///" script arg-list (gm82save completion_script_args @ 0x6BAA91):
//     a script whose first line is `/// text (a, b, c)` shows `(a, b, c)`
//     (chars after the '(' up to the line end) in the completion dropdown.
//     Hook: RVA 0x18E055 `call sub_55BE74` -> completion_script_args_stub.
//     The stub keeps ecx=script index and edx=&[ebp-0x5C] (set by the caller),
//     runs the getter, then copies [ebp-0x5C] over the "(...)" stack arg.
//     RVA 0x18E05C slot byte A4->A8 makes AddEntry's name the script name
//     (var_58) instead of the arg-list.
//
//  2) trigger-constant completion (gm82save 0x6BAA1C/2E/3A/41):
//     trigger entries match/display the trigger CONSTANT rather than its name.
//     - RVA 0x18DFE0: rel32 low2 of `call sub_55D53C` -> sub_55D604 (const), so
//       the prefix match compares the constant.
//     - RVA 0x18DFF2: `push "(...)"...` replaced with push0/push4/lea edx,[esp+4]/
//       mov ecx,ebx so the args slot can hold " <name>".
//     - RVA 0x18DFFE: `call sub_55D53C` -> add_space_before_trigger_name.
//     - RVA 0x18E005: `mov ecx,[ebp-0x54]` slot AC->B0 makes AddEntry's name the
//       constant (var_50).
//
// GM 8.0 string format: [len:4][data...], length at data-4 (GM80_STR_LEN_OFF).
// gm82save's source is UTF-16; 8.0 is ANSI/GBK so the arg-list scan is byte-wise.

#include "pch.h"
#include "delphi.h"
#include "gm80_addresses.h"
#include "gm_log.h"
#include "completion.h"

static uintptr_t g_base = 0;
static bool g_hooked = false;
static uint8_t g_orig_script_call[5] = {0};
static uint8_t g_orig_script_ecx = 0;
static uint8_t g_orig_trig_const[2] = {0};
static uint8_t g_orig_trig_push[10] = {0};
static uint8_t g_orig_trig_call[5] = {0};
static uint8_t g_orig_trig_ecx = 0;

static inline void* abs_ptr(uint32_t rva)
{
    return (void*)(g_base + rva);
}

// ---- string helpers (GM 8.0: length at data-4) ----
static int32_t str_len(uint32_t s)
{
    if (!s) return 0;
    int32_t l = *(int32_t*)(s - 4);
    return (l < 0 || l > 5000000) ? 0 : l;
}

// Create+assign a GM string through @LStrFromPCharLen (Delphi memory manager).
static void write_ansistring(uint32_t out_var_addr, const char* data, int32_t len)
{
    if (!out_var_addr || len <= 0) return;
    delphi_fastcall_3(
        abs_ptr(ADDR_LSTR_FROM_PCHAR_LEN), out_var_addr, (uint32_t)data, (uint32_t)len);
}

// script object +4 = source (GM string; length at -4)
static bool script_source(uint32_t sobj, uint32_t* out_src, int32_t* out_len)
{
    if (!sobj) return false;
    uint32_t src = *(uint32_t*)(sobj + OFF_SCRIPT_SOURCE);
    if (!src) return false;
    int32_t len = *(int32_t*)(src - 4);
    if (len < 0 || len > 5000000) return false;
    *out_src = src;
    *out_len = len;
    return true;
}

// ---- feature 1: "///" arg-list (Delphi fastcall: ecx=script_id, edx=&out) ----
static void __fastcall completion_script_args_impl(
    uint32_t script_id, uint32_t out_var_addr)
{
    uint32_t* scripts = *(uint32_t**)(g_base + ADDR_SCRIPTS_ARRAY);
    uint32_t count = *(uint32_t*)(g_base + ADDR_SCRIPTS_COUNT);
    if (scripts && script_id < count)
    {
        uint32_t src = 0;
        int32_t len = 0;
        if (script_source(scripts[script_id], &src, &len))
        {
            const char* s = (const char*)src;
            // first line must start with "///" (gm82save: source[..3] == "///")
            if (len >= 3 && s[0] == '/' && s[1] == '/' && s[2] == '/')
            {
                // end of the first line
                int32_t line_end = 3;
                while (line_end < len && s[line_end] != '\r' && s[line_end] != '\n')
                    ++line_end;
                // find '(' within the FIRST LINE only (scanning the whole source
                // would pick up a '(' from later code lines, as gm82save's
                // all-source scan does on 8.1)
                int32_t paren = -1;
                for (int32_t i = 3; i < line_end; i++)
                {
                    if (s[i] == '(')
                    {
                        paren = i;
                        break;
                    }
                }
                if (paren >= 0)
                {
                    // arg-list = chars from '(' (INCLUSIVE) up to line end,
                    // trailing whitespace trimmed. gm82save copies with
                    // @UStrCopy(source, paren_pos + 1, count) — Delphi indexes
                    // are 1-based, so that start is the '(' itself.
                    int32_t end = paren;
                    while (end < len && s[end] != '\r' && s[end] != '\n')
                        ++end;
                    while (end > paren && (s[end - 1] == ' ' || s[end - 1] == '\t'))
                        --end;
                    int32_t n = end - paren;
                    if (n > 0)
                    {
                        if (n > 500) n = 500;
                        char buf[512];
                        memcpy(buf, s + paren, (size_t)n);
                        buf[n] = '\0';
                        write_ansistring(out_var_addr, buf, n);
                        gm_log("GMEnhance completion args: script idx=%u args=[%s]",
                            script_id, buf);
                        return;
                    }
                }
            }
        }
    }
    // no arg-list — keep the native "(...)" placeholder
    write_ansistring(out_var_addr, "(...)", 5);
}

// Entry stub (main hook at 0x18E055). Caller (BuildList frame) has already done
// lea edx,[ebp-0x5C] and mov eax,ebx (script index). EBP = BuildList frame:
//   [ebp-0x5C] = out slot, [esp+8] = AddEntry's args-string stack slot.
__declspec(naked) static void completion_script_args_stub()
{
    __asm {
        mov ecx, eax // ecx = script index
        call completion_script_args_impl // __fastcall(ecx, edx=&[ebp-0x5C])
        // copy the generated arg-list over the "(...)" stack slot
        mov eax, dword ptr [ebp - 0x5C]
        mov dword ptr [esp + 8], eax
        ret
    }
}

// ---- feature 2: trigger constant (Delphi fastcall: ecx=trigger_id, edx=&out) ----
static void __fastcall add_space_before_trigger_name_impl(
    uint32_t trigger_id, uint32_t out_var_addr)
{
    uint32_t name = 0;
    delphi_fastcall_2(abs_ptr(ADDR_TRIGGER_GET_NAME), trigger_id, (uint32_t)&name);
    int32_t l = str_len(name);
    if (l > 508) l = 508;

    char buf[512]{};
    buf[0] = ' ';
    buf[1] = '(';
    if (name && l > 0) memcpy(buf + 2, (const char*)name, (size_t)l);
    buf[l + 2] = ')';

    write_ansistring(out_var_addr, buf, l + 3);
    gm_log("GMEnhance completion trigger: id=%u display=[%s]", trigger_id, buf);
}

bool completion_install(HMODULE gm_base)
{
    g_base = (uintptr_t)gm_base;
    uint8_t* script_call = (uint8_t*)abs_ptr(ADDR_COMPLETION_SCRIPT_CALL);
    uint8_t* script_ecx = (uint8_t*)abs_ptr(ADDR_COMPLETION_SCRIPT_ECX);
    uint8_t* trig_const = (uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_CONST);
    uint8_t* trig_push = (uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_PUSH);
    uint8_t* trig_call = (uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_CALL);
    uint8_t* trig_ecx = (uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_ECX);

    memcpy(g_orig_script_call, script_call, 5);
    g_orig_script_ecx = *script_ecx;
    memcpy(g_orig_trig_const, trig_const, 2);
    memcpy(g_orig_trig_push, trig_push, 10);
    memcpy(g_orig_trig_call, trig_call, 5);
    g_orig_trig_ecx = *trig_ecx;

    patch_call(script_call, (void*)completion_script_args_stub);
    uint8_t b = 0xA8; // [ebp-0x5C] -> [ebp-0x58] (script name)
    patch_bytes(script_ecx, &b, 1);

    // rel32 low2 of `call sub_55D53C` @ 0x18DFDF -> sub_55D604 (trigger const).
    // rel32 = sub_55D604 - 0x18DFE4 = -0x309E0 = 0xFFFCF620, low2 = F6 20.
    uint8_t rc[2] = {0x20, 0xF6};
    patch_bytes(trig_const, rc, 2);
    // push0;push4;lea edx,[esp+4];mov ecx,ebx (10 bytes replacing push "(...)"
    // + push 4 + lea edx,[ebp-0x54]).
    uint8_t tp[10] = {0x6A, 0x00, 0x6A, 0x04, 0x8D, 0x54, 0x24, 0x04, 0x8B, 0xCB};
    patch_bytes(trig_push, tp, 10);
    patch_call(trig_call, (void*)add_space_before_trigger_name_impl);
    uint8_t b2 = 0xB0; // [ebp-0x54] -> [ebp-0x50] (trigger const)
    patch_bytes(trig_ecx, &b2, 1);

    g_hooked = true;
    gm_log("GMEnhance completion_install: script_call@%p trig_call@%p", script_call,
        trig_call);
    return true;
}

void completion_uninstall()
{
    if (!g_hooked) return;
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_SCRIPT_CALL), g_orig_script_call, 5);
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_SCRIPT_ECX), &g_orig_script_ecx, 1);
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_CONST), g_orig_trig_const, 2);
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_PUSH), g_orig_trig_push, 10);
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_CALL), g_orig_trig_call, 5);
    patch_bytes((uint8_t*)abs_ptr(ADDR_COMPLETION_TRIG_ECX), &g_orig_trig_ecx, 1);
    g_hooked = false;
    gm_log("GMEnhance completion_uninstall: restored");
}
