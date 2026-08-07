// 「黒ひげ危機一発」の付属剣を手続き生成する共有ビルダー。
// 月に刺さっている剣(Swords.tsx / InstancedMesh)も、自分のヒーロー剣
// (StabSword.tsx)も、降ってくる剣の演出も、ぜんぶここから作る。
//
// TOMY公式パーツ写真の実測にもとづく、実物の剣の特徴:
//   ・刃も鍔も柄も柄頭も「ぜんぶ同じ色の1色成型プラスチック」(刃だけ銀にしない)
//   ・幅の広い木の葉のような刃。先端は尖点ではなく丸い鼻(安全基準で丸められている)
//   ・鍔は細長いバーの両端に丸いボス
//   ・握りは細い円柱ではなく、刃とほぼ同幅の平たい板に「はしご状の溝」
//   ・柄頭は球ではなく、平たく開いた三つ葉の板
//   ・つやのある、少し安っぽくてかわいいプラスチックの照り
//
// ローカル座標の約束:
//   原点 = 月面への刺さり口 / +Y = 柄の方向 / 刃先は -Y(月の中)へ伸びる
//   scale = 1 が「月に刺さっている剣」の大きさ(月面から出る高さ = EXPOSED_H)

import * as THREE from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CHARMS,
  CHARM_VISIBLE_MAX,
  SWORD_COLORS,
  SWORD_SKINS,
} from "@/lib/config";
import { hashString, mulberry32, randRange } from "@/lib/prng";
import { makeCharmGeometry } from "./charmGeometry";

// ── 寸法 ────────────────────────────────────────────
// TOMYの公式パーツ写真をピクセル計測した実測比率に合わせてある(全長=100%):
//   刃の長さ 44% / 刃の幅 : 刃の長さ = 0.55 / 鍔の幅 = 刃の幅の1.6倍
//
// いちばん大事なのは「実物は刃も握りも柄頭も同じ厚みの平たい1枚の板」だという
// こと。だから安く成型できるし、あの独特のシルエットになる。これを
// 「細い板 + 細い円柱 + 上に乗った球」で作ると、剣ではなく待ち針に見える。

/**
 * 月面から出る高さ。全景の密度がこの値で決まる。
 * 木の葉の刃と平たい握りにしたぶん1本あたりの面積が増えるので、高さは
 * 大きめに詰めてある(0.7181 → 0.53)。月を埋めるのは高さではなく面積なので、
 * 正面シルエットの実面積で -17% になるところを狙っている。
 * これで1000本刺さっても剣が数えられる(= 潰れて面にならない)。
 */
const EXPOSED_H = 0.53;

// 鍔: 細長いバーの両端に丸いボス。実測の「刃幅の1.6倍」がそのまま外端になる
const GUARD_HALF_L = 0.138; // 鍔の半分の長さ(= 外端)
const GUARD_BOSS_R = 0.031; // 端の丸いボスの半径
const GUARD_BAR_HALF_H = 0.022; // 中央のバーの半分の高さ
const GUARD_HALF_H = GUARD_BOSS_R; // 鍔の高さの半分(いちばん高いのはボス)
const GUARD_THICK = 0.062; // 鍔だけ少し厚くして、部品として立たせる

// 握り: 円柱ではなく、刃とほぼ同じ幅の平たい板。はしご状の溝が入る
const GRIP_LEN = 0.245;
const GRIP_HALF_W = 0.082;
const GRIP_THICK = 0.046;
const GRIP_RIB_THICK = 0.06; // はしごの桟はひと回り厚い
const GRIP_NOTCH = 0.014; // 溝で細くなる量(輪郭にもはしごを出す)

// 柄頭: 球ではなく、平たく開いた三つ葉の板(球はRPGの短剣の記号で、玩具ではない)
const POMMEL_H = 0.094;
const POMMEL_HALF_W = 0.086;
const POMMEL_LOBE_R = 0.032; // 三つ葉ひと粒の半径
const POMMEL_THICK = 0.046;
const POMMEL_SINK = 0.008; // 握りへ少しめり込ませて、浮いて見せない

/** 柄まわり(鍔+握り+柄頭)の高さ */
const HILT_H = GUARD_HALF_H * 2 + GRIP_LEN + POMMEL_H - POMMEL_SINK;

// 実測比率 刃44% : 柄56% から刃の寸法を出す(数字をいじっても比率が崩れない)
const BLADE_LEN = (HILT_H * 44) / 56;
const BLADE_HALF_W = (BLADE_LEN * 0.55) / 2; // 刃の幅 = 刃の長さの0.55倍 = 木の葉
const BLADE_THICK = 0.04;

