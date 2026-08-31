"use client";

// 「けんの したく」引き出し。剣ラック(いろ)・しあげ・チャームの棚をまとめた、
// 下からせり上がる小さなパネル。
//
// なぜ引き出しにしたか: スマホ縦だと確認シートに全部は入らない。
// 刺す直前に必要なのは「いま選んでいる剣」と色だけなので、それだけをシートに残し、
// じっくり選ぶ/コレクションを眺めるものは、ここへ隔離した。

import { useEffect } from "react";
import { SkinRack, SwordRack } from "./SwordRack";
import { CharmShelf } from "./CharmShelf";

interface GearDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function GearDrawer({ open, onClose }: GearDrawerProps) {
  // キーボードでも閉じられるように(PCでさわる人むけ)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* 背景タップでも閉じる。3Dの操作はここで止める */}
      <div className="kk-drawer-back" onClick={onClose} aria-hidden="true" />
      <div
        className="kk-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="けんの したく"
      >
        {/* 見出しは樽の赤。クリーム一色だとパネル全体が無効状態に見えてしまう */}
        <div className="kk-drawer-head">
          <span className="kk-drawer-grip" aria-hidden="true" />
          <h2 className="kk-drawer-title">けんの したく</h2>
          <button
            type="button"
            className="kk-drawer-x"
            aria-label="とじる"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="kk-drawer-body">
          <section className="kk-sec">
            <p className="kk-sec-label kk-label-color">いろ</p>
            <SwordRack />
          </section>
          <section className="kk-sec">
            <p className="kk-sec-label kk-label-skin">しあげ</p>
            <SkinRack />
          </section>
          <section className="kk-sec">
            <CharmShelf />
          </section>
        </div>
      </div>
    </>
  );
}
