// GM 8.0 IDE memory addresses — verified via IDA similarity search against GM 8.1
// (GMEnhance) — all values are offsets from GetModuleHandle(NULL) base.
// Format: A_D_D_R_E_S_S absolute = base + O_F_F_S_E_T
#pragma once

// ==== GM 8.0 字符串格式（重要）====
// GM8.0 的字符串是 [len:4][data...]（长度在 data-4），不是标准 Delphi 7
// AnsiString（长度在 data-8、refcount 在 data-4）。GMSave delphi.h 的
// obj_str_val 读的就是 data-4。32 位应用 4 字节对齐 → 长度在 -4。
// 实证：脚本源码 "/// 这是测试说明"(GBK, 18 字节) len@-4=18, len@-8=1。
#define GM80_STR_LEN_OFF  (-4)

// ==== Delphi RTL ====
// GM80_LStrFromPCharLen(var Dest, Source, Len) — create+assign AnsiString via the
// Delphi memory manager (safe for cross-heap writes). EAX=&Dest EDX=Source ECX=Len.
#define ADDR_LSTR_FROM_PCHAR_LEN  0x55C4     // 0x4055C4, decompiled & verified
// NOTE: GMSave's ADDR_LSTRCLR=0x47E8 is WRONG (0x4047E8 is a nullsub). Real @LStrClr:
#define ADDR_LSTRCLR              0x54D4     // 0x4054D4 GM80_LStrClr
#define ADDR_LSTRASG              0x5528     // 0x405528 GM80_LStrAsg

// ==== Extension function helpline chain (GM 8.0 NATIVE, verified via similarity) ====
// sub_5A8128: is `name` (AnsiString) an extension function name?  (8.1 0x713434, 0.77)
#define ADDR_EXT_IS_FUNC_NAME     0x1A8128
// sub_5A8228: extension function id from name (8.1 0x713534, 0.82)
#define ADDR_EXT_GET_FUNC_ID      0x1A8228
// sub_5A8308: build helpline into out string var (8.1 0x713614, 0.94)
#define ADDR_EXT_BUILD_HELPLINE   0x1A8308
// Extension data (already named in qcg3 IDB)
#define ADDR_EXT_ARRAY            0x1E9460   // GM80_Array_Extensions
#define ADDR_EXT_COUNT            0x1E9464   // GM80_Count_Extensions
#define ADDR_EXT_LOADED_FLAGS     0x2000BC   // GM80_LoadedFlags_Extensions

// ==== Code editor help-getter ====
// sub_58E57C (8.1 0x6BB094, 0.74) = GetCaretWordHelp, called from sub_587E90
// (UpdateCaretHelp) on every caret/text update. At RVA 0x18E614 it runs:
//   call sub_5A8128  <- gm82save-style hook site (5 bytes: E8 0F 9B 01 00)
// Inside sub_58E57C's frame: [ebp-4]=name, [ebp-8]=&out string var.
#define ADDR_CARET_HELP_EXT_CALL  0x18E614

// ==== Script doc-comment hint (gm82save "///" feature) ====
// sub_55BF50 (8.1 0x655C2C, 0.80) = find script index by name
#define ADDR_SCRIPT_BY_NAME       0x15BF50
#define ADDR_SCRIPTS_ARRAY        0x1E92D4   // GM80_Array_Scripts (object ptr array)
#define ADDR_SCRIPTS_COUNT        0x1E92E4   // GM80_Count_Scripts
#define OFF_SCRIPT_SOURCE         4          // TScript.source AnsiString at +4 (verified via GM80_SaveScript_Individual `*(a1+4)`)

