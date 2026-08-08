// 剣の「スキン + チャーム」を1バイトに詰める。穴ごとに1バイトの
// Uint8Array(HOLE_COUNT) を base64 で配るので、1000穴で約1.4KBに収まる。
//
//   bit 0-2 : skin  (0..7)   SWORD_SKINS の index
//   bit 3-6 : 刺して集めたチャームの数 (0..15)
//   bit 7   : 隠しチャーム(地球をこわした人)を持っているか
//
// 隠しチャームは刺し本数と無関係に手に入るので、「数」では表せない。
// そのため最上位1ビットを独立したフラグに割いてある。
// 0 は「情報なし = デフォルトのプラスチック剣・チャームなし」を意味する。
// 過去の刺しは 0 のままなので、詰め方を変えると見た目が変わってしまう。

import { CHARMS, EARTH_CHARM_INDEX, NORMAL_CHARM_COUNT, SWORD_SKINS } from "./config";

export const SKIN_MAX = 7; // 3bit
/** 刺して集めたチャーム数の上限(4bit)。CHARMS の通常ぶんはこれ以下であること */
export const CHARM_MAX = 15;
/** 隠しチャームのビット */
export const EARTH_CHARM_BIT = 0b1000_0000;

/** スキンindex・チャーム数・隠しチャームの有無を1バイトへ。範囲外は丸める */
export function packStyle(
  skin: number,
  charm: number,
  earthCharm = false,
): number {
  const s = Math.min(Math.max(Math.trunc(skin) || 0, 0), SKIN_MAX);
  const c = Math.min(Math.max(Math.trunc(charm) || 0, 0), CHARM_MAX);
  return (s & 0b111) | ((c & 0b1111) << 3) | (earthCharm ? EARTH_CHARM_BIT : 0);
}

/** バイトからスキンindex(存在しない番号なら0=プラスチック) */
export function skinOf(style: number): number {
  const s = style & 0b111;
  return s < SWORD_SKINS.length ? s : 0;
}

/** バイトから「刺して集めたチャームの数」(0..NORMAL_CHARM_COUNT) */
export function charmOf(style: number): number {
  return Math.min((style >> 3) & 0b1111, NORMAL_CHARM_COUNT);
}

/** バイトから「隠しチャームを持っているか」 */
export function hasEarthCharm(style: number): boolean {
  return (style & EARTH_CHARM_BIT) !== 0;
}

/**
 * その剣にぶら下がるチャームを CHARMS の index 配列で返す(古い順)。
 * **3D も UI もこの1本の関数を使うこと。** 上限は設けない
 * (「チャームは何個でもつけられる」がこのゲームの仕様)。
 */
export function charmIndicesOf(style: number): number[] {
  const out: number[] = [];
  const n = charmOf(style);
  for (let i = 0; i < n && i < CHARMS.length; i++) {
    if (!CHARMS[i].secret) out.push(i);
  }
  if (hasEarthCharm(style) && EARTH_CHARM_INDEX >= 0) {
    out.push(EARTH_CHARM_INDEX);
  }
  return out;
}

/** 手持ちの状態(刺し数と隠しの有無)から、同じ index 配列を作る */
export function charmIndicesFrom(charm: number, earthCharm: boolean): number[] {
  return charmIndicesOf(packStyle(0, charm, earthCharm));
}
