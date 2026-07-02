"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CARDS, type Status } from "@/data/cards";
import CardTile from "@/components/CardTile";
import FilterPanel from "@/components/FilterPanel";
import LineageView from "@/components/LineageView";
import TimelineView from "@/components/TimelineView";
import { UI, useLang } from "@/lib/i18n";
import {
  DEFAULT_FILTERS,
  STATS,
  STATUS_META,
  STATUS_ORDER,
  YEAR_MAX,
  YEAR_MIN,
  applyFilters,
  cardText,
  isFiltered,
  sortCards,
  yearLabel,
  type Filters,
  type SortKey,
} from "@/lib/meta";

type View = "grid" | "timeline" | "lineage";

/* ── ヒーロー ─────────────────────────────────── */

function FeaturedEntry() {
  const { lang, tx } = useLang();
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    // 週替わり（年×53＋週番号で決定的に選ぶ）
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
    setIdx((now.getFullYear() * 53 + week) % CARDS.length);
  }, []);

  const card = idx == null ? null : CARDS[idx];
  if (!card) return <div className="hidden h-56 md:block" aria-hidden="true" />;
  const t = cardText(card, lang);

  return (
    <div className="da-fade flex items-center gap-5">
      <div className="w-36 shrink-0 sm:w-40">
        <CardTile card={card} />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.25em] text-da-accent-text">{tx(UI.weeklyEntry)}</p>
        <h3 className="font-mincho mt-1.5 text-2xl font-semibold leading-tight">{t.name}</h3>
        <p className="mt-1 truncate font-mono text-[10px] tracking-[0.15em] text-da-muted">
          {yearLabel(card)} · {card.code}
        </p>
        <Link
          href={`/entry/${card.id}`}
          className="font-mincho mt-3 inline-block text-[15px] italic text-da-accent-text underline-offset-4 hover:underline"
        >
          {tx(UI.readMore)}
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  const { tx } = useLang();
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-6 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:pt-14">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-da-accent-text">{tx(UI.issue)}</p>
        <h1 className="font-display mt-3 text-5xl font-medium italic leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Diagnosis<span className="text-da-accent">.</span> Archive
        </h1>
        <p className="font-mincho mt-4 text-base text-da-muted sm:text-lg">{tx(UI.tagline)}</p>
      </div>
      <div className="space-y-6">
        <dl className="flex gap-8">
          {[
            { n: STATS.entries, label: UI.statEntries },
            { n: STATS.statuses, label: UI.statStatuses },
            { n: STATS.years, label: UI.statYears },
            { n: STATS.regions, label: UI.statRegions },
          ].map((s) => (
            <div key={s.label.ja}>
              <dt className="sr-only">{tx(s.label)}</dt>
              <dd className="font-display text-3xl italic">{s.n}</dd>
              <dd className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-da-muted">{tx(s.label)}</dd>
            </div>
          ))}
        </dl>
        <FeaturedEntry />
      </div>
    </section>
  );
}

/* ── ツールバー ───────────────────────────────── */

const VIEW_ICONS: Record<View, React.ReactNode> = {
  grid: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      {[1, 9].map((x) => [1, 9].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />))}
    </svg>
  ),
  timeline: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4.5" cy="13" r="1.6" fill="currentColor" />
      <circle cx="9" cy="13" r="1.6" fill="currentColor" />
      <path d="M4.5 11V5.5M9 11V3.5M13 13v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  lineage: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="3" r="1.8" fill="currentColor" />
      <circle cx="4" cy="12.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3M8 8 4 11M8 8l4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

/* ── 本体 ──────────────────────────────────── */

