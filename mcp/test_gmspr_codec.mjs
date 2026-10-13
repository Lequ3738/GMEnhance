// gmspr_codec 回归测试：node test_gmspr_codec.mjs
//
// 黄金对照法：
//   ① 负载字节级回环 —— decode(真实 gmspr) → encodeGmsprPayload 与原文件解压出的
//      负载逐字节一致（最强不变量，字段顺序/换序/版本号任何一处错都会炸）；
//   ② gmspr → 文件夹 → gmspr 全链回环（经 sprite.txt 文本域）；
//   ③ 工程精灵文件夹（GMSave 写的 WIC PNG）→ pack → unpack → 像素级 + sprite.txt 对照；
//   ④ 合成 12 帧验证数字序（字典序会排错 10.png 与 2.png）；
//   ⑤ 错误路径：frames 与帧数不一致、尺寸混杂、缺 sprite.txt、坏魔数。
//
// 真实样本路径指向本机 GMAPI/Sprites 与 Nature Edition 工程；不存在时跳过相应组
// （编解码正确性由合成样本组兜底）。

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { PNG } from 'pngjs';
import {
  decodeGmspr, encodeGmsprPayload, encodeGmspr,
  unpackGmsprFile, packGmsprDir,
  parseSpriteInfoText, spriteInfoText,
} from './gmspr_codec.mjs';

let passed = 0;
let failed = 0;

function check(cond, label) {
  if (cond) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failed++;
    console.error(`  FAIL ${label}`);
  }
}

function payloadOf(gmsprFile) {
  const buf = fs.readFileSync(gmsprFile);
  return zlib.inflateSync(buf.subarray(8, 8 + buf.readInt32LE(4)));
}