const BLADE_TOP = EXPOSED_H - HILT_H; // 月面から出ている刃の長さ
const BLADE_BURY = BLADE_LEN - BLADE_TOP; // 原点より下(月の中)に埋まる長さ
const GUARD_Y = BLADE_TOP + GUARD_HALF_H; // 鍔の中心の高さ
const GRIP_Y = GUARD_Y + GUARD_HALF_H; // 握りのはじまり
const POMMEL_Y = GRIP_Y + GRIP_LEN - POMMEL_SINK; // 三つ葉板の付け根
const TOP_Y = POMMEL_Y + POMMEL_H; // = EXPOSED_H

/** チャームをぶら下げる点(鍔の端の下面)。刃に重ならないよう外側へ寄せてある */
const CHARM_ANCHOR = new THREE.Vector3(
  GUARD_HALF_L - 0.004,
  BLADE_TOP, // 鍔の下面ちょうど。浮かせない
  0
);

/** 他のモジュールから位置合わせに使う寸法 */
export const SWORD_DIMS = {
  /** 刃の全長 */
  bladeLen: BLADE_LEN,
  /** 原点より下に埋まる刃の長さ(= 刺さりきったときの剣先の深さ) */
  bury: BLADE_BURY,
  /** 鍔の中心の高さ */
  guardY: GUARD_Y,
  /** 鍔の半分の長さ */
  guardHalf: GUARD_HALF_L,
  /** 柄頭のてっぺん = 刺さった剣が月面から出る高さ */
  top: TOP_Y,
  /** チャームのぶら下げ点 */
  charmAnchor: CHARM_ANCHOR,
} as const;

/** 形の細かさ。月に並ぶ1000本は "field"、近くで見る剣は "hero" */
export type SwordQuality = "field" | "hero";

// ── ジオメトリ ──────────────────────────────────────

/** 数値の組から Shape(閉じた輪郭)を作る */
function shapeFrom(xy: number[][]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(xy[0][0], xy[0][1]);
  for (let i = 1; i < xy.length; i++) s.lineTo(xy[i][0], xy[i][1]);
  s.closePath();
  return s;
}

/** 平たい輪郭を押し出す(実物は全部が同じ板なので、部品はぜんぶこれで作る) */
function extrudePlate(
  shape: THREE.Shape | THREE.Shape[],
  thick: number,
  bevel: number,
  bevelSegments = 1,
  curveSegments = 2
): THREE.BufferGeometry {
  const depth = thick - bevel * 2;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  geo.translate(0, 0, -depth / 2); // 板の中心を z=0 に
  return geo;
}

/**
 * 刃の輪郭。先端からの位置 u(0=剣先, 1=鍔ぎわ)と、いちばん広いところを1と
 * した半幅 h。実測の「幅 : 長さ = 0.55」を、細い板ではなく木の葉にする表。
 * 先端は幅0の尖点にしない — 実物は安全基準のために丸い鼻へ変えられている。
 */
const BLADE_PROFILE: number[][] = [
  [0.0, 0.13], // 丸い鼻
  [0.015, 0.31],
  [0.035, 0.45],
  [0.065, 0.575],
  [0.105, 0.69],
  [0.155, 0.79],
  [0.225, 0.88],
  [0.32, 0.955],
  [0.43, 0.995],
  [0.55, 1.0], // いちばん広いところ
  [0.68, 0.975],
  [0.83, 0.91],
  [1.0, 0.76], // 鍔ぎわ
];

/** 刃。平たく幅の広い木の葉。面取りが成型プラスチックの角のハイライトになる */
function makeBlade(q: SwordQuality): THREE.BufferGeometry {
  // 遠景はひとつ飛ばしでサンプルする(表はひとつなので形は崩れない)
  const rows =
    q === "hero" ? BLADE_PROFILE : BLADE_PROFILE.filter((_, i) => i % 2 === 0);
  const tip = -BLADE_BURY;
  const right: number[][] = [];
  const left: number[][] = [];
  for (const [u, h] of rows) {
    const y = tip + BLADE_LEN * u;
    const x = BLADE_HALF_W * h;
    right.push([x, y]);
    left.push([-x, y]);
  }
  // 右を剣先→鍔、左を鍔→剣先とつなぐと閉じた木の葉になる
  return extrudePlate(
    shapeFrom([...right, ...left.reverse()]),
    BLADE_THICK,
    0.006,
    q === "hero" ? 2 : 1,
    1
  );
}

