"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { KojienEntryData } from "@/lib/types";

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

    try {
      let authorToken = localStorage.getItem("fictionary_author_token");
      if (!authorToken) {
        authorToken = crypto.randomUUID();
        localStorage.setItem("fictionary_author_token", authorToken);
      }

      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: entry.word,
          reading: entry.reading,
          partOfSpeech: entry.partOfSpeech,
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

      if (res.status === 409 && data.existingId) {
        setError("この言葉はすでに掲載されています。");
        return;
      }

      if (!res.ok) {
        setError(data.error || "掲載に失敗しました。");
        return;
      }

      // Update local stats
      const postsCount = parseInt(localStorage.getItem("fictionary_posts_count") || "0", 10);
      localStorage.setItem("fictionary_posts_count", String(postsCount + 1));

      setSaved(true);
      setTimeout(() => router.push(`/word/${data.id}`), 1500);
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="preview-section fade-in">
        <div className="preview-success">
          <p>辞典に掲載されました。ページに移動します…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-section fade-in">
      <h3 className="preview-title">辞典プレビュー</h3>
      <div className="preview-card">
        <p className="preview-formatted">{entry.formatted}</p>
      </div>
      <p className="preview-confirm-text">この形で辞典に載せますか？</p>
      <div className="preview-actions">
        <button onClick={handleConfirm} disabled={isSaving} className="preview-confirm-btn">
          {isSaving ? "掲載中…" : "この形で載せる"}
        </button>
        <button onClick={onRetry} disabled={isSaving} className="preview-retry-btn">
          修正して再申請
        </button>
      </div>
      {error && <div className="submit-error fade-in"><p>{error}</p></div>}
    </div>
  );
}
