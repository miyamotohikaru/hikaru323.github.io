"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type Tab = "popular" | "newest";

// 背表紙の色バリエーション
const SPINE_COLORS = [
  { bg: "linear-gradient(180deg, #792E29, #5a1f1b)", text: "#D9D4C8" },
  { bg: "linear-gradient(180deg, #2a3a2e, #1a2a1e)", text: "#c8d4c0" },
  { bg: "linear-gradient(180deg, #2e3a5a, #1e2a4a)", text: "#c0c8d8" },
  { bg: "linear-gradient(180deg, #4a3828, #3a2818)", text: "#d8ccb8" },
  { bg: "linear-gradient(180deg, #3a3425, #2a2418)", text: "#D9D4C8" },
  { bg: "linear-gradient(180deg, #5a4838, #4a3828)", text: "#e0d8c8" },
  { bg: "linear-gradient(180deg, #2e2e3a, #1e1e2a)", text: "#c8c8d8" },
  { bg: "linear-gradient(180deg, #583828, #482818)", text: "#d8c8b8" },
];

function getSpineColor(index: number) {
  return SPINE_COLORS[index % SPINE_COLORS.length];
}

// 本の厚み（文字数に応じて変える）
function getBookWidth(word: WordEntry) {
  const len = (word.definition || "").length;
  if (len > 80) return 70;
  if (len > 40) return 58;
  return 48;
}

// 背表紙タイトルを、長い場合は自然な区切りで2行(2列)に分割する。
// 区切り優先度: 助詞の直後 ＞ 漢字↔かな/カタカナの境目。中央に近いほど優先。
function splitSpineTitle(word: string): string[] {
  const chars = Array.from(word);
  if (chars.length <= 7) return [word];
  const mid = Math.round(chars.length / 2);
  const isKanji = (c: string) => /[一-鿿々]/.test(c);
  const isKatakana = (c: string) => /[゠-ヿ]/.test(c);
  const particles = new Set(["の", "は", "を", "に", "へ", "と", "で", "が", "も", "や"]);
  let best = mid;
  let bestScore = -Infinity;
  for (let i = 2; i <= chars.length - 2; i++) {
    const prev = chars[i - 1];
    const cur = chars[i];
    let score = 0;
    // 文字種の変わり目（漢字↔かな、カタカナ↔ひらがな）を主な区切り候補に
    if (isKanji(prev) !== isKanji(cur)) score = 2;
    else if (isKatakana(prev) !== isKatakana(cur)) score = 2;
    // 助詞の前後はやや優先（軽い加点）
    if (particles.has(prev)) score += 1;
    if (particles.has(cur)) score += 1;
    if (score === 0) continue;
    // 中央寄りを強めに重視（バランスの良い2分割を優先）
    const adj = score * 3 - Math.abs(i - mid);
    if (adj > bestScore) {
      bestScore = adj;
      best = i;
    }
  }
  return [chars.slice(0, best).join(""), chars.slice(best).join("")];
}

// 1列に収まる文字数に応じてフォントサイズを決める（縦書き・可読下限/上限でクランプ）
function spineFontSize(lines: string[]): number {
  const maxLen = Math.max(...lines.map((l) => Array.from(l).length));
  const fs = Math.round(92 / (maxLen * 1.35));
  return Math.max(9, Math.min(15, fs));
}

