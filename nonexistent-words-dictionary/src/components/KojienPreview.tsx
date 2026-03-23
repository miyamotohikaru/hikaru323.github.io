"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface KojienEntryData {
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  formatted: string;
}

interface KojienPreviewProps {
  entry: KojienEntryData;
  nickname: string;
  onRetry: () => void;
}

export default function KojienPreview({ entry, nickname, onRetry }: KojienPreviewProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSaving(true);
    setError(null);

    // Generate authorToken if not exists
    let authorToken = localStorage.getItem("fictionary_author_token");
    if (!authorToken) {
      authorToken = crypto.randomUUID();
      localStorage.setItem("fictionary_author_token", authorToken);
    }

    // Track post count
    const postsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: entry.word,
          reading: entry.reading,
          partOfSpeech: partOfSpeechFull(entry.partOfSpeech),
          definition: entry.definition,
          etymology: "",
          examples: entry.example ? [entry.example] : [],
          synonyms: "",
          nickname,
          source: "user",
          kojienFormatted: entry.formatted,
          authorToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "掲載に失敗しました。");
        return;
      }

      localStorage.setItem("fictionary_posts_count", String(postsCount + 1));
      setSaved(true);
      setTimeout(() => router.push(`/word/${data.id}`), 1200);
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="kojien-preview-container fade-in">
        <div className="kojien-preview-success">
          <p>辞典に掲載されました。ページに移動します…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kojien-preview-container fade-in">
      <h3 className="kojien-preview-title">辞典プレビュー</h3>
      <div className="kojien-preview-card">
        <p className="kojien-preview-text">{entry.formatted}</p>
      </div>
      <p className="kojien-preview-prompt">この形で辞典に載せますか？</p>
      <div className="kojien-preview-actions">
        <button
          onClick={handleConfirm}
          disabled={isSaving}
          className="kojien-preview-confirm"
        >
          {isSaving ? "掲載中…" : "この形で載せる"}
        </button>
        <button
          onClick={onRetry}
          disabled={isSaving}
          className="kojien-preview-retry"
        >
          修正して再申請
        </button>
      </div>
      {error && (
        <div className="error-message fade-in">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

function partOfSpeechFull(abbr: string): string {
  const map: Record<string, string> = {
    "名": "名詞", "動": "動詞", "形": "形容詞",
    "形動": "形容動詞", "副": "副詞", "感": "感動詞",
  };
  return map[abbr] || abbr;
}
