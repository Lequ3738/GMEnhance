// gm8-mcp — GameMaker 8.0 IDE 运行控制 MCP 服务器
//
// 纯外部方案（零注入、零新增可执行文件、不需要任何 DLL）：
//   枚举全部 TMainForm 主窗体（支持多开）→ 枚举 Win32 菜单定位"运行"菜单项
//   → PostMessage(WM_COMMAND) 触发 → 轮询进程列表确认新游戏进程出现。
//   WM_COMMAND 在 IDE 主线程走 VCL 的菜单项 Click 分派链，与用户点菜单同一入口
//   （实测该汉化版自绘菜单下同样成立，游戏约 14 秒启动）。
//
// 多实例：游戏进程由 IDE 直接 CreateProcess，父进程即发起运行的 IDE，
// 用 ppid 归因，多 IDE 同时开游戏也不会误报。多个 IDE 在跑时必须用
// instance 参数（序号或工程标题子串）指定目标，否则拒绝执行。
//
// 汉化版把菜单项全部设为自绘（MF_OWNERDRAW），叶子项读不到文本，但命令 ID
// 与置灰状态可读："运行"子菜单固定两项，位置 0=运行、1=调试运行。
//
// 两种用法：
//   node server.mjs status|run|debug [--instance 序号|标题] [--timeout 毫秒]
//   node server.mjs                                      MCP stdio 模式（默认）
//
// MCP 模式下 stdout 是协议通道，任何诊断输出只允许走 stderr。

import process from 'node:process';
import koffi from 'koffi';

// ---------- Win32 绑定（user32 / kernel32） ----------

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

const FindWindowW = user32.func('__stdcall', 'FindWindowW', 'void *', ['str16', 'str16']);
const FindWindowExW = user32.func('__stdcall', 'FindWindowExW', 'void *', ['void *', 'void *', 'str16', 'str16']);
const IsWindow = user32.func('__stdcall', 'IsWindow', 'int', ['void *']);
const GetWindowTextW = user32.func('__stdcall', 'GetWindowTextW', 'int', ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const GetWindowThreadProcessId = user32.func('__stdcall', 'GetWindowThreadProcessId', 'uint32', ['void *', koffi.out(koffi.pointer('uint32'))]);
const GetMenu = user32.func('__stdcall', 'GetMenu', 'void *', ['void *']);
const GetMenuItemCount = user32.func('__stdcall', 'GetMenuItemCount', 'int', ['void *']);
const GetSubMenu = user32.func('__stdcall', 'GetSubMenu', 'void *', ['void *', 'int']);
const GetMenuItemID = user32.func('__stdcall', 'GetMenuItemID', 'uint32', ['void *', 'int']);
const GetMenuState = user32.func('__stdcall', 'GetMenuState', 'uint32', ['void *', 'uint32', 'uint32']);
const GetMenuStringW = user32.func('__stdcall', 'GetMenuStringW', 'int', ['void *', 'uint32', koffi.out(koffi.pointer('uint16')), 'int', 'uint32']);
const PostMessageW = user32.func('__stdcall', 'PostMessageW', 'int', ['void *', 'uint32', 'uint32', 'void *']);

const CreateToolhelp32Snapshot = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'int', 'uint32']);
const QueryFullProcessImageNameW = kernel32.func('__stdcall', 'QueryFullProcessImageNameW', 'int', ['void *', 'uint32', koffi.out(koffi.pointer('uint16')), koffi.pointer('uint32')]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);

