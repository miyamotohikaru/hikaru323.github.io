"use client";

import Image from "next/image";
import { Job, statusMeta } from "@/data/jobs";
import { useLang } from "@/lib/lang";
import { dict } from "@/lib/dict";
import { enDetails } from "@/data/en";
import { yearSpans, fmtYear, lifespan, AXIS_MIN, AXIS_MAX } from "@/data/years";

/** 収録外用のプレースホルダー：線画のこすくまくん */
function BearPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-[72%] w-auto opacity-80"
    >
      <circle cx="30" cy="22" r="9" />
      <circle cx="70" cy="22" r="9" />
      <ellipse cx="50" cy="38" rx="26" ry="22" />
      <circle cx="41" cy="35" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="59" cy="35" r="1.6" fill="currentColor" stroke="none" />
      <path d="M47 43 q3 2.5 6 0" />
      <path d="M31 57 q-8 14 -6 30 q1 12 11 15 q6 2 14 2 q8 0 14 -2 q10 -3 11 -15 q2 -16 -6 -30" />
      <ellipse cx="30" cy="72" rx="7" ry="11" transform="rotate(18 30 72)" />
      <ellipse cx="70" cy="72" rx="7" ry="11" transform="rotate(-18 70 72)" />
      <ellipse cx="42" cy="103" rx="8" ry="5" />
      <ellipse cx="58" cy="103" rx="8" ry="5" />
    </svg>
  );
}

/** はみ出し気味に大きく置く画像（現在は該当なし。必要ならパスを追加） */
const OVERSIZED = new Set<string>([]);

/** 画像ごとの位置微調整（絵柄がカード中央に来るように） */
const NUDGE: Record<string, string> = {};

/** 全角=1・半角=0.5 で実効文字数を数える（長い名前の縮小率計算用） */
function effLen(s: string) {
  let n = 0;
  for (const ch of s) n += ch.charCodeAt(0) > 0xff ? 1 : 0.5;
  return n;
}

export default function JobCard({ job }: { job: Job }) {
  const { lang } = useLang();
  const en = lang === "en";
  const tr = enDetails[job.no];
  const oversized = job.image ? OVERSIZED.has(job.image) : false;

  const name = en ? job.en : job.name;
  const subName = en ? job.name : job.en;
  const quote = en && tr?.quote ? tr.quote : job.quote;
  const badge = en
    ? `${statusMeta[job.status].mark}${dict.status[job.status]}${job.endLabel ? ` ${job.endLabel}` : ""}`
    : `${statusMeta[job.status].mark}${statusMeta[job.status].label}${job.endLabel ? ` ${job.endLabel}` : ""}`;

  // 名前は必ず1行に収める: カード内幅86cqwに対し収まるサイズへ縮小（上限8.8cqw）
  const nameSize = Math.min(8.8, 84 / effLen(name));

  const span = yearSpans[job.no];
  if (span) {
    return (
      <NewCard
        job={job}
        en={en}
        name={name}
        subName={subName}
        quote={quote}
        oversized={oversized}
        reading={span.reading}
        span={span}
      />
    );
  }

  return (
    <div className="@container block h-full w-full">
      <div
        className="relative flex aspect-[34/47] w-full flex-col overflow-hidden rounded-[6cqw] px-[7cqw] pb-[7cqw] pt-[6cqw] shadow-[0_2px_10px_rgba(58,46,34,0.18)]"
        style={{ background: job.color, color: job.textColor }}
      >
        <div className="flex items-start justify-between">
          <span className="font-mono-label text-[3.4cqw] tracking-[0.25em] opacity-90">
            NO.{job.no}
          </span>
          <span
            className="whitespace-nowrap rounded-full px-[3.4cqw] py-[1cqw] text-[3.2cqw] tracking-wider"
            style={{ background: job.textColor, color: job.color }}
          >
            {badge}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-[2cqw]">
          {job.image ? (
            <Image
              src={`/${job.image}`}
              alt={job.name}
              width={400}
              height={400}
              className={`h-full w-auto object-contain ${oversized ? "scale-115" : ""}`}
              style={NUDGE[job.image] ? { transform: NUDGE[job.image] } : undefined}
            />
          ) : (
            <BearPlaceholder />
          )}
        </div>

        <div className="text-center">
          <p
            className="whitespace-nowrap font-bold leading-tight"
            style={{ fontSize: `${nameSize}cqw` }}
          >
            {name}
          </p>
          <p className="font-mono-label mt-[1.6cqw] text-[2.9cqw] uppercase tracking-[0.35em] opacity-80">
            {subName}
          </p>
          <p className="mt-[3.4cqw] text-[3.5cqw] leading-snug opacity-90">
            「{quote}」
          </p>
        </div>
      </div>
    </div>
  );
}

