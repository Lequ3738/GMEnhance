// GM8 模态对话框工具（无人值守配套）：列出 IDE 进程的全部 #32770 对话框
// （标题 + 正文摘要）并对每个对话框点击指定按钮——保存冲突提示、错误框等
// 需要人工答案的弹窗由外部代答。与 server.mjs save 的 code 5 拒绝配套：
// 有模态框时 save 不再叠新框，改由本工具查看并作答。
// 用法: node dlg_tool.mjs         仅列出
//       node dlg_tool.mjs <ID>   对每个对话框点该按钮
//                                （1=OK 2=取消 6=是 7=否）
import koffi from 'koffi';
const user32 = koffi.load('user32.dll');
const FindWindowW = user32.func('__stdcall', 'FindWindowW', 'void *', ['str16', 'str16']);
const FindWindowExW = user32.func('__stdcall', 'FindWindowExW', 'void *',
  ['void *', 'void *', 'str16', 'str16']);
const GetWindowThreadProcessId = user32.func('__stdcall', 'GetWindowThreadProcessId', 'uint32',
  ['void *', koffi.out(koffi.pointer('uint32'))]);
const GetWindowTextW = user32.func('__stdcall', 'GetWindowTextW', 'int',
  ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const GetClassNameW = user32.func('__stdcall', 'GetClassNameW', 'int',
  ['void *', koffi.out(koffi.pointer('uint16')), 'int']);
const GetDlgItem = user32.func('__stdcall', 'GetDlgItem', 'void *', ['void *', 'int']);
const SendMessageW = user32.func('__stdcall', 'SendMessageW', 'intptr',
  ['void *', 'uint32', 'uintptr', 'intptr']);
const IsWindowVisible = user32.func('__stdcall', 'IsWindowVisible', 'int', ['void *']);

function text(h, fn, len) {
  const buf = Buffer.alloc(len * 2);
  const n = fn(h, buf, len);
  return n > 0 ? buf.toString('utf16le', 0, n * 2) : '';
}

const main = FindWindowW('TMainForm', null);
if (!main) { console.log('no TMainForm'); process.exit(1); }
const pid = Buffer.alloc(4); GetWindowThreadProcessId(main, pid);
const mainPid = pid.readUInt32LE(0);

const btn = process.argv[2] ? Number(process.argv[2]) : null;
const found = [];
for (let h = FindWindowExW(null, null, null, null); h; h = FindWindowExW(null, h, null, null)) {
  const p = Buffer.alloc(4); GetWindowThreadProcessId(h, p);
  if (p.readUInt32LE(0) !== mainPid) continue;
  if (text(h, GetClassNameW, 64) !== '#32770') continue;
  const title = text(h, GetWindowTextW, 256);
  const body = text(GetDlgItem(h, 0xFFFF), GetWindowTextW, 512); // static text
  const entry = { h: String(koffi.address(h)), title, body: body.slice(0, 60), vis: !!IsWindowVisible(h) };
  if (btn != null) {
    const b = GetDlgItem(h, btn);
    if (b) { SendMessageW(b, 0x00f5 /*BM_CLICK*/, 0, 0); entry.clicked = btn; }
  }
  found.push(entry);
}
console.log(JSON.stringify({ count: found.length, dialogs: found }, null, 2));
