// GMEnhance — VCL form DPI scaling for GameMaker 8.0.
//
// GM 8.0's VCL drops the DFM `PixelsPerInch = 96` value during streaming
// (SetPixelsPerInch refuses writes while csLoading when the field is still
// 0), so every form stays Scaled=false and the VCL never DPI-scales anything.
// One 2-byte patch (NOP the guard jump) restores the stock flow: the DFM
// value lands, Scaled turns true, and forms created in a DPI-aware process
// scale by Screen.PixelsPerInch / 96. Site contract in gm80_addresses.h.
//
// Process awareness: SetProcessDPIAware only takes effect before the first
// window is created, so call it only when no visible top-level window of this
// process exists; otherwise leave awareness to the exe's compatibility flag
// (HIGHDPIAWARE), which is applied at process creation regardless.

#include "pch.h"
#include "delphi.h"
#include "gm80_addresses.h"
#include "gm_log.h"
#include "dpi_aware.h"

static uintptr_t g_base = 0;
static bool g_patched = false;
static uint8_t g_orig[2] = {0};
static bool g_scaled_neutered = false;
static uint8_t g_scaled_orig[6] = {0};

static inline void* abs_ptr(uint32_t rva)
{
    return (void*)(g_base + rva);
}

struct EnumCtx
{
    DWORD pid;
    bool found;
};

static BOOL CALLBACK enum_visible_cb(HWND hwnd, LPARAM lp)
{
    EnumCtx* c = (EnumCtx*)lp;
    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    if (pid == c->pid && IsWindowVisible(hwnd))
    {
        c->found = true;
        return FALSE;
    }
    return TRUE;
}

static bool any_visible_top_level_window()
{
    EnumCtx ctx = { GetCurrentProcessId(), false };
    EnumWindows(enum_visible_cb, (LPARAM)&ctx);
    return ctx.found;
}

bool dpi_aware_install(HMODULE gm_base)
{
    g_base = (uintptr_t)gm_base;
    uint8_t* site = (uint8_t*)abs_ptr(ADDR_SETPIXELSPERINCH_JZ);

    memcpy(g_orig, site, 2);
    const uint8_t expect[2] = {0x74, 0x06}; // jz short — csLoading && FPPI==0 -> drop
    if (memcmp(g_orig, expect, 2) != 0)
    {
        gm_log("GMEnhance dpi_aware_install: signature mismatch @%p (%02X %02X), skipped",
            (void*)site, g_orig[0], g_orig[1]);
        return false;
    }
    const uint8_t nops[2] = {0x90, 0x90};
    patch_bytes(site, nops, 2);
    g_patched = true;

    if (!IsProcessDPIAware() && !any_visible_top_level_window())
    {
        BOOL ok = SetProcessDPIAware();
        gm_log("GMEnhance dpi_aware_install: SetProcessDPIAware -> %d", (int)ok);
    }

    // Neutralize TCustomForm.SetScaled: the DFM stream applies Scaled=false
    // after PixelsPerInch, zeroing the field. SetScaled is RTTI-only (no
    // direct callers), so an entry `ret` is safe.
    uint8_t* scaled_site = (uint8_t*)abs_ptr(ADDR_SETSCALED_ENTRY);
    memcpy(g_scaled_orig, scaled_site, 6);
    const uint8_t scaled_expect[6] = {0x53, 0x56, 0x8B, 0xDA, 0x8B, 0xF0};
    if (memcmp(g_scaled_orig, scaled_expect, 6) == 0)
    {
        const uint8_t retb[1] = {0xC3};
        patch_bytes(scaled_site, retb, 1);
        g_scaled_neutered = true;
        gm_log("GMEnhance dpi_aware_install: SetScaled neutralized @%p", (void*)scaled_site);
    }
    else
    {
        gm_log("GMEnhance dpi_aware_install: SetScaled signature mismatch @%p, skipped",
            (void*)scaled_site);
    }

    gm_log("GMEnhance dpi_aware_install: scaling gate NOPed @%p", (void*)site);
    return true;
}

void dpi_aware_uninstall()
{
    if (g_scaled_neutered)
    {
        patch_bytes((uint8_t*)abs_ptr(ADDR_SETSCALED_ENTRY), g_scaled_orig, 6);
        g_scaled_neutered = false;
    }
    if (!g_patched) return;
    patch_bytes((uint8_t*)abs_ptr(ADDR_SETPIXELSPERINCH_JZ), g_orig, 2);
    g_patched = false;
    gm_log("GMEnhance dpi_aware_uninstall: restored");
}
