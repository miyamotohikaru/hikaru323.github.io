"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cases } from "@/data/cases";
import { FLIP_OPS, OP_LATIN, type Case, type FlipOp } from "@/data/types";
import Plate from "@/components/Plate";

type AxisKey = "era" | "region" | "field" | "actorType" | "scale" | "legality";

const AXES: { key: AxisKey; label: string; latin: string }[] = [
  { key: "era", label: "年代", latin: "ERA" },
  { key: "region", label: "地域", latin: "REGION" },
  { key: "field", label: "分野", latin: "FIELD" },
  { key: "actorType", label: "実行主体", latin: "ACTOR" },
  { key: "scale", label: "規模", latin: "SCALE" },
  { key: "legality", label: "合法性", latin: "LEGALITY" },
];

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

export default function IndexPage() {
  const [filters, setFilters] = useState<Partial<Record<AxisKey, string>>>({});
  const [opFilter, setOpFilter] = useState<FlipOp | null>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Case | null>(null);
  const [mode, setMode] = useState<"OVERVIEW" | "LIST">("OVERVIEW");
  const [played, setPlayed] = useState(false);
  const cursor = useRef({ x: 0, y: 0 });
  const floatRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const o = {} as Record<AxisKey, string[]>;
    AXES.forEach(({ key }) => {
      o[key] = uniq(cases.map((c) => c.axes[key])).sort();
    });
    return o;
  }, []);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      for (const { key } of AXES) {
        const v = filters[key];
        if (v && c.axes[key] !== v) return false;
      }
      if (opFilter && !c.flipOps.includes(opFilter)) return false;
      return true;
    });
  }, [filters, opFilter]);

  const activeCount =
    Object.values(filters).filter(Boolean).length + (opFilter ? 1 : 0);

  const onMove = (e: React.MouseEvent) => {
    cursor.current = { x: e.clientX, y: e.clientY };
    const el = floatRef.current;
    if (el) {
      el.style.transform = `translate3d(${e.clientX + 24}px, ${
        e.clientY - 130
      }px, 0)`;
    }
  };

  return (
    <main
      className="min-h-screen px-4 pb-4 pt-20 sm:px-6 sm:pt-24"
      onMouseMove={onMove}
    >
      <div className="mx-auto max-w-[68rem]">
        <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
          <div>
            <h1 className="text-[1.6rem] font-medium tracking-[-0.02em] sm:text-[2rem]">
              索引
            </h1>
            <p className="label mt-1">INDEX OF CASES</p>
          </div>
          <div className="flex items-baseline gap-5">
            <div className="flex items-baseline gap-3">
              {(["OVERVIEW", "LIST"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="group relative"
                >
                  <span
                    className={`label transition-colors ${
                      mode === m ? "!text-ink" : "group-hover:!text-ink"
                    }`}
                  >
                    {m}
                  </span>
                  <span
                    className={`absolute -bottom-1.5 left-0 block h-px bg-ink transition-all duration-500 ease-out ${
                      mode === m ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              ))}
            </div>
            {mode === "OVERVIEW" && (
              <button
                onClick={() => setPlayed((v) => !v)}
                className="label transition-colors hover:!text-ink"
                title="収録CASEの図版を、変容前と配置操作の実行後で見比べる"
              >
                <span className={played ? "" : "!text-ink"}>変容前</span>
                <span className="mx-1.5 opacity-50">／</span>
                <span className={played ? "!text-ink" : ""}>実行後</span>
              </button>
            )}
            <p className="label tnum">
              {String(filtered.length).padStart(2, "0")} / {String(cases.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* 絞り込み */}
        <div className="border-b border-line py-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="label flex items-center gap-2 transition-colors hover:!text-ink"
          >
            絞り込み
            {activeCount > 0 && (
              <span className="!text-accent tnum">［{activeCount}］</span>
            )}
            <span
              className={`inline-block transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            >
              ∨
            </span>
          </button>

          {open && (
            <div className="mt-5 grid gap-5 pb-3 sm:grid-cols-2 lg:grid-cols-3">
              {AXES.map(({ key, label, latin }) => (
                <div key={key}>
                  <p className="label mb-2">
                    {label} <span className="opacity-50">{latin}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {options[key].map((v) => {
                      const on = filters[key] === v;
                      return (
                        <button
                          key={v}
                          onClick={() =>
                            setFilters((f) => ({ ...f, [key]: on ? undefined : v }))
                          }
                          className={`rounded-full border px-2.5 py-1 text-11 transition-colors duration-200 ${
                            on
                              ? "border-ink bg-ink text-bg"
                              : "border-line text-mute hover:border-ink hover:text-ink"
                          }`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <p className="label mb-2">
                  配置操作 <span className="opacity-50">OPERATION</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FLIP_OPS.map((op) => {
                    const on = opFilter === op;
                    const count = cases.filter((c) => c.flipOps.includes(op)).length;
                    return (
                      <button
                        key={op}
                        disabled={count === 0}
                        onClick={() => setOpFilter(on ? null : op)}
                        className={`rounded-full border px-2.5 py-1 text-11 transition-colors duration-200 ${
                          on
                            ? "border-accent bg-accent text-bg"
                            : count === 0
                              ? "border-line/60 text-faint"
                              : "border-line text-mute hover:border-ink hover:text-ink"
                        }`}
                      >
                        {op}
                        <span className="tnum ml-1 opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 図版の一覧 */}
        {mode === "OVERVIEW" && (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
            {filtered.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/case/${c.slug}`}
                  className="group block"
                  onMouseEnter={() => setHovered(c)}
                  onMouseLeave={() => setHovered((h) => (h === c ? null : h))}
                >
                  <Plate
                    c={c}
                    active={played || hovered === c}
                    className="block aspect-[1/1.38] w-full"
                  />
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="label tnum transition-colors duration-300 group-hover:!text-accent">
                      {c.id}
                    </span>
                    <span className="label tnum">{c.yearLabel}</span>
                  </div>
                  <p className="mt-0.5 text-13 font-medium leading-snug tracking-[-0.01em]">
                    {c.titleJa}
                  </p>
                  <p className="label mt-0.5">{c.place}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* 表の一覧 */}
        {mode === "LIST" && (
        <ul className="mt-1">
          {filtered.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/case/${c.slug}`}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered((h) => (h === c ? null : h))}
                className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 border-b border-line py-4 transition-colors duration-300 hover:bg-paper sm:grid-cols-[3rem_4.5rem_1fr_9rem_8rem] sm:gap-x-5 sm:py-3.5"
              >
                <span className="label tnum transition-colors duration-300 group-hover:!text-accent">
                  {c.id}
                </span>
                <span className="label tnum order-3 sm:order-none">
                  {c.yearLabel}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="text-[1.05rem] font-medium leading-tight tracking-[-0.015em] sm:text-[1.15rem]">
                    {c.titleJa}
                  </span>
                  <span className="label">{c.titleOrig}</span>
                </span>
                <span className="label order-4 sm:order-none">{c.place}</span>
                <span className="label order-5 flex flex-wrap gap-x-2 sm:order-none">
                  {c.flipOps.slice(0, 2).map((op) => (
                    <span key={op}>{OP_LATIN[op]}</span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        )}

        {filtered.length === 0 && (
          <p className="py-16 text-center text-13 text-mute">
            この条件に当てはまるCASEは、まだ収録していません。
            <br />
            <span className="label mt-2 inline-block">
              空白は、次の調査テーマとして扱う。
            </span>
          </p>
        )}

        <p className="mt-16 max-w-[38rem] text-11 leading-[2] text-mute">
          収録は賞賛・推奨・免責を意味しない。点数・順位・レアリティは付けない。
          ここに収録された制作者が、自らの活動をFLIPと呼んでいるわけではない。
        </p>
      </div>

      {/* カーソルに付く図版 */}
      <div
        ref={floatRef}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
        style={{ willChange: "transform" }}
      >
        <div
          className={`transition-opacity duration-300 ${
            hovered && mode === "LIST" ? "opacity-100" : "opacity-0"
          }`}
        >
          {hovered && mode === "LIST" && (
            <Plate
              key={hovered.slug}
              c={hovered}
              active
              className="block h-[17rem] w-[12.3rem]"
            />
          )}
        </div>
      </div>
    </main>
  );
}
