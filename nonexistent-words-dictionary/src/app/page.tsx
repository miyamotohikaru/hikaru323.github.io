"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import WordCard from "@/components/WordCard";
import { LookupResponse } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<(LookupResponse & { id?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (word: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました。");
        return;
      }

      setResult(data);
    } catch {
      setError("通信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="hero">
        <h1 className="site-title">存在しない言葉辞典</h1>
        <p className="site-subtitle">存在しない言葉だけを受け付ける辞書。</p>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="result-area">
        {error && (
          <div className="error-message fade-in">
            <p>{error}</p>
          </div>
        )}

        {result && result.exists && (
          <div className="exists-message fade-in">
            <div className="exists-icon">✕</div>
            <h2>この言葉は実在するため、<br />本辞典には掲載しておりません。</h2>
            <p className="exists-note">
              存在しない言葉をお考えになって、<br />もう一度お引きください。
            </p>
          </div>
        )}

        {result && !result.exists && (
          <WordCard
            entry={{
              id: result.id || "",
              word: result.word,
              reading: result.reading,
              partOfSpeech: result.partOfSpeech,
              definition: result.definition,
              etymology: result.etymology,
              examples: result.examples,
              synonyms: result.synonyms,
              notes: result.notes,
            }}
          />
        )}
      </div>

      <nav className="bottom-nav">
        <Link href="/gojuon" className="nav-link">
          五十音一覧を見る →
        </Link>
      </nav>
    </main>
  );
}
