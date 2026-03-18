"use client";

import { WordEntry } from "@/lib/types";
import Link from "next/link";

interface WordCardProps {
  entry: WordEntry;
  showLink?: boolean;
  compact?: boolean;
}

export default function WordCard({ entry, showLink = true, compact = false }: WordCardProps) {
  if (compact) {
    return (
      <article className="word-card-compact">
        <Link href={`/word/${entry.id}`} className="word-card-compact-link">
          <div className="word-card-compact-header">
            <span className="word-list-word">{entry.word}</span>
            <span className="word-list-reading">【{entry.reading}】</span>
            <span className="word-list-pos">{entry.partOfSpeech}</span>
          </div>
          <p className="word-list-def">
            {entry.definition.length > 40
              ? entry.definition.substring(0, 40) + "…"
              : entry.definition}
          </p>
          <div className="word-card-compact-footer">
            <span className="word-card-nickname">{entry.nickname}</span>
            {entry.likes > 0 && <span className="word-card-likes">♥ {entry.likes}</span>}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="word-card fade-in">
      <div className="word-header">
        <h2 className="word-title">
          {showLink && entry.id ? (
            <Link href={`/word/${entry.id}`} className="word-link">
              {entry.word}
            </Link>
          ) : (
            entry.word
          )}
        </h2>
        <span className="word-reading">【{entry.reading}】</span>
        <span className="word-pos">{entry.partOfSpeech}</span>
      </div>

      <div className="word-body">
        <div className="word-section">
          <p className="word-definition">{entry.definition}</p>
        </div>

        {entry.etymology && (
          <div className="word-section">
            <h3 className="section-label">語源</h3>
            <p className="word-etymology">{entry.etymology}</p>
          </div>
        )}

        {entry.examples && entry.examples.length > 0 && (
          <div className="word-section">
            <h3 className="section-label">例文</h3>
            <ul className="word-examples">
              {entry.examples.map((ex, i) => (
                <li key={i} className="word-example">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.synonyms && (
          <div className="word-section">
            <h3 className="section-label">類義語</h3>
            <p className="word-etymology">{entry.synonyms}</p>
          </div>
        )}

        <div className="word-meta">
          <span className="word-meta-nickname">
            {entry.source === "ai" ? "この定義はAIが創作しました" : `投稿者: ${entry.nickname}`}
          </span>
          {entry.createdAt && (
            <span className="word-meta-date">
              {new Date(entry.createdAt).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
