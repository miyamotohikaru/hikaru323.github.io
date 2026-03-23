"use client";

import { useState, useEffect, FormEvent } from "react";

interface KojienEntryData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  formatted: string;
}

interface SubmitResult {
  exists: boolean;
  word: string;
  reason?: string;
  kojienEntry?: KojienEntryData;
}

interface SubmitFormProps {
  onResult: (result: SubmitResult) => void;
  onLoading: (loading: boolean) => void;
}

export default function SubmitForm({ onResult, onLoading }: SubmitFormProps) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fictionary_nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedWord) { setError("言葉を入力してください。"); return; }
    if (!trimmedMeaning) { setError("意味を入力してください。"); return; }
    if (!trimmedNickname) { setError("ニックネームを入力してください。"); return; }

    setIsLoading(true);
    onLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmedWord, meaning: trimmedMeaning }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "申請に失敗しました。");
        return;
      }

      localStorage.setItem("fictionary_nickname", trimmedNickname);
      onResult({ ...data, nickname: trimmedNickname });
    } catch {
      setError("通信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="submit-container">
      <h2 className="submit-heading">新しい言葉を辞典に載せる</h2>
      <form onSubmit={handleSubmit} className="submit-form">
        <div className="submit-field">
          <input
            type="text"
            value={word}
            onChange={(e) => { setWord(e.target.value); setError(null); }}
            placeholder="言葉を入力..."
            className="submit-input"
            maxLength={20}
            disabled={isLoading}
          />
        </div>
        <div className="submit-field">
          <textarea
            value={meaning}
            onChange={(e) => { setMeaning(e.target.value); setError(null); }}
            placeholder="どんな意味？（自由に書いてください）"
            className="submit-textarea"
            maxLength={200}
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div className="submit-field">
          <input
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(null); }}
            placeholder="あなたのニックネーム"
            className="submit-input"
            maxLength={15}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !word.trim() || !meaning.trim() || !nickname.trim()}
        >
          {isLoading ? (
            <span className="submit-loading">審査中…</span>
          ) : (
            "辞典に申請する"
          )}
        </button>
      </form>
      <p className="submit-note">※ 実在する言葉は掲載をお断りしております</p>

      {error && (
        <div className="error-message fade-in">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
