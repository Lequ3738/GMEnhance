// gm8-mcp — GameMaker 8.0 IDE 运行控制 MCP 服务器
//
// 纯外部方案（零注入、零新增可执行文件、不需要任何 DLL）：
//   枚举全部 TMainForm 主窗体（支持多开）→ 枚举 Win32 菜单定位"运行"菜单项
//   → PostMessage(WM_COMMAND) 触发 → 轮询进程列表确认新游戏进程出现。
//   WM_COMMAND 在 IDE 主线程走 VCL 的菜单项 Click 分派链，与用户点菜单同一入口
//   （实测该汉化版自绘菜单下同样成立，游戏约 14 秒启动）。
//
// 工程同步（需要部署 GMSave.dll，其 ForceSync 通道见 GMSave 仓库
// project_watcher.cpp）：GM8 编译用的是 IDE 内存里的工程，外部改动必须先经
// GMSave 的合并流重载才会生效，而那条流默认只在 IDE 回到前台后才跑。AI 在
// 后台改完文件后调 sync_project（或 run_game 的前置步骤），向该 IDE 的
// "GMSave.Watcher" 隐藏窗口投递注册消息 GMSave.ForceSync，GMSave 在主线程
// 跳过前台门执行同一条合并流（无人值守安全：检测到会弹窗的状态就拒绝执行、
// 不弹任何 UI），结果写进命名文件映射 Local\GMSave.SyncStatus.<pid> 供本进程
// 轮询读取。零脏 ⇒ local==base ⇒ 冲突不可能，纯 AI 循环保证静默重载。
//
// 多实例：游戏进程由 IDE 直接 CreateProcess，父进程即发起运行的 IDE，
// 用 ppid 归因，多 IDE 同时开游戏也不会误报。多个 IDE 在跑时必须用
// instance 参数（序号或工程标题子串）指定目标，否则拒绝执行。
//
// 汉化版把菜单项全部设为自绘（MF_OWNERDRAW），叶子项读不到文本，但命令 ID
// 与置灰状态可读："运行"子菜单固定两项，位置 0=运行、1=调试运行。
//
// 两种用法：
//   node server.mjs status|sync|run|debug|stop [--instance 序号|标题] [--timeout 毫秒]
//   node server.mjs                                      MCP stdio 模式（默认）
//
// MCP 模式下 stdout 是协议通道，任何诊断输出只允许走 stderr。

import process from 'node:process';
import { spawn as nodeSpawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import koffi from 'koffi';

// ---------- Win32 绑定（user32 / kernel32） ----------

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');
const advapi32 = koffi.load('advapi32.dll');

// HKCU\Software\Game Maker\Version 8\Preferences\Directory = GM8 安装根目录
const RegGetValueW = advapi32.func('__stdcall', 'RegGetValueW', 'int32',
  ['uintptr', 'str16', 'str16', 'uint32', 'void *', koffi.out(koffi.pointer('uint16')), koffi.pointer('uint32')]);
const HKEY_CURRENT_USER = 0x80000001;
const RRF_RT_REG_SZ = 0x2;

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
const RegisterWindowMessageW = user32.func('__stdcall', 'RegisterWindowMessageW', 'uint32', ['str16']);
const IsWindowVisible = user32.func('__stdcall', 'IsWindowVisible', 'int', ['void *']);

const OpenFileMappingW = kernel32.func('__stdcall', 'OpenFileMappingW', 'void *', ['uint32', 'int', 'str16']);
const MapViewOfFile = kernel32.func('__stdcall', 'MapViewOfFile', 'void *', ['void *', 'uint32', 'uint32', 'uint32', 'uintptr']);
const UnmapViewOfFile = kernel32.func('__stdcall', 'UnmapViewOfFile', 'int', ['void *']);
const TerminateProcess = kernel32.func('__stdcall', 'TerminateProcess', 'int', ['void *', 'uint32']);
const WaitForSingleObject = kernel32.func('__stdcall', 'WaitForSingleObject', 'uint32', ['void *', 'uint32']);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);

// MODULEENTRY32W 必须在引用它的 func 绑定之前声明（koffi 按名字串即时解析）。
// 本进程是 x64，指针字段按 8 字节布局；API 会正确回填 32 位目标进程的模块基址。
const MODULEENTRY32W = koffi.struct('MODULEENTRY32W', {
  dwSize: 'uint32',
  th32ModuleID: 'uint32',
  th32ProcessID: 'uint32',
  GlblcntUsage: 'uint32',
  ProccntUsage: 'uint32',
  modBaseAddr: 'uintptr',
  modBaseSize: 'uint32',
  hModule: 'uintptr',
  szModule: koffi.array('uint16', 256),
  szExePath: koffi.array('uint16', 260),
});
const CreateToolhelp32Snapshot = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const Module32FirstW = kernel32.func('__stdcall', 'Module32FirstW', 'int',
  ['void *', koffi.inout(koffi.pointer(MODULEENTRY32W))]);
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

// GMSave ForceSync 结果块（16 字节，布局见 GMSave project_watcher.cpp）。
// reqId 由 GMSave 最后写入，作为"本次请求已完成"的提交标记。
const GM_SYNC_BLOCK = koffi.struct('GM_SYNC_BLOCK', {
  magic: 'uint32',
  reqId: 'uint32',
  status: 'uint32',
  detail: 'uint32',
});
const GM_SYNC_MAGIC = 0x47534d31; // 'GMS1'
const FILE_MAP_READ = 0x4;
// 同一字符串系统级注册出同一消息 id；GMSave 侧在创建隐藏窗口时注册同名消息。
const MSG_FORCE_SYNC = RegisterWindowMessageW('GMSave.ForceSync');

// ---------- 小工具 ----------

const MF_BYPOSITION = 0x400;
const MF_GRAYED_OR_DISABLED = 0x3;
const MF_SEPARATOR = 0x800;
const WM_COMMAND = 0x111;
const WM_CLOSE = 0x10;
const TH32CS_SNAPPROCESS = 0x2;
const TH32CS_SNAPMODULE = 0x8;
const TH32CS_SNAPMODULE32 = 0x10; // 64 位进程枚举 32 位（WOW64）目标模块必需
const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const PROCESS_VM_READ = 0x10;
const PROCESS_SYNCHRONIZE = 0x100000;
const PROCESS_TERMINATE = 0x1;
const WAIT_OBJECT_0 = 0;

