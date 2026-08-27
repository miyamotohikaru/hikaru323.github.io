import { BAKED } from "@/plates/baked";

/**
 * 一覧に出す図版。焼いた静止画を貼る。
 *
 * 本物のSVGは1枚あたり要素が数百〜千数百個ある。80枚を一覧に並べたとき、
 * HTMLが11MB・SVG要素が4万個になり、初期表示が3秒を超えた（実測）。
 * 一覧では原寸で見ないので、ベクターである必要がない。
 * 詳細ページ（/style/[slug]）だけ本物のSVGを出している。
 *
 * ここでは PLATES を読み込まない。読み込むと、一覧の頁が
 * 図版80枚ぶんのモジュールを抱えることになる（表示には使わないのに）。
 */
export default function PlateImage({
  slug,
  alt,
  priority = false,
}: {
  slug: string;
  alt: string;
  /** 表紙など、最初に見える所だけ true。それ以外は遅延で読む */
  priority?: boolean;
}) {
  if (!BAKED.has(slug)) return <PlatePending />;
  return (
    <img
      src={`/plates/${slug}.webp`}
      width={486}
      height={648}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

/** 図版がまだ無いとき。空白より「作っている」と分かるほうがよい */
export function PlatePending() {
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
