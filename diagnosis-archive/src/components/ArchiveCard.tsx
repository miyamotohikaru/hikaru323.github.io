"use client";

import type { Card } from "@/data/cards";
import CardIcon from "@/components/CardIcon";
import { useLang } from "@/lib/i18n";
import { DISPLAY_STATUS_META, REGION_LABELS, cardText, yearLabel } from "@/lib/meta";

/**
 * アーカイブカードの共通ビジュアル。
 * コンテナクエリ(cqw)で全寸法を幅に比例させ、一覧・詳細・どの画面幅でも
 * 同じ縦横比(34:47)・同じプロポーションを保つ。
 * depth=true でカード内要素を奥行き方向にレイヤー分けし、傾けたとき立体に見える。
 */
export default function ArchiveCard({ card, depth = false }: { card: Card; depth?: boolean }) {
  const { lang, tx } = useLang();
  const t = cardText(card, lang);
  const p3d = depth ? "[transform-style:preserve-3d]" : "";

  return (
    <div className={`w-full [container-type:inline-size] ${p3d}`}>
      <article className={`da-card flex aspect-[34/47] w-full flex-col overflow-hidden px-[5cqw] pb-[3.5cqw] pt-[4cqw] ${p3d}`}>
        <header className={`flex items-baseline justify-between ${depth ? "[transform:translateZ(26px)]" : ""}`}>
          <span className="font-display italic leading-none text-da-accent text-[max(7cqw,15px)]">
            <span className="text-[0.62em]">№</span>
            {card.num}
          </span>
          <span className="font-mono tracking-[0.15em] text-da-ink text-[max(3.1cqw,8px)]">{yearLabel(card)}</span>
        </header>

        <div className={`grid min-h-0 flex-1 place-items-center py-[1.5cqw] ${depth ? "[transform:translateZ(40px)]" : ""}`}>
          <CardIcon card={card} className="aspect-square h-full max-h-[54cqw] max-w-[70%]" />
        </div>

        <div className={`border-t da-hairline pt-[2.5cqw] ${depth ? "[transform:translateZ(18px)]" : ""}`}>
          <p title={t.enName} className="truncate font-mono uppercase tracking-[0.15em] text-da-muted text-[max(2.8cqw,7px)]">
            {t.enName}
          </p>
          <h3
            title={t.name}
            className="font-mincho da-clamp-2 mt-[1cqw] min-h-[2.6em] font-bold leading-[1.3] text-[max(7.6cqw,15px)]"
          >
            {t.name}
          </h3>
          <p className="da-clamp-2 mt-[1cqw] min-h-[3.2em] leading-[1.6] text-da-muted text-[max(3.2cqw,8px)]">{t.meaning}</p>
        </div>

        <footer
          className={`mt-[2cqw] flex items-center justify-between border-t da-hairline pt-[2cqw] ${depth ? "[transform:translateZ(10px)]" : ""}`}
        >
          {/* ステータスは「廃止」のみカードに表示する（ユーザー指定） */}
          {card.cat === "RETIRED" ? (
            <span className="font-mono tracking-[0.12em] text-[max(3cqw,8px)]">
              <span className="mr-[1cqw] text-da-accent">−</span>
              {tx(DISPLAY_STATUS_META.RETIRED.label)}
            </span>
          ) : (
            <span aria-hidden="true" className="font-mono text-[max(3cqw,8px)]">
              &nbsp;
            </span>
          )}
          <span className="font-mono tracking-[0.12em] text-da-accent-text text-[max(3cqw,8px)]">
            {tx(REGION_LABELS[card.region])}
          </span>
        </footer>
      </article>
    </div>
  );
}