// GM8 IDE 全局 GM80_ProjectPath（char*，GBK 编码的当前工程文件路径）。
// 地址见 gm80_addresses.h：RVA 相对模块基址，绝对地址 = base + 0x1EA27C。
const GM_PROJECT_PATH_RVA = 0x1ea27c;
const GM_PATH_MAX = 1024;

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

// ---------- 核心：GMSave 工程同步（ForceSync） ----------

// 状态码与 GMSave project_watcher.cpp 的 force_sync_report 一一对应
const SYNC_STATUS = {
  1: 'reloaded', // 合并流已跑完，工程已从磁盘重载
  2: 'nothing-to-do', // 磁盘与 base 快照一致，无需重载
  3: 'deferred', // 顺延重试（见 detail）
  4: 'needs-manual', // 拒绝执行：需要人工在 IDE 里处理，未弹任何窗
  5: 'not-watching', // 没有受监视的 .gm80 工程（未打开或工程已切换）
  6: 'failed', // 保留
};
const SYNC_DETAIL = {
  '3:1': 'GMSave 合并流程正在运行',
  '3:2': 'IDE 有非编辑器的模态对话框（消息框/文件对话框等）',
  '3:3': '独立的代码编辑窗口开着（重载会损坏它）',
  '3:4': '有资源编辑窗处于模态状态',
  '4:2': 'IDE 存在未保存的修改（标题栏 * ）——合并流的确认弹窗需要人回答',
};

/** 该 IDE 进程的 GMSave.Watcher 隐藏窗口（无则未部署/未载入 GMSave） */
export function findWatcherWindows() {
  const out = [];
  for (
    let hwnd = FindWindowExW(null, null, 'GMSave.Watcher', null);
    hwnd;
    hwnd = FindWindowExW(null, hwnd, 'GMSave.Watcher', null)
  ) {
    out.push({ hwnd, pid: windowPid(hwnd) });
  }
  return out;
}

// 跨进程唯一请求 id：不同 MCP 进程（CLI + 常驻 server）可能同时轮询同一映射，
// 用 pid 混淆起始值，之后各自单调递增。
let syncSeq = ((process.pid ^ Date.now()) & 0x7fffffff) | 1;

/**
 * 让指定 IDE 进程里的 GMSave 立即执行一次外部改动合并/重载（跳过前台门）。
 * 投递注册消息 GMSave.ForceSync（wParam=请求 id），轮询命名文件映射直到
 * reqId 匹配。返回对象三态：
 *   supported=false  通道不存在（GMSave 旧于 ForceSync / 未载入 / 无窗口）
 *   timeout          已投递但等不到结果（IDE 主线程被长时间占用）
 *   其余             { status, status_name, detail, detail_text }
 */
export async function syncProject(pid, timeoutMs = 20000) {
  // .gmk/.gm6/.gmd 原生二进制工程：GMSave 只认 .gm80 文本工程目录，同步对它们
  // 没有意义（也无法以文本方式外部编辑）——无论 GMSave 是否部署都直接给出明确
  // 的"不适用"答案，不打扰 GMSave。
  const proj = projectInfo(pid);
  if (proj.path && proj.format === 'native') {
    return {
      supported: true,
      applicable: false,
      status: 5, // 沿用 GMSave not-watching 语义位
      status_name: 'gmk-unsupported',
      detail: 0,
      detail_text:
        `当前工程是 GM8 原生二进制格式（${proj.path.slice(proj.path.lastIndexOf('.') + 1)}）：` +
        'GMSave 的外部改动监视/重载不适用，工程也无法以文本方式在磁盘上编辑；' +
        '运行将直接使用 IDE 内存中的工程',
      project_path: proj.path,
    };
  }
  if (!MSG_FORCE_SYNC) {
    return { supported: false, reason: 'RegisterWindowMessageW 失败', project_path: proj.path };
  }
  const watcher = findWatcherWindows().find((w) => w.pid === pid);
  if (!watcher) {
    return {
      supported: false,
      reason: '该 IDE 进程没有 GMSave.Watcher 窗口（GMSave.dll 未部署或未加载）',
    };
  }
  const hmap = OpenFileMappingW(FILE_MAP_READ, 0, `Local\\GMSave.SyncStatus.${pid}`);
  if (!hmap) {
    return {
      supported: false,
      reason: '打不开 GMSave 同步通道：GMSave.dll 旧于 ForceSync 版本',
    };
  }
  let view = null;
  try {
    view = MapViewOfFile(hmap, FILE_MAP_READ, 0, 0, 16);
    if (!view) return { supported: false, reason: 'MapViewOfFile 失败' };
    const head = koffi.decode(view, GM_SYNC_BLOCK);
    if (head.magic !== GM_SYNC_MAGIC) {
      return { supported: false, reason: `同步通道 magic 不符（${head.magic}）` };
    }
    const reqId = (syncSeq = ((syncSeq + 1) & 0x7fffffff) | 1) >>> 0;
    if (!PostMessageW(watcher.hwnd, MSG_FORCE_SYNC, reqId, null)) {
      return { supported: false, reason: 'PostMessage(GMSave.ForceSync) 失败' };
    }
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await sleep(120);
      const blk = koffi.decode(view, GM_SYNC_BLOCK);
      if (blk.reqId === reqId) {
        return {
          supported: true,
          applicable: true,
          req_id: reqId,
          status: blk.status,
          status_name: SYNC_STATUS[blk.status] ?? `unknown(${blk.status})`,
          detail: blk.detail,
          detail_text: SYNC_DETAIL[`${blk.status}:${blk.detail}`] ?? null,
          project_path: proj.path,
          project_format: proj.format,
        };
      }
    }
    return {
      supported: true,
      timeout: true,
      req_id: reqId,
      reason: `已投递 ForceSync（req ${reqId}）但 ${timeoutMs}ms 内没有结果；IDE 主线程可能被长操作占用`,
    };
  } finally {
    if (view) UnmapViewOfFile(view);
    CloseHandle(hmap);
  }
}

