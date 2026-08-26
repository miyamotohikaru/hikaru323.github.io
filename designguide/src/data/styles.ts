/**
 * 図鑑の中身を1つにまとめる取り出し口。ページからはここだけを見る。
 *
 * 背骨（spine.ts）が唯一の正で、順番もそこで決まっている。
 * 解説（entries/）はまだ書かれていないものがあり得るので、
 * 無ければ背骨から作った仮の中身で埋める。80枚を並べる画面を、
 * 1件の書き漏れで真っ白にしないため。
 */
import { SPINE, type Spine } from "./spine";
import { ENTRIES } from "./entries";
import type { DesignStyle, StyleCategory } from "./types";

function placeholder(s: Spine): DesignStyle {
  return {
    ...s,
    tagline: `${s.origin}・${s.era}`,
    description: "解説を準備しています。",
    traits: [],
    avoid: [],
    palette: [...s.palette],
    prompt: {
      core: `${s.en} style`,
      texture: "",
      palette: "",
      composition: "",
      negative: "",
    },
    related: [],
  };
}

/** 背骨の順。これが図鑑の並び */
export const STYLES: DesignStyle[] = SPINE.map((s) => {
  const e = ENTRIES[s.slug];
  if (!e) return placeholder(s);
  // 名前・年代・分類・色は背骨を正とする（解説側の写し間違いを拾わない）
  return { ...e, ja: s.ja, en: s.en, era: s.era, origin: s.origin, category: s.category, palette: [...s.palette] };
});

export const STYLE_BY_SLUG: Record<string, DesignStyle> = Object.fromEntries(
  STYLES.map((s) => [s.slug, s]),
);

/** 図鑑の通し番号。001 から */
export const STYLE_NO: Record<string, string> = Object.fromEntries(
  STYLES.map((s, i) => [s.slug, String(i + 1).padStart(3, "0")]),
);

export const CATEGORIES: StyleCategory[] = ["movement", "print", "screen", "internet", "japan", "world"];

/** 解説がまだ書かれていないもの。作業中に見るため */
export const PENDING = STYLES.filter((s) => !ENTRIES[s.slug]).map((s) => s.slug);

export type { DesignStyle, StyleCategory };
