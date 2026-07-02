"use client";

import Link from "next/link";
import { StatusDot } from "@/components/LineageView";
import { UI, useLang } from "@/lib/i18n";
import { STATS, YEAR_MAX, YEAR_MIN, type Bi, type DisplayStatus } from "@/lib/meta";

/* ── About 専用コピー ──────────────────────────── */

const STATUS_GUIDE: { s: DisplayStatus; term: Bi; desc: Bi }[] = [
  {
    s: "OFFICIAL",
    term: { ja: "正式", en: "Official" },
    desc: {
      ja: "DSM-5-TR（米国精神医学会の診断マニュアル最新版）またはICD-11（WHOの国際疾病分類）に、正式な診断として収載されているもの。以前から定着しているものも、ゲーム障害（2019年・ICD-11）や複雑性PTSDのように近年昇格したばかりのものも含む。",
      en: "Diagnoses officially listed in DSM-5-TR (the American Psychiatric Association's manual) or ICD-11 (the WHO's international classification) — both long-established ones and recent arrivals like gaming disorder (ICD-11, 2019) and complex PTSD.",
    },
  },
  {
    s: "DISPUTED",
    term: { ja: "議論中", en: "Disputed" },
    desc: {
      ja: "正式な診断としては採用されていない概念。社会や研究で広く使われながら有効性が議論されているものと、特定の文化や地域と結びついて記述されてきた症候群（文化結合症候群）を含む。独立した病気なのか、他の状態の一部なのか、そもそも「病気」と呼ぶべきなのかが問われている。",
      en: "Concepts not officially adopted as diagnoses: ideas widely used but still debated, and syndromes described in connection with specific cultures (culture-bound syndromes). Whether they are independent illnesses, aspects of other conditions, or illnesses at all remains in question.",
    },
  },
  {
    s: "RETIRED",
    term: { ja: "廃止", en: "Retired" },
    desc: {
      ja: "かつて公式の診断として存在したが、その後の改訂で削除・改名され、使われなくなったもの。科学の進歩によって退場したものもあれば、当事者の運動や政治によって削除されたものもある。診断が固定的なものではないことの記録。",
      en: "Former official diagnoses that were later deleted or renamed. Some retired through scientific progress, others through activism and politics — a record that diagnoses are not fixed.",
    },
  },
];

const DSM_INTRO: Bi = {
  ja: "DSM（Diagnostic and Statistical Manual of Mental Disorders／精神疾患の診断・統計マニュアル）は、米国精神医学会（APA）が発行する診断基準集。何を精神疾患とし、何と呼ぶかを定める事実上の標準として世界中で参照されてきた。版が改まるたびに診断は追加・削除・改名されており、このアーカイブで扱う診断の昇格や「廃止」の多くはその改訂史の出来事にあたる。カード本文の「DSM-III（1980）」のような表記は、その出来事が起きた版と年を指す。",
  en: "The DSM (Diagnostic and Statistical Manual of Mental Disorders), published by the American Psychiatric Association, is the de facto standard that decides what counts as a mental disorder and what it is called. Each revision has added, deleted, and renamed diagnoses — most of the “promotions” and “retirements” in this archive are events in that revision history. Notations like “DSM-III (1980)” in the entries refer to the edition and year of the event.",
};

const DSM_EDITIONS: { name: string; year: number; note?: Bi }[] = [
  { name: "DSM-I", year: 1952, note: { ja: "初版", en: "First edition" } },
  { name: "DSM-II", year: 1968 },
  { name: "DSM-III", year: 1980, note: { ja: "症状の数で定義する操作的診断基準へ転換", en: "Shift to operational, symptom-count criteria" } },
  { name: "DSM-III-R", year: 1987 },
  { name: "DSM-IV", year: 1994 },
  { name: "DSM-5", year: 2013 },
  { name: "DSM-5-TR", year: 2022, note: { ja: "現行の本文改訂版", en: "Current text revision" } },
];

const ICD_INTRO: Bi = {
  ja: "ICD（International Classification of Diseases／国際疾病分類）は、WHOが定める全疾患の国際分類で、精神疾患の章を含む。現行のICD-11は2019年に採択され、2022年に発効した。ゲーム障害や複雑性PTSDは、DSMではなくこのICD-11で正式な診断となった。",
  en: "The ICD (International Classification of Diseases) is the WHO's classification of all diseases, including a chapter on mental disorders. The current ICD-11 was adopted in 2019 and came into effect in 2022 — gaming disorder and complex PTSD became official here, not in the DSM.",
};

const REFS_PRIMARY: string[] = [
  "American Psychiatric Association, Diagnostic and Statistical Manual of Mental Disorders, I–5-TR (1952–2022)",
  "World Health Organization, International Classification of Diseases, 11th Revision (2019/2022)",
];

