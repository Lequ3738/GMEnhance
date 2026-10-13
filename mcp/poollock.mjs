// 池表模型（GM8 小块内存池，从 sub_4018EC 分配路径派生）：
//   pool_off(idx) = 0x5E304C + 8*idx          idx 来自 byte_5EB5C0[size_class]
//   idx 为 4 的倍数 => 池记录 32 字节步长；尝试链 = idx, idx+4, idx+8（+32/+64 字节）
//   池记录字段：+0 锁字节  +1 尺寸类位图  +2 块尺寸(ushort)
//               +4 首个空闲块  +8 空闲链  +12 计数/阈值  +16 宿主块  +20 链
//   锁只能为 0/1（CAS 写入 1）——其它值 = 被污染；=1 长期不释放 = 泄漏/持有者卡死
// 全局锁 byte_5EB718（中/大块路径）持锁可到毫秒级，卡死判定门槛放宽。
//
// 用法：node poollock.mjs <pid> <seconds> [pollMs] [consec]
import koffi from 'koffi';
import fs from 'node:fs';

const PID = Number(process.argv[2] ?? 7440);
const SECONDS = Number(process.argv[3] ?? 120);
const POLL = Number(process.argv[4] ?? 12);
const CONSEC = Number(process.argv[5] ?? 8);
const TABLE = 0x5e304c;
const BTAB = 0x5eb5c0; // size_class -> pool idx 表（326 字节）
const GLOBAL_LOCK = 0x5eb718;

