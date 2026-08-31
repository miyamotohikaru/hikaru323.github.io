// 剣の「スキン + チャーム」を1バイトに詰める。穴ごとに1バイトの
// Uint8Array(HOLE_COUNT) を base64 で配るので、1000穴で約1.4KBに収まる。
//
//   bit 0-2 : skin  (0..7)          SWORD_SKINS の index
//   bit 3-7 : charm (0..31)         持っているチャームの数(0=なし)
//
// 0 は「情報なし = デフォルトのプラスチック剣・チャームなし」を意味する。
// 過去の刺しは 0 のままなので、詰め方を変えると見た目が変わってしまう。

import { CHARMS, SWORD_SKINS } from "./config";

export const SKIN_MAX = 7; // 3bit
export const CHARM_MAX = 31; // 5bit

/** スキンindexとチャーム数を1バイトへ。範囲外は丸める */
export function packStyle(skin: number, charm: number): number {
  const s = Math.min(Math.max(Math.trunc(skin) || 0, 0), SKIN_MAX);
  const c = Math.min(Math.max(Math.trunc(charm) || 0, 0), CHARM_MAX);
  return (s & 0b111) | ((c & 0b11111) << 3);
}

/** バイトからスキンindex(存在しない番号なら0=プラスチック) */
export function skinOf(style: number): number {
  const s = style & 0b111;
  return s < SWORD_SKINS.length ? s : 0;
}

/** バイトからチャーム数(0..CHARMS.length) */
export function charmOf(style: number): number {
  return Math.min((style >> 3) & 0b11111, CHARMS.length);
}
