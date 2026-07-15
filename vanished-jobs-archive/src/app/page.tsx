import IndexView from "@/components/IndexView";
import { stats } from "@/data/jobs";

export default function Home() {
  return (
    <div>
      {/* ヒーロー */}
      <section className="px-4 pb-8 pt-12 text-center md:pt-16">
        <p className="font-mono-label text-[10px] tracking-[0.5em] text-vja-ink-soft">
          ISSUE 01
        </p>
        <h1 className="font-logo mt-4 text-4xl font-bold tracking-wide md:text-6xl">
          Vanished Jobs Archive.
        </h1>
        <p className="mt-5 text-sm font-semibold tracking-wider md:text-base">
          「コンピュータ」は、かつて人間の職業だった。
        </p>
        <p className="mt-2 text-xs tracking-wider text-vja-ink-soft">
          消えた職業{stats.total}件を、こすくまくんと記録する図鑑。
        </p>
        <div className="mx-auto mt-8 flex max-w-md items-stretch justify-center">
          {[
            { n: String(stats.total), label: "項目" },
            { n: String(stats.regions), label: "地域" },
            { n: String(stats.lineages), label: "系譜" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 px-6 ${i > 0 ? "border-l border-vja-line" : ""}`}
            >
              <p className="font-logo text-3xl font-bold md:text-4xl">{s.n}</p>
              <p className="font-mono-label mt-1 text-[10px] tracking-[0.3em] text-vja-ink-soft">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <IndexView />
    </div>
  );
}
