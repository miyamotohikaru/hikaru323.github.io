"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import CardTile from "@/components/CardTile";
import { useLang } from "@/lib/i18n";
import { DISPLAY_STATUS_META, ERAS, cardText, displayStatus, yearLabel } from "@/lib/meta";

/* ── 横型チャート（デスクトップ・モック準拠） ─────────────────
   1850年以降を等倍、1500〜1849年は圧縮した年代軸の上に
   カードが浮かび、全エントリは軸上の点として打たれる。 */

const PRE_START = 1500;
const BREAK = 1850;
const END = 2030;
const PX_PRE = 0.6; // 圧縮区間 px/年
const PX = 9; // 通常区間 px/年
const PAD = 48;
const CARD_W = 152;
const CARD_H = Math.round((CARD_W / 34) * 47); // 縦横比 34:47
const LANE_Y = [8, CARD_H + 40];
const AXIS_Y = LANE_Y[1] + CARD_H + 46;

function xOf(year: number): number {
  const y = Math.max(year, PRE_START);
  return PAD + (y < BREAK ? (y - PRE_START) * PX_PRE : (BREAK - PRE_START) * PX_PRE + (y - BREAK) * PX);
}

const CHART_W = xOf(END) + PAD;

const BANDS = [
  { from: 1861, to: 1865, label: { ja: "南北戦争期", en: "Civil War era" }, cls: "bg-da-ink/8" },
  { from: 2000, to: 2026, label: { ja: "デジタル時代", en: "Digital age" }, cls: "bg-da-accent/8" },
];

