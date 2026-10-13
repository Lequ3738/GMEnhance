// 只读取证：挂起主线程的寄存器 + 它死等的锁字节（GM8 池锁卡死现场）
//   node hang_dump.mjs <pid> <main_tid>
import koffi from 'koffi';

const PID = Number(process.argv[2]);
const MAIN_TID = Number(process.argv[3]);

const FSA = koffi.struct('FSA', {
  ControlWord: 'uint32', StatusWord: 'uint32', TagWord: 'uint32',
  ErrorOffset: 'uint32', ErrorSelector: 'uint32', DataOffset: 'uint32', DataSelector: 'uint32',
  RegisterArea: koffi.array('uint8', 80), Cr0NpxState: 'uint32',
});
const CTX = koffi.struct('CTX', {
  ContextFlags: 'uint32',
  Dr0: 'uint32', Dr1: 'uint32', Dr2: 'uint32', Dr3: 'uint32',
  Dr6: 'uint32', Dr7: 'uint32',
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
if (!h) { console.log('OpenProcess failed'); process.exit(1); }
const rd32 = (addr) => {
  const b = Buffer.alloc(4); const g = Buffer.alloc(8);
  return RPM(h, addr, b, 4, g) ? b.readUInt32LE(0) >>> 0 : null;
};
const rd8 = (addr) => {
  const b = Buffer.alloc(1); const g = Buffer.alloc(8);
  return RPM(h, addr, b, 1, g) ? b[0] : null;
};

// 主线程：先按参数，找不到就取第一个属于本进程的线程（GM8 主线程=最早创建）
let tids = [];
const snap = Snap(0x4, 0);
const te = { dwSize: koffi.sizeof(TE32) };
for (let ok = Thread32First(snap, te); ok; ok = Thread32Next(snap, te))
  if (Number(te.th32OwnerProcessID) === PID) tids.push(Number(te.th32ThreadID));
CloseHandle(snap);
const tid = tids.includes(MAIN_TID) ? MAIN_TID : tids[0];

const ht = OpenThread(0x1F03FF, 0, tid);
const prev = Wow64SuspendThread(ht);
const ctx = { ContextFlags: 0x1003F };
Wow64GetThreadContext(ht, ctx);
ResumeThread(ht);
CloseHandle(ht);

const eax = ctx.Eax >>> 0, ebx = ctx.Ebx >>> 0, ecx = ctx.Ecx >>> 0,
  edx = ctx.Edx >>> 0, esi = ctx.Esi >>> 0, edi = ctx.Edi >>> 0, eip = ctx.Eip >>> 0;
console.log(`tid=${tid} all tids=[${tids.join(',')}]`);
console.log(`EIP=0x${eip.toString(16)} EAX=0x${eax.toString(16)} EBX=0x${ebx.toString(16)} ECX=0x${ecx.toString(16)} EDX=0x${edx.toString(16)} ESI=0x${esi.toString(16)} EDI=0x${edi.toString(16)}`);

// SysFreeMem 自旋循环语义：EBX=池记录指针（锁在 +0），EDX=块头指针，EAX=块指针
const TABLE = 0x5e304c, TABLE_END = TABLE + 216 * 8;
const inTable = ebx >= TABLE && ebx < TABLE_END;
console.log(`\nEBX (lock addr it spins on) = 0x${ebx.toString(16)}  inPoolTable=${inTable}  offsetFromTableStart=0x${(ebx - TABLE).toString(16)}`);
const lockByte = rd8(ebx);
console.log(`lock byte [EBX] = 0x${lockByte === null ? '??' : lockByte.toString(16)}`);
const lockDword = rd32(ebx);
console.log(`dword [EBX] = 0x${lockDword === null ? '??' : lockDword.toString(16)}`);
console.log(`dword [EBX+2] (block size field) = 0x${rd32(ebx + 2) === null ? '??' : '0x' + rd32(ebx + 2).toString(16)}`);
console.log(`\nEDX (block header ptr) = 0x${edx.toString(16)}  dword[EDX]=0x${rd32(edx) === null ? '??' : '0x' + rd32(edx).toString(16)}`);
console.log(`EAX (block ptr) = 0x${eax.toString(16)}  dword[EAX-4]=0x${rd32(eax - 4) === null ? '??' : '0x' + rd32(eax - 4).toString(16)}`);

// 池表全量快照里有没有锁非零的（复核 poolpoison 结论）
let nonzero = [];
for (let k = 0; k < 216; k += 4) {
  const v = rd8(TABLE + k * 8);
  if (v) nonzero.push(`idx=${k} val=0x${v.toString(16)}`);
}
console.log(`\npool table nonzero locks: ${nonzero.length ? nonzero.join(' ') : 'NONE'}`);
const g = rd8(0x5eb718);
console.log(`GLOBAL lock 0x5EB718 = 0x${g.toString(16)}`);
CloseHandle(h);
