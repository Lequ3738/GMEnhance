// 只读取证 2：主线程栈扫描（找原始坏指针 P 与块头值踪迹）+ 其余线程活跃度两次采样
//   node hang_stack_scan.mjs <pid> <main_tid>
import koffi from 'koffi';

const PID = Number(process.argv[2]);
const MAIN_TID = Number(process.argv[3]);
const HDR = 0x0BFF72B0; // 已知的块头指针值（进入自旋时 EDX）

const FSA = koffi.struct('FSA', {
  ControlWord: 'uint32', StatusWord: 'uint32', TagWord: 'uint32',
  ErrorOffset: 'uint32', ErrorSelector: 'uint32', DataOffset: 'uint32', DataSelector: 'uint32',
  RegisterArea: koffi.array('uint8', 80), Cr0NpxState: 'uint32',
});
const CTX = koffi.struct('CTX', {
  ContextFlags: 'uint32',
  Dr0: 'uint32', Dr1: 'uint32', Dr2: 'uint32', Dr3: 'uint32', Dr6: 'uint32', Dr7: 'uint32',
  FloatSave: FSA,
  SegGs: 'uint32', SegFs: 'uint32', SegEs: 'uint32', SegDs: 'uint32',
  Edi: 'uint32', Esi: 'uint32', Ebx: 'uint32', Edx: 'uint32', Ecx: 'uint32', Eax: 'uint32',
  Ebp: 'uint32', Eip: 'uint32', SegCs: 'uint32', EFlags: 'uint32', Esp: 'uint32', SegSs: 'uint32',
  ExtendedRegisters: koffi.array('uint8', 512),
});
const TE32 = koffi.struct('TE32', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const kernel32 = koffi.load('kernel32.dll');
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const Wow64SuspendThread = kernel32.func('__stdcall', 'Wow64SuspendThread', 'uint32', ['void *']);
const ResumeThread = kernel32.func('__stdcall', 'ResumeThread', 'uint32', ['void *']);
const Wow64GetThreadContext = kernel32.func('__stdcall', 'Wow64GetThreadContext', 'int', ['void *', koffi.inout(koffi.pointer(CTX))]);
const RPM = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const Snap = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const Thread32First = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(TE32))]);
const Thread32Next = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(TE32))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);

const h = OpenProcess(0x1F0FFF, 0, PID);
const getCtx = (tid) => {
  const ht = OpenThread(0x1F03FF, 0, tid);
  Wow64SuspendThread(ht);
  const c = { ContextFlags: 0x1003F };
  Wow64GetThreadContext(ht, c);
  ResumeThread(ht); CloseHandle(ht);
  return c;
};
const dumpStack = (c, n) => {
  const buf = Buffer.alloc(n * 4); const g = Buffer.alloc(8);
  if (!RPM(h, c.Esp, buf, n * 4, g)) return null;
  const a = []; for (let i = 0; i < n; i++) a.push(buf.readUInt32LE(i * 4) >>> 0);
  return a;
};

let tids = [];
const snap = Snap(0x4, 0);
const te = { dwSize: koffi.sizeof(TE32) };
for (let ok = Thread32First(snap, te); ok; ok = Thread32Next(snap, te))
  if (Number(te.th32OwnerProcessID) === PID) tids.push(Number(te.th32ThreadID));
CloseHandle(snap);

// 1) 主线程栈扫描
const main = getCtx(MAIN_TID);
const st = dumpStack(main, 0x300);
console.log(`main stack ESP=0x${main.Esp.toString(16)} (0x300 dwords)`);
st.forEach((v, i) => {
  if (v === HDR) console.log(`  [esp+${i * 4}] = 0x${v.toString(16)}  <-- 块头指针 HDR`);
});
// 栈上 0x0BFFxxxx / 0x0BFxxxxx 段的堆地址（坏块头邻域）
const hex = (v) => v.toString(16);
console.log('stack values in 0x0b000000-0x0c000000 range:');
st.forEach((v, i) => {
  if (v >= 0x0a000000 && v < 0x10000000) console.log(`  [esp+0x${(i * 4).toString(16)}] = 0x${hex(v)}`);
});

// 2) 其余线程两次采样（间隔 1.5s），看 EIP 是否变化（= 活跃）
const others = tids.filter(t => t !== MAIN_TID);
console.log(`\nother threads: [${others.join(',')}] — two samples 1.5s apart`);
const s1 = others.map(t => { const c = getCtx(t); return { t, eip: c.Eip >>> 0, esp: c.Esp >>> 0 }; });
await new Promise(r => setTimeout(r, 1500));
const s2 = others.map(t => { const c = getCtx(t); return { t, eip: c.Eip >>> 0, esp: c.Esp >>> 0 }; });
for (let i = 0; i < s1.length; i++) {
  const moved = s1[i].eip !== s2[i].eip || s1[i].esp !== s2[i].esp;
  console.log(`tid=${s1[i].t}: eip 0x${s1[i].eip.toString(16)} -> 0x${s2[i].eip.toString(16)} esp 0x${s1[i].esp.toString(16)} -> 0x${s2[i].esp.toString(16)}  ${moved ? 'ACTIVE' : 'idle'}`);
}
CloseHandle(h);
