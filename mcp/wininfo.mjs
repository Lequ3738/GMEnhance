// 列某进程顶层窗口：标题/可见性/最小化/位置尺寸（诊断"UI 在等但看不见"类问题）
// 用法：node wininfo.mjs <pid>
import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 0);
const user32 = koffi.load('user32.dll');

const WNDENUMPROC = koffi.proto('__stdcall', 'WNDENUMPROC', 'int', ['void *', 'intptr']);
const EnumWindows = user32.func('__stdcall', 'EnumWindows', 'int',
  [koffi.pointer(WNDENUMPROC), 'intptr']);
const GetWindowThreadProcessId = user32.func('__stdcall', 'GetWindowThreadProcessId', 'uint32',
  ['void *', koffi.out(koffi.pointer('uint32'))]);
const GetWindowTextW = user32.func('__stdcall', 'GetWindowTextW', 'int',
  ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const GetClassNameW = user32.func('__stdcall', 'GetClassNameW', 'int',
  ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const IsWindowVisible = user32.func('__stdcall', 'IsWindowVisible', 'int', ['void *']);
const IsIconic = user32.func('__stdcall', 'IsIconic', 'int', ['void *']);
const IsWindowEnabled = user32.func('__stdcall', 'IsWindowEnabled', 'int', ['void *']);
const GetWindowRect = user32.func('__stdcall', 'GetWindowRect', 'int',
  ['void *', koffi.out(koffi.pointer('int32'))]);
const GetForegroundWindow = user32.func('__stdcall', 'GetForegroundWindow', 'void *', []);
const GetWindowLongW = user32.func('__stdcall', 'GetWindowLongW', 'int32', ['void *', 'int']);

const rows = [];
const s = (buf) => Buffer.from(buf).toString('utf16le').replace(/\0.*$/, '');
const cb = (hwnd) => {
  const pid = [0];
  GetWindowThreadProcessId(hwnd, pid);
  if (Number(pid[0]) !== PID) return 1;
  const tb = Buffer.alloc(512), cb2 = Buffer.alloc(512), rb = Buffer.alloc(16);
  GetWindowTextW(hwnd, tb, 256);
  GetClassNameW(hwnd, cb2, 256);
  GetWindowRect(hwnd, rb);
  const rect = [rb.readInt32LE(0), rb.readInt32LE(4), rb.readInt32LE(8), rb.readInt32LE(12)];
  rows.push({
    hwnd: '0x' + koffi.address(hwnd).toString(16),
    class: s(cb2),
    title: s(tb),
    visible: !!IsWindowVisible(hwnd),
    iconic: !!IsIconic(hwnd),
    enabled: !!IsWindowEnabled(hwnd),
    style: '0x' + (GetWindowLongW(hwnd, -16) >>> 0).toString(16),
    rect: `${rect[0]},${rect[1]} ${rect[2] - rect[0]}x${rect[3] - rect[1]}`,
  });
  return 1;
};
const reg = koffi.register(cb, koffi.pointer(WNDENUMPROC));
EnumWindows(reg, 0);
koffi.unregister(reg);
console.log(`pid=${PID} foreground=0x${koffi.address(GetForegroundWindow()).toString(16)} windows=${rows.length}`);
for (const r of rows) console.log(JSON.stringify(r));