export default function RankingPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("popular");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  // 1棚あたりの冊数: PC=10冊、携帯(<=640px)=5冊
  const [perShelf, setPerShelf] = useState(10);
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePerShelf = () => setPerShelf(window.innerWidth <= 640 ? 5 : 10);
    updatePerShelf();
    window.addEventListener("resize", updatePerShelf);
    return () => window.removeEventListener("resize", updatePerShelf);
  }, []);

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setSelectedWord(null);
    const sort = activeTab === "popular" ? "popular" : "newest";
    fetch(`/api/words?sort=${sort}&limit=20`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setWords(data.words || []))
      .catch(() => { setWords([]); setFetchError(true); })
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (selectedWord && bookRef.current) {
      bookRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedWord]);

  const handleBookClick = (word: WordEntry) => {
    if (selectedWord?.id === word.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          {t("common.backToDict")}
        </Link>
        <h1 className="page-title">{t("ranking.title")}</h1>
        <p className="page-subtitle">{t("ranking.subtitle")}</p>
      </div>

      <div className="ranking-tabs">
        <button
          className={`ranking-tab ${activeTab === "popular" ? "active" : ""}`}
          onClick={() => setActiveTab("popular")}
        >
          {t("ranking.popular")}
        </button>
        <button
          className={`ranking-tab ${activeTab === "newest" ? "active" : ""}`}
          onClick={() => setActiveTab("newest")}
        >
          {t("ranking.newest")}
        </button>
      </div>

      {loading ? (
        <p className="loading-text">{t("loading.text")}</p>
      ) : fetchError ? (
        <p className="empty-text">データの取得に失敗しました。ページを再読み込みしてください。</p>
      ) : words.length === 0 ? (
        <p className="empty-text">{t("common.noPostsYet")}</p>
      ) : (
        <div className="bookshelf">
          {/* 本棚の段を作る（PC=10冊/段, 携帯=5冊/段） */}
          {chunkArray(words, perShelf).map((shelf, shelfIndex) => (
            <div key={shelfIndex} className="bookshelf-row">
              <div className="bookshelf-books">
                {shelf.map((w, i) => {
                  const globalIndex = shelfIndex * perShelf + i;
                  const color = getSpineColor(globalIndex);
                  const width = getBookWidth(w);
                  const isSelected = selectedWord?.id === w.id;
                  const titleLines = splitSpineTitle(w.word);
                  const titleFs = spineFontSize(titleLines);
                  return (
                    <button
                      key={w.id}
                      className={`book-spine${isSelected ? " spine-selected" : ""}`}
                      style={{
                        background: color.bg,
                        color: color.text,
                        width: `${width}px`,
                      }}
                      onClick={() => handleBookClick(w)}
                    >
                      <span className="book-spine-rank">
                        {globalIndex + 1}
                      </span>
                      <span className="book-spine-title" style={{ fontSize: `${titleFs}px` }}>
                        {titleLines.join("\n")}
                      </span>
                      <span className="book-spine-author">{w.nickname}</span>
                      <span className="book-spine-likes">♡ {w.likes}</span>
                    </button>
                  );
                })}
              </div>
              <div className="bookshelf-board" />

              {/* 選択された本がこの段にある場合、説明を表示 */}
              {selectedWord && shelf.some((w) => w.id === selectedWord.id) && (
                <div ref={bookRef} className="open-book-wrapper book-enter">
                  <div className="open-book">
                    <div className="open-book-left">
                      <div className="open-book-left-lines">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="book-line" />
                        ))}
                      </div>
                      <div className="open-book-left-text">
                        {t("home.title")}
                      </div>
                    </div>
                    <div className="open-book-spine" />
                    <div className="open-book-right">
                      <div className="open-book-header">
                        <div className="open-book-word">{selectedWord.word}</div>
                        <div className="open-book-meta">
                          <span className="open-book-reading">
                            【{selectedWord.reading}】
                          </span>
                          <span className="open-book-pos">
                            {selectedWord.partOfSpeech}
                          </span>
                        </div>
                      </div>
                      <div className="open-book-body">
                        <p className="open-book-definition">
                          {selectedWord.definition}
                        </p>
                        {selectedWord.examples &&
                          selectedWord.examples.length > 0 &&
                          selectedWord.examples[0] && (
                            <p className="open-book-example">
                              ▽用例 「{selectedWord.examples[0]}」
                            </p>
                          )}
                      </div>
                      <div className="open-book-footer">
                        <span className="open-book-author">
                          {selectedWord.nickname} 編
                        </span>
                        <Link
                          href={`/word/${selectedWord.id}`}
                          className="open-book-detail-link"
                        >
                          {t("ranking.detail")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
