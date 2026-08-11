import {
  closing,
  concept,
  credit,
  details,
  faq,
  forms,
  legal,
  site,
} from "@/lib/lot";
import { Bracket } from "./Bracket";
import { Reveal } from "./Reveal";

/* 作品名は途中で折らせない。全角空白5個の真ん中で折れると「」だけが行頭に残る */
function LotName() {
  return <span className="whitespace-nowrap">{site.title}</span>;
}

/* ［　］で囲まれた未確定の箇所を、目で拾えるようにしておく */
function withPlaceholders(text: string) {
  return text.split(/(［[^］]*］|「　　　　　」)/g).map((part, i) => {
    if (part === site.title) return <LotName key={i} />;
    if (part.startsWith("［"))
      return (
        <span
          key={i}
          title="未確定の項目"
          className="text-ink/52 [border-bottom:1px_dotted_var(--rule-firm)]"
        >
          {part}
        </span>
      );
    return <span key={i}>{part}</span>;
  });
}

function SectionHead({
  children,
  lead,
}: {
  children: React.ReactNode;
  lead?: string;
}) {
  return (
    <Reveal>
      <hr className="rule mb-6 w-14 border-t-[var(--rule-firm)]" />
      <h2 className="heading">{children}</h2>
      {lead && <p className="prose-jp mt-6 max-w-[var(--measure)]">{lead}</p>}
    </Reveal>
  );
}

/** 参考デザインどおり、入札のすぐ後に一枚。数字のあとに目を休ませる */
export function LotPlate() {
  return (
    <section className="page pb-[var(--gap-major)]">
      <Reveal>
        <figure className="plate mx-auto aspect-[4/3] max-w-[54rem]">
          <img
            src="/img/lot-plinth-1600.webp"
            alt="台座の上に置かれた、つや消し銀のかたち"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover [object-position:50%_46%]"
          />
        </figure>
      </Reveal>
    </section>
  );
}

