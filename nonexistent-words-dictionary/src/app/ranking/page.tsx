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
        <>
          <div className="ranking-list">
            {words.map((w, i) => (
              <Link key={w.id} href={`/word/${w.id}`} className="ranking-item">
                <span className="ranking-rank">{i + 1}</span>
                <div className="ranking-content">
                  <div className="ranking-word">{w.word}</div>
                  <div className="ranking-def">
                    {w.definition.length > 60
                      ? w.definition.substring(0, 60) + "…"
                      : w.definition}
                  </div>
                  <div className="ranking-meta">
                    {w.likes > 0 && (
                      <span className="ranking-likes">♥ {w.likes}</span>
                    )}
                    <span className="ranking-nickname">{w.nickname}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <AdSense slot="ranking-feed" />
        </>
      )}
    </main>
  );
}
