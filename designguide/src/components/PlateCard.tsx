import Link from "next/link";
import PlateImage from "./PlateImage";
import { STYLE_NO } from "@/data/styles";
import { MOOD_WORDS } from "@/data/moods";
import { CATEGORY_LABEL, type DesignStyle } from "@/data/types";

/**
 * 図鑑の1枚。図版・通し番号・名前・年代・パレット。
 *
 * サーバで描き、JSを持たない。絞り込みは data-* 属性とCSSで行う。
 */
export default function PlateCard({ style }: { style: DesignStyle }) {
  const no = STYLE_NO[style.slug];

  return (
    <Link
      href={`/style/${style.slug}`}
      className="card"
      data-card
      data-hit="1"
      data-cat={style.category}
      data-slug={style.slug}
      /* 様式名を知らない人は「サブカル」「レトロ」で探す。
         気分の語も索引に混ぜておかないと、名前を知る人しか使えない道具になる */
      data-q={`${style.ja} ${style.en} ${style.slug} ${style.origin} ${style.era} ${style.tagline} ${(MOOD_WORDS[style.slug] ?? []).join(" ")}`.toLowerCase()}
    >
      <div className="plate-frame card__plate">
        <PlateImage slug={style.slug} alt={`${style.ja}様式の図版`} />
      </div>

      <div className="card__body">
        <div className="card__row">
          <span className="card__no">{no}</span>
          <span className="card__cat">{CATEGORY_LABEL[style.category].ja}</span>
        </div>
        <h3 className="card__ja">{style.ja}</h3>
        <p className="card__en">{style.en}</p>
        <p className="card__era">{style.era}／{style.origin}</p>
        <div className="card__pal" aria-hidden>
          {style.palette.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </div>
      </div>
    </Link>
  );
}
