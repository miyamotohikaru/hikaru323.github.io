import { FLIPS, type Flip } from "@/data/flips";

/** 「2026-08-02」→「2026年08月02日」。本物のHPの最新情報と同じ書き方 */
export function jpDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${m}月${d}日`;
}

/** いま遊べるもの。公開済みで行き先があるものだけ */
export function isOpen(f: Flip): boolean {
  return f.status === "released" && Boolean(f.url);
}

/** 押せるもの。行き先が空の3件は押せない */
export function canOpen(f: Flip): boolean {
  return Boolean(f.url);
}

/** 公開中のもの、新しい順 */
export const OPENED: Flip[] = FLIPS.filter(isOpen)
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

/**
 * new.gif を付けるもの。公開中のうち新しい2件。
 * 本物のHPも最新情報のいちばん新しい行にだけ new.gif を付けている。
 */
export const NEW_SLUGS: string[] = OPENED.slice(0, 2).map((f) => f.slug);
