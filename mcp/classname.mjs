import koffi from 'koffi';
const kernel32 = koffi.load('kernel32.dll');
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const h = OpenProcess(0x1F0FFF, 0, 17324);
const rpm = (addr, n) => { const b = Buffer.alloc(n); const g = Buffer.alloc(8); ReadProcessMemory(h, BigInt(addr), b, n, g); return b; };
for (const obj of [0x2ac4fc0, 0x2ac8540]) {
  const head = rpm(obj - 0x10, 0x40);
  const d = [...Array(16)].map((_, k) => head.readUInt32LE(k * 4).toString(16));
  console.log(`obj ${obj.toString(16)} [-10h..30h]: ${d.join(' ')}`);
  const vmt = head.readUInt32LE(0x10); // +0 of object
  const namePtrSlot = rpm(vmt - 0x14, 4).readUInt32LE(0);
  const name = rpm(namePtrSlot - 4, 64);
  const len = name.readInt32LE(0);
  const s = name.toString('latin1', 4, 4 + Math.min(len, 40));
  console.log(`  vmt=${vmt.toString(16)} className="${s}" (len=${len})`);
}
CloseHandle(h);
