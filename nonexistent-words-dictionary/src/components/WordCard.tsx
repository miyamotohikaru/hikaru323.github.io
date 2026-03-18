"use client";

import { WordEntry } from "@/lib/types";
import Link from "next/link";

interface WordCardProps {
  entry: WordEntry & { id: string };
  showLink?: boolean;
}

export default function WordCard({ entry, showLink = true }: WordCardProps) {
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

        <div className="word-section">
          <h3 className="section-label">語源</h3>
          <p className="word-etymology">{entry.etymology}</p>
        </div>

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

        {entry.synonyms && (
          <div className="word-section">
            <h3 className="section-label">類義語</h3>
            <p>{entry.synonyms}</p>
          </div>
        )}

        {entry.notes && (
          <div className="word-section">
            <h3 className="section-label">補足</h3>
            <p>{entry.notes}</p>
          </div>
        )}
      </div>
    </article>
  );
}
