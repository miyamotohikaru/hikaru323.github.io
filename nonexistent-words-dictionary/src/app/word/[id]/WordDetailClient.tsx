"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import ShareButtons from "@/components/ShareButtons";
import ReportButton from "@/components/ReportButton";
import AdSense from "@/components/AdSense";
import WordCard from "@/components/WordCard";
import { WordEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { vDot } from "@/lib/format";

interface Props {
  word: WordEntry | null;
  relatedWords: WordEntry[];
}

const posMap: Record<string, string> = {
  "名詞": "〘名〙", "動詞": "〘動〙", "形容詞": "〘形〙",
  "形容動詞": "〘形動〙", "副詞": "〘副〙", "感動詞": "〘感〙",
};

export default function WordDetailClient({ word, relatedWords }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const justPosted = searchParams.get("just_posted") === "1";
  const [showSharePage, setShowSharePage] = useState(justPosted);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDef, setEditDef] = useState("");
  const [editExample, setEditExample] = useState("");
  const [editReading, setEditReading] = useState("");
  const [currentDef, setCurrentDef] = useState("");
  const [currentExample, setCurrentExample] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!word) {
      router.replace("/");
      return;
    }
    setCurrentDef(word.definition);
    setCurrentExample(word.examples?.[0] || "");
    setCurrentReading(word.reading);
    setEditDef(word.definition);
    setEditExample(word.examples?.[0] || "");
    setEditReading(word.reading);

    // APIから authorToken を取得してオーナー判定
    const token = localStorage.getItem("fictionary_author_token");
    if (token) {
      fetch(`/api/words/${word.id}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.authorToken === token) setIsOwner(true);
        })
        .catch(() => {});
    }
  }, [word, router]);

  const handleSaveEdit = async () => {
    if (!word || isSaving) return;
    setIsSaving(true);
    setSaveMsg(null);
    const token = localStorage.getItem("fictionary_author_token");
    try {
      const res = await fetch(`/api/words/${word.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorToken: token,
          definition: editDef,
          example: editExample,
          reading: editReading,
        }),
      });
      if (res.ok) {
        setCurrentDef(editDef);
        setCurrentExample(editExample);
        setCurrentReading(editReading);
        setEditing(false);
        setSaveMsg("更新しました");
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        const data = await res.json();
        setSaveMsg(data.error || "更新に失敗しました");
      }
    } catch {
      setSaveMsg("通信に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (!word) {
    return null;
  }

  const wordLang = (word as { language?: string }).language || "ja";
  const isEn = wordLang === "en";

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + `/word/${word.id}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || "https://fictionary.vercel.app"}/word/${word.id}`;

  // ページ番号は word.id から決定論的に算出（render中Math.random()によるhydration不一致を回避）
  const sharePageNum = useMemo(() => {
    let h = 0;
    for (let i = 0; i < word.id.length; i++) h = (h * 31 + word.id.charCodeAt(i)) >>> 0;
    return (h % 900) + 100;
  }, [word.id]);

  // 掲載直後の辞書風シェアページ
  if (showSharePage) {
    return (
      <main className="main-content">
        <div className="share-dict-page fade-in">
          <div className="share-dict-header">
            <span className="share-dict-label">{t("share.title")}</span>
            <span className="share-dict-page-num">p.{sharePageNum}</span>
          </div>

          {isEn ? (
            /* English word - horizontal layout */
            <div className="dictionary-page dictionary-page--en">
              <div className="dict-entry-en">
                <span className="dict-headword-en">{word.word}</span>
                {word.reading && <span className="dict-reading-en">/{word.reading}/</span>}
                <span className="dict-pos-en">({word.partOfSpeech})</span>
              </div>
              <div className="dict-entry-en">
                <p className="dict-definition-en">{word.definition}</p>
              </div>
              {word.examples && word.examples.length > 0 && word.examples[0] && (
                <div className="dict-entry-en">
                  <p className="dict-example-en">Example: &ldquo;{word.examples[0]}&rdquo;</p>
                </div>
              )}
              <div className="dict-entry-en">
                <span className="dict-author-en">— {word.nickname}</span>
              </div>
            </div>
          ) : (
            /* Japanese word - vertical continuous flow (詳細ページと同じ) */
            <div className="word-detail-paper-wrapper">
              <div className="word-detail-paper word-detail-paper--share fade-in">
                <div className="wdp-head-group">
                  <span className="wdp-headword">{vDot(word.word)}</span>
                  <span className="wdp-reading">【{word.reading}】</span>
                  <span className="wdp-pos">{posMap[word.partOfSpeech] || `〘${word.partOfSpeech}〙`}</span>
                </div>
                <span className="wdp-definition">{word.definition}</span>
                {word.etymology && (
                  <span className="wdp-etymology">▷ {word.etymology}</span>
                )}
                {word.examples && word.examples.length > 0 && word.examples[0] && (
                  <span className="wdp-example">▽「{word.examples[0]}」</span>
                )}
                <span className="wdp-author">── {word.nickname} 編</span>
              </div>
            </div>
          )}

          <div className="share-dict-congrats">
            <p className="share-dict-congrats-text">{t("share.congrats")}</p>
            <p className="share-dict-congrats-sub">
              {t("share.congratsSub").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>

          <div className="share-dict-actions">
            <ShareButtons word={word.word} url={shareUrl} />
          </div>

          <button
            onClick={() => setShowSharePage(false)}
            className="share-dict-continue"
          >
            {isEn ? "View details of this word →" : "この言葉の詳細を見る →"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content word-detail-content">
      {/* スクリーンリーダ/見出しナビ用のページ見出し（視覚的には縦書き紙面が見出し相当） */}
      <h1 className="sr-only">{word.word}【{currentReading}】</h1>
      <div className="word-detail-header">
        <Link href="/" className="back-link">
          {t("common.backToDict")}
        </Link>
      </div>

      {editing ? (
        /* 編集モード */
        <div className="word-edit-form fade-in" style={{ maxWidth: 800, margin: "2rem auto" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--text)", marginBottom: "1rem" }}>「{word.word}」を編集</h2>
          <div className="result-edit-fields">
            <label className="result-edit-label">{isEn ? "Reading" : "読み"}</label>
            <input
              type="text"
              value={editReading}
              onChange={(e) => setEditReading(e.target.value)}
              className="result-edit-textarea"
              style={{ height: "auto", padding: "8px 10px" }}
            />
            <label className="result-edit-label">{isEn ? "Definition" : "定義"}</label>
            <textarea
              value={editDef}
              onChange={(e) => setEditDef(e.target.value)}
              className="result-edit-textarea"
              rows={4}
            />
            <label className="result-edit-label">{isEn ? "Example" : "用例"}</label>
            <textarea
              value={editExample}
              onChange={(e) => setEditExample(e.target.value)}
              className="result-edit-textarea"
              rows={2}
            />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
            <button onClick={handleSaveEdit} disabled={isSaving} className="result-cta-button">
              {isSaving ? "更新中…" : "保存する"}
            </button>
            <button onClick={() => { setEditing(false); setEditDef(currentDef); setEditExample(currentExample); setEditReading(currentReading); }} className="result-edit-btn">
              キャンセル
            </button>
          </div>
          {saveMsg && <p role="status" aria-live="polite" style={{ marginTop: "8px", fontSize: "13px", color: "var(--textSoft)" }}>{saveMsg}</p>}
        </div>
      ) : isEn ? (
        /* English word detail - horizontal layout */
        <div className="dictionary-page dictionary-page--en fade-in" style={{ maxWidth: 800, margin: "2rem auto" }}>
          <div className="dict-entry-en">
            <span className="dict-headword-en" style={{ fontSize: "1.75rem" }}>{word.word}</span>
            {currentReading && <span className="dict-reading-en">/{currentReading}/</span>}
            <span className="dict-pos-en">({word.partOfSpeech})</span>
          </div>
          <div className="dict-entry-en">
            <p className="dict-definition-en">{currentDef}</p>
          </div>
          {word.etymology && (
            <div className="dict-entry-en" style={{ borderLeft: "2px solid rgba(100,85,60,0.2)", paddingLeft: "0.75rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#585538" }}>Etymology: {word.etymology}</p>
            </div>
          )}
          {currentExample && (
            <div className="dict-entry-en">
              <p className="dict-example-en">Example: &ldquo;{currentExample}&rdquo;</p>
            </div>
          )}
        </div>
      ) : (
        /* Japanese word detail - vertical continuous flow */
        <div className="word-detail-paper-wrapper">
          <div className="word-detail-paper fade-in">
            <div className="wdp-head-group">
              <span className="wdp-headword">{vDot(word.word)}</span>
              <span className="wdp-reading">【{currentReading}】</span>
              <span className="wdp-pos">{posMap[word.partOfSpeech] || `〘${word.partOfSpeech}〙`}</span>
            </div>
            <span className="wdp-definition">{currentDef}</span>
            {word.etymology && (
              <span className="wdp-etymology">▷ {word.etymology}</span>
            )}
            {currentExample && (
              <span className="wdp-example">▽「{currentExample}」</span>
            )}
            <span className="wdp-author">── {word.nickname} 編</span>
          </div>
        </div>
      )}

      {/* 横書きのメタ情報 */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="word-meta" style={{ borderTop: "1px solid var(--base-border)", paddingTop: "1rem", marginTop: "1rem" }}>
          {isEn && <span className="word-meta-nickname">{word.nickname}</span>}
          {word.createdAt && (
            <span className="word-meta-date">{new Date(word.createdAt).toLocaleDateString(isEn ? "en-US" : "ja-JP")}</span>
          )}
        </div>

        <div className="word-actions">
          <LikeButton wordId={word.id} initialLikes={word.likes} />
          <ShareButtons word={word.word} url={shareUrl} />
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)} className="result-edit-btn" style={{ marginLeft: "auto" }}>
              {isEn ? "Edit" : "編集する"}
            </button>
          )}
        </div>
        {saveMsg && !editing && <p role="status" aria-live="polite" style={{ fontSize: "13px", color: "var(--accent)", marginTop: "4px" }}>{saveMsg}</p>}
      </div>

      <AdSense slot="word-detail-1" />

      {relatedWords.length > 0 && (
        <section className="section">
          <span className="section-label-text">{isEn ? "Related words" : "関連する造語"}</span>
          <div className="word-grid">
            {relatedWords.map((w) => (
              <WordCard key={w.id} entry={w} compact />
            ))}
          </div>
        </section>
      )}

      <AdSense slot="word-detail-2" />

      <div className="report-section">
        <ReportButton wordId={word.id} />
      </div>

      <nav className="bottom-nav">
        <Link href="/browse" className="nav-link">
          {isEn ? "Browse all words →" : "五十音一覧を見る →"}
        </Link>
      </nav>
    </main>
  );
}
