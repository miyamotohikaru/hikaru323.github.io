"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GOJUON_ROWS, WordEntry } from "@/lib/types";
import Bookshelf from "@/components/Bookshelf";
import AdSense from "@/components/AdSense";

// Flatten all kana into a single array for the grid
const ALL_KANA = GOJUON_ROWS.flatMap((row) => row.kana);

// Group words by their starting kana character
function groupWordsByKana(words: WordEntry[]): Map<string, WordEntry[]> {
  const groups = new Map<string, WordEntry[]>();

  for (const kana of ALL_KANA) {
    groups.set(kana, []);
  }

  for (const word of words) {
    if (!word.reading) continue;
    const firstChar = word.reading.charAt(0);
    const existing = groups.get(firstChar);
    if (existing) {
      existing.push(word);
    }
  }

  return groups;
}

export default function BrowsePage() {
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllWords = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/words?limit=100&sort=newest");
        const data = await res.json();
        setAllWords(data.words || []);
      } catch {
        setAllWords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllWords();
  }, []);

  const groupedWords = groupWordsByKana(allWords);

  // Find kana groups that have words
  const kanaWithWords = ALL_KANA.filter(
    (k) => (groupedWords.get(k)?.length || 0) > 0
  );

  const scrollToKana = (kana: string) => {
    const el = document.getElementById(`kana-${kana}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">五十音一覧</h1>
        <p className="page-subtitle">
          登録された造語を五十音順でお引きいただけます。
        </p>
      </div>

      {/* Gojuon Grid - now as jump links */}
      <div className="gojuon-grid">
        {ALL_KANA.map((k) => {
          const hasWords = (groupedWords.get(k)?.length || 0) > 0;
          return (
            <button
              key={k}
              className={`gojuon-cell ${hasWords ? "has-words" : "empty"}`}
              onClick={() => hasWords && scrollToKana(k)}
              disabled={!hasWords}
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* All words grouped by kana */}
      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : allWords.length === 0 ? (
        <p className="empty-text">
          まだ言葉が登録されていません。<br />
          あなたが最初の一語を投稿してみませんか？
        </p>
      ) : (
        <>
          {kanaWithWords.map((kana, idx) => {
            const words = groupedWords.get(kana) || [];
            return (
              <section key={kana} id={`kana-${kana}`} className="kana-section">
                <h2 className="kana-heading">「{kana}」</h2>
                <Bookshelf words={words} />
                {idx % 3 === 2 && <AdSense slot="browse-feed" />}
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
