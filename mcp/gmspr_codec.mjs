// gmspr ↔ gm80 精灵文件夹互转编解码（纯文件操作，不依赖 IDE / 游戏进程）。
//
// 格式两端权威：
//   gmspr 二进制读端 = GMGraphic 仓库 Librarys/load_resources.cpp 的 decode_gmspr
//   （运行时图集打包走它）；sprite.txt 文本端 = GMSave 仓库 gm80_save.cpp save_sprite /
//   gm80_load.cpp（.gm80 文本工程的写读端）。两侧字段一一对应，转换无损。
//
// gmspr 布局（int32 小端）：
//   magic=1234321 ｜ 压缩负载长度 ｜ zlib 负载：
//     版本号=800 ｜ xorig ｜ yorig ｜ 帧数
//     帧数 × { 版本号=800 ｜ 宽 ｜ 高 ｜ 帧字节数 ｜ BGRA 裸像素 }
//     碰撞形状 ｜ alpha 容差 ｜ 逐帧碰撞(bool) ｜ 包围盒类型
//     ｜ bbox_left ｜ bbox_right ｜ bbox_bottom ｜ bbox_top   ← 二进制顺序 L,R,B,T
//
// 精灵文件夹布局（GMSave 同构）：sprite.txt（key=value，LF，末尾换行，键序与
// save_sprite 一致）+ 0.png、1.png…（%u 十进制不补零）。帧序必须按数字序读取，
// 字典序会把 10.png 排到 2.png 前面。

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { PNG } from 'pngjs';

const GMSPR_MAGIC = 1234321;  // GM 资源魔数（与 .gmk 同源）
const GMSPR_VERSION = 800;    // GM 8.0 序列化版本号，文件头与每帧块各一个
const MAX_FRAMES = 65535;     // 防御损坏文件导致巨量分配；GMSave 侧写上限 10000

export const MASK_KINDS = ['precise', 'rectangle', 'disk', 'diamond'];
export const BOUNDING_KINDS = ['automatic', 'full_image', 'user'];

// ---------- 基础读写 ----------

class Reader {
  constructor(buf, what) {
    this.buf = buf;
    this.pos = 0;
    this.what = what;
  }
  fail(msg) {
    throw new Error(`${this.what}损坏：${msg}（偏移 ${this.pos}，共 ${this.buf.length} 字节）`);
  }
  i32(name) {
    if (this.pos + 4 > this.buf.length) this.fail(`${name} 越界`);
    const v = this.buf.readInt32LE(this.pos);
    this.pos += 4;
    return v;
  }
  take(n, name) {
    if (n < 0 || this.pos + n > this.buf.length) this.fail(`${name} 需要 ${n} 字节，越界`);
    const b = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }
  get left() {
    return this.buf.length - this.pos;
  }
}

class Writer {
  constructor() {
    this.chunks = [];
    this.tmp = Buffer.alloc(4);
  }
  i32(v) {
    this.tmp.writeInt32LE(v | 0, 0);
    this.chunks.push(Buffer.from(this.tmp));
    return this;
  }
  bytes(b) {
    this.chunks.push(b);
    return this;
  }
  done() {
    return Buffer.concat(this.chunks);
  }
}

function checkI32(v, name) {
  if (!Number.isInteger(v) || v < -0x80000000 || v > 0x7fffffff)
    throw new Error(`${name} 超出 int32 范围：${v}`);
}

function swapBR(data) {
  // BGRA ↔ RGBA 原地换序（gmspr 帧是 D3D 字节序，PNG 是 RGBA）
  for (let i = 0; i < data.length; i += 4) {
    const b = data[i];
    data[i] = data[i + 2];
    data[i + 2] = b;
  }
  return data;
}

// ---------- gmspr 编解码 ----------

