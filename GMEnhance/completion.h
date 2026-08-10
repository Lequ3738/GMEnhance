// Code-editor code-completion enhancement for GM 8.0 (gm82save-style).
// Two features inside GM80_CodeEditor_Completion_BuildList (sub_58DCD8):
//   1. "///" script arg-list shown in the completion dropdown (gm82save
//      completion_script_args, 8.1 hook 0x6BAA91).
//   2. trigger completion entries display the trigger CONSTANT (so typing the
//      constant matches) plus a " name" suffix in the args slot (gm82save
//      add_space_before_trigger_name + trigger-const patch, 8.1 0x6BAA1C/2E/3A/41).
// All hook sites and offsets are RVA in gm80_addresses.h with per-site evidence.
#pragma once
#include <windows.h>

// Patch GM80_CodeEditor_Completion_BuildList so the completion dropdown picks
// up "/// text (a,b,c)" arg-lists and shows trigger constants.
bool completion_install(HMODULE gm_base);

// Restore the original bytes.
void completion_uninstall();