/** status 汇报用：该 IDE 的同步通道就绪状态（只探测，不投递） */
export function syncCapability(pid) {
  if (!findWatcherWindows().some((w) => w.pid === pid)) return 'no-watcher';
  const hmap = OpenFileMappingW(FILE_MAP_READ, 0, `Local\\GMSave.SyncStatus.${pid}`);
  if (!hmap) return 'no-channel';
  CloseHandle(hmap);
  return 'ready';
}

// ---------- 核心：当前工程路径（纯外部 RPM 读取） ----------

let gbkDecoder = null;
try {
  gbkDecoder = new TextDecoder('gbk'); // Node 14+ 官方构建带 full-ICU
} catch {
  try {
    gbkDecoder = new TextDecoder('gb18030');
  } catch {
    /* 无 ICU 时退化为 latin1（路径含中文会乱码，但功能不断） */
  }
}

/** IDE 主模块基址（GM8.0 为 2000 年代 Delphi 链接产物，无 ASLR，兜底 0x400000） */
function ideModuleBase(pid) {
  const snap = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, pid);
  if (!snap) return 0x400000;
  try {
    const entry = { dwSize: koffi.sizeof(MODULEENTRY32W) };
    if (Module32FirstW(snap, entry)) {
      const base = Number(entry.modBaseAddr);
      if (base > 0x10000) return base;
    }
  } catch {
    /* fallthrough */
  } finally {
    CloseHandle(snap);
  }
  return 0x400000;
}

/**
 * 读取 IDE 当前打开的工程文件路径（GM80_ProjectPath，GM 自己的加载/保存都会写它）。
 * 返回 { path, reason? }：path 为 null 表示没打开工程或读不到（不是错误）。
 */
export function getProjectPath(pid) {
  const h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ, 0, pid);
  if (!h) return { path: null, reason: 'OpenProcess 失败' };
  try {
    const base = ideModuleBase(pid);
    const ptrBuf = Buffer.alloc(4); // 32 位进程的指针宽 4 字节
    const nBuf = Buffer.alloc(8);
    if (!ReadProcessMemory(h, base + GM_PROJECT_PATH_RVA, ptrBuf, 4, nBuf)) {
      return { path: null, reason: '读工程路径指针失败' };
    }
    const ptr = ptrBuf.readUInt32LE(0);
    if (ptr < 0x10000 || ptr > 0x7fffffff) return { path: null }; // 空指针：没打开工程
    const strBuf = Buffer.alloc(GM_PATH_MAX);
    if (!ReadProcessMemory(h, ptr, strBuf, GM_PATH_MAX, nBuf)) {
      return { path: null, reason: '读工程路径内容失败' };
    }
    let end = strBuf.indexOf(0);
    if (end < 0) end = GM_PATH_MAX;
    const s = (gbkDecoder ? gbkDecoder.decode(strBuf.subarray(0, end)) : strBuf.toString('latin1')).trim();
    if (!s || !/[\\/]/.test(s)) return { path: null }; // 不像路径：没打开工程
    return { path: s };
  } finally {
    CloseHandle(h);
  }
}

/** 工程格式：'gm80'（GMSave 文本工程目录）/ 'native'（.gmk/.gm6/.gmd 原生二进制）/ 'unknown' */
export function projectFormat(path) {
  if (!path) return null;
  const p = path.toLowerCase();
  if (p.endsWith('.gm80')) return 'gm80';
  if (p.endsWith('.gmk') || p.endsWith('.gm6') || p.endsWith('.gmd')) return 'native';
  return 'unknown';
}

/** 工程所在目录：.gm80 是元数据文件的父目录（即受监视的工程文件夹） */
export function projectFolder(path) {
  if (!path) return null;
  const i = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
  return i > 0 ? path.slice(0, i) : null;
}

function projectInfo(pid) {
  const p = getProjectPath(pid);
  return {
    path: p.path,
    reason: p.reason,
    format: projectFormat(p.path),
    folder: projectFolder(p.path),
  };
}

// ---------- 核心：停止游戏 ----------

/** 目标进程的可见顶层窗口（GM8 游戏主窗口类与 IDE 不同，按 pid + 可见性筛选即可） */
function gameMainWindowHwnds(pid) {
  const out = [];
  for (let h = FindWindowExW(null, null, null, null); h; h = FindWindowExW(null, h, null, null)) {
    if (windowPid(h) === pid && IsWindowVisible(h)) out.push(h);
  }
  return out;
}

async function stopOneGame(g, graceMs) {
  const out = { pid: g.pid, path: g.path };
  const h = OpenProcess(
    PROCESS_SYNCHRONIZE | PROCESS_TERMINATE | PROCESS_QUERY_LIMITED_INFORMATION, 0, g.pid);
  if (!h) {
    return { ...out, method: 'failed', reason: 'OpenProcess 失败（进程可能刚好已退出，或权限不足）' };
  }
  try {
    // WM_CLOSE 优雅退出（等同点窗口 X）。游戏刚启动时主窗口可能尚未创建/
    // 尚不可见，所以宽限期内每 150ms 重扫一遍补发，窗口一出现就能收到。
    const posted = new Set();
    const deadline = Date.now() + Math.max(0, graceMs);
    while (graceMs > 0) {
      for (const w of gameMainWindowHwnds(g.pid)) {
        if (!posted.has(w)) {
          PostMessageW(w, WM_CLOSE, 0, null);
          posted.add(w);
        }
      }
      if (WaitForSingleObject(h, 150) === WAIT_OBJECT_0) break;
      if (Date.now() >= deadline) break;
    }
    if (WaitForSingleObject(h, 0) === WAIT_OBJECT_0) {
      return { ...out, method: posted.size ? 'wm_close' : 'exited' };
    }
    // 优雅退出超时：强杀（游戏没有需要保存的状态，杀掉后 IDE 的运行管线
    // 会正常感知进程退出并清理临时 exe，与用户点 X 无异）
    TerminateProcess(h, 0);
    if (WaitForSingleObject(h, 5000) === WAIT_OBJECT_0) {
      return { ...out, method: 'terminated' };
    }
    return { ...out, method: 'failed', reason: 'TerminateProcess 后 5s 仍未确认退出' };
  } finally {
    CloseHandle(h);
  }
}

