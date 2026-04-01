"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ShareButtons from "@/components/ShareButtons";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [word, setWord] = useState<RandomWord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

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
        {isLoading ? t("omikuji.pulling") : t("omikuji.button")}
      </button>

      {showModal && word && portalTarget && createPortal(
        <div className="random-modal-overlay" onClick={handleClose}>
          <div className="random-modal" onClick={(e) => e.stopPropagation()}>
            <div className="random-modal-header">
              <span className="random-modal-label">{t("home.title")}</span>
              <button className="random-modal-close" onClick={handleClose}>×</button>
            </div>

            <div className="random-modal-body">
              <p className="random-modal-intro">{t("omikuji.intro")}</p>

              {word.wordNumber && word.totalCount && (
                <p className="random-modal-number">
                  {t("omikuji.wordNum", { n: word.wordNumber, total: word.totalCount })}
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
                {t("omikuji.retry")}
              </button>
              <button className="random-modal-close-btn" onClick={handleClose}>
                {t("omikuji.close")}
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </>
  );
}