export function decodeGmspr(buf) {
  const r = new Reader(buf, 'gmspr 文件');
  if (r.i32('魔数') !== GMSPR_MAGIC)
    throw new Error('不是 gmspr 文件：魔数不匹配（期望 1234321，GM 资源魔数）');
  const compressed = r.take(r.i32('压缩负载长度'), '压缩负载');
  let payload;
  try {
    payload = zlib.inflateSync(compressed);
  } catch (e) {
    throw new Error(`zlib 解压失败：${e.message}`);
  }

  const p = new Reader(payload, 'gmspr 负载');
  if (p.i32('版本号') !== GMSPR_VERSION)
    throw new Error('gmspr 版本号不是 800（仅支持 GM 8.0 格式）');
  const xorig = p.i32('origin_x');
  const yorig = p.i32('origin_y');
  const count = p.i32('帧数');
  if (count <= 0) throw new Error('gmspr 不含任何帧');
  if (count > MAX_FRAMES) throw new Error(`帧数 ${count} 超过防御上限 ${MAX_FRAMES}，文件疑似损坏`);

  const frames = [];
  for (let i = 0; i < count; i++) {
    if (p.i32('帧版本号') !== GMSPR_VERSION)
      throw new Error(`第 ${i} 帧版本号不是 800`);
    const w = p.i32('帧宽');
    const h = p.i32('帧高');
    const size = p.i32('帧字节数');
    if (w <= 0 || h <= 0) throw new Error(`第 ${i} 帧尺寸非法：${w}×${h}`);
    if (size !== w * h * 4)
      throw new Error(`第 ${i} 帧字节数 ${size} ≠ 宽×高×4（${w * h * 4}），像素布局不受支持`);
    frames.push({ width: w, height: h, rgba: swapBR(Buffer.from(p.take(size, '帧像素'))) });
  }

  const mask = p.i32('碰撞形状');
  if (mask < 0 || mask >= MASK_KINDS.length) throw new Error(`碰撞形状枚举非法：${mask}`);
  const maskTolerance = p.i32('alpha 容差');
  if (maskTolerance < 0 || maskTolerance > 255) throw new Error(`alpha 容差越界：${maskTolerance}`);
  const separateMask = p.i32('逐帧碰撞') !== 0;
  const bounding = p.i32('包围盒类型');
  if (bounding < 0 || bounding >= BOUNDING_KINDS.length) throw new Error(`包围盒类型枚举非法：${bounding}`);
  // 二进制字段顺序 L,R,B,T（读端权威）；对外的结构统一为 L,T,R,B
  const bboxLeft = p.i32('bbox_left');
  const bboxRight = p.i32('bbox_right');
  const bboxBottom = p.i32('bbox_bottom');
  const bboxTop = p.i32('bbox_top');

  const last = frames[frames.length - 1];
  return {
    frames,
    xorig,
    yorig,
    mask,
    maskTolerance,
    separateMask,
    bounding,
    bbox: { left: bboxLeft, top: bboxTop, right: bboxRight, bottom: bboxBottom },
    width: last.width,
    height: last.height,
    framesUniform: frames.every((f) => f.width === last.width && f.height === last.height),
  };
}

// 组装未压缩负载（与 decode 逐字段互逆）；导出供回环测试做字节级对照
export function encodeGmsprPayload(spr) {
  const frames = spr.frames;
  if (!frames || !frames.length) throw new Error('至少需要一帧');
  const last = frames[frames.length - 1];
  if (!frames.every((f) => f.width === last.width && f.height === last.height))
    throw new Error(`各帧尺寸不一致（GM8 精灵全帧同尺寸，见 ${frames.map((f) => `${f.width}x${f.height}`).join(', ')}）`);
  checkI32(spr.xorig, 'origin_x');
  checkI32(spr.yorig, 'origin_y');
  checkI32(spr.bbox.left, 'bbox_left');
  checkI32(spr.bbox.top, 'bbox_top');
  checkI32(spr.bbox.right, 'bbox_right');
  checkI32(spr.bbox.bottom, 'bbox_bottom');

  const w = new Writer();
  w.i32(GMSPR_VERSION).i32(spr.xorig).i32(spr.yorig).i32(frames.length);
  for (const f of frames) {
    if (f.rgba.length !== f.width * f.height * 4)
      throw new Error(`帧像素数据长度 ${f.rgba.length} ≠ ${f.width}×${f.height}×4`);
    w.i32(GMSPR_VERSION).i32(f.width).i32(f.height).i32(f.rgba.length)
      .bytes(swapBR(Buffer.from(f.rgba)));
  }
  w.i32(spr.mask).i32(spr.maskTolerance)
    .i32(spr.separateMask ? 1 : 0)
    .i32(spr.bounding)
    // 二进制顺序 L,R,B,T
    .i32(spr.bbox.left).i32(spr.bbox.right).i32(spr.bbox.bottom).i32(spr.bbox.top);
  return w.done();
}

