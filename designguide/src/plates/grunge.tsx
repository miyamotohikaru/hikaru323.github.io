/**
 * グランジデザイン。
 *
 * レイ・ガン誌（デイヴィッド・カーソン）とサブ・ポップの刷り物。
 * 90年代のこの手つきは「汚す」ことではなく「刷り重ねて、擦り減らす」こと。
 *
 * ■ ここで作っている「らしさ」
 *   1. 版ズレ。同じ絵を錆色と焦茶で2回刷り、5px ずらす。
 *      重なりは沈み、外れた縁だけに錆色の耳が出る。汚しを撒くより、
 *      この耳が1本あるほうが「刷り物」に見える。
 *   2. 擦り減り。インクは均一に減らない。紙の山が先に擦れる。
 *      だから、刷った層をまとめて1枚の「傷の伏せ」で食わせている。
 *      層ごとに別々に汚すと、上下関係が壊れて泥になる（初稿でそうなった）。
 *   3. 網点の粗大化。写真を解像度の限界を超えて引き伸ばすと、
 *      像ではなく点の粗密だけが残る。だから蛾は 9px の網で組んだ。
 *      3段の点径を1つの網目角度で使い分ける＝1本の線数で刷った証拠。
 *   4. 読みにくさ。文字は版面から出て切れ、他の版に潜る。
 *      全部読めるように置き直した瞬間に、これはグランジでなくなる。
 *
 * ■ ATLAS.rough は使わない
 *   網点の上に変位をかけると点が崩れる。擦り減りは伏せで作る。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "gr";
const PAPER = "#c9c2b4";
const DARK = "#3a352c";
const RUST = "#7a2f21";
const OLIVE = "#585240";
const BLACK = "#141310";

/** 四辺とも千切れた紙 */
function torn(x: number, y: number, w: number, h: number, seed: number, amp = 6) {
  const r = rand(seed);
  const pts: string[] = [];
  const sx = Math.max(8, w / 16);
  const sy = Math.max(8, h / 12);
  for (let t = 0; t < w; t += sx) pts.push(`${(x + t).toFixed(1)},${(y + r(-amp, amp)).toFixed(1)}`);
  for (let t = 0; t < h; t += sy) pts.push(`${(x + w + r(-amp, amp)).toFixed(1)},${(y + t).toFixed(1)}`);
  for (let t = w; t > 0; t -= sx) pts.push(`${(x + t).toFixed(1)},${(y + h + r(-amp, amp)).toFixed(1)}`);
  for (let t = h; t > 0; t -= sy) pts.push(`${(x + r(-amp, amp)).toFixed(1)},${(y + t).toFixed(1)}`);
  return `M${pts.join(" L")} Z`;
}

