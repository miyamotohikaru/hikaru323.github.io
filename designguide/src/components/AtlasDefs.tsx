/**
 * 図版80枚が共有する <defs>。ページに1回だけ置く。
 *
 * feTurbulence と <pattern> は重い。80枚それぞれに持たせると、
 * 一覧ページで描画が目に見えて落ちる。SVG の id は文書ぜんたいで
 * 一意なので、ここで一度定義すれば、どの図版からでも引ける。
 *
 * ■ 2種類ある。使い分けを間違えると何も出ない
 *   ・「発生させる」フィルタ（grain / grainCoarse / fibre）
 *       入力を捨ててノイズだけを出す。板を1枚かぶせて使う。
 *         <rect width="600" height="800"
 *               filter={`url(#${ATLAS.grain})`}
 *               opacity="0.14"
 *               style={{ mixBlendMode: "multiply" }} />
 *   ・「かける」フィルタ（bleed / rough）
 *       入力の輪郭を歪ませる。対象の <g> に直接かける。
 *         <g filter={`url(#${ATLAS.rough})`}> … </g>
 */
import { ATLAS } from "@/lib/plate";

export default function AtlasDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ── 発生させる側 ────────────────────────────────────────── */}

        {/* 紙の目。細かい。上質紙・コート紙 */}
        <filter id={ATLAS.grain} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.7" intercept="0.3" />
            <feFuncG type="linear" slope="0.7" intercept="0.3" />
            <feFuncB type="linear" slope="0.7" intercept="0.3" />
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
        </filter>

        {/* ざら紙。わら半紙・再生紙・画用紙。粒が見える */}
        <filter id={ATLAS.grainCoarse} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.36" numOctaves="4" seed="19" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.95" intercept="0.18" />
            <feFuncG type="linear" slope="0.95" intercept="0.18" />
            <feFuncB type="linear" slope="0.95" intercept="0.18" />
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
        </filter>

        {/* 紙の繊維。横に伸びた粗い目。和紙・厚紙 */}
        <filter id={ATLAS.fibre} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.55" numOctaves="3" seed="31" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.8" intercept="0.25" />
            <feFuncG type="linear" slope="0.8" intercept="0.25" />
            <feFuncB type="linear" slope="0.8" intercept="0.25" />
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
        </filter>

        {/* ── かける側 ────────────────────────────────────────────── */}

        {/* インクのにじみ。輪郭をわずかに食わせる */}
        <filter id={ATLAS.bleed} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* 版のかすれ。孔版・木版・シルクの輪郭 */}
        <filter id={ATLAS.rough} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="turbulence" baseFrequency="0.075" numOctaves="4" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* ── 網 ─────────────────────────────────────────────────── */}

        {/* 網点。45度に振った古典的なスクリーン。fill に使う */}
        <pattern id={ATLAS.halftone} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="4" cy="4" r="2.4" fill="#000" />
        </pattern>
        <pattern id={ATLAS.halftoneFine} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="2" cy="2" r="1.1" fill="#000" />
        </pattern>

        {/* 走査線。ブラウン管 */}
        <pattern id={ATLAS.scanlines} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="1.4" fill="#000" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}
