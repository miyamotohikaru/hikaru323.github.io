"use client";

import { useState } from "react";
import ShareButtons from "@/components/ShareButtons";

interface RandomWord {
  id: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
  nickname: string;
  likes: number;
  wordNumber?: number;
  totalCount?: number;
}

export default function RandomWordButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [word, setWord] = useState<RandomWord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/words/random");
      const data = await res.json();
      if (data.id) {
        setWord(data);
        setShowModal(true);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setWord(null);
  };

  const handleAnother = async () => {
    setWord(null);
    await handleClick();
  };

  const shareUrl = word && typeof window !== "undefined"
    ? `${window.location.origin}/word/${word.id}`
    : "";

  return (
    <>
      <button
        className="random-word-button"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "引いてます…" : "おみくじ"}
      </button>

      {showModal && word && (
        <div className="random-modal-overlay" onClick={handleClose}>
          <div className="random-modal" onClick={(e) => e.stopPropagation()}>
            <div className="random-modal-header">
              <span className="random-modal-label">存在しない言葉辞典</span>
              <button className="random-modal-close" onClick={handleClose}>×</button>
            </div>

            <div className="random-modal-body">
              <p className="random-modal-intro">あなたが引いた言葉は…</p>

              {word.wordNumber && word.totalCount && (
                <p className="random-modal-number">
                  第 {word.wordNumber} 語 / 全 {word.totalCount} 語
                </p>
              )}

              <h2 className="random-modal-word">{word.word}</h2>
              <div className="random-modal-meta">
                <span className="random-modal-reading">【{word.reading}】</span>
                <span className="random-modal-pos">{word.partOfSpeech}</span>
              </div>
              <p className="random-modal-definition">{word.definition}</p>
              {word.examples && word.examples.length > 0 && word.examples[0] && (
                <p className="random-modal-example">
                  ▽用例 「{word.examples[0]}」
                </p>
              )}
              <p className="random-modal-author">── {word.nickname} 編</p>
            </div>

            <div className="random-modal-actions">
              <ShareButtons word={word.word} url={shareUrl} />
              <button className="random-modal-retry" onClick={handleAnother}>
                もう一回引く
              </button>
              <button className="random-modal-close-btn" onClick={handleClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
