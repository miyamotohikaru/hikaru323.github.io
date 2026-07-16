import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { jobByNo } from "@/data/jobs";
import { lineageChains, LineageNode } from "@/data/lineage";
import { T } from "@/lib/lang";

export const metadata: Metadata = { title: "系譜 | Vanished Jobs Archive." };

const chainTitleEn: Record<string, string> = {
  通信: "Communication",
  計算: "Computation",
  時刻: "Time",
  冷却: "Cooling",
  光: "Light",
  物語: "Storytelling",
  貸与: "Lending",
  印刷: "Printing",
  移動: "Transport",
  接客販売: "Retail & service",
  医療: "Medicine",
  記録: "Records",
};

function NodeChip({ node }: { node: LineageNode }) {
  const job = node.no ? jobByNo.get(node.no) : undefined;

  if (!job) {
    return (
      <span className="inline-flex h-10 items-center whitespace-nowrap rounded border border-vja-line bg-vja-paper px-3 text-xs italic tracking-wider text-vja-ink-soft md:h-12">
        {node.label}
      </span>
    );
  }
  return (
    <Link
      href={`/jobs/${job.no}`}
      className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded px-3 text-xs tracking-wider transition-transform hover:-translate-y-0.5 md:h-12 ${
        node.ongoing ? "border border-dashed border-vja-blue text-vja-blue" : ""
      }`}
      style={
        node.ongoing
          ? undefined
          : job.image
            ? { background: job.color, color: job.textColor }
            : { background: "var(--vja-ink)", color: "var(--vja-cream)" }
      }
    >
      {job.image && (
        <Image
          src={`/${job.image}`}
          alt=""
          width={36}
          height={36}
          className="h-7 w-7 rounded-full bg-vja-cream object-contain md:h-9 md:w-9"
        />
      )}
      <T ja={node.label} en={job.en} />
      {node.ongoing ? " ▲" : ""}
    </Link>
  );
}

export default function LineagePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <header className="text-center">
        <p className="font-mono-label text-[10px] tracking-[0.6em] text-vja-ink-soft">
          LINEAGE · {lineageChains.length} CHAINS
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-[0.15em] md:text-4xl">
          <T ja="仕事は、消えない。" en="Jobs never die." />
        </h1>
        <p className="mt-3 text-sm tracking-wider text-vja-accent">
          <T
            ja="名前を変えて、消えつづける。"
            en="They keep vanishing, under new names."
          />
        </p>
      </header>

      <p className="mt-8 hidden justify-between font-mono-label text-[10px] tracking-[0.3em] text-vja-ink-soft md:flex">
        <span>
          ← <T ja="ふるい" en="older" />
        </span>
        <span>
          <T ja="いま" en="now" /> →
        </span>
      </p>

      <div className="mt-4 divide-y divide-vja-line">
        {lineageChains.map((chain) => (
          <section key={chain.id} className="py-6">
            <h2 className="font-mono-label text-[11px] tracking-[0.4em] text-vja-accent">
              − {chain.num} <T ja={chain.title} en={chainTitleEn[chain.title]} />
            </h2>

            {/* PC: 横並び */}
            <div className="mt-4 hidden overflow-x-auto pb-2 md:block">
              <div className="flex w-max items-center gap-2">
                {chain.nodes.map((n, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-vja-ink-soft">→</span>}
                    <NodeChip node={n} />
                  </span>
                ))}
              </div>
            </div>

            {/* 携帯: 縦並び（ふるい↑ → いま↓） */}
            <div className="mt-4 md:hidden">
              <div className="ml-3 flex flex-col items-start gap-2.5 border-l border-vja-line pl-5">
                {chain.nodes.map((n, i) => (
                  <span key={i} className="flex flex-col items-start gap-2.5">
                    {i > 0 && (
                      <span className="text-sm leading-none text-vja-ink-soft">↓</span>
                    )}
                    <NodeChip node={n} />
                  </span>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