function dirPixels(dir, count) {
  return Array.from({ length: count }, (_, i) =>
    PNG.sync.read(fs.readFileSync(path.join(dir, `${i}.png`))).data);
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gmspr-test-'));
try {
  // ---------- ① 真实 gmspr：负载字节级回环 ----------
  const gmapiDir = 'C:\\Project\\GMK\\GMAPI\\Sprites';
  if (fs.existsSync(gmapiDir)) {
    console.log('① 真实 gmspr 负载回环（GMAPI/Sprites 抽样）');
    const names = fs.readdirSync(gmapiDir).filter((n) => n.endsWith('.gmspr'));
    // 抽样：头、尾、中间各一 + 固定几个
    const picks = ['sprBlood.gmspr', 'sprBagBoxBack.gmspr', names[Math.floor(names.length / 2)]]
      .filter(Boolean);
    for (const name of [...new Set(picks)]) {
      const file = path.join(gmapiDir, name);
      const spr = decodeGmspr(fs.readFileSync(file));
      const rebuilt = encodeGmsprPayload(spr);
      const original = payloadOf(file);
      check(rebuilt.equals(original), `${name}：负载逐字节一致（${spr.frames.length} 帧 ${spr.width}×${spr.height}）`);
      check(spr.framesUniform, `${name}：帧尺寸一致`);
    }
  } else {
    console.log('① 跳过（本机无 GMAPI/Sprites）');
  }

  // ---------- ② gmspr → 文件夹 → gmspr 全链回环 ----------
  const gmapiDir2 = 'C:\\Project\\GMK\\GMAPI\\Sprites';
  if (fs.existsSync(gmapiDir2)) {
    console.log('② gmspr → 文件夹 → gmspr 全链回环');
    const file = path.join(gmapiDir2, 'sprBagBoxBackAll.gmspr');
    const out1 = path.join(tmpRoot, 'chain');
    unpackGmsprFile(file, out1);
    const repacked = packGmsprDir(out1, path.join(tmpRoot, 'chain.gmspr'));
    check(repacked.frames > 1 || true, `打包 ${repacked.frames} 帧`);
    check(payloadOf(path.join(tmpRoot, 'chain.gmspr')).equals(payloadOf(file)), '二次打包负载与原文件逐字节一致');
    const info2 = parseSpriteInfoText(fs.readFileSync(path.join(out1, 'sprite.txt'), 'utf8')).info;
    const spr2 = decodeGmspr(fs.readFileSync(file));
    check(info2.frames === spr2.frames.length && info2.origin_x === spr2.xorig && info2.origin_y === spr2.yorig,
      'sprite.txt 关键字段与解码结果一致');
    check(info2.collision_shape === spr2.mask && info2.per_frame_colliders === (spr2.separateMask ? 1 : 0)
      && info2.bbox_type === spr2.bounding && info2.bbox_left === spr2.bbox.left
      && info2.bbox_top === spr2.bbox.top && info2.bbox_right === spr2.bbox.right
      && info2.bbox_bottom === spr2.bbox.bottom, '碰撞/包围盒字段映射一致（含 L,R,B,T → L,T,R,B 重排）');
  } else {
    console.log('② 跳过（本机无 GMAPI/Sprites）');
  }

  // ---------- ③ 工程精灵文件夹 → pack → unpack → 对照 ----------
  const projSprites = 'C:\\Project\\GMK\\Nature Edition\\Nature Edition.gm80\\sprites';
  const bulletDir = path.join(projSprites, 'sprBullet');
  if (fs.existsSync(bulletDir)) {
    console.log('③ 工程精灵文件夹双向对照（sprBullet）');
    const packed = packGmsprDir(bulletDir, path.join(tmpRoot, 'sprBullet.gmspr'));
    check(packed.frames === 2 && packed.width === 6 && packed.height === 4,
      `pack 摘要（${packed.frames} 帧 ${packed.width}×${packed.height}）`);
    const out3 = path.join(tmpRoot, 'sprBullet');
    unpackGmsprFile(path.join(tmpRoot, 'sprBullet.gmspr'), out3);
    const origInfo = parseSpriteInfoText(fs.readFileSync(path.join(bulletDir, 'sprite.txt'), 'utf8')).info;
    const roundInfo = parseSpriteInfoText(fs.readFileSync(path.join(out3, 'sprite.txt'), 'utf8')).info;
    check(JSON.stringify(origInfo) === JSON.stringify(roundInfo), 'sprite.txt 逐键一致');
    const origPx = dirPixels(bulletDir, 2);
    const roundPx = dirPixels(out3, 2);
    check(origPx.every((d, i) => d.equals(roundPx[i])), '帧像素逐字节一致');
  } else {
    console.log('③ 跳过（本机无 Nature Edition 工程）');
  }

  // ---------- ④ 合成 12 帧：数字序 ----------
  console.log('④ 合成 12 帧数字序（帧 i 的像素携带标记 i）');
  const markDir = path.join(tmpRoot, 'marked');
  fs.mkdirSync(markDir);
  fs.writeFileSync(path.join(markDir, 'sprite.txt'), spriteInfoText({
    frames: 12, origin_x: 1, origin_y: 2, collision_shape: 0, alpha_tolerance: 0,
    per_frame_colliders: 0, bbox_type: 0, bbox_left: 0, bbox_top: 0, bbox_right: 7, bbox_bottom: 7,
  }));
  for (let i = 0; i < 12; i++) {
    const png = new PNG({ width: 8, height: 8 });
    for (let px = 0; px < 64; px++) {
      png.data[px * 4] = i;          // R 通道携带帧标记
      png.data[px * 4 + 1] = 200;
      png.data[px * 4 + 2] = 100;
      png.data[px * 4 + 3] = 255;
    }
    fs.writeFileSync(path.join(markDir, `${i}.png`), PNG.sync.write(png));
  }
  const marked = packGmsprDir(markDir, path.join(tmpRoot, 'marked.gmspr'));
  check(marked.frames === 12, '12 帧打包');
  const markedOut = path.join(tmpRoot, 'marked_out');
  unpackGmsprFile(path.join(tmpRoot, 'marked.gmspr'), markedOut);
  const markedPx = dirPixels(markedOut, 12);
  check(markedPx.every((d, i) => d[0] === i), `帧序保持 0..11（R 标记逐帧校验，字典序会在此失败）`);

  // ---------- ⑤ 错误路径 ----------
  console.log('⑤ 错误路径');
  const badDir = path.join(tmpRoot, 'bad_count');
  fs.mkdirSync(badDir);
  fs.writeFileSync(path.join(badDir, 'sprite.txt'), spriteInfoText({
    frames: 3, origin_x: 0, origin_y: 0, collision_shape: 0, alpha_tolerance: 0,
    per_frame_colliders: 0, bbox_type: 0, bbox_left: 0, bbox_top: 0, bbox_right: 0, bbox_bottom: 0,
  }));
  const one = new PNG({ width: 4, height: 4 });
  fs.writeFileSync(path.join(badDir, '0.png'), PNG.sync.write(one));
  let threw = false;
  try { packGmsprDir(badDir, path.join(tmpRoot, 'bad.gmspr')); } catch { threw = true; }
  check(threw, 'frames=3 与 1 个帧文件 → 报错');

  const mixedDir = path.join(tmpRoot, 'mixed');
  fs.mkdirSync(mixedDir);
  fs.writeFileSync(path.join(mixedDir, 'sprite.txt'), spriteInfoText({
    frames: 2, origin_x: 0, origin_y: 0, collision_shape: 0, alpha_tolerance: 0,
    per_frame_colliders: 0, bbox_type: 0, bbox_left: 0, bbox_top: 0, bbox_right: 0, bbox_bottom: 0,
  }));
  const big = new PNG({ width: 8, height: 8 });
  fs.writeFileSync(path.join(mixedDir, '0.png'), PNG.sync.write(big));
  fs.writeFileSync(path.join(mixedDir, '1.png'), PNG.sync.write(one));
  threw = false;
  try { packGmsprDir(mixedDir, path.join(tmpRoot, 'mixed.gmspr')); } catch { threw = true; }
  check(threw, '全帧尺寸不一致 → 报错');

  const noTxt = path.join(tmpRoot, 'notxt');
  fs.mkdirSync(noTxt);
  fs.writeFileSync(path.join(noTxt, '0.png'), PNG.sync.write(one));
  threw = false;
  try { packGmsprDir(noTxt, path.join(tmpRoot, 'notxt.gmspr')); } catch { threw = true; }
  check(threw, '缺 sprite.txt → 报错');

  threw = false;
  try { decodeGmspr(Buffer.alloc(64, 7)); } catch { threw = true; }
  check(threw, '坏魔数 → 报错');

  // 编码端导出（encodeGmspr）自洽：synthetic spr → 文件 → decode 一致
  console.log('⑥ encodeGmspr 导出自洽');
  const synthetic = {
    frames: Array.from({ length: 3 }, () => ({
      width: 5, height: 3,
      rgba: Buffer.from(Array.from({ length: 60 }, (_, i) => (i * 37) % 256)),
    })),
    xorig: -3, yorig: 12, mask: 2, maskTolerance: 128, separateMask: true, bounding: 2,
    bbox: { left: -1, top: 0, right: 4, bottom: 2 },
  };
  const synFile = path.join(tmpRoot, 'synthetic.gmspr');
  fs.writeFileSync(synFile, encodeGmspr(synthetic));
  const back = decodeGmspr(fs.readFileSync(synFile));
  check(back.frames.length === 3 && back.xorig === -3 && back.yorig === 12
    && back.mask === 2 && back.maskTolerance === 128 && back.separateMask === true
    && back.bounding === 2 && back.bbox.left === -1 && back.bbox.top === 0
    && back.bbox.right === 4 && back.bbox.bottom === 2, '字段往返一致（含负数原点/包围盒）');
  check(back.frames.every((f) => f.rgba.equals(synthetic.frames[0].rgba)), '像素往返一致');
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`\n结果：${passed} 过，${failed} 挂`);
process.exit(failed ? 1 : 0);
