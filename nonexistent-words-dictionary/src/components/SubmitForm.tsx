"use client";

import { useState, useEffect, FormEvent } from "react";
import type { KojienEntryData } from "@/lib/types";

interface SubmitFormProps {
  onResult: (result: { exists: boolean; word: string; reason?: string; kojienEntry?: KojienEntryData }) => void;
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

    const trimWord = word.trim();
    const trimMeaning = meaning.trim();
    const trimNick = nickname.trim();

    if (!trimWord) { setError("言葉を入力してください。"); return; }
    if (!trimMeaning) { setError("どんな意味か入力してください。"); return; }
    if (!trimNick) { setError("ニックネームを入力してください。"); return; }

    setIsLoading(true);
    onLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimWord, meaning: trimMeaning }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "申請に失敗しました。");
        return;
      }

      localStorage.setItem("fictionary_nickname", trimNick);
      onResult({ ...data, nickname: trimNick });
    } catch {
      setError("通信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="submit-section">
      <h2 className="submit-heading">新しい言葉を辞典に載せる</h2>
      <form onSubmit={handleSubmit} className="submit-form">
        <div className="submit-field">
          <label className="submit-label">言葉</label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="あなたの造語を入力..."
            className="submit-input"
            maxLength={20}
            disabled={isLoading}
          />
        </div>
        <div className="submit-field">
          <label className="submit-label">どんな意味？</label>
          <textarea
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="この言葉の意味を自由に書いてください"
            className="submit-textarea"
            maxLength={200}
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div className="submit-field">
          <label className="submit-label">ニックネーム</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="あなたの名前"
            className="submit-input"
            maxLength={15}
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "編纂中…" : "辞典に申請する"}
        </button>
        <p className="submit-hint">※ 実在する言葉は掲載をお断りしております</p>
      </form>
      {error && <div className="submit-error fade-in"><p>{error}</p></div>}
    </div>
  );
}
