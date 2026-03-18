"use client";

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
  if (!word) {
    return (
      <main className="main-content">
        <div className="not-found">
          <h1>語が見つかりません</h1>
          <p>お探しの言葉は辞典に登録されていないようです。</p>
          <Link href="/" className="nav-link">
            辞典に戻る →
          </Link>
        </div>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://fictionary.vercel.app/word/${word.id}`;

  return (
    <main className="main-content">
      <div className="word-detail-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
      </div>

      <WordCard entry={word} showLink={false} />

      <div className="word-actions">
        <LikeButton wordId={word.id} initialLikes={word.likes} />
        <ShareButtons word={word.word} url={shareUrl} />
      </div>

      <AdSense slot="word-detail-1" />

      {/* Related Words */}
      {relatedWords.length > 0 && (
        <section className="section">
          <h2 className="section-title">関連する造語</h2>
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