export function Concept() {
  return (
    <section id="concept" className="bg-sheet">
      <div className="page py-[var(--gap-major)]">
        <SectionHead>{concept.heading}</SectionHead>
        {/* 2段に割ると1段26字になり、行末に「ん。」だけが落ちる。単段45字で組む */}
        <div className="mt-12 max-w-[var(--measure)] space-y-9 md:mt-[4.5rem] md:space-y-12">
          {concept.paragraphs.map((block, i) => (
            <Reveal key={i} delay={i * 110}>
              <p className="prose-jp">
                {block.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 変形の連続。
 * 幅を元データの実寸に比例させているので、5点が同じ縮尺で並ぶ。
 * 「用途が決まっていない」は、ここでだけ文章でなく物として示される。
 */
export function Forms() {
  return (
    <section className="page py-[var(--gap-major)]">
      <SectionHead lead={forms.lead}>{forms.heading}</SectionHead>

      <Reveal delay={120}>
        <ol className="mt-14 flex items-stretch gap-4 overflow-x-auto pb-2 md:mt-20 md:gap-7 md:overflow-visible">
          {forms.items.map((item) => (
            <li
              key={item.no}
              // flex-grow を実寸に比例させると、並べたときの大小がそのまま実物の比になる
              style={{ flex: `${item.w} 1 0%` }}
              className="flex min-w-[7.5rem] shrink-0 flex-col md:min-w-0 md:shrink"
            >
              {/* 像は上下中央、番号は5点で同じ高さに揃える */}
              <div className="flex flex-1 items-center">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="cutout w-full"
                />
              </div>
              <span className="num mt-6 block text-[0.6875rem] tracking-[0.2em] text-ink/68">
                {item.no}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>

      <p className="label-jp mt-8">{forms.note}</p>
    </section>
  );
}

export function Details() {
  const [first, second] = details.plates;
  return (
    <section className="bg-ground-lift">
      <div className="page py-[var(--gap-major)]">
        <SectionHead>{details.heading}</SectionHead>

        {/* 同寸で並べると互いを殺す。大小と縦位置をずらして主従をつける */}
        <div className="mt-12 md:mt-[4.5rem]">
          <Reveal>
            <figure className="w-full md:w-[72%]">
              <div className="plate aspect-[14/9]">
                <img
                  src={`${first.src}-1400.webp`}
                  alt={first.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 flex items-baseline gap-3">
                <span className="num label">{first.no}</span>
                <span className="text-[0.8125rem] font-light tracking-[0.1em] text-ink/82">
                  {first.title}
                  <span className="mx-2 text-[var(--sep)]">／</span>
                  {first.sub}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={140}>
            <figure className="mt-12 ml-auto w-full md:-mt-16 md:w-[44%]">
              <div className="plate aspect-[4/5]">
                <img
                  src={`${second.src}-1400.webp`}
                  alt={second.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 flex items-baseline gap-3">
                <span className="num label">{second.no}</span>
                <span className="text-[0.8125rem] font-light tracking-[0.1em] text-ink/82">
                  {second.title}
                  <span className="mx-2 text-[var(--sep)]">／</span>
                  {second.sub}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Credit() {
  return (
    <section className="bg-sheet">
      <div className="page pt-[var(--gap-major)] pb-[var(--gap-minor)]">
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,7rem)_1fr] md:gap-14">
          <Reveal>
            {/* このページで唯一の有彩色にしない。署名の大きさまで落とす */}
            <img
              src="/img/kosukuma-900.webp"
              alt="こす・くまのキャラクター"
              loading="lazy"
              decoding="async"
              className="w-[5rem] opacity-90 grayscale md:w-full"
            />
          </Reveal>
          <Reveal delay={110}>
            <p className="label-jp">{credit.label}</p>
            <p className="mt-4 text-[clamp(1.0625rem,0.85rem+0.8vw,1.5rem)] font-light leading-[1.6] tracking-[0.07em]">
              {credit.names[0]} <span className="mx-1 text-[var(--sep)]">×</span>
              <br className="hidden sm:block" />
              {credit.names[1]}
            </p>
            <p className="prose-jp mt-7 max-w-[var(--measure)]">
              {credit.body.map((line) => (
                <span key={line} className="block">
                  {withPlaceholders(line)}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="details" className="bg-sheet">
      <div className="page pt-[var(--gap-minor)] pb-[var(--gap-major)]">
        <SectionHead>{faq.heading}</SectionHead>
        {/* 罫の右端を組みの右端に揃える（20rem + 3.5rem + 36rem） */}
        <dl className="mt-12 max-w-[59.5rem] border-t border-[var(--rule)] md:mt-[4.5rem]">
          {faq.items.map((item, i) => (
            <Reveal
              key={item.q}
              delay={i * 70}
              className="grid items-baseline gap-3 border-b border-[var(--rule)] py-8 md:grid-cols-[minmax(0,20rem)_minmax(0,36rem)] md:gap-14"
            >
              <dt className="text-[0.9375rem] font-medium leading-[1.95] tracking-[0.05em]">
                {item.q}
              </dt>
              <dd className="prose-jp">{withPlaceholders(item.a)}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * 締め。始まりと同じポスターで閉じる。
 * 文言はキービジュアルに刷られている四行そのまま。
 */
export function Closing() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--rule)]">
      <div className="page relative flex min-h-[86svh] flex-col justify-center py-[var(--gap-major)]">
        <Reveal className="relative z-10 max-w-[30rem]">
          <Bracket gap={8} className="w-[min(21rem,80%)] text-ink" />
          <div className="prose-jp mt-12 space-y-[0.35em]">
            {closing.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 flex justify-center md:hidden">
          <img
            src="/img/form-close.webp"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="cutout w-[62%]"
          />
        </div>
      </div>

      <img
        src="/img/form-close.webp"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="cutout pointer-events-none absolute right-[8%] top-1/2 hidden
                   w-[min(28vw,23rem)] -translate-y-1/2 md:block"
      />
      <p
        className="vertical font-mincho pointer-events-none absolute hidden lg:block
                   right-[var(--spacing-gutter)] top-1/2 -translate-y-1/2
                   text-[0.9375rem] font-light tracking-[0.12em] text-ink/72"
      >
        {site.tagline}
      </p>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--rule)]">
      <div className="page flex flex-col gap-7 py-10 pb-28 md:flex-row md:items-center md:justify-between md:pb-24">
        <p className="label">{site.copyright}</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <nav
            aria-label="規約"
            className="flex flex-col gap-3 md:flex-row md:items-center md:gap-7"
          >
            {legal.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-ul w-fit text-[0.8125rem] font-light tracking-[0.06em] text-ink/78 transition-colors duration-500 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <span className="label-jp">
            {site.lotKind} {site.lotLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
