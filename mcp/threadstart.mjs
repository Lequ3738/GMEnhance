import koffi from 'koffi';
const ntdll = koffi.load('ntdll.dll');
const kernel32 = koffi.load('kernel32.dll');
const NtQueryInformationThread = ntdll.func('__stdcall', 'NtQueryInformationThread', 'int',
  ['void *', 'uint32', koffi.out(koffi.pointer('uint8')), 'uint32', koffi.out(koffi.pointer('uint32'))]);
const OpenThread = kernel32.func('__stdcall', 'OpenThread', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
for (const tid of [9912, 14660, 18972]) {
  const ht = OpenThread(0x1F03FF, 0, tid);
  if (!ht) { console.log(`tid=${tid} open failed`); continue; }
  const buf = Buffer.alloc(8);
  const ret = Buffer.alloc(4);
  const st = NtQueryInformationThread(ht, 9, buf, 8, ret); // ThreadQuerySetWin32StartAddress
  const start = buf.readUInt32LE(0);
  console.log(`tid=${tid} start=0x${start.toString(16)} status=${st}`);
  CloseHandle(ht);
}
