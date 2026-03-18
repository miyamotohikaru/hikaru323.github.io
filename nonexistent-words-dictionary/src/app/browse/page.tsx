"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GOJUON_ROWS, WordEntry } from "@/lib/types";
import Bookshelf from "@/components/Bookshelf";
import AdSense from "@/components/AdSense";

export default function BrowsePage() {
  const [selectedRow, setSelectedRow] = useState(0);
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

  const handleRowClick = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedKana(GOJUON_ROWS[rowIndex].kana[0]);
  };

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
          登録された造語を五十音順でお引きいただけます。<br />
          背表紙をクリックすると本を取り出せます。
        </p>
      </div>

      <div className="gojuon-layout">
        <nav className="gojuon-nav">
          <div className="row-tabs">
            {GOJUON_ROWS.map((row, i) => (
              <button
                key={row.label}
                className={`row-tab ${selectedRow === i ? "active" : ""}`}
                onClick={() => handleRowClick(i)}
              >
                {row.label}
              </button>
            ))}
          </div>
          <div className="kana-tabs">
            {GOJUON_ROWS[selectedRow].kana.map((k) => (
              <button
                key={k}
                className={`kana-tab ${selectedKana === k ? "active" : ""}`}
                onClick={() => handleKanaClick(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </nav>

        <div className="gojuon-content">
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
              <Bookshelf words={words} />
              {words.length > 9 && <AdSense slot="browse-feed" />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
