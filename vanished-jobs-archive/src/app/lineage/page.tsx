import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { jobByNo } from "@/data/jobs";
import { lineageChains } from "@/data/lineage";

export const metadata: Metadata = { title: "系譜 | Vanished Jobs Archive." };

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
      <p className="mt-6 text-center text-[10px] tracking-[0.3em] text-vja-ink-soft md:hidden">
        ← 横スワイプで先へ →
      </p>

      <div className="mt-4 divide-y divide-vja-line">
        {lineageChains.map((chain) => (
          <section key={chain.id} className="py-6">
            <h2 className="font-mono-label text-[11px] tracking-[0.4em] text-vja-ink-soft">
              {chain.num} {chain.title}
            </h2>
            <div className="mt-4 overflow-x-auto pb-2">
              <div className="flex w-max items-center gap-2">
                {chain.nodes.map((n, i) => {
                  const job = n.no ? jobByNo.get(n.no) : undefined;
                  return (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-vja-ink-soft">→</span>}
                      {job ? (
                        <Link
                          href={`/jobs/${job.no}`}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-xs tracking-wider transition-transform hover:-translate-y-0.5 ${
                            n.ongoing
                              ? "border border-dashed border-vja-blue text-vja-blue"
                              : ""
                          }`}
                          style={
                            n.ongoing
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
                              width={20}
                              height={20}
                              className="h-5 w-5 rounded-full bg-vja-cream object-contain"
                            />
                          )}
                          {n.label}
                          {n.ongoing ? " ▲" : ""}
                        </Link>
                      ) : (
                        <span className="whitespace-nowrap rounded border border-vja-line bg-vja-paper px-3 py-1.5 text-xs italic tracking-wider text-vja-ink-soft">
                          {n.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
