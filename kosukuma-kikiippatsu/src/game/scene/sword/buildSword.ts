// 「黒ひげ危機一発」の付属剣を手続き生成する共有ビルダー。
// 月に刺さっている剣(Swords.tsx / InstancedMesh)も、自分のヒーロー剣
// (StabSword.tsx)も、降ってくる剣の演出も、ぜんぶここから作る。
//
// TOMY公式パーツ写真の実測(回転補正後)にもとづく、実物の剣の特徴:
//   ・刃も鍔も柄も柄頭も「ぜんぶ同じ色の1色成型プラスチック」(刃だけ銀にしない)
//   ・細長い「先の丸い弾丸型」の刃。剣先から鍔まで単調に太くなり鍔ぎわが最大
//   ・鍔は細長いバーの両端に丸いボス。刃の最大幅の2.1倍
//   ・握りは細い円柱ではなく、ほぼ正方形の平たい板に「はしご状の溝」が5本
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
  EARTH_CHARM_INDEX,
  SWORD_COLORS,
  SWORD_SKINS,
} from "@/lib/config";
import { charmIndicesFrom } from "@/lib/style";
import { hashString, mulberry32, randRange } from "@/lib/prng";
import { makeCharmGeometry, makeEarthCharmParts } from "./charmGeometry";

// ── 寸法 ────────────────────────────────────────────
// いちばん大事なのは「実物は刃も握りも柄頭も同じ厚みの平たい1枚の板」だという
// こと。だから安く成型できるし、あの独特のシルエットになる。これを
// 「細い板 + 細い円柱 + 上に乗った球」で作ると、剣ではなく待ち針に見える。

/**
 * 月面から出る高さ。全景での剣の密度バランスがこの値で決まっているので固定。
 */
const EXPOSED_H = 0.7181;

// ── 実測は「回転補正後」の値を使うこと ────────────────────────
// 公式写真の剣は4本とも24〜29°傾いて置かれている。軸に平行なバウンディング
// ボックスで測ると、傾いたぶん幅が水増しされ長さが圧縮されるので、
// 「刃の幅 : 長さ = 0.55」のような、実物より44%太い値が出てしまう。

/** 見えている刃の長さ = 見えている剣の50%(実物の刃は剣全体の53%) */
const BLADE_TOP = EXPOSED_H * 0.5;
/** 柄まわり(鍔+握り+柄頭)の高さ */
const HILT_H = EXPOSED_H - BLADE_TOP;

/** 刃は月の中へも少し伸ばす(刺す・降ってくる演出で使う) */
const BLADE_BURY = BLADE_TOP * 0.145;
const BLADE_LEN = BLADE_TOP + BLADE_BURY;
/** 刃の半幅。回転補正した実測「刃の幅 : 刃の長さ = 0.38」を刃の全長に当てる */
const BLADE_HALF_W = (BLADE_LEN * 0.385) / 2;
const BLADE_THICK = 0.04;

const POMMEL_SINK = 0.008; // 握りへ少しめり込ませて、浮いて見せない

// 鍔: 細長いバーの両端に丸いボス。回転補正した実測「鍔の長さ = 刃の最大幅の
// 2.1倍」を保つため刃幅から導出する(刃の太さを変えても鍔が鍔に見えなくならない)
const GUARD_HALF_L = BLADE_HALF_W * 2.1;
const GUARD_HALF_H = (HILT_H * 0.185) / 2;
const GUARD_BOSS_R = GUARD_HALF_H; // いちばん高いのは端のボス
const GUARD_BAR_HALF_H = GUARD_BOSS_R * 0.7; // 中央のバーはボスより細い
const GUARD_THICK = 0.062; // 鍔だけ少し厚くして、部品として立たせる

// 握り: 円柱ではなく平たい板。はしご状の溝が入る。
// 幅は実測の見た目どおり刃よりわずかに広い程度にとどめる。ここを
// 「縦横比1.04」から逆算すると、刃の1.27倍もある巨大な板になってしまう
const GRIP_HALF_W = BLADE_HALF_W * 1.1;
const GRIP_THICK = 0.046;
const GRIP_RIB_THICK = 0.06; // はしごの桟はひと回り厚い
const GRIP_NOTCH = GRIP_HALF_W * 0.28; // 溝で細くなる量(輪郭にもはしごを出す)

