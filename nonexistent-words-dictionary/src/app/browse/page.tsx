"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GOJUON_ROWS, WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";

const GOJUON_TABS = GOJUON_ROWS.slice(0, 10); // あ〜わ行のみ（清音）

export default function BrowsePage() {
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRow, setActiveRow] = useState<string | null>(null);

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

  return (
    <main className="main-content">
      <div className="browse-header">
        <Link href="/" className="back-link">← 辞典に戻る</Link>
        <h1 className="page-title">辞書</h1>
        <p className="page-subtitle">
          収録語を五十音順でお引きいただけます。
          現在 {allWords.length} 語収録
        </p>
      </div>

      {/* 五十音タブ */}
      <div className="gojuon-tabs">
        <button
          className={`gojuon-tab ${activeRow === null ? "active" : ""}`}
          onClick={() => setActiveRow(null)}
        >
          全て
        </button>
        {GOJUON_TABS.map((row) => {
          const count = rowCounts.get(row.label) || 0;
          return (
            <button
              key={row.label}
              className={`gojuon-tab ${activeRow === row.label ? "active" : ""} ${count === 0 ? "empty" : ""}`}
              onClick={() => setActiveRow(row.label)}
            >
              {row.kana[0]}
            </button>
          );
        })}
      </div>

      {/* 単語一覧 */}
      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : allWords.length === 0 ? (
        <p className="empty-text">
          まだ言葉が登録されていません。<br />
          あなたが最初の一語を投稿してみませんか？
        </p>
      ) : (
        <div className="browse-entries">
          {displayRows.map((row) => {
            const words = wordsByRow.get(row.label) || [];
            if (words.length === 0 && activeRow === null) return null;
            return (
              <section key={row.label} className="browse-row-section">
                <h2 className="browse-row-heading">── {row.label} ──</h2>
                {words.length === 0 ? (
                  <p className="browse-row-empty">この行にはまだ言葉がありません</p>
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
    </main>
  );
}
