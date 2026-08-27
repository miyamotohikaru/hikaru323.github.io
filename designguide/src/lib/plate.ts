/**
 * 図版（プレート）の共通規格。
 *
 * 1スタイル＝1枚の版画。600×800（3:4）の紙に、そのスタイルで実際に
 * 刷ったらこう出る、という一枚を描く。抽象的な色見本ではない。
 *
 * ■ 守ること
 *   1. viewBox は必ず "0 0 600 800"。外枠は .plate-frame 側が持つ。
 *   2. <defs> の id は必ず slug を接頭辞にする（`${P}-...`）。
 *      80枚が同一ページに並ぶので、素の id は必ず衝突する。
 *   3. 紙目・網点・かすれは ATLAS.* の共有 id を使う。
 *      feTurbulence を80個置くと描画が落ちる。共有は1回だけ定義してある。
 *      grain / grainCoarse / fibre は「板をかぶせる」側、
 *      bleed / rough は「対象にかける」側。AtlasDefs の頭に用例がある。
 *   4. 実行時の乱数を使わない（サーバとクライアントで絵が変わる）。
 *      ゆらぎが要るときは下の rand() を使う。同じ種なら必ず同じ数列。
 *   5. 画像・外部フォントを読まない。font-family は総称名で書く。
 */

export type PlateProps = {
  /** 一覧で小さく出すときに true。細部を省いて軽くする */
  compact?: boolean;
};

/** 版面 */
export const W = 600;
export const H = 800;

/**
 * 共有 defs の id。AtlasDefs が1回だけ描く。
 * 使い方: filter={`url(#${ATLAS.grain})`}
 */
export const ATLAS = {
  /** 紙の目。薄いノイズ。上に重ねる用 */
  grain: "atlas-grain",
  /** 強めの紙の目。わら半紙・ざら紙 */
  grainCoarse: "atlas-grain-coarse",
  /** 紙の繊維。横に伸びた粗い目。和紙・厚紙 */
  fibre: "atlas-fibre",
  /** インクのにじみ。輪郭をわずかに崩す */
  bleed: "atlas-bleed",
  /** 版ズレのかすれ。リソグラフ・木版用 */
  rough: "atlas-rough",
  /** 網点。ハーフトーン・ポップアート用 */
  halftone: "atlas-halftone",
  /** 細かい網点 */
  halftoneFine: "atlas-halftone-fine",
  /** 走査線。CRT・グリッチ用 */
  scanlines: "atlas-scanlines",
} as const;

/**
 * 決まった数列を返す乱数。種が同じなら何度呼んでも同じ順で同じ値。
 * mulberry32。実行時の Math.random() の代わりに使う。
 *
 *   const r = rand(7);
 *   r();        // 0〜1
 *   r(10, 40);  // 10〜40
 */
/**
 * rand() が返す関数の型。
 * 引数なし→0〜1、1つ→0〜min、2つ→min〜max。
 * 図版のなかで受け渡すときは `() => number` ではなくこれを使うこと
 * （引数つきで呼ぶと型が合わなくなる。cubism で実際に踏んだ）。
 */
export type Rand = (min?: number, max?: number) => number;

export function rand(seed: number): Rand {
  let a = seed >>> 0;
  return (min?: number, max?: number) => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const v = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    if (min === undefined) return v;
    if (max === undefined) return v * min;
    return min + v * (max - min);
  };
}

/** 0〜1 を min〜max に写す */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 度をラジアンに */
export const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * 中心 (cx,cy)・半径 r の円周上の点。角度は度。真上が 0 度。
 * 放射状の版面を組むときに使う。
 */
export const onCircle = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + r * Math.sin(rad(deg)),
  cy - r * Math.cos(rad(deg)),
];

/** 多角形の points 文字列 */
export function polygon(cx: number, cy: number, r: number, sides: number, rot = 0) {
  return Array.from({ length: sides }, (_, i) => onCircle(cx, cy, r, rot + (360 / sides) * i))
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

/** 色を薄くする。#rrggbb + 0〜1 → #rrggbbaa */
export function alpha(hex: string, a: number) {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${v}`;
}

/** 色を黒に寄せる／白に寄せる。t は -1（黒）〜 1（白） */
export function shift(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const to = t >= 0 ? 255 : 0;
  const k = Math.abs(t);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (to - c) * k),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
