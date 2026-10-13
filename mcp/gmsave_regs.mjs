import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 17324);
const kernel32 = koffi.load('kernel32.dll');

const FLOATING_SAVE_AREA = koffi.struct('FSA2', {
  ControlWord: 'uint32', StatusWord: 'uint32', TagWord: 'uint32',
  ErrorOffset: 'uint32', ErrorSelector: 'uint32', DataOffset: 'uint32', DataSelector: 'uint32',
  RegisterArea: koffi.array('uint8', 80), Cr0NpxState: 'uint32',
});
const WOW64_CONTEXT = koffi.struct('WOW64_CONTEXT2', {
  ContextFlags: 'uint32',
  Dr0: 'uint32', Dr1: 'uint32', Dr2: 'uint32', Dr3: 'uint32', Dr6: 'uint32', Dr7: 'uint32',
  FloatSave: FLOATING_SAVE_AREA,
  SegGs: 'uint32', SegFs: 'uint32', SegEs: 'uint32', SegDs: 'uint32',
  Edi: 'uint32', Esi: 'uint32', Ebx: 'uint32', Edx: 'uint32', Ecx: 'uint32', Eax: 'uint32',
  Ebp: 'uint32', Eip: 'uint32', SegCs: 'uint32', EFlags: 'uint32', Esp: 'uint32', SegSs: 'uint32',
  ExtendedRegisters: koffi.array('uint8', 512),
});
const THREADENTRY32 = koffi.struct('THREADENTRY32b', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const Wow64SuspendThread = kernel32.func('__stdcall', 'Wow64SuspendThread', 'uint32', ['void *']);
const ResumeThread = kernel32.func('__stdcall', 'ResumeThread', 'uint32', ['void *']);
const Wow64GetThreadContext = kernel32.func('__stdcall', 'Wow64GetThreadContext', 'int', ['void *', koffi.inout(koffi.pointer(WOW64_CONTEXT))]);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CreateToolhelp32Snapshot = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const tfirst = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const tnext = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);

const hproc = OpenProcess(0x1F0FFF, 0, PID);
const snap = CreateToolhelp32Snapshot(0x4, 0);
const te = { dwSize: koffi.sizeof(THREADENTRY32) };
const tids = [];
for (let ok = tfirst(snap, te); ok; ok = tnext(snap, te))
  if (Number(te.th32OwnerProcessID) === PID) tids.push(Number(te.th32ThreadID));
CloseHandle(snap);

const rpm = (addr, n) => {
  const buf = Buffer.alloc(n); const got = Buffer.alloc(8);
  ReadProcessMemory(hproc, BigInt(addr), buf, n, got);
  return buf;
};
const hex = (v) => '0x' + (v >>> 0).toString(16);

for (const tid of tids) {
  const ht = OpenThread(0x1F03FF, 0, tid);
  if (!ht) continue;
  const prev = Wow64SuspendThread(ht);
  const ctx = { ContextFlags: 0x1003F };
  Wow64GetThreadContext(ht, ctx);
  ResumeThread(ht); CloseHandle(ht);
  console.log(`\n=== tid=${tid} EIP=${hex(ctx.Eip)} Eax=${hex(ctx.Eax)} Ebx=${hex(ctx.Ebx)} Ecx=${hex(ctx.Ecx)} Edx=${hex(ctx.Edx)} Esi=${hex(ctx.Esi)} Edi=${hex(ctx.Edi)} Ebp=${hex(ctx.Ebp)} Esp=${hex(ctx.Esp)}`);
  const stackDump = rpm(ctx.Esp - 0x40, 0xC0);
  const dws = [];
  for (let i = 0; i < stackDump.length; i += 4) dws.push(stackDump.readUInt32LE(i).toString(16));
  console.log('stack@esp-40h:', dws.join(' '));
  if (tid === 9912) {
    // Delphi MM lock object at EBX: +0 lock byte, +4 waiter queue head, +12 cnt, +16 cur waiter
    const lock = rpm(ctx.Ebx, 64);
    const ld = [...Array(16)].map((_, k) => lock.readUInt32LE(k * 4).toString(16));
    console.log(`lock@EBX=${hex(ctx.Ebx)} bytes:`, ld.join(' '), ' lockByte=' + lock[0]);
  }
}
CloseHandle(hproc);
