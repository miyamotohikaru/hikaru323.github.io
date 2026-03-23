"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!word) {
      router.replace("/");
    }
  }, [word, router]);

  if (!word) {
    return null;
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
