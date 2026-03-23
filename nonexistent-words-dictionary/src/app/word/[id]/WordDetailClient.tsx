"use client";

import Link from "next/link";
import KojienEntry from "@/components/KojienEntry";
import LikeButton from "@/components/LikeButton";
import ShareButtons from "@/components/ShareButtons";
import ReportButton from "@/components/ReportButton";
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

      <div className="word-detail-content fade-in">
        <KojienEntry entry={word} showLink={false} />

        {word.etymology && (
          <div className="word-section">
            <div className="section-label">語源</div>
            <p className="word-etymology">{word.etymology}</p>
          </div>
        )}

        {word.examples.length > 0 && (
          <div className="word-section">
            <div className="section-label">用例</div>
            <ul className="word-examples">
              {word.examples.map((ex, i) => (
                <li key={i} className="word-example">{ex}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="word-actions">
        <LikeButton wordId={word.id} initialLikes={word.likes} />
        <ShareButtons word={word.word} url={shareUrl} />
      </div>

      {relatedWords.length > 0 && (
        <section className="section">
          <span className="section-label-text">関連する造語</span>
          <div className="browse-kojien-list">
            {relatedWords.map((w) => (
              <KojienEntry key={w.id} entry={w} />
            ))}
          </div>
        </section>
      )}

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