// pcPriClassBase 在 Win 头文件里是 4 字节 LONG；写成 8 字节 intptr 会让
// koffi 布局出 576 字节而 API 校验 dwSize==568 直接拒绝，Process32FirstW
// 返回 FALSE 且枚举恒空。dwSize 要先填、其余字段由 API 回填，参数取 inout。
const PROCESSENTRY32W = koffi.struct('PROCESSENTRY32W', {
  dwSize: 'uint32',
  cntUsage: 'uint32',
  th32ProcessID: 'uint32',
  th32DefaultHeapID: 'uintptr',
  th32ModuleID: 'uint32',
  cntThreads: 'uint32',
  th32ParentProcessID: 'uint32',
  pcPriClassBase: 'int32',
  dwFlags: 'uint32',
  szExeFile: koffi.array('uint16', 260),
});
const Process32FirstW = kernel32.func('__stdcall', 'Process32FirstW', 'int', ['void *', koffi.inout(koffi.pointer(PROCESSENTRY32W))]);
const Process32NextW = kernel32.func('__stdcall', 'Process32NextW', 'int', ['void *', koffi.inout(koffi.pointer(PROCESSENTRY32W))]);

// ---------- 小工具 ----------

const MF_BYPOSITION = 0x400;
const MF_GRAYED_OR_DISABLED = 0x3;
const MF_SEPARATOR = 0x800;
const WM_COMMAND = 0x111;
const TH32CS_SNAPPROCESS = 0x2;
const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** uint16 数组字段 → 截断到 NUL 的 JS 字符串 */
function u16ArrayToStr(arr) {
  let end = arr.indexOf(0);
  if (end < 0) end = arr.length;
  return String.fromCharCode(...arr.slice(0, end));
}

/** 读取菜单项文本；顶层 Caption 可读，汉化版叶子项为空（自绘） */
function menuText(hmenu, pos) {
  const buf = Buffer.alloc(512);
  const n = GetMenuStringW(hmenu, pos, buf, 256, MF_BYPOSITION);
  if (n <= 0) return '';
  return buf.toString('utf16le', 0, n * 2);
}

const stripAmp = (s) => s.replaceAll('&', '');

function windowTitle(hwnd) {
  const buf = Buffer.alloc(512);
  const n = GetWindowTextW(hwnd, buf, 256);
  return n > 0 ? buf.toString('utf16le', 0, n * 2) : '';
}

function windowPid(hwnd) {
  const buf = Buffer.alloc(4);
  GetWindowThreadProcessId(hwnd, buf);
  return buf.readUInt32LE(0);
}

/** 进程完整路径；拿不到（权限/已退出）返回 null */
function processImagePath(pid) {
  const h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
  if (!h) return null;
  try {
    const buf = Buffer.alloc(2048);
    const len = Buffer.alloc(4);
    len.writeUInt32LE(1024);
    if (!QueryFullProcessImageNameW(h, 0, buf, len)) return null;
    return buf.toString('utf16le', 0, len.readUInt32LE(0) * 2);
  } finally {
    CloseHandle(h);
  }
}

// ---------- 核心：窗口 / 菜单 ----------

/**
 * 全部 GM8 IDE 主窗体（Delphi VCL 窗口类名即窗体类名），支持多开。
 * 返回按窗口枚举序的数组，序号（1 基）即 instance 序号。
 */
export function findIdeWindows() {
  const out = [];
  for (let hwnd = FindWindowExW(null, null, 'TMainForm', null); hwnd; hwnd = FindWindowExW(null, hwnd, 'TMainForm', null)) {
    out.push({ hwnd, pid: windowPid(hwnd), title: windowTitle(hwnd) });
  }
  return out;
}

/**
 * 枚举"运行"顶层菜单的叶子项。
 * 顶层菜单按 运行/Run 模糊匹配（顶层 Caption 汉化版可读）；
 * 叶子项文本可能为空（自绘），命令 ID 与置灰状态始终可读。
 */
export function inspectMenus(hwnd) {
  const hmenu = GetMenu(hwnd);
  if (!hmenu) return { ok: false, reason: '主窗口没有菜单栏' };
  const topCount = GetMenuItemCount(hmenu);
  for (let i = 0; i < topCount; i++) {
    const top = stripAmp(menuText(hmenu, i));
    if (!top.includes('运行') && !/^run/i.test(top)) continue;
    const hsub = GetSubMenu(hmenu, i);
    const items = [];
    const count = GetMenuItemCount(hsub);
    for (let j = 0; j < count; j++) {
      const id = GetMenuItemID(hsub, j);
      const state = GetMenuState(hsub, j, MF_BYPOSITION);
      if (id === 0xffffffff || (state & MF_SEPARATOR)) continue;
      items.push({
        index: j,
        id,
        text: stripAmp(menuText(hsub, j)),
        grayed: (state & MF_GRAYED_OR_DISABLED) !== 0,
      });
    }
    return { ok: true, top_caption: top, items };
  }
  const tops = [];
  for (let i = 0; i < topCount; i++) tops.push(stripAmp(menuText(hmenu, i)));
  return { ok: false, reason: '没找到"运行"顶层菜单', top_menus: tops };
}