// 柄頭: 球ではなく、平たく開いた三つ葉の板(球はRPGの短剣の記号で、玩具ではない)
const POMMEL_H = HILT_H * 0.3;
// 実測「柄頭の張り出し / 握り幅」。1.18 は写真のサンプル格子が柄頭のいちばん
// 広い行を外していた値で、測り直すと 1.25〜1.28。UIの剣(SwordArt)も1.25。
const POMMEL_HALF_W = GRIP_HALF_W * 1.25;
const POMMEL_LOBE_R = POMMEL_HALF_W * 0.37; // 三つ葉ひと粒の半径
const POMMEL_THICK = 0.046;

// 柄の内訳(回転補正した実測: 鍔18.5% / 握り51% / 柄頭30.5%)。
// 残りの高さを握りに割り当てるので、鍔+握り+柄頭 = HILT_H が常に成り立つ
const GRIP_LEN = HILT_H - GUARD_HALF_H * 2 - POMMEL_H + POMMEL_SINK;

const GUARD_Y = BLADE_TOP + GUARD_HALF_H; // 鍔の中心の高さ
const GRIP_Y = GUARD_Y + GUARD_HALF_H; // 握りのはじまり
const POMMEL_Y = GRIP_Y + GRIP_LEN - POMMEL_SINK; // 三つ葉板の付け根
const TOP_Y = POMMEL_Y + POMMEL_H; // = EXPOSED_H

