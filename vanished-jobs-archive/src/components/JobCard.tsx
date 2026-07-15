import Image from "next/image";
import { Job, statusBadge } from "@/data/jobs";

/** 収録外141件用のプレースホルダー：線画のこすくまくん */
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

/** はみ出し気味に大きく置く画像（受け渡しREADME指定：ノッカーアップ・氷配達人） */
const OVERSIZED = new Set(["jobs/knocker.png", "jobs/iceman.png"]);

export default function JobCard({ job }: { job: Job }) {
  const oversized = job.image ? OVERSIZED.has(job.image) : false;

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
            className="rounded-full px-[3.4cqw] py-[1cqw] text-[3.2cqw] tracking-wider"
            style={{ background: job.textColor, color: job.color }}
          >
            {statusBadge(job)}
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
            />
          ) : (
            <BearPlaceholder />
          )}
        </div>

        <div className="text-center">
          <p className="text-[7.4cqw] font-bold leading-tight">{job.name}</p>
          <p className="font-mono-label mt-[1.6cqw] text-[2.9cqw] uppercase tracking-[0.35em] opacity-80">
            {job.en}
          </p>
          <p className="mt-[3.4cqw] text-[3.5cqw] leading-snug opacity-90">
            「{job.quote}」
          </p>
        </div>
      </div>
    </div>
  );
}
