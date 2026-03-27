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
    const formatted = word.kojienFormatted || `${word.word}【${word.reading}】（${word.partOfSpeech}）${word.definition}`;
    return (
      <main className="main-content">
        <div className="share-dict-page fade-in">
          {/* 辞書風ヘッダー */}
          <div className="share-dict-header">
            <span className="share-dict-label">存在しない言葉辞典</span>
            <span className="share-dict-page-num">p.{Math.floor(Math.random() * 900) + 100}</span>
          </div>

          {/* 辞書の見出し語 */}
          <div className="share-dict-body">
            <div className="share-dict-lines" />
            <h1 className="share-dict-word">{word.word}</h1>
            <p className="share-dict-reading">【{word.reading}】</p>
            <span className="share-dict-pos">{word.partOfSpeech}</span>
            <p className="share-dict-definition">{word.definition}</p>
            {word.examples && word.examples.length > 0 && word.examples[0] && (
              <p className="share-dict-example">
                <span className="share-dict-example-label">▽用例</span>
                「{word.examples[0]}」
              </p>
            )}
            <div className="share-dict-author">
              ── {word.nickname} 編
            </div>
          </div>

          {/* 掲載完了メッセージ */}
          <div className="share-dict-congrats">
            <p className="share-dict-congrats-text">
              新語が辞典に掲載されました
            </p>
            <p className="share-dict-congrats-sub">
              あなたの言葉が辞典の一ページに刻まれました。<br />
              この新しい言葉を世界に広めませんか？
            </p>
          </div>

          {/* シェアボタン（大きく目立つ） */}
          <div className="share-dict-actions">
            <ShareButtons word={word.word} url={shareUrl} />
          </div>

          {/* 通常ページへの導線 */}
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

      <div className="word-detail-content fade-in">
        <WordCard entry={word} showLink={false} />
      </div>

      <div className="word-actions">
        <LikeButton wordId={word.id} initialLikes={word.likes} />
        <ShareButtons word={word.word} url={shareUrl} />
      </div>

      <AdSense slot="word-detail-1" />

      {/* Related Words */}
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