const REFS_CITED: string[] = [
  "Samuel A. Cartwright, DeBow's Review (1851)",
  "Richard von Krafft-Ebing, Psychopathia Sexualis（性的精神病質, 1886）",
  "C. S. Myers, “A Contribution to the Study of Shell Shock,” The Lancet (1915)",
  "Robert Burton, The Anatomy of Melancholy（憂鬱の解剖, 1621）",
  "Ronald Bayer, Homosexuality and American Psychiatry (1981)",
  "Judith L. Herman, Trauma and Recovery（心的外傷と回復, 1992）",
  "Elaine N. Aron, The Highly Sensitive Person (1996)",
  "斎藤環『社会的ひきこもり』(1998)",
  "Allan V. Horwitz & Jerome C. Wakefield, The Loss of Sadness (2007)",
  "Aarseth et al., open letter on gaming disorder (2017)",
  "Arthur Kleinman による中国の神経衰弱研究",
];

const REFS_NOTE: Bi = {
  ja: "※ カード本文中で言及されている主な一次資料・文献です。",
  en: "Primary sources and works referenced in the entries.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] tracking-[0.25em] text-da-accent-text">
      <span className="mr-2">−</span>
      {children}
    </h2>
  );
}

export default function AboutContent() {
  const { lang, tx } = useLang();

  return (
    <div className="da-fade mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.3em] text-da-accent-text">ABOUT · {tx(UI.issue)}</p>
      <h1 className="font-mincho mt-4 text-4xl font-bold leading-snug sm:text-5xl">{tx(UI.aboutTitle)}</h1>
      <p className="font-mincho mt-6 text-base leading-[2] text-da-ink sm:text-lg">{tx(UI.aboutLead)}</p>

      {/* ステータスの読み方 */}
      <section className="mt-12 border-t-2 border-da-ink pt-5">
        <SectionLabel>{lang === "ja" ? "ステータスの読み方" : "How to read the statuses"}</SectionLabel>
        <dl className="mt-4">
          {STATUS_GUIDE.map((s) => (
            <div key={s.s} className="border-b da-hairline py-4">
              <dt className="flex items-center gap-2.5">
                <StatusDot s={s.s} />
                <span className="font-mincho text-[16px] font-bold">{tx(s.term)}</span>
              </dt>
              <dd className="mt-1.5 pl-[19px] text-[13.5px] leading-[1.9] text-da-muted">{tx(s.desc)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* DSMとは */}
      <section id="dsm-guide" className="mt-12 scroll-mt-24 border-t-2 border-da-ink pt-5">
        <SectionLabel>{lang === "ja" ? "DSMとは" : "What is the DSM?"}</SectionLabel>
        <p className="mt-3 text-[14px] leading-[1.9]">{tx(DSM_INTRO)}</p>
        <dl className="mt-5">
          {DSM_EDITIONS.map((e) => (
            <div key={e.name} className="flex items-baseline gap-4 border-b da-hairline py-3">
              <dt className="font-display w-28 shrink-0 text-[17px]">{e.name}</dt>
              <dd className="font-display text-[17px]">{e.year}</dd>
              {e.note && <dd className="ml-auto text-right text-[11.5px] leading-snug text-da-muted">{tx(e.note)}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {/* ICDとは */}
      <section id="icd-guide" className="mt-12 scroll-mt-24 border-t-2 border-da-ink pt-5">
        <SectionLabel>{lang === "ja" ? "ICDとは" : "What is the ICD?"}</SectionLabel>
        <p className="mt-3 text-[14px] leading-[1.9]">{tx(ICD_INTRO)}</p>
      </section>

      {/* 参考文献 */}
      <section className="mt-12 border-t-2 border-da-ink pt-5">
        <SectionLabel>{lang === "ja" ? "参考文献" : "References"}</SectionLabel>
        <ul className="mt-4">
          {[...REFS_PRIMARY, ...REFS_CITED].map((r) => (
            <li key={r} className="border-b da-hairline py-2.5 font-mincho text-[13.5px] leading-relaxed">
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-da-muted">{tx(REFS_NOTE)}</p>
      </section>

      {/* 収録データ */}
      <section className="mt-12 border-t-2 border-da-ink pt-5">
        <SectionLabel>{tx(UI.aboutData)}</SectionLabel>
        <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { n: STATS.entries, label: UI.statEntries },
            { n: STATS.statuses, label: UI.statStatuses },
            { n: `${YEAR_MIN}—${YEAR_MAX}`, label: UI.statYears },
            { n: STATS.regions, label: UI.statRegions },
          ].map((s) => (
            <div key={s.label.ja}>
              <dd className="font-display text-2xl italic sm:text-3xl">{s.n}</dd>
              <dt className="mt-1 font-mono text-[10px] tracking-[0.2em] text-da-muted">{tx(s.label)}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Link
        href="/"
        className="font-mincho mt-14 inline-block rounded-full bg-da-ink px-8 py-3 text-[15px] text-da-paper transition-opacity hover:opacity-85"
      >
        ← {tx(UI.backToIndex)}
      </Link>
    </div>
  );
}