/** チャームをぶら下げる点(鍔の端の下面)。刃に重ならないよう外側へ寄せてある */
const CHARM_ANCHOR = new THREE.Vector3(
  GUARD_HALF_L,
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
 * 刃の輪郭。先端からの位置 u(0=剣先, 1=鍔ぎわ)と、鍔ぎわを1とした半幅 h。
 *
 * 実物は「先の丸い長い弾丸型」= 剣先から鍔まで単調に太くなり、鍔ぎわが最大。
 * 途中に最大幅の山を作る(西洋短剣の木の葉型)と、月から出ている部分が
 * 「先端が無く真ん中がいちばん太い樽」になって、洗濯ばさみにしか見えない。
 * 先端は幅0の尖点にしない — 実物は安全基準のために丸い鼻へ変えられている。
 */
const BLADE_PROFILE: number[][] = [
  [0.0, 0.16], // 丸い鼻
  [0.015, 0.3],
  [0.04, 0.44],
  [0.075, 0.555],
  [0.12, 0.65],
  [0.175, 0.725],
  [0.245, 0.79],
  [0.33, 0.85],
  [0.43, 0.9],
  [0.54, 0.94],
  [0.67, 0.97],
  [0.82, 0.99],
  [1.0, 1.0], // 鍔ぎわがいちばん太い
];

/** 刃の面取り。ExtrudeGeometry の面取りは輪郭より外へ膨らむので後で差し引く */
const BLADE_BEVEL = 0.006;

/** 刃。平たく幅の広い木の葉。面取りが成型プラスチックの角のハイライトになる */
function makeBlade(q: SwordQuality): THREE.BufferGeometry {
  // 遠景はひとつ飛ばしでサンプルする(表はひとつなので形は崩れない)
  const rows =
    q === "hero" ? BLADE_PROFILE : BLADE_PROFILE.filter((_, i) => i % 2 === 0);
  const tip = -BLADE_BURY;
  // 面取りのぶん外へ太るので、輪郭はそのぶん内側に作る。
  // こうしないと出来上がりが実測比 0.55 より6%ほど太ってしまう
  const w = BLADE_HALF_W - BLADE_BEVEL;
  const right: number[][] = [];
  const left: number[][] = [];
  for (const [u, h] of rows) {
    const y = tip + BLADE_LEN * u;
    const x = w * h;
    right.push([x, y]);
    left.push([-x, y]);
  }
  // 右を剣先→鍔、左を鍔→剣先とつなぐと閉じた木の葉になる
  return extrudePlate(
    shapeFrom([...right, ...left.reverse()]),
    BLADE_THICK,
    BLADE_BEVEL,
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

/**
 * はしごの桟の割りつけ(輪郭の溝と、盛り上げる桟で同じ数値を使う)。
 * 溝の数は field でも実物どおり5本にする。実物でいちばん目立つ形なので、
 * 遠景で本数を減らすと剣ではなくただの棒に見えてしまう。
 */
function gripLadder() {
  const n = 5;
  const rib = GRIP_LEN / (n + 1 + n * 0.42); // 桟の高さ
  return { n, rib, gap: rib * 0.42 };
}

/**
 * 握り。細い円柱ではなく、刃とほぼ同じ幅の平たい板。
 * 左右の輪郭を段々に刻んで、遠景でも「はしご」が silhouette に出るようにする
 * (ここが無いと、実物でいちばん目立つ溝が消えてただの棒になる)。
 */
function makeGrip(q: SwordQuality): THREE.BufferGeometry {
  const { n, rib, gap } = gripLadder();
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
  const { n, rib, gap } = gripLadder();
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
  /**
   * 刺して集めたチャームの数(後方互換)。`charms` を渡さないときだけ使われ、
   * 「古い方から charm 個」に読み替えられる。隠しチャームは数では表せないので、
   * 新しい呼び出し側は `charms` を使うこと。
   */
  charm: number;
  /**
   * ぶら下げるチャームを CHARMS の index で直接指定する(古い順)。
   * `src/lib/style.ts` の `charmIndicesOf()` / `charmIndicesFrom()` の返り値を
   * そのまま渡すのが正しい使い方。**上限なし**(何個でもぶら下がる)。
   */
  charms?: number[];
  /** 1 = 月に刺さっている剣と同じ大きさ */
  scale?: number;
  /** 形の細かさ(既定 hero: 単体の剣は近くで見られる) */
  quality?: SwordQuality;
}

export interface ToySword {
  /** シーンに置くルート。位置・向き・大きさは呼び出し側が自由に動かしてよい */
  root: THREE.Group;
  /**
   * opts.scale を持つ内側のグループ。剣ローカルで飾りを足したいとき用。
   * チャームの重さでほんの少し傾いているので、rotation は上書きしないこと
   */
  body: THREE.Group;
  /** 毎フレーム呼ぶ(チャームの揺れ・にじいろの更新用)。t = 経過秒 */
  update: (t: number) => void;
  dispose: () => void;
}

// ── チャームのぶら下げ方(何個でも下げられる) ──────────────
// 実物のキーホルダーと同じで、鍔のはしに「輪」を通し、そこから長さのちがう
// チェーンで垂らす。13個を1本の輪に同じ長さで下げると団子になるので、
//   1. 落差を1個ずつ深くする(チェーンの節を2つずつ増やす)
//   2. 輪のまわりに黄金角(137.5°)で散らして、真上から見ても重ならない
//   3. 深いものほど「刃から離れる向き」へ開く
// の3つでぶつからないようにしてある。**傾きを輪の半径方向ではなく必ず外向き
// (刃と反対)にする**のがミソで、こうすると輪の内側から下げたチャームも
// 下へいくほど刃から逃げるので、どの方位に下げても刃と喧嘩しない。
// 5個以上になったら鍔の反対のはしにも房を作って左右に振り分ける
// (片側に13個ぶら下げると、剣より房のほうが大きくなってしまう)。

/** 左右に振り分けはじめる個数 */
const CHARM_SPLIT_AT = 5;
/** チャーム1個の大きさ(いちばん長い辺)。数が多いほど少し小ぶりにする */
const CHARM_SIZE_MAX = 0.085;
const CHARM_SIZE_MIN = 0.068;
/** 房の輪。持っている数がふえるほど大きい輪になる(ひと目で「じまんの剣」) */
const HOOP_TUBE = 0.005;
const HOOP_SINK = 0.004; // 鍔の下面から沈める量。浮かせない
const HOOP_R_MIN = 0.018;
const HOOP_R_STEP = 0.009;
const HOOP_R_STEPS = 4; // これ以上は太らせない(鍔より目立たせない)
/** チェーンの節。1個ぶん深くするたびに節を増やして、隣どうしを段違いにする */
const LINK_R = 0.0075;
const LINK_TUBE = 0.0026;
const LINK_PITCH = 0.012;
const LINK_BASE = 2;
/**
 * 1個ぶん深くする節の数。房の数が少ないときほど大きくとる。
 * 少ないと輪が小さく、方位でばらけないぶん、落差で離すしかないため
 * (逆に多いときは輪が大きく、深くしすぎると月にとどいてしまう)。
 */
const LINK_STEP_MIN = 2;
const LINK_STEP_MAX = 6;
function linkStepFor(count: number): number {
  return THREE.MathUtils.clamp(
    Math.round(12 / Math.max(count, 1)),
    LINK_STEP_MIN,
    LINK_STEP_MAX
  );
}
/** 刃から離れる向きの傾き(rad)。深いものほど開く */
const CHARM_LEAN = 0.17;
const CHARM_LEAN_STEP = 0.02;
/** 黄金角。何個ぶら下げても輪のまわりにきれいに散る */
const CHARM_AZ_STEP = 2.39996;
/** ちきゅうチャームの自転(rad/秒)。小さな地球が生きている感じ */
const EARTH_SPIN = 0.32;
/** ちきゅうチャームの色。海は config の hex、大陸とひびはここで決める */
const EARTH_LAND_HEX = "#8fe0a0";
const EARTH_CRACK_HEX = "#20264a";
/** 重さの演出: 全部ぶら下げても2.5°まで傾ける */
const WEIGHT_LEAN_MAX = 0.044;
/** 房のゆれが剣に返ってくる量(気づかない程度に)。上限つきで暴れさせない */
const SWAY_GAIN = 0.025;
const SWAY_MAX = 0.012;

/** チャーム1個ぶんの割りつけ */
interface CharmSpot {
  /** CHARMS の index */
  charmIndex: number;
  /** +1 = 鍔の右はしの房 / -1 = 左はしの房 */
  side: number;
  /** 輪の半径 */
  hoopR: number;
  /** 輪のどこから下げるか(rad) */
  az: number;
  /** 吊り点からチャーム上端までの落差 */
  drop: number;
  /** チェーンの節の数 */
  links: number;
  /** 刃から離れる向きの傾き(rad) */
  lean: number;
  /** ふりこの速さ・振れ幅・位相 */
  speed: number;
  amp: number;
  phase: number;
}

/** 数が多いほど少し小ぶりにする(13個でも房が団子にならないように) */
function charmSizeFor(n: number): number {
  return THREE.MathUtils.lerp(
    CHARM_SIZE_MAX,
    CHARM_SIZE_MIN,
    THREE.MathUtils.clamp((n - 4) / 9, 0, 1)
  );
}

/**
 * チャームの index 配列(古い順)から、房の割りつけを決める。
 * 古い順に 右→左→右→… と配るので、**いちばん新しいチャームは必ず
 * 右の房のいちばん下(いちばん長いチェーン)**に来る。
 * 隠しチャーム「ちきゅう」は配列の最後に来る約束なので、自然にいちばん目立つ。
 */
function layoutCharms(list: number[]): {
  spots: CharmSpot[];
  hoops: { side: number; r: number }[];
} {
  const sides = list.length >= CHARM_SPLIT_AT ? [1, -1] : [1];
  // 輪の大きさとチェーンの段差は「その房に何個下がるか」で決まるので、
  // まず数だけ先に数える
  const counts = sides.map((_, si) =>
    list.reduce((a, _c, i) => a + (i % sides.length === si ? 1 : 0), 0)
  );
  const hoops = sides.map((side, si) => ({
    side,
    r: HOOP_R_MIN + HOOP_R_STEP * Math.min(counts[si] - 1, HOOP_R_STEPS),
  }));

  const used = sides.map(() => 0);
  const spots: CharmSpot[] = [];
  list.forEach((charmIndex, i) => {
    const si = i % sides.length;
    const side = sides[si];
    const k = used[si]++;
    const links = LINK_BASE + linkStepFor(counts[si]) * k;
    const drop = links * LINK_PITCH;
    const shallow = (LINK_BASE * LINK_PITCH) / drop; // 1 = いちばん浅い
    spots.push({
      charmIndex,
      side,
      hoopR: hoops[si].r,
      az: k * CHARM_AZ_STEP + (side < 0 ? 1.1 : 0),
      drop,
      links,
      lean: CHARM_LEAN + CHARM_LEAN_STEP * k,
      // ふりこは長いほど遅い。振れ幅も小さくして、深いチャーム同士が
      // ぶつからないようにしつつ「重そう」に見せる
      speed: 2.6 * Math.pow(shallow, 0.4),
      amp: 0.13 * Math.pow(shallow, 0.25),
      phase: k * 1.9 + (side < 0 ? 0.7 : 0),
    });
  });
  return { spots, hoops };
}

/** チャームの樹脂の質感。宇宙の暗がりでも色が分かるよう、自分の色で少し光る */
function makeCharmMaterial(hex: string, emissive = 0.34): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: 0.15,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color(hex),
    emissiveIntensity: emissive,
  });
}

