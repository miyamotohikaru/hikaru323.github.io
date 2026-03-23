import type { WordEntry } from "@/lib/types";
import KojienEntry from "./KojienEntry";

interface RecentWordsProps {
  words: WordEntry[];
}

export default function RecentWords({ words }: RecentWordsProps) {
  if (words.length === 0) {
    return (
      <div className="recent-section">
        <h2 className="recent-heading">最近生まれた言葉</h2>
        <p className="recent-empty">まだ言葉が生まれていません。最初の1語を投稿してみませんか？</p>
      </div>
    );
  }

  return (
    <div className="recent-section">
      <h2 className="recent-heading">最近生まれた言葉</h2>
      <div className="recent-list">
        {words.map((word) => (
          <KojienEntry key={word.id} entry={word} />
        ))}
      </div>
    </div>
  );
}
