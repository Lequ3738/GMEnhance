import koffi from 'koffi';
import fs from 'node:fs';

const PID = Number(process.argv[2] ?? 17324);
const ROUNDS = Number(process.argv[3] ?? 20);
const PROBE = 'C:\\Project\\GMK\\Nature Edition\\Nature Edition.gm80\\scripts\\argb_get_alpha.gml';

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');
const FindWindowExW = user32.func('__stdcall', 'FindWindowExW', 'void *', ['void *', 'void *', 'str16', 'str16']);
const FindWindowW = user32.func('__stdcall', 'FindWindowW', 'void *', ['str16', 'str16']);
const PostMessageW = user32.func('__stdcall', 'PostMessageW', 'int', ['void *', 'uint32', 'uint32', 'void *']);
const RegisterWindowMessageW = user32.func('__stdcall', 'RegisterWindowMessageW', 'uint32', ['str16']);
const SendMessageTimeoutW = user32.func('__stdcall', 'SendMessageTimeoutW', 'uintptr',
  ['void *', 'uint32', 'uintptr', 'void *', 'uint32', 'uint32', koffi.out(koffi.pointer('uintptr'))]);
const SendMessageW = user32.func('__stdcall', 'SendMessageW', 'intptr', ['void *', 'uint32', 'uintptr', 'intptr']);
const GetWindowTextW = user32.func('__stdcall', 'GetWindowTextW', 'int', ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const GetGuiResources = user32.func('__stdcall', 'GetGuiResources', 'uint32', ['void *', 'uint32']);
const OpenProcess = kernel32.func('__stdcall', 'OpenProcess', 'void *', ['uint32', 'uint32', 'uint32']);
const OpenFileMappingW = kernel32.func('__stdcall', 'OpenFileMappingW', 'void *', ['uint32', 'uint32', 'str16']);
const MapViewOfFile = kernel32.func('__stdcall', 'MapViewOfFile', 'void *', ['void *', 'uint32', 'uint32', 'uint32', 'uintptr']);
const UnmapViewOfFile = kernel32.func('__stdcall', 'UnmapViewOfFile', 'int', ['void *']);
const CloseHandle = kernel32.func('__stdcall', 'CloseHandle', 'int', ['void *']);
const MSG = RegisterWindowMessageW('GMSave.ForceSync');

const hproc = OpenProcess(0x1F0FFF, 0, PID);
const watcher = FindWindowExW(null, null, 'GMSave.Watcher', null);
const main = FindWindowW('TMainForm', null);
if (!watcher || !main) { console.log('watcher or main form not found', !!watcher, !!main); process.exit(1); }
const hmap = OpenFileMappingW(0xF003F, 0, `Local\\GMSave.SyncStatus.${PID}`);
const view = hmap ? MapViewOfFile(hmap, 0x4, 0, 0, 0) : null;
console.log('hmap', hmap, 'view', view);
const GM_SYNC_BLOCK = koffi.struct('GM_SYNC_BLOCK', { magic: 'uint32', reqId: 'uint32', status: 'uint32', detail: 'uint32' });
const blk = () => { const b = koffi.decode(view, GM_SYNC_BLOCK); return { req: b.reqId, status: b.status }; };

const origSize = fs.statSync(PROBE).size;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const winTitle = (h) => { const b = Buffer.alloc(512); GetWindowTextW(h, b, 256); return b.toString('utf16le').replace(/\0.*$/, ''); };
const hung = () => {
  const out = [0];
  const ok = SendMessageTimeoutW(main, 0, 0, null, 0x8, 150, out); // SMTO_ABORTIFHUNG, WM_NULL
  return ok === 0n || ok === 0;
};
const SendMessageTimeoutW2 = user32.func('__stdcall', 'SendMessageTimeoutW', 'uintptr',
  ['void *', 'uint32', 'uintptr', 'void *', 'uint32', 'uint32', koffi.out(koffi.pointer('uintptr'))]);
const progress = () => {
  const pf = FindWindowExW(null, null, 'TProgressForm', null);
  if (!pf) return null;
  const pb = FindWindowExW(pf, null, 'TProgressBar', null) || FindWindowExW(pf, null, 'msctls_progress32', null);
  let pos = -1;
  if (pb) {
    const out = [0];
    const ok = SendMessageTimeoutW2(pb, 0x0408, 0, null, 0x8, 150, out); // PBM_GETPOS, abort if hung
    if (ok !== 0n && ok !== 0) pos = Number(out[0]);
  }
  return { title: winTitle(pf), pos };
};
const gdi = () => GetGuiResources(hproc, 0);

let hungTotal = 0;
const durs = [];
for (let round = 1; round <= ROUNDS; round++) {
  const append = round % 2 === 1;
  if (append) fs.appendFileSync(PROBE, '\r\n// syncprobe\r\n');
  else fs.truncateSync(PROBE, origSize);
  const { req } = blk();
  const myReq = (req + 1) >>> 0;
  if (!PostMessageW(watcher, MSG, myReq, null)) { console.log('post failed'); break; }
  const t0 = Date.now();
  let hungRounds = 0, hungSeen = false, progSeen = [];
  while (Date.now() - t0 < 90000) {
    await sleep(100);
    const b = blk();
    if (Date.now() - t0 > 300 && Date.now() - t0 < 5000) { /* sampling window */ }
    if (hung()) { hungRounds++; hungSeen = true; }
    const p = progress();
    if (p) progSeen.push(`${p.title}|bar=${p.pos}`);
    if (b.req === myReq) {
      const dur = Date.now() - t0;
      durs.push(dur);
      hungTotal += hungSeen ? 1 : 0;
      const gs = gdi();
      console.log(`round ${round} ${append ? '+' : '-'} dur=${dur}ms status=${b.status} hung=${hungSeen}(${hungRounds}) gdi=${gs} prog=[${progSeen.slice(0, 3).join(' ; ')}${progSeen.length > 3 ? ' ...' : ''}]`);
      break;
    }
    if (Date.now() - t0 > 90000) {
      console.log(`round ${round} TIMEOUT hung=${hungSeen} — IDE assumed dead, stopping`);
      fs.truncateSync(PROBE, origSize);
      process.exit(2);
    }
  }
}
fs.truncateSync(PROBE, origSize);
console.log('done. durations(ms):', durs.join(', '), 'hungRounds:', hungTotal);
