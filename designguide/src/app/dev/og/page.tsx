/**
 * 共有時に出る絵（1200×630）の版下。
 * ここを tools/shoot.mjs で撮って public/og.png に置く。
 * ImageResponse（Satori）だと使える CSS が限られるので、
 * 普通の頁として組んでブラウザに描かせている。
 */
import PlateImage from "@/components/PlateImage";
import { STYLE_BY_SLUG } from "@/data/styles";

const SHOWN = ["bauhaus", "risograph", "art-deco", "vaporwave", "woodcut", "memphis"];

export const metadata = { title: "OG版下" };

export default function OgPage() {
  return (
    <div id="og">
      <div className="og__l">
        <p className="og__kick">80 DESIGN STYLES — ONE PLATE EACH</p>
        <h1 className="og__t">
          <span>STYLE</span>
          <span>ATLAS<i>80</i></span>
        </h1>
        <p className="og__lead">
          デザインスタイル80種を、それぞれ一枚の図版で。
          <br />
          見て、選んで、そのまま画像生成のプロンプトにできる図鑑。
        </p>
      </div>
      <div className="og__r">
        {SHOWN.filter((s) => STYLE_BY_SLUG[s]).map((s, i) => (
          <span className="og__p" key={s} style={{ ["--i" as string]: i }}>
            <span className="plate-frame">
              <PlateImage slug={s} alt="" priority />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
