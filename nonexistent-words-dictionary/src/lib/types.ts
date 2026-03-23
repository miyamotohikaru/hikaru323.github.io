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

export interface KojienEntryData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  formatted: string;
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

export const AUTHOR_TITLES = [
  { minPosts: 1, minLikes: 0, title: "語録生" },
  { minPosts: 5, minLikes: 0, title: "語彙見習" },
  { minPosts: 10, minLikes: 0, title: "言語採集者" },
  { minPosts: 0, minLikes: 100, title: "語義職人" },
  { minPosts: 0, minLikes: 500, title: "語義博士" },
  { minPosts: 50, minLikes: 0, title: "言霊の番人" },
] as const;

export function getAuthorTitle(postsCount: number, totalLikes: number): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const t of AUTHOR_TITLES) {
    if (postsCount >= t.minPosts && totalLikes >= t.minLikes) {
      const score = t.minPosts + t.minLikes;
      if (score > bestScore) {
        bestScore = score;
        best = t.title;
      }
    }
  }
  return best;
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
