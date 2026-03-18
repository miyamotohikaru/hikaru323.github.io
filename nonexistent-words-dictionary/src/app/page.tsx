"use client";

import { useState, useEffect } from "react";
import SubmitForm from "@/components/SearchForm";
import WordCard from "@/components/WordCard";
import AdSense from "@/components/AdSense";
import { WordEntry } from "@/lib/types";

export default function Home() {
  const [recentWords, setRecentWords] = useState<WordEntry[]>([]);
  const [todayWord, setTodayWord] = useState<WordEntry | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Fetch recent words
    fetch("/api/words?sort=newest&limit=10")
      .then((res) => res.json())
      .then((data) => {
        const words = data.words || [];
        setRecentWords(words);
        setTotalCount(words.length);

        // Today's word: pick based on date seed if 10+ words
        if (words.length >= 10) {
          const today = new Date();
          const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
          const index = seed % words.length;
          setTodayWord(words[index]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="main-content">
      <div className="hero">
        <h1 className="site-title">存在しない言葉辞典</h1>
        <p className="site-subtitle">
          存在しない言葉だけを受け付ける辞書。<br />
          あなたの造語で、空っぽの辞典を育ててください。
        </p>
        <SubmitForm />
      </div>

      {/* Today's Word */}
      {todayWord && (
        <section className="section">
          <h2 className="section-title">今日の一語</h2>
          <WordCard entry={todayWord} />
        </section>
      )}

      {/* Recent Words */}
      {recentWords.length > 0 && (
        <section className="section">
          <h2 className="section-title">みんなが最近つくった言葉</h2>
          <div className="word-grid">
            {recentWords.map((word, index) => (
              <div key={word.id}>
                <WordCard entry={word} compact />
                {index === 4 && <AdSense slot="top-feed" />}
              </div>
            ))}
          </div>
          {totalCount >= 10 && (
            <p className="section-footer-text">
              現在 {totalCount} 語が掲載されています
            </p>
          )}
        </section>
      )}
    </main>
  );
}
