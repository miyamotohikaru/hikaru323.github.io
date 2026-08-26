import Link from "next/link";
import { PLATES } from "@/plates";
import { STYLE_NO } from "@/data/styles";
import { CATEGORY_LABEL, type DesignStyle } from "@/data/types";

/**
 * 図鑑の1枚。図版・通し番号・名前・年代・パレット。
 *
 * サーバで描く。80枚ぶんのSVGをクライアントに送ると、
 * 絞り込みのためだけに数百KBのJSを積むことになる。
 * 絞り込みは data-* 属性とCSSでやり、この部品はJSを持たない。
 */
export default function PlateCard({ style }: { style: DesignStyle }) {
  const Plate = PLATES[style.slug];
  const no = STYLE_NO[style.slug];

  return (
    <Link
      href={`/style/${style.slug}`}
      className="card"
      data-card
      data-cat={style.category}
      data-slug={style.slug}
      data-q={`${style.ja} ${style.en} ${style.slug} ${style.origin} ${style.era} ${style.tagline}`.toLowerCase()}
    >
      <div className="plate-frame card__plate" data-plate={style.slug}>
        {Plate ? <Plate /> : <PlatePending />}
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

/** 図版がまだ無いとき。空白を出すより「作っている」と分かるほうがよい */
function PlatePending() {
  return (
    <svg viewBox="0 0 600 800" role="img" aria-label="図版を準備中">
      <rect width="600" height="800" fill="var(--paper-deep)" />
      <g stroke="var(--rule)" strokeWidth="1">
        <line x1="0" y1="0" x2="600" y2="800" />
        <line x1="600" y1="0" x2="0" y2="800" />
      </g>
    </svg>
  );
}
