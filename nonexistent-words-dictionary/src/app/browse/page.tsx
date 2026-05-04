"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GOJUON_ROWS, ALPHABET_INDEX, WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";
import { useI18n } from "@/lib/i18n";

const GOJUON_TABS = GOJUON_ROWS.slice(0, 10); // あ〜わ行のみ（清音）

type IndexMode = "ja" | "en";

export default function BrowsePage() {
  const { lang, t } = useI18n();
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [indexMode, setIndexMode] = useState<IndexMode>(lang === "en" ? "en" : "ja");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    fetch("/api/words?limit=100&sort=newest")
      .then((res) => res.json())
      .then((data) => setAllWords(data.words || []))
      .catch(() => setAllWords([]))
      .finally(() => setLoading(false));
  }, []);

  // Split words by language
  const jaWords = allWords.filter((w) => ((w as { language?: string }).language || "ja") === "ja");
  const enWords = allWords.filter((w) => ((w as { language?: string }).language) === "en");

  // Group JA words by gojuon row
  const wordsByRow = new Map<string, WordEntry[]>();
  for (const row of GOJUON_ROWS) {
    wordsByRow.set(row.label, []);
  }
  for (const word of jaWords) {
    if (!word.reading) continue;
    const firstChar = word.reading.charAt(0);
    for (const row of GOJUON_ROWS) {
      if (row.kana.includes(firstChar)) {
        wordsByRow.get(row.label)!.push(word);
        break;
      }
    }
  }
  for (const [, words] of wordsByRow) {
    words.sort((a, b) => a.reading.localeCompare(b.reading));
  }

  // Group EN words by first letter
  const wordsByLetter = new Map<string, WordEntry[]>();
  for (const letter of ALPHABET_INDEX) {
    wordsByLetter.set(letter, []);
  }
  for (const word of enWords) {
    const firstLetter = word.word.charAt(0).toUpperCase();
    if (wordsByLetter.has(firstLetter)) {
      wordsByLetter.get(firstLetter)!.push(word);
    }
  }
  for (const [, words] of wordsByLetter) {
    words.sort((a, b) => a.word.localeCompare(b.word));
  }

  // Counts
  const rowCounts = new Map<string, number>();
  for (const [label, words] of wordsByRow) {
    rowCounts.set(label, words.length);
  }
  const letterCounts = new Map<string, number>();
  for (const [letter, words] of wordsByLetter) {
    letterCounts.set(letter, words.length);
  }

  // JA display rows
  const displayRows = activeRow
    ? GOJUON_ROWS.filter((r) => r.label === activeRow)
    : GOJUON_ROWS;

  // EN display letters
  const displayLetters = activeLetter
    ? ALPHABET_INDEX.filter((l) => l === activeLetter)
    : ALPHABET_INDEX;

  const handleTabClick = (label: string | null) => {
    setActiveRow(label);
    if (label) {
      const el = sectionRefs.current.get(label);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLetterClick = (letter: string | null) => {
    setActiveLetter(letter);
    if (letter) {
      const el = sectionRefs.current.get(`en-${letter}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Order: show primary index first based on UI language
  const showJaFirst = lang !== "en";

  const jaSection = (
    <div key="ja-index">
      <h2 className="page-title" style={{ marginTop: indexMode === "ja" ? 0 : "2rem" }}>
        {t("lang.indexTitle.ja")}
      </h2>
      <p className="page-subtitle">{t("browse.subtitle")} {jaWords.length} {t("browse.wordsCount")}</p>
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
        <div className="dict-index-content">
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
      </div>
    </div>
  );

  const enSection = (
    <div key="en-index">
      <h2 className="page-title" style={{ marginTop: indexMode === "en" ? 0 : "2rem" }}>
        {t("lang.indexTitle.en")}
      </h2>
      <p className="page-subtitle">{t("browse.azSubtitle")} {enWords.length} {t("browse.wordsCount")}</p>
      <div className="dict-index-container">
        <div className="dict-index-sidebar az-sidebar">
          <button
            className={`dict-index-tab ${activeLetter === null ? "active" : ""}`}
            onClick={() => handleLetterClick(null)}
          >
            {t("browse.allTab")}
          </button>
          {ALPHABET_INDEX.map((letter) => {
            const count = letterCounts.get(letter) || 0;
            return (
              <button
                key={letter}
                className={`dict-index-tab ${activeLetter === letter ? "active" : ""} ${count === 0 ? "empty" : ""}`}
                onClick={() => handleLetterClick(letter)}
              >
                <span className="dict-index-kana">{letter}</span>
                {count > 0 && <span className="dict-index-count">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="dict-index-content">
          {displayLetters.map((letter) => {
            const words = wordsByLetter.get(letter) || [];
            if (words.length === 0 && activeLetter === null) return null;
            return (
              <section
                key={letter}
                className="dict-index-section"
                ref={(el) => { if (el) sectionRefs.current.set(`en-${letter}`, el); }}
              >
                <div className="dict-index-heading">
                  <span className="dict-index-heading-kana">{letter}</span>
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
      </div>
    </div>
  );

  return (
    <main className="main-content">
      <div className="browse-header">
        <Link href="/" className="back-link">{t("common.backToDict")}</Link>
        <h1 className="page-title">{t("browse.title")}</h1>
        {/* Index mode toggle */}
        <div className="index-mode-toggle">
          <button
            className={`index-mode-btn ${indexMode === "ja" ? "active" : ""}`}
            onClick={() => { setIndexMode("ja"); setActiveLetter(null); }}
          >
            {t("lang.indexTitle.ja")}
          </button>
          <button
            className={`index-mode-btn ${indexMode === "en" ? "active" : ""}`}
            onClick={() => { setIndexMode("en"); setActiveRow(null); }}
          >
            {t("lang.indexTitle.en")}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">{t("loading.text")}</p>
      ) : allWords.length === 0 ? (
        <p className="empty-text">
          {t("browse.noWords").split("\n").map((line, i) => (
            <span key={i}>{line}{i < 1 && <br />}</span>
          ))}
        </p>
      ) : (
        <>
          {indexMode === "ja" && jaSection}
          {indexMode === "en" && enSection}
        </>
      )}
    </main>
  );
}
