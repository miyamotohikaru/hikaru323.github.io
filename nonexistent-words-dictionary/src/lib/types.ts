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
  kojienFormatted: string;
  authorToken: string;
  likes: number;
  viewCount: number;
  isVisible: boolean;
  source: "user" | "ai";
  createdAt?: string | null;
  featuredDate?: string | null;
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

export const PARTS_OF_SPEECH_SHORT: Record<string, string> = {
  "名詞": "名",
  "動詞": "動",
  "形容詞": "形",
  "形容動詞": "形動",
  "副詞": "副",
  "感動詞": "感",
  "連体詞": "連体",
  "接続詞": "接",
  "その他": "他",
};

export interface KojienEntryData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
}

export const AUTHOR_TITLES = [
  { min: 0, title: "見習い辞書編纂者" },
  { min: 1, title: "駆け出し辞書編纂者" },
  { min: 3, title: "辞書編纂者" },
  { min: 5, title: "熟練辞書編纂者" },
  { min: 10, title: "辞書編纂の匠" },
  { min: 20, title: "言葉の創造主" },
  { min: 50, title: "伝説の辞書編纂者" },
] as const;

export function getAuthorTitle(wordCount: number): string {
  let title: string = AUTHOR_TITLES[0].title;
  for (const t of AUTHOR_TITLES) {
    if (wordCount >= t.min) title = t.title as string;
  }
  return title;
}

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
