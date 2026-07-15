"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CARDS } from "@/data/cards";
import CardTile from "@/components/CardTile";
import FilterPanel from "@/components/FilterPanel";
import LineageView from "@/components/LineageView";
import TimelineView from "@/components/TimelineView";
import { UI, useLang } from "@/lib/i18n";
import {
  CARD_BY_ID,
  DEFAULT_FILTERS,
  STATS,
  YEAR_MAX,
  YEAR_MIN,
  applyFilters,
  isFiltered,
  sortCards,
  type Filters,
  type SortKey,
} from "@/lib/meta";

type View = "grid" | "timeline" | "lineage";

/* ── ヒーロー ─────────────────────────────────── */

function Hero() {
  const { tx } = useLang();
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-6 pt-10 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-end md:pt-14">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-da-accent-text">{tx(UI.issue)}</p>
        <h1 className="font-display mt-3 text-5xl font-medium italic leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Diagnosis Archive<span className="text-da-accent">.</span>
        </h1>
      </div>
      <dl className="flex gap-8 md:justify-end">
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

  const [sort, setSort] = useState<SortKey>("num");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);
  // 詳細から戻ってきた直後は出現アニメーションを止め、位置へ即座に復帰する
  const [returning] = useState(() => typeof window !== "undefined" && window.sessionStorage.getItem("da-return") != null);

  const filtered = useMemo(() => applyFilters(CARDS, filters), [filters]);
  const sorted = useMemo(() => sortCards(filtered, sort, lang), [filtered, sort, lang]);

  const setView = (v: View) => {
    router.replace(v === "grid" ? "/" : `/?view=${v}`, { scroll: false });
  };

  // 詳細から「← 年表／系譜／索引」で戻ってきたとき、見ていたカードの位置へスクロールして復帰する
  useEffect(() => {
    const raw = window.sessionStorage.getItem("da-return");
    if (!raw) return;
    let target: { view?: string; id?: string };
    try {
      target = JSON.parse(raw);
    } catch {
      window.sessionStorage.removeItem("da-return");
      return;
    }
    if ((target.view ?? "grid") !== view || !target.id) return;
    window.sessionStorage.removeItem("da-return");
    const id = target.id;
    requestAnimationFrame(() => {
      const visible = (sel: string) =>
        [...document.querySelectorAll(sel)].find((el) => el.getClientRects().length > 0);
      let el = visible(`[data-card-id="${id}"]`);
      if (!el && view === "timeline") {
        // 横型チャートではカードが点のみの場合があるので、その年の点へ
        const card = CARD_BY_ID.get(id);
        if (card) el = visible(`[data-year="${card.year}"]`);
      }
      // モーションなしで即座に位置を合わせる
      el?.scrollIntoView({ behavior: "instant", block: "start", inline: "center" });
    });
  }, [view]);

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

            <div className="flex-1" />

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
                  <div key={card.id} data-card-id={card.id}>
                    <CardTile card={card} priorityIndex={returning ? -1 : i} />
                  </div>
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
