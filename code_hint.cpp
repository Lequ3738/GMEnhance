// GMEnhance — code editor hint enhancement for GameMaker 8.0 (gm82save-style)
//
// Hook: sub_58E57C (GetCaretWordHelp) at RVA 0x18E614 — the `call sub_5A8128`
// that starts the native extension-function helpline chain. GM 8.0 ALREADY HAS
// this feature natively (verified via IDA similarity vs GM 8.1, see
// gm80_addresses.h); gm82save only accelerates it and adds a "///" script
// doc-comment fallback at its GM 8.1 hook site (0x6BB12E). This module mirrors
// gm82save's logic: preserve the native chain, then fall back to "///".
//
// The hook replaces the 5-byte `call sub_5A8128` with `call code_hint_stub`.
// Inside sub_58E57C's frame: [ebp-4] = name (GM string), [ebp-8] = address of
// the output string variable. The stub extracts those, runs the combined getter,
// then returns 0 (AL=0) so the original `test al,al; jz <end>` skips the now
// redundant native chain.
//
// GM 8.0 string format (IMPORTANT): strings are [len:4][data...] — the length
// lives at data-4, NOT data-8 like a stock Delphi 7 AnsiString. Read lengths
// at -4. See GM80_STR_LEN_OFF in gm80_addresses.h.
//
// "///" convention (gm82save): put `/// text (a, b, c)` on the first line of a
// script; the code editor shows `text` as the help line for that script.

#include "pch.h"
#include "delphi.h"
#include "gm80_addresses.h"
#include "gm_log.h"
#include "code_hint.h"

static uintptr_t g_base = 0;
static uint8_t g_orig[5] = {0};
static bool g_hooked = false;

static inline void* abs_ptr(uint32_t rva)
{
    return (void*)(g_base + rva);
}

// ---- native extension-function helpline chain (GM 8.0, Delphi convention) ----
// One-pass lookup: instead of the native three-call chain
// (IsFunctionName -> GetFunctionId -> BuildHelpline, three extension-table
// scans), a single GM80_ExtFunc_FindFunctionByName hit returns the function
// entry with id at +0x10 and helpline string at +0x14 — identical semantics,
// one scan. (gm82save does the same single-call trick on 8.1.)
static bool ext_helpline_fast(uint32_t name, uint32_t out_var_addr)
{
    uint32_t* exts = *(uint32_t**)(g_base + ADDR_EXT_ARRAY);
    uint32_t cnt = *(uint32_t*)(g_base + ADDR_EXT_COUNT);
    uint8_t* loaded = (uint8_t*)(g_base + ADDR_EXT_LOADED_FLAGS);
    if (!exts || cnt == 0 || cnt > 1000) return false;
    for (uint32_t i = 0; i < cnt; i++)
    {
        if (!loaded[i]) continue; // skip not-loaded extensions (native does this)
        uint32_t obj = exts[i];
        if (!obj) continue;
        uint32_t entry = delphi_fastcall_3(
            abs_ptr(ADDR_EXT_FIND_FUNC_NAME), obj, name, 0);
        if (!entry) continue;
        int32_t id = *(int32_t*)(entry + 0x10); // function id
        uint32_t hl = *(uint32_t*)(entry + 0x14); // helpline GM string
        if (hl)
        {
            // assign the helpline string directly (native BuildHelpline uses @LStrAsg)
            delphi_fastcall_2(abs_ptr(ADDR_LSTRASG), out_var_addr, hl);
        }
        return id >= 0; // it IS an extension function — don't fall back to "///"
    }
    return false;
}

// ---- string helpers (GM 8.0: length at data-4) ----
static int32_t str_len(uint32_t s)
{
    if (!s) return 0;
    int32_t l = *(int32_t*)(s - 4);
    return (l < 0 || l > 5000000) ? 0 : l;
}

static bool ansi_icmp(uint32_t a, uint32_t b)
{ // case-insensitive equal
    int32_t la = str_len(a), lb = str_len(b);
    if (!a || !b || la != lb || la < 0) return false;
    const char* sa = (const char*)a;
    const char* sb = (const char*)b;
    for (int32_t i = 0; i < la; i++)
    {
        char ca = sa[i], cb = sb[i];
        if (ca >= 'A' && ca <= 'Z') ca += 32;
        if (cb >= 'A' && cb <= 'Z') cb += 32;
        if (ca != cb) return false;
    }
    return true;
}

static bool ansi_prefix_icmp(uint32_t frag, uint32_t full)
{ // frag is a prefix of full
    int32_t lf = str_len(frag), lfull = str_len(full);
    if (lf < 1 || lfull < lf) return false;
    const char* sf = (const char*)frag;
    const char* sfull = (const char*)full;
    for (int32_t i = 0; i < lf; i++)
    {
        char ca = sf[i], cb = sfull[i];
        if (ca >= 'A' && ca <= 'Z') ca += 32;
        if (cb >= 'A' && cb <= 'Z') cb += 32;
        if (ca != cb) return false;
    }
    return true;
}

// ---- script lookup ----
// exact first; falls back to prefix (in case the caret word ever arrives
// fragmentary, e.g. via a different editor code path).
static int32_t script_exact_lookup(uint32_t name)
{
    uint32_t* names = *(uint32_t**)(g_base + 0x1E92DC);
    uint32_t cnt = *(uint32_t*)(g_base + 0x1E92E4);
    if (!names || cnt > 50000) return -1;
    for (uint32_t i = 0; i < cnt; i++)
    {
        if (names[i] && ansi_icmp(names[i], name)) return (int32_t)i;
    }
    return -1;
}

