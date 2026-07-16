import IndexView from "@/components/IndexView";
import { stats } from "@/data/jobs";
import { T } from "@/lib/lang";

export default function Home() {
  return (
    <div>
      {/* ヒーロー（携帯は左寄せ・PCは中央） */}
      <section className="px-4 pb-8 pt-10 text-left md:pt-16 md:text-center">
        <p className="font-mono-label text-[10px] tracking-[0.5em] text-vja-ink-soft">
          ISSUE 02
        </p>
        <h1 className="font-logo mt-4 text-4xl font-bold tracking-wide md:text-6xl">
          Vanished Jobs Archive.
        </h1>
        <p className="mt-5 text-sm font-semibold tracking-wider md:text-base">
          <T
            ja="「コンピュータ」は、かつて人間の職業だった。"
            en={"“Computer” was once a human job."}
          />
        </p>
        <p className="mt-2 text-xs tracking-wider text-vja-ink-soft">
          <T
            ja={`消えた職業${stats.total}件を、こすくまくんと記録する図鑑。`}
            en={`An archive of ${stats.total} vanished jobs, recorded with Kosukuma-kun.`}
          />
        </p>
        <div className="mt-8 flex max-w-md items-stretch md:mx-auto md:justify-center">
          {[
            { n: String(stats.total), ja: "項目", en: "ENTRIES" },
            { n: String(stats.regions), ja: "地域", en: "REGIONS" },
            { n: String(stats.lineages), ja: "系譜", en: "LINEAGES" },
          ].map((s, i) => (
            <div
              key={s.ja}
              className={`flex-1 px-6 first:pl-0 md:first:pl-6 ${i > 0 ? "border-l border-vja-line" : ""}`}
            >
              <p className="font-logo text-3xl font-bold md:text-4xl">{s.n}</p>
              <p className="font-mono-label mt-1 text-[10px] tracking-[0.3em] text-vja-ink-soft">
                <T ja={s.ja} en={s.en} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <IndexView />
    </div>
  );
}