/** 鍔。細長いバーの両端に丸いボス。実物のいちばん分かりやすい目印 */
function makeGuard(q: SwordQuality): THREE.BufferGeometry {
  const r = GUARD_BOSS_R;
  const hy = GUARD_BAR_HALF_H;
  const cx = GUARD_HALF_L - r; // ボスの中心
  const bx = cx + Math.sqrt(r * r - hy * hy); // バーがボスから出る位置
  const a = Math.asin(hy / r);
  const shape = new THREE.Shape();
  shape.moveTo(-bx, -hy);
  shape.lineTo(bx, -hy);
  shape.absarc(cx, 0, r, -a, a, false); // 右のボス
  shape.lineTo(-bx, hy);
  shape.absarc(-cx, 0, r, Math.PI - a, Math.PI + a, false); // 左のボス
  shape.closePath();
  const geo = extrudePlate(
    shape,
    GUARD_THICK,
    q === "hero" ? 0.005 : 0,
    1,
    q === "hero" ? 8 : 4
  );
  geo.translate(0, GUARD_Y, 0);
  return geo;
}

/** はしごの桟の割りつけ(輪郭の溝と、盛り上げる桟で同じ数値を使う) */
function gripLadder(q: SwordQuality) {
  const n = q === "hero" ? 5 : 3; // 溝の数(実物は5〜6本)
  const rib = GRIP_LEN / (n + 1 + n * 0.42); // 桟の高さ
  return { n, rib, gap: rib * 0.42 };
}

/**
 * 握り。細い円柱ではなく、刃とほぼ同じ幅の平たい板。
 * 左右の輪郭を段々に刻んで、遠景でも「はしご」が silhouette に出るようにする
 * (ここが無いと、実物でいちばん目立つ溝が消えてただの棒になる)。
 */
function makeGrip(q: SwordQuality): THREE.BufferGeometry {
  const { n, rib, gap } = gripLadder(q);
  const w = GRIP_HALF_W;
  const wn = w - GRIP_NOTCH;
  const right: number[][] = [];
  let y = GRIP_Y;
  right.push([w, y]);
  for (let i = 0; i < n; i++) {
    y += rib;
    right.push([w, y], [wn, y], [wn, y + gap]);
    y += gap;
    right.push([w, y]);
  }
  right.push([w, GRIP_Y + GRIP_LEN]);
  const left = right.map(([x, yy]) => [-x, yy]);
  return extrudePlate(
    shapeFrom([...right, ...left.reverse()]),
    GRIP_THICK,
    q === "hero" ? 0.004 : 0,
    1,
    1
  );
}

/** はしごの桟を板の表裏へ盛り上げる(近くで見る剣だけ) */
function makeGripRibs(q: SwordQuality): THREE.BufferGeometry | null {
  if (q !== "hero") return null;
  const { n, rib, gap } = gripLadder(q);
  const w = GRIP_HALF_W - 0.012;
  const shapes: THREE.Shape[] = [];
  let y = GRIP_Y;
  for (let i = 0; i <= n; i++) {
    const y0 = y + rib * 0.18;
    const y1 = y + rib * 0.82;
    shapes.push(
      shapeFrom([
        [-w, y0],
        [w, y0],
        [w, y1],
        [-w, y1],
      ])
    );
    y += rib + gap;
  }
  return extrudePlate(shapes, GRIP_RIB_THICK, 0.004, 1, 1);
}

/**
 * 柄頭。実物は球でも円盤でもなく「平たく開いた三つ葉の板」で、
 * これが玩具の剣の記号になっている(球にすると待ち針・画鋲に見える)。
 * 3つの円の上側の包絡線を走査して、重なった三つ葉の輪郭を作る。
 */
