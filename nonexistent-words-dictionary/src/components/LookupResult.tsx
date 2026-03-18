"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

interface LookupResultProps {
  result: LookupData;
}

export default function LookupResult({ result }: LookupResultProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [reading, setReading] = useState(result.reading || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fictionary_nickname");
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    setReading(result.reading || "");
  }, [result.reading]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      setSaveError("掲載者名を入力してください。");
      return;
    }

    if (!reading.trim()) {
      setSaveError("読み（ひらがな）を入力してください。");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: result.word,
          reading: reading.trim(),
          partOfSpeech: result.partOfSpeech || "名詞",
          definition: result.definition || "",
          etymology: result.etymology || "",
          examples: result.examples || [],
          synonyms: result.synonyms || "",
          nickname: nickname.trim(),
          source: "ai",
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.existingId) {
        setExistingId(data.existingId);
        setSaveError("この言葉はすでに掲載されています。");
        return;
      }

      if (!res.ok) {
        setSaveError(data.error || "掲載に失敗しました。");
        return;
      }

      localStorage.setItem("fictionary_nickname", nickname.trim());
      setSaved(true);
      setSavedId(data.id);

      // Navigate after brief delay
      setTimeout(() => router.push(`/word/${data.id}`), 1200);
    } catch {
      setSaveError("通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== 実在する言葉 → 丁重にお断り =====
  if (result.exists) {
    return (
      <div className="lookup-result lookup-rejection fade-in">
        <div className="rejection-stamp">掲載をお断りいたします</div>
        <div className="rejection-card">
          <div className="rejection-header">
            <span className="rejection-word">{result.word}</span>
          </div>
          <div className="rejection-footer">
            <p>この言葉はすでに世の中に存在しております。</p>
            <p>当辞典は、まだこの世に存在しない言葉のみを収録しております。</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== 存在しない言葉 → 辞書エントリ表示 =====
  return (
    <div className="lookup-result lookup-accepted fade-in">
      <div className="accepted-stamp">新語発見</div>
      <div className="accepted-card">
        <div className="word-header">
          <h2 className="word-title">{result.word}</h2>
        </div>

        <div className="word-body">
          {result.definition && (
            <div className="word-section">
              <div className="section-label">意味</div>
              <p className="word-definition">{result.definition}</p>
            </div>
          )}
        </div>

        {/* Save to dictionary */}
        {!saved ? (
          <div className="save-section">
            <div className="save-divider" />
            <p className="save-prompt">この言葉を辞典に掲載しますか？</p>
            <div className="save-form">
              {!result.reading && (
                <div className="save-nickname-wrapper">
                  <label className="save-label">読み（ひらがな）</label>
                  <input
                    type="text"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="よみがなを入力"
                    className="save-nickname-input"
                    maxLength={30}
                  />
                </div>
              )}
              <div className="save-nickname-wrapper">
                <label className="save-label">掲載者名</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="あなたのニックネーム"
                  className="save-nickname-input"
                  maxLength={15}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? "掲載中…" : "この辞典に載せる"}
              </button>
            </div>
            {saveError && (
              <div className="save-error">
                <p>{saveError}</p>
                {existingId && (
                  <Link href={`/word/${existingId}`} className="error-link">
                    掲載済みのページを見る →
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="save-success fade-in">
            <div className="save-divider" />
            <p className="save-success-text">
              掲載されました。辞典のページに移動します…
            </p>
            {savedId && (
              <Link href={`/word/${savedId}`} className="save-success-link">
                掲載ページを見る →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
