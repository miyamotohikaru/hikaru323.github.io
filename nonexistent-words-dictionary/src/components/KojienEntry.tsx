"use client";

import { useState } from "react";
import { WordEntry } from "@/lib/types";
import LikeButton from "@/components/LikeButton";
import ShareButtons from "@/components/ShareButtons";

interface KojienEntryProps {
  entry: WordEntry;
  showMeta?: boolean;
}

export default function KojienEntry({ entry, showMeta = false }: KojienEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const formatted = entry.kojienFormatted;

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/word/${entry.id}`
    : `/word/${entry.id}`;

  return (
    <article className="kojien-entry">
      <div className="kojien-entry-inner">
        <button
          className="kojien-entry-link kojien-entry-button"
          onClick={() => setExpanded(!expanded)}
        >
          {formatted ? (
            <p className="kojien-entry-text">{formatted}</p>
          ) : (
            <p className="kojien-entry-text">
              <span className="kojien-word">{entry.word}</span>
              【{entry.reading}】（{entry.partOfSpeech}）{entry.definition}
              {entry.examples && entry.examples.length > 0 && entry.examples[0] && (
                <>。▽用例「{entry.examples[0]}」</>
              )}
            </p>
          )}
          {showMeta && (
            <span className="kojien-entry-meta">
              ── 投稿者: {entry.nickname}
              {entry.createdAt && (
                <> · {formatRelativeTime(entry.createdAt)}</>
              )}
            </span>
          )}
        </button>
        <div className="kojien-entry-like">
          <LikeButton wordId={entry.id} initialLikes={entry.likes} />
        </div>
      </div>

      {/* 展開時: 詳細 & シェアボタン */}
      {expanded && (
        <div className="kojien-entry-detail fade-in">
          <div className="kojien-detail-card">
            <div className="kojien-detail-header">
              <span className="kojien-detail-word">{entry.word}</span>
              <span className="kojien-detail-reading">【{entry.reading}】</span>
              <span className="kojien-detail-pos">{entry.partOfSpeech}</span>
            </div>
            <p className="kojien-detail-definition">{entry.definition}</p>
            {entry.examples && entry.examples.length > 0 && entry.examples[0] && (
              <p className="kojien-detail-example">
                ▽用例 「{entry.examples[0]}」
              </p>
            )}
            <div className="kojien-detail-actions">
              <ShareButtons word={entry.word} url={shareUrl} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}
