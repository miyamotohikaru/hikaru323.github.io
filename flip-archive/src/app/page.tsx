"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { cases } from "@/data/cases";
import { OP_LATIN } from "@/data/types";

const Ribbon = dynamic(() => import("@/webgl/Ribbon"), { ssr: false });

export default function Home() {
  const [focus, setFocus] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  const shown = cases[hover ?? focus] ?? cases[0];
  const isHover = hover !== null;

  return (
    <main className="fixed inset-0 overflow-hidden">
      <Ribbon onFocusChange={setFocus} onHoverChange={setHover} />

      {/* 図鑑の定義。左上に小さく置き、図版の読み取りの手前に立たせない */}
      <div className="pointer-events-none absolute left-4 top-14 z-30 sm:left-6 sm:top-16">
        <p className="max-w-[17rem] text-11 leading-[2] text-mute opacity-0 [animation:fadeIn_1.4s_1.8s_forwards]">
          見えていたのに、見ていなかったものを、
          <br />
          別の輪郭で見直す状況をつくった
          <br />
          企画・作品・介入・事件のアーカイブ。
        </p>
        <p className="label mt-4 opacity-0 [animation:fadeIn_1.4s_2.1s_forwards]">
          KOSU.KUMA / INTERNAL WORKING DRAFT
        </p>
      </div>

      {/* 手前の版の書誌 */}
      <div className="pointer-events-none absolute bottom-16 right-4 z-30 max-w-[calc(100%-2rem)] text-right sm:bottom-20 sm:right-6">
        <div
          key={shown.slug}
          className="[animation:riseIn_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        >
          <div className="mb-1.5 flex items-baseline justify-end gap-2.5">
            <span className="label !text-ink tnum">{shown.id}</span>
            <span className="label tnum">{shown.yearLabel}</span>
            <span className="label">{shown.place}</span>
          </div>
          <h2 className="ml-auto max-w-[22rem] text-[1.35rem] font-medium leading-[1.25] tracking-[-0.02em] sm:text-[1.7rem]">
            {shown.titleJa}
          </h2>
          <p className="label mt-1">{shown.titleOrig}</p>
          <div className="mt-3 flex flex-wrap justify-end gap-x-3 gap-y-1">
            {shown.flipOps.map((op) => (
              <span key={op} className="label !text-accent">
                {OP_LATIN[op]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 操作の手引き */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-30 text-right sm:bottom-5 sm:right-6">
        <p className="label">
          {isHover ? "CLICK TO OPEN" : "DRAG / SCROLL"}
        </p>
        <p className="label mt-1.5 tnum">
          {String((hover ?? focus) + 1).padStart(2, "0")} / {String(cases.length).padStart(2, "0")}
        </p>
      </div>

      {/* WebGLを使えない環境とキーボード操作のための実体 */}
      <nav className="sr-only">
        <h1>世界のFLIP図鑑 — 収録CASE</h1>
        <ul>
          {cases.map((c) => (
            <li key={c.slug}>
              <Link href={`/case/${c.slug}`}>
                {c.id} {c.titleJa}（{c.yearLabel}／{c.place}）
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </main>
  );
}
