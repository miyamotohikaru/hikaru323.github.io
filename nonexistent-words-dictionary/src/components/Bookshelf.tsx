"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";

interface BookshelfProps {
  words: WordEntry[];
}

const SPINE_COLORS = [
  { bg: "linear-gradient(180deg, #4a3028 0%, #382018 100%)", text: "#d4b87a", edge: "#2a1810" },
  { bg: "linear-gradient(180deg, #2a3040 0%, #1a2535 100%)", text: "#8ab0d4", edge: "#141c28" },
  { bg: "linear-gradient(180deg, #2a3a28 0%, #1c2c1a 100%)", text: "#8ad46a", edge: "#141e10" },
  { bg: "linear-gradient(180deg, #3a2a3a 0%, #2c1c2c 100%)", text: "#d48aba", edge: "#1e1020" },
  { bg: "linear-gradient(180deg, #3a3828 0%, #2c2a1a 100%)", text: "#d4ca7a", edge: "#1e1c10" },
  { bg: "linear-gradient(180deg, #283a3a 0%, #1a2c2c 100%)", text: "#6ad4d4", edge: "#101e1e" },
  { bg: "linear-gradient(180deg, #3a3030 0%, #2c2020 100%)", text: "#d4a08a", edge: "#1e1210" },
  { bg: "linear-gradient(180deg, #303040 0%, #202030 100%)", text: "#a0a0d4", edge: "#141420" },
];

export default function Bookshelf({ words }: BookshelfProps) {
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [pullingIndex, setPullingIndex] = useState<number>(-1);
  const openBookRef = useRef<HTMLDivElement>(null);

  const handleSpineClick = (word: WordEntry, index: number) => {
    if (pullingIndex >= 0) return;

    // If same word, close it
    if (selectedWord?.id === word.id) {
      handleClose();
      return;
    }

    setPullingIndex(index);

    setTimeout(() => {
      setSelectedWord(word);
      setIsOpening(true);
      setPullingIndex(-1);

      // Scroll to opened book
      setTimeout(() => {
        openBookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }, 400);
  };

  const handleClose = () => {
    setIsOpening(false);
    setTimeout(() => setSelectedWord(null), 300);
  };

  return (
    <div className="bookshelf-container">
      {/* The shelf */}
      <div className="bookshelf">
        <div className="bookshelf-books">
          {words.map((word, i) => {
            const color = SPINE_COLORS[i % SPINE_COLORS.length];
            // Vary height based on word length
            const height = 140 + Math.min(word.word.length * 12, 80);

            return (
              <button
                key={word.id}
                className={`book-spine ${pullingIndex === i ? "spine-pulling" : ""} ${selectedWord?.id === word.id ? "spine-selected" : ""}`}
                style={{
                  background: color.bg,
                  color: color.text,
                  height: `${height}px`,
                  borderRight: `2px solid ${color.edge}`,
                }}
                onClick={() => handleSpineClick(word, i)}
                title={`${word.word}【${word.reading}】`}
              >
                <span className="spine-title">{word.word}</span>
              </button>
            );
          })}
        </div>
        {/* Shelf surface */}
        <div className="bookshelf-surface" />
      </div>

      {/* Opened book */}
      {selectedWord && (
        <div
          ref={openBookRef}
          className={`open-book-wrapper ${isOpening ? "book-enter" : "book-exit"}`}
        >
          <div className="open-book">
            {/* Left page (decorative) */}
            <div className="open-book-left">
              <div className="open-book-left-lines">
                <div className="book-line" />
                <div className="book-line" />
                <div className="book-line" />
                <div className="book-line" />
                <div className="book-line" />
              </div>
              <p className="open-book-left-text">存在しない言葉辞典</p>
            </div>

            {/* Spine / Center */}
            <div className="open-book-spine" />

            {/* Right page (content) */}
            <div className="open-book-right">
              <div className="open-book-header">
                <h3 className="open-book-word">{selectedWord.word}</h3>
                <div className="open-book-meta">
                  <span className="open-book-reading">【{selectedWord.reading}】</span>
                  <span className="open-book-pos">{selectedWord.partOfSpeech}</span>
                </div>
              </div>
              <div className="open-book-body">
                <p className="open-book-definition">{selectedWord.definition}</p>
              </div>
              <div className="open-book-footer">
                <Link href={`/word/${selectedWord.id}`} className="open-book-detail-link">
                  この言葉を詳しく見る →
                </Link>
                <button onClick={handleClose} className="open-book-close">
                  本を戻す
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
