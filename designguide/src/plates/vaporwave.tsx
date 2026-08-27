/**
 * ヴェイパーウェイヴ。
 *
 * ■ この群でいちばん危ないのは「夜のネオン格子」に寄ることだった。
 *   紫の地平線グリッドと横縞の太陽はシンセウェイヴの持ち物なので、
 *   ここでは両方とも使わない。水平線は引くが、遠近の格子は一本も引かない。
 *   太陽も縞で抜かず、パステルの円のまま置く。
 *
 * ■ 何を積むか
 *   1. 石膏像（ギリシャ横顔）。台座ごと版面の左に立てる。
 *      初稿は胸像を大きくしすぎて、ただの丸い塊＝山に見えた。
 *      台座と「胸で水平に切った断面」を足したら、やっと美術館の石膏になった。
 *   2. Windows95 の窓。傾けない。まっすぐ置いてあることが冗談の芯。
 *   3. 全角の日本語。読ませるためではなく、記号として置く。
 *   4. ヤシと沈む陽。初稿の葉は短く尖っていて竹に見えたので、
 *      長く伸ばして先を垂らした。ヤシは「垂れる」ことで竹と分かれる。
 *
 * ■ 感情は「皮肉と気だるさ」
 *   像は瞳を彫られていないし、窓には「エラー」しか出ていない。
 *   晴れているのに何ひとつ進まない、という絵にした。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "vw";

/* spine の5色。地の #1a0b2e は輪郭と影にだけ効かせ、面はぜんぶ白に寄せて「昼」にする */
const NIGHT = "#1a0b2e";
const PINK = "#ff71ce";
const CYAN = "#01cdfe";
const CREAM = "#fffb96";

/* 石膏。白のままだと空に溶けるので、影は必ず紫に転ばせる */
const PLASTER = "#f4f0fb";
const PLASTER_MID = "#dbd0ef";
const PLASTER_DARK = "#b3a1d4";
const PLASTER_LINE = "#8874b4";

/* ヤシは紫と桃の中間。黒のシルエットにすると昼が壊れる */
const PLUM = "#9b62b5";

const FACE = "#d8d4e2";
const BEVEL_LO = "#82809a";
const TITLEBAR = "#2b1a5c";

const HORIZON = 566;

/* 石膏像。額から鼻先までを一本の線で通すのがギリシャの横顔 */
const HEAD =
  "M204 320 C240 320 266 335 267 358 L279 393 L264 397 L270 402 L259 406 " +
  "C268 412 266 416 258 418 C266 422 264 430 254 432 C262 438 260 450 246 454 " +
  "C228 464 196 462 178 448 C157 434 134 405 136 373 C138 339 172 320 204 320 Z";
const NECK = "M196 432 L190 500 L262 505 L258 428 Z";
/* 胸で水平に切った断面。これが無いと胸像に見えない */
const CHEST =
  "M106 616 L108 594 C112 550 140 518 178 502 L204 494 L256 496 L286 508 " +
  "C322 526 336 556 338 594 L340 616 Z";

