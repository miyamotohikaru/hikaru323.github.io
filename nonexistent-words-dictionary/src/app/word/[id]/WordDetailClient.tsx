"use client";

import Link from "next/link";
import WordCard from "@/components/WordCard";
import { WordEntry } from "@/lib/types";

interface Props {
  word: (WordEntry & { id: string }) | null;
}

export default function WordDetailClient({ word }: Props) {
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

  return (
    <main className="main-content">
      <div className="word-detail-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
      </div>
      <WordCard entry={word} showLink={false} />
      <nav className="bottom-nav">
        <Link href="/gojuon" className="nav-link">
          五十音一覧を見る →
        </Link>
      </nav>
    </main>
  );
}
