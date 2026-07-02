import type { Card } from "@/data/cards";
import { GLYPHS, type Glyph } from "@/components/glyphs";
import { CARD_MOTIF, GENRE_MOTIF } from "@/components/iconMap";

export function pickGlyph(card: Card): Glyph {
  const key = CARD_MOTIF[card.id] ?? (card.genre ? GENRE_MOTIF[card.genre] : undefined);
  return (key ? GLYPHS[key] : undefined) ?? GLYPHS["burst"];
}

/** ハーフトーン円＋2色グリフ。サイズは親がコンテナで制御する */
export default function CardIcon({ card, className = "" }: { card: Card; className?: string }) {
  const glyph = pickGlyph(card);
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <div className="da-halftone absolute inset-0" />
      <svg viewBox="0 0 48 48" className="relative z-[1] h-[72%] w-[72%]" aria-hidden="true">
        {glyph.parts.map((p, i) => (
          <path key={i} d={p.d} fill={p.c === "ink" ? "var(--da-ink)" : "var(--da-accent)"} fillRule="evenodd" />
        ))}
      </svg>
    </div>
  );
}
