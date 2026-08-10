// Code-editor hint hook for GM 8.0 (gm82save-style extension-function helpline +
// "///" script doc-comment hints). See code_hint.cpp for the full design.
#pragma once
#include <windows.h>

// Patch sub_58E57C (GetCaretWordHelp) so every caret-word help lookup runs the
// native extension-function helpline chain plus a "///" script hint fallback.
bool code_hint_install(HMODULE gm_base);

// Restore the original bytes.
void code_hint_uninstall();
