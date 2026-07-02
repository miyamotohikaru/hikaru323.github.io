"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CARDS, type Card } from "@/data/cards";
import { UI, useLang } from "@/lib/i18n";
import { DISPLAY_STATUS_META, cardText, displayStatus, yearLabel } from "@/lib/meta";

function normalize(s: string): string {
  return s
    .toLowerCase()
    // カタカナ→ひらがな
    .replace(/[ァ-ヶ]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function match(card: Card, q: string): boolean {
  const n = normalize(q);
  const hay = normalize(
    [card.id, String(card.num), card.ja.name, card.ja.enName, card.ja.reading, card.en.name, card.en.reading].join(" "),
  );
  return n.split(/\s+/).every((part) => hay.includes(part));
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { lang, tx } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return CARDS.filter((c) => match(c, q.trim())).slice(0, 24);
  }, [q]);

  // 開いたら入力へフォーカス・背景スクロールをロック、閉じたら呼び出し元へフォーカスを戻す
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus();
    };
  }, []);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = (card: Card) => {
    onClose();
    router.push(`/entry/${card.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab") {
      // 入力と閉じるボタンの間でフォーカスを循環させる
      e.preventDefault();
      (document.activeElement === inputRef.current ? closeRef.current : inputRef.current)?.focus();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === "Enter" && results[cursor]) go(results[cursor]);
  };

  const activeId = results[cursor] ? `da-opt-${results[cursor].id}` : undefined;

  return (
    <div
      className="da-fade fixed inset-0 z-50 bg-da-bg/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={tx(UI.search)}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        // 検索UI（入力欄・結果行など）以外＝枠外をタップしたら閉じる
        const t = e.target as HTMLElement;
        if (t.closest("input,button,a,[data-search-keep]")) return;
        onClose();
      }}
    >
      <div className="mx-auto flex h-full max-w-2xl flex-col px-4 pt-[12vh] sm:px-6">
        <div data-search-keep className="flex items-center gap-3 border-b-2 border-da-ink pb-3">
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-da-accent" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="m13.2 13.2 3.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tx(UI.searchPlaceholder)}
            role="combobox"
            aria-label={tx(UI.search)}
            aria-expanded={results.length > 0}
            aria-controls="da-search-list"
            aria-activedescendant={activeId}
            autoComplete="off"
            className="font-mincho w-full bg-transparent text-xl outline-none placeholder:text-da-muted/60"
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded px-3 py-2 font-mono text-[11px] tracking-[0.15em] text-da-muted hover:text-da-ink"
          >
            ESC
          </button>
        </div>

        <p data-search-keep className="mt-2 font-mono text-[10px] tracking-[0.15em] text-da-muted">{tx(UI.searchHint)}</p>

        <ul ref={listRef} id="da-search-list" className="mt-4 flex-1 overflow-y-auto pb-24" role="listbox">
          {results.map((card, i) => {
            const t = cardText(card, lang);
            return (
              <li key={card.id} id={`da-opt-${card.id}`} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => go(card)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex w-full items-baseline gap-3 border-b da-hairline px-2 py-3 text-left transition-colors ${
                    i === cursor ? "bg-da-ink/6" : ""
                  }`}
                >
                  <span className="font-display w-12 shrink-0 text-sm italic text-da-accent-text">№{card.num}</span>
                  <span className="font-mincho text-base font-medium">{t.name}</span>
                  <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.12em] text-da-muted sm:inline">
                    {t.enName}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-da-muted">
                    {tx(DISPLAY_STATUS_META[displayStatus(card)].label)} · {yearLabel(card)}
                  </span>
                </button>
              </li>
            );
          })}
          {q.trim() && results.length === 0 && (
            <li className="font-mincho px-2 py-8 text-center text-da-muted">{tx(UI.noResults)}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
