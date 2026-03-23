export interface WordEntry {
  id: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string;
  nickname: string;
  likes: number;
  viewCount: number;
  isVisible: boolean;
  source: "user" | "ai";
  kojienFormatted: string;
  authorToken: string;
  featuredDate?: string | null;
  createdAt?: string | null;
}

export interface WordFormData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  etymology?: string;
  examples?: string[];
  synonyms?: string;
  nickname: string;
}

export const PARTS_OF_SPEECH = [
  "名詞",
  "動詞",
  "形容詞",
  "形容動詞",
  "副詞",
  "感動詞",
  "連体詞",
  "接続詞",
  "その他",
] as const;

export const GOJUON_ROWS = [
  { label: "あ行", kana: ["あ", "い", "う", "え", "お"] },
  { label: "か行", kana: ["か", "き", "く", "け", "こ"] },
  { label: "さ行", kana: ["さ", "し", "す", "せ", "そ"] },
  { label: "た行", kana: ["た", "ち", "つ", "て", "と"] },
  { label: "な行", kana: ["な", "に", "ぬ", "ね", "の"] },
  { label: "は行", kana: ["は", "ひ", "ふ", "へ", "ほ"] },
  { label: "ま行", kana: ["ま", "み", "む", "め", "も"] },
  { label: "や行", kana: ["や", "ゆ", "よ"] },
  { label: "ら行", kana: ["ら", "り", "る", "れ", "ろ"] },
  { label: "わ行", kana: ["わ", "を", "ん"] },
  { label: "が行", kana: ["が", "ぎ", "ぐ", "げ", "ご"] },
  { label: "ざ行", kana: ["ざ", "じ", "ず", "ぜ", "ぞ"] },
  { label: "だ行", kana: ["だ", "ぢ", "づ", "で", "ど"] },
  { label: "ば行", kana: ["ば", "び", "ぶ", "べ", "ぼ"] },
  { label: "ぱ行", kana: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] },
];
