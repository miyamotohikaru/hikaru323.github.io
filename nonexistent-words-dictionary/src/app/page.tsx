"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
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
  const { lang, t } = useI18n();
  const wordLanguage = lang === "en" ? "en" : "ja";
  const isEnMode = wordLanguage === "en";
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
  const hScrollRef = useRef<HTMLDivElement>(null);

  // Wheel → horizontal scroll conversion
  useEffect(() => {
    const el = hScrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      el.scrollLeft -= e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  });

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
        body: JSON.stringify({ word: trimmed, language: wordLanguage }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPhase("idle");
        return;
      }

      setResult(data);
      if (data.kojienEntry) {
        setEditDef(data.kojienEntry.definition);
        setEditExample(data.kojienEntry.example || "");
        setReading(isEnMode ? (data.kojienEntry.reading || "") : toHiragana(data.kojienEntry.reading || ""));
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
    if (!isEnMode && !trimmedReading) { setSaveError("読み（ひらがな）を入力してください。"); return; }
    if (!trimmedNickname) { setSaveError(isEnMode ? "Please enter a nickname." : "掲載者名を入力してください。"); return; }

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
    const formatted = isEnMode
      ? `${entry.word} (${partOfSpeech}) — ${def}${example ? `. Example: "${example}"` : ""}`
      : `${entry.word}【${trimmedReading}】（${partOfSpeech}）${def}。▽用例「${example}」`;

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
          language: wordLanguage,
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

  // 品詞の広辞苑表記
  const posMap: Record<string, string> = {
    "名詞": "〘名〙", "動詞": "〘動〙", "形容詞": "〘形〙",
    "形容動詞": "〘形動〙", "副詞": "〘副〙", "感動詞": "〘感〙",
  };

  return (
    <main className="main-content" style={{ position: "relative" }}>
      <FallingWords />

      {/* ヒーロー: タイトル + 説明 + 罫線 + 検索フォーム */}
      {(phase === "idle" || phase === "loading") && (
        <div className="tategaki-search-section">
          <div className="tategaki-search-inner">
            <h1 className="tategaki-search-hero-title">{t("home.title")}</h1>
            <p className="tategaki-search-hero-sub">
              {t("home.subtitle").split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
            <div className="tategaki-search-rule" />
            <form onSubmit={handleSearch} className="tategaki-search-form">
              <span className="tategaki-search-label">{isEnMode ? "Word" : "読み（ひらがな）"}</span>
              <div className={`tategaki-search-input-wrap ${isEnMode ? "en-mode" : ""}`}>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={isEnMode ? "look up a word" : "ことばを引く"}
                  className={`tategaki-search-input ${isEnMode ? "en-mode" : ""}`}
                  maxLength={20}
                  disabled={phase === "loading"}
                />
                <button
                  type="submit"
                  className="tategaki-search-button"
                  disabled={phase === "loading" || !word.trim()}
                >
                  引く
                </button>
              </div>
            </form>
          </div>
          <p className="tategaki-search-note">{t("home.note")}</p>
        </div>
      )}

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
            <span className="share-dict-label">{t("share.title") || "存在しない言葉辞典"}</span>
            <span className="share-dict-page-num">p.{Math.floor(Math.random() * 900) + 100}</span>
          </div>

          <div className="dictionary-page">
            <div className="dict-entry ink-delay-1">
              <span className="dict-headword">{savedWord.word}</span>
            </div>
            <div className="dict-entry ink-delay-2">
              <span className="dict-reading">【{savedWord.reading}】</span>
              <span className="dict-pos">{posMap[savedWord.partOfSpeech] || `〘${savedWord.partOfSpeech}〙`}</span>
            </div>
            <div className="dict-entry ink-delay-3">
              <p className="dict-definition">{savedWord.definition}</p>
            </div>
            {savedWord.example && (
              <div className="dict-entry ink-delay-4">
                <p className="dict-example">▽「{savedWord.example}」</p>
              </div>
            )}
            <div className="dict-entry">
              <span className="dict-author">── {savedWord.nickname} 編</span>
            </div>
          </div>

          <div className="share-dict-congrats">
            <p className="share-dict-congrats-text">
              {t("share.congrats") || "新語が辞典に掲載されました"}
            </p>
            <p className="share-dict-congrats-sub">
              {(t("share.congratsSub") || "あなたの言葉が辞典の一ページに刻まれました。\nこの新しい言葉を世界に広めませんか？").split("\n").map((line, i) => (
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
            {t("share.another") || "もう一語引く"}
          </button>

          <div className="home-browse-links">
            <Link href="/browse" className="home-browse-btn">
              {t("home.browseWords") || "辞書を見る"}
            </Link>
            <Link href="/ranking" className="home-browse-btn-sub">
              {t("home.viewRanking") || "ランキング"}
            </Link>
          </div>
        </div>
      )}

      {/* ===== 結果表示 ===== */}
      {phase === "result" && result && result.exists && (
        /* ── 既存語（実在語）── */
        <div className="h-scroll" ref={hScrollRef}>
          {/* 検索フォーム列（最右） */}
          <div className="result-search-col fade-in-rtl">
            <span className="result-hit-count">該当　0 件（既存語）</span>
            <form onSubmit={handleSearch} className="tategaki-search-form">
              <span className="tategaki-search-label">読み（ひらがな）</span>
              <div className="tategaki-search-input-wrap">
                <input type="text" value={word} onChange={(e) => setWord(e.target.value)} className="tategaki-search-input" maxLength={20} />
                <button type="submit" className="tategaki-search-button" disabled={!word.trim()}>引く</button>
              </div>
            </form>
            <span className="tategaki-search-note" style={{ position: "static" }}>{t("home.note")}</span>
          </div>

          {/* 見出し列 + スタンプ */}
          <div className="reject-headword-col fade-in-rtl">
            <span className="result-reading">{result.word}</span>
            <span className="stamp-unavailable">掲載不可</span>
          </div>

          {/* メッセージ列 */}
          <div className="reject-message-col fade-in-rtl">
            「{result.word}」は実在する言葉のため、<br />
            本辞典には掲載できません。<br />
            別の存在しない<br />
            言葉を、お試しください。
          </div>

          {/* 既存辞書での意味 */}
          {result.reason && (
            <div className="reject-existing-col fade-in-rtl">
              <span className="reject-existing-label">既存辞書より</span>
              <p style={{ marginLeft: 12 }}>{result.reason}</p>
            </div>
          )}

          {/* 再検索 */}
          <div className="reject-retry-col fade-in-rtl">
            <button onClick={handleReset} className="reject-retry-btn">
              別の言葉を引く
            </button>
          </div>
        </div>
      )}

      {phase === "result" && result && !result.exists && result.kojienEntry && (
        /* ── 検索ヒット（新語）── */
        <div className="h-scroll" ref={hScrollRef}>
          {/* 検索フォーム列（最右） */}
          <div className="result-search-col fade-in-rtl">
            <span className="result-hit-count">該当　・　1 件</span>
            <form onSubmit={handleSearch} className="tategaki-search-form">
              <span className="tategaki-search-label">読み（ひらがな）</span>
              <div className="tategaki-search-input-wrap">
                <input type="text" value={word} onChange={(e) => setWord(e.target.value)} className="tategaki-search-input" maxLength={20} />
                <button type="submit" className="tategaki-search-button" disabled={!word.trim()}>引く</button>
              </div>
            </form>
            <span className="tategaki-search-note" style={{ position: "static" }}>{t("home.note")}</span>
          </div>

          {/* 本文列 */}
          <div className="result-body-col fade-in-rtl">
            <span className="result-reading">{result.kojienEntry.reading}</span>
            <span className="result-headword">
              <span className="result-headword-bracket">【</span>
              {result.kojienEntry.word}
              <span className="result-headword-bracket">】</span>
            </span>
            <span className="result-pos-label">{result.kojienEntry.partOfSpeech}</span>
            <p className="result-definition">
              <span className="result-def-number">①</span>{" "}
              {editing ? editDef : result.kojienEntry.definition}
              {(result.kojienEntry.example || editing) && (
                <>
                  {" "}<span className="result-example-badge">例</span>{" "}
                  「{editing ? editExample : result.kojienEntry.example}」
                </>
              )}
            </p>
          </div>

          {/* 掲載フォーム列 */}
          <div className="result-register-col fade-in-rtl">
            <span className="result-unpublished-badge">{isEnMode ? "Unregistered" : "未掲載"}</span>
            <span className="result-register-heading">{t("result.registerHeading")}</span>

            <div className="result-register-field">
              <span className="result-register-label">{isEnMode ? t("result.pronunciationLabel") : t("result.readingLabel")}</span>
              <input
                type="text" value={reading}
                onChange={(e) => setReading(isEnMode ? e.target.value : toHiragana(e.target.value))}
                placeholder={isEnMode ? t("result.pronunciationPlaceholder") : t("result.readingPlaceholder")}
                className="result-register-input" maxLength={isEnMode ? 50 : 30}
              />
            </div>
            <div className="result-register-field">
              <span className="result-register-label">{t("result.nicknameLabel")}</span>
              <input
                type="text" value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("result.nicknamePlaceholder")}
                className="result-register-input" maxLength={15}
              />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="result-cta-button">
              {isSaving ? t("result.submitting") : t("result.submit")}
            </button>

            {saveError && <span className="result-error">{saveError}</span>}
          </div>

          {/* 編集エリア */}
          <div className="reject-retry-col fade-in-rtl" style={{ borderLeft: `1px solid var(--rule)` }}>
            <button onClick={() => setEditing(!editing)} className="result-edit-btn">
              {editing ? "編集を終了" : "内容を編集する"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
