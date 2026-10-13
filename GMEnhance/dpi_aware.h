// VCL form DPI-scaling unblock for GM 8.0.
#pragma once
#include <windows.h>

// Verify+patch the SetPixelsPerInch csLoading gate (2 bytes) and make the
// process DPI-aware when no visible top-level window exists yet. Returns
// false when the patch site bytes mismatch (different binary).
bool dpi_aware_install(HMODULE gm_base);

// Restore the original bytes.
void dpi_aware_uninstall();