/**
 * 从"运行"子菜单叶子项里挑出 运行 / 调试运行 两项。
 * 汉化版叶子项无文本：固定两项时按位置 0=运行、1=调试运行；
 * 有文本时（英文原版）按文本匹配，位置顺序兜底。
 */
export function pickRunDebug(items) {
  if (items.length < 2) return null;
  if (items.every((it) => !it.text)) {
    return { run: items[0], debug: items[1] };
  }
  const run = items.find((it) => /^(正常运行|运行游戏|run( normally)?|run the game)$/i.test(it.text)) ?? items.find((it) => !/调试|debug/i.test(it.text) && /运行|run/i.test(it.text));
  const dbg = items.find((it) => /调试|debug/i.test(it.text));
  if (!run || !dbg) return null;
  return { run, debug: dbg };
}

// ---------- 核心：游戏进程 ----------

/**
 * 正在运行的 GM8 游戏进程。GM8 运行把游戏构建到 %TEMP% 的 gm_ttt* 临时
 * 目录再启动，用路径特征识别，不依赖临时 exe 的具体文件名；
 * ppid（父进程）即发起运行的 IDE 进程，用于多实例归因。
 */
export function gamesRunning() {
  const out = [];
  const snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (!snap) return out;
  try {
    const entry = { dwSize: koffi.sizeof(PROCESSENTRY32W) };
    for (let ok = Process32FirstW(snap, entry); ok; ok = Process32NextW(snap, entry)) {
      const name = u16ArrayToStr(entry.szExeFile);
      if (!name.toLowerCase().endsWith('.exe')) continue;
      const pid = entry.th32ProcessID;
      const path = processImagePath(pid);
      if (path && /\\gm_ttt[^\\]*\\/i.test(path)) {
        out.push({ pid, ppid: entry.th32ParentProcessID, name, path });
      }
    }
  } finally {
    CloseHandle(snap);
  }
  return out;
}

// ---------- 核心：实例消歧 ----------

/**
 * 把 instance 选择器（1 基序号，或标题子串，大小写不敏感）解析到实例。
 * 单实例时无条件命中；多实例未指定或歧义时返回 error，附带实例清单。
 */
export function resolveInstance(list, sel) {
  if (list.length === 1) return { target: list[0] };
  if (sel == null || sel === '') {
    return {
      error: 'multiple',
      reason: `检测到 ${list.length} 个 IDE 实例，请用 instance 参数指定（序号或工程标题子串）`,
    };
  }
  if (typeof sel === 'number' || /^\d+$/.test(String(sel))) {
    const idx = Number(sel);
    if (idx >= 1 && idx <= list.length) return { target: list[idx - 1] };
    return { error: 'notfound', reason: `instance 序号 ${idx} 超出范围（1-${list.length}）` };
  }
  const s = String(sel).toLowerCase();
  const hits = list.filter((x) => x.title.toLowerCase().includes(s));
  if (hits.length === 1) return { target: hits[0] };
  if (hits.length === 0) return { error: 'notfound', reason: `没有标题包含"${sel}"的 IDE 实例` };
  return { error: 'multiple', reason: `"${sel}"匹配到 ${hits.length} 个 IDE 实例，请改用更长的标题子串或序号` };
}

const briefInstance = (x, i) => ({ index: i + 1, pid: x.pid, title: x.title });

// ---------- 核心：状态 / 触发 ----------

