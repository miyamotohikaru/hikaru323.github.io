"use client";

import { useEffect, useRef } from "react";
import type { Power, Region } from "@/data/cards";
import { UI, useLang } from "@/lib/i18n";
import {
  DEFAULT_FILTERS,
  POWER_LABELS,
  REGION_LABELS,
  DISPLAY_STATUS_META,
  DISPLAY_STATUS_ORDER,
  SORT_LABELS,
  YEAR_MAX,
  YEAR_MIN,
  type DisplayStatus,
  type Filters,
  type SortKey,
} from "@/lib/meta";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 font-mincho text-[13px] transition-colors ${
        active
          ? "border-da-accent bg-da-accent/12 text-da-accent-text"
          : "border-da-line text-da-ink hover:border-da-ink"
      }`}
    >
      {label}
    </button>
  );
}

function AxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 font-mono text-[10px] tracking-[0.25em] text-da-muted">
      <span className="mr-1.5 text-da-accent">−</span>
      {children}
    </h4>
  );
}

function YearRange({
  from,
  to,
  onChange,
}: {
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
}) {
  const pct = (v: number) => ((v - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  // 両ツマミが右端で重なると下のツマミが掴めなくなるため、後半では from を上に重ねる
  const fromOnTop = from > (YEAR_MIN + YEAR_MAX) / 2;
  return (
    <div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-da-line" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-da-accent"
          style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }}
        />
        <input
          type="range"
          className="da-range"
          style={{ zIndex: fromOnTop ? 5 : 3 }}
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={from}
          aria-label="from year"
          onChange={(e) => onChange(Math.min(Number(e.target.value), to), to)}
        />
        <input
          type="range"
          className="da-range"
          style={{ zIndex: 4 }}
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={to}
          aria-label="to year"
          onChange={(e) => onChange(from, Math.max(Number(e.target.value), from))}
        />
      </div>
      <div className="flex justify-between font-display text-sm italic">
        <span>{from}</span>
        <span className="text-da-muted">—</span>
        <span>{to}</span>
      </div>
    </div>
  );
}

export default function FilterPanel({
  open,
  onClose,
  filters,
  setFilters,
  sort,
  setSort,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  resultCount: number;
}) {
  const { tx } = useLang();
  const sheetRef = useRef<HTMLElement>(null);

  // Escで閉じる／モバイルシート時はスクロールロック＋フォーカス移動＋復帰
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const isSheet = window.matchMedia("(max-width: 639px)").matches;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    let prevOverflow = "";
    if (isSheet) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      sheetRef.current?.focus();
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      if (isSheet) {
        document.body.style.overflow = prevOverflow;
        opener?.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const togglePower = (p: Power) =>
    setFilters({
      ...filters,
      powers: filters.powers.includes(p) ? filters.powers.filter((x) => x !== p) : [...filters.powers, p],
    });
  const toggleRegion = (r: Region) =>
    setFilters({
      ...filters,
      regions: filters.regions.includes(r) ? filters.regions.filter((x) => x !== r) : [...filters.regions, r],
    });
  const setStatus = (s: DisplayStatus | null) => setFilters({ ...filters, status: s });
  const reset = () => setFilters(DEFAULT_FILTERS);

  return (
    <>
      <button
        type="button"
        aria-label={tx(UI.close)}
        className="fixed inset-0 z-40 cursor-default bg-da-ink/25 sm:hidden"
        onClick={onClose}
      />
      <section
        ref={sheetRef}
        aria-label={tx(UI.filter)}
        tabIndex={-1}
        className="da-fade fixed inset-x-0 bottom-0 z-50 max-h-[78vh] overflow-y-auto rounded-t-2xl border-t-2 border-da-ink bg-da-bg px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 outline-none sm:static sm:z-auto sm:mt-4 sm:max-h-none sm:rounded-none sm:border da-hairline sm:border-x sm:border-b sm:border-t sm:p-5"
      >
        <div className="mb-4 flex items-baseline justify-between sm:hidden">
          <h3 className="font-mincho text-xl font-semibold">{tx(UI.filter)}</h3>
          <span className="font-mono text-[10px] tracking-[0.2em] text-da-muted">{tx(UI.axes)}</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <AxisLabel>{tx(UI.sortBy)}</AxisLabel>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <Chip key={k} label={tx(SORT_LABELS[k])} active={sort === k} onClick={() => setSort(k)} />
              ))}
            </div>
          </div>

          <div>
            <AxisLabel>{tx(UI.status)}</AxisLabel>
            <div className="flex flex-wrap gap-1.5">
              <Chip label={tx(UI.all)} active={filters.status === null} onClick={() => setStatus(null)} />
              {DISPLAY_STATUS_ORDER.map((s) => (
                <Chip
                  key={s}
                  label={tx(DISPLAY_STATUS_META[s].label)}
                  active={filters.status === s}
                  onClick={() => setStatus(filters.status === s ? null : s)}
                />
              ))}
            </div>
          </div>

          <div>
            <AxisLabel>{tx(UI.power)}</AxisLabel>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(POWER_LABELS) as Power[]).map((p) => (
                <Chip key={p} label={tx(POWER_LABELS[p])} active={filters.powers.includes(p)} onClick={() => togglePower(p)} />
              ))}
            </div>
          </div>

          <div>
            <AxisLabel>
              {tx(UI.yearRange)}（{tx(UI.namedYear)}）
            </AxisLabel>
            <YearRange
              from={filters.yearFrom}
              to={filters.yearTo}
              onChange={(yearFrom, yearTo) => setFilters({ ...filters, yearFrom, yearTo })}
            />
          </div>

          <div>
            <AxisLabel>{tx(UI.region)}</AxisLabel>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                <Chip key={r} label={tx(REGION_LABELS[r])} active={filters.regions.includes(r)} onClick={() => toggleRegion(r)} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 sm:mt-5 sm:justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border da-hairline px-5 py-2.5 font-mincho text-sm transition-colors hover:border-da-ink sm:py-1.5"
          >
            {tx(UI.reset)}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-da-ink px-6 py-2.5 font-mincho text-sm text-da-paper transition-opacity hover:opacity-85 sm:py-1.5"
          >
            {tx(UI.showResults)} · {resultCount}
            {tx(UI.results)}
          </button>
        </div>
      </section>
    </>
  );
}
