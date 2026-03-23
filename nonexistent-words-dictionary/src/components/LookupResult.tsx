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
  source?: string;
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
      <div className="page-rejection">
        <p className="page-rejection-text">
          「{result.word}」は実在する言葉のため、<br />
          本辞典には掲載しておりません。
        </p>
      </div>
    );
  }

  // ===== 存在しない言葉 → 紙面に定義表示 =====
  return (
    <div className="page-accepted">
      {/* Word header */}
      <div className="ink-delay-1">
        <h2 className="page-word-title">{result.word}</h2>
        {(result.reading || result.partOfSpeech) && (
          <div className="page-word-meta">
            {result.reading && (
              <span className="page-word-reading">【{result.reading}】</span>
            )}
            {result.partOfSpeech && (
              <span className="page-word-pos">{result.partOfSpeech}</span>
            )}
          </div>
        )}
      </div>

      {/* Definition */}
      {result.definition && (
        <div className="ink-delay-2">
          <p className="page-word-definition">{result.definition}</p>
        </div>
      )}

      {/* Etymology */}
      {result.etymology && (
        <div className="ink-delay-3">
          <p className="page-section-label">語源</p>
          <p className="page-etymology">{result.etymology}</p>
        </div>
      )}

      {/* Examples */}
      {result.examples && result.examples.length > 0 && (
        <div className="ink-delay-3">
          <p className="page-section-label">用例</p>
          {result.examples.map((ex, i) => (
            <p key={i} className="page-example">{ex}</p>
          ))}
        </div>
      )}

      {/* Save form */}
      <div className="ink-delay-4">
        <div className="page-divider" />

        {!saved ? (
          <div className="page-save">
            <p className="page-save-prompt">この言葉を辞典に掲載しますか？</p>
            <div className="page-save-form">
              {!result.reading && (
                <div className="page-save-field">
                  <label className="page-save-label">読み（ひらがな）</label>
                  <input
                    type="text"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="よみがなを入力"
                    className="page-save-input"
                    maxLength={30}
                  />
                </div>
              )}
              <div className="page-save-field">
                <label className="page-save-label">掲載者名</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="あなたのニックネーム"
                  className="page-save-input"
                  maxLength={15}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="page-save-button"
              >
                {isSaving ? "掲載中…" : "この言葉を辞典に載せる"}
              </button>
            </div>
            {saveError && (
              <div className="page-save-error">
                <p>{saveError}</p>
                {existingId && (
                  <Link href={`/word/${existingId}`} className="page-save-error-link">
                    掲載済みのページを見る →
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="page-save-success">
            <p className="page-save-success-text">
              掲載されました。辞典のページに移動します…
            </p>
            {savedId && (
              <Link href={`/word/${savedId}`} className="page-save-success-link">
                掲載ページを見る →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
