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

  // 品詞の広辞苑表記
  const posMap: Record<string, string> = {
    "名詞": "〘名〙", "動詞": "〘動〙", "形容詞": "〘形〙",
    "形容動詞": "〘形動〙", "副詞": "〘副〙", "感動詞": "〘感〙",
  };

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

      {/* 縦書き検索セクション */}
      <div className="tategaki-search-section">
        <form onSubmit={handleSearch} className="tategaki-search-form">
          <div className="tategaki-search-strip">
            <span className="tategaki-search-label">{t("result.readingLabel") || "見出し語"}</span>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={"こ　と　ば　を　引　く"}
              className="tategaki-search-input"
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
          <p className="tategaki-search-note">{t("home.note")}</p>
        </form>
      </div>

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

      {/* 結果表示 */}
      {phase === "result" && result && (
        <div className="dict-page dict-page--opening fade-in">
          <div className="dict-page__paper">
            <div className="dict-page__binding" />

            {result.exists ? (
              /* ===== 拒否 ===== */
              <div className="dict-page__content dict-page__content--revealing">
                <div className="dictionary-page dictionary-page--rejection">
                  <p className="dict-rejection-text">
                    「{result.word}」は実在する言葉です。
                  </p>
                  {result.reason && (
                    <p className="dict-rejection-reason">{result.reason}</p>
                  )}
                </div>
                <button onClick={handleReset} className="paper-retry-btn" style={{ marginTop: "1.5rem" }}>
                  {t("result.tryAnother")}
                </button>
              </div>
            ) : result.kojienEntry ? (
              /* ===== 辞書ページ風の結果 ===== */
              <div className="dict-page__content dict-page__content--revealing">
                <div className="paper-nonexistent-badge">
                  {t("result.nonexistent")}
                </div>

                {/* 辞書ページ（縦書き） */}
                <div className="dictionary-page">
                  <div className="dict-entry ink-delay-1">
                    <span className="dict-headword">{result.kojienEntry.word}</span>
                  </div>
                  <div className="dict-entry ink-delay-2">
                    <span className="dict-reading">【{result.kojienEntry.reading}】</span>
                    <span className="dict-pos">{posMap[result.kojienEntry.partOfSpeech] || `〘${result.kojienEntry.partOfSpeech}〙`}</span>
                  </div>
                  <div className="dict-entry ink-delay-3">
                    <p className="dict-definition">{editing ? editDef : result.kojienEntry.definition}</p>
                  </div>
                  {(result.kojienEntry.example || editing) && (
                    <div className="dict-entry ink-delay-4">
                      <p className="dict-example">▽「{editing ? editExample : result.kojienEntry.example}」</p>
                    </div>
                  )}
                </div>

                <span className="dict-page-number">{pageNumber}</span>

                {/* 編集・掲載フォーム（横書き） */}
                <div className="dict-form-area">
                  {editing && (
                    <div className="dict-edit-form">
                      <div className="paper-register-field">
                        <label className="paper-register-label">定義文</label>
                        <textarea
                          value={editDef}
                          onChange={(e) => setEditDef(e.target.value)}
                          className="paper-edit-textarea"
                          rows={4}
                        />
                      </div>
                      <div className="paper-register-field">
                        <label className="paper-register-label">用例</label>
                        <textarea
                          value={editExample}
                          onChange={(e) => setEditExample(e.target.value)}
                          className="paper-edit-textarea"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="paper-edit-toggle">
                    <button
                      onClick={() => setEditing(!editing)}
                      className="paper-edit-btn"
                    >
                      {editing ? t("result.editDone") : t("result.editContent")}
                    </button>
                  </div>

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

                  <div className="paper-browse-links">
                    <Link href="/browse" className="paper-browse-btn">
                      {t("result.browseOthers")}
                    </Link>
                    <Link href="/ranking" className="paper-browse-btn paper-browse-btn-sub">
                      {t("result.viewRanking")}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
