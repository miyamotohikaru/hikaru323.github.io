"use client";

import Link from "next/link";
import type { Card } from "@/data/cards";
import ArchiveCard from "@/components/ArchiveCard";

export default function CardTile({
  card,
  priorityIndex,
  from,
}: {
  card: Card;
  /** 出現アニメーションの遅延段数（-1 で無効） */
  priorityIndex?: number;
  /** 詳細ページの戻り先ビュー */
  from?: string;
}) {
  const delay = priorityIndex != null && priorityIndex >= 0 ? Math.min(priorityIndex, 14) * 40 : null;

  return (
    <Link
      href={`/entry/${card.id}${from ? `?from=${from}` : ""}`}
      className={`group block ${delay != null ? "da-rise" : ""}`}
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
    >
      <ArchiveCard card={card} />
    </Link>
  );
}
