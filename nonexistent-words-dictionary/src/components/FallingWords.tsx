"use client";

import { useState, useEffect, useRef } from "react";

interface FallingItem {
  id: number;
  type: "word" | "leaf";
  word: string;
  x: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  rotation: number;
}

export default function FallingWords() {
  const [words, setWords] = useState<string[]>([]);
  const [items, setItems] = useState<FallingItem[]>([]);
  const counterRef = useRef(0);

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

  useEffect(() => {
    if (words.length === 0) return;

    const createItem = (): FallingItem => {
      counterRef.current += 1;
      const isLeaf = Math.random() < 0.3;
      return {
        id: counterRef.current,
        type: isLeaf ? "leaf" : "word",
        word: words[Math.floor(Math.random() * words.length)],
        x: Math.random() * 90 + 5,
        duration: Math.random() * 8 + 10,
        delay: 0,
        size: isLeaf ? Math.random() * 20 + 16 : Math.random() * 0.7 + 0.9,
        opacity: isLeaf ? Math.random() * 0.06 + 0.04 : Math.random() * 0.15 + 0.12,
        rotation: Math.random() * 360,
      };
    };

    const initial: FallingItem[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push({
        ...createItem(),
        delay: -(Math.random() * 15),
      });
    }
    setItems(initial);

    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev, createItem()];
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
      {items.map((item) =>
        item.type === "leaf" ? (
          <span
            key={item.id}
            className="falling-leaf"
            style={{
              left: `${item.x}%`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              opacity: item.opacity,
              width: `${item.size}px`,
              height: `${item.size * 1.3}px`,
              transform: `rotate(${item.rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M60 10 Q58 40, 55 70 Q52 100, 60 150" />
                <path d="M55 30 Q30 25, 20 40 Q15 50, 35 50 Q45 48, 55 42" />
                <path d="M53 55 Q28 50, 18 65 Q13 75, 33 75 Q43 73, 53 67" />
                <path d="M52 80 Q30 77, 22 90 Q18 98, 36 97 Q44 95, 52 90" />
                <path d="M54 105 Q38 103, 30 112 Q27 118, 40 118 Q47 116, 54 112" />
                <path d="M58 20 Q80 15, 90 28 Q95 38, 75 38 Q65 37, 58 32" />
                <path d="M56 45 Q78 40, 88 53 Q93 63, 73 63 Q63 61, 56 55" />
                <path d="M55 70 Q75 67, 83 78 Q87 86, 70 85 Q62 83, 55 78" />
                <path d="M56 93 Q72 90, 78 99 Q81 105, 68 105 Q61 103, 56 99" />
              </g>
            </svg>
          </span>
        ) : (
          <span
            key={item.id}
            className="falling-word"
            style={{
              left: `${item.x}%`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              fontSize: `${item.size}rem`,
              opacity: item.opacity,
            }}
          >
            {item.word}
          </span>
        )
      )}
    </div>
  );
}
