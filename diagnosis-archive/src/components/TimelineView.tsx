"use client";

import Link from "next/link";
import type { Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import { useLang } from "@/lib/i18n";
import { ERAS, STATUS_META, cardText, yearLabel } from "@/lib/meta";

export default function TimelineView({ cards }: { cards: Card[] }) {
  const { lang, tx } = useLang();
  const sorted = [...cards].sort((a, b) => a.year - b.year || a.num - b.num);

  const sections = ERAS.map((era) => ({
    era,
    items: sorted.filter((c) => c.year >= era.from && c.year <= era.to),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="da-fade">
      {sections.map(({ era, items }) => (
        <section key={era.from} className="relative">
          <header className="sticky top-[calc(6.5rem+2px)] z-10 -mx-1 border-b da-hairline bg-da-bg/95 px-1 py-2.5 backdrop-blur-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-da-accent-text">
                {era.from}—{Math.min(era.to, 2025)}
              </span>
              <h3 className="font-mincho text-base font-semibold">{tx(era.label)}</h3>
              <span className="ml-auto font-mono text-[10px] text-da-muted">{items.length}</span>
            </div>
          </header>

          <ol className="relative ml-[4.5rem] border-l-[1.5px] border-da-line sm:ml-24">
            {items.map((card, i) => {
              const t = cardText(card, lang);
              const showYear = i === 0 || items[i - 1].year !== card.year;
              return (
                <li key={card.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5.5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border-[1.5px] border-da-ink bg-da-accent"
                  />
                  <span className="font-display absolute -left-[4.5rem] top-1/2 w-14 -translate-y-1/2 text-right text-sm italic text-da-ink sm:-left-24 sm:w-20">
                    {showYear ? yearLabel(card) : ""}
                  </span>
                  <Link
                    href={`/entry/${card.id}?from=timeline`}
                    className="group flex items-center gap-3 border-b da-hairline py-2.5 pl-5 pr-2 transition-colors hover:bg-da-ink/5"
                  >
                    <CardIcon card={card} className="h-11 w-11 shrink-0" />
                    <span className="min-w-0">
                      <span className="font-mincho block truncate text-[15px] font-medium leading-snug group-hover:text-da-accent">
                        {t.name}
                      </span>
                      <span className="da-clamp-2 block text-[11px] leading-relaxed text-da-muted sm:da-clamp-2">
                        {t.meaning}
                      </span>
                    </span>
                    <span className="ml-auto hidden shrink-0 font-mono text-[10px] tracking-[0.12em] text-da-muted sm:block">
                      <span className="mr-1 text-da-accent">−</span>
                      {tx(STATUS_META[card.cat].label)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
