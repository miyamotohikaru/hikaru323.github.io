/**
 * サイバーパンク。
 *
 * ■ シンセウェイヴと分ける
 *   あちらは「空いていて速い」。こちらは「詰まっていて遅い」。
 *   だから左右対称の一点透視は使わない。消失点を右にずらし、
 *   手前の壁を画面から溢れさせて、路地の狭さを出す。
 *
 * ■ リミナルスペースとも分ける
 *   向こうも一点透視の廊下だが、あちらは屋内・均一な蛍光灯・無彩色。
 *   こちらは屋外・光源は看板だけ・暗部を潰しきる。
 *
 * ■ 密度の作り方
 *   看板を「壁に貼る」のではなく「壁から突き出す」。
 *   同じ壁の t（奥行き）を2つ取って前後の面を作れば、
 *   看板は自動的に正しく縮む。これをやると一気に街になる。
 *   初稿では看板を平らな長方形で貼って、書き割りに見えた。
 *
 * ■ 濡れていること
 *   路面は看板の色を縦に引き伸ばして映す。横に切れ目を入れると波になる。
 *   雨は斜めの細線。奥ほど短くする。
 */
import { ATLAS, rand, lerp } from "@/lib/plate";

const P = "cp";

const NIGHT = "#05060f";
const CYAN = "#00f0ff";
const PINK = "#ff2e88";
const AMBER = "#ffd400";
const SLATE = "#1a1f3a";

const VPX = 430;
const VPY = 470;

/* 左の壁。手前は画面の外まで。t=0 が手前、t=1 が奥 */
const lx = (t: number) => lerp(-40, 300, t);
const ltop = (t: number) => lerp(-60, 323, t);
const lbot = (t: number) => lerp(860, 578, t);
/* 右の壁 */
const rx = (t: number) => lerp(612, 508, t);
const rtop = (t: number) => lerp(-60, 243, t);
const rbot = (t: number) => lerp(860, 637, t);

type Wall = { x: (t: number) => number; top: (t: number) => number; bot: (t: number) => number };
const L: Wall = { x: lx, top: ltop, bot: lbot };
const R: Wall = { x: rx, top: rtop, bot: rbot };

/** 壁から突き出す看板。奥の面(t)と手前の面(t2)を結ぶ */
function signQuad(w: Wall, t: number, dt: number, u: number, hh: number) {
  const t2 = Math.max(0, t - dt);
  const y = (tt: number, uu: number) => w.top(tt) + uu * (w.bot(tt) - w.top(tt));
  return {
    side: `${w.x(t)},${y(t, u)} ${w.x(t2)},${y(t2, u)} ${w.x(t2)},${y(t2, u + hh)} ${w.x(t)},${y(t, u + hh)}`,
    fx: w.x(t2),
    fy0: y(t2, u),
    fy1: y(t2, u + hh),
    bx: w.x(t),
    by0: y(t, u),
    by1: y(t, u + hh),
  };
}

