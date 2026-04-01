"use client";

import { useState, useEffect, useRef } from "react";

interface FallingWord {
  id: number;
  word: string;
  x: number;        // left %
  duration: number;  // seconds
  delay: number;     // seconds
  size: number;      // font size rem
  opacity: number;
}

export default function FallingWords() {
  const [words, setWords] = useState<string[]>([]);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const counterRef = useRef(0);

  // 登録語を取得
  useEffect(() => {
    fetch("/api/words?sort=newest&limit=50")
      .then((res) => res.json())
      .then((data) => {
        const wordList = (data.words || []).map((w: { word: string }) => w.word);
        if (wordList.length > 0) {
          setWords(wordList);
        }
      })
      .catch(() => {});
  }, []);

  // 定期的に新しい文字を追加
  useEffect(() => {
    if (words.length === 0) return;

    const createWord = (): FallingWord => {
      counterRef.current += 1;
      return {
        id: counterRef.current,
        word: words[Math.floor(Math.random() * words.length)],
        x: Math.random() * 90 + 5,
        duration: Math.random() * 8 + 10,
        delay: 0,
        size: Math.random() * 0.7 + 0.9,
        opacity: Math.random() * 0.15 + 0.12,
      };
    };

    // 初期表示: 画面にばらまく
    const initial: FallingWord[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push({
        ...createWord(),
        delay: -(Math.random() * 15),
      });
    }
    setFallingWords(initial);

    // 2秒ごとに1つ追加
    const interval = setInterval(() => {
      setFallingWords((prev) => {
        const next = [...prev, createWord()];
        // 30個を超えたら古いものを削除
        if (next.length > 30) {
          return next.slice(next.length - 30);
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [words]);

  if (words.length === 0) return null;

  return (
    <div className="falling-words-container" aria-hidden="true">
      {fallingWords.map((fw) => (
        <span
          key={fw.id}
          className="falling-word"
          style={{
            left: `${fw.x}%`,
            animationDuration: `${fw.duration}s`,
            animationDelay: `${fw.delay}s`,
            fontSize: `${fw.size}rem`,
            opacity: fw.opacity,
          }}
        >
          {fw.word}
        </span>
      ))}
    </div>
  );
}
