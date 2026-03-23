"use client";

import { useState, FormEvent } from "react";

interface LookupResult {
  exists: boolean;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  note?: string;
  etymology?: string;
  examples?: string[];
  synonyms?: string;
}

interface SearchFormProps {
  onResult: (result: LookupResult) => void;
  onLoading: (loading: boolean) => void;
  onClear: () => void;
}

export default function SearchForm({ onResult, onLoading, onClear }: SearchFormProps) {
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = word.trim();
    if (!trimmed) return;

    setIsLoading(true);
    onLoading(true);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "検索に失敗しました。");
        return;
      }

      onResult(data);
    } catch {
      setError("通信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setWord(value);
    setError(null);
    if (!value.trim()) {
      onClear();
    }
  };

  return (
    <div className="lookup-container">
      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="lookup-input-wrapper">
          <input
            type="text"
            value={word}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="存在しない言葉を入力..."
            className="lookup-input"
            maxLength={20}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="lookup-button"
            disabled={isLoading || !word.trim()}
          >
            {isLoading ? (
              <span className="lookup-spinner" />
            ) : (
              <span className="lookup-button-text">🔍</span>
            )}
          </button>
        </div>
        <p className="lookup-hint">
          ※ 実在する言葉は掲載をお断りしております
        </p>
      </form>

      {error && (
        <div className="error-message fade-in">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
