"use client";

import { useState, useEffect } from "react";
import { WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";

export default function RecentWords() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/words?limit=5&sort=newest")
      .then((res) => res.json())
      .then((data) => setWords(data.words || []))
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="recent-words">
        <h2 className="recent-words-heading">最近生まれた言葉</h2>
        <p className="loading-text">読み込み中…</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="recent-words">
        <h2 className="recent-words-heading">最近生まれた言葉</h2>
        <p className="recent-words-empty">
          まだ言葉が登録されていません。あなたが最初の一語を投稿してみませんか？
        </p>
      </div>
    );
  }

  return (
    <div className="recent-words">
      <h2 className="recent-words-heading">最近生まれた言葉</h2>
      <div className="recent-words-list">
        {words.map((word) => (
          <KojienEntry key={word.id} entry={word} showMeta />
        ))}
      </div>
    </div>
  );
}
