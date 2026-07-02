"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CARDS, type Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import HoloCard from "@/components/HoloCard";
import { ChainBlock } from "@/components/LineageView";
import { chainsFor } from "@/data/lineage";
import { UI, useLang } from "@/lib/i18n";
import { DISPLAY_STATUS_META, POWER_LABELS, REGION_LABELS, STATS, cardText, displayStatus, lifespanLabel, yearLabel } from "@/lib/meta";

const ORDERED = [...CARDS].sort((a, b) => a.num - b.num);

type From = "timeline" | "lineage" | null;

// 本文中の DSM-III / DSM-5-TR / ICD-11 などを用語リンク化する
const TERM_RE = /(DSM(?:-(?:[IV]+(?:-R)?|5(?:-TR)?))?|ICD(?:-\d+)?)/g;

function TermText({ text, lang }: { text: string; lang: "ja" | "en" }) {
  const parts = text.split(TERM_RE);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const isDsm = p.startsWith("DSM");
        const title = isDsm
          ? lang === "ja"
            ? "DSM＝米国精神医学会の診断マニュアル（クリックで解説へ）"
            : "DSM — the American Psychiatric Association's diagnostic manual (click for more)"
          : lang === "ja"
            ? "ICD＝WHOの国際疾病分類（クリックで解説へ）"
            : "ICD — the WHO's International Classification of Diseases (click for more)";
        return (
          <Link
            key={i}
            href={isDsm ? "/about#dsm-guide" : "/about#icd-guide"}
            title={title}
            className="underline decoration-da-accent/50 decoration-dotted underline-offset-[3px] transition-colors hover:text-da-accent-text"
          >
            {p}
          </Link>
        );
      })}
    </>
  );
}

function AdjacentRow({ card, dir, q }: { card: Card; dir: "prev" | "next"; q: string }) {
  const { lang, tx } = useLang();
  const t = cardText(card, lang);
  return (
    <Link
      href={`/entry/${card.id}${q}`}
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

  // どのビューから来たか（?from=timeline / lineage）。戻る導線と後続リンクに引き継ぐ
  const [from, setFrom] = useState<From>(null);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("from");
    setFrom(v === "timeline" || v === "lineage" ? v : null);
  }, [card.id]);
  const q = from ? `?from=${from}` : "";
  const backHref = from ? `/?view=${from}` : "/";
  const backLabel = from === "timeline" ? tx(UI.backToTimeline) : from === "lineage" ? tx(UI.backToLineage) : tx(UI.backToIndex);

  const { prev, next } = useMemo(() => {
    const i = ORDERED.findIndex((c) => c.id === card.id);
    return {
      prev: ORDERED[(i - 1 + ORDERED.length) % ORDERED.length],
      next: ORDERED[(i + 1) % ORDERED.length],
    };
  }, [card.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      // 修飾キー付き（Alt+←の戻る等）や、検索などのモーダル表示中は奪わない
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowLeft") {
        router.push(`/entry/${prev.id}${q}`);
      } else if (e.key === "ArrowRight") {
        router.push(`/entry/${next.id}${q}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.id, next.id, router, q]);

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
        <Link
          href={backHref}
          onClick={() => {
            // 戻り先ビューで、このカードの位置へスクロール復帰するためのマーカー
            window.sessionStorage.setItem("da-return", JSON.stringify({ view: from ?? "grid", id: card.id }));
          }}
          className="text-da-ink transition-colors hover:text-da-accent"
        >
          ← {backLabel}
        </Link>
        <span className="text-da-muted">/</span>
        <span className="text-da-muted">{tx(DISPLAY_STATUS_META[displayStatus(card)].label)}</span>
        <span className="text-da-muted">/</span>
        <span className="text-da-accent-text">{card.id}</span>
        <span className="ml-auto text-da-muted">
          №{String(card.num).padStart(3, "0")} / {STATS.entries}
        </span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)_280px]">
        {/* 左: ホロカード */}
        <div className="mx-auto w-full max-w-[300px] lg:mx-0 lg:max-w-none">
          <HoloCard card={card} />

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
              { label: UI.lifespan, value: lifespanLabel(card, lang), upright: lang === "ja" && card.endYear != null },
              { label: UI.origin, value: tx(REGION_LABELS[card.region]), upright: lang === "ja" },
            ].map((row) => (
              <div key={row.label.ja}>
                <dt className="font-mono text-[10px] tracking-[0.25em] text-da-muted">{tx(row.label)}</dt>
                <dd className={`mt-1 ${row.upright ? "font-mincho text-xl font-semibold" : "font-display text-2xl italic"}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

        </div>

        {/* 中央: 本文 */}
        <article>
          <p className="font-mono text-[11px] tracking-[0.25em] text-da-accent-text">
            {tx(DISPLAY_STATUS_META[displayStatus(card)].label)} · {yearLabel(card)}
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
                    <p className="mt-3 text-[15px] leading-[1.9]">
                      <TermText text={sec.text} lang={lang} />
                    </p>
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
                <ChainBlock key={chain.key} chain={chain} currentId={card.id} fromParam={from ?? undefined} />
              ))}
            </div>
          )}

          <div>
            <h2 className="border-t-[1.5px] border-da-ink pt-3 font-mono text-[10px] tracking-[0.25em] text-da-accent-text">
              <span className="mr-1.5">−</span>
              {tx(UI.adjacent)}
            </h2>
            <div className="mt-2">
              <AdjacentRow card={prev} dir="prev" q={q} />
              <AdjacentRow card={next} dir="next" q={q} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
