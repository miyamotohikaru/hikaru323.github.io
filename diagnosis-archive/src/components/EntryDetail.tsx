"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { CARDS, type Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import HoloCard from "@/components/HoloCard";
import { ChainBlock } from "@/components/LineageView";
import { chainsFor } from "@/data/lineage";
import { UI, useLang } from "@/lib/i18n";
import { POWER_LABELS, REGION_LABELS, STATS, STATUS_META, cardText, lifespanLabel, yearLabel } from "@/lib/meta";
import { saveCardPng } from "@/lib/saveCard";

const ORDERED = [...CARDS].sort((a, b) => a.num - b.num);

function AdjacentRow({ card, dir }: { card: Card; dir: "prev" | "next" }) {
  const { lang, tx } = useLang();
  const t = cardText(card, lang);
  return (
    <Link
      href={`/entry/${card.id}`}
      className="group flex items-center gap-3 border-b da-hairline py-2.5 transition-colors hover:bg-da-ink/5"
    >
      <span className="w-7 shrink-0 font-mono text-[10px] text-da-muted">{dir === "prev" ? "←" : "→"}</span>
      <CardIcon card={card} className="h-10 w-10 shrink-0" />
      <span className="min-w-0">
        <span className="block font-mono text-[9px] tracking-[0.15em] text-da-muted">
          {card.id} · {yearLabel(card)}
        </span>
        <span className="font-mincho block truncate text-sm font-medium group-hover:text-da-accent">{t.name}</span>
      </span>
    </Link>
  );
}

export default function EntryDetail({ card }: { card: Card }) {
  const { lang, tx } = useLang();
  const router = useRouter();
  const t = cardText(card, lang);
  const chains = chainsFor(card.id);

  const { prev, next } = useMemo(() => {
    const i = ORDERED.findIndex((c) => c.id === card.id);
    return {
      prev: ORDERED[(i - 1 + ORDERED.length) % ORDERED.length],
      next: ORDERED[(i + 1) % ORDERED.length],
    };
  }, [card.id]);

  const save = useCallback(() => saveCardPng(card, lang), [card, lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
        return;
      }
      // 修飾キー付き（Alt+←の戻る等）や、検索などのモーダル表示中は奪わない
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowLeft") {
        router.push(`/entry/${prev.id}`);
      } else if (e.key === "ArrowRight") {
        router.push(`/entry/${next.id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.id, next.id, router, save]);

  const sections: { label: (typeof UI)[keyof typeof UI]; text?: string }[] = [
    { label: UI.summary, text: t.meaning },
    { label: UI.symptom, text: t.symptom },
    { label: UI.history, text: t.history },
    { label: UI.debate, text: t.debate },
  ];

  return (
    <div className="da-fade mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      {/* パンくず */}
      <nav className="flex items-baseline gap-2 font-mono text-[11px] tracking-[0.15em]" aria-label="Breadcrumb">
        <Link href="/" className="text-da-ink transition-colors hover:text-da-accent">
          ← {tx(UI.backToIndex)}
        </Link>
        <span className="text-da-muted">/</span>
        <span className="text-da-muted">{tx(STATUS_META[card.cat].label)}</span>
        <span className="text-da-muted">/</span>
        <span className="text-da-accent-text">{card.id}</span>
        <span className="ml-auto text-da-muted">
          №{String(card.num).padStart(3, "0")} / {STATS.entries}
        </span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)_280px]">
        {/* 左: ホロカード */}
        <div className="mx-auto w-full max-w-[360px] lg:mx-0 lg:max-w-none">
          <HoloCard card={card} />
          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.15em] text-da-muted">↑ {tx(UI.cardDrag)}</p>

          {card.power.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {card.power.map((p) => (
                <span key={p} className="font-mincho rounded-full border border-da-accent/60 px-3 py-1 text-xs text-da-accent-text">
                  {tx(POWER_LABELS[p])}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t da-hairline pt-4">
            {[
              { label: UI.named, value: String(card.year) },
              { label: UI.lifespan, value: lifespanLabel(card) },
              { label: UI.origin, value: tx(REGION_LABELS[card.region]), upright: lang === "ja" },
              { label: UI.classification, value: card.code, small: true },
            ].map((row) => (
              <div key={row.label.ja}>
                <dt className="font-mono text-[10px] tracking-[0.25em] text-da-muted">{tx(row.label)}</dt>
                <dd
                  className={`mt-1 ${
                    row.small
                      ? "font-mincho text-[13px] leading-snug"
                      : row.upright
                        ? "font-mincho text-xl font-semibold"
                        : "font-display text-2xl italic"
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => void save()}
            className="font-mincho mt-6 w-full rounded-full bg-da-ink py-3 text-[15px] text-da-paper transition-opacity hover:opacity-85"
          >
            {tx(UI.saveCard)} <span className="ml-1 font-mono text-xs opacity-70">⌘S</span>
          </button>
        </div>

        {/* 中央: 本文 */}
        <article>
          <p className="font-mono text-[11px] tracking-[0.25em] text-da-accent-text">
            {tx(STATUS_META[card.cat].label)} · {yearLabel(card)}
          </p>
          <h1 className="font-mincho mt-3 text-4xl font-bold leading-tight sm:text-5xl">{t.name}</h1>
          <p className="font-display mt-3 text-xl italic text-da-muted">{t.enName}</p>
          {lang === "en" && !card.en.meaning && (
            <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-da-accent-text">{tx(UI.notTranslated)}</p>
          )}

          <div className="mt-4">
            {sections.map(
              (sec) =>
                sec.text && (
                  <section key={sec.label.ja} className="border-t da-hairline py-6 first:border-t-2 first:border-da-ink">
                    <h2 className="font-mono text-[11px] tracking-[0.25em] text-da-accent-text">
                      <span className="mr-2">−</span>
                      {tx(sec.label)}
                    </h2>
                    <p className="mt-3 text-[15px] leading-[1.9]">{sec.text}</p>
                  </section>
                ),
            )}
          </div>
        </article>

        {/* 右: 系譜・近接 */}
        <aside className="space-y-8">
          {chains.length > 0 && (
            <div className="space-y-6">
              <h2 className="sr-only">{tx(UI.lineageSection)}</h2>
              {chains.map((chain) => (
                <ChainBlock key={chain.key} chain={chain} currentId={card.id} />
              ))}
            </div>
          )}

          <div>
            <h2 className="border-t-[1.5px] border-da-ink pt-3 font-mono text-[10px] tracking-[0.25em] text-da-accent-text">
              <span className="mr-1.5">−</span>
              {tx(UI.adjacent)}
            </h2>
            <div className="mt-2">
              <AdjacentRow card={prev} dir="prev" />
              <AdjacentRow card={next} dir="next" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
