"use client";

import Link from "next/link";
import type { Card } from "@/data/cards";
import { CHAINS, RELATION_LABELS, type Chain } from "@/data/lineage";
import { useLang } from "@/lib/i18n";
import { CARD_BY_ID, DISPLAY_STATUS_META, cardText, displayStatus, yearLabel, type DisplayStatus } from "@/lib/meta";

/** ピンク＋インクの2色だけでステータスを描き分けるドット（正式／議論中／廃止） */
export function StatusDot({ s }: { s: DisplayStatus }) {
  const cls: Record<DisplayStatus, string> = {
    OFFICIAL: "bg-da-accent border-da-accent",
    DISPUTED: "bg-transparent border-da-accent",
    RETIRED: "bg-transparent border-da-ink",
  };
  return <span aria-hidden="true" className={`inline-block h-[9px] w-[9px] shrink-0 rounded-full border-[1.5px] ${cls[s]}`} />;
}

function NodeRow({ card, rel, currentId, fromParam }: { card: Card; rel?: string; currentId?: string; fromParam?: string }) {
  const { lang, tx } = useLang();
  const t = cardText(card, lang);
  const isCurrent = card.id === currentId;
  return (
    <div className="flex items-center gap-2.5 py-2" data-card-id={card.id}>
      <StatusDot s={displayStatus(card)} />
      <Link
        href={`/entry/${card.id}${fromParam ? `?from=${fromParam}` : ""}`}
        aria-current={isCurrent ? "page" : undefined}
        className={`font-mincho truncate text-[15px] leading-snug transition-colors hover:text-da-accent ${
          isCurrent ? "font-semibold text-da-accent-text" : ""
        }`}
      >
        {t.name}
      </Link>
      {rel && <span className="shrink-0 rounded-sm bg-da-ink/8 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] text-da-muted">{rel}</span>}
      <span className="ml-auto shrink-0 font-mono text-[10px] text-da-muted">
        {tx(DISPLAY_STATUS_META[displayStatus(card)].label)}
        <span className="ml-2 text-da-ink">{yearLabel(card)}</span>
      </span>
    </div>
  );
}

export function ChainBlock({ chain, currentId, fromParam }: { chain: Chain; currentId?: string; fromParam?: string }) {
  const { tx } = useLang();
  const [head, ...rest] = chain.nodes;
  const branchCls = chain.kind === "fan" ? "border-dashed" : "";
  const headCard = CARD_BY_ID.get(head.id);
  if (!headCard) return null;

  return (
    <section className="border-t-[1.5px] border-da-ink pt-3">
      <h3 className="font-mono text-[10px] tracking-[0.25em] text-da-accent-text">
        <span className="mr-1.5">−</span>
        {tx(chain.title)}
      </h3>
      <div className="mt-1.5">
        <NodeRow card={headCard} currentId={currentId} fromParam={fromParam} />
        <div className={`ml-1 border-l-[1.5px] border-da-line pl-4 ${branchCls}`}>
          {rest.map((node) => {
            const card = CARD_BY_ID.get(node.id);
            if (!card) return null;
            return (
              <NodeRow
                key={node.id}
                card={card}
                rel={node.rel ? tx(RELATION_LABELS[node.rel]) : undefined}
                currentId={currentId}
                fromParam={fromParam}
              />
            );
          })}
          {chain.terminus && (
            <p className="py-2 font-mono text-[10px] tracking-[0.1em] text-da-accent-text">✕ {tx(chain.terminus.label)}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LineageView() {
  return (
    <div className="da-fade grid gap-x-10 gap-y-8 md:grid-cols-2">
      {CHAINS.map((chain) => (
        <ChainBlock key={chain.key} chain={chain} fromParam="lineage" />
      ))}
    </div>
  );
}
