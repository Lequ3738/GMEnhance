// Middle-click jump in the code editor (gm82save code_editor_middle_click).
// Middle-clicking a symbol moves the caret to it and opens/shows the resource
// under the caret (script/object/sprite...). Hook sites in gm80_addresses.h.
#pragma once
#include <windows.h>

// Patch sub_58B0D0 (code-editor mouse event) so a middle click shows the
// resource under the caret.
bool middle_click_install(HMODULE gm_base);

// Restore the original bytes.
void middle_click_uninstall();
