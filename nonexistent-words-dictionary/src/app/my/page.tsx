"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import KojienEntry from "@/components/KojienEntry";
import AuthorTitle from "@/components/AuthorTitle";
import type { WordEntry } from "@/lib/types";

export default function MyPage() {
  const [myWords, setMyWords] = useState<WordEntry[]>([]);
  const [likedWords, setLikedWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const authorToken = localStorage.getItem("fictionary_author_token");
    let likedIds: string[] = [];
    try {
      likedIds = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");
    } catch {
      likedIds = [];
    }
    const posts = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
    setPostsCount(posts);

    const fetchMyWords = async () => {
      if (!authorToken) return;
      try {
        const res = await fetch("/api/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorToken }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setMyWords(data.words || []);
      } catch {
        // silently fail
      }
    };

    const fetchLikedWords = async () => {
      if (likedIds.length === 0) return;
      try {
        const res = await fetch("/api/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: likedIds, type: "liked" }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setLikedWords(data.words || []);
      } catch {
        // silently fail
      }
    };

    Promise.all([fetchMyWords(), fetchLikedWords()]).finally(() => setLoading(false));
  }, []);

  return (
    <main className="main-content">
      <div className="my-page-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">あなたの語集</h1>
        <p className="my-stats">
          投稿 {postsCount}語 / 収蔵 {likedWords.length}語
          <span style={{ marginLeft: "0.75rem" }}><AuthorTitle /></span>
        </p>
      </div>

      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : (
        <>
          <div className="my-section">
            <h2 className="my-section-heading">投稿した語</h2>
            {myWords.length === 0 ? (
              <p className="my-empty">まだ投稿がありません。</p>
            ) : (
              <div className="my-list">
                {myWords.map((w) => (
                  <KojienEntry key={w.id} entry={w} />
                ))}
              </div>
            )}
          </div>

          <div className="my-section">
            <h2 className="my-section-heading">収蔵した語（いいねした語）</h2>
            {likedWords.length === 0 ? (
              <p className="my-empty">まだ収蔵がありません。</p>
            ) : (
              <div className="my-list">
                {likedWords.map((w) => (
                  <KojienEntry key={w.id} entry={w} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
