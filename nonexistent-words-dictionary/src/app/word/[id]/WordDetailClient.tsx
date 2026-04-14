"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import WordCard from "@/components/WordCard";
import LikeButton from "@/components/LikeButton";
import ShareButtons from "@/components/ShareButtons";
import ReportButton from "@/components/ReportButton";
import AdSense from "@/components/AdSense";
import { WordEntry } from "@/lib/types";

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
  const justPosted = searchParams.get("just_posted") === "1";
  const [showSharePage, setShowSharePage] = useState(justPosted);

  useEffect(() => {
    if (!word) {
      router.replace("/");
    }
  }, [word, router]);

  if (!word) {
    return null;
  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + `/word/${word.id}`
    : `https://fictionary.vercel.app/word/${word.id}`;

  // 掲載直後の辞書風シェアページ
  if (showSharePage) {
    return (
      <main className="main-content">
        <div className="share-dict-page fade-in">
          <div className="share-dict-header">
            <span className="share-dict-label">存在しない言葉辞典</span>
            <span className="share-dict-page-num">p.{Math.floor(Math.random() * 900) + 100}</span>
          </div>

          <div className="dictionary-page">
            <div className="dict-entry">
              <span className="dict-headword">{word.word}</span>
            </div>
            <div className="dict-entry">
              <span className="dict-reading">【{word.reading}】</span>
              <span className="dict-pos">{posMap[word.partOfSpeech] || `〘${word.partOfSpeech}〙`}</span>
            </div>
            <div className="dict-entry">
              <p className="dict-definition">{word.definition}</p>
            </div>
            {word.examples && word.examples.length > 0 && word.examples[0] && (
              <div className="dict-entry">
                <p className="dict-example">▽「{word.examples[0]}」</p>
              </div>
            )}
            <div className="dict-entry">
              <span className="dict-author">── {word.nickname} 編</span>
            </div>
          </div>

          <div className="share-dict-congrats">
            <p className="share-dict-congrats-text">新語が辞典に掲載されました</p>
            <p className="share-dict-congrats-sub">
              あなたの言葉が辞典の一ページに刻まれました。<br />
              この新しい言葉を世界に広めませんか？
            </p>
          </div>

          <div className="share-dict-actions">
            <ShareButtons word={word.word} url={shareUrl} />
          </div>

          <button
            onClick={() => setShowSharePage(false)}
            className="share-dict-continue"
          >
            この言葉の詳細を見る →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="word-detail-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
      </div>

      {/* 広辞苑風の辞書ページ */}
      <div className="dictionary-page fade-in" style={{ maxWidth: 800, margin: "2rem auto" }}>
        <div className="dict-entry">
          <span className="dict-headword" style={{ fontSize: "1.75rem" }}>{word.word}</span>
        </div>
        <div className="dict-entry">
          <span className="dict-reading">【{word.reading}】</span>
          <span className="dict-pos">{posMap[word.partOfSpeech] || `〘${word.partOfSpeech}〙`}</span>
        </div>
        <div className="dict-entry">
          <p className="dict-definition">{word.definition}</p>
        </div>
        {word.etymology && (
          <div className="dict-entry" style={{ borderRight: "1px solid rgba(100,85,60,0.2)", paddingRight: "0.5rem" }}>
            <p style={{ fontSize: "0.8125rem", color: "#585538" }}>▷ {word.etymology}</p>
          </div>
        )}
        {word.examples && word.examples.length > 0 && word.examples[0] && (
          <div className="dict-entry">
            <p className="dict-example">▽「{word.examples[0]}」</p>
          </div>
        )}
      </div>

      {/* 横書きのメタ情報 */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="word-meta" style={{ borderTop: "1px solid var(--base-border)", paddingTop: "1rem", marginTop: "1rem" }}>
          <span className="word-meta-nickname">{word.nickname} 編</span>
          {word.createdAt && (
            <span className="word-meta-date">{new Date(word.createdAt).toLocaleDateString("ja-JP")}</span>
          )}
        </div>

        <div className="word-actions">
          <LikeButton wordId={word.id} initialLikes={word.likes} />
          <ShareButtons word={word.word} url={shareUrl} />
        </div>
      </div>

      <AdSense slot="word-detail-1" />

      {relatedWords.length > 0 && (
        <section className="section">
          <span className="section-label-text">関連する造語</span>
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
          五十音一覧を見る →
        </Link>
      </nav>
    </main>
  );
}
