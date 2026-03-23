"use client";

import Link from "next/link";
import { WordEntry } from "@/lib/types";
import LikeButton from "@/components/LikeButton";

interface KojienEntryProps {
  entry: WordEntry;
  showMeta?: boolean;
}

export default function KojienEntry({ entry, showMeta = false }: KojienEntryProps) {
  const formatted = entry.kojienFormatted;

  return (
    <article className="kojien-entry">
      <div className="kojien-entry-inner">
        <Link href={`/word/${entry.id}`} className="kojien-entry-link">
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
        </Link>
        <div className="kojien-entry-like">
          <LikeButton wordId={entry.id} initialLikes={entry.likes} />
        </div>
      </div>
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
