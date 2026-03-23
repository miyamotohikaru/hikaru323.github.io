import Link from "next/link";
import type { WordEntry } from "@/lib/types";

interface KojienEntryProps {
  entry: WordEntry;
  showLink?: boolean;
  showMeta?: boolean;
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

export default function KojienEntry({ entry, showLink = true, showMeta = true }: KojienEntryProps) {
  const formatted = entry.kojienFormatted || `${entry.word}【${entry.reading}】（${entry.partOfSpeech}）${entry.definition}`;

  const content = (
    <div className="kojien-entry">
      <p className="kojien-text">{formatted}</p>
      {showMeta && (
        <div className="kojien-meta">
          <span className="kojien-author">{entry.nickname}</span>
          {entry.createdAt && (
            <span className="kojien-time">{timeAgo(entry.createdAt)}</span>
          )}
          <span className="kojien-likes">♡ {entry.likes}</span>
        </div>
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/word/${entry.id}`} className="kojien-entry-link">
        {content}
      </Link>
    );
  }

  return content;
}
