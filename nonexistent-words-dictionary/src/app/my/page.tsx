"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";
import AuthorTitle from "@/components/AuthorTitle";
import { useI18n } from "@/lib/i18n";

export default function MyPage() {
  const { t } = useI18n();
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
        <Link href="/" className="back-link">{t("common.backToDict")}</Link>
        <h1 className="page-title">{t("my.title")}</h1>
        {nickname && (
          <div className="my-profile">
            <span className="my-nickname">{nickname}</span>
            <AuthorTitle className="my-author-title" />
          </div>
        )}
        <p className="page-subtitle">
          {t("my.posted")} {myWords.length}{t("my.words")} / {t("my.collected")} {likedWords.length}{t("my.words")}
        </p>
      </div>

      {loading ? (
        <p className="loading-text">{t("loading.text")}</p>
      ) : postsCount === 0 && likedWords.length === 0 ? (
        <div className="my-empty">
          <p className="empty-text">
            {t("my.empty").split("\n").map((line, i) => (
              <span key={i}>{line}{i < 2 && <br />}</span>
            ))}
          </p>
          <Link href="/" className="my-empty-link">{t("my.postWord")}</Link>
        </div>
      ) : (
        <>
          {/* 投稿した語 */}
          {myWords.length > 0 && (
            <section className="my-section">
              <h2 className="my-section-heading">{t("my.postedWords")}</h2>
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
              <h2 className="my-section-heading">{t("my.collectedWords")}</h2>
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
