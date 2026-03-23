"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";
import AuthorTitle from "@/components/AuthorTitle";

export default function MyPage() {
  const [myWords, setMyWords] = useState<WordEntry[]>([]);
  const [likedWords, setLikedWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const savedNickname = localStorage.getItem("fictionary_nickname") || "";
    const savedPostsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
    const authorToken = localStorage.getItem("fictionary_author_token") || "";
    const likedIds: string[] = JSON.parse(localStorage.getItem("fictionary_likes") || "[]");

    setNickname(savedNickname);
    setPostsCount(savedPostsCount);

    const fetchData = async () => {
      try {
        const res = await fetch("/api/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorToken, likedIds }),
        });
        const data = await res.json();
        setMyWords(data.myWords || []);
        setLikedWords(data.likedWords || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="main-content">
      <div className="my-header">
        <Link href="/" className="back-link">← 辞典に戻る</Link>
        <h1 className="page-title">あなたの語集</h1>
        {nickname && (
          <div className="my-profile">
            <span className="my-nickname">{nickname}</span>
            <AuthorTitle className="my-author-title" />
          </div>
        )}
        <p className="page-subtitle">
          投稿 {myWords.length}語 / 収蔵 {likedWords.length}語
        </p>
      </div>

      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : postsCount === 0 && likedWords.length === 0 ? (
        <div className="my-empty">
          <p className="empty-text">
            まだ語集が空です。<br />
            言葉を投稿したり、いいねしたりすると<br />
            ここに集まってきます。
          </p>
          <Link href="/" className="my-empty-link">言葉を投稿する →</Link>
        </div>
      ) : (
        <>
          {/* 投稿した語 */}
          {myWords.length > 0 && (
            <section className="my-section">
              <h2 className="my-section-heading">投稿した語</h2>
              <div className="browse-row-entries">
                {myWords.map((w) => (
                  <KojienEntry key={w.id} entry={w} showMeta />
                ))}
              </div>
            </section>
          )}

          {/* 収蔵した語（いいねした語） */}
          {likedWords.length > 0 && (
            <section className="my-section">
              <h2 className="my-section-heading">収蔵した語（いいねした語）</h2>
              <div className="browse-row-entries">
                {likedWords.map((w) => (
                  <KojienEntry key={w.id} entry={w} showMeta />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
