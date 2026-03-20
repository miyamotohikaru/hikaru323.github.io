"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import LookupResult from "@/components/LookupResult";
import DictionaryPage from "@/components/DictionaryPage";
import AdSense from "@/components/AdSense";
import Link from "next/link";
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
  const [displayedResult, setDisplayedResult] = useState<LookupData | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPageOpen, setIsPageOpen] = useState(false);

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
    setHasSearched(true);
    setLookupResult(result);

    if (displayedResult) {
      // Close current page, then open new one
      setIsPageOpen(false);
      setTimeout(() => {
        setDisplayedResult(result);
        setIsPageOpen(true);
      }, 350);
    } else {
      setDisplayedResult(result);
      setIsPageOpen(true);
    }
  };

  const handleClear = () => {
    setIsPageOpen(false);
    setTimeout(() => {
      setLookupResult(null);
      setDisplayedResult(null);
      setHasSearched(false);
    }, 350);
  };

  return (
    <main className="main-content">
      {/* Hero + Search */}
      <div className={`hero ${!hasSearched && !isLooking ? "hero-centered" : ""}`}>
        {!hasSearched && !isLooking && (
          <div className="hero-copy">
            <h1 className="hero-title">
              この辞典に載っている言葉は、<br />
              まだこの世界のどこにも存在しません。
            </h1>
            <p className="hero-subtitle">
              あなたが考えた「存在しない言葉」を入力してください。<br />
              辞典がその言葉を、永遠に記録します。
            </p>
          </div>
        )}
        <SearchForm
          onResult={handleResult}
          onLoading={(loading) => setIsLooking(loading)}
          onClear={handleClear}
        />
      </div>

      {/* Loading state */}
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

      {/* Result in DictionaryPage */}
      {!isLooking && displayedResult && (
        <DictionaryPage isOpen={isPageOpen}>
          <LookupResult result={displayedResult} />
        </DictionaryPage>
      )}

      {/* Recent Words - only before first search */}
      {!hasSearched && !isLooking && recentWords.length > 0 && (
        <>
          {totalCount >= 10 && recentWords[0] && (
            <section className="section">
              <span className="section-label-text">今日の一語</span>
              <Link href={`/word/${recentWords[0].id}`} className="today-word">
                <span className="today-word-title">{recentWords[0].word}</span>
                <span className="today-word-def">
                  {recentWords[0].definition.length > 60
                    ? recentWords[0].definition.substring(0, 60) + "…"
                    : recentWords[0].definition}
                </span>
              </Link>
            </section>
          )}

          <section className="section">
            <span className="section-label-text">最近の登録語</span>
            <div className="recent-words-list">
              {recentWords.map((w) => (
                <Link key={w.id} href={`/word/${w.id}`} className="recent-word-row">
                  <span className="recent-word-title">{w.word}</span>
                  <span className="recent-word-reading">【{w.reading}】</span>
                  <span className="recent-word-def">
                    {w.definition.length > 40
                      ? w.definition.substring(0, 40) + "…"
                      : w.definition}
                  </span>
                </Link>
              ))}
            </div>
            <AdSense slot="top-feed" />
            {totalCount >= 10 && (
              <p className="section-footer-text">
                現在 {totalCount} 語が掲載されています
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
