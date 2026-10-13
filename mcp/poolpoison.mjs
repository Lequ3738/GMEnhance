// 池锁故意卡死/恢复工具（验证"池锁卡死 => 重载挂死"机理；仅诊断用）
//
//   node poolpoison.mjs <pid> list               列出所有池 idx/尺寸/当前锁值
//   node poolpoison.mjs <pid> lock <idx...>      把指定池的锁字节写成 1（模拟卡死）
//   node poolpoison.mjs <pid> unlock <idx...>    恢复为 0（解开卡死，线程应立刻恢复）
//
// 池地址：TABLE + 8*idx（idx 为 4 的倍数；等价于 TABLE + 32*(idx/4)）
import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 7440);
const CMD = process.argv[3] ?? 'list';
const IDXS = process.argv.slice(4).map(Number);
const TABLE = 0x5e304c;
const BTAB = 0x5eb5c0;
const POOLS = 216;

const kernel32 = koffi.load('kernel32.dll');
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const WriteProcessMemory = kernel32.func('__stdcall', 'WriteProcessMemory', 'int',
  ['void *', 'uintptr', koffi.inout(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);

const h = OpenProcess(0x1F0FFF, 0, PID);
if (!h) { console.log('OpenProcess failed'); process.exit(1); }
const rd = (addr, size) => {
  const buf = Buffer.alloc(size);
  const got = Buffer.alloc(8);
  return ReadProcessMemory(h, addr, buf, size, got) ? buf : null;
};
const wr8 = (addr, val) => {
  const buf = Buffer.from([val]);
  const got = Buffer.alloc(8);
  return WriteProcessMemory(h, addr, buf, 1, got);
};

const raw = rd(TABLE, POOLS * 8);
if (!raw) { console.log('read failed'); process.exit(1); }
const pools = [];
const allPools = []; // 全部 idx%4==0 的槽位（不依赖 +2 尺寸合法性，恢复时最稳）
for (let k = 0; k < POOLS; k++) {
  if (k & 3) continue;
  const o = k * 8;
  allPools.push({ idx: k, addr: TABLE + o });
  const size = raw.readUInt16LE(o + 2);
  if (size === 0 || size > 0x1000 || size % 8 !== 0) continue;
  pools.push({ idx: k, size, addr: TABLE + o, lock: raw[o] });
}
if (CMD === 'list') {
  console.log(`pid=${PID}: ${pools.length} pools`);
  for (const p of pools) console.log(`  idx=${p.idx}\tsize=${p.size}\taddr=0x${p.addr.toString(16)}\tlock=${p.lock}`);
} else if (CMD === 'lockall' || CMD === 'unlockall') {
  const val = CMD === 'lockall' ? 1 : 0;
  let n = 0;
  for (const p of allPools) {
    if (wr8(p.addr, val)) n++;
  }
  console.log(`pid=${PID} ${CMD}: wrote ${val} to ${n}/${allPools.length} pool locks`);
} else if (CMD === 'check') {
  // 主窗体响应性（SMTO_ABORTIFHUNG 200ms）+ 当前锁值与主线程 EIP
  const user32 = koffi.load('user32.dll');
  const SendMessageTimeoutW = user32.func('__stdcall', 'SendMessageTimeoutW', 'uintptr',
    ['void *', 'uint32', 'uintptr', 'void *', 'uint32', 'uint32', koffi.out(koffi.pointer('uintptr'))]);
  const FindWindowW = user32.func('__stdcall', 'FindWindowW', 'void *', ['str16', 'str16']);
  const FindWindowA = user32.func('__stdcall', 'FindWindowA', 'void *', ['str16', 'str16']);
  const wa = FindWindowA('TMainForm', null);
  const ww = FindWindowW('TMainForm', null);
  const out = [0];
  const rA = wa ? SendMessageTimeoutW(wa, 0, 0, null, 0x8, 200, out) : -1;
  const rW = ww ? SendMessageTimeoutW(ww, 0, 0, null, 0x8, 200, out) : -1;
  const hx = (p) => (p ? '0x' + koffi.address(p).toString(16) : 'null');
  console.log(`TMainForm A-handle=${hx(wa)} resp=${rA}   W-handle=${hx(ww)} resp=${rW}`);
  console.log('locked pools: ' + (pools.filter((p) => { const v = rd(p.addr, 1); return v && v[0] !== 0; }).map((p) => `${p.idx}(sz${p.size})=${rd(p.addr, 1)[0]}`).join(', ') || 'none'));
} else if (CMD === 'lock' || CMD === 'unlock') {
  const val = CMD === 'lock' ? 1 : 0;
  for (const idx of IDXS) {
    const p = pools.find((x) => x.idx === idx);
    if (!p) { console.log(`idx=${idx} not a pool — skipped`); continue; }
    const ok = wr8(p.addr, val);
    const after = rd(p.addr, 1);
    console.log(`idx=${idx} size=${p.size} addr=0x${p.addr.toString(16)} write=${val} ok=${ok} now=${after ? after[0] : '?'}`);
  }
} else {
  console.log('usage: poolpoison.mjs <pid> list|lock|unlock [idx...]');
}
CloseHandle(h);
