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
