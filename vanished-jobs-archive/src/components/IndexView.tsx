"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import {
  jobs,
  stats,
  statusMeta,
  categories,
  causeLabels,
  regionTagList,
  regionTags,
  JobStatus,
} from "@/data/jobs";

const PAGE = 18;
const STEP = 30;

const selectCls =
  "rounded-full border border-vja-line bg-vja-paper px-4 py-1.5 text-xs tracking-wider text-vja-ink appearance-none cursor-pointer hover:border-vja-ink-soft";

export default function IndexView() {
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [cause, setCause] = useState("all");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    let list = jobs.filter(
      (j) =>
        (status === "all" || j.status === status) &&
        (category === "all" || j.category === category) &&
        (region === "all" || regionTags(j).includes(region)) &&
        (cause === "all" || j.causeAll.includes(Number(cause)))
    );
    if (order === "desc") list = [...list].reverse();
    return list;
  }, [status, category, region, cause, order]);

  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;

  const statusChip = (key: JobStatus | "all", label: string, count: number) => (
    <button
      key={key}
      onClick={() => {
        setStatus(key);
        setShown(PAGE);
      }}
      className={`rounded-full border px-4 py-1.5 text-xs tracking-wider transition-colors ${
        status === key
          ? "border-vja-ink bg-vja-ink text-vja-cream"
          : "border-vja-line bg-vja-paper text-vja-ink-soft hover:border-vja-ink-soft"
      }`}
    >
      {label} {count}
    </button>
  );

  return (
    <>
      {/* フィルタ */}
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {statusChip("all", "すべて", stats.total)}
          {(Object.keys(statusMeta) as JobStatus[]).map((s) =>
            statusChip(
              s,
              `${statusMeta[s].mark}${statusMeta[s].label}`,
              stats[s === "extinct" ? "extinct" : s === "transformed" ? "transformed" : "ongoing"]
            )
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <select
            className={selectCls}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setShown(PAGE);
            }}
          >
            <option value="all">年代でみる ▾</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setShown(PAGE);
            }}
          >
            <option value="all">地域でみる ▾</option>
            {regionTagList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={cause}
            onChange={(e) => {
              setCause(e.target.value);
              setShown(PAGE);
            }}
          >
            <option value="all">死因でしぼる ▾</option>
            {Object.entries(causeLabels).map(([n, label]) => (
              <option key={n} value={n}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">NO.順 ▾</option>
            <option value="desc">NO.逆順</option>
          </select>
        </div>
      </div>

      {/* カードグリッド */}
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-vja-ink-soft">
            この条件のカードは、見つかりませんでした。
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {visible.map((j) => (
              <Link
                key={j.no}
                href={`/jobs/${j.no}`}
                className="vja-rise transition-transform hover:-translate-y-1"
              >
                <JobCard job={j} />
              </Link>
            ))}
          </div>
        )}
        {remaining > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShown((n) => n + STEP)}
              className="rounded-full border border-vja-ink px-8 py-2.5 text-sm tracking-[0.2em] hover:bg-vja-ink hover:text-vja-cream"
            >
              もっとめくる（のこり{remaining}）
            </button>
          </div>
        )}
      </div>
    </>
  );
}
