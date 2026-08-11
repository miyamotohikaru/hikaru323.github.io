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
};

/** 外装にラベルを貼った状態のカセット1本。 */
export default function Cartridge({ flip, scale, animate = false }: Props) {
  const draw = useCallback(
    (g: PixelGfx, t: number) => {
      // ラベルは16本すべてに貼る。まだ遊べないことは版面側（COMING SOON と
      // カセットの彩度）で示す。外装だけの無地は「作り忘れ」に見えるので使わない。
      drawCartridge(g, { shellName: flip.shell, code: flip.code });
      const art = LABELS[flip.slug];
      if (!art) return;
      const label = new PixelGfx(CART.LABEL_W, CART.LABEL_H);
      art.draw(label, t);
      g.paste(label, CART.LABEL_X, CART.LABEL_Y);
    },
    [flip.shell, flip.code, flip.slug],
  );

  return (
    <PixelCanvas
      w={CART_BUFFER.W}
      h={CART_BUFFER.H}
      scale={scale}
      draw={draw}
      animate={animate}
      period={3}
      ariaLabel={`${flip.title}のカセット`}
    />
  );
}
