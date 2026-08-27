/**
 * ドリームコア。
 *
 * ■ リミナルスペースと隣り合うが、方向が逆
 *   あちらは「現実そのものが、人が居ないだけで怖い」。
 *   こちらは「現実の物が、間違った場所にあって甘い」。
 *   だから遠近法は使うが、辻褄を合わせない。
 *   空に扉が立ち、階段は水の上を昇り、月が2つある。
 *
 * ■ 甘さと不穏の配合
 *   輪郭をぼかす。ぼけた絵は「思い出そうとしている」ように見える。
 *   ただし全部ぼかすと、ただの下手な絵になるので、
 *   扉と階段だけは輪郭を残して、そこに焦点があることにした。
 *
 * ■ 水面を置く理由
 *   足元が反射していると、上下がどちらか分からなくなる。
 *   夢の中で「立っている感じがしない」のは、たぶんこれ。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "dream";

const NIGHT = "#1a1030";
const LILAC = "#8a6bd6";
const ROSE = "#f2a7d8";
const AQUA = "#7be0e8";
const CREAM = "#f5efe0";

const WATER = 596; // 水面

export default function Plate() {
  const r = rand(20210617);

  /* 無限階段。1段ごとに蹴上げと踏面を作り、踏面の奥の角を次の段の起点にする。
     奥へ行くほど s で縮めると、昇りきらないまま小さくなって消える */
  const steps: { riser: string; tread: string; edge: [number, number, number, number] }[] = [];
  {
    let x = 126, y = 606;
    for (let i = 0; i < 18; i++) {
      const s2 = 1 / (1 + i * 0.088);
      const ax = 23 * s2, ay = -11.5 * s2; // 踏み込み（奥へ）
      const bx = 13 * s2, by = 6.4 * s2;   // 段の幅方向
      const W = 9;
      const rise = 21 * s2;
      const p2x = x + bx * W, p2y = y + by * W;
      steps.push({
        riser: `${x},${y} ${p2x},${p2y} ${p2x},${p2y - rise} ${x},${y - rise}`,
        tread: `${x},${y - rise} ${p2x},${p2y - rise} ${p2x + ax},${p2y - rise + ay} ${x + ax},${y - rise + ay}`,
        edge: [x, y - rise, p2x, p2y - rise],
      });
      x += ax;
      y += ay - rise;
    }
  }

  /* 星と塵。上ほど密に */
  const dust = Array.from({ length: 90 }, () => ({
    x: r(0, 600), y: r(0, 780), s: r(0.7, 2.6), o: r(0.15, 0.9),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ドリームコア様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-below`}><rect y={WATER} width="600" height={800 - WATER} /></clipPath>

        {/* 空。薄紫→桃→水色。夜だが暗くしない。夢は明るい */}
        <linearGradient id={`${P}-sky`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#2a1a52" />
          <stop offset="0.34" stopColor="#6b4bb0" />
          <stop offset="0.62" stopColor="#c88ad4" />
          <stop offset="0.82" stopColor={ROSE} />
          <stop offset="1" stopColor="#ffd9e8" />
        </linearGradient>
        <linearGradient id={`${P}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd2e6" />
          <stop offset="0.3" stopColor="#b98ed8" />
          <stop offset="1" stopColor="#2c1a52" />
        </linearGradient>
        <radialGradient id={`${P}-moon`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor={CREAM} />
          <stop offset="1" stopColor="#e6d2ee" />
        </radialGradient>
        <radialGradient id={`${P}-halo`}>
          <stop offset="0.3" stopColor={CREAM} stopOpacity="0.55" />
          <stop offset="1" stopColor={AQUA} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${P}-door`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#fff8e8" />
          <stop offset="0.55" stopColor={CREAM} />
          <stop offset="1" stopColor="#d8c8b0" />
        </linearGradient>
        <linearGradient id={`${P}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.45" stopColor={AQUA} stopOpacity="0.55" />
          <stop offset="1" stopColor={AQUA} stopOpacity="0" />
        </linearGradient>
        {/* 扉の中。ここだけ別の世界の光が漏れる */}
        <linearGradient id={`${P}-inside`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor={AQUA} />
          <stop offset="1" stopColor="#4fd0e0" />
        </linearGradient>

        <filter id={`${P}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${P}-blur2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${P}-glow`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* 月が2つ。1つだと風景になる。2つだと夢になる */}
        <g>
          <circle cx="152" cy="176" r="140" fill={`url(#${P}-halo)`} opacity="0.7" />
          <circle cx="152" cy="176" r="62" fill={`url(#${P}-moon)`} />
          <g opacity="0.16" fill="#8a7ba8">
            <circle cx="136" cy="160" r="13" /><circle cx="170" cy="192" r="8" /><circle cx="146" cy="200" r="6" />
          </g>
          <circle cx="470" cy="118" r="86" fill={`url(#${P}-halo)`} opacity="0.5" />
          <circle cx="470" cy="118" r="31" fill={`url(#${P}-moon)`} opacity="0.9" />
        </g>

        {/* 雲。柔らかい塊をぼかして重ねる。輪郭を残すと現実になる */}
        <g filter={`url(#${P}-blur)`}>
          {[
            { x: 300, y: 300, rx: 190, ry: 40, c: "#ffd8ea", o: 0.5 },
            { x: 110, y: 372, rx: 150, ry: 30, c: "#c9a8ea", o: 0.55 },
            { x: 480, y: 250, rx: 130, ry: 26, c: "#ffe4f2", o: 0.45 },
            { x: 360, y: 430, rx: 210, ry: 34, c: "#e8c4ee", o: 0.4 },
          ].map((c, i) => (
            <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill={c.c} opacity={c.o} />
          ))}
        </g>

        {/* ── 水面。上下を分からなくするための面 ─────────────────── */}
        <rect y={WATER} width="600" height={800 - WATER} fill={`url(#${P}-sea)`} />
        <g clipPath={`url(#${P}-below)`}>
          {/* 月の映り */}
          <g filter={`url(#${P}-blur2)`} opacity="0.55">
            {Array.from({ length: 15 }, (_, i) => {
              const y = WATER + 6 + i * 13;
              const w = 40 + i * 7;
              return <rect key={i} x={152 - w / 2 + r(-10, 10)} y={y} width={w} height={r(2.5, 5)} rx="2" fill={CREAM} opacity={0.7 - i * 0.04} />;
            })}
          </g>
          <g fill="#ffffff" opacity="0.3">
            {Array.from({ length: 30 }, (_, i) => (
              <rect key={i} x={r(-20, 560)} y={WATER + 8 + r(0, 190)} width={r(20, 92)} height="1.8" rx="1" opacity={r(0.2, 0.7)} />
            ))}
          </g>
          <rect y={WATER} width="600" height="4" fill="#ffe8f4" opacity="0.7" />
        </g>

        {/* ── 階段の映り。水面で反転させると、上下が決まらなくなる ── */}
        <g clipPath={`url(#${P}-below)`} opacity="0.3" filter={`url(#${P}-blur2)`}>
          <g transform={`translate(0 ${WATER * 2}) scale(1 -1)`}>
            {steps.slice(0, 7).map((st, i) => (
              <g key={i} opacity={1 - i * 0.13}>
                <polygon points={st.riser} fill="#a888d4" />
                <polygon points={st.tread} fill="#f0dcf4" />
              </g>
            ))}
          </g>
        </g>

        {/* ── 無限階段。水の上を昇り、途中で消える ─────────────── */}
        <g>
          {steps.map((st, i) => (
            <g key={i} opacity={1 - Math.pow(i / 18, 2.4) * 0.5}>
              <polygon points={st.riser} fill="#a888d4" />
              <polygon points={st.tread} fill="#f2e0f6" />
              <line x1={st.edge[0]} y1={st.edge[1]} x2={st.edge[2]} y2={st.edge[3]}
                    stroke="#7a5cc0" strokeWidth="0.9" opacity="0.45" />
            </g>
          ))}
        </g>

        {/* ── 空に立つ扉。版面の主。少しだけ開けて別の光を漏らす ───── */}
        <g transform="translate(376 246)">
          {/* 落ちる光。扉から手前へ伸ばすと、扉が「開いている」ことになる */}
          <g filter={`url(#${P}-blur)`} opacity="0.85">
            <path d="M70 20 L118 14 L236 372 L20 388 Z" fill={`url(#${P}-beam)`} />
          </g>
          {/* 枠 */}
          <rect x="-8" y="-10" width="140" height="252" rx="3" fill="#c9b49a" />
          <rect x="-4" y="-6" width="132" height="248" rx="2" fill={`url(#${P}-door)`} />
          {/* 開いた口 */}
          <rect x="66" y="6" width="54" height="230" fill="#150c28" />
          <rect x="66" y="6" width="54" height="230" fill={`url(#${P}-inside)`} opacity="0.95" />
          {/* 向こう側の地平線と、そこに立つもう一枚の扉。
              検分で直したところ：地面と空が同じ水色で、地平線が
              ただの分割線に見え、奥の扉も宙に浮いた札に見えていた。
              地面を明るい側へ振り、扉に枠と影を付けて「立たせた」。
              さらに小さい扉をもう1枚置く。この向こうにも同じ景色が
              続いている、というのがドリームコアの怖さの中身 */}
          <rect x="66" y="150" width="54" height="86" fill="#dff7f0" opacity="0.95" />
          <rect x="66" y="206" width="54" height="30" fill="#b6e4e2" opacity="0.55" />
          <rect x="66" y="148" width="54" height="2.4" fill="#ffffff" opacity="0.95" />
          {/* 奥の扉。枠・隙間・影の3つが揃って初めて扉に見える */}
          <rect x="87" y="119" width="15" height="31" fill="#b9a382" />
          <rect x="88" y="120" width="13" height="30" fill="#e8dcc4" />
          <rect x="97" y="121" width="3" height="29" fill="#3b2f4a" opacity="0.8" />
          <rect x="88" y="150" width="17" height="1.6" fill="#8fa8a6" opacity="0.6" />
          {/* もっと奥の扉。この先も同じ景色が続いている */}
          <rect x="107" y="136" width="7" height="14" fill="#d8cbb2" />
          <rect x="111.5" y="137" width="1.6" height="13" fill="#3b2f4a" opacity="0.7" />
          <rect x="107" y="150" width="8" height="1" fill="#8fa8a6" opacity="0.5" />
          <g filter={`url(#${P}-glow)`}>
            <rect x="66" y="6" width="4" height="230" fill="#ffffff" opacity="0.9" />
          </g>
          {/* 手前に開いた扉板。少しだけ角度を付ける */}
          <path d="M66 6 L18 -16 L18 250 L66 236 Z" fill="#e8dcc4" stroke="#b9a382" strokeWidth="1.4" />
          <path d="M26 12 L58 22 L58 118 L26 112 Z" fill="none" stroke="#c9b49a" strokeWidth="1.6" />
          <path d="M26 132 L58 138 L58 226 L26 220 Z" fill="none" stroke="#c9b49a" strokeWidth="1.6" />
          <circle cx="30" cy="126" r="3.4" fill="#a8916c" />
          {/* 扉の下に影を落とさない。宙に浮いていることを隠さない */}
        </g>

        {/* 扉から出て散る蝶。数は少なく。多いと絵本になる */}
        <g fill={CREAM} opacity="0.9">
          {[[300, 300, 1], [262, 356, 0.8], [212, 268, 0.6], [340, 214, 0.55], [186, 420, 0.45]].map(([x, y, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${k}) rotate(${i * 27 - 30})`} opacity={0.5 + k * 0.5}>
              <path d="M0 0 C-16 -14 -22 2 -8 8 C-3 10 -1 5 0 0 Z" />
              <path d="M0 0 C16 -14 22 2 8 8 C3 10 1 5 0 0 Z" />
            </g>
          ))}
        </g>

        {/* 塵。夢はいつも埃っぽい */}
        <g fill="#ffffff">
          {dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} opacity={d.o * 0.6} />)}
        </g>

        {/* 版面の隅にだけ強いぼかし。周辺視野が思い出せない、という表現 */}
        <g filter={`url(#${P}-blur)`} opacity="0.5">
          <rect width="600" height="70" fill="#e8c4ee" opacity="0.35" />
          <rect y="740" width="600" height="60" fill="#2c1a52" opacity="0.45" />
          <rect width="52" height="800" fill="#c9a8ea" opacity="0.3" />
          <rect x="548" width="52" height="800" fill="#c9a8ea" opacity="0.3" />
        </g>

        {/* ── 文字。ぼかしの上に、ひとつだけはっきり置く ─────────── */}
        <text x="44" y="722" fill={CREAM} fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="27" fontStyle="italic" letterSpacing="2.5" opacity="0.95">
          you have been here
        </text>
        <text x="46" y="746" fill={AQUA} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="10" letterSpacing="4" opacity="0.85">
          BUT YOU DO NOT REMEMBER WHEN
        </text>
        <text x="556" y="746" textAnchor="end" fill={CREAM} fontFamily="sans-serif"
              fontSize="11" letterSpacing="2" opacity="0.55">
          夢　二枚目
        </text>

        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.13" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
