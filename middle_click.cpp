// GMEnhance — middle-click jump in the code editor (gm82save-style)
//
// Inside GM80_CodeEditor mouse event sub_58B0D0 (byte-identical structure to
// 8.1 sub_6B715C except addresses), gm82save's code_editor_middle_click hooks
// the second `jnz` (var_1 != 0) and NOPs the first one, then:
//   - var_1 == 2 (middle button): save caret, move it to the click point,
//     call sub_5866F0 (show resource at caret), restore caret.
//   - otherwise (right button etc.): return straight to sub_58B0D0's exit.
//
// Hook bytes (verified vs 8.1, identical instruction layout):
//   RVA 0x18B0F6  80 7D FF 00 0F 85 C6 01 00 00   cmp [ebp-1],0 / jnz +0x1C6
//   RVA 0x18B18A  80 7D FF 00 0F 85 C2 00 00 00   cmp [ebp-1],0 / jnz +0xC2
// We NOP the 0x18B0F6 jnz (6 bytes) and retarget the 0x18B190 rel32 (4 bytes)
// to code_editor_middle_click_stub. jnz ends at 0x18B194; rel = stub - 0x18B194.
//
// Caret fields on the 8.0 editor object: [ebx+0x2CC] line, [ebx+0x2D0] col
// (verified in sub_5866F0 which reads them). gm82save's 8.1 offsets are
// +0x20 higher (0x2EC/0x2F0) — the two editors' object layouts differ by 0x20.

#include "pch.h"
#include "delphi.h"
#include "gm80_addresses.h"
#include "gm_log.h"
#include "middle_click.h"

static uintptr_t g_base = 0;
static bool g_hooked = false;
static uint8_t g_orig_jnz[6] = {0};
static uint8_t g_orig_rel[4] = {0};

// Absolute addresses the naked stub needs (resolved from g_base at install).
static uintptr_t g_ret_abs = 0; // sub_58B0D0 exit point
static uintptr_t g_show_abs = 0; // sub_5866F0 show resource at caret

static inline void* abs_ptr(uint32_t rva)
{
    return (void*)(g_base + rva);
}

// Entry stub (retarget of the `jnz` at 0x18B18E, so EBP is sub_58B0D0's frame,
// EBX the editor, EDI/ESI the click point's line/col, [ebp-1] the mouse
// button). Always returns to sub_58B0D0's exit via the pushed address.
__declspec(naked) static void code_editor_middle_click_stub()
{
    __asm {
        mov ecx, dword ptr [g_ret_abs] // return address: sub_58B0D0 exit
        push ecx
        cmp byte ptr [ebp - 1], 2 // middle button?
        jnz done
        push dword ptr [ebx + 0x2CC] // save caret line
        push dword ptr [ebx + 0x2D0] // save caret col
        mov dword ptr [ebx + 0x2CC], edi // caret line = click line
        mov dword ptr [ebx + 0x2D0], esi // caret col  = click col
        mov ecx, dword ptr [g_show_abs] // sub_5866F0 (show resource at caret)
        mov eax, ebx
        call ecx
        pop dword ptr [ebx + 0x2D0] // restore caret
        pop dword ptr [ebx + 0x2CC]
done:
        ret
    }
}

bool middle_click_install(HMODULE gm_base)
{
    g_base = (uintptr_t)gm_base;
    g_ret_abs = g_base + ADDR_MIDDLE_CLICK_RET;
    g_show_abs = g_base + ADDR_MIDDLE_CLICK_SHOW;

    uint8_t* jnz_site = (uint8_t*)abs_ptr(ADDR_MIDDLE_CLICK_JNZ1);
    uint8_t* rel_site = (uint8_t*)abs_ptr(ADDR_MIDDLE_CLICK_REL);

    memcpy(g_orig_jnz, jnz_site, 6);
    memcpy(g_orig_rel, rel_site, 4);

    // NOP the first jnz (non-left buttons no longer exit here).
    uint8_t nops[6] = {0x90, 0x90, 0x90, 0x90, 0x90, 0x90};
    patch_bytes(jnz_site, nops, 6);

    // Retarget the second jnz's rel32 to our stub. jnz @ 0x18B18E ends at
    // rel_site+4 = 0x18B194.
    int32_t rel = (int32_t)((uint8_t*)code_editor_middle_click_stub - rel_site - 4);
    uint8_t rb[4];
    memcpy(rb, &rel, 4);
    patch_bytes(rel_site, rb, 4);

    g_hooked = true;
    gm_log("GMEnhance middle_click_install: nop@%p rel@%p -> %p", jnz_site, rel_site,
        (void*)code_editor_middle_click_stub);
    return true;
}

void middle_click_uninstall()
{
    if (!g_hooked) return;
    patch_bytes((uint8_t*)abs_ptr(ADDR_MIDDLE_CLICK_JNZ1), g_orig_jnz, 6);
    patch_bytes((uint8_t*)abs_ptr(ADDR_MIDDLE_CLICK_REL), g_orig_rel, 4);
    g_hooked = false;
    gm_log("GMEnhance middle_click_uninstall: restored");
}
