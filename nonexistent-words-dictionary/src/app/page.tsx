"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import FallingWords from "@/components/FallingWords";
import { useI18n } from "@/lib/i18n";

// カタカナをひらがなに変換
function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

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

interface SavedWordData {
  id: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  nickname: string;
}

type Phase = "idle" | "loading" | "result" | "shared";

export default function Home() {
  const { t } = useI18n();
  const [word, setWord] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [savedWord, setSavedWord] = useState<SavedWordData | null>(null);

  // 結果カード用のstate
  const [editing, setEditing] = useState(false);
  const [editDef, setEditDef] = useState("");
  const [editExample, setEditExample] = useState("");
  const [reading, setReading] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fictionary_nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed) return;

    setPhase("loading");
    setResult(null);
    setSavedWord(null);
    setEditing(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPhase("idle");
        return;
      }

      setResult(data);
      // 結果の初期値をセット
      if (data.kojienEntry) {
        setEditDef(data.kojienEntry.definition);
        setEditExample(data.kojienEntry.example || "");
        setReading(toHiragana(data.kojienEntry.reading || ""));
      }
      setPhase("result");
    } catch {
      setPhase("idle");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setSavedWord(null);
    setWord("");
    setEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!result?.kojienEntry || isSaving) return;
    const trimmedNickname = nickname.trim();
    const trimmedReading = reading.trim();
    if (!trimmedReading) { setSaveError("読み（ひらがな）を入力してください。"); return; }
    if (!trimmedNickname) { setSaveError("掲載者名を入力してください。"); return; }

    setIsSaving(true);
    setSaveError(null);

    let authorToken = localStorage.getItem("fictionary_author_token");
    if (!authorToken) {
      authorToken = crypto.randomUUID();
      localStorage.setItem("fictionary_author_token", authorToken);
    }

    const entry = result.kojienEntry;
    const def = editing ? editDef : entry.definition;
    const example = editing ? editExample : entry.example;
    const partOfSpeech = entry.partOfSpeech;
    const formatted = `${entry.word}【${trimmedReading}】（${partOfSpeech}）${def}。▽用例「${example}」`;

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: entry.word,
          reading: trimmedReading,
          partOfSpeech,
          definition: def,
          etymology: "",
          examples: example ? [example] : [],
          synonyms: "",
          nickname: trimmedNickname,
          source: "user",
          kojienFormatted: formatted,
          authorToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "掲載に失敗しました。");
        return;
      }

      const postsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
      localStorage.setItem("fictionary_posts_count", String(postsCount + 1));
      localStorage.setItem("fictionary_nickname", trimmedNickname);

      setSavedWord({
        id: data.id,
        word: entry.word,
        reading: trimmedReading,
        partOfSpeech,
        definition: def,
        example: example || "",
        nickname: trimmedNickname,
      });
      setPhase("shared");
    } catch {
      setSaveError("通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const pageNumber = result ? `p.${Math.floor(Math.random() * 900) + 100}` : "";

  return (
    <main className="main-content" style={{ position: "relative" }}>
      <FallingWords />
      {/* ヒーロー（初期状態のみ） */}
      {phase === "idle" && (
        <div className="hero-centered">
          <div className="hero-copy">
            <h1 className="hero-title">{t("home.title")}</h1>
            <p className="hero-subtitle">
              {t("home.subtitle").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* 検索バー（常に表示） */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder={t("home.placeholder")}
          className="search-input"
          maxLength={20}
          disabled={phase === "loading"}
        />
        <button
          type="submit"
          className="search-button"
          disabled={phase === "loading" || !word.trim()}
        >
          🔍
        </button>
      </form>
      <p className="search-note">{t("home.note")}</p>

      {/* ページめくりアニメーション */}
      {phase === "loading" && (
        <div className="page-flip-loading fade-in">
          <div className="page-flip-book">
            <div className="page-flip-cover-back" />
            <div className="page-flip-page page-flip-page-1" />
            <div className="page-flip-page page-flip-page-2" />
            <div className="page-flip-page page-flip-page-3" />
            <div className="page-flip-page page-flip-page-4" />
            <div className="page-flip-page page-flip-page-5" />
            <div className="page-flip-page page-flip-page-6" />
            <div className="page-flip-page page-flip-page-7" />
            <div className="page-flip-page page-flip-page-8" />
            <div className="page-flip-page page-flip-page-9" />
            <div className="page-flip-page page-flip-page-10" />
            <div className="page-flip-page page-flip-page-11" />
            <div className="page-flip-page page-flip-page-12" />
            <div className="page-flip-cover-front" />
          </div>
          <p className="page-flip-text">{t("loading.reviewing")}</p>
        </div>
      )}

      {/* シェア画面（掲載完了後） */}
      {phase === "shared" && savedWord && (
        <div className="share-dict-page fade-in">
          <div className="share-dict-header">
            <span className="share-dict-label">{t("share.title")}</span>
            <span className="share-dict-page-num">p.{Math.floor(Math.random() * 900) + 100}</span>
          </div>

          <div className="share-dict-body">
            <div className="share-dict-lines" />
            <h1 className="share-dict-word">{savedWord.word}</h1>
            <p className="share-dict-reading">【{savedWord.reading}】</p>
            <span className="share-dict-pos">{savedWord.partOfSpeech}</span>
            <p className="share-dict-definition">{savedWord.definition}</p>
            {savedWord.example && (
              <p className="share-dict-example">
                <span className="share-dict-example-label">▽用例</span>
                「{savedWord.example}」
              </p>
            )}
            <div className="share-dict-author">
              ── {savedWord.nickname} 編
            </div>
          </div>

          <div className="share-dict-congrats">
            <p className="share-dict-congrats-text">
              {t("share.congrats")}
            </p>
            <p className="share-dict-congrats-sub">
              {t("share.congratsSub").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>

          <div className="share-dict-actions">
            <ShareButtons
              word={savedWord.word}
              url={typeof window !== "undefined"
                ? `${window.location.origin}/word/${savedWord.id}`
                : `/word/${savedWord.id}`}
            />
          </div>

          <button onClick={handleReset} className="share-dict-continue">
            {t("share.another")}
          </button>

          <div className="home-browse-links">
            <Link href="/browse" className="home-browse-btn">
              {t("home.browseWords")}
            </Link>
            <Link href="/ranking" className="home-browse-btn-sub">
              {t("home.viewRanking")}
            </Link>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {phase === "result" && result && (
        <div className="paper-card fade-in">
          <div className="paper-lines">
            <div className="paper-line" />
            <div className="paper-line" />
            <div className="paper-line" />
          </div>

          {result.exists ? (
            /* ===== 拒否カード ===== */
            <div className="paper-body paper-rejection">
              <p className="paper-rejection-text">
                「{result.word}」{t("result.exists").split("\n").map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </p>
              <button onClick={handleReset} className="paper-retry-btn">
                {t("result.tryAnother")}
              </button>
            </div>
          ) : result.kojienEntry ? (
            /* ===== 結果カード ===== */
            <div className="paper-body">
              {/* 存在しない言葉メッセージ */}
              <div className="paper-nonexistent-badge">
                {t("result.nonexistent")}
              </div>

              {/* 見出し語 */}
              <div className="paper-word-header">
                <h2 className="paper-word-title">{result.kojienEntry.word}</h2>
              </div>
              <span className="paper-pos-badge">{result.kojienEntry.partOfSpeech}</span>

              {/* 定義文 */}
              {editing ? (
                <textarea
                  value={editDef}
                  onChange={(e) => setEditDef(e.target.value)}
                  className="paper-edit-textarea"
                  rows={4}
                />
              ) : (
                <p className="paper-definition">{result.kojienEntry.definition}</p>
              )}

              {/* 用例 */}
              {(result.kojienEntry.example || editing) && (
                <div className="paper-example-section">
                  <span className="paper-example-label">{t("result.example")}</span>
                  {editing ? (
                    <textarea
                      value={editExample}
                      onChange={(e) => setEditExample(e.target.value)}
                      className="paper-edit-textarea"
                      rows={2}
                    />
                  ) : (
                    <p className="paper-example-text">{result.kojienEntry.example}</p>
                  )}
                </div>
              )}

              {/* 編集ボタン */}
              <div className="paper-edit-toggle">
                <button
                  onClick={() => setEditing(!editing)}
                  className="paper-edit-btn"
                >
                  {editing ? t("result.editDone") : t("result.editContent")}
                </button>
              </div>

              {/* 掲載フォーム */}
              <div className="paper-register">
                <p className="paper-register-heading">{t("result.registerHeading")}</p>

                <div className="paper-register-field">
                  <label className="paper-register-label">{t("result.readingLabel")}</label>
                  <input
                    type="text"
                    value={reading}
                    onChange={(e) => setReading(toHiragana(e.target.value))}
                    placeholder={t("result.readingPlaceholder")}
                    className="paper-register-input"
                    maxLength={30}
                  />
                </div>

                <div className="paper-register-field">
                  <label className="paper-register-label">{t("result.nicknameLabel")}</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t("result.nicknamePlaceholder")}
                    className="paper-register-input"
                    maxLength={15}
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="paper-register-btn"
                >
                  {isSaving ? t("result.submitting") : t("result.submit")}
                </button>

                {saveError && (
                  <p className="paper-register-error">{saveError}</p>
                )}
              </div>

              {/* 他の登録語を見るボタン */}
              <div className="paper-browse-links">
                <Link href="/browse" className="paper-browse-btn">
                  {t("result.browseOthers")}
                </Link>
                <Link href="/ranking" className="paper-browse-btn paper-browse-btn-sub">
                  {t("result.viewRanking")}
                </Link>
              </div>
            </div>
          ) : null}

          <span className="paper-page-number">{pageNumber}</span>
        </div>
      )}
    </main>
  );
}
