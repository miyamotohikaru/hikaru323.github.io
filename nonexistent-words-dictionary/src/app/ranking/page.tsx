"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import AdSense from "@/components/AdSense";

type Tab = "popular" | "newest";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("popular");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const sort = activeTab === "popular" ? "popular" : "newest";
    fetch(`/api/words?sort=${sort}&limit=20`)
      .then((res) => res.json())
      .then((data) => setWords(data.words || []))
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">人気ランキング</h1>
        <p className="page-subtitle">みんなに愛されている造語たち。</p>
      </div>

      <div className="ranking-tabs">
        <button
          className={`ranking-tab ${activeTab === "popular" ? "active" : ""}`}
          onClick={() => setActiveTab("popular")}
        >
          殿堂入り
        </button>
        <button
          className={`ranking-tab ${activeTab === "newest" ? "active" : ""}`}
          onClick={() => setActiveTab("newest")}
        >
          新着
        </button>
      </div>

      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : words.length === 0 ? (
        <p className="empty-text">まだ投稿がありません。</p>
      ) : (
        <ol className="ranking-list">
          {words.map((word, index) => (
            <li key={word.id} className="ranking-item">
              <Link href={`/word/${word.id}`} className="ranking-link">
                <span className="ranking-rank">
                  {activeTab === "popular" ? `${index + 1}.` : ""}
                </span>
                <div className="ranking-content">
                  <div className="ranking-word-header">
                    <span className="word-list-word">{word.word}</span>
                    <span className="word-list-reading">【{word.reading}】</span>
                    <span className="word-list-pos">{word.partOfSpeech}</span>
                  </div>
                  <p className="word-list-def">{word.definition}</p>
                  <div className="ranking-meta">
                    <span className="ranking-likes">♥ {word.likes}</span>
                    <span className="ranking-nickname">{word.nickname}</span>
                  </div>
                </div>
              </Link>
              {index === 9 && <AdSense slot="ranking-feed" />}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
