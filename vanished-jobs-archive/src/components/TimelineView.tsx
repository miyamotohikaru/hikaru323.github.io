"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  jobs,
  stats,
  statusMeta,
  categories,
  categorySubtitles,
  JobStatus,
} from "@/data/jobs";

/** 中央軸に置く「機械・技術・制度」のできごと（章ごと） */
const events: Record<string, string[]> = {
  前近代の世界: ["1450s 活版印刷"],
  江戸の日本: ["1657 明暦の大火"],
  産業革命の世界: ["1832 解剖法", "1876 廃刀令"],
  "明治〜昭和の日本": ["1927 トーキー", "1946 ENIAC"],
  "20世紀の世界": ["1967 自動改札", "1979 電話自動化"],
  平成の日本: ["1999 東証立会場閉鎖"],
  消滅進行中: ["2022 生成AI"],
};

function JobChip({ job }: { job: (typeof jobs)[number] }) {
  const m = statusMeta[job.status];
  return (
    <Link
      href={`/jobs/${job.no}`}
      className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs tracking-wider transition-transform hover:-translate-y-0.5 ${
        job.status === "ongoing" ? "border border-dashed border-vja-blue text-vja-blue" : ""
      }`}
      style={
        job.status === "ongoing"
          ? undefined
          : { background: job.color, color: job.textColor }
      }
    >
      {job.image && (
        <Image
          src={`/${job.image}`}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 rounded-full bg-vja-cream object-contain"
        />
      )}
      <span className="font-semibold">{job.name}</span>
      <span className="text-[10px] opacity-85">
        {m.mark}
        {job.endLabel}
      </span>
    </Link>
  );
}

export default function TimelineView() {
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const filtered = status === "all" ? jobs : jobs.filter((j) => j.status === status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <header className="text-center">
        <p className="font-mono-label text-[10px] tracking-[0.6em] text-vja-ink-soft">
          TIMELINE
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-[0.15em] md:text-4xl">
          仕事が消えた順に、ならべる。
        </h1>
        <p className="mt-4 text-xs leading-relaxed tracking-wider text-vja-ink-soft">
          古代から現在まで。中央の帯は「機械・技術・制度」のできごと——多くの職業は、この隣で息を止めた。
        </p>
      </header>

      {/* フィルタ */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {(
          [
            ["all", `すべて`, stats.total],
            ["extinct", `◆絶滅`, stats.extinct],
            ["transformed", `◇変質`, stats.transformed],
            ["ongoing", `▲進行中`, stats.ongoing],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setStatus(key as JobStatus | "all")}
            className={`rounded-full border px-4 py-1.5 text-xs tracking-wider ${
              status === key
                ? "border-vja-ink bg-vja-ink text-vja-cream"
                : "border-vja-line bg-vja-paper text-vja-ink-soft hover:border-vja-ink-soft"
            }`}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {/* 年表本体 */}
      <div className="relative mt-12">
        {/* 中央軸（PCのみ） */}
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-vja-line md:block" />

        {categories.map((cat) => {
          const list = filtered.filter((j) => j.category === cat);
          if (list.length === 0) return null;
          return (
            <section key={cat} className="relative py-8">
              <h2 className="relative z-10 text-center">
                <span className="bg-vja-bg px-4 text-sm font-bold tracking-[0.3em]">
                  {cat}
                  <span className="ml-3 font-normal text-vja-ink-soft">
                    — {categorySubtitles[cat]}
                  </span>
                </span>
              </h2>

              {/* できごとマーカー */}
              <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2">
                {(events[cat] ?? []).map((e) => (
                  <span
                    key={e}
                    className="font-mono-label rounded border border-vja-line bg-vja-paper px-3 py-1 text-[10px] tracking-wider text-vja-ink-soft"
                  >
                    {e}
                  </span>
                ))}
              </div>

              {/* 職業チップ：左右交互(PC) / 1列(スマホ) */}
              <div className="mt-6 grid gap-x-16 gap-y-3 md:grid-cols-2">
                <div className="flex flex-col items-start gap-3 md:items-end">
                  {list
                    .filter((_, i) => i % 2 === 0)
                    .map((j) => (
                      <JobChip key={j.no} job={j} />
                    ))}
                </div>
                <div className="flex flex-col items-start gap-3">
                  {list
                    .filter((_, i) => i % 2 === 1)
                    .map((j) => (
                      <JobChip key={j.no} job={j} />
                    ))}
                </div>
              </div>
            </section>
          );
        })}

        <p className="relative z-10 py-8 text-center text-xs tracking-[0.3em] text-vja-ink-soft">
          <span className="bg-vja-bg px-4">現在 —— この先は、まだ書かれていない</span>
        </p>
      </div>
    </div>
  );
}
