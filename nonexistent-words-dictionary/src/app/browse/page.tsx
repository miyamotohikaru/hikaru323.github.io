"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GOJUON_ROWS } from "@/lib/types";
import type { WordEntry } from "@/lib/types";
import KojienEntry from "@/components/KojienEntry";

const ALL_KANA = GOJUON_ROWS.flatMap((row) => row.kana);

export default function BrowsePage() {
  const [selectedKana, setSelectedKana] = useState("あ");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [kanaCounts, setKanaCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/words?counts=true")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setKanaCounts(data.kanaCounts || {}))
      .catch(() => {});
  }, []);

  const fetchWords = useCallback(async (kana: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/words?kana=${encodeURIComponent(kana)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWords(data.words || []);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(selectedKana);
  }, [selectedKana, fetchWords]);

  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">五十音一覧</h1>
        <p className="page-subtitle">
          登録された造語を五十音順でお引きいただけます。
        </p>
      </div>

      <div className="gojuon-grid">
        {ALL_KANA.map((k) => {
          const count = kanaCounts[k] || 0;
          return (
            <button
              key={k}
              className={`gojuon-cell ${selectedKana === k ? "active" : ""} ${count > 0 ? "has-words" : "empty"}`}
              onClick={() => setSelectedKana(k)}
            >
              {k}
            </button>
          );
        })}
      </div>

      <h2 className="kana-heading">「{selectedKana}」</h2>
      {loading ? (
        <p className="loading-text">読み込み中…</p>
      ) : words.length === 0 ? (
        <p className="empty-text">
          「{selectedKana}」で始まる言葉はまだありません。<br />
          あなたが最初の一語を投稿してみませんか？
        </p>
      ) : (
        <div className="browse-kojien-list">
          {words.map((w) => (
            <KojienEntry key={w.id} entry={w} />
          ))}
        </div>
      )}
    </main>
  );
}