export function status() {
  const wins = findIdeWindows();
  const games = gamesRunning();
  const instances = wins.map((w, i) => ({ ...briefInstance(w, i), run_menu: inspectMenus(w.hwnd) }));
  return { instances, games_running: games };
}

// 退出码：0 成功；1 IDE 窗口不存在；2 菜单项缺失/置灰；3 已触发但没等到游戏进程；
// 4 多实例歧义（需指定 instance）
export async function runGame(kind, timeoutMs = 30000, instance) {
  const wins = findIdeWindows();
  if (!wins.length) {
    return { ok: false, code: 1, reason: '没找到任何 GameMaker 8.0 主窗口（TMainForm），IDE 未运行？' };
  }
  const r = resolveInstance(wins, instance);
  if (r.error) {
    return {
      ok: false,
      code: 4,
      reason: r.reason,
      instances: wins.map(briefInstance),
    };
  }
  const ide = r.target;
  const menus = inspectMenus(ide.hwnd);
  if (!menus.ok) {
    return { ok: false, code: 2, reason: menus.reason, detail: menus };
  }
  const picked = pickRunDebug(menus.items);
  const item = picked ? picked[kind] : null;
  if (!item) {
    return { ok: false, code: 2, reason: '运行菜单里没匹配到目标菜单项', items: menus.items };
  }
  if (item.grayed) {
    return { ok: false, code: 2, reason: `菜单项(位置 ${item.index}, id ${item.id})当前置灰，多半没打开工程`, item };
  }

  // 触发前记录该 IDE 自己的游戏进程，之后新出现的才算本次启动；
  // ppid 归因保证另一个 IDE（或其游戏）的变化不会被误判。
  const before = new Set(gamesRunning().filter((g) => g.ppid === ide.pid).map((g) => g.pid));
  if (!PostMessageW(ide.hwnd, WM_COMMAND, item.id, null)) {
    return { ok: false, code: 3, reason: 'PostMessage 失败' };
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(300);
    const fresh = gamesRunning().find((g) => g.ppid === ide.pid && !before.has(g.pid));
    if (fresh) {
      return {
        ok: true,
        code: 0,
        pid: fresh.pid,
        path: fresh.path,
        mode: kind,
        item_id: item.id,
        instance: briefInstance(ide, wins.indexOf(ide)),
      };
    }
    if (!IsWindow(ide.hwnd)) {
      return { ok: false, code: 1, reason: '触发后 IDE 主窗口消失了' };
    }
  }
  return {
    ok: false,
    code: 3,
    reason: `已触发运行菜单项（id ${item.id}），但 ${timeoutMs}ms 内没等到新游戏进程；` +
      '大概率 IDE 弹了编译错误对话框等人工确认（汉化版为 GBK 弹窗），或工程编译超过超时',
    hint: '先到 IDE 处理弹窗再重试；大工程可加大 timeout_ms；' +
      '若游戏在超时后启动，属于排队语义（IDE 的运行处理器要等上一个游戏退出）',
    instance: briefInstance(ide, wins.indexOf(ide)),
  };
}

// ---------- CLI ----------

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--timeout' && args[i + 1]) {
      const v = Number(args[++i]);
      if (Number.isFinite(v) && v > 0) out.timeout = v;
    } else if (args[i] === '--instance' && args[i + 1]) {
      const raw = args[++i];
      out.instance = /^\d+$/.test(raw) ? Number(raw) : raw;
    }
  }
  return out;
}

async function cliMain(argv) {
  const cmd = argv[0];
  const opts = parseArgs(argv.slice(1));
  if (cmd === 'status') {
    console.log(JSON.stringify(status(), null, 2));
    return 0;
  }
  if (cmd === 'run' || cmd === 'debug') {
    const r = await runGame(cmd, opts.timeout ?? 30000, opts.instance);
    console.log(JSON.stringify(r, null, 2));
    return r.code;
  }
  if (cmd === 'mcp-selftest') {
    await mcpSelftest();
    return 0;
  }
  console.error('用法: node server.mjs status|run|debug [--instance 序号|标题] [--timeout 毫秒] | mcp-selftest');
  return 64;
}

