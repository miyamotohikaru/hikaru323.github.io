"use client";

import { useState, FormEvent } from "react";

interface SearchFormProps {
  onSearch: (word: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="存在しない言葉を入力してください"
          className="search-input"
          maxLength={50}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <span className="loading-dots">
              <span>編</span><span>纂</span><span>中</span>
            </span>
          ) : (
            "引く"
          )}
        </button>
      </div>
    </form>
  );
}
