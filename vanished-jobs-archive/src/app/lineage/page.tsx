import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { jobByNo } from "@/data/jobs";
import { lineageChains, LineageNode } from "@/data/lineage";

export const metadata: Metadata = { title: "系譜 | Vanished Jobs Archive." };

function NodeChip({ node, size = "md" }: { node: LineageNode; size?: "md" | "lg" }) {
  const job = node.no ? jobByNo.get(node.no) : undefined;
  const icon = size === "lg" ? "h-9 w-9" : "h-8 w-8";

  if (!job) {
    return (
      <span className="whitespace-nowrap rounded border border-vja-line bg-vja-paper px-3 py-1.5 text-xs italic tracking-wider text-vja-ink-soft">
        {node.label}
      </span>
    );
  }
  return (
    <Link
      href={`/jobs/${job.no}`}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-xs tracking-wider transition-transform hover:-translate-y-0.5 ${
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
          className={`${icon} rounded-full bg-vja-cream object-contain`}
        />
      )}
      {node.label}
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
          仕事は、消えない。
        </h1>
        <p className="mt-3 text-sm tracking-wider text-vja-accent">
          名前を変えて、消えつづける。
        </p>
      </header>

      <p className="mt-8 hidden justify-between font-mono-label text-[10px] tracking-[0.3em] text-vja-ink-soft md:flex">
        <span>← ふるい</span>
        <span>いま →</span>
      </p>

      <div className="mt-4 divide-y divide-vja-line">
        {lineageChains.map((chain) => (
          <section key={chain.id} className="py-6">
            <h2 className="font-mono-label text-[11px] tracking-[0.4em] text-vja-accent">
              − {chain.num} {chain.title}
            </h2>

            {/* PC: 横並び */}
            <div className="mt-4 hidden overflow-x-auto pb-2 md:block">
              <div className="flex w-max items-center gap-2">
                {chain.nodes.map((n, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-vja-ink-soft">→</span>}
                    <NodeChip node={n} size="lg" />
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