function TimelineChart({ cards }: { cards: Card[] }) {
  const { lang, tx } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, sl: 0, on: false, moved: false });
  // ホバーで一時表示、クリックでピン留め（開いたまま各診断を選べる）
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [pinYear, setPinYear] = useState<number | null>(null);

  useEffect(() => {
    if (pinYear == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinYear(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-pop-root]")) setPinYear(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [pinYear]);

  // 年ごとにグループ化
  const groups = useMemo(() => {
    const m = new Map<number, Card[]>();
    for (const c of [...cards].sort((a, b) => a.year - b.year || a.num - b.num)) {
      (m.get(c.year) ?? m.set(c.year, []).get(c.year))!.push(c);
    }
    return [...m.entries()];
  }, [cards]);

  // カードのレーン詰め（入り切らない年は点のみ）
  const placed = useMemo(() => {
    const last = LANE_Y.map(() => -Infinity);
    const out: { card: Card; x: number; lane: number }[] = [];
    groups.forEach(([year, cs], gi) => {
      const x = xOf(year);
      const order = gi % 2 === 0 ? [0, 1] : [1, 0];
      for (const l of order) {
        if (x - last[l] >= CARD_W + 26) {
          out.push({ card: cs[0], x, lane: l });
          last[l] = x;
          break;
        }
      }
    });
    return out;
  }, [groups]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,[data-pop]")) return;
    drag.current = { x: e.clientX, sl: scrollRef.current?.scrollLeft ?? 0, on: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on || !scrollRef.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    scrollRef.current.scrollLeft = drag.current.sl - dx;
  };
  const endDrag = () => {
    drag.current.on = false;
  };

  const decades: number[] = [];
  for (let y = BREAK; y <= 2025; y += 25) decades.push(y);

  return (
    <div className="da-fade hidden md:block">
      <div
        ref={scrollRef}
        className="cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="relative select-none" style={{ width: CHART_W, height: AXIS_Y + 74 }}>
          {/* 時代の帯 */}
          {BANDS.map((b) => (
            <div
              key={b.from}
              className={`absolute top-0 ${b.cls}`}
              style={{ left: xOf(b.from), width: xOf(b.to) - xOf(b.from), height: AXIS_Y }}
            />
          ))}

          {/* 圧縮区間の区切り */}
          <div className="absolute top-0 border-l da-hairline border-dashed" style={{ left: xOf(BREAK), height: AXIS_Y }} />
          <span
            className="absolute font-mono text-[10px] tracking-[0.2em] text-da-muted"
            style={{ left: PAD, top: AXIS_Y - 26 }}
          >
            {PRE_START}—{BREAK - 1}
          </span>

          {/* カード（つまみ選抜） */}
          {placed.map(({ card, x, lane }) => (
            <div key={card.id}>
              <div
                aria-hidden="true"
                className="absolute w-px bg-da-line"
                style={{ left: x, top: LANE_Y[lane] + CARD_H, height: AXIS_Y - LANE_Y[lane] - CARD_H }}
              />
              <div
                className="absolute"
                data-card-id={card.id}
                style={{ left: Math.min(Math.max(x - CARD_W / 2, 8), CHART_W - CARD_W - 8), top: LANE_Y[lane], width: CARD_W }}
              >
                <CardTile card={card} from="timeline" />
              </div>
            </div>
          ))}

          {/* 年代軸 */}
          <div className="absolute inset-x-0 border-t-[1.5px] border-da-ink" style={{ top: AXIS_Y }} />
          {decades.map((y) => (
            <div key={y} className="absolute" style={{ left: xOf(y), top: AXIS_Y }}>
              <div className="h-2.5 w-px bg-da-ink" />
              <span className="absolute left-0 top-4 -translate-x-1/2 font-mono text-[12px] tracking-[0.15em] text-da-ink">
                {y}
              </span>
            </div>
          ))}

          {/* 全エントリの点＋年ポップオーバー */}
          {groups.map(([year, cs]) => {
            const x = xOf(year);
            // ピン留め中は他の年のホバー表示を抑止（開いたまま選べる状態を優先）
            const open = pinYear != null ? pinYear === year : hoverYear === year;
            return (
              <div
                key={year}
                className="absolute"
                data-pop-root
                data-year={year}
                style={{ left: x, top: AXIS_Y }}
                onMouseEnter={() => setHoverYear(year)}
                onMouseLeave={() => setHoverYear((p) => (p === year ? null : p))}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={`${year} · ${cs.length}`}
                  onClick={() => setPinYear((p) => (p === year ? null : year))}
                  onFocus={() => setHoverYear(year)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5"
                >
                  <span
                    className={`block h-[9px] w-[9px] rounded-full border-[1.5px] border-da-ink transition-transform ${
                      open ? "scale-150 bg-da-ink" : "bg-da-accent"
                    } ${pinYear === year ? "ring-2 ring-da-accent/40" : ""}`}
                  />
                </button>
                {cs.length > 1 && (
                  <span className="absolute -translate-x-1/2 translate-y-2 font-mono text-[9px] text-da-muted">×{cs.length}</span>
                )}

                {open && (
                  <div
                    data-pop
                    className="absolute bottom-4 z-30 w-60 border-[1.5px] border-da-ink bg-da-paper shadow-[4px_4px_0_var(--da-accent)]"
                    style={{ left: Math.max(-x + 8, Math.min(-120, CHART_W - x - 248)) }}
                  >
                    <p className="border-b da-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-da-accent-text">
                      {year} · {cs.length}
                    </p>
                    <div className="max-h-56 overflow-y-auto">
                      {cs.map((c) => {
                        const ct = cardText(c, lang);
                        return (
                          <Link
                            key={c.id}
                            href={`/entry/${c.id}?from=timeline`}
                            className="flex items-center gap-2 border-b da-hairline px-3 py-2 last:border-b-0 hover:bg-da-ink/5"
                          >
                            <CardIcon card={c} className="h-8 w-8 shrink-0" />
                            <span className="min-w-0">
                              <span className="font-mincho block truncate text-[13px] font-medium">{ct.name}</span>
                              <span className="block font-mono text-[9px] text-da-muted">
                                №{c.num} · {tx(DISPLAY_STATUS_META[displayStatus(c)].label)}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 凡例・ヒント */}
      <div className="mt-3 flex items-center justify-between border-t da-hairline pt-3">
        <p className="font-mono text-[10px] tracking-[0.15em] text-da-muted">
          {lang === "ja" ? "点をホバーで詳細 ／ ドラッグで移動" : "Hover a dot for details / drag to pan"}
        </p>
        <div className="flex items-center gap-4">
          {BANDS.map((b) => (
            <span key={b.from} className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-da-muted">
              <span className={`inline-block h-3 w-3 ${b.cls}`} />
              {tx(b.label)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 縦型リスト（モバイル） ───────────────────────── */

function TimelineList({ cards }: { cards: Card[] }) {
  const { lang, tx } = useLang();
  const sorted = [...cards].sort((a, b) => a.year - b.year || a.num - b.num);

  const sections = ERAS.map((era) => ({
    era,
    items: sorted.filter((c) => c.year >= era.from && c.year <= era.to),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="da-fade md:hidden">
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
                    data-card-id={card.id}
                    className="group flex items-center gap-3 border-b da-hairline py-2.5 pl-5 pr-2 transition-colors hover:bg-da-ink/5"
                  >
                    <CardIcon card={card} className="h-11 w-11 shrink-0" />
                    <span className="min-w-0">
                      <span className="font-mincho block truncate text-[15px] font-medium leading-snug group-hover:text-da-accent">
                        {t.name}
                      </span>
                      <span className="da-clamp-2 block text-[11px] leading-relaxed text-da-muted">{t.meaning}</span>
                    </span>
                    <span className="ml-auto hidden shrink-0 font-mono text-[10px] tracking-[0.12em] text-da-muted sm:block">
                      <span className="mr-1 text-da-accent">−</span>
                      {tx(DISPLAY_STATUS_META[displayStatus(card)].label)}
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

export default function TimelineView({ cards }: { cards: Card[] }) {
  return (
    <>
      <TimelineChart cards={cards} />
      <TimelineList cards={cards} />
    </>
  );
}
