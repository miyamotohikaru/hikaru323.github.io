"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GOJUON_ROWS, WordEntry } from "@/lib/types";
import AdSense from "@/components/AdSense";

// Flatten all kana into a single array for the grid
const ALL_KANA = GOJUON_ROWS.flatMap((row) => row.kana);

export default function BrowsePage() {
  const [selectedKana, setSelectedKana] = useState("あ");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWords = useCallback(async (kana: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/words?kana=${encodeURIComponent(kana)}`);
      const data = await res.json();
      setWords(data.words || []);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(selectedKana);
  }, [selectedKana, fetchWords]);

  const handleKanaClick = (kana: string) => {
    setSelectedKana(kana);
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

      {/* Gojuon Grid */}
      <div className="gojuon-grid">
        {ALL_KANA.map((k) => (
          <button
            key={k}
            className={`gojuon-cell ${selectedKana === k ? "active" : ""}`}
            onClick={() => handleKanaClick(k)}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Word List */}
      <h2 className="kana-heading">「{selectedKana}」</h2>
      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : words.length === 0 ? (
        <p className="empty-text">
          「{selectedKana}」で始まる言葉はまだありません。<br />
          あなたが最初の一語を投稿してみませんか？
        </p>
      ) : (
        <>
          <div className="browse-word-list">
            {words.map((w) => (
              <Link key={w.id} href={`/word/${w.id}`} className="browse-word-item">
                <span>
                  <span className="browse-word-name">{w.word}</span>
                  <span className="browse-word-reading">【{w.reading}】</span>
                </span>
                <span className="browse-word-def">
                  {w.definition.length > 50
                    ? w.definition.substring(0, 50) + "…"
                    : w.definition}
                </span>
              </Link>
            ))}
          </div>
          {words.length > 9 && <AdSense slot="browse-feed" />}
        </>
      )}
    </main>
  );
}