export function encodeGmspr(spr) {
  const compressed = zlib.deflateSync(encodeGmsprPayload(spr));
  const w = new Writer();
  w.i32(GMSPR_MAGIC).i32(compressed.length).bytes(compressed);
  return w.done();
}

// ---------- sprite.txt（GMSave 工程文本格式） ----------

// 键序与 GMSave save_sprite 完全一致；末尾换行
export function spriteInfoText(info) {
  const keys = ['frames', 'origin_x', 'origin_y', 'collision_shape', 'alpha_tolerance',
    'per_frame_colliders', 'bbox_type', 'bbox_left', 'bbox_top', 'bbox_right', 'bbox_bottom'];
  let t = '';
  for (const k of keys) t += `${k}=${info[k]}\n`;
  return t;
}

export function parseSpriteInfoText(text) {
  const info = {
    frames: null, origin_x: 0, origin_y: 0, collision_shape: 0, alpha_tolerance: 0,
    per_frame_colliders: 0, bbox_type: 0, bbox_left: 0, bbox_top: 0, bbox_right: 0, bbox_bottom: 0,
  };
  const warnings = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const eq = line.indexOf('=');
    if (eq < 0) {
      warnings.push(`sprite.txt：忽略无法解析的行「${line}」`);
      continue;
    }
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (!(k in info)) {
      warnings.push(`sprite.txt：忽略未知键「${k}」`);
      continue;
    }
    const n = Number(v);
    if (!Number.isInteger(n)) {
      warnings.push(`sprite.txt：键 ${k} 的值「${v}」不是整数，按 0 处理`);
      continue;
    }
    info[k] = n;
  }
  if (info.frames === null) throw new Error('sprite.txt 缺少 frames 键（不是有效的 gm80 精灵文件夹？）');
  return { info, warnings };
}

// ---------- 文件夹 ↔ gmspr ----------

function assertWritable(outPath, overwrite) {
  if (fs.existsSync(outPath) && !overwrite)
    throw new Error(`目标已存在：${outPath}（传 overwrite=true 覆盖）`);
}

function decodeFromFile(file) {
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    throw new Error(`读不了 ${file}：${e.message}`);
  }
  return decodeGmspr(buf);
}

// gmspr → 精灵文件夹：<outDir>/0.png… + sprite.txt（逐像素忠实导出，
// 不做空白裁剪与颜色膨胀——那是图集打包的运行时加工，不属于格式转换）
export function unpackGmsprFile(file, outDir, { overwrite = false } = {}) {
  file = path.resolve(file);
  outDir = path.resolve(outDir ?? path.join(path.dirname(file), path.basename(file, path.extname(file))));
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length && !overwrite)
    throw new Error(`目标文件夹已存在且非空：${outDir}（传 overwrite=true 覆盖）`);

  const spr = decodeFromFile(file);
  fs.mkdirSync(outDir, { recursive: true });
  const png = new PNG();
  for (let i = 0; i < spr.frames.length; i++) {
    const f = spr.frames[i];
    png.width = f.width;
    png.height = f.height;
    png.data = f.rgba;
    fs.writeFileSync(path.join(outDir, `${i}.png`), PNG.sync.write(png));
  }
  const info = {
    frames: spr.frames.length,
    origin_x: spr.xorig,
    origin_y: spr.yorig,
    collision_shape: spr.mask,
    alpha_tolerance: spr.maskTolerance,
    per_frame_colliders: spr.separateMask ? 1 : 0,
    bbox_type: spr.bounding,
    bbox_left: spr.bbox.left,
    bbox_top: spr.bbox.top,
    bbox_right: spr.bbox.right,
    bbox_bottom: spr.bbox.bottom,
  };
  fs.writeFileSync(path.join(outDir, 'sprite.txt'), spriteInfoText(info), 'utf8');

  return {
    ok: true,
    mode: 'unpack',
    file,
    dir: outDir,
    frames: spr.frames.length,
    width: spr.width,
    height: spr.height,
    frames_uniform: spr.framesUniform,
    ...info,
    collision_shape_name: MASK_KINDS[spr.mask],
    bbox_type_name: BOUNDING_KINDS[spr.bounding],
  };
}

