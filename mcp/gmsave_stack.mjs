import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 17324);
const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

const FLOATING_SAVE_AREA = koffi.struct('FSA', {
  ControlWord: 'uint32', StatusWord: 'uint32', TagWord: 'uint32',
  ErrorOffset: 'uint32', ErrorSelector: 'uint32', DataOffset: 'uint32', DataSelector: 'uint32',
  RegisterArea: koffi.array('uint8', 80), Cr0NpxState: 'uint32',
});
const WOW64_CONTEXT = koffi.struct('WOW64_CONTEXT', {
  ContextFlags: 'uint32',
  Dr0: 'uint32', Dr1: 'uint32', Dr2: 'uint32', Dr3: 'uint32', Dr6: 'uint32', Dr7: 'uint32',
  FloatSave: FLOATING_SAVE_AREA,
  SegGs: 'uint32', SegFs: 'uint32', SegEs: 'uint32', SegDs: 'uint32',
  Edi: 'uint32', Esi: 'uint32', Ebx: 'uint32', Edx: 'uint32', Ecx: 'uint32', Eax: 'uint32',
  Ebp: 'uint32', Eip: 'uint32', SegCs: 'uint32', EFlags: 'uint32', Esp: 'uint32', SegSs: 'uint32',
  ExtendedRegisters: koffi.array('uint8', 512),
});
const THREADENTRY32 = koffi.struct('THREADENTRY32', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const MODULEENTRY32W = koffi.struct('MODULEENTRY32W', {
  dwSize: 'uint32', th32ModuleID: 'uint32', th32ProcessID: 'uint32', GlblcntUsage: 'uint32',
  ProccntUsage: 'uint32', modBaseAddr: 'uintptr', modBaseSize: 'uint32', hModule: 'uintptr',
  szModule: koffi.array('uint16', 256), szExePath: koffi.array('uint16', 260),
});

const CreateToolhelp32Snapshot = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const Thread32First = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const Thread32Next = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const Module32FirstW = kernel32.func('__stdcall', 'Module32FirstW', 'int', ['void *', koffi.inout(koffi.pointer(MODULEENTRY32W))]);
const Module32NextW = kernel32.func('__stdcall', 'Module32NextW', 'int', ['void *', koffi.inout(koffi.pointer(MODULEENTRY32W))]);
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const Wow64SuspendThread = kernel32.func('__stdcall', 'Wow64SuspendThread', 'uint32', ['void *']);
const ResumeThread = kernel32.func('__stdcall', 'ResumeThread', 'uint32', ['void *']);
const Wow64GetThreadContext = kernel32.func('__stdcall', 'Wow64GetThreadContext', 'int', ['void *', koffi.inout(koffi.pointer(WOW64_CONTEXT))]);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);

const hproc = OpenProcess(0x1F0FFF, 0, PID);
// module map
const mods = [];
const msnap = CreateToolhelp32Snapshot(0x8 | 0x10, PID);
const me = { dwSize: koffi.sizeof(MODULEENTRY32W) };
for (let ok = Module32FirstW(msnap, me); ok; ok = Module32NextW(msnap, me)) {
  mods.push({
    name: Buffer.from(Uint16Array.from(me.szModule).filter(c => c)).toString('utf8'),
    base: BigInt(me.modBaseAddr), size: Number(me.modBaseSize),
  });
}
CloseHandle(msnap);
const where = (addr) => {
  for (const m of mods) if (addr >= m.base && addr < m.base + BigInt(m.size))
    return `${m.name}+0x${(addr - m.base).toString(16)}`;
  return null;
};
console.log(mods.filter(m => ['Game_Maker.exe', 'GMSave.dll'].includes(m.name))
  .map(m => `${m.name} base=0x${m.base.toString(16)} size=0x${m.size.toString(16)}`).join('\n'));

const snap = CreateToolhelp32Snapshot(0x4, 0); // TH32CS_SNAPTHREAD
const te = { dwSize: koffi.sizeof(THREADENTRY32) };
const threads = [];
for (let ok = Thread32First(snap, te); ok; ok = Thread32Next(snap, te))
  if (Number(te.th32OwnerProcessID) === PID)
    threads.push({ tid: Number(te.th32ThreadID), pri: Number(te.tpBasePri) });
CloseHandle(snap);
console.log(`threads: ${threads.length}`);

for (const t of threads) {
  const ht = OpenThread(0x1F03FF, 0, t.tid);
  if (!ht) { console.log(`tid=${t.tid} open failed`); continue; }
  const prev = Wow64SuspendThread(ht);
  const ctx = { ContextFlags: 0x1003F }; // i386 full
  let ok = Wow64GetThreadContext(ht, ctx);
  if (!ok) { ResumeThread(ht); CloseHandle(ht); console.log(`tid=${t.tid} ctx failed`); continue; }
  const eip = BigInt(ctx.Eip), esp = BigInt(ctx.Esp), ebp = BigInt(ctx.Ebp);
  // dump 0x140 dwords from esp
  const stack = [];
  const N = 0x140;
  const buf = Buffer.alloc(N * 4);
  const nb = Buffer.alloc(8);;
  ReadProcessMemory(hproc, esp, buf, N * 4, nb);
  for (let i = 0; i < N; i++) stack.push(buf.readUInt32LE(i * 4));
  // walk EBP chain (up to 32 frames) + flat scan for code pointers
  const chain = [];
  let fp = Number(ebp);
  const espN = Number(esp);
  for (let i = 0; i < 32 && fp > 0x10000; i++) {
    const idx = (fp - espN) / 4;
    if (idx < 0 || idx + 1 >= N) break;
    const ret = stack[idx + 1];
    const w = where(BigInt(ret >>> 0));
    if (w) chain.push(`  ${i}: ret=0x${(ret >>> 0).toString(16)} (${w})`);
    const next = stack[idx];
    if (next === undefined) break;
    fp = next >>> 0;
  }
  const flat = [];
  for (const v of stack) {
    const w = where(BigInt(v >>> 0));
    if (w && !flat.includes(w)) flat.push(w);
  }
  console.log(`\n=== tid=${t.tid} pri=${t.pri} EIP=0x${eip.toString(16)} (${where(eip) ?? 'unknown'}) ESP=0x${esp.toString(16)} EBP=0x${ebp.toString(16)}`);
  console.log('ebp chain:\n' + (chain.join('\n') || '  (none)'));
  console.log('flat code ptrs (first 25): ' + flat.slice(0, 25).join(', '));
  ResumeThread(ht);
  CloseHandle(ht);
}
CloseHandle(hproc);
