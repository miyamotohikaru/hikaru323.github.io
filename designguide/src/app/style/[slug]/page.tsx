import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromptBlock from "@/components/PromptBlock";
import Copy from "@/components/Copy";
import Jp from "@/components/Jp";
import { PLATES } from "@/plates";
import { STYLES, STYLE_BY_SLUG, STYLE_NO } from "@/data/styles";
import { CATEGORY_LABEL } from "@/data/types";
import { composeJa, composeEn } from "@/lib/prompt";

export function generateStaticParams() {
  return STYLES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = STYLE_BY_SLUG[slug];
  if (!s) return {};
  return {
    title: `${s.ja}（${s.en}）`,
    description: `${s.tagline}｜${s.era}・${s.origin}。図版・特徴・そのまま使える画像生成プロンプト。`,
  };
}

export default async function StylePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = STYLE_BY_SLUG[slug];
  if (!s) notFound();

  const Plate = PLATES[s.slug];
  const no = STYLE_NO[s.slug];
  const idx = STYLES.findIndex((x) => x.slug === s.slug);
  const prev = STYLES[(idx - 1 + STYLES.length) % STYLES.length];
  const next = STYLES[(idx + 1) % STYLES.length];
  const related = s.related.map((r) => STYLE_BY_SLUG[r]).filter(Boolean);

  const input = { style: s, subject: "", format: "poster" as const, mood: "none" as const, text: "" };
  const ja = composeJa(input);
  const en = composeEn(input);

  return (
    <>
      <Header />

      <main className="shell sty">
        {/* 見出し ------------------------------------------------------- */}
        <div className="sty__head">
          <Link href="/#atlas" className="sty__back">← 図鑑にもどる</Link>
          <div className="sty__meta">
            <span className="sty__no">{no}</span>
            <span className="sty__cat">{CATEGORY_LABEL[s.category].ja}</span>
          </div>
        </div>

        <div className="sty__top">
          {/* 図版 */}
          <figure className="sty__fig">
            <div className="plate-frame">{Plate ? <Plate /> : null}</div>
            <figcaption>
              図版：{s.ja}の作図規則から描き起こしたもの。実在の作品の複製ではありません。
            </figcaption>
          </figure>

          {/* 見出しと解説 */}
          <div className="sty__info">
            <h1 className="sty__ja">{s.ja}</h1>
            <p className="sty__en">{s.en}</p>
            <p className="sty__era">{s.era}　／　{s.origin}</p>

            <p className="sty__tag">{s.tagline}</p>
            <Jp text={s.description} className="sty__desc" />

            {/* 色 */}
            <div className="sty__pal">
              <p className="label">Palette</p>
              <ul>
                {s.palette.map((c) => (
                  <li key={c}>
                    <i style={{ background: c }} />
                    <Copy text={c} label={c.toUpperCase()} className="sty__hex" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 決め手と、やらないこと ---------------------------------------- */}
        {(s.traits.length > 0 || s.avoid.length > 0) && (
          <div className="sty__two">
            {s.traits.length > 0 && (
              <section>
                <p className="label">見た目の決め手</p>
                <ul className="sty__list">
                  {s.traits.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </section>
            )}
            {s.avoid.length > 0 && (
              <section>
                <p className="label">やると崩れること</p>
                <ul className="sty__list sty__list--no">
                  {s.avoid.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* プロンプト ---------------------------------------------------- */}
        <section className="sty__prompt">
          <div className="sec">
            <p className="label">Prompt</p>
            <h2 className="sec__h">この様式で、描かせる。</h2>
            <p className="sec__lead">
              比率・色・技法・禁止事項まで書き出した仕様書です。そのまま貼って送れます。
              <br />
              主題を自分のものに差し替えたいときは、
              <Link href={`/build?style=${s.slug}`} className="link">プロンプトを組む</Link>
              から作れます。
            </p>
          </div>
          <PromptBlock ja={ja} en={en} />
        </section>

        {/* 近いもの ------------------------------------------------------ */}
        {related.length > 0 && (
          <section className="sty__rel">
            <p className="label">近いもの</p>
            <div className="sty__relgrid">
              {related.map((r) => {
                const RP = PLATES[r.slug];
                return (
                  <Link key={r.slug} href={`/style/${r.slug}`} className="card">
                    <div className="plate-frame card__plate">{RP ? <RP /> : null}</div>
                    <div className="card__body">
                      <h3 className="card__ja">{r.ja}</h3>
                      <p className="card__en">{r.en}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 前後 ---------------------------------------------------------- */}
        <nav className="sty__pn">
          <Link href={`/style/${prev.slug}`}>
            <em>← {STYLE_NO[prev.slug]}</em>
            <b>{prev.ja}</b>
          </Link>
          <Link href={`/style/${next.slug}`} className="sty__pn--next">
            <em>{STYLE_NO[next.slug]} →</em>
            <b>{next.ja}</b>
          </Link>
        </nav>
      </main>

      <Footer />
    </>
  );
}