/** ぐずぐずの円。染みに使う。真円だと「図形」に見えて染みにならない */
function blob(cx: number, cy: number, rr: number, seed: number, wob = 0.34) {
  const r = rand(seed);
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = rr * (1 - wob + r(0, wob * 2));
    return [cx + Math.cos(a) * k * 1.15, cy + Math.sin(a) * k];
  });
  return (
    `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} ` +
    pts.map((_, i) => {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      return `Q${a[0].toFixed(1)},${a[1].toFixed(1)} ${((a[0] + b[0]) / 2).toFixed(1)},${((a[1] + b[1]) / 2).toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

/** 蛾。右半分だけ描いて左右に写す。90年代の刷り物の常連 */
const MOTH = {
  fore: "M 6,-62 L 160,-54 C 176,-40 168,-12 138,4 C 100,22 44,20 8,8 Z",
  hind: "M 8,4 C 62,8 118,34 122,64 C 125,92 92,106 58,97 C 28,89 8,60 6,30 Z",
  band: "M 14,-42 C 60,-54 118,-48 154,-28 L 147,-13 C 110,-34 58,-38 16,-27 Z",
  hband: "M 12,34 C 48,40 88,54 106,74 L 98,84 C 78,64 44,52 10,47 Z",
  body: "M 0,-64 C 10,-64 15,-40 14,-6 C 13,34 8,72 0,92 C -8,72 -13,34 -14,-6 C -15,-40 -10,-64 0,-64 Z",
};

export default function Plate() {
  const r = rand(19910924);

  /* 傷の伏せ。細かい擦れはタイルで、大きな筋は一点物で。
     タイルだけだと繰り返しが見える */
  const dust = Array.from({ length: 340 }, () => ({
    x: r(0, 200), y: r(0, 200), w: r(0.6, 4.2), h: r(0.5, 1.8), o: r(0.3, 1),
  }));
  const scratches = Array.from({ length: 20 }, (_, i) => {
    const x = r(-40, 620);
    const y = r(20, 780);
    const a = i % 3 === 0 ? r(58, 122) : r(-26, 26);
    return { x, y, len: r(50, 290), a, w: r(0.5, 2.2) };
  });

  /* 紙の染み。刷る前から紙は汚れている */
  const stains = [
    { d: blob(120, 190, 86, 51), o: 0.16 },
    { d: blob(470, 610, 104, 52), o: 0.13 },
    { d: blob(300, 470, 150, 53, 0.42), o: 0.08 },
    { d: blob(70, 700, 74, 54), o: 0.14 },
  ];

  const Moth = ({ fill }: { fill: string }) => (
    <g fill={fill}>
      {[1, -1].map((s) => (
        <g key={s} transform={`scale(${s} 1)`}>
          <path d={MOTH.hind} mask={`url(#${P}-m1)`} />
          <path d={MOTH.fore} mask={`url(#${P}-m2)`} />
          <path d={MOTH.band} mask={`url(#${P}-m3)`} />
          <path d={MOTH.hband} mask={`url(#${P}-m2)`} />
          {/* 眼状紋。近くで見るときの取っ掛かり */}
          <circle cx="102" cy="-26" r="15" mask={`url(#${P}-m3)`} />
          <circle cx="102" cy="-26" r="6.5" mask={`url(#${P}-m1)`} />
          {/* 触角。羽毛状の枝を出す */}
          <g stroke={fill} strokeWidth="2.4" fill="none" mask={`url(#${P}-m3)`}>
            <path d="M 5,-72 C 28,-94 56,-108 78,-114" />
            {Array.from({ length: 9 }, (_, i) => {
              const t = i / 8;
              const x = 5 + (78 - 5) * t;
              const y = -72 - 42 * Math.sin(t * 1.1);
              return <path key={i} d={`M ${x},${y} l ${6 + t * 5},${-9 - t * 5}`} strokeWidth="1.6" />;
            })}
          </g>
        </g>
      ))}
      <path d={MOTH.body} mask={`url(#${P}-m3)`} />
      <circle cx="0" cy="-70" r="12" mask={`url(#${P}-m3)`} />
      {/* 腹の節。細い抜きを入れると胴が「胴」になる */}
      <g mask={`url(#${P}-m1)`}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x="-13" y={4 + i * 13} width="26" height="4" fill={PAPER} />
        ))}
      </g>
    </g>
  );

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="グランジデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 網。線数は1つ。点径だけを3段に変えて階調を作る＝1版で刷った証拠 */}
        {[
          [1, 1.6],
          [2, 3.0],
          [3, 4.15],
        ].map(([k, rr]) => (
          <pattern key={k} id={`${P}-p${k}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="9" height="9" fill="#000" />
            <circle cx="4.5" cy="4.5" r={rr} fill="#fff" />
          </pattern>
        ))}
        {[1, 2, 3].map((k) => (
          <mask key={k} id={`${P}-m${k}`} maskUnits="userSpaceOnUse" x="-320" y="-200" width="700" height="500">
            <rect x="-320" y="-200" width="700" height="500" fill={`url(#${P}-p${k})`} />
          </mask>
        ))}

        {/* 擦り減りの伏せ。刷った層をまとめて食わせる */}
        <pattern id={`${P}-dust`} width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="#fff" />
          {dust.map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill="#000" opacity={d.o} />
          ))}
        </pattern>
        <mask id={`${P}-wear`}>
          <rect width="600" height="800" fill={`url(#${P}-dust)`} />
          <g stroke="#000" strokeLinecap="round" opacity="0.85">
            {scratches.map((s, i) => (
              <line
                key={i}
                x1={s.x} y1={s.y}
                x2={s.x + Math.cos((s.a * Math.PI) / 180) * s.len}
                y2={s.y + Math.sin((s.a * Math.PI) / 180) * s.len}
                strokeWidth={s.w}
              />
            ))}
          </g>
          {/* 折り目。ここは擦れが集中する */}
          <rect x="0" y="396" width="600" height="3" fill="#000" opacity="0.55" />
          <rect x="0" y="399" width="600" height="7" fill="#000" opacity="0.25" />
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* 刷る前から紙は汚れている */}
        <g fill={OLIVE}>
          {stains.map((s, i) => <path key={i} d={s.d} opacity={s.o} />)}
        </g>
        {/* 珈琲の輪。縁だけが濃いのがこの染みの見分け方 */}
        <g transform="translate(486 372)">
          <path d={blob(0, 0, 66, 61, 0.12)} fill="none" stroke={RUST} strokeWidth="5" opacity="0.3" />
          <path d={blob(0, 0, 62, 62, 0.14)} fill={RUST} opacity="0.07" />
        </g>

        {/* ── 刷った層。ぜんぶまとめて擦り減らす ───────────────────── */}
        <g mask={`url(#${P}-wear)`}>
          {/* 写真。解像度の限界を超えて引き伸ばした網点 */}
          <g transform="rotate(2.2 371 176)">
            <path d={torn(176, 46, 390, 260, 71, 7)} fill={PAPER} />
            <path d={torn(176, 46, 390, 260, 71, 7)} fill={OLIVE} opacity="0.3" />
            <g transform="translate(371 178) scale(0.95)">
              {/* 錆版が先。5px ずらして刷る */}
              <g transform="translate(5 4)" style={{ mixBlendMode: "multiply" }}>
                <Moth fill={RUST} />
              </g>
              {/* 焦茶版。重なりは沈み、外れた縁に錆の耳が残る */}
              <g style={{ mixBlendMode: "multiply" }}>
                <Moth fill={DARK} />
              </g>
            </g>
          </g>

          {/* ── 題字。版面から出て切れる ─────────────────────────── */}
          <g transform="translate(-16 452) scale(0.8 1)">
            <text
              x="8" y="5" fill={RUST}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="168" fontWeight="800" letterSpacing="-8"
              style={{ mixBlendMode: "multiply" }}
            >
              GRUNGE
            </text>
            <text
              x="0" y="0" fill={DARK}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="168" fontWeight="800" letterSpacing="-8"
              style={{ mixBlendMode: "multiply" }}
            >
              GRUNGE
            </text>
          </g>

          {/* 地の黒い版。文字を白く抜く */}
          <path d={torn(46, 502, 364, 124, 73, 5)} fill={BLACK} />
          <g fill={PAPER} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
            <text x="62" y="534" fontSize="27" fontWeight="800" letterSpacing="-1.2">SEATTLE · 1991</text>
            <text x="62" y="562" fontSize="13" fontWeight="600" letterSpacing="2.4" opacity="0.86">
              OVERPRINTED — WORN — TAPED
            </text>
            <text x="62" y="600" fontSize="13" fontWeight="600" letterSpacing="2.4" opacity="0.86">
              SET TO BE HARD TO READ
            </text>
          </g>
          {/* 錆の版が文字に潜り込む。読めなくなるがそれでいい */}
          {/* 2稿目は掛け合わせにしたら黒版と重なって真っ黒な箱になり、
              事故に見えた。不透明で上に乗せ、下の行を食わせるほうが正しい */}
          <g transform="rotate(-4 386 576)">
            <rect x="268" y="546" width="236" height="60" fill={RUST} />
            <rect x="268" y="546" width="236" height="4" fill={BLACK} opacity="0.35" />
            <text
              x="294" y="588" fill={PAPER}
              fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="28" fontWeight="700" letterSpacing="1"
            >
              LO-FI
            </text>
          </g>
        </g>

        {/* ── 刷った層の外。紙の物としての痕跡 ────────────────────── */}
        {/* 縦組みのタイプ打ち。左の柱 */}
        <text
          transform="translate(40 306) rotate(-90)"
          fill={DARK}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="11" fontWeight="700" letterSpacing="3.4" opacity="0.7"
        >
          PHOTOCOPIED FROM A PHOTOCOPY
        </text>
        <g fill={DARK} opacity="0.45">
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={54} y={72 + i * 16} width={i % 3 === 0 ? 13 : 7} height="1.6" />
          ))}
        </g>

        {/* 養生テープ。繊維が透け、縁が毛羽立つ */}
        {[
          { x: 168, y: 30, w: 92, h: 27, rot: -24 },
          { x: 508, y: 286, w: 86, h: 25, rot: 16 },
        ].map((t, i) => (
          <g key={i} transform={`rotate(${t.rot} ${t.x + t.w / 2} ${t.y + t.h / 2})`} opacity="0.5">
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="#b3a98f" />
            <g stroke="#8f8672" strokeWidth="0.7" opacity="0.8">
              {Array.from({ length: 7 }, (_, k) => (
                <line key={k} x1={t.x} y1={t.y + 3 + k * 3.4} x2={t.x + t.w} y2={t.y + 3 + k * 3.4} />
              ))}
            </g>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="none" stroke="#7d7460" strokeWidth="1" opacity="0.7" />
          </g>
        ))}

        {/* ホチキスの穴。綴じてあった紙を剥がした跡 */}
        <g fill={BLACK} opacity="0.55">
          <ellipse cx="66" cy="46" rx="3.4" ry="1.8" transform="rotate(-18 66 46)" />
          <ellipse cx="78" cy="50" rx="3.4" ry="1.8" transform="rotate(-18 78 50)" />
        </g>

        {/* 版下の指示が刷られてしまった体の注記 */}
        <text
          x="46" y="672" fill={DARK}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="10.5" fontWeight="700" letterSpacing="2.6" opacity="0.72"
        >
          2 PLATES / RUST + BROWN / MISREGISTERED 5PX
        </text>
        {/* 太い罫の刻み。近くで見る細部 */}
        <g fill={DARK}>
          {Array.from({ length: 26 }, (_, i) => (
            <rect key={i} x={46 + i * 8.6} y={686} width={i % 5 === 0 ? 3.6 : 1.6} height={i % 5 === 0 ? 13 : 7} opacity={i % 5 === 0 ? 0.75 : 0.4} />
          ))}
        </g>

        {/* 巨大な数字。版面から落として切る */}
        <text
          x="386" y="812" fill={DARK}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="176" fontWeight="800" letterSpacing="-10" opacity="0.22"
        >
          07
        </text>
        <text
          x="46" y="752" fill={RUST}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="15" fontWeight="800" letterSpacing="5"
        >
          NEVERMIND THE GRID
        </text>

        {/* 掻き傷。乳剤を引っ掻いた跡は紙の色で出る */}
        <g stroke={PAPER} strokeLinecap="round" opacity="0.65">
          {scratches.slice(0, 9).map((s, i) => (
            <line
              key={i}
              x1={s.x + 24} y1={s.y + 40}
              x2={s.x + 24 + Math.cos(((s.a + 6) * Math.PI) / 180) * s.len * 0.8}
              y2={s.y + 40 + Math.sin(((s.a + 6) * Math.PI) / 180) * s.len * 0.8}
              strokeWidth={s.w * 0.8}
            />
          ))}
        </g>

        {/* 紙。わら半紙に厚みの繊維を1枚重ねる */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.32" style={{ mixBlendMode: "multiply" }} />
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