/** チェーン1本。節を90°ずつひねって重ねると、輪がつながって見える */
function makeChainGeometry(links: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < links; i++) {
    const g = new THREE.TorusGeometry(LINK_R, LINK_TUBE, 4, 7);
    if (i % 2 === 1) g.rotateY(Math.PI / 2);
    g.translate(0, -(i + 0.5) * LINK_PITCH, 0);
    parts.push(g);
  }
  const merged = mergeGeometries(parts);
  if (!merged) return parts[0];
  parts.forEach((p) => p.dispose());
  return merged;
}

/**
 * チャーム1個ぶんの表示物。ちきゅうだけは平たい板ではなく小さな球で、
 * 海・大陸・ひびの3色に分かれる(だから Mesh ではなく Group を返す)。
 */
function buildCharmObject(
  charmIndex: number,
  size: number
): {
  obj: THREE.Object3D;
  geos: THREE.BufferGeometry[];
  mats: THREE.Material[];
  /** true = ゆっくり自転させる(ちきゅう) */
  spins: boolean;
} {
  const charm = CHARMS[charmIndex];
  if (charmIndex === EARTH_CHARM_INDEX && EARTH_CHARM_INDEX >= 0) {
    // 隠しチャームは「ごほうび」なので、ほかより一回り大きく・よく光らせる
    const parts = makeEarthCharmParts(size * 1.12);
    const sea = makeCharmMaterial(charm.hex, 0.42);
    const land = makeCharmMaterial(EARTH_LAND_HEX, 0.3);
    const crack = makeCharmMaterial(EARTH_CRACK_HEX, 0.05);
    // ひびは球にはりついた1枚の帯。折り返しの角で裏返る面が出るので両面で描く
    crack.side = THREE.DoubleSide;
    const g = new THREE.Group();
    g.add(
      new THREE.Mesh(parts.globe, sea),
      new THREE.Mesh(parts.land, land),
      new THREE.Mesh(parts.crack, crack)
    );
    return {
      obj: g,
      geos: [parts.globe, parts.land, parts.crack],
      mats: [sea, land, crack],
      spins: true,
    };
  }
  const geo = makeCharmGeometry(charm.shape, size);
  const mat = makeCharmMaterial(charm.hex);
  return { obj: new THREE.Mesh(geo, mat), geos: [geo], mats: [mat], spins: false };
}

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

  // ── チャーム(持っているぶん全部。上限なし) ──
  // 何を下げるかは `src/lib/style.ts` の charmIndicesOf/From が正。
  // ここで独自に「新しい方から3個」のような間引きはしない
  const list = opts.charms ?? charmIndicesFrom(opts.charm, false);

  const charmGeos: THREE.BufferGeometry[] = [];
  const charmMats: THREE.Material[] = [];
  const swings: {
    pivot: THREE.Group;
    side: number;
    lean: number;
    amp: number;
    speed: number;
    phase: number;
    /** ゆれの反動を剣に返すときの重み(長くぶら下がっているほど効く) */
    weight: number;
    /** ちきゅうだけ: 自転させる本体と、その基準の向き */
    spin: THREE.Object3D | null;
    facing: number;
  }[] = [];

  // たくさん下げるほど、剣は房の側へほんの少しおじぎする(重そうに見せる)。
  // 左右に振り分けても、いちばん新しい房のある右のほうが常に1個ぶん重い
  const weightLean =
    WEIGHT_LEAN_MAX * THREE.MathUtils.clamp((list.length - 1) / 12, 0, 1);

  if (list.length > 0) {
    const size = charmSizeFor(list.length);
    const { spots, hoops } = layoutCharms(list);
    // 輪とチェーンは房ぜんぶで共有する(色は「ぎん」の質感を借りる)
    const linkMat = makeSwordMaterial(1, "#e8eefc");
    charmMats.push(linkMat);
    const chainCache = new Map<number, THREE.BufferGeometry>();

    for (const h of hoops) {
      const geo = new THREE.TorusGeometry(h.r, HOOP_TUBE, 6, 16);
      geo.rotateX(Math.PI / 2); // 水平に寝かせる = 円周にチャームをばらけさせる
      geo.translate(
        CHARM_ANCHOR.x * h.side,
        CHARM_ANCHOR.y - HOOP_SINK,
        CHARM_ANCHOR.z
      );
      charmGeos.push(geo);
      body.add(new THREE.Mesh(geo, linkMat));
    }

    for (const spot of spots) {
      if (!CHARMS[spot.charmIndex]) continue;
      // 支点は「輪の上の1点」。ここから下げるとチェーンが輪から出て見える
      const pivot = new THREE.Group();
      pivot.position.set(
        (CHARM_ANCHOR.x + Math.cos(spot.az) * spot.hoopR) * spot.side,
        CHARM_ANCHOR.y - HOOP_SINK,
        CHARM_ANCHOR.z + Math.sin(spot.az) * spot.hoopR
      );

      let chain = chainCache.get(spot.links);
      if (!chain) {
        chain = makeChainGeometry(spot.links);
        chainCache.set(spot.links, chain);
        charmGeos.push(chain);
      }
      pivot.add(new THREE.Mesh(chain, linkMat));

      const built = buildCharmObject(spot.charmIndex, size);
      charmGeos.push(...built.geos);
      charmMats.push(...built.mats);
      // 板の面を輪の外向きへ。ぐるりと散らばった房が、どの角度から見ても
      // 何個かは正面を向いている状態になる
      const facing = spot.side * (Math.PI / 2 - spot.az);
      built.obj.position.y = -spot.drop;
      built.obj.rotation.y = facing;
      pivot.add(built.obj);

      pivot.rotation.z = spot.side * spot.lean;
      body.add(pivot);
      swings.push({
        pivot,
        side: spot.side,
        lean: spot.lean,
        amp: spot.amp,
        speed: spot.speed,
        phase: spot.phase,
        weight: spot.drop,
        spin: built.spins ? built.obj : null,
        facing,
      });
    }
  }

  if (weightLean > 0) body.rotation.z = -weightLean;

  const update = (t: number) => {
    tickSwordMaterial(material, t);
    let react = 0;
    for (const s of swings) {
      // ふりこ。前後(x)はゆっくりにして、機械的な往復に見えないようにする。
      // 長いチェーンほど遅く小さく揺れるので、13個でも位相がばらけたまま
      const sw = Math.sin(t * s.speed + s.phase);
      s.pivot.rotation.z = s.side * (s.lean + s.amp * sw);
      s.pivot.rotation.x = s.amp * 0.75 * Math.sin(t * s.speed * 0.77 + s.phase * 1.7);
      react += s.side * sw * s.weight;
      if (s.spin) s.spin.rotation.y = s.facing + t * EARTH_SPIN; // ちきゅうの自転
    }
    if (swings.length > 0) {
      // 房のゆれの反動で剣もわずかに揺り返す(左右にそろって振れたときだけ効く)
      body.rotation.z =
        -weightLean - THREE.MathUtils.clamp(react * SWAY_GAIN, -SWAY_MAX, SWAY_MAX);
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