static int32_t script_prefix_lookup(uint32_t name)
{
    uint32_t* names = *(uint32_t**)(g_base + 0x1E92DC);
    uint32_t cnt = *(uint32_t*)(g_base + 0x1E92E4);
    if (!names || cnt > 50000) return -1;
    int32_t best = -1, best_len = 0x7FFFFFFF;
    for (uint32_t i = 0; i < cnt; i++)
    {
        if (names[i] && ansi_prefix_icmp(name, names[i]))
        {
            int32_t l = str_len(names[i]);
            if (l < best_len)
            {
                best = (int32_t)i;
                best_len = l;
            }
        }
    }
    return best;
}

// script object +4 = source (GM string; length at -4), verified via GMSave's
// save/load round-trip and GM80_SaveScript_Individual `mov edx,[ebx+4]`.
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

// ---- "///" script doc-comment hint (gm82save feature) ----
// Create+assign a GM string through @LStrFromPCharLen so allocation uses the
// Delphi memory manager (never LocalAlloc + Delphi FreeMem).
static void write_ansistring(uint32_t out_var_addr, const char* data, int32_t len)
{
    if (!out_var_addr || len <= 0) return;
    delphi_fastcall_3(
        abs_ptr(ADDR_LSTR_FROM_PCHAR_LEN), out_var_addr, (uint32_t)data, (uint32_t)len);
}

static bool script_doc_hint(uint32_t name, uint32_t out_var_addr)
{
    int32_t sid = script_exact_lookup(name);
    if (sid < 0) sid = script_prefix_lookup(name);
    if (sid < 0) return false;

    uint32_t* scripts = *(uint32_t**)(g_base + ADDR_SCRIPTS_ARRAY);
    uint32_t count = *(uint32_t*)(g_base + ADDR_SCRIPTS_COUNT);
    if (!scripts || (uint32_t)sid >= count) return false;

    uint32_t src = 0;
    int32_t len = 0;
    if (!script_source(scripts[sid], &src, &len)) return false;
    const char* s = (const char*)src;
    if (len < 3 || s[0] != '/' || s[1] != '/' || s[2] != '/') return false;

    // first line after "///", trimmed on both sides (gm82save uses @Trim)
    int32_t start = 3;
    while (start < len && (s[start] == ' ' || s[start] == '\t'))
        ++start;
    int32_t i = start;
    while (i < len && s[i] != '\r' && s[i] != '\n')
        ++i;
    while (i > start && (s[i - 1] == ' ' || s[i - 1] == '\t'))
        --i;
    if (i <= start) return false;

    char buf[512];
    int32_t hint_len = i - start;
    if (hint_len > 500) hint_len = 500;
    memcpy(buf, s + start, (size_t)hint_len);
    buf[hint_len] = '\0';

    write_ansistring(out_var_addr, buf, hint_len);
    gm_log("GMEnhance /// hint: script idx=%d hint=[%s]", sid, buf);
    return true;
}

// ---- combined getter (runs inside sub_58E57C's frame) ----
static void __cdecl code_hint_impl(uint32_t name, uint32_t out_var_addr)
{
    if (ext_helpline_fast(name, out_var_addr)) return;
    script_doc_hint(name, out_var_addr);
}

// Entry stub (main hook at 0x18E614). EBP = sub_58E57C's frame here:
//   [ebp-4] = name (GM string data ptr), [ebp-8] = address of out string var.
// Preserves ebx/esi/edi; returns 0 so the original skips its native chain.
__declspec(naked) static void code_hint_stub()
{
    __asm {
        push ebx
        push esi
        push edi
        mov eax, [ebp - 8] // out_var_addr
        push eax
        mov eax, [ebp - 4] // name
        push eax
        call code_hint_impl
        add esp, 8
        pop edi
        pop esi
        pop ebx
        xor eax, eax
        ret
    }
}

bool code_hint_install(HMODULE gm_base)
{
    g_base = (uintptr_t)gm_base;
    uint8_t* site = (uint8_t*)abs_ptr(ADDR_CARET_HELP_EXT_CALL);
    memcpy(g_orig, site, 5);

    DWORD old = 0;
    VirtualProtect(site, 5, PAGE_EXECUTE_READWRITE, &old);
    uint8_t code[5] = {0xE8};
    int32_t rel = (int32_t)((uint8_t*)code_hint_stub - site - 5);
    memcpy(code + 1, &rel, 4);
    memcpy(site, code, 5);
    VirtualProtect(site, 5, old, &old);
    FlushInstructionCache(GetCurrentProcess(), site, 5);

    g_hooked = true;
    gm_log("GMEnhance code_hint_install: patched %p (was %02X %02X %02X %02X %02X)", site,
        g_orig[0], g_orig[1], g_orig[2], g_orig[3], g_orig[4]);
    return true;
}

void code_hint_uninstall()
{
    if (!g_hooked) return;
    uint8_t* site = (uint8_t*)abs_ptr(ADDR_CARET_HELP_EXT_CALL);
    DWORD old = 0;
    VirtualProtect(site, 5, PAGE_EXECUTE_READWRITE, &old);
    memcpy(site, g_orig, 5);
    VirtualProtect(site, 5, old, &old);
    FlushInstructionCache(GetCurrentProcess(), site, 5);
    g_hooked = false;
    gm_log("GMEnhance code_hint_uninstall: restored");
}
