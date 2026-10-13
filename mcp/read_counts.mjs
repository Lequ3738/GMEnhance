import koffi from 'koffi';
const kernel32 = koffi.load('kernel32.dll');
const pid = Number(process.argv[2] ?? 17324);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const MODULEENTRY32W = koffi.struct('MODULEENTRY32W', {
  dwSize: 'uint32', th32ModuleID: 'uint32', th32ProcessID: 'uint32', GlblcntUsage: 'uint32',
  ProccntUsage: 'uint32', modBaseAddr: 'uintptr', modBaseSize: 'uint32', hModule: 'uintptr',
  szModule: koffi.array('uint16', 256), szExePath: koffi.array('uint16', 260),
});
const snap = kernel32.func('__stdcall', 'CreateToolhelp32Snapshot', 'void *', ['uint32', 'uint32']);
const first = kernel32.func('__stdcall', 'Module32FirstW', 'int', ['void *', koffi.inout(koffi.pointer(MODULEENTRY32W))]);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const h = OpenProcess(0x1F0FFF, 0, pid);
if (!h) { console.log('OpenProcess failed'); process.exit(1); }
const msnap = snap(0x8 | 0x10, pid);
const me = { dwSize: koffi.sizeof(MODULEENTRY32W) };
let base = 0n;
if (first(msnap, me)) base = BigInt(me.modBaseAddr);
CloseHandle(msnap);
console.log('exe base=0x' + base.toString(16));
const rd = (rva) => {
  const ptrBuf = Buffer.alloc(4), nBuf = Buffer.alloc(8);
  if (!ReadProcessMemory(h, base + BigInt(rva), ptrBuf, 4, nBuf)) return -1;
  return ptrBuf.readUInt32LE(0);
};
const names = {
  sprites: 0x1E911C, sounds: 0x1E9288, backgrounds: 0x1E90A8, paths: 0x1E92BC,
  scripts: 0x1E92E4, fonts: 0x1E92D0, timelines: 0x1E9310, objects: 0x1E9364, rooms: 0x1E92A4,
};
for (const [k, rva] of Object.entries(names)) console.log(k.padEnd(12), rd(rva));
CloseHandle(h);
