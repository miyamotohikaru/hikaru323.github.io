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
  const [definition, setDefinition] = useState(result.definition || "");
  const [etymology, setEtymology] = useState(result.etymology || "");
  const [examples, setExamples] = useState<string[]>(result.examples || []);
  const [synonyms, setSynonyms] = useState(result.synonyms || "");
  const [isEditing, setIsEditing] = useState(false);
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
    setDefinition(result.definition || "");
    setEtymology(result.etymology || "");
    setExamples(result.examples || []);
    setSynonyms(result.synonyms || "");
    setIsEditing(false);
  }, [result]);

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const addExample = () => {
    if (examples.length < 3) {
      setExamples([...examples, ""]);
    }
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      setSaveError("掲載者名を入力してください。");
      return;
    }

    if (!reading.trim()) {
      setSaveError("読み（ひらがな）を入力してください。");
      return;
    }

    if (!definition.trim()) {
      setSaveError("意味を入力してください。");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const filteredExamples = examples.filter((ex) => ex.trim() !== "");
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: result.word,
          reading: reading.trim(),
          partOfSpeech: result.partOfSpeech || "名詞",
          definition: definition.trim(),
          etymology: etymology.trim(),
          examples: filteredExamples,
          synonyms: synonyms.trim(),
          nickname: nickname.trim(),
          source: isEditing ? "user" : "ai",
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
        {(reading || result.partOfSpeech) && !isEditing && (
          <div className="page-word-meta">
            {reading && (
              <span className="page-word-reading">【{reading}】</span>
            )}
            {result.partOfSpeech && (
              <span className="page-word-pos">{result.partOfSpeech}</span>
            )}
          </div>
        )}
      </div>

      {/* Edit mode */}
      {isEditing ? (
        <div className="ink-delay-2">
          <div className="page-edit-form">
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
            <div className="page-save-field">
              <label className="page-save-label">意味</label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="この言葉の意味を入力"
                className="page-edit-textarea"
                maxLength={200}
                rows={3}
              />
            </div>
            <div className="page-save-field">
              <label className="page-save-label">語源（任意）</label>
              <input
                type="text"
                value={etymology}
                onChange={(e) => setEtymology(e.target.value)}
                placeholder="語源を入力"
                className="page-save-input"
                maxLength={200}
              />
            </div>
            <div className="page-save-field">
              <label className="page-save-label">用例（任意）</label>
              {examples.map((ex, i) => (
                <div key={i} className="page-edit-example-row">
                  <input
                    type="text"
                    value={ex}
                    onChange={(e) => handleExampleChange(i, e.target.value)}
                    placeholder={`用例 ${i + 1}`}
                    className="page-save-input"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => removeExample(i)}
                    className="page-edit-remove-btn"
                    title="用例を削除"
                  >
                    -
                  </button>
                </div>
              ))}
              {examples.length < 3 && (
                <button
                  type="button"
                  onClick={addExample}
                  className="page-edit-add-btn"
                >
                  + 用例を追加
                </button>
              )}
            </div>
            <div className="page-save-field">
              <label className="page-save-label">類義語（任意）</label>
              <input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="類義語を入力"
                className="page-save-input"
                maxLength={30}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="page-edit-done-btn"
            >
              編集を終える
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Definition (display mode) */}
          {definition && (
            <div className="ink-delay-2">
              <p className="page-word-definition">{definition}</p>
            </div>
          )}

          {/* Etymology */}
          {etymology && (
            <div className="ink-delay-3">
              <p className="page-section-label">語源</p>
              <p className="page-etymology">{etymology}</p>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && examples.some((ex) => ex.trim()) && (
            <div className="ink-delay-3">
              <p className="page-section-label">用例</p>
              {examples.filter((ex) => ex.trim()).map((ex, i) => (
                <p key={i} className="page-example">{ex}</p>
              ))}
            </div>
          )}

          {/* Synonyms */}
          {synonyms && (
            <div className="ink-delay-3">
              <p className="page-section-label">類義語</p>
              <p className="page-etymology">{synonyms}</p>
            </div>
          )}

          {/* Edit button */}
          <div className="ink-delay-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="page-edit-btn"
            >
              内容を編集する
            </button>
          </div>
        </>
      )}

      {/* Save form */}
      <div className="ink-delay-4">
        <div className="page-divider" />

        {!saved ? (
          <div className="page-save">
            <p className="page-save-prompt">この言葉を辞典に掲載しますか？</p>
            <div className="page-save-form">
              {!reading && (
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
