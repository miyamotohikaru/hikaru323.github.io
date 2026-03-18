// NGワードリスト（不適切な言葉のフィルタ）
const NG_WORDS: string[] = [
  "死ね",
  "殺す",
  "殺してやる",
  "ころす",
  "しね",
  "くたばれ",
  "ファック",
  "セックス",
  "ちんこ",
  "まんこ",
  "うんこ",
  "レイプ",
  "児童ポルノ",
  "覚醒剤",
  "麻薬",
  "大麻",
  "薬物",
];

export function containsNGWord(text: string): boolean {
  const lower = text.toLowerCase();
  return NG_WORDS.some((ng) => lower.includes(ng));
}

export function checkAllFieldsForNG(fields: Record<string, string | string[] | undefined>): boolean {
  for (const value of Object.values(fields)) {
    if (typeof value === "string" && containsNGWord(value)) {
      return true;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsNGWord(item)) return true;
      }
    }
  }
  return false;
}
