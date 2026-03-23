"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import LookupResult from "@/components/LookupResult";
import DictionaryPage from "@/components/DictionaryPage";

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
  const [lookupResult, setLookupResult] = useState<LookupData | null>(null);
  const [displayedResult, setDisplayedResult] = useState<LookupData | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPageOpen, setIsPageOpen] = useState(false);

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

    </main>
  );
}
