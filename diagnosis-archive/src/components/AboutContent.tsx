"use client";

import Link from "next/link";
import { CARDS } from "@/data/cards";
import { StatusDot } from "@/components/LineageView";
import { UI, useLang } from "@/lib/i18n";
import { STATS, STATUS_META, STATUS_ORDER, YEAR_MAX, YEAR_MIN } from "@/lib/meta";

export default function AboutContent() {
  const { tx } = useLang();
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, CARDS.filter((c) => c.cat === s).length]));

  return (
    <div className="da-fade mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.3em] text-da-accent">ABOUT · {tx(UI.issue)}</p>
      <h1 className="font-mincho mt-4 text-4xl font-bold leading-snug sm:text-5xl">{tx(UI.aboutTitle)}</h1>
      <p className="font-mincho mt-6 text-base leading-[2] text-da-ink sm:text-lg">{tx(UI.aboutLead)}</p>

      <section className="mt-12 border-t-2 border-da-ink pt-5">
        <h2 className="font-mono text-[11px] tracking-[0.25em] text-da-accent">
          <span className="mr-2">−</span>
          {tx(UI.aboutStatuses)}
        </h2>
        <dl className="mt-4">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex items-baseline gap-3 border-b da-hairline py-3.5">
              <StatusDot cat={s} />
              <dt className="font-mincho w-24 shrink-0 text-[15px] font-semibold">{tx(STATUS_META[s].label)}</dt>
              <dd className="text-[13px] leading-relaxed text-da-muted">{tx(STATUS_META[s].desc)}</dd>
              <dd className="font-display ml-auto shrink-0 text-lg italic">{counts[s]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t-2 border-da-ink pt-5">
        <h2 className="font-mono text-[11px] tracking-[0.25em] text-da-accent">
          <span className="mr-2">−</span>
          {tx(UI.aboutData)}
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { n: STATS.entries, label: UI.statEntries },
            { n: STATS.statuses, label: UI.statStatuses },
            { n: `${YEAR_MIN}—${YEAR_MAX}`, label: UI.statYears },
            { n: STATS.regions, label: UI.statRegions },
          ].map((s) => (
            <div key={s.label.ja}>
              <dd className="font-display text-2xl italic sm:text-3xl">{s.n}</dd>
              <dt className="mt-1 font-mono text-[10px] tracking-[0.2em] text-da-muted">{tx(s.label)}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Link
        href="/"
        className="font-mincho mt-14 inline-block rounded-full bg-da-ink px-8 py-3 text-[15px] text-da-paper transition-opacity hover:opacity-85"
      >
        ← {tx(UI.backToIndex)}
      </Link>
    </div>
  );
}
