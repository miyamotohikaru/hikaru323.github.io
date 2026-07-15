import Link from "next/link";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { jobs, jobByNo, statusMeta, causeLabel } from "@/data/jobs";
import { details } from "@/data/details";
import { lineageChains } from "@/data/lineage";

export function generateStaticParams() {
  return jobs.map((j) => ({ no: j.no }));
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 flex items-center gap-4 text-sm font-bold tracking-[0.4em]">
      {children}
      <span className="h-px flex-1 bg-vja-line" />
    </h2>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-vja-line bg-vja-paper px-4 py-1.5 text-xs tracking-wider">
      {children}
    </span>
  );
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const job = jobByNo.get(no);
  if (!job) notFound();

  const detail = details[no];
  const meta = statusMeta[job.status];
  const idx = jobs.findIndex((j) => j.no === no);
  const prev = jobs[idx - 1];
  const next = jobs[idx + 1];
  const chain = job.lineageId
    ? lineageChains.find((c) => c.id === job.lineageId)
    : undefined;
  const related = jobs
    .filter((j) => j.no !== no && j.category === job.category)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="font-mono-label text-[11px] tracking-[0.2em] text-vja-ink-soft">
        <Link href="/" className="hover:text-vja-ink">
          索引
        </Link>{" "}
        / NO.{job.no} {job.name}
      </p>

      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-14">
        {/* 左：カード */}
        <div>
          <div className="md:sticky md:top-20">
            <div className="mx-auto max-w-[340px] rotate-[-1.2deg]">
              <JobCard job={job} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              {prev ? (
                <Link
                  href={`/jobs/${prev.no}`}
                  className="rounded-full border border-vja-line bg-vja-paper px-5 py-1.5 text-xs tracking-[0.2em] hover:border-vja-ink"
                >
                  ◀ NO.{prev.no}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/jobs/${next.no}`}
                  className="rounded-full bg-vja-ink px-5 py-1.5 text-xs tracking-[0.2em] text-vja-cream hover:opacity-85"
                >
                  NO.{next.no} ▶
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 右：記録 */}
        <article>
          <p className="font-mono-label text-[11px] tracking-[0.3em] text-vja-ink-soft">
            RECORD NO.{job.no} · {job.category}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[0.15em] md:text-5xl">
            {job.name}
          </h1>
          <p className="font-mono-label mt-3 text-xs tracking-[0.2em] text-vja-ink-soft">
            {detail?.reading ? `${detail.reading} / ` : ""}
            <span className="uppercase">{job.en}</span>
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-4 py-1.5 text-xs tracking-wider ${
                job.status === "extinct"
                  ? "border-vja-accent text-vja-accent"
                  : job.status === "ongoing"
                    ? "border-vja-blue text-vja-blue"
                    : "border-vja-ink-soft text-vja-ink"
              }`}
            >
              {meta.mark}
              {meta.label}
            </span>
            {job.endLabel && <Chip>{job.endLabel}</Chip>}
            <Chip>{job.region}</Chip>
            {job.causeAll.map((c) => (
              <Chip key={c}>{causeLabel(c)}</Chip>
            ))}
          </div>

          {/* 要約 */}
          <div className="mt-8 border-l-2 border-vja-accent pl-5">
            <p className="font-mono-label text-[10px] tracking-[0.4em] text-vja-ink-soft">
              要約
            </p>
            <p className="mt-2 leading-relaxed">{detail?.summary ?? job.summary}</p>
          </div>

          {detail ? (
            <>
              <SectionTitle>しごとの中身</SectionTitle>
              {detail.body.map((p, i) => (
                <p key={i} className="mt-4 leading-loose">
                  {p}
                </p>
              ))}

              <p className="font-mono-label mt-8 text-[10px] tracking-[0.4em] text-vja-ink-soft">
                道具
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.tools.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>

              <SectionTitle>
                {job.status === "ongoing" ? "きえていくわけ（進行中）" : "きえたわけ"}
              </SectionTitle>
              <ul className="mt-5 space-y-4">
                {detail.timeline.map((t, i) => (
                  <li key={i} className="flex items-baseline gap-4">
                    <span
                      className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
                        i === detail.timeline.length - 1
                          ? "bg-vja-accent"
                          : "bg-vja-ink-soft"
                      }`}
                    />
                    <p className="leading-relaxed">
                      <span className="font-logo font-bold">{t.year}</span>
                      <span className="mx-2">—</span>
                      {t.text}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 leading-loose">{detail.timelineClose}</p>

              <div className="mt-10 rounded-lg bg-vja-paper p-6">
                <p className="font-mono-label text-[10px] tracking-[0.4em] text-vja-ink-soft">
                  豆ちしき
                </p>
                <p className="mt-3 leading-loose">{detail.trivia}</p>
              </div>
            </>
          ) : (
            <div className="mt-10 rounded-lg border border-dashed border-vja-blue p-6 text-center">
              <p className="text-sm tracking-wider text-vja-blue">
                この項目の記録は、まだ書きかけです。
              </p>
              <p className="mt-2 text-xs text-vja-ink-soft">
                活動期: {job.activeYears || "—"} ／ 消滅期: {job.endYear || "—"}
              </p>
            </div>
          )}

          {/* この仕事の系譜 */}
          {(chain || job.successor) && (
            <>
              <p className="font-mono-label mt-10 text-[10px] tracking-[0.4em] text-vja-ink-soft">
                この仕事の系譜
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
                {chain ? (
                  chain.nodes.map((n, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-vja-ink-soft">→</span>}
                      {n.no === job.no ? (
                        <span className="rounded bg-vja-ink px-3 py-1.5 text-xs tracking-wider text-vja-cream">
                          {n.label}
                        </span>
                      ) : n.no ? (
                        <Link
                          href={`/jobs/${n.no}`}
                          className={`rounded px-3 py-1.5 text-xs tracking-wider ${
                            n.ongoing
                              ? "border border-dashed border-vja-blue text-vja-blue"
                              : "border border-vja-line bg-vja-paper hover:border-vja-ink"
                          }`}
                        >
                          {n.label}
                          {n.ongoing ? " ▲" : ""}
                        </Link>
                      ) : (
                        <span className="rounded px-2 py-1.5 text-xs italic tracking-wider text-vja-ink-soft">
                          {n.label}
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-sm leading-relaxed text-vja-ink-soft">
                    {job.name} → {job.successor}
                  </p>
                )}
              </div>
            </>
          )}
        </article>
      </div>

      {/* おなじ時代に消えたなかま */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-vja-line pt-8">
          <p className="font-mono-label text-[10px] tracking-[0.4em] text-vja-ink-soft">
            おなじ時代に消えたなかま
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.no}
                href={`/jobs/${r.no}`}
                className="flex items-center gap-4 rounded-lg px-5 py-4 transition-transform hover:-translate-y-0.5"
                style={{ background: r.color, color: r.textColor }}
              >
                <div>
                  <p className="text-sm font-bold tracking-wider">{r.name}</p>
                  <p className="mt-1 text-[11px] opacity-85">
                    {statusMeta[r.status].mark}
                    {statusMeta[r.status].label} {r.endLabel}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