// 精灵文件夹 → gmspr：仅认 N.png（%u 十进制），按数字序取帧
export function packGmsprDir(dir, outFile, { overwrite = false } = {}) {
  dir = path.resolve(dir);
  const txtPath = path.join(dir, 'sprite.txt');
  if (!fs.existsSync(txtPath))
    throw new Error(`文件夹里没有 sprite.txt：${dir}（不是 gm80 精灵文件夹布局）`);
  outFile = path.resolve(outFile ?? path.join(path.dirname(dir), path.basename(dir) + '.gmspr'));
  assertWritable(outFile, overwrite);

  const { info, warnings } = parseSpriteInfoText(fs.readFileSync(txtPath, 'utf8'));

  const entries = fs.readdirSync(dir)
    .map((name) => /^(\d+)\.png$/.exec(name))
    .filter(Boolean)
    .map((m) => ({ index: Number(m[1]), name: m[0] }))
    .sort((a, b) => a.index - b.index);  // 数字序；字典序会排错 10.png 与 2.png
  if (!entries.length) throw new Error(`文件夹里没有任何 N.png 帧：${dir}`);
  const indexes = entries.map((e) => e.index);
  if (indexes.some((v, i) => v !== i))
    warnings.push(`帧编号不连续（${indexes.join(',')}），打包后按现存帧从 0 重排`);

  if (info.frames !== entries.length)
    throw new Error(`sprite.txt 的 frames=${info.frames} 与帧文件数 ${entries.length} 不一致（修正 sprite.txt 或清理多余/缺失的 N.png）`);
  if (info.alpha_tolerance < 0 || info.alpha_tolerance > 255)
    throw new Error(`alpha_tolerance=${info.alpha_tolerance} 越界（0-255）`);
  if (info.collision_shape < 0 || info.collision_shape >= MASK_KINDS.length)
    throw new Error(`collision_shape=${info.collision_shape} 非法（0=precise 1=rectangle 2=disk 3=diamond）`);
  if (info.bbox_type < 0 || info.bbox_type >= BOUNDING_KINDS.length)
    throw new Error(`bbox_type=${info.bbox_type} 非法（0=automatic 1=full_image 2=user）`);

  const frames = entries.map(({ name }) => {
    let png;
    try {
      png = PNG.sync.read(fs.readFileSync(path.join(dir, name)));
    } catch (e) {
      throw new Error(`读帧 ${name} 失败：${e.message}`);
    }
    return { width: png.width, height: png.height, rgba: Buffer.from(png.data) };
  });

  const spr = {
    frames,
    xorig: info.origin_x,
    yorig: info.origin_y,
    mask: info.collision_shape,
    maskTolerance: info.alpha_tolerance,
    separateMask: info.per_frame_colliders !== 0,
    bounding: info.bbox_type,
    bbox: { left: info.bbox_left, top: info.bbox_top, right: info.bbox_right, bottom: info.bbox_bottom },
  };
  const out = encodeGmspr(spr);
  fs.writeFileSync(outFile, out);

  return {
    ok: true,
    mode: 'pack',
    dir,
    file: outFile,
    frames: frames.length,
    width: frames[0].width,
    height: frames[0].height,
    file_bytes: out.length,
    origin_x: spr.xorig,
    origin_y: spr.yorig,
    collision_shape: spr.mask,
    collision_shape_name: MASK_KINDS[spr.mask],
    bbox_type: spr.bounding,
    bbox_type_name: BOUNDING_KINDS[spr.bounding],
    ...(warnings.length ? { warnings } : {}),
  };
}
