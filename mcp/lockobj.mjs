import koffi from 'koffi';
const kernel32 = koffi.load('kernel32.dll');
const pid = 17324;
const ReadProcessMemory = kernel32.func('__stdcall', 'ReadProcessMemory', 'int',
  ['void *', 'uintptr', koffi.out(koffi.pointer('uint8')), 'uintptr', koffi.out(koffi.pointer('uintptr'))]);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const h = OpenProcess(0x1F0FFF, 0, pid);
const rpm = (addr, n) => { const b = Buffer.alloc(n); const g = Buffer.alloc(8); ReadProcessMemory(h, BigInt(addr), b, n, g); return b; };
// node on main thread stack: v1=0x19f720; lock object = *(0x19f720)
const v1 = rpm(0x19f720, 4).readUInt32LE(0);
console.log('*0x19f720 (v1) = 0x' + v1.toString(16));
const node = rpm(v1 - 4, 32);
console.log('node-4 dwords:', [...Array(8)].map((_, k) => node.readUInt32LE(k * 4).toString(16)).join(' '));
const lockPtr = node.readUInt32LE(4); // v4 = *(v1) where v1 is node+4? try both
const lockA = rpm(v1, 4).readUInt32LE(0);
console.log('lock obj = 0x' + lockA.toString(16));
const lk = rpm(lockA, 32);
console.log('lock dwords:', [...Array(8)].map((_, k) => lk.readUInt32LE(k * 4).toString(16)).join(' '), 'byte0=' + lk[0]);
// walk waiter queue: head at lock+4 (list head node ptr), nodes: +4 prev? +20 fwd (v1+20 next, v1+4 prev per code)
let head = lk.readUInt32LE(4);
console.log('queue head = 0x' + head.toString(16));
for (let i = 0; i < 6 && head > 0x10000 && head !== lockA; i++) {
  const n = rpm(head, 32);
  const d = [...Array(8)].map((_, k) => n.readUInt32LE(k * 4).toString(16));
  console.log(`waiter@0x${head.toString(16)}:`, d.join(' '));
  head = n.readUInt32LE(20) >>> 0;
}
CloseHandle(h);
