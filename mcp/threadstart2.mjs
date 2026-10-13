import koffi from 'koffi';
const ntdll = koffi.load('ntdll.dll');
const kernel32 = koffi.load('kernel32.dll');
const NtQueryInformationThread = ntdll.func('__stdcall', 'NtQueryInformationThread', 'int',
  ['void *', 'uint32', koffi.out(koffi.pointer('uint8')), 'uint32', koffi.out(koffi.pointer('uint32'))]);
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const THREADENTRY32 = koffi.struct('THREADENTRY32c', {
  dwSize: 'uint32', cntUsage: 'uint32', th32ThreadID: 'uint32', th32OwnerProcessID: 'uint32',
  tpBasePri: 'int32', tpDeltaPri: 'int32', dwFlags: 'uint32',
});
const snap = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const tfirst = kernel32.func('__stdcall', 'Thread32First', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const tnext = kernel32.func('__stdcall', 'Thread32Next', 'int', ['void *', koffi.inout(koffi.pointer(THREADENTRY32))]);
const CloseHandle2 = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const pid = Number(process.argv[2] ?? 7440);
const tsnap = snap(0x4, 0);
const te = { dwSize: koffi.sizeof(THREADENTRY32) };
const tids = [];
for (let ok = tfirst(tsnap, te); ok; ok = tnext(tsnap, te))
  if (Number(te.th32OwnerProcessID) === pid) tids.push(Number(te.th32ThreadID));
CloseHandle(tsnap);
console.log(`pid=${pid} threads=${tids.length}`);
for (const tid of tids) {
  const ht = OpenThread(0x1F03FF, 0, tid);
  const buf = Buffer.alloc(8), ret = Buffer.alloc(4);
  NtQueryInformationThread(ht, 9, buf, 8, ret);
  console.log(`tid=${tid} start=0x${buf.readUInt32LE(0).toString(16)}`);
  CloseHandle(ht);
}
