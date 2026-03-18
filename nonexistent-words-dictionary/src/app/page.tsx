"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import LookupResult from "@/components/LookupResult";
import Bookshelf from "@/components/Bookshelf";
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

      {/* Loading state - Page flip animation */}
      {isLooking && (
        <div className="page-flip-loading fade-in">
          <div className="page-flip-book">
            <div className="page-flip-cover-back" />
            <div className="page-flip-page page-flip-page-1" />
            <div className="page-flip-page page-flip-page-2" />
            <div className="page-flip-page page-flip-page-3" />
            <div className="page-flip-page page-flip-page-4" />
            <div className="page-flip-cover-front" />
          </div>
          <p className="page-flip-text">辞典をめくっています…</p>
        </div>
      )}

      {/* Lookup Result */}
      {!isLooking && lookupResult && (
        <LookupResult result={lookupResult} />
      )}

      {/* Recent Words as Bookshelf - only before first search */}
      {!hasSearched && !isLooking && recentWords.length > 0 && (
        <section className="section">
          <h2 className="section-title">みんなが最近つくった言葉</h2>
          <Bookshelf words={recentWords} />
          <AdSense slot="top-feed" />
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