export default function Plate() {
  const r = rand(20770313);

  /* 左の壁の看板。奥ほど詰める。突き出す量も奥ほど小さく */
  const leftSigns = [0.075, 0.22, 0.34, 0.45, 0.55, 0.63, 0.7, 0.76, 0.81, 0.855, 0.89].map((t, i) => ({
    t,
    dt: 0.15 * (1 - t) + 0.02,
    u: [0.12, 0.42, 0.2, 0.55, 0.3, 0.62, 0.18, 0.45, 0.28, 0.58, 0.36][i],
    hh: [0.3, 0.14, 0.22, 0.12, 0.18, 0.1, 0.16, 0.1, 0.12, 0.09, 0.1][i],
    c: [PINK, CYAN, AMBER, CYAN, PINK, AMBER, CYAN, PINK, AMBER, CYAN, PINK][i],
  }));
  const rightSigns = [0.06, 0.26, 0.42, 0.55, 0.66, 0.75, 0.82, 0.87].map((t, i) => ({
    t,
    dt: 0.16 * (1 - t) + 0.02,
    u: [0.3, 0.14, 0.5, 0.24, 0.44, 0.18, 0.4, 0.26][i],
    hh: [0.2, 0.26, 0.12, 0.16, 0.11, 0.14, 0.1, 0.09][i],
    c: [CYAN, AMBER, PINK, PINK, CYAN, AMBER, PINK, CYAN][i],
  }));

  /* 雨。奥ほど短く、密に */
  const rain = Array.from({ length: 170 }, () => {
    const d = r();
    return { x: r(-60, 660), y: r(-40, 800), len: lerp(46, 9, d), o: lerp(0.5, 0.12, d), w: lerp(1.5, 0.6, d) };
  });

  /* 遠景のビル。奥の隙間を埋める。3層で重ねると深さが出る */
  const far = Array.from({ length: 26 }, (_, i) => ({
    x: 288 + i * 9.6,
    h: r(30, 150),
    w: r(7, 14),
    lit: r(),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="サイバーパンク様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        <clipPath id={`${P}-gap`}>
          <polygon points={`296,${ltop(0.985)} 296,${lbot(0.985)} 524,${rbot(0.985)} 524,${rtop(0.985)}`} />
        </clipPath>
        <clipPath id={`${P}-street`}>
          <polygon points={`-40,860 ${lx(1)},${lbot(1)} ${rx(1)},${rbot(1)} 640,860`} />
        </clipPath>

        <linearGradient id={`${P}-wallL`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#07080f" />
          <stop offset="0.7" stopColor="#0e1226" />
          <stop offset="1" stopColor="#1d2445" />
        </linearGradient>
        <linearGradient id={`${P}-wallR`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#07080f" />
          <stop offset="0.7" stopColor="#101533" />
          <stop offset="1" stopColor="#20284d" />
        </linearGradient>
        <linearGradient id={`${P}-road`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#06070e" />
          <stop offset="0.6" stopColor="#0b0e1e" />
          <stop offset="1" stopColor="#232c55" />
        </linearGradient>
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#080a18" />
          <stop offset="1" stopColor="#2a1a48" />
        </linearGradient>
        <radialGradient id={`${P}-fog`}>
          <stop offset="0" stopColor="#8fd8ff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#4a3a8a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#4a3a8a" stopOpacity="0" />
        </radialGradient>

        <filter id={`${P}-glow`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${P}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
        <filter id={`${P}-soft2`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={NIGHT} />

        {/* ── 空。路地の上に残った細い帯 ─────────────────────────── */}
        <polygon points={`-40,-60 ${lx(1)},${ltop(1)} ${rx(1)},${rtop(1)} 640,-60`} fill={`url(#${P}-sky)`} />

        {/* ── 奥。遠景のビルと霧。ここが唯一の「抜け」 ───────────── */}
        <g clipPath={`url(#${P}-gap)`}>
          <rect x="280" y="200" width="256" height="460" fill="#1a1230" />
          <ellipse cx={VPX} cy={VPY} rx="150" ry="120" fill={`url(#${P}-fog)`} />
          {far.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={VPY + 40 - b.h} width={b.w} height={b.h} fill="#0d1026" opacity="0.95" />
              {Array.from({ length: Math.floor(b.h / 9) }, (_, k) => (
                <rect key={k} x={b.x + 1.6} y={VPY + 34 - b.h + k * 9} width={b.w - 3.2} height="3"
                      fill={b.lit > 0.6 ? AMBER : b.lit > 0.3 ? CYAN : PINK}
                      opacity={((i * 7 + k * 13) % 5) / 5 * 0.55 + 0.06} />
              ))}
            </g>
          ))}
          {/* 奥に浮かぶ広告塔。1本だけ立てて、視線の止まり場を作る */}
          <g filter={`url(#${P}-glow)`}>
            <rect x="404" y="330" width="15" height="118" fill="#12183a" />
            <rect x="405" y="332" width="13" height="114" fill="none" stroke={PINK} strokeWidth="1" opacity="0.8" />
            {"未来都市".split("").map((c, i) => (
              <text key={i} x="411.5" y={352 + i * 27} textAnchor="middle" fill={PINK}
                    fontFamily="sans-serif" fontSize="19" opacity="0.95">{c}</text>
            ))}
          </g>
        </g>

        {/* ── 路面。濡れている ────────────────────────────────── */}
        <polygon points={`-40,860 ${lx(1)},${lbot(1)} ${rx(1)},${rbot(1)} 640,860`} fill={`url(#${P}-road)`} />

        {/* ── 壁 ───────────────────────────────────────────── */}
        <polygon points={`-40,-60 ${lx(1)},${ltop(1)} ${lx(1)},${lbot(1)} -40,860`} fill={`url(#${P}-wallL)`} />
        <polygon points={`640,-60 ${rx(1)},${rtop(1)} ${rx(1)},${rbot(1)} 640,860`} fill={`url(#${P}-wallR)`} />

        {/* 壁の窓。t と u の格子を画面に写す。奥ほど自動的に詰まる */}
        <g>
          {[L, R].map((w, wi) =>
            Array.from({ length: 13 }, (_, i) => {
              const t = 0.06 + i * 0.072;
              const t2 = t + 0.062;
              const h = w.bot(t) - w.top(t);
              return Array.from({ length: 9 }, (_, k) => {
                const u = 0.06 + k * 0.1;
                const on = ((wi * 5 + i * 3 + k * 7) % 11) < 4;
                return (
                  <polygon key={`${wi}-${i}-${k}`}
                    points={`${w.x(t)},${w.top(t) + u * h} ${w.x(t2)},${w.top(t2) + u * (w.bot(t2) - w.top(t2))} ${w.x(t2)},${w.top(t2) + (u + 0.055) * (w.bot(t2) - w.top(t2))} ${w.x(t)},${w.top(t) + (u + 0.055) * h}`}
                    fill={on ? (((i + k) % 3 === 0) ? AMBER : (i + k) % 3 === 1 ? CYAN : "#ffb0d8") : "#0a0d1e"}
                    opacity={on ? 0.18 + ((i * 7 + k) % 5) * 0.055 : 0.85} />
                );
              });
            }),
          )}
        </g>

        {/* 壁の縦の継ぎ目。密度はここでも稼ぐ */}
        <g stroke="#000000" strokeWidth="1" opacity="0.5">
          {Array.from({ length: 12 }, (_, i) => {
            const t = 0.05 + i * 0.078;
            return <line key={`sl${i}`} x1={lx(t)} y1={ltop(t)} x2={lx(t)} y2={lbot(t)} />;
          })}
          {Array.from({ length: 10 }, (_, i) => {
            const t = 0.06 + i * 0.09;
            return <line key={`sr${i}`} x1={rx(t)} y1={rtop(t)} x2={rx(t)} y2={rbot(t)} />;
          })}
        </g>

        {/* ── 看板。壁から突き出す。ここで街になる ─────────────────── */}
        {[
          { list: leftSigns, w: L, jp: ["電脳", "無", "夜", "酒", "貸", "門", "鮨", "湯", "珈琲", "薬", "麺"] },
          { list: rightSigns, w: R, jp: ["歓楽", "情報", "肉", "銭", "路", "店", "米", "屋"] },
        ].map((set, si) =>
          set.list.map((s, i) => {
            const q = signQuad(set.w, s.t, s.dt, s.u, s.hh);
            const fh = q.fy1 - q.fy0;
            const chars = set.jp[i].split("");
            return (
              <g key={`${si}-${i}`}>
                {/* 側面。暗く落として厚みを出す */}
                <polygon points={q.side} fill="#080a16" stroke="#000" strokeWidth="0.6" />
                {/* 正面 */}
                <g filter={fh > 22 ? `url(#${P}-glow)` : `url(#${P}-soft2)`}>
                  <rect x={q.fx - (si === 0 ? fh * 0.52 : 0)} y={q.fy0}
                        width={fh * 0.52} height={fh} fill="#0b0e1c" />
                  {/* 面にうっすら色を溜める。枠線だけだと看板が「光って」見えない */}
                  <rect x={q.fx - (si === 0 ? fh * 0.52 : 0)} y={q.fy0}
                        width={fh * 0.52} height={fh} fill={s.c} opacity="0.14" />
                  <rect x={q.fx - (si === 0 ? fh * 0.52 : 0)} y={q.fy0}
                        width={fh * 0.52} height={fh} fill="none" stroke={s.c} strokeWidth={Math.max(0.8, fh * 0.045)} />
                  {fh > 26 &&
                    chars.map((c, k) => (
                      <text key={k}
                            x={q.fx - (si === 0 ? fh * 0.26 : -fh * 0.26)}
                            y={q.fy0 + fh * 0.2 + (k * fh * 0.78) / chars.length + fh * 0.18}
                            textAnchor="middle" fill={s.c}
                            fontFamily="sans-serif" fontSize={fh * 0.34} opacity="0.98">
                        {c}
                      </text>
                    ))}
                  {fh <= 26 && (
                    <g fill={s.c} opacity="0.9">
                      {Array.from({ length: 3 }, (_, k) => (
                        <rect key={k} x={q.fx - (si === 0 ? fh * 0.42 : -fh * 0.1)} y={q.fy0 + fh * (0.18 + k * 0.26)}
                              width={fh * 0.32} height={fh * 0.13} />
                      ))}
                    </g>
                  )}
                </g>
              </g>
            );
          }),
        )}

        {/* ── 上を渡る電線と配管。路地の天井を塞いで、狭さを決定づける ── */}
        <g stroke="#05060c" fill="none" strokeLinecap="round">
          {[
            "M-40 40 Q 200 96 300 74 Q 420 48 640 86",
            "M-40 112 Q 180 176 306 146 Q 430 116 640 150",
            "M-40 196 Q 190 246 312 214 Q 440 184 640 208",
            "M-40 268 Q 200 300 318 276 Q 450 252 640 258",
          ].map((d, i) => (
            <path key={i} d={d} strokeWidth={2.6 - i * 0.45} opacity="0.95" />
          ))}
        </g>
        {/* 電線に付いた提灯。ここだけ暖色を置くと路地が生きる */}
        <g>
          {[[96, 78], [188, 92], [268, 80], [352, 66], [468, 72], [560, 84]].map(([x, y], i) => (
            <g key={i} filter={`url(#${P}-glow)`}>
              <ellipse cx={x} cy={y + 14} rx={7 - i * 0.4} ry={9 - i * 0.5} fill={AMBER} opacity="0.9" />
              <line x1={x} y1={y} x2={x} y2={y + 6} stroke="#05060c" strokeWidth="1.4" />
            </g>
          ))}
        </g>

        {/* 蒸気。排気口から立つ。奥の霧と繋げる */}
        <g filter={`url(#${P}-soft)`} opacity="0.32">
          <ellipse cx="352" cy="600" rx="72" ry="46" fill="#7fb6d8" />
          <ellipse cx="298" cy="640" rx="50" ry="30" fill="#8fa8e0" />
        </g>

        {/* ── 傘の人影。奥行きの物差しであり、路地に人が居るという証 ── */}
        <g clipPath={`url(#${P}-street)`}>
          <g fill="#03040a">
            {/* 傘。裾を波形に切ると布に見える */}
            <path d="M350 630 C352 598 372 586 396 586 C420 586 440 598 442 630
                     C432 620 424 620 415 630 C406 619 386 619 377 630 C368 620 360 620 350 630 Z" />
            <rect x="394.8" y="584" width="2.4" height="52" />
            <circle cx="396" cy="583" r="2.6" />
            {/* 外套の人。肩を丸め、裾を割る */}
            <path d="M382 640 C382 631 410 631 410 640 L414 682 L404 700 L400 700 L399 676 L394 700 L389 700 L382 682 Z" />
            <circle cx="396" cy="634" r="6.5" />
          </g>
          {/* 足元の水たまりに落ちる影 */}
          <ellipse cx="398" cy="702" rx="20" ry="5" fill="#000" opacity="0.6" />
        </g>

        {/* ── 路面の映り込み。看板の色を縦に引き伸ばす ─────────────── */}
        <g clipPath={`url(#${P}-street)`}>
          {[...leftSigns, ...rightSigns].map((s, i) => {
            const w = i < leftSigns.length ? L : R;
            const q = signQuad(w, s.t, s.dt, s.u, s.hh);
            const fh = q.fy1 - q.fy0;
            const x = q.fx - (i < leftSigns.length ? fh * 0.52 : 0);
            const base = w.bot(Math.max(0, s.t - s.dt));
            return (
              <rect key={i} x={x} y={base} width={fh * 0.52} height={(800 - base) * 0.9}
                    fill={s.c} opacity={Math.min(0.3, 0.05 + fh * 0.004)} filter={`url(#${P}-soft2)`} />
            );
          })}
          {/* 波の切れ目。横に裂くと水面になる */}
          <g fill={NIGHT}>
            {Array.from({ length: 46 }, (_, i) => {
              const y = 580 + Math.pow(i / 46, 1.7) * 240;
              return <rect key={i} x={r(-40, 300)} y={y} width={r(60, 420)} height={r(1.2, 3.6)} opacity={r(0.25, 0.55)} />;
            })}
          </g>
          {/* 水たまり。縁を光らせる */}
          {[[210, 726, 96, 17], [430, 690, 62, 11], [330, 772, 120, 20]].map(([x, y, rx2, ry2], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rx2} ry={ry2} fill="none"
                     stroke={i % 2 ? CYAN : PINK} strokeWidth="1.2" opacity="0.35" />
          ))}
        </g>

        {/* ── 雨 ───────────────────────────────────────────── */}
        <g stroke="#cfe6ff" strokeLinecap="round">
          {rain.map((d, i) => (
            <line key={i} x1={d.x} y1={d.y} x2={d.x - d.len * 0.34} y2={d.y + d.len} strokeWidth={d.w} opacity={d.o} />
          ))}
        </g>

        {/* 手前の暗み。四隅を落として、路地の奥だけを見せる */}
        <radialGradient id={`${P}-vig`} cx="0.68" cy="0.58">
          <stop offset="0.42" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.66" />
        </radialGradient>
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />

        {/* ── 文字 ───────────────────────────────────────────── */}
        <text x="44" y="762" fill={CYAN} fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="15" fontWeight="700" letterSpacing="7.5" opacity="0.9">
          CYBERPUNK
        </text>
        <text x="45" y="780" fill="#ff6aa8" fontFamily="'Courier New', ui-monospace, monospace"
              fontSize="9" letterSpacing="3" opacity="1">
          HIGH TECH — LOW LIFE
        </text>
        <text x="556" y="780" textAnchor="end" fill={AMBER} fontFamily="sans-serif"
              fontSize="11" letterSpacing="2" opacity="0.6">
          雨　二十時
        </text>

        <rect width="600" height="800" fill={`url(#${ATLAS.scanlines})`} opacity="0.1" />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.1" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
