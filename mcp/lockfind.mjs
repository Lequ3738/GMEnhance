import koffi from 'koffi';
const kernel32 = koffi.load('kernel32.dll');
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const h = OpenProcess(0x1F0FFF, 0, 17324);
const rpm = (addr, n) => { const b = Buffer.alloc(n); const g = Buffer.alloc(8); ReadProcessMemory(h, BigInt(addr), b, n, g); return b; };
const hex = (v) => '0x' + (v >>> 0).toString(16);
// stack-scanned heap candidates (v1/segment-struct pointers)
const cands = [0x2AD9358, 0x57131E0, 0x1DD54E4, 0x37A2D28, 0x3D8CC928, 0x2AD9358];
for (const c of [...new Set(cands)]) {
  const blk = rpm(c - 0x10, 0x40);
  const d = [...Array(16)].map((_, k) => blk.readUInt32LE(k * 4).toString(16));
  console.log(`seg? ${hex(c - 0x10)}..: ${d.join(' ')}`);
  // free code: v4 = *(v1)  where v1 = segment ptr (value scanned). v1 arg of CAS region is the scanned value
  const lockPtr = blk.readUInt32LE(0x10); // *(c)
  if (lockPtr > 0x10000 && lockPtr < 0x7ffe0000) {
    const lk = rpm(lockPtr - 4, 0x30);
    const ld = [...Array(12)].map((_, k) => lk.readUInt32LE(k * 4).toString(16));
    console.log(`  lock=*(seg)=${hex(lockPtr)} region[-4..]: ${ld.join(' ')} byteAtLock=${lk[4]}`);
  }
  console.log('');
}
CloseHandle(h);