/** Windows95 の窓。縁の45度の当たりが無いと、ただの灰色の箱になる */
function Win({
  x, y, w, h, title, children,
}: { x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill={FACE} />
      <path d={`M0 ${h} L0 0 L${w} 0 L${w - 3} 3 L3 3 L3 ${h - 3} Z`} fill="#ffffff" />
      <path d={`M${w} 0 L${w} ${h} L0 ${h} L3 ${h - 3} L${w - 3} ${h - 3} L${w - 3} 3 Z`} fill={BEVEL_LO} />
      <rect x="5" y="5" width={w - 10} height="19" fill={TITLEBAR} />
      <text x="10" y="19" fill="#ece6ff" fontFamily="sans-serif" fontSize="12" letterSpacing="1">
        {title}
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${w - 17 - (2 - i) * 15} 7)`}>
          <rect width="14" height="14" fill={FACE} />
          <path d="M0 14 L0 0 L14 0 L12 2 L2 2 L2 12 Z" fill="#ffffff" />
          <path d="M14 0 L14 14 L0 14 L2 12 L12 12 L12 2 Z" fill={BEVEL_LO} />
        </g>
      ))}
      {children}
    </g>
  );
}

/** ヤシ。葉は「一度持ち上げてから垂れる」。ここを省くと竹になる */
function Palm({ x, y, h, bend, s, seed }: { x: number; y: number; h: number; bend: number; s: number; seed: number }) {
  const r = rand(seed);
  const tips: [number, number][] = [
    [-96, -10], [-84, -46], [-52, -66], [-12, -72], [30, -66], [66, -44], [92, -6], [-74, 28], [62, 32],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 幹。反らせないと電柱に見える */}
      <path
        d={`M-5 0 C${-4 + bend * 0.3} ${-h * 0.45} ${bend * 0.8} ${-h * 0.8} ${bend} ${-h}
            L${bend + 9} ${-h + 4} C${bend * 0.8 + 8} ${-h * 0.8} ${5 + bend * 0.3} ${-h * 0.45} 5 0 Z`}
      />
      {Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x={-5 + (bend * (k + 1)) / 10} y={-((h / 9) * (k + 1))} width="10" height="1.7" opacity="0.26" fill="#ffffff" />
      ))}
      <g transform={`translate(${bend} ${-h}) scale(${s})`}>
        {tips.map(([tx, ty], k) => {
          const jx = tx + r(-7, 7);
          const jy = ty + r(-6, 6);
          return (
            <g key={k}>
              <path d={`M0 0 Q${jx * 0.5} ${jy * 0.5 - 34} ${jx} ${jy} Q${jx * 0.45} ${jy * 0.5 - 16} 0 6 Z`} />
              <path d={`M0 2 Q${jx * 0.5} ${jy * 0.5 - 26} ${jx} ${jy}`} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
            </g>
          );
        })}
        <circle r="6" />
      </g>
    </g>
  );
}

export default function Plate() {
  const r = rand(19950824);

  /* 髪の巻き毛。頭の輪郭に沿って粒を並べる。半径だけ揺らして帽子に見せない */
  const curls = Array.from({ length: 16 }, (_, i) => {
    const t = ((-160 + (i / 15) * 198) * Math.PI) / 180;
    return { x: 206 + 60 * Math.sin(t), y: 386 - 64 * Math.cos(t), r: r(10, 15) };
  });
  const curlsIn = Array.from({ length: 9 }, (_, i) => {
    const t = ((-138 + (i / 8) * 156) * Math.PI) / 180;
    return { x: 206 + 40 * Math.sin(t), y: 386 - 44 * Math.cos(t), r: r(9, 13) };
  });

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ヴェイパーウェイヴ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 昼の空。水色→藤→桃→クリーム。夜に落とさない */}
        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0.18" y2="1">
          <stop offset="0" stopColor="#a6e4f7" />
          <stop offset="0.34" stopColor="#d6cbf0" />
          <stop offset="0.64" stopColor="#ffc4d2" />
          <stop offset="0.88" stopColor="#ffe6ad" />
          <stop offset="1" stopColor="#fff7cc" />
        </linearGradient>

        <linearGradient id={`${P}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9f0d8" />
          <stop offset="0.5" stopColor="#74dcd8" />
          <stop offset="1" stopColor="#54bede" />
        </linearGradient>

        <radialGradient id={`${P}-sun`}>
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="0.62" stopColor={CREAM} />
          <stop offset="1" stopColor="#ffd49f" />
        </radialGradient>
        <radialGradient id={`${P}-halo`}>
          <stop offset="0.4" stopColor={CREAM} stopOpacity="0.7" />
          <stop offset="1" stopColor={CREAM} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${P}-stone`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fcfaff" />
          <stop offset="0.5" stopColor={PLASTER} />
          <stop offset="1" stopColor="#cdc0e6" />
        </linearGradient>

        <clipPath id={`${P}-bust`}>
          <path d={CHEST} /><path d={NECK} /><path d={HEAD} />
        </clipPath>
        <clipPath id={`${P}-head`}><path d={HEAD} /></clipPath>
        <clipPath id={`${P}-sea-clip`}><rect y={HORIZON} width="600" height={800 - HORIZON} /></clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-sky)`} />

        {/* 平たい雲。上の空が空きすぎるので、横に伸ばした棒で段を作る */}
        <g fill="#ffffff" opacity="0.5">
          {[[188, 196, 150, 13], [244, 226, 96, 10], [96, 262, 118, 11], [300, 288, 74, 9], [162, 314, 190, 12]].map(
            ([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} opacity={0.45 + i * 0.08} />,
          )}
        </g>

        {/* ── 陽。水平線に半分沈めて、版面の重心を右下に置く ───────── */}
        <circle cx="436" cy="482" r="212" fill={`url(#${P}-halo)`} opacity="0.6" />
        <circle cx="436" cy="482" r="130" fill={`url(#${P}-sun)`} />
        <circle cx="436" cy="482" r="130" fill="none" stroke="#fffdf2" strokeWidth="2.5" opacity="0.75" />

        {/* ── 海 ─────────────────────────────────────────────── */}
        <rect y={HORIZON} width="600" height={800 - HORIZON} fill={`url(#${P}-sea)`} />
        <g clipPath={`url(#${P}-sea-clip)`}>
          {Array.from({ length: 17 }, (_, i) => {
            const y = HORIZON + 6 + i * 13.5;
            const w = 28 + i * 8 + r(0, 12);
            return (
              <rect key={i} x={436 - w / 2 + r(-8, 8)} y={y} width={w} height={r(2.5, 5)}
                    fill="#fff8d8" opacity={0.7 - i * 0.033} rx="2" />
            );
          })}
          {Array.from({ length: 26 }, (_, i) => (
            <rect key={`w${i}`} x={r(-20, 300)} y={HORIZON + 8 + r(0, 224)} width={r(14, 52)} height="2"
                  fill="#eafff8" opacity={r(0.14, 0.34)} rx="1" />
          ))}
          <rect y={HORIZON} width="600" height="6" fill="#ffffff" opacity="0.55" />
        </g>

        {/* ── ヤシ。陽に重ねる ────────────────────────────────── */}
        <g fill={PLUM} opacity="0.9">
          <Palm x={512} y={HORIZON} h={176} bend={24} s={1} seed={41} />
          <Palm x={572} y={HORIZON} h={122} bend={-16} s={0.72} seed={77} />
        </g>

        {/* ── 石膏像 ──────────────────────────────────────────── */}
        <g>
          {/* 落ち影。像を空から剥がす */}
          <g opacity="0.15" transform="translate(10 9)" fill={NIGHT}>
            <path d={CHEST} /><path d={NECK} /><path d={HEAD} />
            <rect x="150" y="614" width="146" height="22" />
            <rect x="166" y="636" width="114" height="164" />
          </g>

          {/* 台座。像を「立たせる」ための箱。四角があるから頭が塊に見えない */}
          <g>
            <rect x="166" y="636" width="114" height="164" fill="#e0d6f2" />
            <rect x="166" y="636" width="52" height="164" fill="#c6b6e2" />
            <rect x="150" y="612" width="146" height="24" fill="#eee7fb" />
            <rect x="150" y="630" width="146" height="6" fill="#c6b6e2" />
            {/* 溝。近くで見たときの細部 */}
            <g stroke={PLASTER_LINE} strokeWidth="1.4" opacity="0.45">
              {[196, 224, 252].map((x) => <line key={x} x1={x} y1="650" x2={x} y2="800" />)}
            </g>
            <text x="223" y="676" fill={PLASTER_LINE} fontFamily="Georgia, 'Times New Roman', serif"
                  fontSize="11" letterSpacing="2.5" textAnchor="middle" opacity="0.75">
              MMXVI
            </text>
          </g>

          <g clipPath={`url(#${P}-bust)`}>
            <rect width="600" height="800" fill={`url(#${P}-stone)`} />
            {/* 陽は右にあるので影は左に溜める。楕円で置くと丸みが出る */}
            <ellipse cx="136" cy="562" rx="112" ry="192" fill={PLASTER_MID} opacity="0.95" />
            <ellipse cx="100" cy="582" rx="70" ry="162" fill={PLASTER_DARK} opacity="0.55" />
            <ellipse cx="162" cy="398" rx="50" ry="78" fill={PLASTER_MID} opacity="0.9" />
            <ellipse cx="140" cy="410" rx="28" ry="54" fill={PLASTER_DARK} opacity="0.42" />
            {/* 首の下の影。ここが無いと頭が胸に乗って見えない */}
            <ellipse cx="226" cy="510" rx="68" ry="20" fill={PLASTER_DARK} opacity="0.5" />
            <ellipse cx="318" cy="582" rx="52" ry="112" fill="#ffffff" opacity="0.5" />
            {/* 衣の襞。3本だけ。多いと像が布に見える */}
            <g fill="none" stroke={PLASTER_DARK} strokeWidth="2.6" opacity="0.5" strokeLinecap="round">
              <path d="M132 616 C146 578 172 550 208 538" />
              <path d="M178 616 C188 584 212 562 248 556" />
              <path d="M270 616 C280 590 298 576 320 572" />
            </g>
          </g>

          {/* 髪。輪郭の中だけで巻く */}
          <g clipPath={`url(#${P}-head)`}>
            {curls.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={PLASTER_MID} stroke={PLASTER_DARK} strokeWidth="1.2" opacity="0.92" />
            ))}
            {curlsIn.map((c, i) => (
              <circle key={`n${i}`} cx={c.x} cy={c.y} r={c.r} fill={PLASTER_MID} stroke={PLASTER_DARK} strokeWidth="1.1" opacity="0.75" />
            ))}
            {curls.map((c, i) => (
              <circle key={`i${i}`} cx={c.x - 2} cy={c.y - 2} r={c.r * 0.4} fill={PLASTER_DARK} opacity="0.3" />
            ))}
          </g>

          {/* 顔の造作。古代の目は瞳を彫らない＝空っぽの視線 */}
          <g fill="none" stroke={PLASTER_LINE} strokeWidth="2.1" strokeLinecap="round" opacity="0.82">
            <path d="M222 368 C233 361 247 362 255 368" />
            <path d="M226 381 C235 375 248 375 256 382 C248 389 235 389 226 381 Z" />
            <path d="M246 419 C252 417 256 419 257 421" />
            <path d="M192 390 C204 386 208 400 201 408 C197 412 191 410 190 404" />
            <path d="M238 459 C226 467 208 467 196 461" opacity="0.5" />
          </g>
          <g fill="none" stroke={PLASTER_LINE} strokeWidth="2" opacity="0.75">
            <path d={HEAD} /><path d={CHEST} />
          </g>
        </g>

        {/* ── Windows95 ───────────────────────────────────────── */}
        <g opacity="0.97">
          <Win x={316} y={112} w={244} h={166} title="ｖａｐｏｒｗａｖｅ．ｂｍｐ">
            {/* 中身は版面そのものの縮小図。入れ子にすると気だるさが出る */}
            <g transform="translate(9 30)">
              <rect width="226" height="126" fill="#ffffff" />
              <rect x="2" y="2" width="222" height="122" fill="#cfe9f6" />
              <rect x="2" y="78" width="222" height="46" fill="#8fdcd2" />
              <circle cx="152" cy="78" r="28" fill={CREAM} />
              <path d="M2 78 L224 78" stroke="#ffffff" strokeWidth="2" />
              <path d="M50 124 L54 98 C58 86 72 80 82 84 C90 88 94 98 94 110 L96 124 Z" fill="#efe9fa" stroke={PLASTER_LINE} strokeWidth="1" />
              <circle cx="74" cy="72" r="14" fill="#efe9fa" stroke={PLASTER_LINE} strokeWidth="1" />
              <text x="7" y="14" fill={NIGHT} fontFamily="'Courier New', ui-monospace, monospace" fontSize="8" opacity="0.5">
                640 x 480 — 256 COLOURS
              </text>
            </g>
          </Win>

          {/* エラー。晴れているのに何も進まない、という絵にするための一枚 */}
          <Win x={368} y={300} w={200} h={106} title="エラー">
            <g transform="translate(16 40)">
              <path d="M17 0 L34 30 L0 30 Z" fill={CREAM} stroke={NIGHT} strokeWidth="1.4" />
              <text x="17" y="26" fill={NIGHT} fontFamily="sans-serif" fontSize="17" fontWeight="700" textAnchor="middle">!</text>
              <text x="46" y="13" fill={NIGHT} fontFamily="sans-serif" fontSize="11">この操作は完了</text>
              <text x="46" y="28" fill={NIGHT} fontFamily="sans-serif" fontSize="11">できませんでした</text>
            </g>
            <g transform="translate(74 78)">
              <rect width="52" height="20" fill={FACE} />
              <path d="M0 20 L0 0 L52 0 L50 2 L2 2 L2 18 Z" fill="#ffffff" />
              <path d="M52 0 L52 20 L0 20 L2 18 L50 18 L50 2 Z" fill={BEVEL_LO} />
              <text x="26" y="14" fill={NIGHT} fontFamily="sans-serif" fontSize="11" textAnchor="middle">ＯＫ</text>
            </g>
          </Win>
        </g>

        {/* ── 文字 ────────────────────────────────────────────── */}
        {/* 欧文。VHS のにじみとして桃と水色を数px ずらして敷く */}
        <g fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="31" fontWeight="300" letterSpacing="8.5">
          <text x="47" y="79" fill={CYAN} opacity="0.72" transform="translate(-3 2)">VAPORWAVE</text>
          <text x="47" y="79" fill={PINK} opacity="0.72" transform="translate(3 -2)">VAPORWAVE</text>
          <text x="47" y="79" fill="#f7f2ff">VAPORWAVE</text>
        </g>
        <text x="49" y="99" fill={NIGHT} fontFamily="'Courier New', ui-monospace, monospace" fontSize="9.5" letterSpacing="3.2" opacity="0.55">
          MALL SOFT — SLOWED + REVERB
        </text>

        {/* 全角の日本語。左の柱として縦に落とす */}
        <g fill={NIGHT} fontFamily="sans-serif">
          {"蒸気波".split("").map((c, i) => (
            <text key={i} x="30" y={172 + i * 60} fontSize="50" fontWeight="700" opacity="0.88">{c}</text>
          ))}
          {"ヴェイパーウェイヴ".split("").map((c, i) => (
            <text key={`k${i}`} x="38" y={378 + i * 21} fontSize="16.5" opacity="0.5">{c}</text>
          ))}
        </g>

        {/* 地の注記。海の上に小さく置いて右下の余白を締める */}
        <text x="336" y="758" fill="#0d3a4a" fontFamily="'Courier New', ui-monospace, monospace" fontSize="10" letterSpacing="2.6" opacity="0.62">
          ＮＯ　ＦＵＴＵＲＥ　／　１９９５
        </text>
        <line x1="336" y1="770" x2="556" y2="770" stroke="#0d3a4a" strokeWidth="1.2" opacity="0.4" />

        {/* ── 質感。VHS の走査線は薄く。強いとグリッチアートになる ──── */}
        <rect width="600" height="800" fill={`url(#${ATLAS.scanlines})`} opacity="0.07" />
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.11" style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
