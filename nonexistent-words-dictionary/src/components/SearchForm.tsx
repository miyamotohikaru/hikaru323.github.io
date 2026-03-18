"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PARTS_OF_SPEECH } from "@/lib/types";
import Link from "next/link";

export default function SubmitForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form fields
  const [word, setWord] = useState("");
  const [reading, setReading] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("名詞");
  const [definition, setDefinition] = useState("");
  const [nickname, setNickname] = useState("");
  const [etymology, setEtymology] = useState("");
  const [example1, setExample1] = useState("");
  const [example2, setExample2] = useState("");
  const [synonyms, setSynonyms] = useState("");

  // Rate limit (client-side)
  const [canSubmit, setCanSubmit] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("fictionary_nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingId(null);

    // Client-side rate limit
    const lastSubmit = localStorage.getItem("fictionary_last_submit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      setError("投稿は1分間に1回までです。少々お待ちください。");
      return;
    }

    if (!word.trim() || !reading.trim() || !definition.trim() || !nickname.trim()) {
      setError("必須項目をすべて入力してください。");
      return;
    }

    const hiraganaRegex = /^[ぁ-ゖー]+$/;
    if (!hiraganaRegex.test(reading.trim())) {
      setError("読みはひらがなで入力してください。");
      return;
    }

    setIsLoading(true);
    setCanSubmit(false);

    try {
      const examples = [example1.trim(), example2.trim()].filter(Boolean);

      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.trim(),
          reading: reading.trim(),
          partOfSpeech,
          definition: definition.trim(),
          etymology: etymology.trim(),
          examples,
          synonyms: synonyms.trim(),
          nickname: nickname.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.existingId) {
        setError("この言葉はすでに掲載されています。");
        setExistingId(data.existingId);
        return;
      }

      if (!res.ok) {
        setError(data.error || "投稿に失敗しました。");
        return;
      }

      // Save nickname and timestamp
      localStorage.setItem("fictionary_nickname", nickname.trim());
      localStorage.setItem("fictionary_last_submit", Date.now().toString());

      // Navigate to the new word page
      router.push(`/word/${data.id}`);
    } catch {
      setError("通信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
      setTimeout(() => setCanSubmit(true), 60000);
    }
  };

  return (
    <div className="submit-form-container">
      <form onSubmit={handleSubmit} className="submit-form">
        {/* Main input - looks like search bar */}
        <div className="search-input-wrapper">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="存在しない言葉を入力してください"
            className="search-input"
            maxLength={20}
            disabled={isLoading}
          />
        </div>

        {/* Reveal form fields when word is entered */}
        {word.trim() && (
          <div className="form-fields fade-in">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">読み（ひらがな）<span className="required">*</span></label>
                <input
                  type="text"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  placeholder="ひらがなで入力"
                  className="form-input"
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label className="form-label">品詞<span className="required">*</span></label>
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="form-select"
                >
                  {PARTS_OF_SPEECH.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">定義文<span className="required">*</span></label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="この言葉の意味を書いてください"
                className="form-textarea"
                maxLength={200}
                rows={3}
              />
              <span className="char-count">{definition.length}/200</span>
            </div>

            <div className="form-group">
              <label className="form-label">ニックネーム<span className="required">*</span></label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="投稿者名"
                className="form-input"
                maxLength={15}
              />
            </div>

            {/* Advanced fields toggle */}
            <button
              type="button"
              className="toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "▲ シンプルに戻す" : "▼ もっとくわしく書く"}
            </button>

            {showAdvanced && (
              <div className="advanced-fields fade-in">
                <div className="form-group">
                  <label className="form-label">語源</label>
                  <textarea
                    value={etymology}
                    onChange={(e) => setEtymology(e.target.value)}
                    placeholder="この言葉の由来（任意）"
                    className="form-textarea"
                    maxLength={200}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">例文1</label>
                  <input
                    type="text"
                    value={example1}
                    onChange={(e) => setExample1(e.target.value)}
                    placeholder="使い方の例（任意）"
                    className="form-input"
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">例文2</label>
                  <input
                    type="text"
                    value={example2}
                    onChange={(e) => setExample2(e.target.value)}
                    placeholder="別のシチュエーションでの例（任意）"
                    className="form-input"
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">類義語</label>
                  <input
                    type="text"
                    value={synonyms}
                    onChange={(e) => setSynonyms(e.target.value)}
                    placeholder="似た言葉（任意）"
                    className="form-input"
                    maxLength={30}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? "掲載中…" : "この言葉を辞典に載せる"}
            </button>
          </div>
        )}
      </form>

      {error && (
        <div className="error-message fade-in">
          <p>{error}</p>
          {existingId && (
            <p style={{ marginTop: "0.5rem" }}>
              <Link href={`/word/${existingId}`} className="error-link">
                掲載済みのページを見る →
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