function makePommel(q: SwordQuality): THREE.BufferGeometry {
  const r = POMMEL_LOBE_R;
  const w = POMMEL_HALF_W;
  const cy = POMMEL_Y + (POMMEL_H - r); // 三つ葉の中心の高さ
  const cxs = [-(w - r), 0, w - r];
  const N = q === "hero" ? 22 : 11;
  const pts: number[][] = [];
  // 付け根: 握り幅から左右へ開く
  pts.push([-w, cy]);
  pts.push([-w, POMMEL_Y + 0.026]);
  pts.push([-GRIP_HALF_W * 0.8, POMMEL_Y]);
  pts.push([GRIP_HALF_W * 0.8, POMMEL_Y]);
  pts.push([w, POMMEL_Y + 0.026]);
  pts.push([w, cy]);
  // 上側: 3つの円のうち、いちばん高いものを拾っていく
  for (let i = 1; i < N; i++) {
    const x = w - (2 * w * i) / N;
    let top = cy;
    for (const cx of cxs) {
      const d = Math.abs(x - cx);
      if (d < r) top = Math.max(top, cy + Math.sqrt(r * r - d * d));
    }
    pts.push([x, top]);
  }
  return extrudePlate(
    shapeFrom(pts),
    POMMEL_THICK,
    q === "hero" ? 0.004 : 0,
    1,
    1
  );
}

/**
 * 剣1本ぶんのジオメトリ。1色成型なので刃も柄もひとつに結合できる
 * (= InstancedMesh 1本で剣まるごとを描ける)。
 */
export function makeToySwordGeometry(
  quality: SwordQuality = "hero"
): THREE.BufferGeometry {
  // ExtrudeGeometry は非インデックスなので、結合前にインデックス化しておく
  const ribs = makeGripRibs(quality);
  const parts = [
    makeBlade(quality),
    makeGuard(quality),
    makeGrip(quality),
    makePommel(quality),
    ...(ribs ? [ribs] : []),
  ].map((g) => {
    const indexed = mergeVertices(g, 1e-5);
    if (indexed !== g) g.dispose();
    return indexed;
  });
  const merged = mergeGeometries(parts);
  if (!merged) return parts[0]; // 結合できない構成にはしていないが、念のため
  parts.forEach((p) => p.dispose());
  return merged;
}

/**
 * 月に刺さっている剣ぶんの、簡略化したチャーム表現。
 * 1000本ぶん3個ずつ揺らすと重いので、鍔の下の小さなビーズ1個にまとめる。
 * 剣とおなじインスタンス行列をそのまま使えるよう、位置を焼き込んである。
 */
export function makeCharmBeadGeometry(): THREE.BufferGeometry {
  // 玉だけだと1000個が剣から離れて宙に浮いて見えるので、鍔の下面へ
  // 小さな輪(短い軸)で必ずつなぐ。輪は鍔にめり込ませて隙間をゼロにする。
  const link = new THREE.CylinderGeometry(0.007, 0.007, 0.03, 4);
  link.translate(CHARM_ANCHOR.x, CHARM_ANCHOR.y - 0.012, CHARM_ANCHOR.z);
  const bead = new THREE.SphereGeometry(0.028, 6, 4);
  bead.translate(CHARM_ANCHOR.x, CHARM_ANCHOR.y - 0.048, CHARM_ANCHOR.z);
  const merged = mergeGeometries([link, bead]);
  if (!merged) return bead;
  link.dispose();
  bead.dispose();
  return merged;
}

// ── マテリアル ──────────────────────────────────────

/** にじいろ: 法線と視線のなす角で色相を回す(見る角度で色が動く) */
const IRIDESCENT_CHUNK = /* glsl */ `
	{
		vec3 iriView = normalize( vViewPosition );
		float iriEdge = 1.0 - abs( dot( normalize( normal ), iriView ) );
		float iriHue = fract( iriEdge * 1.15 + uIriTime * 0.045 );
		vec3 iriColor = 0.5 + 0.5 * cos( 6.28318 * ( iriHue + vec3( 0.0, 0.33, 0.67 ) ) );
		diffuseColor.rgb = mix( diffuseColor.rgb, iriColor, 0.92 );
	}
`;

/**
 * 暗い宇宙でも色が沈まないように、自分の色をそのまま少し自発光させる。
 * material.emissive ではなく diffuseColor から作るのがミソで、
 * こうするとインスタンスごとに違う色でも自発光の色がちゃんと追従する。
 */
const SELF_EMISSIVE_CHUNK = /* glsl */ `
	totalEmissiveRadiance += diffuseColor.rgb * uSwordEmissive;
`;

/** スキンとプレイヤーの色から、実際に塗る色を決める */
export function swordHexOf(skinIndex: number, colorIndex: number): string {
  const skin = SWORD_SKINS[skinIndex] ?? SWORD_SKINS[0];
  if (!skin.tinted) return skin.hex;
  return (SWORD_COLORS[colorIndex] ?? SWORD_COLORS[0]).hex;
}

/**
 * スキンに対応した剣のマテリアル。
 * @param skinIndex SWORD_SKINS の index
 * @param hex 塗る色。InstancedMesh で instanceColor を使う場合は "#ffffff" を渡す
 */
