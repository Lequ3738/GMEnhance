# GMEnhance MCP（mcp/）

通过 MCP（Model Context Protocol）把 GameMaker 8.0 IDE 的「正常运行 / 调试运行」暴露给 AI 代理。

## 架构：纯外部方案（零注入、零新增可执行文件、不需要任何 DLL）

`server.mjs` 一个文件，Node 进程内用 koffi FFI 完成全部 Win32 调用：

1. `FindWindowExW` 枚举全部 `TMainForm` 主窗体（**支持多开 IDE**），取各实例的 pid 与标题；
2. 枚举 Win32 菜单，按顶层 Caption（`运行(&U)` / `Run`）定位"运行"子菜单，取其叶子项
   （位置 0=运行、1=调试运行；命令 ID 与置灰状态可读）；
3. `PostMessage(WM_COMMAND, 命令ID)` 触发——消息在 IDE 主线程走 VCL 的菜单项 Click
   分派链，与用户点菜单同一入口（汉化版自绘菜单下实测同样成立）；
4. 轮询进程列表，等 `%TEMP%\gm_ttt*\` 下出现**新**游戏进程即成功，返回其 PID。
   游戏进程由 IDE 直接 `CreateProcessA` 创建，**父进程即发起运行的 IDE**，
   用 ppid 归因，多 IDE 同时开游戏也不会误报。

### 多实例

多个 IDE 在跑时，`run_game` / `run_debug` 必须传 `instance`：
1 基序号，或窗口标题（含工程名）的子串（大小写不敏感）。只开一个 IDE 时可省略。
不指定或歧义时工具拒绝执行（退出码 4）并列出实例清单供选择。

触发即时返回（IDE 的运行处理器内部会泵消息等游戏退出，不阻塞本工具），成败由新进程判定。

### 两个实测过的平台事实

- **汉化版菜单自绘化**：所有菜单项 `MF_OWNERDRAW`，`GetMenuString` 系列对叶子项返回空文本，
  但命令 ID、置灰状态正常，`WM_COMMAND` 分派链完好——本工具因此按位置选叶子项而非文本。
- **编译耗时**：触发后 IDE 先构建临时 exe 再启动游戏（Nature Edition 实测约 14 秒），
  默认超时 30 秒，大工程可传 `timeout_ms` 调大。

## 前置要求与安装

- GameMaker 8.0（本仓库对应的汉化版）；本工具不依赖 GMEnhance.dll，裸 IDE 也能用
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

重启会话后可用工具：`mcp__gm8__status`、`mcp__gm8__run_game`、`mcp__gm8__run_debug`。

## 工具

| 工具 | 参数 | 说明 |
|---|---|---|
| `status` | — | 全部 IDE 实例（序号/pid/标题/菜单状态）、正在运行的游戏进程（含归属 IDE 的 ppid） |
| `run_game` | `instance?`, `timeout_ms?` | 触发指定实例的"正常运行"，等同 F5；返回新游戏进程 PID |
| `run_debug` | `instance?`, `timeout_ms?` | 触发指定实例的"调试运行"，等同 F6 |

## 语义与边界

- **排队**：IDE 的运行处理器要等上一个游戏退出才返回，游戏运行中再触发会嵌套执行，
  可同时存在多个游戏实例（与手动连按 F5 的行为一致）。
- **编译错误**：IDE 自己弹 GBK 错误框，工具表现为超时（退出码 3），需人工查看 IDE。
- **无房间工程**：IDE 运行管线会弹"至少要有一个房间才能运行"，同样表现为超时。

## CLI 调试

```bash
node server.mjs status
node server.mjs run [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs debug [--instance 序号|标题子串] [--timeout 毫秒]
node server.mjs mcp-selftest        # 校验 MCP SDK 依赖
```

退出码：`0` 成功；`1` IDE 窗口不存在；`2` 菜单项缺失/置灰；`3` 已触发但没等到游戏进程；
`4` 多实例歧义（需指定 instance）。

## 测试流程

1. IDE 关闭 → `status` 应报 `instances: []`；
2. 开两个 IDE（不同工程）→ `status` → 应列出 2 个实例；
3. 不带 `instance` 触发 `run` → 应退出码 4 并列出实例清单，不开游戏；
4. `run --instance <序号或工程名>` → 约十几秒后返回 `ok` + PID，
   `status` 里该游戏的 `ppid` 应等于目标实例的 `pid`；
5. 游戏运行中再触发同实例的 `run` → 验证排队语义：新游戏实例嵌套启动。

## 维护备注

运行管线逆向地址（`RunGamePipeline` 等）记录在 `GMEnhance/gm80_addresses.h` 的
Run-game pipeline 段；外部消息路线已验证可用，进程内直调那套地址留给未来需要
读取编译错误文本/工程状态的工具使用。

