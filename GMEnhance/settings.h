// Per-feature switches, read once at startup from GMEnhance.ini next to this
// DLL. Missing file or key = feature on. Changes take effect after restart.
#pragma once

struct EnhSettings
{
    bool code_hint;     // /// script doc-comment hints (code_hint.cpp)
    bool completion;    // completion dropdown enhancements (completion.cpp)
    bool middle_click;  // middle-click jump in code editor (middle_click.cpp)
    bool dpi;           // high-DPI form scaling (dpi_aware.cpp)
};

extern EnhSettings g_enh;

// Load g_enh from <dll dir>\GMEnhance.ini. Safe to call before hook install.
void enh_settings_load();