/**
 * 停止游戏进程。先 WM_CLOSE（等同点窗口 X，游戏走正常退出流程），
 * graceMs 毫秒内没退出再 TerminateProcess。目标集合：
 *   pid 给定 → 只停这个进程（校验它是正在运行的 gm_ttt 游戏）；
 *   否则 → 该 instance 的 IDE 启动的全部游戏（ppid 归因）。
 * 没有游戏在跑 = 成功无操作（幂等）。
 */
export async function stopGames({ pid = null, instance, graceMs = 3000 } = {}) {
  const games = gamesRunning();
  if (pid != null) {
    const targets = games.filter((g) => g.pid === pid);
    if (!targets.length) {
      return {
        ok: false,
        code: 7,
        kind: 'stop',
        reason: `pid ${pid} 不是正在运行的 GM8 游戏进程（用 status 查看当前游戏列表）`,
      };
    }
    const stopped = [];
    for (const g of targets) stopped.push(await stopOneGame(g, graceMs));
    return finishStop(stopped, null, null);
  }
  const wins = findIdeWindows();
  if (!wins.length) {
    return { ok: false, code: 1, kind: 'stop', reason: '没找到任何 GameMaker 8.0 主窗口（TMainForm），IDE 未运行？' };
  }
  const r = resolveInstance(wins, instance);
  if (r.error) {
    return { ok: false, code: 4, kind: 'stop', reason: r.reason, instances: wins.map(briefInstance) };
  }
  const ide = r.target;
  const targets = games.filter((g) => g.ppid === ide.pid);
  if (!targets.length) {
    return {
      ok: true,
      code: 0,
      kind: 'stop',
      headline: 'OK：目标 IDE 当前没有正在运行的游戏',
      stopped: [],
      instance: briefInstance(ide, wins.indexOf(ide)),
    };
  }
  const stopped = [];
  for (const g of targets) stopped.push(await stopOneGame(g, graceMs));
  return finishStop(stopped, ide, wins.indexOf(ide));
}

function finishStop(stopped, ide, ideIndex) {
  const failed = stopped.filter((s) => s.method === 'failed');
  const res = {
    kind: 'stop',
    stopped,
    ...(ide ? { instance: briefInstance(ide, ideIndex) } : {}),
  };
  if (failed.length) {
    return {
      ...res,
      ok: false,
      code: 5,
      headline: `失败（退出码 5）：${failed.length}/${stopped.length} 个游戏进程未能停止`,
    };
  }
  return {
    ...res,
    ok: true,
    code: 0,
    headline: `OK：已停止 ${stopped.length} 个游戏进程（${stopped.map((s) => s.method).join(', ')}）`,
  };
}

// ---------- 核心：IDE 生命周期（打开工程 / 关闭实例） ----------

/**
 * 定位 Game_Maker.exe：先读用户指明的注册表值
 * HKCU\Software\Game Maker\Version 8\Preferences\Directory（安装根目录），
 * 读不到再扫描 Program Files (x86) 下的 *amemaker 8.0* 目录兜底。
 */
