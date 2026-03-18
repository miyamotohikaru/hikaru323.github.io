"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import LookupResult from "@/components/LookupResult";
import WordCard from "@/components/WordCard";
import AdSense from "@/components/AdSense";
import { WordEntry } from "@/lib/types";

interface LookupData {
  exists: boolean;
  word: string;
  reading?: string;
  partOfSpeech?: string;
  definition?: string;
  note?: string;
  etymology?: string;
  examples?: string[];
  synonyms?: string;
}

export default function Home() {
  const [recentWords, setRecentWords] = useState<WordEntry[]>([]);
  const [todayWord, setTodayWord] = useState<WordEntry | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [lookupResult, setLookupResult] = useState<LookupData | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch("/api/words?sort=newest&limit=10")
      .then((res) => res.json())
      .then((data) => {
        const words = data.words || [];
        setRecentWords(words);
        setTotalCount(words.length);

        if (words.length >= 10) {
          const today = new Date();
          const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
          const index = seed % words.length;
          setTodayWord(words[index]);
        }
      })
      .catch(() => {});
  }, []);

  const handleResult = (result: LookupData) => {
    setLookupResult(result);
    setHasSearched(true);
  };

  const handleClear = () => {
    setLookupResult(null);
    setHasSearched(false);
  };

  return (
    <main className="main-content">
      {/* Initial: centered search bar only */}
      <div className={`hero ${!hasSearched && !isLooking ? "hero-centered" : ""}`}>
        <h1 className="site-title">存在しない言葉辞典</h1>
        <SearchForm
          onResult={handleResult}
          onLoading={(loading) => setIsLooking(loading)}
          onClear={handleClear}
        />
      </div>

      {/* Loading state */}
      {isLooking && (
        <div className="lookup-loading fade-in">
          <div className="lookup-loading-book">
            <div className="lookup-loading-page" />
            <div className="lookup-loading-page" />
            <div className="lookup-loading-page" />
          </div>
          <p className="lookup-loading-text">辞典をめくっています…</p>
        </div>
      )}

      {/* Lookup Result */}
      {!isLooking && lookupResult && (
        <LookupResult result={lookupResult} />
      )}

      {/* Today's Word - only before first search */}
      {!hasSearched && !isLooking && todayWord && (
        <section className="section">
          <h2 className="section-title">今日の一語</h2>
          <WordCard entry={todayWord} />
        </section>
      )}

      {/* Recent Words - only before first search */}
      {!hasSearched && !isLooking && recentWords.length > 0 && (
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
