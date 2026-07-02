"use client";

import Link from "next/link";
import type { Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import { useLang } from "@/lib/i18n";
import { REGION_LABELS, STATUS_META, cardText, yearLabel } from "@/lib/meta";

export default function CardTile({
  card,
  priorityIndex,
}: {
  card: Card;
  /** 出現アニメーションの遅延段数（-1 で無効） */
  priorityIndex?: number;
}) {
  const { lang, tx } = useLang();
  const t = cardText(card, lang);
  const delay = priorityIndex != null && priorityIndex >= 0 ? Math.min(priorityIndex, 14) * 40 : null;

  return (
    <Link
      href={`/entry/${card.id}`}
      className={`group block outline-none ${delay != null ? "da-rise" : ""}`}
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
    >
      <article className="da-card flex h-full flex-col px-4 pb-3 pt-3.5">
        <header className="flex items-baseline justify-between">
          <span className="font-display text-xl italic text-da-accent">
            <span className="text-sm">№</span>
            {card.num}
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-da-ink">{yearLabel(card)}</span>
        </header>

        <CardIcon card={card} className="mx-auto my-2 aspect-square w-[72%] max-w-[150px]" />

        <div className="border-t da-hairline pt-2">
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-da-muted">{t.enName}</p>
          <h3 className="font-mincho mt-0.5 truncate text-lg font-semibold leading-snug">{t.name}</h3>
          <p className="da-clamp-2 mt-1 min-h-[2.6em] text-[11px] leading-relaxed text-da-muted">{t.meaning}</p>
        </div>

        <footer className="mt-auto flex items-center justify-between border-t da-hairline pt-1.5">
          <span className="font-mono text-[10px] tracking-[0.12em]">
            <span className="mr-1 text-da-accent">−</span>
            {tx(STATUS_META[card.cat].label)}
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-da-accent">{tx(REGION_LABELS[card.region])}</span>
        </footer>
      </article>
    </Link>
  );
}