/** 年代スライダー付きの新デザインカード（yearSpans に登録されたカードのみ） */
function NewCard({
  job,
  en,
  name,
  subName,
  quote,
  oversized,
  reading,
  span,
}: {
  job: Job;
  en: boolean;
  name: string;
  subName: string;
  quote: string;
  oversized: boolean;
  reading: string;
  span: { start: number; end: number };
}) {
  const statusLabel = en ? dict.status[job.status] : statusMeta[job.status].label;
  const nameSize = Math.min(11, 90 / effLen(name));

  const range = AXIS_MAX - AXIS_MIN;
  const pos = (y: number) =>
    Math.max(0, Math.min(100, ((y - AXIS_MIN) / range) * 100));
  const left = pos(span.start);
  const knob = pos(span.end);
  const width = Math.max(0, knob - left);
  const years = lifespan(span.start, span.end);

  return (
    <div className="@container block h-full w-full">
      <div
        className="relative flex aspect-[34/47] w-full flex-col overflow-hidden rounded-[6cqw] px-[7cqw] pb-[6cqw] pt-[6.5cqw] shadow-[0_2px_10px_rgba(58,46,34,0.18)]"
        style={{ background: job.color, color: job.textColor }}
      >
        {/* 上段: NO. と ステータスピル */}
        <div className="flex items-center justify-between">
          <span className="font-mono-label text-[7cqw] font-medium tracking-[0.12em]">
            NO.{job.no}
          </span>
          <span
            className="whitespace-nowrap rounded-full px-[5.5cqw] py-[2cqw] text-[6cqw] font-bold tracking-[0.15em]"
            style={{ background: job.textColor, color: job.color }}
          >
            {statusLabel}
          </span>
        </div>

        {/* イラスト */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-[1cqw]">
          {job.image ? (
            <Image
              src={`/${job.image}`}
              alt={job.name}
              width={400}
              height={400}
              className={`h-full w-auto object-contain ${oversized ? "scale-115" : ""}`}
            />
          ) : (
            <BearPlaceholder />
          )}
        </div>

        {/* 読み・名前・英名 */}
        <div className="text-center">
          {!en && (
            <p className="text-[3.4cqw] font-semibold tracking-[0.5em] opacity-80">
              {reading}
            </p>
          )}
          <p
            className="mt-[1cqw] whitespace-nowrap font-bold leading-none"
            style={{ fontSize: `${nameSize}cqw` }}
          >
            {name}
          </p>
          <p className="font-mono-label mt-[1.8cqw] text-[3.1cqw] uppercase tracking-[0.35em] opacity-80">
            {subName}
          </p>
        </div>

        {/* 年代スライダー */}
        <div className="mt-[4cqw]">
          <div className="flex items-end justify-between">
            <span className="font-logo text-[7cqw] font-bold leading-none">
              {fmtYear(span.start)}
            </span>
            <span className="font-logo text-[7cqw] font-bold leading-none">
              {fmtYear(span.end)}
            </span>
          </div>
          <div className="relative mt-[2.4cqw] h-[1.6cqw]">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: job.textColor, opacity: 0.25 }}
            />
            <div
              className="absolute top-0 h-full rounded-full"
              style={{ left: `${left}%`, width: `${width}%`, background: job.textColor }}
            />
            <div
              className="absolute top-1/2 h-[4.2cqw] w-[4.2cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${knob}%`,
                background: job.textColor,
                boxShadow: `0 0 0 1.4cqw ${job.color}`,
              }}
            />
          </div>
          <div className="mt-[1.6cqw] flex justify-between text-[3cqw] opacity-55">
            <span>{fmtYear(AXIS_MIN)}</span>
            <span>{fmtYear(AXIS_MAX)}</span>
          </div>
        </div>

        {/* 寿命 */}
        <p className="mt-[1.6cqw] text-center text-[6cqw] font-bold tracking-[0.06em] opacity-85">
          {en ? `~ ${years} yrs` : `約${years}年つづいた`}
        </p>

        {/* ひとこと */}
        <p className="mt-[1.6cqw] text-center text-[3.6cqw] leading-snug opacity-90">
          「{quote}」
        </p>
      </div>
    </div>
  );
}