// ==== Code completion (gm82save "///" arg-list + trigger-const fix) ====
// GM80_CodeEditor_Completion_BuildList (sub_58DCD8), verified via IDA similarity
// vs 8.1 sub_6BA714 (0.657). All RVA (base 0x400000).
// Script loop (8.1 0x6BAA53 ↔ 8.0 0x58E017): per matching script it calls
// AddEntry(sub_58DBE8; type="script", name=script, args="(...)").
//   - RVA 0x18E055: `call sub_55BE74` (script-name getter) -> completion stub:
//     writes the "/// text (a,b,c)" arg-list (chars after '(' up to line end)
//     into [ebp-0x5C] and copies it over the "(...)" stack arg. (8.1 0x6BAA91)
//   - RVA 0x18E05C: `mov ecx,[ebp-0x5C]` slot byte 0xA4->0xA8 (var_58), so
//     AddEntry's name stays the script name. (8.1 0x6BAA98 patch 0xa8)
// Trigger loop (8.1 0x6BAA0B ↔ 8.0 0x58DFCF): per matching trigger it calls
// AddEntry(type="trigger", name=name, args="(...)").
//   - RVA 0x18DFE0: rel32 low2 of `call sub_55D53C` (0x18DFDF) -> sub_55D604, so
//     the prefix match compares the trigger CONSTANT ([obj+0xC]). 8.0 rel32 low2
//     = 0xF620 (NOT gm82save's 0x2398 — recomputed for the 8.0 layout).
//   - RVA 0x18DFF2: replace `push "(...)"; push 4; lea edx,[ebp-0x54]` (10 bytes)
//     with `push 0; push 4; lea edx,[esp+4]; mov ecx,ebx`.
//   - RVA 0x18DFFE: `call sub_55D53C` -> add_space_before_trigger_name, writes
//     " "+name into the args slot.
//   - RVA 0x18E005: `mov ecx,[ebp-0x54]` slot byte 0xAC->0xB0 (var_50), so
//     AddEntry's name becomes the trigger constant.
#define ADDR_COMPLETION_SCRIPT_CALL   0x18E055   // call sub_55BE74 (script name getter)
#define ADDR_COMPLETION_SCRIPT_ECX    0x18E05C   // mov ecx,[ebp+var_5C] slot (A4->A8)
#define ADDR_COMPLETION_TRIG_CONST    0x18DFE0   // call rel32 low2 -> sub_55D604 (trigger const)
#define ADDR_COMPLETION_TRIG_PUSH     0x18DFF2   // push "(...)" replacement (10 bytes)
#define ADDR_COMPLETION_TRIG_CALL     0x18DFFE   // call sub_55D53C -> add_space_before_trigger_name
#define ADDR_COMPLETION_TRIG_ECX      0x18E005   // mov ecx,[ebp+var_54] slot (AC->B0)
// 8.0 trigger name/const getters (Delphi fastcall: eax=trigger_id, edx=&out)
#define ADDR_TRIGGER_GET_NAME         0x15D53C   // sub_55D53C out = trigger name   [obj+4]
#define ADDR_TRIGGER_GET_CONST        0x15D604   // sub_55D604 out = trigger const  [obj+0xC]

// ==== Extension-function one-pass helpline search (fast path) ====
// Native GetCaretWordHelp chain = IsFunctionName -> GetFunctionId ->
// BuildHelpline, scanning the extension table three times. A single
// GM80_ExtFunc_FindFunctionByName hit returns the function entry with id at
// +0x10 and helpline string at +0x14, so code_hint does the whole lookup in
// one pass (semantics identical to the native three-call chain).
#define ADDR_EXT_FIND_FUNC_NAME       0x0F0C10   // sub_4F0C10 (eax=ext obj, edx=name, ecx=flags) -> entry|0

// ==== Middle-click jump (gm82save code_editor_middle_click @ 8.1 0x6B721B) ====
// In 8.0 sub_58B0D0 (code-editor mouse event; byte-identical to 8.1 sub_6B715C
// except addresses):
//   RVA 0x18B0F6: `jnz loc_58B2C2` (var_1 != 0 -> exit) NOPed so non-left
//                 buttons fall through to the second jnz.
//   RVA 0x18B190: rel32 of `jnz loc_58B256` (var_1 != 0) retargeted to the
//                 middle-click stub. jnz starts 0x18B18E, ends 0x18B194, so
//                 rel = stub - 0x18B194.
// Caret fields on the 8.0 editor: [ebx+0x2CC] line / [ebx+0x2D0] col (verified
// in sub_5866F0). Show-resource-at-caret = sub_5866F0 (8.1 0x6B2000 equiv).
#define ADDR_MIDDLE_CLICK_JNZ1        0x18B0F6   // NOP 6 bytes (jnz loc_58B2C2)
#define ADDR_MIDDLE_CLICK_REL         0x18B190   // rel32 4 bytes -> middle-click stub
#define ADDR_MIDDLE_CLICK_RET         0x18B2C2   // sub_58B0D0 exit point (stub returns here)
#define ADDR_MIDDLE_CLICK_SHOW        0x1866F0   // sub_5866F0 show resource at caret

// ==== Run-game pipeline (reverse-engineered for the mcp/ Node tool) ====
// Run1Click/Debug1Click (menu "run normally"/"run in debug mode") are 8-byte
// stubs into the shared pipeline; the only argument is AL (0 normal, 1 debug).
// The localized IDE owner-draws its menu items (no caption text readable via
// GetMenuString), but the VCL WM_COMMAND dispatch still works: posting the
// item's command ID to TMainForm runs the real pipeline (verified live).
// Pipeline flow: gate -> room check -> build temp exe -> CreateProcess + pump
// IDE messages until the game exits -> delete the temp exe.
#define ADDR_RUNGAME_PIPELINE         0x1DBEAC   // 0x5DBEAC (al=0 run / 1 debug)
#define ADDR_MAINFORM_SLOT            0x20ADE8   // 0x60ADE8 -> TMainForm* (slot holds the form pointer)
#define ADDR_PROJECT_PATH             0x1EA27C   // 0x5EA27C char* project path (GBK)
#define ADDR_ROOMS_COUNT_GLOBAL       0x1E92A4   // 0x5E92A4 int room count
// Run gate: TMainForm+0x57 must be non-zero or the pipeline silently returns.
// No writer found for this byte yet; semantics pending runtime confirmation.
// Zero rooms -> pipeline pops a GBK message stored at 0x5DBFE8.
// "Run" submenu command IDs as shipped: 79 (run), 80 (debug).
