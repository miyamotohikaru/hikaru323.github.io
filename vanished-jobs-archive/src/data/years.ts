/**
 * カード新デザイン用の年代データ。
 * このマップに no があるカードだけ新レイアウト（年代スライダー付き）で表示する。
 * まずは 001-003 のみ。順次全151件に広げる。
 * start/end は西暦（負=紀元前）。軸は全カード共通で AXIS_MIN..AXIS_MAX に固定。
 */
export const AXIS_MIN = 0;
export const AXIS_MAX = 2026;

export type YearSpan = {
  reading: string;
  start: number;
  end: number;
};

export const yearSpans: Record<string, YearSpan> = {
  "001": { reading: "しょき", start: -3000, end: 1450 },
  "002": { reading: "ぎんゆうしじん", start: 500, end: 1500 },
  "003": { reading: "しゃほんさいしょくし", start: 500, end: 1500 },
  "004": { reading: "れんきんじゅつし", start: -300, end: 1750 },
  "005": { reading: "ぺすといし", start: 1347, end: 1750 },
  "006": { reading: "りはつげかい", start: 1100, end: 1745 },
  "007": { reading: "きゅうていどうけし", start: 1200, end: 1700 },
  "008": { reading: "つみくいにん", start: 1650, end: 1906 },
  "009": { reading: "なきおんな", start: -2000, end: 2026 },
  "010": { reading: "きし", start: 900, end: 1600 },
  "011": { reading: "しりゃくせんいん", start: 1500, end: 1856 },
  "012": { reading: "みずうり", start: -500, end: 1880 },
  "013": { reading: "いねむりおこしがかり", start: 1650, end: 1880 },
  "014": { reading: "おいすがかり", start: 1500, end: 1780 },
  "015": { reading: "けいさんしゅ", start: 1600, end: 1960 },
  "016": { reading: "のっかーあっぷ", start: 1800, end: 1975 },
  "017": { reading: "てんとうふ", start: 1750, end: 1950 },
  "018": { reading: "たいまつもち", start: 1600, end: 1850 },
  "019": { reading: "ひるさいしゅうにん", start: 1700, end: 1900 },
  "020": { reading: "したいとうくつにん", start: 1750, end: 1832 },
};

/** 西暦を表示用文字列に（負=B.C.） */
export function fmtYear(y: number): string {
  return y < 0 ? `B.C.${-y}` : String(y);
}

/** 活動年数（続いた年数）をきりよく丸める */
export function lifespan(start: number, end: number): number {
  const span = end - start;
  if (span >= 1000) return Math.round(span / 100) * 100;
  if (span >= 100) return Math.round(span / 10) * 10;
  return span;
}