// ---------- MCP ----------

function toolResult(r) {
  const lines = [r.ok ? `OK：${r.mode} 已触发，游戏进程 PID ${r.pid}` : `失败（退出码 ${r.code}）：${r.reason}`];
  if (r.hint) lines.push(r.hint);
  if (r.path) lines.push(`路径：${r.path}`);
  if (r.instance) lines.push(`目标 IDE：#${r.instance.index} (pid ${r.instance.pid}) ${r.instance.title}`);
  return {
    content: [{ type: 'text', text: lines.join('\n') + '\n```json\n' + JSON.stringify(r, null, 2) + '\n```' }],
    isError: !r.ok,
  };
}

async function mcpMain() {
  const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const { z } = await import('zod');

  const server = new McpServer({ name: 'gm8', version: '0.2.0' });
  const commonSchema = {
    instance: z
      .union([z.number().int().min(1), z.string().min(1)])
      .optional()
      .describe('目标 IDE 实例：status 列表里的 1 基序号，或窗口标题（工程名）的子串。' +
        '只开了一个 IDE 时可省略；多个 IDE 时必须指定'),
    timeout_ms: z
      .number()
      .int()
      .min(5000)
      .max(300000)
      .optional()
      .describe('等待游戏进程出现的超时，毫秒；默认 30000。中型工程编译约需 14 秒，更大工程可调大'),
  };

  server.registerTool(
    'status',
    {
      title: 'GM8 IDE 状态',
      description:
        '探测全部 GameMaker 8.0 IDE 实例（支持多开）：每个实例的序号/pid/标题（含工程名）、' +
        '"运行"菜单叶子项的命令 ID/置灰状态、当前正在运行的 GM8 游戏进程（含归属 IDE 的 pid）。' +
        '只读，无副作用。run_game/run_debug 之前可先调用确认实例与参数。',
    },
    async () => {
      const r = status();
      return {
        content: [{ type: 'text', text: '```json\n' + JSON.stringify(r, null, 2) + '\n```' }],
      };
    },
  );

  server.registerTool(
    'run_game',
    {
      title: '运行 GM8 游戏',
      description:
        '触发某个 GameMaker 8.0 IDE 实例的"正常运行"（等同按 F5）。给该 IDE 主窗口投递 WM_COMMAND，' +
        '与用户点菜单同一条 VCL 路径。IDE 会先编译内存中的工程（Nature Edition 实测约 14 秒）' +
        '再启动游戏，成功返回新游戏进程 PID。多个 IDE 在跑时必须传 instance。' +
        '超时通常意味着 IDE 弹了编译错误对话框等人工确认，此时应提示用户查看 IDE 窗口。',
      inputSchema: commonSchema,
    },
    async ({ instance, timeout_ms }) => toolResult(await runGame('run', timeout_ms ?? 30000, instance)),
  );

  server.registerTool(
    'run_debug',
    {
      title: '调试运行 GM8 游戏',
      description:
        '触发某个 GameMaker 8.0 IDE 实例的"调试运行"（等同按 F6），带调试器启动游戏。' +
        '其余语义与 run_game 相同。',
      inputSchema: commonSchema,
    },
    async ({ instance, timeout_ms }) => toolResult(await runGame('debug', timeout_ms ?? 30000, instance)),
  );

  await server.connect(new StdioServerTransport());
}

/** 校验 MCP 依赖与工具注册可用，不启动传输；CLI 冒烟测试用 */
async function mcpSelftest() {
  const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
  const { z } = await import('zod');
  const server = new McpServer({ name: 'gm8-selftest', version: '0.0.0' });
  server.registerTool('noop', { inputSchema: { x: z.number().optional() } }, async () => ({ content: [] }));
  console.error('mcp-selftest OK');
}

// ---------- 入口 ----------

const argv = process.argv.slice(2);
if (argv.length > 0) {
  process.exitCode = await cliMain(argv);
} else {
  await mcpMain();
}
