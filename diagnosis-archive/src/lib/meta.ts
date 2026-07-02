import { CARDS, type Card, type CardText, type Genre, type Lang, type Power, type Region, type Status } from "@/data/cards";

export type Bi = { ja: string; en: string };

export const STATUS_ORDER: Status[] = ["CURRENT", "PROMOTED", "DISPUTED", "RETIRED", "CULTURE-BOUND"];

export const STATUS_META: Record<Status, { label: Bi; desc: Bi }> = {
  CURRENT: {
    label: { ja: "現行", en: "Current" },
    desc: { ja: "DSM-5-TR / ICD-11 に現在も収載されている診断。", en: "Diagnoses currently listed in DSM-5-TR / ICD-11." },
  },
  PROMOTED: {
    label: { ja: "新規昇格", en: "Promoted" },
    desc: { ja: "近年の改訂で正式な診断として採用された概念。", en: "Concepts recently promoted to official diagnoses." },
  },
  DISPUTED: {
    label: { ja: "議論中", en: "Disputed" },
    desc: { ja: "正式収載に至らず、有効性が議論されている概念。", en: "Concepts still debated, not officially listed." },
  },
  RETIRED: {
    label: { ja: "廃止", en: "Retired" },
    desc: { ja: "かつて公式だったが、削除・改名などで退場した診断。", en: "Former diagnoses retired by deletion or renaming." },
  },
  "CULTURE-BOUND": {
    label: { ja: "文化圏", en: "Culture-bound" },
    desc: { ja: "特定の文化と結びついて記述されてきた症候群。", en: "Syndromes described in connection with specific cultures." },
  },
};

export const REGION_LABELS: Record<Region, Bi> = {
  na: { ja: "北米", en: "N. America" },
  eu: { ja: "欧州", en: "Europe" },
  easia: { ja: "東アジア", en: "E. Asia" },
  jp: { ja: "日本", en: "Japan" },
  sasia: { ja: "南アジア", en: "S. Asia" },
  africa: { ja: "アフリカ", en: "Africa" },
  latam: { ja: "中南米", en: "L. America" },
  arctic: { ja: "極北", en: "Arctic" },
};

export const POWER_LABELS: Record<Power, Bi> = {
  race: { ja: "人種", en: "Race" },
  gender: { ja: "性別", en: "Gender" },
  class: { ja: "階級", en: "Class" },
  colonial: { ja: "植民地主義", en: "Colonialism" },
  labor: { ja: "労働", en: "Labor" },
  religion: { ja: "宗教", en: "Religion" },
  medical: { ja: "医療化", en: "Medicalization" },
  age: { ja: "年齢", en: "Age" },
  sexual: { ja: "性的指向", en: "Sexuality" },
  state: { ja: "国家権力", en: "State power" },
};

export const GENRE_LABELS: Record<Genre, Bi> = {
  delusion: { ja: "妄想・精神病", en: "Psychosis" },
  dissoc: { ja: "解離", en: "Dissociation" },
  mood: { ja: "気分", en: "Mood" },
  anxiety: { ja: "不安", en: "Anxiety" },
  eating: { ja: "食行動", en: "Eating" },
  addiction: { ja: "嗜癖", en: "Addiction" },
  personality: { ja: "パーソナリティ", en: "Personality" },
  somatic: { ja: "身体", en: "Somatic" },
  developmental: { ja: "発達", en: "Development" },
  sexual: { ja: "性", en: "Sexuality" },
};

export interface Era { from: number; to: number; label: Bi }

export const ERAS: Era[] = [
  { from: 1500, to: 1799, label: { ja: "前近代", en: "Premodern" } },
  { from: 1800, to: 1899, label: { ja: "精神医学の成立", en: "The Birth of Psychiatry" } },
  { from: 1900, to: 1949, label: { ja: "心理学の確立", en: "Psychology Established" } },
  { from: 1950, to: 1979, label: { ja: "分類の模索", en: "In Search of Classification" } },
  { from: 1980, to: 1999, label: { ja: "DSM体系の時代", en: "The DSM Era" } },
  { from: 2000, to: 2030, label: { ja: "デジタル時代", en: "The Digital Age" } },
];

/* ── 表示用ステータス（3分類・ユーザー指定 2026-07-03） ──
   元データの5分類は保持しつつ、表示・絞り込みは 正式/議論中/廃止 に集約する。
   現行・新規昇格 → 正式 ／ 文化圏（正式収載ではない）→ 議論中 */
export type DisplayStatus = "OFFICIAL" | "DISPUTED" | "RETIRED";

