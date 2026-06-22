"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WordEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import LikeButton from "@/components/LikeButton";

type Tab = "popular" | "recommend" | "newest";

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

// 品詞ごとに色を固定で割り当てる（同じ品詞は同じ色＝本棚が品詞で色分けされる）
const POS_ORDER = [
  "名詞", "動詞", "形容詞", "形容動詞", "副詞", "感動詞", "連体詞", "接続詞",
];
// 英語品詞 → 日本語品詞へ正規化（同じ意味は同じ色に）
const POS_EN_MAP: Record<string, string> = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
  interjection: "感動詞",
  conjunction: "接続詞",
  pronoun: "連体詞",
};
function normalizePos(pos: string): string {
  const p = (pos || "").trim();
  return POS_EN_MAP[p.toLowerCase()] || p;
}

function posColorIndex(pos: string): number {
  const norm = normalizePos(pos);
  const known = POS_ORDER.indexOf(norm);
  if (known >= 0) return known % SPINE_COLORS.length;
  // 未知の品詞は文字列ハッシュで安定して色付け
  let h = 0;
  for (const ch of norm) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % SPINE_COLORS.length;
}

function getPosColor(pos: string) {
  return SPINE_COLORS[posColorIndex(pos)];
}

// 本の厚み（すべて同じ幅で揃える）
const BOOK_WIDTH = 56;

// 背表紙タイトルを、長い場合は自然な区切りで2行(2列)に分割する。
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
    if (isKanji(prev) !== isKanji(cur)) score = 2;
    else if (isKatakana(prev) !== isKatakana(cur)) score = 2;
    if (particles.has(prev)) score += 1;
    if (particles.has(cur)) score += 1;
    if (score === 0) continue;
    const adj = score * 3 - Math.abs(i - mid);
    if (adj > bestScore) {
      bestScore = adj;
      best = i;
    }
  }
  return [chars.slice(0, best).join(""), chars.slice(best).join("")];
}

function spineFontSize(lines: string[]): number {
  const maxLen = Math.max(...lines.map((l) => Array.from(l).length));
  const fs = Math.round(92 / (maxLen * 1.35));
  return Math.max(9, Math.min(15, fs));
}

// 「新着」初期表示は画面が埋まる分だけ読み込む
function computeNewestLimit(): number {
  if (typeof window === "undefined") return 30;
  const perShelf = window.innerWidth <= 640 ? 5 : 10;
  const rowH = 180; // 1段の概算高さ(px)
  const rows = Math.ceil(window.innerHeight / rowH) + 1;
  return Math.min(100, Math.max(perShelf * 2, rows * perShelf));
}

export default function RankingPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("popular");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  // 1棚あたりの冊数: PC=10冊、携帯(<=640px)=5冊
  const [perShelf, setPerShelf] = useState(10);
  const bookRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<string | null>(null);
  const loadMoreRef = useRef<() => void>(() => {});

  useEffect(() => {
    const updatePerShelf = () => setPerShelf(window.innerWidth <= 640 ? 5 : 10);
    updatePerShelf();
    window.addEventListener("resize", updatePerShelf);
    return () => window.removeEventListener("resize", updatePerShelf);
  }, []);

  // タブ切替時の初回ロード
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);
    setSelectedWord(null);
    setWords([]);
    setHasMore(false);
    cursorRef.current = null;

    const run = async () => {
      try {
        if (activeTab === "newest") {
          const lim = computeNewestLimit();
          const res = await fetch(`/api/words?sort=newest&limit=${lim}`, { cache: "no-store" });
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (cancelled) return;
          const list: WordEntry[] = data.words || [];
          setWords(list);
          cursorRef.current = list.length ? list[list.length - 1].id : null;
          setHasMore(list.length >= lim);
        } else {
          const sort = activeTab === "popular" ? "popular" : "recommend";
          const res = await fetch(`/api/words?sort=${sort}&limit=50`, { cache: "no-store" });
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (cancelled) return;
          setWords(data.words || []);
          setHasMore(false);
        }
      } catch {
        if (!cancelled) { setWords([]); setFetchError(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeTab]);

  // 「新着」の追加読み込み（無限スクロール）
  const loadMore = async () => {
    if (activeTab !== "newest" || loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const lim = 20;
      const res = await fetch(
        `/api/words?sort=newest&limit=${lim}&cursor=${cursorRef.current}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const more: WordEntry[] = data.words || [];
      setWords((prev) => {
        const seen = new Set(prev.map((w) => w.id));
        return [...prev, ...more.filter((w) => !seen.has(w.id))];
      });
      cursorRef.current = more.length ? more[more.length - 1].id : cursorRef.current;
      setHasMore(more.length >= lim);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };
  loadMoreRef.current = loadMore;

  // 末尾センチネルが見えたら追加読み込み
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreRef.current(); },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activeTab, hasMore]);

  useEffect(() => {
    if (selectedWord && bookRef.current) {
      bookRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedWord]);

  const handleBookClick = (word: WordEntry) => {
    setSelectedWord((cur) => (cur?.id === word.id ? null : word));
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
          className={`ranking-tab ${activeTab === "recommend" ? "active" : ""}`}
          onClick={() => setActiveTab("recommend")}
        >
          {t("ranking.recommend")}
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
                  const color = getPosColor(w.partOfSpeech);
                  const width = BOOK_WIDTH;
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
                          <span className="open-book-author">
                            {selectedWord.nickname} 編
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
                        <LikeButton
                          key={selectedWord.id}
                          wordId={selectedWord.id}
                          initialLikes={selectedWord.likes}
                        />
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

          {/* 無限スクロール用センチネル＋追加読み込み表示（新着のみ） */}
          {activeTab === "newest" && hasMore && (
            <div ref={sentinelRef} className="bookshelf-sentinel">
              {loadingMore && <span className="loading-text">{t("loading.text")}</span>}
            </div>
          )}
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
