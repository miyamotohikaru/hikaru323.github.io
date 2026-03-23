"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";

type Tab = "popular" | "newest";

// 背表紙の色バリエーション
const SPINE_COLORS = [
  { bg: "linear-gradient(180deg, #792E29, #5a1f1b)", text: "#D9D4C8" },
  { bg: "linear-gradient(180deg, #2a3a2e, #1a2a1e)", text: "#c8d4c0" },
  { bg: "linear-gradient(180deg, #2e3a5a, #1e2a4a)", text: "#c0c8d8" },
  { bg: "linear-gradient(180deg, #4a3828, #3a2818)", text: "#d8ccb8" },
  { bg: "linear-gradient(180deg, #3a3425, #2a2418)", text: "#D9D4C8" },
  { bg: "linear-gradient(180deg, #5a4838, #4a3828)", text: "#e0d8c8" },
  { bg: "linear-gradient(180deg, #2e2e3a, #1e1e2a)", text: "#c8c8d8" },
  { bg: "linear-gradient(180deg, #583828, #482818)", text: "#d8c8b8" },
];

function getSpineColor(index: number) {
  return SPINE_COLORS[index % SPINE_COLORS.length];
}

// 本の厚み（文字数に応じて変える）
function getBookWidth(word: WordEntry) {
  const len = (word.definition || "").length;
  if (len > 80) return 70;
  if (len > 40) return 58;
  return 48;
}

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
        <div className="bookshelf">
          {/* 本棚の段を作る（1段に5〜6冊） */}
          {chunkArray(words, 5).map((shelf, shelfIndex) => (
            <div key={shelfIndex} className="bookshelf-row">
              <div className="bookshelf-books">
                {shelf.map((w, i) => {
                  const globalIndex = shelfIndex * 5 + i;
                  const color = getSpineColor(globalIndex);
                  const width = getBookWidth(w);
                  return (
                    <Link
                      key={w.id}
                      href={`/word/${w.id}`}
                      className="book-spine"
                      style={{
                        background: color.bg,
                        color: color.text,
                        width: `${width}px`,
                      }}
                    >
                      <span className="book-spine-rank">
                        {globalIndex + 1}
                      </span>
                      <span className="book-spine-title">{w.word}</span>
                      <span className="book-spine-author">{w.nickname}</span>
                      <span className="book-spine-likes">♡ {w.likes}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="bookshelf-board" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