function findGameMakerExe() {
  const buf = Buffer.alloc(1024);
  const len = Buffer.alloc(4);
  len.writeUInt32LE(buf.length);
  if (RegGetValueW(HKEY_CURRENT_USER, 'Software\\Game Maker\\Version 8\\Preferences', 'Directory', RRF_RT_REG_SZ, null, buf, len) === 0) {
    const bytes = Math.min(len.readUInt32LE(0), buf.length);
    const dir = buf.toString('utf16le', 0, Math.floor(bytes / 2) * 2).split('\0')[0].trim();
    if (dir) {
      const cands = /\.exe$/i.test(dir) ? [dir] : [path.join(dir, 'Game_Maker.exe')];
      for (const c of cands) {
        if (fs.existsSync(c)) return c;
      }
    }
  }
  try {
    const root = 'C:\\Program Files (x86)';
    for (const d of fs.readdirSync(root)) {
      if (!/amemaker 8\.0/i.test(d)) continue;
      const c = path.join(root, d, 'Game_Maker.exe');
      if (fs.existsSync(c)) return c;
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

/**
 * 把用户给的工程路径规整成传给 Game_Maker.exe 的命令行参数：
 * .gmk/.gm6/.gmd 文件直接用；.gm80 元数据文件直接用；.gm80 工程文件夹自动
 * 定位里面的同名元数据文件（GMSave 约定 X.gm80\X.gm80）。
 */
function resolveProjectArg(input) {
  let p = path.resolve(String(input).trim().replace(/^"|"$/g, ''));
  let st;
  try {
    st = fs.statSync(p);
  } catch {
    throw new Error(`路径不存在：${p}`);
  }
  if (st.isDirectory()) {
    const base = path.basename(p);
    if (!/\.gm80$/i.test(base)) {
      throw new Error(`目录不是 .gm80 工程文件夹：${p}`);
    }
    const meta = path.join(p, base);
    if (!fs.existsSync(meta)) {
      throw new Error(`工程文件夹里没找到同名元数据文件：${meta}`);
    }
    return { file: meta, format: 'gm80' };
  }
  const ext = path.extname(p).toLowerCase();
  if (!['.gm80', '.gmk', '.gm6', '.gmd'].includes(ext)) {
    throw new Error(`不支持的工程类型：${p}（需要 .gm80/.gmk/.gm6/.gmd）`);
  }
  return { file: p, format: ext === '.gm80' ? 'gm80' : 'native' };
}

/**
 * 启动一个新 IDE 进程打开工程（等同双击关联文件），等新主窗体出现并确认
 * 工程载入完成（GM80_ProjectPath 出现）。detached 启动：MCP 进程退出不影响 IDE。
 */
export async function openProject({ path: projPath, timeoutMs = 30000 } = {}) {
  if (!projPath || typeof projPath !== 'string') {
    return { ok: false, code: 7, reason: '缺少 path 参数（.gm80 元数据文件/工程文件夹，或 .gmk/.gm6/.gmd 文件）' };
  }
  let arg;
  try {
    arg = resolveProjectArg(projPath);
  } catch (e) {
    return { ok: false, code: 7, reason: e.message };
  }
  const exe = findGameMakerExe();
  if (!exe) {
    return { ok: false, code: 1, reason: '找不到 Game_Maker.exe：注册表 Directory 与 Program Files 兜底都未命中' };
  }
  const before = new Set(findIdeWindows().map((w) => w.pid));
  let child;
  try {
    child = nodeSpawn(exe, [arg.file], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (e) {
    return { ok: false, code: 1, reason: `启动 Game_Maker.exe 失败：${e.message}`, exe };
  }
  child.on('error', () => {}); // detached 进程的错误不能让它变成 unhandled 崩掉本进程
  const deadline = Date.now() + timeoutMs;
  let fresh = null;
  while (Date.now() < deadline) {
    await sleep(300);
    fresh = findIdeWindows().find((w) => !before.has(w.pid));
    if (fresh) break;
  }
  if (!fresh) {
    return { ok: false, code: 6, reason: `${timeoutMs}ms 内没等到新的 IDE 主窗口（IDE 启动很慢或被安全软件拦截？）`, exe, requested: arg.file };
  }
  const want = path.resolve(arg.file).toLowerCase();
  while (Date.now() < deadline) {
    await sleep(300);
    if (!IsWindow(fresh.hwnd)) {
      return { ok: false, code: 6, reason: '新 IDE 主窗口中途消失（启动过程崩溃？）', pid: fresh.pid, requested: arg.file };
    }
    const p = getProjectPath(fresh.pid);
    if (p.path) {
      return {
        ok: true,
        code: 0,
        headline: `OK：新 IDE (pid ${fresh.pid}) 已启动，工程载入完成`,
        pid: fresh.pid,
        title: windowTitle(fresh.hwnd),
        project: projectInfo(fresh.pid),
        requested: arg.file,
        match: p.path.toLowerCase() === want,
        exe,
      };
    }
  }
  return {
    ok: false,
    code: 6,
    pid: fresh.pid,
    reason: `IDE 已启动但工程未在 ${timeoutMs}ms 内载入完成（大工程可加大 timeout_ms；也可能 IDE 弹了对话框等人工确认）`,
    requested: arg.file,
  };
}

// GM 的 16 个"标题栏 *"脏标志（每类资源一个字节，0=干净，任何类别非 0 即有未
// 保存修改）。地址抄自 GMSave 仓库 GMSave/gm80_addresses.h 的 ADDR_DIRTY_FLAGS，
// 两边同步维护。只读不改。
const GM_DIRTY_FLAG_RVAS = [
  0x1e945c, 0x1f61e8, 0x1efce8, 0x1efca0,
  0x1efcf4, 0x1efc38, 0x1efcfc, 0x1efd0c,
  0x1efd04, 0x1efd3c, 0x1f61f8, 0x1f6248,
  0x2000b4, 0x1f6210, 0x1efd14, 0x1f1c98,
];

/** IDE 是否有未保存修改：true/false；读不到（权限/结构变化）为 null */
function readIdeDirty(pid) {
  const h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ, 0, pid);
  if (!h) return null;
  try {
    const base = ideModuleBase(pid);
    const buf = Buffer.alloc(1);
    const n = Buffer.alloc(8);
    for (const rva of GM_DIRTY_FLAG_RVAS) {
      if (!ReadProcessMemory(h, base + rva, buf, 1, n)) return null;
      if (buf[0] !== 0) return true;
    }
    return false;
  } catch {
    return null;
  } finally {
    CloseHandle(h);
  }
}

/**
 * 请求一个 IDE 实例退出（WM_CLOSE，等同点 IDE 的 X）：有未保存修改时 GM 会弹
 * 自己的保存确认框等人工处理，这是预期行为，工具只负责把状态如实报告。
 */
export async function closeIde({ instance, timeoutMs = 10000, stopGames: stopGamesFirst = false } = {}) {
  const wins = findIdeWindows();
  if (!wins.length) {
    return { ok: false, code: 1, reason: '没找到任何 GameMaker 8.0 主窗口（TMainForm），IDE 未运行？' };
  }
  const r = resolveInstance(wins, instance);
  if (r.error) {
    return { ok: false, code: 4, reason: r.reason, instances: wins.map(briefInstance) };
  }
  const ide = r.target;
  const idx = wins.indexOf(ide);
  const dirty = readIdeDirty(ide.pid);
  const games = gamesRunning().filter((g) => g.ppid === ide.pid);
  const gamesNote = games.length
    ? `该 IDE 启动的 ${games.length} 个游戏进程不受关闭影响，仍在运行（可用 stop_game 关闭）`
    : null;
  if (stopGamesFirst && games.length) {
    await stopGames({ instance, graceMs: 3000 });
  }
  if (!PostMessageW(ide.hwnd, WM_CLOSE, 0, null)) {
    return { ok: false, code: 3, reason: 'PostMessage(WM_CLOSE) 失败', instance: briefInstance(ide, idx) };
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(250);
    if (!IsWindow(ide.hwnd)) {
      return {
        ok: true,
        code: 0,
        headline: 'OK：IDE 实例已退出',
        closed: true,
        unsaved_changes: dirty,
        ...(gamesNote ? { note: gamesNote } : {}),
        instance: briefInstance(ide, idx),
      };
    }
  }
  const hint = dirty === true
    ? '关闭前检测到未保存修改（标题栏 * ），IDE 大概率弹了保存确认对话框等人工处理——这是预期行为'
    : dirty === false
      ? '未检测到未保存修改，但 IDE 没有退出——可能弹了其他对话框，需人工查看'
      : 'IDE 没有退出，大概率弹了保存确认或其他对话框等人工处理';
  return {
    ok: false,
    code: 6,
    closed: false,
    unsaved_changes: dirty,
    reason: `已投递 WM_CLOSE，但 ${timeoutMs}ms 内 IDE 未退出：${hint}`,
    ...(gamesNote ? { note: gamesNote } : {}),
    instance: briefInstance(ide, idx),
  };
}

// ---------- 核心：状态 / 触发 ----------

export function status() {
  const wins = findIdeWindows();
  const games = gamesRunning();
  const instances = wins.map((w, i) => ({
    ...briefInstance(w, i),
    project: projectInfo(w.pid),
    gmsave_sync: syncCapability(w.pid),
    run_menu: inspectMenus(w.hwnd),
  }));
  return { instances, games_running: games };
}

// 退出码：0 成功；1 IDE 窗口不存在；2 菜单项缺失/置灰；3 已触发但没等到游戏进程；
// 4 多实例歧义（需指定 instance）；5 同步被拒——IDE 有未应用的修改/冲突需人工处理，
// 未触发运行；6 同步顺延/失败/超时——工程状态未确认，未触发运行
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

  // 前置同步：GM8 编译的是 IDE 内存里的工程。外部刚改过磁盘文件的话，
  // 必须先经 GMSave 重载进内存，否则跑的是旧代码且不报任何错。
  // 通道不可用（没部署 GMSave/旧版本）时降级为警告继续跑——保持无 GMSave
  // 环境下的可用性，但把陈旧风险明说。
  let sync;
  const warn = [];
  try {
    sync = await syncProject(ide.pid, Math.min(20000, timeoutMs));
  } catch (e) {
    sync = { supported: false, reason: `同步调用异常：${e?.message ?? e}` };
  }
  if (!sync.supported) {
    warn.push(`GMSave 同步不可用（${sync.reason}）。游戏将按 IDE 内存中的工程现状运行：` +
      '如果刚在磁盘上改过工程文件，它们可能还没生效');
    sync = null;
  } else if (sync.applicable === false) {
    // .gmk 等原生二进制工程：同步本就不适用，正常运行
    warn.push(sync.detail_text);
    sync = { status: null, status_name: 'gmk-unsupported' };
  } else if (sync.status === 1 || sync.status === 2) {
    // 同步确认（reloaded / nothing-to-do），正常路径
  } else if (sync.status === 4) {
    return {
      ok: false,
      code: 5,
      reason: '同步被拒绝：IDE 里有需要人工处理的修改' +
        (sync.detail_text ? `（${sync.detail_text}）` : '') +
        '。为避免跑旧代码，本次未触发运行；请让用户在 IDE 里处理（保存/关闭编辑器/' +
        '解决冲突）后重试',
      sync,
      instance: briefInstance(ide, wins.indexOf(ide)),
    };
  } else if (sync.status === 3) {
    return {
      ok: false,
      code: 6,
      reason: '同步顺延：' + (sync.detail_text ?? 'IDE 当前状态不允许重载') +
        '。可稍后重试；反复出现则需人工查看 IDE 窗口',
      sync,
      instance: briefInstance(ide, wins.indexOf(ide)),
    };
  } else if (sync.status === 5) {
    warn.push('GMSave 报告没有受监视的 .gm80 工程（未打开或已切换）：' +
      '游戏将按 IDE 内存现状运行，磁盘改动不会生效');
    sync = null;
  } else if (sync.timeout) {
    return {
      ok: false,
      code: 6,
      reason: '同步请求超时：' + sync.reason + '。未触发运行；可重试或加大 timeout_ms',
      sync,
      instance: briefInstance(ide, wins.indexOf(ide)),
    };
  } else {
    return {
      ok: false,
      code: 6,
      reason: '同步返回未知状态' + (sync.status_name ? ` ${sync.status_name}` : ''),
      sync,
      instance: briefInstance(ide, wins.indexOf(ide)),
    };
  }

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
        sync: sync ? { status: sync.status, status_name: sync.status_name } : null,
        warnings: warn.length ? warn : undefined,
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
    } else if (args[i] === '--pid' && args[i + 1]) {
      const v = Number(args[++i]);
      if (Number.isInteger(v) && v > 0) out.pid = v;
    } else if (args[i] === '--grace' && args[i + 1]) {
      const v = Number(args[++i]);
      if (Number.isFinite(v) && v >= 0) out.grace = v;
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
  if (cmd === 'sync') {
    const wins = findIdeWindows();
    if (!wins.length) {
      console.log(JSON.stringify({ ok: false, code: 1, reason: '没找到任何 GM8 主窗口' }, null, 2));
      return 1;
    }
    const r = resolveInstance(wins, opts.instance);
    if (r.error) {
      console.log(JSON.stringify({ ok: false, code: 4, reason: r.reason, instances: wins.map(briefInstance) }, null, 2));
      return 4;
    }
    const idx = wins.indexOf(r.target);
    const s = await syncProject(r.target.pid, opts.timeout ?? 20000);
    const out = { ...s, instance: briefInstance(r.target, idx) };
    console.log(JSON.stringify(out, null, 2));
    if (s.applicable === false) return 0; // .gmk 等原生工程：同步不适用=无事可做
    if (!s.supported) return 7;
    if (s.timeout) return 6;
    if (s.status === 1 || s.status === 2) return 0;
    return s.status === 4 ? 5 : 6;
  }
  if (cmd === 'stop') {
    const r = await stopGames({ pid: opts.pid ?? null, instance: opts.instance, graceMs: opts.grace ?? 3000 });
    console.log(JSON.stringify(r, null, 2));
    return r.code;
  }
  if (cmd === 'project') {
    const wins = findIdeWindows();
    if (!wins.length) {
      console.log(JSON.stringify({ ok: false, code: 1, reason: '没找到任何 GM8 主窗口' }, null, 2));
      return 1;
    }
    const r = resolveInstance(wins, opts.instance);
    if (r.error) {
      console.log(JSON.stringify({ ok: false, code: 4, reason: r.reason, instances: wins.map(briefInstance) }, null, 2));
      return 4;
    }
    const idx = wins.indexOf(r.target);
    const p = projectInfo(r.target.pid);
    console.log(JSON.stringify({ ...p, instance: briefInstance(r.target, idx) }, null, 2));
    return 0;
  }
  if (cmd === 'open') {
    const projPath = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
    const r = await openProject({ path: projPath, timeoutMs: opts.timeout ?? 30000 });
    console.log(JSON.stringify(r, null, 2));
    return r.code;
  }
  if (cmd === 'close') {
    const r = await closeIde({ instance: opts.instance, timeoutMs: opts.timeout ?? 10000 });
    console.log(JSON.stringify(r, null, 2));
    return r.code;
  }
  if (cmd === 'mcp-selftest') {
    await mcpSelftest();
    return 0;
  }
  console.error('用法: node server.mjs status|project|sync|run|debug|stop|open <工程路径>|close [--instance 序号|标题] [--timeout 毫秒] [--pid 进程号] [--grace 毫秒] | mcp-selftest\n' +
    '  sync 退出码: 0 已同步/无需同步; 5 需人工处理; 6 顺延/超时; 7 通道不可用\n' +
    '  stop 退出码: 0 已停止/无游戏; 5 有进程未能停止; 7 pid 不是正在运行的游戏\n' +
    '  open 退出码: 0 已启动并载入; 1 启动失败/exe 找不到; 6 超时; 7 路径参数无效\n' +
    '  close 退出码: 0 已退出; 6 超时未退出（多半弹了保存确认框等人工）');
  return 64;
}

// ---------- MCP ----------

function toolResult(r) {
  const lines = [
    r.headline ??
      (r.ok ? `OK：${r.mode} 已触发，游戏进程 PID ${r.pid}` : `失败（退出码 ${r.code}）：${r.reason}`),
  ];
  if (r.hint) lines.push(r.hint);
  if (r.path) lines.push(`路径：${r.path}`);
  if (r.stopped?.length) {
    r.stopped.forEach((s) =>
      lines.push(`- PID ${s.pid}：${s.method}${s.reason ? `（${s.reason}）` : ''}`));
  }
  if (r.note) lines.push(r.note);
  if (r.sync && r.sync.status_name) {
    lines.push(`工程同步：${r.sync.status_name}${r.sync.detail_text ? `（${r.sync.detail_text}）` : ''}`);
  }
  if (r.warnings?.length) r.warnings.forEach((w) => lines.push(`警告：${w}`));
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

  const server = new McpServer({ name: 'gm8', version: '0.6.0' });
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
      .describe('等待上限，毫秒；默认 30000。中型工程编译约需 14 秒，更大工程可调大'),
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
    'sync_project',
    {
      title: '同步 GM8 工程（外部改动重载）',
      description:
        '让某个 IDE 实例里的 GMSave 插件立即检查磁盘上的 .gm80 工程改动并重载进 IDE 内存' +
        '（跳过 GMSave 默认的"IDE 回到前台才处理"门控，专为 AI 后台改文件的闭环设计）。' +
        'AI 改完工程文件后、run_game/run_debug 之前调用（run_* 已内置前置同步，' +
        '仅在需要单独确认同步结果时才调这个）。无人值守安全：检测到会弹窗的状态' +
        '（IDE 里有未应用修改、模态窗等）就拒绝并回报，不会弹出任何需要人回答的窗口。' +
        'status_gmsave 通道不可用说明 GMSave.dll 未部署或版本旧——此时重载不会发生，' +
        '运行将使用 IDE 内存中的旧工程。需要 GMSave.dll。',
      inputSchema: commonSchema,
    },
    async ({ instance, timeout_ms }) => {
      const wins = findIdeWindows();
      if (!wins.length) {
        return toolResult({ ok: false, code: 1, reason: '没找到任何 GameMaker 8.0 主窗口（TMainForm），IDE 未运行？' });
      }
      const r = resolveInstance(wins, instance);
      if (r.error) {
        return toolResult({ ok: false, code: 4, reason: r.reason, instances: wins.map(briefInstance) });
      }
      const ide = r.target;
      const idx = wins.indexOf(ide);
      const s = await syncProject(ide.pid, timeout_ms ?? 20000);
      if (s.applicable === false) {
        return {
          content: [{
            type: 'text',
            text: `同步不适用（无需处理）：${s.detail_text}\n\`\`\`json\n` +
              JSON.stringify({ ...s, instance: briefInstance(ide, idx) }, null, 2) + '\n```',
          }],
        };
      }
      if (!s.supported) {
        return toolResult({ ok: false, code: 7, reason: s.reason, instance: briefInstance(ide, idx) });
      }
      if (s.timeout) {
        return toolResult({ ok: false, code: 6, reason: s.reason, sync: s, instance: briefInstance(ide, idx) });
      }
      const name = s.status_name;
      const ok = s.status === 1 || s.status === 2;
      const text = s.detail_text ? `（${s.detail_text}）` : '';
      const lines = [
        ok
          ? `OK：工程同步完成 —— ${name === 'reloaded' ? '已从磁盘重载' : '磁盘与快照一致，无需重载'}`
          : `同步未完成：${name}${text}`,
        ...(s.status === 4
          ? ['这是无人值守拒绝：需要在 IDE 里人工处理（保存/关闭编辑器/解决冲突）后重试']
          : []),
        ...(s.status === 3 ? ['可稍后重试；反复出现则需人工查看 IDE 窗口'] : []),
        `目标 IDE：#${idx + 1} (pid ${ide.pid}) ${ide.title}`,
      ];
      return {
        content: [{
          type: 'text',
          text: lines.join('\n') + '\n```json\n' + JSON.stringify({ ...s, instance: briefInstance(ide, idx) }, null, 2) + '\n```',
        }],
        isError: !ok,
      };
    },
  );

  server.registerTool(
    'open_project',
    {
      title: '打开 GM8 工程（新 IDE 实例）',
      description:
        '启动一个新的 GameMaker 8.0 IDE 进程并打开指定工程（等同双击关联文件）。' +
        '安装路径先读注册表 HKCU\\Software\\Game Maker\\Version 8\\Preferences\\Directory，' +
        '读不到再扫描 Program Files (x86)。path 支持 .gmk/.gm6/.gmd 文件、.gm80 元数据文件、' +
        '或 .gm80 工程文件夹（自动定位里面的同名元数据）。返回新实例 pid/标题/工程信息；' +
        '以 GM80_ProjectPath 出现确认载入完成。多个 IDE 在跑时新实例会追加到实例列表末尾。' +
        'detached 启动，MCP 进程退出不影响已打开的 IDE。',
      inputSchema: {
        path: z
          .string()
          .min(1)
          .describe('工程路径：.gmk/.gm6/.gmd 文件，.gm80 元数据文件，或 .gm80 工程文件夹'),
        timeout_ms: z
          .number()
          .int()
          .min(5000)
          .max(120000)
          .optional()
          .describe('等待新 IDE 启动并载入工程的超时，毫秒；默认 30000，大工程可调大'),
      },
    },
    async ({ path: p, timeout_ms }) => toolResult(await openProject({ path: p, timeoutMs: timeout_ms ?? 30000 })),
  );

  server.registerTool(
    'close_ide',
    {
      title: '关闭 GM8 IDE 实例',
      description:
        '请求某个 IDE 实例退出（WM_CLOSE，等同点 IDE 窗口的 X）。有未保存修改时 GM 会弹自己的' +
        '保存确认对话框等人工处理——这是预期行为：工具关闭前会读 GM 的脏标志预检并把' +
        'unsaved_changes 一并报告；超时未退出（退出码 6）即说明弹了窗需要人工处理。' +
        'IDE 关闭不会停止它启动的游戏进程，可用 stop_games 参数先停游戏或之后用 stop_game。' +
        '多个 IDE 在跑时必须传 instance。',
      inputSchema: {
        instance: commonSchema.instance,
        timeout_ms: z
          .number()
          .int()
          .min(2000)
          .max(120000)
          .optional()
          .describe('等待 IDE 退出的超时，毫秒；默认 10000。超时未退出多半是弹了保存确认框'),
        stop_games: z
          .boolean()
          .optional()
          .describe('关闭前先停止该 IDE 启动的全部游戏进程；默认 false（游戏继续运行）'),
      },
    },
    async ({ instance, timeout_ms, stop_games }) =>
      toolResult(await closeIde({ instance, timeoutMs: timeout_ms ?? 10000, stopGames: stop_games ?? false })),
  );

  server.registerTool(
    'get_project',
    {
      title: '获取 GM8 当前工程',
      description:
        '读取某个 IDE 实例当前打开的工程文件路径（纯外部：ReadProcessMemory 读 IDE 全局 ' +
        'GM80_ProjectPath，GBK 解码）。返回 path（没打开工程时为 null）、format：' +
        "'gm80' = GMSave 文本工程目录（AI 可直接编辑文件夹里的 .gml/.txt，配合 sync_project 同步）、" +
        "'native' = .gmk/.gm6/.gmd 原生二进制（外部文件编辑与 sync_project 均不适用）、" +
        "其他 = 未知；folder = 工程目录（.gm80 即受监视的文件夹）。status 里也带同样信息。",
      inputSchema: { instance: commonSchema.instance },
    },
    async ({ instance }) => {
      const wins = findIdeWindows();
      if (!wins.length) {
        return toolResult({ ok: false, code: 1, reason: '没找到任何 GameMaker 8.0 主窗口（TMainForm），IDE 未运行？' });
      }
      const r = resolveInstance(wins, instance);
      if (r.error) {
        return toolResult({ ok: false, code: 4, reason: r.reason, instances: wins.map(briefInstance) });
      }
      const ide = r.target;
      const idx = wins.indexOf(ide);
      const p = projectInfo(ide.pid);
      const lines = [
        p.path
          ? `当前工程：${p.path}\n格式：${p.format}（${p.format === 'gm80' ? 'GMSave 文本工程，可直接编辑文件 + sync_project 同步' : p.format === 'native' ? '原生二进制 .gmk 等，外部文件编辑与同步不适用' : '未知格式'})\n工程目录：${p.folder ?? '—'}`
          : `该 IDE 没有打开工程${p.reason ? `（${p.reason}）` : ''}`,
        `目标 IDE：#${idx + 1} (pid ${ide.pid}) ${ide.title}`,
      ];
      return {
        content: [{ type: 'text', text: lines.join('\n') + '\n```json\n' + JSON.stringify({ ...p, instance: briefInstance(ide, idx) }, null, 2) + '\n```' }],
      };
    },
  );

  server.registerTool(
    'stop_game',
    {
      title: '停止 GM8 游戏',
      description:
        '关闭某个 IDE 实例启动的全部 GM8 游戏进程：先给游戏窗口投递 WM_CLOSE（等同点窗口关闭按钮，' +
        '游戏走正常退出流程），宽限 grace_ms 毫秒仍没退出才 TerminateProcess 强杀。' +
        '游戏由哪个 IDE 启动用 ppid 归因，只关该 IDE 自己的游戏；也可用 pid 只关指定进程。' +
        '目标 IDE 没有游戏在跑时是成功无操作（幂等，适合循环收尾时无脑调用）。' +
        '多个 IDE 在跑时必须传 instance（给了 pid 则不需要）。',
      inputSchema: {
        instance: commonSchema.instance,
        pid: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('只停止这个进程号的游戏（status 输出里的游戏 PID）；给了 pid 就忽略 instance'),
        grace_ms: z
          .number()
          .int()
          .min(0)
          .max(30000)
          .optional()
          .describe('WM_CLOSE 后等待游戏自己退出的毫秒数，默认 3000；到点还活着才强杀'),
      },
    },
    async ({ instance, pid, grace_ms }) =>
      toolResult(await stopGames({ pid: pid ?? null, instance, graceMs: grace_ms ?? 3000 })),
  );

  server.registerTool(
    'run_game',
    {
      title: '运行 GM8 游戏',
      description:
        '触发某个 GameMaker 8.0 IDE 实例的"正常运行"（等同按 F5）。流程：先用 GMSave 把磁盘上' +
        '的外部改动同步进 IDE 内存（未部署 GMSave 则降级为警告继续），再给 IDE 主窗口投递 ' +
        'WM_COMMAND，与用户点菜单同一条 VCL 路径。IDE 编译内存中的工程（Nature Edition 实测约 ' +
        '14 秒）再启动游戏，成功返回新游戏进程 PID。多个 IDE 在跑时必须传 instance。' +
        '退出码 5 = IDE 有未应用的修改/冲突需人工处理（未运行）；6 = 同步顺延/超时（未运行）；' +
        '3 = 已触发但超时，大概率 IDE 弹了编译错误对话框等人工确认。',
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
        '其余语义与 run_game 相同（含前置工程同步与退出码 5/6）。',
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
