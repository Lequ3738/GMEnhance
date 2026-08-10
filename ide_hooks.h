// IDE hook definitions for GM 8.0
// GMEnhance installs code-editor hint hooks (extension helpline + "///" script hints).
#pragma once
#include <windows.h>

// Install all IDE hooks. Call once from DllMain.
bool ide_hooks_install(HMODULE gm_base);

// Remove all hooks.
void ide_hooks_uninstall();
