export interface WordEntry {
  id?: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string;
  notes: string;
  createdAt?: Date;
}

export interface ExistsResponse {
  exists: true;
  word: string;
}

export interface NotExistsResponse {
  exists: false;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string;
  notes: string;
}

export type LookupResponse = ExistsResponse | NotExistsResponse;

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