export function makeSwordMaterial(
  skinIndex: number,
  hex: string
): THREE.MeshPhysicalMaterial {
  const skin = SWORD_SKINS[skinIndex] ?? SWORD_SKINS[0];
  // このシーンには環境マップが無いので metalness=1 の面は真っ黒になる。
  // 「玩具の金属色」として読める範囲まで金属感を落とし、そのぶん自発光で起こす
  const metalness = Math.min(skin.metalness, 0.6);
  const emissiveK = Math.max(skin.emissive, skin.metalness * 0.28);

  const mat = new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness,
    roughness: skin.roughness,
    // 成型プラスチックの「つるん」としたハイライト。金属スキンでは弱める
    clearcoat: THREE.MathUtils.lerp(1, 0.25, skin.metalness),
    clearcoatRoughness: 0.04 + skin.roughness * 0.12,
    transparent: skin.opacity < 1,
    opacity: skin.opacity,
    // 半透明でもインスタンス同士は前後にソートできないので、深度は書いて
    // チラつきを防ぐ(自分の裏側が透けないだけで、月は透けて見える)
    depthWrite: true,
    emissive: 0x000000, // 自発光は下の onBeforeCompile で「自分の色」から作る
  });

  const uSwordEmissive = { value: emissiveK };
  const uIriTime = { value: 0 };
  if (skin.iridescent) mat.userData.iriTime = uIriTime;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSwordEmissive = uSwordEmissive;
    if (skin.iridescent) shader.uniforms.uIriTime = uIriTime;
    shader.fragmentShader =
      `uniform float uSwordEmissive;\n` +
      (skin.iridescent ? `uniform float uIriTime;\n` : "") +
      shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        // normal と diffuseColor が両方そろっている場所へ差し込む
        `#include <normal_fragment_maps>\n` +
          (skin.iridescent ? IRIDESCENT_CHUNK : "") +
          SELF_EMISSIVE_CHUNK
      );
  };
  // 差し込む中身がスキンで変わるので、プログラムキャッシュを分ける
  mat.customProgramCacheKey = () =>
    `toy-sword-${skin.iridescent ? "iri" : "solid"}`;

  return mat;
}

/** にじいろの色相をすすめる(毎フレーム呼ぶ)。他のスキンでは何もしない */
export function tickSwordMaterial(mat: THREE.Material, t: number): void {
  const u = mat.userData.iriTime as { value: number } | undefined;
  if (u) u.value = t;
}

// ── 刺さり姿勢(全プレイヤーで同じ見た目にする決定的な傾き) ────────

const UP = new THREE.Vector3(0, 1, 0);
const _poseEuler = new THREE.Euler();
const _poseQuat = new THREE.Quaternion();

/**
 * 穴の法線と holeId から、その穴に刺さる剣のワールド姿勢を組み立てる。
 * 傾き(2〜6°)・ロール・大きさは holeId から決定的に決まるので、
 * だれの画面でも同じ剣が同じ向きで刺さって見える。
 * @returns 大きさの個体差(0.92〜1.08)
 */
export function orientSword(
  normal: THREE.Vector3,
  holeId: number,
  outQuat: THREE.Quaternion
): number {
  outQuat.setFromUnitVectors(UP, normal);
  const rng = mulberry32(hashString(`sword-${holeId}`));
  const tilt = THREE.MathUtils.degToRad(randRange(rng, 2, 6));
  const tiltDir = randRange(rng, 0, Math.PI * 2);
  const roll = randRange(rng, 0, Math.PI * 2);
  _poseEuler.set(Math.cos(tiltDir) * tilt, roll, Math.sin(tiltDir) * tilt, "YXZ");
  _poseQuat.setFromEuler(_poseEuler);
  outQuat.multiply(_poseQuat);
  return randRange(rng, 0.92, 1.08);
}

// ── 剣1本(Mesh版) ──────────────────────────────────

export interface ToySwordOptions {
  /** SWORD_COLORS の index(tinted なスキンのときだけ効く) */
  color: number;
  /** SWORD_SKINS の index */
  skin: number;
  /** 持っているチャームの数。新しい方から CHARM_VISIBLE_MAX 個をぶら下げる */
  charm: number;
  /** 1 = 月に刺さっている剣と同じ大きさ */
  scale?: number;
  /** 形の細かさ(既定 hero: 単体の剣は近くで見られる) */
  quality?: SwordQuality;
}

