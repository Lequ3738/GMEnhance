# GMEnhance

为 GameMaker 8.0 IDE 的代码编辑器提供的增强模组。

## 功能

- **扩展函数帮助行**：光标位于扩展函数名上时显示其帮助行（GM8.0 原生能力，本插件通过原生链路调用，未改动其行为）。
- **`///` 脚本文档注释提示**：在脚本源码第一行写 `/// 说明文字`，代码编辑器把光标放到该脚本名上时，帮助行显示 `说明文字`。
- **补全参数列表**：脚本第一行写 `/// 说明文字 (a, b, c)`，代码补全下拉里该脚本项的参数段显示实际 `(a, b, c)`（原生固定显示 `(...)`；首行无括号则退回 `(...)`）。
- **trigger 常量补全**：代码补全里的 trigger 项改为显示 trigger **常量**（输入常量名即可匹配），参数段显示 ` 名称`。
- **中键跳转资源**：代码编辑器里把光标放在符号（对象/脚本/精灵等）上按中键，直接打开/显示对应资源。
- **加速扩展函数搜索**：扩展函数帮助行从原生三次遍历（IsFunctionName→GetFunctionId→BuildHelpline）改为**一次遍历**（`FindFunctionByName` 命中即取 id 和帮助行），语义不变。

## 验证结论（IDA 相似性，2026-08-08）

**GM 8.0 原生就已具备完整的"扩展函数帮助行"功能**，不需要"移植原生功能"：

| GM8.1（gm82save 目标） | GM8.0 | 相似度 |
|---|---|---|
| sub_713434 IsExtFunctionName | sub_5A8128 (0x1A8128) | 0.77 high |
| sub_713534 GetFunctionId | sub_5A8228 (0x1A8228) | 0.82 high |
| sub_713614 BuildHelpline | sub_5A8308 (0x1A8308) | 0.94 high |
| sub_6BB094 GetCaretWordHelp | sub_58E57C (0x18E57C) | 0.74 |
| sub_6B386C UpdateCaretHelp | sub_587E90 (0x187E90) | 0.65 |
| — 扩展数据全局 — | GM80_Array_Extensions 0x1E9460 / Count 0x1E9464 / Loaded 0x2000BC | — |

gm82save 在 8.1 的挂钩位点（0x6BB12E）做的是**加速扩展函数搜索 + 新增 `///` 脚本文档注释提示**。本插件照此逻辑在 GM8.0 实现：保留原生扩展帮助行链路，并补上 gm82save 的 `///` 提示。

## 实现（挂钩点）

- 挂钩 `GM80_CodeEditor_GetCaretWordHelp`(sub_58E57C) 内 RVA **0x18E614** 的 `call sub_5A8128`（5 字节）→ `call code_hint_stub`。
- `code_hint_stub` 从被调用者栈帧取 `name([ebp-4])` 与输出槽地址 `[ebp-8]`，执行合并取器：
  1. 扩展函数帮助行——**一次遍历**（`GM80_Array_Extensions`/Count/LoadedFlags + `FindFunctionByName` 0x0F0C10，命中取 `entry+0x10`=id、`entry+0x14`=帮助行），替代原生三函数三次遍历；
  2. 未命中则查 `///` 脚本提示（脚本名精确/前缀查找 → `GM80_Array_Scripts` 取对象 → `+4` 取源码 → 提取首行去空格）。
- 写回输出槽用 `@LStrFromPCharLen`（0x55C4）或 `@LStrAsg`（帮助行），走 Delphi 内存管理器。
- 返回 0，使原 `test al,al; jz` 跳过已被覆盖的原生链路。

### 中键跳转（middle_click.cpp，挂钩 `sub_58B0D0` 代码编辑器鼠标事件）

| 挂钩点（RVA） | 做法 |
|---|---|
| 0x18B0F6（`jnz loc_58B2C2`） | NOP 6 字节，非左键不再提前退出 |
| 0x18B190（`jnz loc_58B256` 的 rel32） | 改跳到中键 stub：`var_1==2`（中键）时把光标移到点击处、调 `sub_5866F0`（0x1866F0 显示光标处资源）、恢复光标 |

光标字段：8.0 编辑器 `[ebx+0x2CC]`（行）/`[ebx+0x2D0]`（列）——注意 8.1 是 +0x20（0x2EC/0x2F0），两版对象布局差 0x20。挂钩函数与 8.1 `sub_6B715C` 逐字节同构。