export const DISPLAY_STATUS_ORDER: DisplayStatus[] = ["OFFICIAL", "DISPUTED", "RETIRED"];

export const DISPLAY_STATUS_META: Record<DisplayStatus, { label: Bi }> = {
  OFFICIAL: { label: { ja: "正式", en: "Official" } },
  DISPUTED: { label: { ja: "議論中", en: "Disputed" } },
  RETIRED: { label: { ja: "廃止", en: "Retired" } },
};

export function displayStatus(card: Card): DisplayStatus {
  switch (card.cat) {
    case "RETIRED":
      return "RETIRED";
    case "DISPUTED":
    case "CULTURE-BOUND":
      return "DISPUTED";
    default:
      return "OFFICIAL";
  }
}

export const CARD_BY_ID = new Map<string, Card>(CARDS.map((c) => [c.id, c]));

export const YEAR_MIN = Math.min(...CARDS.map((c) => c.year));
export const YEAR_MAX = Math.max(...CARDS.map((c) => c.year));

export const STATS = {
  entries: CARDS.length,
  statuses: DISPLAY_STATUS_ORDER.length,
  years: YEAR_MAX - YEAR_MIN,
  regions: new Set(CARDS.map((c) => c.region)).size,
};

/** 表示用テキスト。EN表示時は未翻訳フィールドを日本語へフォールバック。
    ENのタイトルは「（日本）」のような全角括弧の国名注記を外す（ユーザー指定） */
export function cardText(card: Card, lang: Lang): CardText {
  if (lang === "ja") return card.ja;
  return {
    name: (card.en.name || card.ja.name).replace(/（[^）]*）/g, "").trim(),
    enName: card.en.enName || card.ja.enName,
    reading: card.en.reading || card.ja.reading,
    meaning: card.en.meaning || card.ja.meaning,
    symptom: card.en.symptom || card.ja.symptom,
    history: card.en.history || card.ja.history,
    debate: card.en.debate || card.ja.debate,
  };
}

export function yearLabel(card: Card): string {
  return card.endYear ? `${card.year}–${card.endYear}` : String(card.year);
}

export function lifespanLabel(card: Card, lang: Lang): string {
  if (!card.endYear) return "—";
  const n = Math.max(1, card.endYear - card.year);
  return lang === "ja" ? `約${n}年` : `~${n} yrs`;
}

export type SortKey = "year-desc" | "year-asc" | "num" | "life" | "name";

export const SORT_LABELS: Record<SortKey, Bi> = {
  "year-desc": { ja: "年代 ↓", en: "Year ↓" },
  "year-asc": { ja: "年代 ↑", en: "Year ↑" },
  num: { ja: "番号順", en: "Number" },
  life: { ja: "寿命", en: "Lifespan" },
  name: { ja: "名前順", en: "Name" },
};

export function sortCards(cards: Card[], key: SortKey, lang: Lang): Card[] {
  const arr = [...cards];
  switch (key) {
    case "year-desc":
      return arr.sort((a, b) => b.year - a.year || a.num - b.num);
    case "year-asc":
      return arr.sort((a, b) => a.year - b.year || a.num - b.num);
    case "num":
      return arr.sort((a, b) => a.num - b.num);
    case "life":
      return arr.sort((a, b) => {
        const la = a.endYear ? a.endYear - a.year : Infinity;
        const lb = b.endYear ? b.endYear - b.year : Infinity;
        return la - lb || a.num - b.num;
      });
    case "name":
      return arr.sort((a, b) => cardText(a, lang).name.localeCompare(cardText(b, lang).name, lang));
  }
}

export interface Filters {
  status: DisplayStatus | null;
  powers: Power[];
  regions: Region[];
  yearFrom: number;
  yearTo: number;
}

export const DEFAULT_FILTERS: Filters = {
  status: null,
  powers: [],
  regions: [],
  yearFrom: YEAR_MIN,
  yearTo: YEAR_MAX,
};

export function applyFilters(cards: Card[], f: Filters): Card[] {
  return cards.filter((c) => {
    if (f.status && displayStatus(c) !== f.status) return false;
    if (f.powers.length && !f.powers.some((p) => c.power.includes(p))) return false;
    if (f.regions.length && !f.regions.includes(c.region)) return false;
    if (c.year < f.yearFrom || c.year > f.yearTo) return false;
    return true;
  });
}

export function isFiltered(f: Filters): boolean {
  return (
    f.status !== null ||
    f.powers.length > 0 ||
    f.regions.length > 0 ||
    f.yearFrom !== YEAR_MIN ||
    f.yearTo !== YEAR_MAX
  );
}