export interface ToySword {
  /** シーンに置くルート。位置・向き・大きさは呼び出し側が自由に動かしてよい */
  root: THREE.Group;
  /** opts.scale を持つ内側のグループ。剣ローカルで飾りを足したいとき用 */
  body: THREE.Group;
  /** 毎フレーム呼ぶ(チャームの揺れ・にじいろの更新用)。t = 経過秒 */
  update: (t: number) => void;
  dispose: () => void;
}

// チャームは鍔の端から、キーホルダーのように束ねてぶら下げる。
// 落差は「輪に通っている」ように見える範囲でだけ変える(離れると浮いて見える)。
// 寸法は剣の縮小(EXPOSED_H 0.7181→0.6)に合わせて同じ比率で詰めてある
const CHARM_SIZE = 0.071; // いちばん長い辺の長さ
const CHARM_DROP = [0.025, 0.029, 0.027]; // ぶら下げ点から本体の上端まで
const CHARM_Z = [-0.035, 0, 0.035]; // 前後にずらして重ならないように
const CHARM_TILT = [0.2, 0.04, 0.32]; // 外へ開く角度(rad)
const CHARM_SPEED = [2.3, 1.8, 2.7]; // 揺れの速さ

/**
 * 剣1本ぶんの Group を作る。原点=刺さり口、+Y=柄の方向、刃先は -Y に伸びる。
 * InstancedMesh が使えない「主役の1本」用。1000本には使わないこと。
 */
export function buildToySword(opts: ToySwordOptions): ToySword {
  const skinIndex =
    opts.skin >= 0 && opts.skin < SWORD_SKINS.length ? opts.skin : 0;
  const quality = opts.quality ?? "hero";

  const geometry = makeToySwordGeometry(quality);
  const material = makeSwordMaterial(skinIndex, swordHexOf(skinIndex, opts.color));
  const sword = new THREE.Mesh(geometry, material);

  const body = new THREE.Group();
  body.scale.setScalar(opts.scale ?? 1);
  body.add(sword);
  const root = new THREE.Group();
  root.add(body);

  // ── チャーム(新しい方から最大 CHARM_VISIBLE_MAX 個) ──
  const charmGeos: THREE.BufferGeometry[] = [];
  const charmMats: THREE.Material[] = [];
  const swings: { pivot: THREE.Group; base: number; speed: number; phase: number }[] = [];
  const shown = Math.min(Math.max(opts.charm, 0), CHARM_VISIBLE_MAX);
  if (shown > 0) {
    // 輪(キーホルダーのリング)は3つで共有する
    const ringGeo = new THREE.TorusGeometry(0.013, 0.004, 4, 10);
    const ringMat = makeSwordMaterial(1, "#e8eefc"); // ぎんの質感を借りる
    charmGeos.push(ringGeo);
    charmMats.push(ringMat);

    for (let i = 0; i < shown; i++) {
      const charm = CHARMS[Math.min(opts.charm - 1 - i, CHARMS.length - 1)];
      if (!charm) continue;
      const pivot = new THREE.Group();
      pivot.position.copy(CHARM_ANCHOR);
      pivot.position.z += CHARM_Z[i];

      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -0.013;

      const geo = makeCharmGeometry(charm.shape, CHARM_SIZE);
      const mat = new THREE.MeshPhysicalMaterial({
        color: charm.hex,
        metalness: 0.15,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        emissive: new THREE.Color(charm.hex),
        emissiveIntensity: 0.34, // 宇宙の暗がりでも色が分かるように
      });
      charmGeos.push(geo);
      charmMats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = -CHARM_DROP[i];

      pivot.add(ring, mesh);
      pivot.rotation.z = CHARM_TILT[i];
      body.add(pivot);
      swings.push({
        pivot,
        base: CHARM_TILT[i],
        speed: CHARM_SPEED[i],
        phase: i * 1.9,
      });
    }
  }

  const update = (t: number) => {
    tickSwordMaterial(material, t);
    for (const s of swings) {
      // ふりこ。前後(x)はゆっくりにして、機械的な往復に見えないようにする
      s.pivot.rotation.z = s.base + 0.13 * Math.sin(t * s.speed + s.phase);
      s.pivot.rotation.x = 0.1 * Math.sin(t * s.speed * 0.77 + s.phase * 1.7);
    }
  };

  return {
    root,
    body,
    update,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      charmGeos.forEach((g) => g.dispose());
      charmMats.forEach((m) => m.dispose());
    },
  };
}