function ExplorerInner() {
  const { lang, tx } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramView = searchParams.get("view");
  const view: View = paramView === "timeline" || paramView === "lineage" ? paramView : "grid";

  const [sort, setSort] = useState<SortKey>("year-desc");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(CARDS, filters), [filters]);
  const sorted = useMemo(() => sortCards(filtered, sort, lang), [filtered, sort, lang]);

  const setView = (v: View) => {
    router.replace(v === "grid" ? "/" : `/?view=${v}`, { scroll: false });
  };
  const setStatus = (s: Status | null) => setFilters({ ...filters, status: s });

  const viewTitle: Record<View, { label: string; sub: string }> = {
    grid: { label: tx(UI.viewGrid), sub: "" },
    timeline: { label: tx(UI.viewTimeline), sub: tx(UI.timelineSub) },
    lineage: { label: tx(UI.viewLineage), sub: tx(UI.lineageSub) },
  };

  return (
    <>
      {view === "grid" ? (
        <Hero />
      ) : (
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6">
          <p className="font-mono text-[11px] tracking-[0.3em] text-da-accent-text">
            VIEW · {view === "timeline" ? "TIMELINE" : "LINEAGE"}
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3 border-b-2 border-da-ink pb-4">
            <h2 className="font-mincho text-4xl font-bold sm:text-5xl">{viewTitle[view].label}</h2>
            <p className="font-display text-lg italic text-da-muted">
              {view === "timeline" ? `${YEAR_MIN} — ${YEAR_MAX} · ${STATS.years}` : viewTitle[view].sub}
              {view === "timeline" && <span className="font-mincho not-italic text-sm"> 年</span>}
            </p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {/* ツールバー */}
        <div className="sticky top-14 z-20 -mx-1 border-y da-hairline bg-da-bg/95 px-1 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-da-muted">
              {tx(UI.sort)}
              <button
                type="button"
                onClick={() => setPanelOpen((o) => !o)}
                aria-expanded={panelOpen}
                className={`font-mincho flex items-center gap-1 rounded px-1.5 py-0.5 text-[13px] tracking-normal transition-colors hover:bg-da-ink/8 ${
                  isFiltered(filters) ? "text-da-accent-text" : "text-da-ink"
                }`}
              >
                {tx(UI.filter)}
                <svg viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform ${panelOpen ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {view !== "lineage" && (
              <div className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_14px,black_calc(100%-14px),transparent)]">
                <button
                  type="button"
                  onClick={() => setStatus(null)}
                  aria-pressed={filters.status === null}
                  className={`font-mincho shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                    filters.status === null ? "bg-da-ink text-da-paper" : "hover:text-da-accent"
                  }`}
                >
                  {tx(UI.all)}
                </button>
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(filters.status === s ? null : s)}
                    aria-pressed={filters.status === s}
                    className={`font-mincho shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                      filters.status === s ? "bg-da-ink text-da-paper" : "hover:text-da-accent"
                    }`}
                  >
                    {tx(STATUS_META[s].label)}
                  </button>
                ))}
              </div>
            )}
            {view === "lineage" && <div className="flex-1" />}

            <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.15em] text-da-muted md:inline">
              {view === "lineage" ? "" : `${sorted.length} / ${CARDS.length}`}
            </span>

            <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label={tx(UI.view)}>
              <span className="mr-1 hidden font-mono text-[10px] tracking-[0.2em] text-da-muted lg:inline">{tx(UI.view)}</span>
              {(["grid", "timeline", "lineage"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={viewTitle[v].label}
                  className={`grid h-10 w-10 place-items-center rounded transition-colors sm:h-8 sm:w-8 ${
                    view === v ? "bg-da-accent/15 text-da-accent" : "text-da-muted hover:text-da-ink"
                  }`}
                >
                  {VIEW_ICONS[v]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <FilterPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          resultCount={filtered.length}
        />

        {/* ビュー本体 */}
        <div className="mt-6">
          {view === "grid" &&
            (sorted.length > 0 ? (
              <div
                key={`${sort}|${filters.status}|${filters.powers.join()}|${filters.regions.join()}|${filters.yearFrom}-${filters.yearTo}`}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {sorted.map((card, i) => (
                  <CardTile key={card.id} card={card} priorityIndex={i} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="font-mincho text-da-muted">{tx(UI.noResults)}</p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="font-mincho mt-4 rounded-full border da-hairline px-5 py-1.5 text-sm transition-colors hover:border-da-ink"
                >
                  {tx(UI.reset)}
                </button>
              </div>
            ))}
          {view === "timeline" && <TimelineView cards={filtered} />}
          {view === "lineage" && <LineageView />}
        </div>
      </section>
    </>
  );
}

export default function Explorer() {
  return (
    <Suspense fallback={<Hero />}>
      <ExplorerInner />
    </Suspense>
  );
}
