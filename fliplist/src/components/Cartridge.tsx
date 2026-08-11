"use client";

import { useCallback } from "react";
import PixelCanvas from "./PixelCanvas";
import { PixelGfx } from "@/art/gfx";
import { drawCartridge } from "@/art/cartridge";
import { CART, CART_BUFFER } from "@/art/spec";
import { LABELS } from "@/art/labels";
import type { Flip } from "@/data/flips";

type Props = {
  flip: Flip;
  scale: number;
  animate?: boolean;
  /** まだ遊べない。カセットに封の札を貼る */
  soon?: boolean;
};

/**
 * まだ遊べないカセットに貼る封の札。
 *
 * 版面の隅にバッジを置くのではなく、**カセットそのものに貼る**。
 * 中古屋の値札や封のシールと同じで、物の上にあるほうが「まだ開けられない」
 * が一目でわかる。地は紙色・字は墨なので、外装の彩度を落とす CSS の
 * フィルタをかけても札だけは読める。
 */
function drawSoonSeal(g: PixelGfx) {
  const text = "COMING SOON";
  const tw = g.text3x5Width(text);
  const w = tw + 10;
  const x = Math.round((CART.W - w) / 2);
  const y = CART.LABEL_Y + CART.LABEL_H - 16;
  const h = 11;

  // 札の落ち影。カセットの面から浮いていることを示す1px
  g.rect(x + 1, y + 1, w, h, "#00000030");
  g.rect(x, y, w, h, "#f2eddd");
  g.frame(x, y, w, h, "#1b1a17");
  // 紙の目。べた塗りだと札に見えない
  g.hline(x + 1, y + 1, w - 2, "#fdfaf0");
  g.text3x5(x + 5, y + 3, text, "#1b1a17");
}

/** 外装にラベルを貼った状態のカセット1本。 */
export default function Cartridge({ flip, scale, animate = false, soon = false }: Props) {
  const draw = useCallback(
    (g: PixelGfx, t: number) => {
      // ラベルは16本すべてに貼る。外装だけの無地は「作り忘れ」に見えるので使わない。
      drawCartridge(g, { shellName: flip.shell, code: flip.code });
      const art = LABELS[flip.slug];
      if (art) {
        const label = new PixelGfx(CART.LABEL_W, CART.LABEL_H);
        art.draw(label, t);
        g.paste(label, CART.LABEL_X, CART.LABEL_Y);
      }
      if (soon) drawSoonSeal(g);
    },
    [flip.shell, flip.code, flip.slug, soon],
  );

  return (
    <PixelCanvas
      w={CART_BUFFER.W}
      h={CART_BUFFER.H}
      scale={scale}
      draw={draw}
      animate={animate}
      period={3}
      ariaLabel={`${flip.title}のカセット${soon ? "（まだ遊べません）" : ""}`}
    />
  );
}
