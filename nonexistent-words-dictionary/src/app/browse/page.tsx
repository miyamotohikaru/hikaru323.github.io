"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GOJUON_ROWS, WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";
import { useI18n } from "@/lib/i18n";

const GOJUON_TABS = GOJUON_ROWS.slice(0, 10); // あ〜わ行のみ（清音）

export default function BrowsePage() {
  const { t } = useI18n();
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    fetch("/api/words?limit=100&sort=newest")
      .then((res) => res.json())
      .then((data) => setAllWords(data.words || []))
      .catch(() => setAllWords([]))
      .finally(() => setLoading(false));
  }, []);

  // Group words by gojuon row
  const wordsByRow = new Map<string, WordEntry[]>();
  for (const row of GOJUON_ROWS) {
    wordsByRow.set(row.label, []);
  }
  for (const word of allWords) {
    if (!word.reading) continue;
    const firstChar = word.reading.charAt(0);
    for (const row of GOJUON_ROWS) {
      if (row.kana.includes(firstChar)) {
        wordsByRow.get(row.label)!.push(word);
        break;
      }
    }
  }

  // Sort within each group by reading
  for (const [, words] of wordsByRow) {
    words.sort((a, b) => a.reading.localeCompare(b.reading));
  }

  // Count for tab indicators
  const rowCounts = new Map<string, number>();
  for (const [label, words] of wordsByRow) {
    rowCounts.set(label, words.length);
  }

  // Rows to display
  const displayRows = activeRow
    ? GOJUON_ROWS.filter((r) => r.label === activeRow)
    : GOJUON_ROWS;

  const handleTabClick = (label: string | null) => {
    setActiveRow(label);
    if (label) {
      const el = sectionRefs.current.get(label);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <main className="main-content">
      <div className="browse-header">
        <Link href="/" className="back-link">{t("common.backToDict")}</Link>
        <h1 className="page-title">{t("browse.title")}</h1>
        <p className="page-subtitle">
          {t("browse.subtitle")}
          {" "}{allWords.length} {t("browse.wordsCount")}
        </p>
      </div>

      {/* 辞書の索引（つめ/サムインデックス風） */}
      <div className="dict-index-container">
        <div className="dict-index-sidebar">
          <button
            className={`dict-index-tab ${activeRow === null ? "active" : ""}`}
            onClick={() => handleTabClick(null)}
          >
            {t("browse.allTab")}
          </button>
          {GOJUON_TABS.map((row) => {
            const count = rowCounts.get(row.label) || 0;
            return (
              <button
                key={row.label}
                className={`dict-index-tab ${activeRow === row.label ? "active" : ""} ${count === 0 ? "empty" : ""}`}
                onClick={() => handleTabClick(row.label)}
              >
                <span className="dict-index-kana">{row.kana[0]}</span>
                {count > 0 && <span className="dict-index-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* 単語一覧 */}
        <div className="dict-index-content">
          {loading ? (
            <p className="loading-text">{t("loading.text")}</p>
          ) : allWords.length === 0 ? (
            <p className="empty-text">
              {t("browse.noWords").split("\n").map((line, i) => (
                <span key={i}>{line}{i < 1 && <br />}</span>
              ))}
            </p>
          ) : (
            <div className="browse-entries">
              {displayRows.map((row) => {
                const words = wordsByRow.get(row.label) || [];
                if (words.length === 0 && activeRow === null) return null;
                return (
                  <section
                    key={row.label}
                    className="dict-index-section"
                    ref={(el) => { if (el) sectionRefs.current.set(row.label, el); }}
                  >
                    <div className="dict-index-heading">
                      <span className="dict-index-heading-kana">{row.kana[0]}</span>
                      <span className="dict-index-heading-label">{row.label}</span>
                      <span className="dict-index-heading-line" />
                    </div>
                    {words.length === 0 ? (
                      <p className="browse-row-empty">{t("browse.emptyRow")}</p>
                    ) : (
                      <div className="browse-row-entries">
                        {words.map((word) => (
                          <KojienEntry key={word.id} entry={word} showMeta />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
