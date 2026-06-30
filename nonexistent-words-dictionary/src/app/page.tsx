"use client";

import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import FallingWords from "@/components/FallingWords";
import VerticalTextInput from "@/components/VerticalTextInput";
import { EmptyWordNotice } from "@/components/EmptyWordNotice";
import { useI18n } from "@/lib/i18n";
import { vDot, formatKojienBody } from "@/lib/format";
import { useFooterVisibility } from "@/components/ClientProviders";

// 登録時の文字数上限（サーバー側 words/route.ts と合わせる）
const DEF_LIMIT = 600;
const EX_LIMIT = 200;
// 1人(端末=authorToken)あたりの登録上限（サーバー側 words/route.ts と合わせる）
const REGISTER_LIMIT = 5;
// 入れ替えモーダルで「これから登録する新語」を表すチェックボックスのID
const NEW_WORD_ID = "__new__";

// 品詞の選択肢（編集パネルのプルダウン用）
const POS_OPTIONS_JA = ["名詞", "動詞", "形容詞", "形容動詞", "副詞", "感動詞", "連体詞", "接続詞", "感嘆詞"];
const POS_OPTIONS_EN = ["noun", "verb", "adjective", "adverb", "conjunction", "interjection"];

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
  const [editPos, setEditPos] = useState("");
  const [reading, setReading] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // TOPの検索/判定が失敗したときにユーザーへ見せるエラー（旧実装は無言でidleに戻っていた）
  const [lookupError, setLookupError] = useState<string | null>(null);
  const hScrollRef = useRef<HTMLDivElement>(null);
  const limitModalRef = useRef<HTMLDivElement>(null);
  // 結果ページ（縦書き横スクロール）で「左へスクロールできる」ことを示すヒント
  const [showScrollHint, setShowScrollHint] = useState(false);

  // 登録上限（5単語）の入れ替えモーダル用
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitWords, setLimitWords] = useState<MyWord[]>([]);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  // 入れ替えモーダルで「残す5つ」として選択中のID（既存ID + 新語はNEW_WORD_ID）
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 最終確認（「本当にこの単語にしますか？」）を表示中か
  const [replaceConfirming, setReplaceConfirming] = useState(false);
  // 自分の登録数（検索結果に「◯/5」表示）
  const [myWordCount, setMyWordCount] = useState<number | null>(null);

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

  // 結果ページで左にコンテンツが続く場合、「左へスクロール」ヒントを表示し、
  // ユーザーが一度スクロールしたら（または一定時間で）消す
  useEffect(() => {
    if (phase !== "result") { setShowScrollHint(false); return; }
    const el = hScrollRef.current;
    if (!el) return;
    let autoHide: number | undefined;
    // レイアウト確定後にオーバーフロー判定
    const checkId = window.setTimeout(() => {
      const hasOverflow = el.scrollWidth - el.clientWidth > 40;
      setShowScrollHint(hasOverflow);
      if (hasOverflow) autoHide = window.setTimeout(() => setShowScrollHint(false), 8000);
    }, 450);
    // 縦書きはRTLスクロール（scrollLeftは初期0→左へ進むと負）。少し動いたら消す
    const onScroll = () => {
      if (Math.abs(el.scrollLeft) > 24) setShowScrollHint(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(checkId);
      if (autoHide) window.clearTimeout(autoHide);
      el.removeEventListener("scroll", onScroll);
    };
  }, [phase, result]);

  // 検索結果（登録可能な新語）が出たら、自分の登録数を取得して「◯/5」表示に使う
  useEffect(() => {
    const registerable =
      phase === "result" && result && !result.exists && !result.alreadyRegistered && !!result.kojienEntry;
    if (!registerable) return;
    const token = localStorage.getItem("fictionary_author_token");
    if (!token) { setMyWordCount(0); return; }
    let aborted = false;
    fetch("/api/words/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorToken: token }),
    })
      .then((r) => r.json())
      .then((d) => { if (!aborted) setMyWordCount((d.words || []).length); })
      .catch(() => { if (!aborted) setMyWordCount(null); });
    return () => { aborted = true; };
  }, [phase, result]);

  // 掲載者名は毎回空欄にする（保存はするが自動入力しない）

  const handleSearch = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    const trimmed = word.trim();
    if (!trimmed) return;

    setPhase("loading");
    setResult(null);
    setSavedWord(null);
    setEditing(false);
    setSaveError(null);
    setLookupError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed, language: wordLanguage }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLookupError(
          data.error ||
            (isEnMode
              ? "Something went wrong. Please try again."
              : "うまくいきませんでした。少し時間をおいて、もう一度お試しください。")
        );
        setPhase("idle");
        return;
      }

      setResult(data);
      if (data.kojienEntry) {
        setEditDef(data.kojienEntry.definition);
        setEditExample(data.kojienEntry.example || "");
        setReading(isEnMode ? (data.kojienEntry.reading || "") : toHiragana(data.kojienEntry.reading || ""));
        setEditPos(data.kojienEntry.partOfSpeech || "");
      }
      setPhase("result");
    } catch {
      setLookupError(
        isEnMode
          ? "Network error. Please check your connection and try again."
          : "通信に失敗しました。接続を確認して、もう一度お試しください。"
      );
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
    let mine: MyWord[] = [];
    try {
      const res = await fetch("/api/words/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorToken }),
      });
      const data = await res.json();
      mine = data.words || [];
    } catch {
      mine = [];
    }
    setLimitWords(mine);
    setSelectedIds([...mine.map((w) => w.id), NEW_WORD_ID]);
    setReplaceConfirming(false);
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
    const partOfSpeech = editPos.trim() || entry.partOfSpeech;
    const formatted = isEnMode
      ? `${entry.word} (${partOfSpeech}) — ${def}${example ? `. Example: "${example}"` : ""}`
      : `${entry.word}【${trimmedReading}】（${partOfSpeech}）${formatKojienBody(def, example)}`;

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
        setSelectedIds([...mine.map((w) => w.id), NEW_WORD_ID]);
        setReplaceConfirming(false);
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

  // 入れ替えモーダルのチェック切り替え（残す5つを選ぶ）
  const toggleSelect = (id: string) => {
    if (isSaving) return;
    setSaveError(null);
    setReplaceConfirming(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 「この5つの単語を登録」確定。チェックされていない既存語を削除し、
  // 新語が選択されていれば登録する（アプリ内ブラウザ対策でwindow.confirmは使わない）
  const handleConfirmReplace = async () => {
    if (!pendingSave || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // チェックされていない既存語を削除
      const toDelete = limitWords.filter((w) => !selectedIds.includes(w.id));
      const deletedIds: string[] = [];
      for (const w of toDelete) {
        const res = await fetch(`/api/words/${w.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorToken: pendingSave.authorToken }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // 途中失敗時：既に削除できた分だけ状態へ反映し、UIが「消えた語」を残存表示しないようにする
          if (deletedIds.length > 0) {
            setLimitWords((prev) => prev.filter((x) => !deletedIds.includes(x.id)));
            setSelectedIds((prev) => prev.filter((id) => !deletedIds.includes(id)));
            setMyWordCount((c) => (c == null ? c : Math.max(0, c - deletedIds.length)));
          }
          const base = data.error || (isEnMode ? "Failed to delete." : "削除に失敗しました。");
          setSaveError(
            deletedIds.length > 0
              ? base + (isEnMode ? ` (${deletedIds.length} already deleted)` : `（${deletedIds.length}件は削除済み）`)
              : base
          );
          setIsSaving(false);
          return;
        }
        deletedIds.push(w.id);
      }
      if (selectedIds.includes(NEW_WORD_ID)) {
        // 新語を登録（成功時にモーダルを閉じてsharedへ）
        await doRegister(pendingSave.payload, pendingSave.display, pendingSave.authorToken);
      } else {
        // 新語は登録しない（既存の5つを選んだ）。モーダルを閉じる
        setShowLimitModal(false);
        setPendingSave(null);
        setReplaceConfirming(false);
        setMyWordCount(selectedIds.filter((id) => id !== NEW_WORD_ID).length);
      }
    } catch {
      setSaveError(isEnMode ? "Network error." : "通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const closeLimitModal = () => {
    setShowLimitModal(false);
    setPendingSave(null);
    setReplaceConfirming(false);
    setIsSaving(false);
  };

  // 登録上限モーダル: 開いている間はフォーカスをモーダル内に閉じ込め、Escapeで閉じる（a11y）
  useEffect(() => {
    if (!showLimitModal) return;
    const modal = limitModalRef.current;
    if (!modal) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    modal.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLimitModal();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    };
  }, [showLimitModal]);

  // シェア画面のページ番号は語ごとに一度だけ決め、再レンダーで毎回変わらないようにする
  const sharePageNum = useMemo(() => Math.floor(Math.random() * 900) + 100, [savedWord?.id]);

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
                <div className="tategaki-search-field">
                  {isEnMode ? (
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      aria-label="Word"
                      placeholder="register a word"
                      className="tategaki-search-input en-mode"
                      maxLength={20}
                    />
                  ) : (
                    /* PCはネイティブ縦書きinput、携帯は透明横書きinput＋縦書きミラー＋
                       カスタムカーソルバー（削除・IME・途中タップ挿入がネイティブで確実） */
                    <VerticalTextInput
                      variant="search"
                      value={word}
                      onChange={setWord}
                      placeholder="ことばを登録する"
                      ariaLabel="読み（ひらがな）"
                      maxLength={20}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="tategaki-search-button"
                  disabled={!word.trim()}
                >
                  引く
                </button>
              </div>
            </form>
            {lookupError && (
              <p className="search-lookup-error" role="alert">{lookupError}</p>
            )}
            <p className="search-limit-note">
              {isEnMode
                ? `※ Up to ${REGISTER_LIMIT} words per person`
                : `※1人、${REGISTER_LIMIT}つまで登録できます`}
            </p>
          </div>
          <p className="tategaki-search-note tategaki-search-note--tight">{t("home.note")}</p>
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
            <span className="share-dict-page-num">p.{sharePageNum}</span>
          </div>

          <div className="word-detail-paper-wrapper">
            <div className="word-detail-paper word-detail-paper--share fade-in">
              <div className="wdp-head-group">
                <span className="wdp-headword">{vDot(savedWord.word)}</span>
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
            <span className="result-reading">{vDot(result.word)}</span>
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
                「{vDot(result.word)}」はすでに<br />
                存在しない言葉辞典に登録されています。
              </>
            )}
          </div>

          {/* 登録済みの意味 */}
          <div className="result-body-col fade-in-rtl">
            <span className="result-reading">{result.kojienEntry.reading}</span>
            <span className="result-headword">
              <span className="result-headword-bracket">【</span>
              {vDot(result.kojienEntry.word)}
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
            <span className="result-reading">{vDot(result.word)}</span>
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
                「{vDot(result.word)}」は実在する言葉のため、<br />
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
            <span className="result-reading">{reading || result.kojienEntry.reading}</span>
            <span className="result-headword">
              <span className="result-headword-bracket">【</span>
              {vDot(result.kojienEntry.word)}
              <span className="result-headword-bracket">】</span>
            </span>
            <span className="result-pos-label">{editPos || result.kojienEntry.partOfSpeech}</span>
            {editing ? (
              <div className="result-edit-fields">
                <button onClick={() => setEditing(false)} className="result-edit-btn result-edit-done-top">
                  {isEnMode ? "Done editing" : "編集を終了"}
                </button>
                <label className="result-edit-label">{isEnMode ? "Pronunciation" : "ふりがな（読み）"}</label>
                <input
                  type="text"
                  value={reading}
                  onChange={(e) => setReading(isEnMode ? e.target.value : toHiragana(e.target.value))}
                  placeholder={isEnMode ? t("result.pronunciationPlaceholder") : t("result.readingPlaceholder")}
                  className="result-edit-input"
                  maxLength={isEnMode ? 50 : 30}
                />
                <label className="result-edit-label">{isEnMode ? "Part of speech" : "品詞"}</label>
                <select
                  value={editPos}
                  onChange={(e) => setEditPos(e.target.value)}
                  className="result-edit-select"
                >
                  {(() => {
                    const opts = isEnMode ? POS_OPTIONS_EN : POS_OPTIONS_JA;
                    const list = editPos && !opts.includes(editPos) ? [editPos, ...opts] : opts;
                    return list.map((p) => <option key={p} value={p}>{p}</option>);
                  })()}
                </select>
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
              <VerticalTextInput
                value={reading}
                onChange={(v) => setReading(isEnMode ? v : toHiragana(v))}
                placeholder={isEnMode ? t("result.pronunciationPlaceholder") : t("result.readingPlaceholder")}
                ariaLabel={isEnMode ? t("result.pronunciationLabel") : t("result.readingLabel")}
                maxLength={isEnMode ? 50 : 30}
              />
            </div>
            <div className="result-register-field">
              <span className="result-register-label">{t("result.nicknameLabel")}</span>
              <VerticalTextInput
                value={nickname}
                onChange={setNickname}
                placeholder={t("result.nicknamePlaceholder")}
                ariaLabel={t("result.nicknameLabel")}
                maxLength={15}
              />
            </div>

            <div className="result-cta-wrap">
              <button onClick={handleSave} disabled={isSaving} className="result-cta-button">
                {isSaving ? t("result.submitting") : t("result.submit")}
              </button>
              {myWordCount !== null && (
                <span className={`result-register-count${myWordCount >= REGISTER_LIMIT ? " is-full" : ""}`}>
                  {myWordCount}/{REGISTER_LIMIT}
                </span>
              )}
            </div>

            {saveError && <span className="result-error" role="alert">{saveError}</span>}
          </div>

          {/* TOPに戻るボタン */}
          <div className="reject-retry-col fade-in-rtl" style={{ borderLeft: `1px solid var(--rule)` }}>
            <button onClick={handleReset} className="reject-retry-btn">
              {isEnMode ? "Look up another word" : "別の言葉を引く"}
            </button>
          </div>
        </div>
      )}

      {/* 縦書き横スクロールのヒント（左へ続くことを示す） */}
      {phase === "result" && showScrollHint && (
        <div className={`scroll-hint${isEnMode ? " is-en" : ""}`} aria-hidden="true">
          <span className="scroll-hint-arrow">‹</span>
          <span className="scroll-hint-text">
            {isEnMode ? "Scroll left to read on" : "左へスクロール"}
          </span>
        </div>
      )}

      {/* ===== 登録上限（5単語）入れ替えモーダル ===== */}
      {showLimitModal && pendingSave && (
        <div className="limit-modal-overlay" onClick={closeLimitModal}>
          <div
            className="limit-modal"
            onClick={(e) => e.stopPropagation()}
            ref={limitModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="limit-modal-title"
            tabIndex={-1}
          >
            <p className="limit-modal-title" id="limit-modal-title">
              {isEnMode
                ? `Up to ${REGISTER_LIMIT} words per person`
                : `登録は1人${REGISTER_LIMIT}単語までです`}
            </p>
            <p className="limit-modal-desc">
              {isEnMode
                ? `Choose the ${REGISTER_LIMIT} words to keep. Unchecked words will be deleted.`
                : `残したい言葉を${REGISTER_LIMIT}つ選んでください。チェックを外した言葉は削除されます。`}
            </p>

            <span className={`limit-count-badge${selectedIds.length === REGISTER_LIMIT ? "" : " is-over"}`}>
              {isEnMode
                ? `${selectedIds.length} / ${REGISTER_LIMIT} selected`
                : `選択中 ${selectedIds.length} / ${REGISTER_LIMIT}`}
            </span>

            <div className="limit-word-list">
              {/* これから登録したい新語 */}
              <label className="limit-word-row is-pending">
                <input
                  type="checkbox"
                  className="limit-word-check"
                  checked={selectedIds.includes(NEW_WORD_ID)}
                  disabled={isSaving}
                  onChange={() => toggleSelect(NEW_WORD_ID)}
                />
                <span className="limit-word-main">
                  <span className="limit-word-head">
                    <span className="limit-word-tag">{isEnMode ? "New" : "登録したい言葉"}</span>
                    {pendingSave.display.word}
                  </span>
                  <span className="limit-word-def">{pendingSave.display.definition}</span>
                </span>
              </label>

              {/* 登録済みの単語（チェックを外すと削除対象） */}
              {limitWords.map((w) => (
                <label key={w.id} className="limit-word-row">
                  <input
                    type="checkbox"
                    className="limit-word-check"
                    checked={selectedIds.includes(w.id)}
                    disabled={isSaving}
                    onChange={() => toggleSelect(w.id)}
                  />
                  <span className="limit-word-main">
                    <span className="limit-word-head">{w.word}</span>
                    <span className="limit-word-def">{w.definition}</span>
                  </span>
                </label>
              ))}
            </div>

            {saveError && <span className="limit-modal-error" role="alert">{saveError}</span>}

            {replaceConfirming ? (
              <div className="limit-confirm-box">
                <p className="limit-confirm-q">
                  {isEnMode
                    ? "Are you sure these are your words? Unchecked words will be deleted."
                    : "本当にこの単語にしますか？チェックされていない言葉は削除されます。"}
                </p>
                <div className="limit-modal-actions">
                  <button className="limit-modal-cancel" onClick={() => setReplaceConfirming(false)} disabled={isSaving}>
                    {isEnMode ? "Back" : "やめる"}
                  </button>
                  <button className="limit-register-btn" onClick={handleConfirmReplace} disabled={isSaving}>
                    {isSaving
                      ? (isEnMode ? "Saving…" : "登録中…")
                      : (isEnMode ? "Yes, register" : "はい、登録する")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="limit-modal-actions">
                <button className="limit-modal-cancel" onClick={closeLimitModal} disabled={isSaving}>
                  {isEnMode ? "Cancel" : "やめる"}
                </button>
                <button
                  className="limit-register-btn"
                  onClick={() => setReplaceConfirming(true)}
                  disabled={isSaving || selectedIds.length !== REGISTER_LIMIT}
                >
                  {isEnMode
                    ? `Register these ${REGISTER_LIMIT} words`
                    : `この${REGISTER_LIMIT}つの単語を登録`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
