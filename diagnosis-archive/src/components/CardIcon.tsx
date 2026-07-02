import type { Card } from "@/data/cards";

// 2色（インク＋ピンクのハーフトーン）・文字なし・人物写実なしのグリフ。
// canvas書き出しでも同じパスを使えるよう、データとして定義する。
export interface Glyph {
  paths: { d: string; filled?: boolean }[];
}

const cloudRain: Glyph = {
  paths: [
    { d: "M7 14.5a3.8 3.8 0 1 1 .4-7.58A5 5 0 0 1 17 8.2a3.3 3.3 0 0 1-.6 6.3H7Z" },
    { d: "M8.5 17l-1 3.2" },
    { d: "M12.2 17l-1 3.2" },
    { d: "M15.9 17l-1 3.2" },
  ],
};

const brokenChain: Glyph = {
  paths: [
    { d: "M10 12.8 6.2 9a3.1 3.1 0 0 1 4.4-4.4l1.9 1.9" },
    { d: "M14 11.2l3.8 3.8a3.1 3.1 0 0 1-4.4 4.4l-1.9-1.9" },
    { d: "M13.6 7.6l1.4-2.2" },
    { d: "M16.4 10.4l2.2-1.4" },
    { d: "M10.4 16.4l-2.2 1.4" },
    { d: "M7.6 13.6l-1.4 2.2" },
  ],
};

const gamepad: Glyph = {
  paths: [
    { d: "M7.2 8.5h9.6a4.3 4.3 0 0 1 4.3 4.3c0 2.3-1.6 4.2-3.6 4.2-1.2 0-2.2-.7-2.8-1.7h-5.4c-.6 1-1.6 1.7-2.8 1.7-2 0-3.6-1.9-3.6-4.2a4.3 4.3 0 0 1 4.3-4.3Z" },
    { d: "M7.6 11v3.4" },
    { d: "M5.9 12.7h3.4" },
    { d: "M15.4 11.6a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z", filled: true },
    { d: "M17.9 13.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z", filled: true },
  ],
};

const housePerson: Glyph = {
  paths: [
    { d: "M4.5 11.5 12 5.5l7.5 6v8h-15v-8Z" },
    { d: "M12 11.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z", filled: true },
    { d: "M9.2 19.5c0-2.2 1.3-3.3 2.8-3.3s2.8 1.1 2.8 3.3" },
  ],
};

const eyeHeart: Glyph = {
  paths: [
    { d: "M2.8 12s3.4-5.4 9.2-5.4 9.2 5.4 9.2 5.4-3.4 5.4-9.2 5.4S2.8 12 2.8 12Z" },
    { d: "M12 14.9l-2.3-2.3a1.5 1.5 0 0 1 2.1-2.1l.2.2.2-.2a1.5 1.5 0 0 1 2.1 2.1L12 14.9Z", filled: true },
  ],
};

const towerCrack: Glyph = {
  paths: [
    { d: "M12 3.5c.5 4 2.3 10 5.5 15.5" },
    { d: "M12 3.5c-.5 4-2.3 10-5.5 15.5" },
    { d: "M8.6 13.5h6.8" },
    { d: "M5 19h14" },
    { d: "M12.8 6.8 11.5 9h2.2l-1.5 2.6" },
  ],
};

const eye: Glyph = {
  paths: [
    { d: "M2.8 12s3.4-5.4 9.2-5.4 9.2 5.4 9.2 5.4-3.4 5.4-9.2 5.4S2.8 12 2.8 12Z" },
    { d: "M12 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z", filled: true },
  ],
};

const twoCircles: Glyph = {
  paths: [
    { d: "M9.3 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" },
    { d: "M14.7 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" },
  ],
};

const waves: Glyph = {
  paths: [
    { d: "M3.5 14.5c1.5-4 3-4 4.5 0s3 4 4.5 0 3-4 4.5 0 2 2.8 3.5 1" },
    { d: "M3.5 9.5c1.5-3 3-3 4.5 0" },
  ],
};

const pulse: Glyph = {
  paths: [{ d: "M3 12.5h4.2l2-4.5 3.4 8.5 2.1-4h6.3" }],
};

const bowl: Glyph = {
  paths: [
    { d: "M4 12.5h16a8 8 0 0 1-16 0Z" },
    { d: "M10 9.5c0-1.2 1-1.4 1-2.6" },
    { d: "M14 9.5c0-1.2 1-1.4 1-2.6" },
  ],
};

const cycle: Glyph = {
  paths: [
    { d: "M19.8 12a7.8 7.8 0 1 1-2.2-5.4" },
    { d: "M19.8 4.8v4h-4" },
  ],
};

const mask: Glyph = {
  paths: [
    { d: "M5.5 5.5h13v6.5a6.5 6.5 0 0 1-13 0V5.5Z" },
    { d: "M9 9.4a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z", filled: true },
    { d: "M15 9.4a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z", filled: true },
    { d: "M9.3 13.6c1.6 1.5 3.8 1.5 5.4 0" },
  ],
};

const sprout: Glyph = {
  paths: [
    { d: "M12 20.5v-7.5" },
    { d: "M12 13c0-3.2 2.6-5.2 6.2-5.2 0 3.2-2.6 5.2-6.2 5.2Z" },
    { d: "M12 13c0-3.2-2.6-5.2-6.2-5.2 0 3.2 2.6 5.2 6.2 5.2Z" },
  ],
};

const rings: Glyph = {
  paths: [
    { d: "M9.5 6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z" },
    { d: "M14.5 9.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z" },
  ],
};

const asterisk: Glyph = {
  paths: [
    { d: "M12 4.5v15" },
    { d: "M5.5 8.25l13 7.5" },
    { d: "M18.5 8.25l-13 7.5" },
  ],
};

const CUSTOM: Record<string, Glyph> = {
  "DA-001": cloudRain,
  "DA-041": brokenChain,
  "DA-042": brokenChain,
  "DA-087": gamepad,
  "DA-096": housePerson,
  "DA-133": eyeHeart,
  "DA-135": towerCrack,
};

const BY_GENRE: Record<string, Glyph> = {
  mood: cloudRain,
  delusion: eye,
  dissoc: twoCircles,
  anxiety: waves,
  somatic: pulse,
  eating: bowl,
  addiction: cycle,
  personality: mask,
  developmental: sprout,
  sexual: rings,
};

export function pickGlyph(card: Card): Glyph {
  return CUSTOM[card.id] ?? (card.genre ? BY_GENRE[card.genre] : asterisk) ?? asterisk;
}

export function GlyphSvg({ glyph, className }: { glyph: Glyph; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {glyph.paths.map((p, i) =>
        p.filled ? (
          <path key={i} d={p.d} fill="currentColor" stroke="none" />
        ) : (
          <path key={i} d={p.d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
}

/** ハーフトーン円＋グリフ。size はコンテナに対する相対で親が制御する */
export default function CardIcon({ card, className = "" }: { card: Card; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <div className="da-halftone absolute inset-0" />
      <GlyphSvg glyph={pickGlyph(card)} className="relative z-[1] h-[46%] w-[46%] text-da-ink" />
    </div>
  );
}
