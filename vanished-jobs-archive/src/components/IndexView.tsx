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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs tracking-wider transition-colors ${
        active
          ? "border-vja-accent bg-vja-accent/10 font-semibold text-vja-accent"
          : "border-vja-line bg-vja-paper text-vja-ink-soft hover:border-vja-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono-label text-[10px] tracking-[0.35em] text-vja-accent">
        − {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function IndexView() {
  const [open, setOpen] = useState(false);
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
  const activeCount =
    (status !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (cause !== "all" ? 1 : 0);

  const reset = () => {
    setStatus("all");
    setCategory("all");
    setRegion("all");
    setCause("all");
    setOrder("asc");
    setShown(PAGE);
  };

  const pick = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setShown(PAGE);
  };

  return (
    <>
      {/* 絞り込みバー */}
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex items-center justify-between border-y border-vja-line py-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-3"
          >
            <span className="font-mono-label text-[10px] tracking-[0.35em] text-vja-ink-soft">
              SORT
            </span>
            <span className="text-sm font-semibold tracking-[0.2em]">
              絞り込み {open ? "∧" : "∨"}
            </span>
            {activeCount > 0 && (
              <span className="rounded-full bg-vja-accent px-2 py-0.5 font-mono-label text-[10px] text-vja-cream">
                {activeCount}
              </span>
            )}
          </button>
          <span className="font-mono-label text-xs tracking-[0.25em] text-vja-ink-soft">
            {filtered.length} / {stats.total}
          </span>
        </div>

        {open && (
          <div className="rounded-b-lg border border-t-0 border-vja-line bg-vja-paper/60 p-6 md:p-8">
            <div className="grid gap-7 md:grid-cols-2">
              <Group label="並び替え">
                <Chip active={order === "asc"} onClick={() => setOrder("asc")}>
                  NO.順
                </Chip>
                <Chip active={order === "desc"} onClick={() => setOrder("desc")}>
                  NO.逆順
                </Chip>
              </Group>
              <Group label="ステータス">
                <Chip active={status === "all"} onClick={() => pick(setStatus)("all")}>
                  すべて
                </Chip>
                {(Object.keys(statusMeta) as JobStatus[]).map((s) => (
                  <Chip
                    key={s}
                    active={status === s}
                    onClick={() => pick(setStatus)(s)}
                  >
                    {statusMeta[s].mark}
                    {statusMeta[s].label} {stats[s]}
                  </Chip>
                ))}
              </Group>
              <Group label="年代（章）">
                <Chip active={category === "all"} onClick={() => pick(setCategory)("all")}>
                  すべて
                </Chip>
                {categories.map((c) => (
                  <Chip
                    key={c}
                    active={category === c}
                    onClick={() => pick(setCategory)(c)}
                  >
                    {c}
                  </Chip>
                ))}
              </Group>
              <Group label="発祥地域">
                <Chip active={region === "all"} onClick={() => pick(setRegion)("all")}>
                  すべて
                </Chip>
                {regionTagList.map((r) => (
                  <Chip
                    key={r}
                    active={region === r}
                    onClick={() => pick(setRegion)(r)}
                  >
                    {r}
                  </Chip>
                ))}
              </Group>
              <Group label="死因">
                <Chip active={cause === "all"} onClick={() => pick(setCause)("all")}>
                  すべて
                </Chip>
                {Object.entries(causeLabels).map(([n, label]) => (
                  <Chip
                    key={n}
                    active={cause === n}
                    onClick={() => pick(setCause)(n)}
                  >
                    {label}
                  </Chip>
                ))}
              </Group>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={reset}
                className="rounded-full border border-vja-line px-6 py-2 text-xs tracking-[0.2em] text-vja-ink-soft hover:border-vja-ink"
              >
                リセット
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-vja-ink px-6 py-2 text-xs tracking-[0.2em] text-vja-cream hover:opacity-85"
              >
                結果を見る・{filtered.length}件
              </button>
            </div>
          </div>
        )}
      </div>

      {/* カードグリッド */}
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-vja-ink-soft">
            この条件のカードは、見つかりませんでした。
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
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
