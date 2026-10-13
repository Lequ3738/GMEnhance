// 扫描 GM8 小块内存池表（sub_4018EC 小片路径派生）：
//   pool = 0x5E304C + 32*k，锁字节在 pool+0
//   池内字段（从分配/释放路径反推）：
//     +0  lock byte        +2  块尺寸(ushort)
//     +4  首个空闲块指针   +8  空闲链指针
//     +12 块计数/尺寸      +16 宿主 group 对象指针  +20 链
// 用途：验证模型 + 为高频采样 Watchdog 提供可靠基线
//
// 用法：node poolscan.mjs <pid> [entries]
import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 7440);
const N = Number(process.argv[3] ?? 1024);
const TABLE = 0x5e304c;
const STRIDE = 32;

const kernel32 = koffi.load('kernel32.dll');
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const VirtualQueryEx = kernel32.func('__stdcall', 'VirtualQueryEx', 'uintptr',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr']);

const h = OpenProcess(0x1F0FFF, 0, PID);
if (!h) { console.log('OpenProcess failed'); process.exit(1); }

const rd = (addr, size) => {
  const buf = Buffer.alloc(size);
  const got = Buffer.alloc(8);
  const ok = ReadProcessMemory(h, addr, buf, size, got);
  return ok ? buf : null;
};

// 区域判定：指针是否落在已提交私有区（判定 pool+16 的宿主指针是否合理）
const MEMORY_BASIC_INFORMATION32 = koffi.struct('MBI32', {
  BaseAddress: 'uint32', AllocationBase: 'uint32', AllocationProtect: 'uint32',
  RegionSize: 'uint32', State: 'uint32', Protect: 'uint32', Type: 'uint32',
});
const regions = [];
for (let addr = 0x10000; addr < 0x7fff0000;) {
  const b = Buffer.alloc(koffi.sizeof(MEMORY_BASIC_INFORMATION32));
  const r = VirtualQueryEx(h, addr, b, b.length);
  if (!r) break;
  const m = koffi.decode(b, MEMORY_BASIC_INFORMATION32);
  if (m.State === 0x1000 && (m.Protect & 0xff) !== 0 && (m.Protect & 0x100) === 0)
    regions.push({ base: m.BaseAddress, size: m.RegionSize, type: m.Type });
  const next = m.BaseAddress + m.RegionSize;
  if (next <= addr) break;
  addr = next;
}
const inPrivate = (p) => regions.some((r) => r.type === 0x20000 && p >= r.base && p < r.base + r.size);

const raw = rd(TABLE, N * STRIDE);
if (!raw) { console.log('read table failed'); process.exit(1); }

let active = 0;
const rows = [];
for (let k = 0; k < N; k++) {
  const o = k * STRIDE;
  const lock = raw[o];
  const size = raw.readUInt16LE(o + 2);
  const f4 = raw.readUInt32LE(o + 4);
  const f8 = raw.readUInt32LE(o + 8);
  const f12 = raw.readUInt32LE(o + 12);
  const f16 = raw.readUInt32LE(o + 16);
  const f20 = raw.readUInt32LE(o + 20);
  const looksInit = inPrivate(f16) || (size !== 0 && size % 8 === 0 && size <= 0x1000);
  if (!looksInit) continue;
  active++;
  rows.push({ k, addr: TABLE + o, lock, size, f4, f8, f12, f16, f20 });
}
console.log(`pid=${PID} table entries=${N} active(plausible)=${active}`);
console.log('k\taddr\tlock\tsize\t+4\t+8\t+12\t+16\t+20');
for (const r of rows.slice(0, 60)) {
  const hx = (v) => '0x' + (v >>> 0).toString(16);
  console.log(`${r.k}\t${hx(r.addr)}\t${r.lock}\t${r.size}\t${hx(r.f4)}\t${hx(r.f8)}\t${hx(r.f12)}\t${hx(r.f16)}\t${hx(r.f20)}`);
}
if (rows.length > 60) console.log(`... ${rows.length - 60} more`);
const locked = rows.filter((r) => r.lock !== 0);
console.log(`locked now: ${locked.length}${locked.length ? ' -> ' + locked.map((r) => r.k + '@' + r.lock).join(',') : ''}`);
const sizeHist = {};
for (const r of rows) sizeHist[r.size] = (sizeHist[r.size] || 0) + 1;
console.log('size histogram:', JSON.stringify(sizeHist));
CloseHandle(h);