### 代码补全增强（completion.cpp，挂钩 `GM80_CodeEditor_Completion_BuildList`）

| 功能 | 挂钩点（RVA） | 做法 |
|---|---|---|
| `///` 参数段进补全 | 0x18E055（`call sub_55BE74`）→ stub | 提取 `(` 后到行尾、去尾空白，写 `[ebp-0x5C]` 并覆盖补全条目的 `(...)` 参数槽 |
| 补全 name 保持脚本名 | 0x18E05C（槽位 A4→A8） | `mov ecx,[ebp-0x5C]`→`[ebp-0x58]`（脚本名） |
| trigger 常量匹配 | 0x18DFE0（rel32 → sub_55D604） | 前缀匹配改为比 trigger 常量 `[obj+0xC]` |
| trigger 参数槽 | 0x18DFF2（10 字节替换） | `push "(...)"…` → `push 0; push 4; lea edx,[esp+4]; mov ecx,ebx` |
| trigger 显示名 | 0x18DFFE（`call sub_55D53C`）→ stub | 参数槽写 ` 名称`（前导空格 + trigger 名） |
| 补全 name 变常量 | 0x18E005（槽位 AC→B0） | `mov ecx,[ebp-0x54]`→`[ebp-0x50]`（常量） |

位点由 IDA 相似性验证：8.1 `sub_6BA714`（gm82save 0x6BAA91/1C/2E/3A/41 所在函数）↔ 8.0 `sub_58DCD8`（0.657）。**注意 8.1→8.0 的 rel32 需按 8.0 布局重算**（0x18DFE0 用 0xF620，不是 gm82save 的 0x2398）。

## GM 8.0 字符串格式（踩过的坑）

GM8.0 的字符串是 **`[len:4][data...]`**——**长度在 `data-4`**（32 位 4 字节对齐），**不是**标准 Delphi 7 AnsiString（长度在 `data-8`）。GMSave 的 `delphi.h` `obj_str_val` 读的就是 `data-4`。读 GM8.0 字符串长度一律用 `-4`（见 `GM80_STR_LEN_OFF`）。实证：脚本源码 `/// 这是测试说明`(GBK, 18 字节) `len@-4=18`、`len@-8=1`。

## 地址表（RVA，基准 0x400000）

见 `GMEnhance/gm80_addresses.h`（含每条的证据注释）。注意：**GMSave 头里的 `ADDR_LSTRCLR 0x47E8` 是错的**（0x4047E8 是 nullsub），真实 `@LStrClr` 在 0x54D4。

## 如何使用

1. 确认 GameMaker 8.0 安装目录下有 `FoxPluginLoader.dll` 与 `FoxPlugin.txt`。
2. 把 `GMEnhance.dll` 放到 `(安装目录)\FoxPlugin\`。
3. 在 `FoxPlugin.txt` 新建一行写 `"FoxPlugin\GMEnhance.dll"`，保存。
4. 打开 GameMaker 8.0。

## 验证方式

- 写一个脚本，第一行写 `/// 这是测试说明`，在对象/脚本代码里输入该脚本名，把光标放到名字上——编辑器帮助行应显示"这是测试说明"。
- 把脚本首行写成 `/// 这是测试说明 (a, b, c)`，在代码里输入脚本名前缀触发补全下拉——该脚本项的参数段应显示 `a, b, c)`（原生为 `(...)`）。
- 在代码里输入 trigger 名/常量前缀触发补全——trigger 项应显示常量名，参数段为 ` 名称`。
- 在代码里把光标放在某对象/脚本名上按**中键**——应直接打开/跳转到该资源。

## 如何编译

使用 Visual Studio 2022，平台选择 `x86`：

```bash
MSBuild GMEnhance.sln /p:Configuration=Release /p:Platform=x86
```

## 后续工作

- **action 编辑框编号**（gm82save 0x7002FE）：8.0 无对应结构——8.1 的 action 显示函数（sub_7001A8/sub_45B498）与 "Code" 类型字符串在 8.0 均不存在，无法移植。如需此功能须重新分析 8.0 的 action 编辑器显示逻辑。
- **代码编辑器交互增强**（gm82save 已有，GMEnhance 未移植）：最大化不重排（已确认 8.0 原生模态编辑器无此问题，不需要）、打字时热重载扩展、空剪贴板粘贴 AV 修复。
- **非模态代码编辑器**：gm82save 把模态代码对话框改成非模态（`code_form.rs`），GMEnhance 未做（对 8.0 是另一量级工程）。