const kernel32 = koffi.load('kernel32.dll');
const user32 = koffi.load('user32.dll');
const FSA = koffi.struct('FSA3', {
  ControlWord: 'uint32', StatusWord: 'uint32', TagWord: 'uint32',
  ErrorOffset: 'uint32', ErrorSelector: 'uint32', DataOffset: 'uint32', DataSelector: 'uint32',
  RegisterArea: koffi.array('uint8', 80), Cr0NpxState: 'uint32',
});
const CTX = koffi.struct('CTX3', {
  ContextFlags: 'uint32',
  Dr0: 'uint32', Dr1: 'uint32', Dr2: 'uint32', Dr3: 'uint32', Dr6: 'uint32', Dr7: 'uint32',
  FloatSave: FSA,
  SegGs: 'uint32', SegFs: 'uint32', SegEs: 'uint32', SegDs: 'uint32',
  Edi: 'uint32', Esi: 'uint32', Ebx: 'uint32', Edx: 'uint32', Ecx: 'uint32', Eax: 'uint32',
  Ebp: 'uint32', Eip: 'uint32', SegCs: 'uint32', EFlags: 'uint32', Esp: 'uint32', SegSs: 'uint32',
  ExtendedRegisters: koffi.array('uint8', 512),
});
const TE32 = koffi.struct('TE32c', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const ME32 = koffi.struct('ME32c', {
  dwSize: 'uint32', th32ModuleID: 'uint32', th32ProcessID: 'uint32', GlblcntUsage: 'uint32',
  ProccntUsage: 'uint32', modBaseAddr: 'uintptr', modBaseSize: 'uint32', hModule: 'uintptr',
  szModule: koffi.array('uint16', 256), szExePath: koffi.array('uint16', 260),
});
const MBI32 = koffi.struct('MBI32b', {
  BaseAddress: 'uint32', AllocationBase: 'uint32', AllocationProtect: 'uint32',
  RegionSize: 'uint32', State: 'uint32', Protect: 'uint32', Type: 'uint32',
});

const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const CreateToolhelp32Snapshot = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const Thread32First = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(TE32))]);
const Thread32Next = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(TE32))]);
const Module32FirstW = kernel32.func('__stdcall', 'Module32FirstW', 'int', ['void *', koffi.inout(koffi.pointer(ME32))]);
const Module32NextW = kernel32.func('__stdcall', 'Module32NextW', 'int', ['void *', koffi.inout(koffi.pointer(ME32))]);
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const Wow64SuspendThread = kernel32.func('__stdcall', 'Wow64SuspendThread', 'uint32', ['void *']);
const ResumeThread = kernel32.func('__stdcall', 'ResumeThread', 'uint32', ['void *']);
const Wow64GetThreadContext = kernel32.func('__stdcall', 'Wow64GetThreadContext', 'int', ['void *', koffi.inout(koffi.pointer(CTX))]);
const VirtualQueryEx = kernel32.func('__stdcall', 'VirtualQueryEx', 'uintptr',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr']);
const SendMessageTimeoutW = user32.func('__stdcall', 'SendMessageTimeoutW', 'uintptr',
  ['void *', 'uint32', 'uintptr', 'void *', 'uint32', 'uint32', koffi.out(koffi.pointer('uintptr'))]);
const FindWindowW = user32.func('__stdcall', 'FindWindowW', 'void *', ['str16', 'str16']);

const h = OpenProcess(0x1F0FFF, 0, PID);
if (!h) { console.log('OpenProcess failed'); process.exit(1); }
const rd = (addr, size) => {
  const buf = Buffer.alloc(size);
  const got = Buffer.alloc(8);
  return ReadProcessMemory(h, addr, buf, size, got) ? buf : null;
};
const modules = [];
{
  const snap = CreateToolhelp32Snapshot(0x8 | 0x2, PID);
  const me = { dwSize: koffi.sizeof(ME32) };
  for (let ok = Module32FirstW(snap, me); ok; ok = Module32NextW(snap, me)) {
    const name = Buffer.from(me.szModule).toString('utf16le').replace(/\0.*$/, '');
    modules.push({ name, base: Number(me.modBaseAddr), size: Number(me.modBaseSize) });
  }
  CloseHandle(snap);
}
const where = (a) => {
  for (const m of modules) if (a >= m.base && a < m.base + m.size) return `${m.name}+0x${(a - m.base).toString(16)}`;
  return null;
};
const regions = [];
for (let addr = 0x10000; addr < 0x7fff0000;) {
  const b = Buffer.alloc(koffi.sizeof(MBI32));
  if (!VirtualQueryEx(h, addr, b, b.length)) break;
  const m = koffi.decode(b, MBI32);
  if (m.State === 0x1000 && (m.Protect & 0xff) !== 0 && (m.Protect & 0x100) === 0)
    regions.push({ base: m.BaseAddress, size: m.RegionSize, type: m.Type });
  const next = m.BaseAddress + m.RegionSize;
  if (next <= addr) break;
  addr = next;
}
const inPrivate = (p) => regions.some((r) => r.type === 0x20000 && p >= r.base && p < r.base + r.size);

// 读 size_class -> pool idx 表，确定池表真实范围
const btab = rd(BTAB, 326);
let maxIdx = 0;
if (btab) for (let i = 0; i < 326; i++) if (btab[i] > maxIdx) maxIdx = btab[i];
const POOLS = Math.min(256, maxIdx + 8); // 覆盖最大 idx + 尝试链 +2
console.log(`pid=${PID} byte_5EB5C0 max idx=${maxIdx} -> pools=${POOLS} (table ${PC(POOLS * 8)} bytes)`);
function PC(n) { return '0x' + n.toString(16); }

// 池记录解析（一次读整表）
const readTable = () => rd(TABLE, POOLS * 8);
// 池表范围已由 byte_5EB5C0 界定（0..maxIdx+8），越界误报不存在；
// 判据只需：idx 是 4 的倍数（池记录 32 字节步长）+ 尺寸字段合法。
const activePools = (raw) => {
  const out = [];
  for (let k = 0; k < POOLS; k++) {
    const o = k * 8;
    if ((k & 3) !== 0) continue;
    const size = raw.readUInt16LE(o + 2);
    if (size === 0 || size > 0x1000 || size % 8 !== 0) continue;
    out.push({ k, size });
  }
  return out;
};
{
  const raw = readTable();
  const act = raw ? activePools(raw) : [];
  console.log(`active pools: ${act.length}`);
  for (const a of act) {
    const o = a.k * 8;
    const d = [];
    for (let f = 0; f < 32; f += 4) d.push('0x' + raw.readUInt32LE(o + f).toString(16));
    console.log(`  idx=${a.k} size=${a.size} fields=[${d.join(' ')}]`);
  }
}

const threadList = () => {
  const snap = CreateToolhelp32Snapshot(0x4, 0);
  const te = { dwSize: koffi.sizeof(TE32) };
  const out = [];
  for (let ok = Thread32First(snap, te); ok; ok = Thread32Next(snap, te))
    if (Number(te.th32OwnerProcessID) === PID) out.push({ tid: Number(te.th32ThreadID), pri: Number(te.tpBasePri) });
  CloseHandle(snap);
  return out;
};
const DUMPFILE = `C:\\Users\\Lequ\\AppData\\Local\\Temp\\poollock_dump_${Date.now()}.txt`;
const capture = (tag) => {
  const lines = [`==== capture: ${tag} @ ${new Date().toISOString()} ====`];
  const main = FindWindowW('TMainForm', null);
  const out = [0];
  const ok = SendMessageTimeoutW(main, 0, 0, null, 0x8, 200, out);
  lines.push(`main form hung=${!(ok === 0 || ok === 0n)}`);
  const threads = threadList();
  lines.push(`threads: ${threads.length}`);
  for (const t of threads) {
    const ht = OpenThread(0x1F03FF, 0, t.tid);
    if (!ht) { lines.push(`tid=${t.tid} open failed`); continue; }
    Wow64SuspendThread(ht);
    const ctx = { ContextFlags: 0x1003F };
    const okc = Wow64GetThreadContext(ht, ctx);
    if (!okc) { ResumeThread(ht); CloseHandle(ht); lines.push(`tid=${t.tid} ctx failed`); continue; }
    const { Eip, Esp, Ebp, Ebx, Ecx, Edx, Eax } = ctx;
    const thrInMM = Eip >= 0x401800 && Eip < 0x403000;
    lines.push(`\ntid=${t.tid} EIP=0x${Eip.toString(16)} (${where(Eip) ?? '?'})${thrInMM ? ' <<< IN MM CODE' : ''} ESP=0x${Esp.toString(16)} EBP=0x${Ebp.toString(16)}`);
    lines.push(`  EBX=0x${Ebx.toString(16)} ECX=0x${Ecx.toString(16)} EDX=0x${Edx.toString(16)} EAX=0x${Eax.toString(16)}`);
    const sb = rd(Esp, 0x400);
    if (sb) {
      const seen = [];
      for (let i = 0; i + 4 <= 0x400; i += 4) {
        const v = sb.readUInt32LE(i);
        if (v >= 0x400000 && v < 0x800000) { const w = where(v); if (w && !seen.includes(w)) seen.push(w); }
      }
      lines.push(`  stack code ptrs: ${seen.slice(0, 30).join(', ')}`);
    }
    ResumeThread(ht);
    CloseHandle(ht);
  }
  fs.appendFileSync(DUMPFILE, lines.join('\n') + '\n\n', 'ascii');
  console.log(`[capture written to ${DUMPFILE}]`);
  console.log(lines.join('\n'));
};

// 采样主循环
const state = new Map();
const gstate = { streak: 0, start: 0, max: 0 };
let events = 0, anomalies = 0;
const t0 = Date.now();
let ticks = 0;
const actCache = [];
while (Date.now() - t0 < SECONDS * 1000) {
  const raw = readTable();
  ticks++;
  if (!raw) { console.log('read failed'); break; }
  const now = Date.now();
  const act = activePools(raw);
  for (const a of act) {
    const o = a.k * 8;
    const lock = raw[o];
    let st = state.get(a.k);
    if (!st) { st = { streak: 0, maxStreak: 0, maxHold: 0, start: 0, badSeen: 0 }; state.set(a.k, st); }
    if (lock > 1) { // 锁字节被污染（只可能是 0/1）
      st.badSeen++;
      if (st.badSeen === 1 || st.badSeen === CONSEC) {
        anomalies++;
        console.log(`[${((now - t0) / 1000).toFixed(2)}s] POOL LOCK VALUE CORRUPT idx=${a.k} size=${a.size} value=0x${lock.toString(16)} count=${st.badSeen}`);
        if (st.badSeen === 1) capture(`pool idx=${a.k} size=${a.size} lock value=0x${lock.toString(16)}`);
      }
    } else if (lock === 1) {
      st.streak++;
      if (st.streak === 1) st.start = now;
      if (st.streak > st.maxStreak) st.maxStreak = st.streak;
      const hold = now - st.start;
      if (hold > st.maxHold) st.maxHold = hold;
      if (st.streak === CONSEC) {
        events++;
        console.log(`[${((now - t0) / 1000).toFixed(2)}s] POOL STUCK idx=${a.k} size=${a.size} addr=0x${(TABLE + o).toString(16)} held>=${CONSEC} samples`);
        capture(`pool idx=${a.k} size=${a.size} lock held >= ${CONSEC} samples`);
      }
    } else {
      if (st.streak >= CONSEC) console.log(`[${((now - t0) / 1000).toFixed(2)}s] pool idx=${a.k} released after ${st.streak} samples (${now - st.start}ms)`);
      st.streak = 0;
    }
  }
  // 全局锁（中/大块路径）：合法持有可到毫秒级，>1.5s 视为异常
  const gl = rd(GLOBAL_LOCK, 1);
  if (gl && gl[0] !== 0) {
    gstate.streak++;
    if (gstate.streak === 1) gstate.start = now;
    const hold = now - gstate.start;
    if (hold > gstate.max) gstate.max = hold;
    if (hold > 1500 && hold < 1600) {
      anomalies++;
      console.log(`[${((now - t0) / 1000).toFixed(2)}s] GLOBAL LOCK held ${hold}ms (byte=0x${gl[0].toString(16)})`);
      capture(`global lock held ${hold}ms value=0x${gl[0].toString(16)}`);
    }
  } else gstate.streak = 0;
  await new Promise((r) => setTimeout(r, POLL));
}
const rows = [...state.entries()].sort((a, b) => b[1].maxHold - a[1].maxHold);
console.log(`\n=== done: ${ticks} ticks in ${((Date.now() - t0) / 1000).toFixed(1)}s stuck=${events} anomalies=${anomalies} globalMaxHold=${gstate.max}ms ===`);
console.log('pools with observed lock activity (top 20 by maxHold):');
for (const [k, s] of rows.slice(0, 20)) if (s.maxHold > 0) console.log(`  idx=${k} maxStreak=${s.maxStreak} maxHold=${s.maxHold}ms`);
