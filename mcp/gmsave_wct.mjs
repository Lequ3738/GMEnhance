import koffi from 'koffi';

const PID = Number(process.argv[2] ?? 17324);
const advapi32 = koffi.load('advapi32.dll');
const kernel32 = koffi.load('kernel32.dll');
const OpenThreadWaitChainSession = advapi32.func('__stdcall', 'OpenThreadWaitChainSession', 'void *', ['uint32', 'void *']);
const CloseThreadWaitChainSession = advapi32.func('__stdcall', 'CloseThreadWaitChainSession', 'void', ['void *']);
const GetThreadWaitChain = advapi32.func('__stdcall', 'GetThreadWaitChain', 'int',
  ['void *', 'void *', 'uint32', 'uint32', koffi.out(koffi.pointer('uint32')), koffi.out(koffi.pointer('uint8')), koffi.out(koffi.pointer('uint32'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const hproc = OpenProcess(0x1F0FFF, 0, PID);

const session = OpenThreadWaitChainSession(0, null);
const TYPES = { 1: 'Process', 2: 'Thread', 3: 'CriticalSection', 4: 'SendMessage', 5: 'Mutex', 6: 'ALPC', 7: 'LPC', 8: 'Socket', 9: 'Rundown', 10: 'COM', 11: 'COMDispatch', 12: 'Unknown' };
const STATUS = { 0: 'Running', 1: 'Blocked', 2: 'NotInTable', 3: 'LegacyMapi', 4: 'RpcImpersonating', 5: 'SvcSharedSegment', 6: 'YieldLoop', 7: 'ATEReturn', 8: 'ATGRunning', 9: 'ATGBlocked', 10: 'ATGAbort', 11: 'SvcPrivRpc', 12: 'Undefined' };

// threads of pid
const THREADENTRY32 = koffi.struct('THREADENTRY32', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const snap = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const tfirst = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const tnext = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const tsnap = snap(0x4, 0);
const te = { dwSize: koffi.sizeof(THREADENTRY32) };
const tids = [];
for (let ok = tfirst(tsnap, te); ok; ok = tnext(tsnap, te))
  if (Number(te.th32OwnerProcessID) === PID) tids.push(Number(te.th32ThreadID));
CloseHandle(tsnap);

for (const tid of tids) {
  const countBuf = Buffer.alloc(4);
  const nodes = Buffer.alloc(16 * 64);
  const cycleBuf = Buffer.alloc(4);
  // WCT_OUT_OF_PROC_FLAG = 1 (64-bit walker over a 32-bit target)
  const ok = GetThreadWaitChain(session, null, 1, tid, countBuf, nodes, cycleBuf);
  if (!ok) { console.log(`tid=${tid}: GetThreadWaitChain failed err=${koffi.GetLastError?.() ?? '?'}`); continue; }
  const count = countBuf.readUInt32LE(0);
  const cycle = cycleBuf.readUInt32LE(0);
  console.log(`tid=${tid} chain (${count} nodes) cycle=${cycle}:`);
  for (let i = 0; i < Math.min(count, 16); i++) {
    const n = nodes.subarray(i * 64, i * 64 + 64);
    const type = n.readUInt32LE(0), status = n.readUInt32LE(4);
    // union at +8: THREADENTRY32-like: dwSize@0, cntUsage@4, th32ThreadID@8, th32OwnerProcessID@12
    const t32 = n.readUInt32LE(8 + 8); // th32ThreadID (union+8)
    const owner = n.readUInt32LE(8 + 12); // th32OwnerProcessID
    const dwords = [...Array(6)].map((_, k) => n.readUInt32LE(8 + k * 4).toString(16));
    console.log(`  [${i}] type=${TYPES[type] ?? type} status=${STATUS[status] ?? status} dwords=[${dwords.join(',')}]${type === 2 ? ` (tid=${t32} pid=${owner})` : ''}`);
  }
}
CloseThreadWaitChainSession(session);
CloseHandle(hproc);
