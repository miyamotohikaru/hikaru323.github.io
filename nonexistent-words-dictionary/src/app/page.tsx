"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import FallingWords from "@/components/FallingWords";
import { EmptyWordNotice } from "@/components/EmptyWordNotice";
import { useI18n } from "@/lib/i18n";
import { useFooterVisibility } from "@/components/ClientProviders";

// 登録時の文字数上限（サーバー側 words/route.ts と合わせる）
const DEF_LIMIT = 600;
const EX_LIMIT = 200;
// 1人(端末=authorToken)あたりの登録上限（サーバー側 words/route.ts と合わせる）
const REGISTER_LIMIT = 5;

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
  alreadyRegistered?: boolean;
  id?: string;
  nickname?: string;
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

// 自分が登録済みの単語（登録上限の入れ替えUI用）
interface MyWord {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
}

// 上限到達時、削除後に登録するための保留データ
interface PendingSave {
  payload: Record<string, unknown>;
  display: Omit<SavedWordData, "id">;
  authorToken: string;
}

type Phase = "idle" | "loading" | "result" | "shared";

export default function Home() {
  const { lang, t } = useI18n();
  const { setMobileVisible } = useFooterVisibility();
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

  // 登録上限（5単語）の入れ替えモーダル用
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitWords, setLimitWords] = useState<MyWord[]>([]);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // フッター表示制御: idleの時だけフッターを表示
  useEffect(() => {
    setMobileVisible(phase === "idle");
    return () => setMobileVisible(false);
  }, [phase, setMobileVisible]);

  // loading/result時のみbodyの縦スクロールを防止（sharedは下までスクロールさせる）
  useEffect(() => {
    if (phase === "loading" || phase === "result") {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  // 掲載者名は毎回空欄にする（保存はするが自動入力しない）

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

  const getAuthorToken = () => {
    let authorToken = localStorage.getItem("fictionary_author_token");
    if (!authorToken) {
      authorToken = crypto.randomUUID();
      localStorage.setItem("fictionary_author_token", authorToken);
    }
    return authorToken;
  };

  // 実際の登録（POST）。上限に達していたら入れ替えモーダルを開く
  const doRegister = async (
    payload: Record<string, unknown>,
    display: Omit<SavedWordData, "id">,
    authorToken: string
  ) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          // サーバー側でも上限。自分の単語を取得して入れ替えモーダルを開く
          await openLimitModal(payload, display, authorToken);
          return;
        }
        setSaveError(data.error || "掲載に失敗しました。");
        return;
      }

      const postsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
      localStorage.setItem("fictionary_posts_count", String(postsCount + 1));
      localStorage.setItem("fictionary_nickname", display.nickname);

      setShowLimitModal(false);
      setPendingSave(null);
      setSavedWord({ ...display, id: data.id });
      setPhase("shared");
    } catch {
      setSaveError("通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  // 自分の単語一覧を取得して入れ替えモーダルを開く
  const openLimitModal = async (
    payload: Record<string, unknown>,
    display: Omit<SavedWordData, "id">,
    authorToken: string
  ) => {
    try {
      const res = await fetch("/api/words/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken }),
      });
      const data = await res.json();
      setLimitWords(data.words || []);
    } catch {
      setLimitWords([]);
    }
    setPendingSave({ payload, display, authorToken });
    setShowLimitModal(true);
    setIsSaving(false);
  };

  const handleSave = async () => {
    if (!result?.kojienEntry || isSaving) return;
    const trimmedNickname = nickname.trim();
    const trimmedReading = reading.trim();
    if (!isEnMode && !trimmedReading) { setSaveError("読み（ひらがな）を入力してください。"); return; }
    if (!trimmedNickname) { setSaveError(isEnMode ? "Please enter a nickname." : "掲載者名を入力してください。"); return; }

    const entry = result.kojienEntry;
    // 編集中フラグに関わらず、現在の編集値を保存する（編集を終了しても反映されるように）
    const def = editDef || entry.definition;
    const example = editExample || entry.example;

    // 文字数上限チェック（超過時は登録できない旨を表示）
    if (def.length > DEF_LIMIT) {
      setSaveError(isEnMode
        ? `Definition must be ${DEF_LIMIT} characters or less. Currently ${def.length}. Cannot register.`
        : `定義は${DEF_LIMIT}字以内にしてください（現在${def.length}字）。このままでは登録できません。`);
      return;
    }
    if (example.length > EX_LIMIT) {
      setSaveError(isEnMode
        ? `Example must be ${EX_LIMIT} characters or less. Cannot register.`
        : `用例は${EX_LIMIT}字以内にしてください。このままでは登録できません。`);
      return;
    }

    const authorToken = getAuthorToken();
    const partOfSpeech = entry.partOfSpeech;
    const formatted = isEnMode
      ? `${entry.word} (${partOfSpeech}) — ${def}${example ? `. Example: "${example}"` : ""}`
      : `${entry.word}【${trimmedReading}】（${partOfSpeech}）${def}。▽用例「${example}」`;

    const payload: Record<string, unknown> = {
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
    };
    const display: Omit<SavedWordData, "id"> = {
      word: entry.word,
      reading: trimmedReading,
      partOfSpeech,
      definition: def,
      example: example || "",
      nickname: trimmedNickname,
    };

    setIsSaving(true);
    setSaveError(null);
    // 登録上限(5単語)チェック: 先に自分の登録数を確認
    try {
      const res = await fetch("/api/words/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken }),
      });
      const data = await res.json();
      const mine: MyWord[] = data.words || [];
      if (mine.length >= REGISTER_LIMIT) {
        setLimitWords(mine);
        setPendingSave({ payload, display, authorToken });
        setShowLimitModal(true);
        setIsSaving(false);
        return;
      }
    } catch {
      // 取得失敗時はサーバー側の制限に委ねてそのまま登録を試みる
    }

    await doRegister(payload, display, authorToken);
  };

  // 上限到達時、既存の単語を1つ削除して枠を空け、保留中の新語を登録する
  const handleDeleteForSlot = async (id: string) => {
    if (!pendingSave || deletingId) return;
    const target = limitWords.find((w) => w.id === id);
    const ok = window.confirm(isEnMode
      ? `Delete "${target?.word}" and register your new word?`
      : `「${target?.word}」を削除して、新しい言葉を登録しますか？`);
    if (!ok) return;

    setDeletingId(id);
    setSaveError(null);
    try {
      const res = await fetch(`/api/words/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken: pendingSave.authorToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || (isEnMode ? "Failed to delete." : "削除に失敗しました。"));
        setDeletingId(null);
        return;
      }
      const remaining = limitWords.filter((w) => w.id !== id);
      setLimitWords(remaining);
      setDeletingId(null);
      if (remaining.length < REGISTER_LIMIT) {
        await doRegister(pendingSave.payload, pendingSave.display, pendingSave.authorToken);
      }
    } catch {
      setSaveError(isEnMode ? "Network error." : "通信に失敗しました。");
      setDeletingId(null);
    }
  };

  const closeLimitModal = () => {
    setShowLimitModal(false);
    setPendingSave(null);
    setIsSaving(false);
  };

  const pageNumber = result ? `p.${Math.floor(Math.random() * 900) + 100}` : "";

  // 品詞の広辞苑表記
  const posMap: Record<string, string> = {
    "名詞": "〘名〙", "動詞": "〘動〙", "形容詞": "〘形〙",
    "形容動詞": "〘形動〙", "副詞": "〘副〙", "感動詞": "〘感〙",
  };

  return (
    <main className="main-content" style={{ position: "relative" }}>
      {phase === "idle" && <FallingWords />}

      {/* ヒーロー: タイトル + 説明 + 罫線 + 検索フォーム */}
      {phase === "idle" && (
        <div className="tategaki-search-section">
          <div className="tategaki-search-inner">
            <h1 className="tategaki-search-hero-title">{t("home.title")}</h1>
            <p className="tategaki-search-hero-sub">
              {t("home.subtitle").split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
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
                  placeholder={isEnMode ? "register a word" : "ことばを登録する"}
                  className={`tategaki-search-input ${isEnMode ? "en-mode" : ""}`}
                  maxLength={20}
                />
                <button
                  type="submit"
                  className="tategaki-search-button"
                  disabled={!word.trim()}
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

          <div className="word-detail-paper-wrapper">
            <div className="word-detail-paper word-detail-paper--share fade-in">
              <div className="wdp-head-group">
                <span className="wdp-headword">{savedWord.word}</span>
                <span className="wdp-reading">【{savedWord.reading}】</span>
                <span className="wdp-pos">{posMap[savedWord.partOfSpeech] || `〘${savedWord.partOfSpeech}〙`}</span>
              </div>
              <span className="wdp-definition">{savedWord.definition}</span>
              {savedWord.example && (
                <span className="wdp-example">▽「{savedWord.example}」</span>
              )}
              <span className="wdp-author">── {savedWord.nickname} 編</span>
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
      {phase === "result" && result && result.alreadyRegistered && result.kojienEntry && (
        /* ── すでに辞典に登録済み ── */
        <div className="h-scroll is-rejected" ref={hScrollRef}>
          <div className="reject-headword-col fade-in-rtl">
            <span className="result-reading">{result.word}</span>
            <span className="stamp-unavailable">{isEnMode ? "Registered" : "登録済み"}</span>
          </div>

          <div className="reject-message-col fade-in-rtl">
            {isEnMode ? (
              <>
                &ldquo;{result.word}&rdquo; is already<br />
                in the Fictionary.
              </>
            ) : (
              <>
                「{result.word}」はすでに存在しない<br />
                言葉辞典に登録されています。
              </>
            )}
          </div>

          {/* 登録済みの意味 */}
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
              {result.kojienEntry.definition}
              {result.kojienEntry.example && (
                <>
                  {" "}<span className="result-example-badge">{isEnMode ? "ex" : "例"}</span>{" "}
                  「{result.kojienEntry.example}」
                </>
              )}
            </p>
          </div>

          {/* この語を見る / 再検索 */}
          <div className="reject-retry-col fade-in-rtl">
            {result.id && (
              <Link href={`/word/${result.id}`} className="reject-retry-btn" style={{ marginBottom: 8 }}>
                {isEnMode ? "View this word" : "この言葉を見る"}
              </Link>
            )}
            <button onClick={handleReset} className="reject-retry-btn">
              {isEnMode ? "Look up another word" : "別の言葉を引く"}
            </button>
          </div>
        </div>
      )}

      {/* ===== 結果表示 ===== */}
      {phase === "result" && result && result.exists && (
        /* ── 既存語（実在語）── */
        <div className="h-scroll is-rejected" ref={hScrollRef}>
          {/* 見出し列 + スタンプ */}
          <div className="reject-headword-col fade-in-rtl">
            <span className="result-reading">{result.word}</span>
            <span className="stamp-unavailable">{isEnMode ? "Not eligible" : "掲載不可"}</span>
          </div>

          {/* メッセージ列 */}
          <div className="reject-message-col fade-in-rtl">
            {isEnMode ? (
              <>
                &ldquo;{result.word}&rdquo; is a real word, so<br />
                it cannot be added to this<br />
                dictionary. Please try another<br />
                word that doesn&apos;t exist.
              </>
            ) : (
              <>
                「{result.word}」は実在する言葉のため、<br />
                本辞典には掲載できません。<br />
                別の存在しない<br />
                言葉を、お試しください。
              </>
            )}
          </div>

          {/* 既存辞書での意味 */}
          {result.reason && (
            <div className="reject-existing-col fade-in-rtl">
              <span className="reject-existing-label">{isEnMode ? "From dictionaries" : "既存辞書より"}</span>
              <p style={{ marginLeft: 12 }}>{result.reason}</p>
            </div>
          )}

          {/* 再検索 */}
          <div className="reject-retry-col fade-in-rtl">
            <button onClick={handleReset} className="reject-retry-btn">
              {isEnMode ? "Look up another word" : "別の言葉を引く"}
            </button>
          </div>
        </div>
      )}

      {phase === "result" && result && !result.exists && !result.alreadyRegistered && result.kojienEntry && (
        /* ── 検索ヒット（新語）── */
        <div className="h-scroll" ref={hScrollRef}>
          {/* 該当件数 */}
          <div className="result-search-col fade-in-rtl">
            <span className="result-hit-count">{isEnMode ? "Found · 1" : "該当　・　1 件"}</span>
          </div>

          {/* 蔵書印スタイル通知 */}
          <EmptyWordNotice isEn={isEnMode} />

          {/* 本文列 */}
          <div className="result-body-col fade-in-rtl">
            <span className="result-reading">{result.kojienEntry.reading}</span>
            <span className="result-headword">
              <span className="result-headword-bracket">【</span>
              {result.kojienEntry.word}
              <span className="result-headword-bracket">】</span>
            </span>
            <span className="result-pos-label">{result.kojienEntry.partOfSpeech}</span>
            {editing ? (
              <div className="result-edit-fields">
                <label className="result-edit-label">
                  {isEnMode ? `Definition (within ${DEF_LIMIT} chars)` : `定義（${DEF_LIMIT}字以内）`}
                </label>
                <textarea
                  value={editDef}
                  onChange={(e) => setEditDef(e.target.value)}
                  className="result-edit-textarea"
                  rows={6}
                />
                <span
                  className="result-edit-count"
                  style={{
                    fontSize: "0.6875rem",
                    color: editDef.length > DEF_LIMIT ? "var(--accent)" : "var(--textMute)",
                  }}
                >
                  {editDef.length} / {DEF_LIMIT}
                  {editDef.length > DEF_LIMIT && (isEnMode ? " — too long, cannot register" : " 字超過：このままでは登録できません")}
                </span>
                <label className="result-edit-label">{isEnMode ? "Example" : "用例"}</label>
                <textarea
                  value={editExample}
                  onChange={(e) => setEditExample(e.target.value)}
                  className="result-edit-textarea"
                  rows={4}
                />
                <button onClick={() => setEditing(false)} className="result-edit-btn" style={{ marginTop: "8px" }}>
                  {isEnMode ? "Done editing" : "編集を終了"}
                </button>
              </div>
            ) : (
              <>
                <p className="result-definition">
                  <span className="result-def-number">①</span>{" "}
                  {editDef || result.kojienEntry.definition}
                  {(result.kojienEntry.example || editExample) && (
                    <>
                      {" "}<span className="result-example-badge">例</span>{" "}
                      「{editExample || result.kojienEntry.example}」
                    </>
                  )}
                </p>
                <button onClick={() => setEditing(true)} className="result-edit-btn" style={{ marginTop: "auto" }}>
                  {isEnMode ? "Edit" : "内容を編集する"}
                </button>
              </>
            )}
          </div>

          {/* 掲載フォーム列 */}
          <div className="result-register-col fade-in-rtl">
            <span className="result-register-heading">{isEnMode ? "Register this word" : "存在しない言葉辞典に掲載できます"}</span>

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

          {/* TOPに戻るボタン */}
          <div className="reject-retry-col fade-in-rtl" style={{ borderLeft: `1px solid var(--rule)` }}>
            <button onClick={handleReset} className="reject-retry-btn">
              {isEnMode ? "Look up another word" : "別の言葉を引く"}
            </button>
          </div>
        </div>
      )}

      {/* ===== 登録上限（5単語）入れ替えモーダル ===== */}
      {showLimitModal && pendingSave && (
        <div className="limit-modal-overlay" onClick={closeLimitModal}>
          <div className="limit-modal" onClick={(e) => e.stopPropagation()}>
            <p className="limit-modal-title">
              {isEnMode
                ? `Up to ${REGISTER_LIMIT} words per person`
                : `登録は1人${REGISTER_LIMIT}単語までです`}
            </p>
            <p className="limit-modal-desc">
              {isEnMode
                ? "To register your new word, please delete one of your existing words below (uncheck it)."
                : "新しい言葉を登録するには、下の登録済み単語からどれか1つを削除（チェックを外す）してください。"}
            </p>

            <div className="limit-word-list">
              {/* 登録済みの5単語（チェック済み＝外すと削除） */}
              {limitWords.map((w) => (
                <label key={w.id} className="limit-word-row">
                  <input
                    type="checkbox"
                    className="limit-word-check"
                    checked
                    disabled={deletingId !== null}
                    onChange={() => handleDeleteForSlot(w.id)}
                  />
                  <span className="limit-word-main">
                    <span className="limit-word-head">{w.word}</span>
                    <span className="limit-word-def">{w.definition}</span>
                  </span>
                </label>
              ))}

              {/* これから登録したい新語（未チェック） */}
              <div className="limit-word-row is-pending">
                <input type="checkbox" className="limit-word-check" checked={false} readOnly disabled />
                <span className="limit-word-main">
                  <span className="limit-word-tag">{isEnMode ? "New" : "登録したい言葉"}</span>
                  <span className="limit-word-head">{pendingSave.display.word}</span>
                  <span className="limit-word-def">{pendingSave.display.definition}</span>
                </span>
              </div>
            </div>

            {saveError && <span className="result-error" style={{ display: "block", marginBottom: "0.75rem" }}>{saveError}</span>}

            <div className="limit-modal-actions">
              <button className="limit-modal-cancel" onClick={closeLimitModal} disabled={deletingId !== null}>
                {isEnMode ? "Cancel" : "やめる"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
