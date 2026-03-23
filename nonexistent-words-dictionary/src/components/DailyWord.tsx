"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import LikeButton from "@/components/LikeButton";

export default function DailyWord() {
  const [word, setWord] = useState<WordEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily")
      .then((res) => res.json())
      .then((data) => setWord(data.word || null))
      .catch(() => setWord(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !word) return null;

  return (
    <div className="daily-word">
      <span className="daily-word-label">本日の見出し語</span>
      <Link href={`/word/${word.id}`} className="daily-word-card">
        <p className="daily-word-text">
          {word.kojienFormatted || (
            <>
              {word.word}【{word.reading}】（{word.partOfSpeech}）{word.definition}
            </>
          )}
        </p>
      </Link>
      <div className="daily-word-footer">
        <LikeButton wordId={word.id} initialLikes={word.likes} />
      </div>
    </div>
  );
}
