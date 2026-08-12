import { FLIPS, type Flip } from "@/data/flips";

/** 「2026-08-02」→「2026年08月02日」。会社HPの最新情報と同じ書き方 */
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

/** new.gif を付けるもの。更新履歴のあたらしい2行だけ */
export const NEW_SLUGS: string[] = OPENED.slice(0, 2).map((f) => f.slug);

/**
 * 更新履歴。
 * 当時のホームページの「更新履歴」は、そのページ自身に何をしたかの記録だった。
 * ここも同じで、日付は flips.ts の公開日をそのまま使い、
 * 「そのふりっぷをこの一覧にくわえた日」として書く（データは読むだけ）。
 */
export type LogLine = {
  date: string;
  text: string;
  /** その行が指すふりっぷ。ページ自身の記録には無い */
  slug?: string;
};

/** このページをつくった日 */
export const PAGE_MADE = "2026-08-12";

export const HISTORY: LogLine[] = [
  { date: PAGE_MADE, text: "このページ「ふりっぷ一覧」をつくりました。" },
  ...OPENED.map((f) => ({
    date: f.date,
    text: `「${f.title}」をくわえました。`,
    slug: f.slug,
  })),
];
