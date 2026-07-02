"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Lang } from "@/data/cards";
import type { Bi } from "@/lib/meta";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ja",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja");

  useEffect(() => {
    const saved = window.localStorage.getItem("da-lang");
    if (saved === "en") {
      setLangState("en");
      document.documentElement.lang = "en";
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("da-lang", l);
    document.documentElement.lang = l;
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const tx = useCallback((bi: Bi) => bi[lang], [lang]);
  return { lang, setLang, tx };
}

export const UI = {
  archive: { ja: "ARCHIVE", en: "ARCHIVE" },
  entries: { ja: "ENTRIES", en: "ENTRIES" },
  navIndex: { ja: "Index", en: "Index" },
  navLineage: { ja: "Lineage", en: "Lineage" },
  navAbout: { ja: "About", en: "About" },
  issue: { ja: "ISSUE 01", en: "ISSUE 01" },
  statEntries: { ja: "項目", en: "Entries" },
  statStatuses: { ja: "分類", en: "Statuses" },
  statYears: { ja: "年", en: "Years" },
  statRegions: { ja: "地域", en: "Regions" },
  sort: { ja: "SORT", en: "SORT" },
  view: { ja: "VIEW", en: "VIEW" },
  all: { ja: "すべて", en: "All" },
  filter: { ja: "絞り込み", en: "Filter" },
  axes: { ja: "5軸", en: "5 axes" },
  sortBy: { ja: "並び替え", en: "Sort by" },
  status: { ja: "ステータス", en: "Status" },
  power: { ja: "権力性", en: "Power" },
  yearRange: { ja: "年代", en: "Years" },
  namedYear: { ja: "命名年", en: "Named" },
  region: { ja: "発祥地域", en: "Region" },
  reset: { ja: "リセット", en: "Reset" },
  showResults: { ja: "結果を見る", en: "Show results" },
  results: { ja: "件", en: "entries" },
  noResults: { ja: "該当するエントリがありません。", en: "No entries match." },
  search: { ja: "検索", en: "Search" },
  searchPlaceholder: { ja: "診断名・英語名・番号で検索…", en: "Search by name, English name, or number…" },
  searchHint: { ja: "↑↓で移動 / Enterで開く / Escで閉じる", en: "↑↓ to move / Enter to open / Esc to close" },
  close: { ja: "閉じる", en: "Close" },
  viewGrid: { ja: "カードを並べる", en: "Grid" },
  viewTimeline: { ja: "年代別に並べる", en: "By timeline" },
  viewLineage: { ja: "診断の系譜", en: "Lineage of diagnoses" },
  timelineSub: { ja: "命名年順・フィルタ適用", en: "By year of naming, filters applied" },
  lineageSub: { ja: "改名・分解・削除のつながりを辿る。", en: "Tracing renamings, splits, and deletions." },
  backToIndex: { ja: "索引", en: "Index" },
  backToTimeline: { ja: "年表", en: "Timeline" },
  backToLineage: { ja: "系譜", en: "Lineage" },
  summary: { ja: "要約", en: "Summary" },
  symptom: { ja: "症状", en: "Symptoms" },
  history: { ja: "歴史的文脈", en: "Historical context" },
  debate: { ja: "論点", en: "Debate" },
  lineageSection: { ja: "系譜", en: "Lineage" },
  powerTags: { ja: "権力性タグ", en: "Power tags" },
  adjacent: { ja: "近接エントリ", en: "Adjacent entries" },
  named: { ja: "命名", en: "Named" },
  lifespan: { ja: "寿命", en: "Lifespan" },
  origin: { ja: "起源", en: "Origin" },
  prevEntry: { ja: "前へ", en: "Prev" },
  nextEntry: { ja: "次へ", en: "Next" },
  aboutTitle: { ja: "いつから、その“障害”は障害になったのか？", en: "When did that “disorder” become a disorder?" },
  aboutLead: {
    ja: "精神医学の診断名151件を、歴史的・批評的にアーカイブする図鑑。医学辞典の権威ではなく、診断という営みそのものを問い直すための、自費出版のジンのような場所。",
    en: "An illustrated archive of 151 psychiatric diagnoses, historical and critical. Not the authority of a medical dictionary, but a self-published zine for questioning the very act of diagnosis.",
  },
  aboutStatuses: { ja: "ステータス（5種）", en: "Statuses (5)" },
  aboutData: { ja: "収録データ", en: "The data" },
  langLabel: { ja: "JA", en: "EN" },
  notTranslated: { ja: "", en: "Japanese text — English translation coming in the next batch." },
} as const;
