import Link from "next/link";
import BreakText from "@/components/BreakText";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlateCard from "@/components/PlateCard";
import AtlasControls from "@/components/AtlasControls";
import PlateImage from "@/components/PlateImage";
import { STYLES, STYLE_BY_SLUG } from "@/data/styles";

/** 帯に流す図版。強い絵を選んで、色が続けて似ないように並べる */
const STRIP = [
  "bauhaus", "risograph", "art-deco", "pixel-art", "swiss-style", "vaporwave",
  "wabi-sabi", "memphis", "russian-constructivism", "cyberpunk", "woodcut",
  "glassmorphism", "psychedelic", "japandi", "pop-art", "brutalism",
];

/** 表紙に置く2枚。奥と手前 */
const FRONT = ["bauhaus", "risograph"];

export default function Home() {
  const strip = STRIP.filter((s) => STYLE_BY_SLUG[s]);

  return (
    <>
      <Header />

      {/* ── 表紙 ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="shell hero__in">
        <div className="hero__col">
          <p className="label hero__kicker">
            80 design styles — one plate each
          </p>

          <h1 className="hero__title">
            <span className="hero__t1">STYLE</span>
            <span className="hero__t2">ATLAS</span>
          </h1>

          <div className="hero__lead">
            <p>
              <BreakText text="バウハウスから、ピクセルアート、リゾグラフ、Y2K まで。世界のデザインスタイル80種を、それぞれ一枚の図版にしました。" />
            </p>
            <p>
              <BreakText text="見て、選んで、そのまま画像生成のプロンプトにできます。「なんとなくおしゃれ」を、指定できる言葉に変えるための図鑑です。" />
            </p>
          </div>

          <div className="hero__acts">
            <a className="btn btn--fill" href="#atlas">
              図鑑を見る
              <em>{STYLES.length} styles</em>
            </a>
            <Link className="btn" href="/build">
              プロンプトを組む
              <em>Builder</em>
            </Link>
          </div>
        </div>

          {/* 机に置いた刷り物のように、2枚を重ねる。
              表紙の右が空くと、ただの大きい文字の看板に見えてしまう */}
          <div className="hero__plates" aria-hidden>
            {FRONT.map((slug, i) => (
              <span className={`hero__plate hero__plate--${i}`} key={slug}>
                <span className="plate-frame">
                  <PlateImage slug={slug} alt="" priority />
                </span>
                <span className="hero__cap">
                  <b>{STYLE_BY_SLUG[slug]?.ja ?? slug}</b>
                  <i>{STYLE_BY_SLUG[slug]?.en ?? ""}</i>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* 図版の帯。横に流して、中身を先に見せてしまう */}
        <div className="strip" aria-hidden>
          <div className="strip__run">
            {[...strip, ...strip].map((slug, i) => (
              <span className="strip__cell plate-frame" key={`${slug}-${i}`}>
                <PlateImage slug={slug} alt="" priority={i < 8} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 図鑑 ───────────────────────────────────────────────── */}
      <section className="atlas" id="atlas">
        <div className="shell">
          <div className="sec">
            <p className="label">The Atlas</p>
            <h2 className="sec__h">
              一目で、見比べる。
            </h2>
            <p className="sec__lead">
              <BreakText text="1スタイルにつき1枚。すべて、そのスタイルの作図規則から描き起こした固有の図版です。気になった一枚をひらくと、成り立ちと、そのまま使えるプロンプトが出ます。" />
            </p>
          </div>

          <AtlasControls total={STYLES.length} />

          <div className="grid" id="atlas-grid" data-filter="all">
            {STYLES.map((s) => (
              <PlateCard key={s.slug} style={s} />
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
