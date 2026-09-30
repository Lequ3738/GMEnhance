# GMEnhance MCP（mcp/）

通过 MCP（Model Context Protocol）把 GameMaker 8.0 IDE 的「正常运行 / 调试运行」暴露给 AI 代理，
并借助 GMSave 插件把磁盘上的外部工程改动同步进 IDE 内存——构成「AI 改文件 → 同步 → 运行」的闭环。

## 架构：纯外部方案（零注入、零新增可执行文件）

`server.mjs` 一个文件，Node 进程内用 koffi FFI 完成全部 Win32 调用：

1. `FindWindowExW` 枚举全部 `TMainForm` 主窗体（**支持多开 IDE**），取各实例的 pid 与标题；
2. 枚举 Win32 菜单，按顶层 Caption（`运行(&U)` / `Run`）定位"运行"子菜单，取其叶子项
   （位置 0=运行、1=调试运行；命令 ID 与置灰状态可读）；
3. `PostMessage(WM_COMMAND, 命令ID)` 触发——消息在 IDE 主线程走 VCL 的菜单项 Click
   分派链，与用户点菜单同一入口（汉化版自绘菜单下实测同样成立）；
4. 轮询进程列表，等 `%TEMP%\gm_ttt*\` 下出现**新**游戏进程即成功，返回其 PID。
   游戏进程由 IDE 直接 `CreateProcessA` 创建，**父进程即发起运行的 IDE**，
   用 ppid 归因，多 IDE 同时开游戏也不会误报。

### 工程同步（GMSave ForceSync 通道，v0.3.0 起）

GM8 编译用的是 **IDE 内存里**的工程：外部工具改了磁盘上的 `.gm80` 文件后，不重载就运行
跑的是旧代码且毫无报错。GMSave 插件的重载流程默认只在 IDE 回到前台后才执行（它的设计
语义是"用户切回 Game Maker 时再追赶"），AI 驱动的后台编辑循环没有这个时刻，因此：

- `sync_project` 工具与 `run_game`/`run_debug` 的前置步骤会向该 IDE 进程的
  `GMSave.Watcher` 隐藏窗口投递注册消息 `GMSave.ForceSync`（wParam=请求 id）；
- GMSave 在 IDE 主线程**跳过前台门**执行与定时器 tick 同一条合并流
  （无人值守安全：检测到会弹窗的状态——IDE 有未应用修改/模态窗/代码编辑器打开——
  就拒绝执行并回报状态码，不弹任何需要人回答的窗口；零脏 ⇒ local==base ⇒ 冲突不可能，
  纯 AI 循环保证静默重载）；
- 结果写入命名文件映射 `Local\GMSave.SyncStatus.<pid>`（16 字节：magic 'GMS1'、
  reqId、status、detail），本进程轮询读取；reqId 最后写，作为完成标记；
- 通道实现见 GMSave 仓库 `GMSave/project_watcher.cpp` 的 ForceSync 段。

状态码：`1` 已重载、`2` 无需重载、`3` 顺延（重试）、`4` 需人工处理（未弹窗、未运行）、
`5` 没有受监视的 .gm80 工程。映射打不开 = 部署的 GMSave.dll 旧于 ForceSync 版本。

### 多实例

多个 IDE 在跑时，`run_game` / `run_debug` / `sync_project` 必须传 `instance`：
1 基序号，或窗口标题（含工程名）的子串（大小写不敏感）。只开一个 IDE 时可省略。
不指定或歧义时工具拒绝执行（退出码 4）并列出实例清单供选择。

触发即时返回（IDE 的运行处理器内部会泵消息等游戏退出，不阻塞本工具），成败由新进程判定。

### 两个实测过的平台事实

- **汉化版菜单自绘化**：所有菜单项 `MF_OWNERDRAW`，`GetMenuString` 系列对叶子项返回空文本，
  但命令 ID、置灰状态正常，`WM_COMMAND` 分派链完好——本工具因此按位置选叶子项而非文本。
- **编译耗时**：触发后 IDE 先构建临时 exe 再启动游戏（Nature Edition 实测约 14 秒），
  默认超时 30 秒，大工程可传 `timeout_ms` 调大。

## 前置要求与安装

- GameMaker 8.0（本仓库对应的汉化版）；本工具不依赖 GMEnhance.dll
- **GMSave.dll（推荐）**：提供工程同步通道。未部署或版本旧时，运行工具会降级为
  "警告 + 按 IDE 内存现状运行"，磁盘改动不会生效
- Node.js ≥ 20

```bash
cd mcp
npm install
```

## 注册到 ZCode

在 `~/.zcode/cli/config.json` 的 `mcp.servers` 里加：

```json
"gm8": {
  "type": "stdio",
  "command": "node",
  "args": ["<GMEnhance 仓库路径>/mcp/server.mjs"]
}
```

重启会话后可用工具：`mcp__gm8__status`、`mcp__gm8__sync_project`、`mcp__gm8__run_game`、`mcp__gm8__run_debug`。

## 工具

| 工具 | 参数 | 说明 |
|---|---|---|
| `status` | — | 全部 IDE 实例（序号/pid/标题/菜单状态/`project` 工程信息/`gmsave_sync` 通道状态）、正在运行的游戏进程（含归属 IDE 的 ppid） |
| `get_project` | `instance?` | 读 IDE 当前打开的工程路径（纯外部 RPM 读 GM80_ProjectPath，GBK 解码），附格式与目录 |
| `open_project` | `path`, `timeout_ms?` | 启动**新** IDE 进程打开工程（等同双击关联文件）：安装路径先读注册表 `HKCU\Software\Game Maker\Version 8\Preferences\Directory`，兜底扫描 Program Files (x86)；等新实例出现并确认载入完成 |
| `close_ide` | `instance?`, `timeout_ms?`, `stop_games?` | 请求 IDE 退出（WM_CLOSE = 点 X）：关闭前读 GM 脏标志预检 `unsaved_changes`；有未保存修改时 GM 弹自己的保存确认框等人工处理（预期行为），超时未退出即报退出码 6 |
| `sync_project` | `instance?`, `timeout_ms?` | 让 GMSave 立即检查磁盘改动并重载进 IDE 内存；run_* 已内置前置同步，单独确认同步结果时才需要调 |
| `run_game` | `instance?`, `timeout_ms?` | 前置同步后触发"正常运行"（F5）；返回新游戏进程 PID |
| `run_debug` | `instance?`, `timeout_ms?` | 前置同步后触发"调试运行"（F6） |
| `stop_game` | `instance?` / `pid?`, `grace_ms?` | 关闭该 IDE 启动的全部游戏（或 pid 指定的一个）：先 WM_CLOSE 优雅退出（宽限期内每 150ms 补发，兼容刚启动还没出现窗口的游戏），超时才 TerminateProcess；没有游戏时是成功无操作（幂等） |

### 工程格式：.gm80 与 .gmk

GM8 有两类工程，`get_project` / `status` 返回的 `format` 字段区分：

- **`gm80`**——GMSave 扩展的文本工程**目录**（元数据文件 `X.gm80` + 旁边的
  `scripts/`、`objects/` 等文本文件）。AI 可直接编辑文件，再经 `sync_project`
  同步进 IDE 内存。`folder` 字段就是这个受监视的目录。
- **`native`**（`.gmk`/`.gm6`/`.gmd`）——GM 原生**二进制单文件**工程：
  没有可编辑的文本文件，GMSave 的外部改动监视/重载也不适用。`sync_project`
  对它直接返回"不适用"（`applicable: false`，不打扰 GMSave），`run_*` 照常运行
  并在警告里说明。要改 `.gmk` 工程只能先在 IDE 里另存为 `.gm80`。

## 语义与边界

- **前置同步**：`run_*` 先同步再触发。同步被拒（退出码 5：IDE 有未应用的修改/冲突需人工
  处理）或顺延/超时（退出码 6）时**不触发运行**——宁可不跑也不跑旧代码。
- **停止游戏**：`stop_game` 按 ppid 只关目标 IDE 自己启动的游戏。WM_CLOSE 让游戏走正常
  退出流程；`grace_ms`（默认 3000）内没退才强杀，杀掉的进程由 IDE 的运行管线正常感知
  退出并清理临时 exe。`grace_ms: 0` 跳过优雅退出直接杀。
- **排队**：IDE 的运行处理器要等上一个游戏退出才返回，游戏运行中再触发会嵌套执行，
  可同时存在多个游戏实例（与手动连按 F5 的行为一致）。
- **编译错误**：IDE 自己弹 GBK 错误框，工具表现为超时（退出码 3），需人工查看 IDE。
- **无房间工程**：IDE 运行管线会弹"至少要有一个房间才能运行"，同样表现为超时。
- **窗口类事实**：GM8 游戏主窗口的窗口类**不是** `TMainForm`（与 IDE 不同，实测游戏
  运行时不会污染实例枚举）；停止游戏按 pid + 可见性找窗口即可，不依赖类名。

## CLI 调试

```bash
node server.mjs status
node server.mjs project [--instance 序号|标题子串]
node server.mjs sync [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs run [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs debug [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs stop [--instance 序号|标题子串] [--pid 进程号] [--grace 毫秒]
node server.mjs open <工程路径> [--timeout 毫秒]
node server.mjs close [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs mcp-selftest        # 校验 MCP SDK 依赖
```

退出码：`0` 成功；`1` IDE 窗口不存在 / exe 找不到 / 启动失败；`2` 菜单项缺失/置灰；
`3` 已触发但没等到游戏进程；`4` 多实例歧义（需指定 instance）；`5` 同步被拒需人工（run）/
有进程未能停止（stop）；`6` 同步顺延/超时（未运行）/ IDE 未退出或工程未载入完成（close/open，
多半弹了对话框等人工）；`7`（sync）同步通道不可用 /（stop）pid 不是正在运行的游戏 /
（open）路径参数无效。

## 测试流程

1. IDE 关闭 → `status` 应报 `instances: []`；
2. 开两个 IDE（不同工程）→ `status` → 应列出 2 个实例，`gmsave_sync` 为 `ready`（新
   GMSave）或 `no-channel`（旧 GMSave），`project.path` 与各实例实际打开的工程一致；
3. 不带 `instance` 触发 `run` → 应退出码 4 并列出实例清单，不开游戏；
4. `sync --instance <目标>` → 应返回 `reloaded` 或 `nothing-to-do`；
5. 在磁盘上改一个工程文件（如脚本 `.gml`），再 `sync` → 应返回 `reloaded`，
   `status` 后运行游戏验证新代码生效；
6. `run --instance <序号或工程名>` → 约十几秒后返回 `ok` + PID（含 `sync` 字段），
   `status` 里该游戏的 `ppid` 应等于目标实例的 `pid`；
7. `stop --instance <目标>` → 游戏应正常退出，返回 `method: "wm_close"`；
   再 `stop` 一次 → 应报"没有正在运行的游戏"（幂等）；
8. 游戏运行中再触发同实例的 `run` → 验证排队语义：新游戏实例嵌套启动；
9. （可选）`open <某 .gmk>` → 新 IDE 弹出并载入，`project` 报 `format: "native"`，
   `sync` 返回 `gmk-unsupported`（applicable: false，不弹窗不报错），`run` 正常运行且带
   gmk 警告；`close --instance <该实例>` → 干净退出（`unsaved_changes: false`，无弹窗）。

## 维护备注

运行管线逆向地址（`RunGamePipeline` 等）记录在 `GMEnhance/gm80_addresses.h` 的
Run-game pipeline 段；外部消息路线已验证可用，进程内直调那套地址留给未来需要
读取编译错误文本/工程状态的工具使用。工程同步通道的状态码/detail 定义与 GMSave
仓库 `project_watcher.cpp` 的 ForceSync 段注释一一对应，两边改协议要同步改。

