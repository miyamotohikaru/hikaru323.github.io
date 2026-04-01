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
    fetch("/api/words?sort=newest&limit=500")
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
        opacity: isLeaf ? Math.random() * 0.1 + 0.1 : Math.random() * 0.15 + 0.12,
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
          <img
            key={item.id}
            src="/kosukuma_white.png"
            alt=""
            className="falling-leaf"
            style={{
              left: `${item.x}%`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              opacity: item.opacity,
              width: `${item.size}px`,
              transform: `rotate(${item.rotation}deg)`,
            }}
          />
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
