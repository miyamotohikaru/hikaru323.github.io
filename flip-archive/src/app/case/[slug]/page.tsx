import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cases, getCase } from "@/data/cases";
import { OP_LATIN } from "@/data/types";
import CaseHero from "@/components/CaseHero";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  return {
    title: `${c.titleJa}（${c.yearLabel}） — 世界のFLIP図鑑`,
    description: c.oneline,
  };
}

/** 本文の一節。見出しは日本語＋ラテン小見出しの二段。 */
function Section({
  label,
  latin,
  children,
  tone = "plain",
}: {
  label: string;
  latin: string;
  children: React.ReactNode;
  /** 事実／実行主体の説明／FLIP読解 を混ぜないための刷り分け */
  tone?: "plain" | "actor" | "reading" | "forward";
}) {
  return (
    <section
      className={
        tone === "reading"
          ? "border-l-2 border-accent pl-5"
          : tone === "actor"
            ? "border-l border-line pl-5"
            : ""
      }
    >
      <div className="mb-2.5 flex items-baseline gap-2.5">
        <h2
          className={`text-13 font-medium tracking-[0.02em] ${
            tone === "forward" ? "text-accent" : ""
          }`}
        >
          {label}
        </h2>
        <span className={`label ${tone === "forward" ? "!text-accent" : ""}`}>
          {latin}
        </span>
      </div>
      <div className="max-w-[42rem] text-[0.9375rem] leading-[1.95] tracking-[0.005em]">
        {children}
      </div>
    </section>
  );
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const i = cases.findIndex((x) => x.slug === c.slug);
  const prev = cases[(i - 1 + cases.length) % cases.length];
  const next = cases[(i + 1) % cases.length];

  const meta: [string, string, string][] = [
    ["原題", "ORIGINAL TITLE", c.titleOrig],
    ["主な年", "YEAR", c.yearLabel],
    ["場所", "PLACE", c.place],
    ["実行主体", "ACTOR", c.actor],
    ["役割", "ROLE", c.actorRole],
    ["形式", "FORM", c.form],
  ];

  const axes: [string, string, string][] = [
    ["年代", "ERA", c.axes.era],
    ["地域", "REGION", c.axes.region],
    ["分野", "FIELD", c.axes.field],
    ["主体", "ACTOR TYPE", c.axes.actorType],
    ["規模", "SCALE", c.axes.scale],
    ["合法性", "LEGALITY", c.axes.legality],
  ];

  return (
    <main className="px-4 pb-4 pt-20 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-[68rem]">
        <Link
          href="/cases"
          className="label inline-flex items-center gap-2 transition-colors hover:!text-ink"
        >
          ← 索引にもどる
        </Link>

        {/* 見出し */}
        <header className="mt-6 border-b border-line pb-8">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="label !text-accent tnum text-12">CASE {c.id}</span>
            <span className="label tnum">{c.yearLabel}</span>
            <span className="label">{c.place}</span>
            <span className="label">{c.form}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h1 className="text-[2rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[3rem]">
              {c.titleJa}
            </h1>
            <p className="label text-11">{c.titleOrig}</p>
          </div>
          <p className="mt-6 max-w-[44rem] text-[1.25rem] leading-[1.85] tracking-[-0.01em] sm:text-[1.45rem]">
            {c.oneline}
          </p>
        </header>

        <div className="grid gap-12 pt-10 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-14">
          {/* 左：図版と諸元 */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <CaseHero c={c} />

            <dl className="mt-8 border-t border-line">
              {meta.map(([label, latin, value]) => (
                <div
                  key={latin}
                  className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-line py-2.5"
                >
                  <dt className="label pt-0.5">{label}</dt>
                  <dd className="text-13 leading-[1.7]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="label mb-2.5">配置操作 OPERATION</p>
              <div className="flex flex-wrap gap-1.5">
                {c.flipOps.map((op) => (
                  <span
                    key={op}
                    className="rounded-full border border-accent px-2.5 py-1 text-11 text-accent"
                  >
                    {op}
                    <span className="label ml-1.5 !text-accent opacity-70">
                      {OP_LATIN[op]}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="label mb-2.5">図鑑内の位置 AXES</p>
              <dl className="border-t border-line">
                {axes.map(([label, latin, value]) => (
                  <div
                    key={latin}
                    className="flex items-baseline justify-between gap-3 border-b border-line py-2"
                  >
                    <dt className="label">{label}</dt>
                    <dd className="text-12">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-7 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-ink px-2.5 py-1 text-11 text-bg">
                FLIP性：{c.flipStatus}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-11 text-mute">
                公開状態：{c.publishStatus}
              </span>
            </div>
            <p className="label mt-3 leading-[1.9] opacity-70">
              ラベルは編集作業上の状態であり、評価・点数ではない。
            </p>
          </aside>

          {/* 右：本文 */}
          <div className="space-y-12">
            <Section label="何が起きたか" latin="CONFIRMED FACTS">
              <p>{c.facts}</p>
            </Section>

            {c.actorStatement && (
              <Section
                label="実行主体による説明"
                latin="ACTOR'S OWN ACCOUNT"
                tone="actor"
              >
                <p>{c.actorStatement}</p>
                <p className="label mt-3 leading-[1.9]">
                  これは実行主体自身の説明であり、確認できた事実とも、
                  こす.くまの読解とも別に置く。
                </p>
              </Section>
            )}

            <Section label="普段はどう見えていたか" latin="BEFORE">
              <p>{c.before}</p>
            </Section>

            <Section label="何をどう配置し直したか" latin="OPERATION">
              <p>{c.operation}</p>
            </Section>

            <Section label="前景化されたもの" latin="WHAT CAME FORWARD" tone="forward">
              <p>{c.foregrounded}</p>
            </Section>

            <Section
              label="FLIPとして読むと"
              latin="READING BY KOSU.KUMA"
              tone="reading"
            >
              <p>{c.flipReading}</p>
            </Section>

            <Section label="別の読み方・残る問い" latin="COUNTER-READINGS">
              <p>{c.counter}</p>
            </Section>

            {/* 年表 */}
            <section>
              <div className="mb-4 flex items-baseline gap-2.5">
                <h2 className="text-13 font-medium tracking-[0.02em]">経過年表</h2>
                <span className="label">CHRONOLOGY</span>
              </div>
              <ol className="max-w-[42rem] border-t border-line">
                {c.chronology.map((e, idx) => (
                  <li
                    key={`${e.date}-${idx}`}
                    className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line py-3 sm:grid-cols-[7rem_1fr]"
                  >
                    <span className="label tnum pt-1">{e.date}</span>
                    <span className="text-13 leading-[1.85]">{e.event}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* 出典 */}
            <section>
              <div className="mb-4 flex items-baseline gap-2.5">
                <h2 className="text-13 font-medium tracking-[0.02em]">出典</h2>
                <span className="label">SOURCES</span>
              </div>
              <ol className="max-w-[42rem] border-t border-line">
                {c.sources.map((s) => (
                  <li
                    key={s.label}
                    className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-3"
                  >
                    <span className="label pt-0.5">{s.label}</span>
                    <span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-13 leading-[1.8] underline decoration-line underline-offset-[3px] transition-colors hover:decoration-ink"
                      >
                        {s.title}
                      </a>
                      <span className="label mt-1 block">
                        {s.publisher}
                        {!s.confirmed && (
                          <span className="ml-2 !text-accent">
                            書誌のみ確認／本文未取得
                          </span>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="label mt-3 leading-[1.9]">
                事実の根拠と、画像の掲載権利は別に扱う。
                本CASEに実物の写真は掲載していない。
              </p>
            </section>

            {/* 編集上の注意 */}
            <section className="max-w-[42rem] bg-paper p-5 sm:p-6">
              <div className="mb-3 flex items-baseline gap-2.5">
                <h2 className="text-13 font-medium tracking-[0.02em]">
                  編集上の注意・未確認事項
                </h2>
                <span className="label">EDITORIAL NOTES</span>
              </div>
              <p className="whitespace-pre-line text-12 leading-[2] text-mute">
                {c.notes}
              </p>
            </section>

            <p className="label leading-[2]">
              情報が対立・不明の場合、その状態を隠さず公開する。
              訂正・追加情報は編集部まで。
            </p>
          </div>
        </div>

        {/* 前後 */}
        <nav className="mt-20 grid grid-cols-2 gap-4 border-t border-line pt-5">
          <Link href={`/case/${prev.slug}`} className="group">
            <span className="label transition-colors group-hover:!text-ink">
              ← CASE {prev.id}
            </span>
            <p className="mt-1 text-13 text-mute transition-colors group-hover:text-ink">
              {prev.titleJa}
            </p>
          </Link>
          <Link href={`/case/${next.slug}`} className="group text-right">
            <span className="label transition-colors group-hover:!text-ink">
              CASE {next.id} →
            </span>
            <p className="mt-1 text-13 text-mute transition-colors group-hover:text-ink">
              {next.titleJa}
            </p>
          </Link>
        </nav>
      </div>
    </main>
  );
}
