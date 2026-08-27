/**
 * グリッチアート。
 *
 * ■ 「壊れて見える絵」ではなく「壊された絵」を描く
 *   落書き風のノイズを散らしても глитч にはならない。
 *   壊れる前の一枚（元画像）が要る。ここでは放送のテストカード
 *   ―― 円・輪・帯・大きな文字 ―― を元画像に決め、それを横に刻んで
 *   行ごとにずらす。同じ元画像から作るから「破損」に見える。
 *
 * ■ RGB分離のやり方
 *   元画像をマスク1枚にまとめ、赤の板と水色の板を左右に数pxずらして
 *   screen で重ねる。重なった所は白、はみ出た縁だけが赤と水色に割れる。
 *   白い板を上に足すと縁が消えるので足さない（初稿で足して失敗した）。
 *
 * ■ 壊し方は4種だけ
 *   ずれ（tear）／縦の複製（dup）／ブロックの化け（noise）／そのまま。
 *   全部の行を壊すと、ただのノイズ画像になって元画像が消える。
 *   7割は無傷のまま残す。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "gl";

const BG = "#08080c";
const RED = "#ff0040";
const CYAN = "#00fff0";
const PAPER = "#f2f2f2";
const VIOLET = "#7a00ff";

const TOP = 116;
const BOT = 664;
const ROWS = 40;
const RH = (BOT - TOP) / ROWS;

export default function Plate() {
  const r = rand(20040719);

  const rows = Array.from({ length: ROWS }, (_, i) => {
    const p = r();
    const kind = p > 0.9 ? "noise" : p > 0.79 ? "tear" : p > 0.71 ? "dup" : "ok";
    return {
      y: TOP + i * RH,
      dx: kind === "tear" ? r(-58, 58) : r(-2.5, 2.5),
      dy: kind === "dup" ? r(-52, 52) : 0,
      split: p > 0.74 ? r(16, 34) : r(4, 10),
      kind,
      blocks: Array.from({ length: 9 }, () => ({
        x: r(-20, 560),
        w: r(18, 130),
        c: [RED, CYAN, VIOLET, RED, PAPER, "#0f1020"][Math.floor(r(0, 6))],
        o: r(0.4, 1),
      })),
    };
  });

  /* 走査線が横に流れる箇所。行とは別に、細い明線を数本だけ通す */
  const bright = Array.from({ length: 5 }, () => ({
    y: r(TOP, BOT), h: r(1, 3.2), o: r(0.35, 0.85), x: r(-40, 200), w: r(220, 620),
  }));

  /* JPEG のマクロブロック。8x8 の升目で色が量子化して化ける */
  const macro = Array.from({ length: 46 }, () => ({
    x: Math.floor(r(0, 22)) * 16 + 208,
    y: Math.floor(r(0, 7)) * 16 + 672,
    c: [RED, CYAN, VIOLET, "#141428", PAPER][Math.floor(r(0, 5))],
    o: r(0.25, 0.95),
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="グリッチアート様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 元画像。これ1枚をマスクにして、色ごとの板を抜く */}
        <mask id={`${P}-art`}>
          <rect width="600" height="800" fill="#000" />
          <circle cx="300" cy="356" r="148" fill="#fff" />
          <circle cx="300" cy="356" r="196" fill="none" stroke="#fff" strokeWidth="9" />
          <circle cx="300" cy="356" r="222" fill="none" stroke="#fff" strokeWidth="2.5" />
          <rect x="-40" y="470" width="680" height="30" fill="#fff" />
          {/* 目盛り。元画像の細部。ここが刻まれると壊れ方が読める */}
          {Array.from({ length: 33 }, (_, i) => (
            <rect key={i} x={40 + i * 16} y="516" width="6" height={i % 4 === 0 ? 22 : 12} fill="#fff" />
          ))}
          <rect x="42" y="176" width="58" height="58" fill="#fff" />
          <rect x="500" y="176" width="58" height="58" fill="#fff" />
          <rect x="42" y="596" width="58" height="58" fill="#fff" />
          <rect x="500" y="596" width="58" height="58" fill="#fff" />
          {/* 大きな文字は「黒」で抜く。円と帯から字が彫り出される */}
          <text x="300" y="392" textAnchor="middle" fill="#000"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontSize="104" fontWeight="800" letterSpacing="-4">
            GLITCH
          </text>
          <text x="300" y="494" textAnchor="middle" fill="#000"
                fontFamily="'Courier New', ui-monospace, monospace"
                fontSize="19" fontWeight="700" letterSpacing="7">
            DATA CORRUPTED
          </text>
        </mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={BG} />

        {/* 版ぜんたいの色収差。刻む前の元画像を±14ずらして薄く敷いておく。
            これが無いと、壊れた行だけ色が付いて「切り貼り」に見える */}
        <g opacity="0.5">
          <rect x="-14" width="600" height="800" fill={RED} mask={`url(#${P}-art)`} style={{ mixBlendMode: "screen" }} />
          <rect x="14" width="600" height="800" fill={CYAN} mask={`url(#${P}-art)`} style={{ mixBlendMode: "screen" }} />
        </g>

        {/* ── 刻んだ行。赤と水色の板を左右にずらして screen で重ねる ── */}
        {rows.map((row, i) => (
          <g key={i} clipPath={`url(#${P}-row${i})`}>
            {row.kind === "noise" ? (
              <g>
                {row.blocks.map((b, k) => (
                  <rect key={k} x={b.x} y={row.y} width={b.w} height={RH + 0.8} fill={b.c} opacity={b.o} />
                ))}
              </g>
            ) : (
              <g transform={`translate(${row.dx} ${row.dy})`}>
                <rect x={-row.split} width="600" height="800" fill={RED} mask={`url(#${P}-art)`}
                      style={{ mixBlendMode: "screen" }} />
                <rect x={row.split} width="600" height="800" fill={CYAN} mask={`url(#${P}-art)`}
                      style={{ mixBlendMode: "screen" }} />
                {row.split > 8 && (
                  <rect x={-row.split * 1.9} width="600" height="800" fill={VIOLET} mask={`url(#${P}-art)`}
                        opacity="0.75" style={{ mixBlendMode: "screen" }} />
                )}
              </g>
            )}
          </g>
        ))}
        {/* 行の窓。上の <g> から参照する。defs をここに置くと読み順が分かりやすい */}
        <defs>
          {rows.map((row, i) => (
            <clipPath key={i} id={`${P}-row${i}`}>
              <rect y={row.y} width="600" height={RH + 0.7} />
            </clipPath>
          ))}
        </defs>

        {/* 明線。走査が飛んだ行 */}
        {bright.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={PAPER} opacity={b.o} style={{ mixBlendMode: "screen" }} />
        ))}

        {/* 縦の裂け目。1本だけ。多いと縦縞の模様になって破損に見えない */}
        <g clipPath={`url(#${P}-tearcol)`}>
          <g transform="translate(0 34)">
            <rect x="-5" width="600" height="800" fill={RED} mask={`url(#${P}-art)`} style={{ mixBlendMode: "screen" }} />
            <rect x="5" width="600" height="800" fill={CYAN} mask={`url(#${P}-art)`} style={{ mixBlendMode: "screen" }} />
          </g>
        </g>
        <defs>
          <clipPath id={`${P}-tearcol`}><rect x="392" y={TOP} width="46" height={BOT - TOP} /></clipPath>
        </defs>
        <g stroke={CYAN} strokeWidth="1" opacity="0.5">
          <line x1="392" y1={TOP} x2="392" y2={BOT} />
          <line x1="438" y1={TOP} x2="438" y2={BOT} />
        </g>

        {/* ── 16進のダンプ。壊れた中身を「読める形」で見せる細部 ─────── */}
        <g fontFamily="'Courier New', ui-monospace, monospace" fontSize="9.4" letterSpacing="1.1">
          {[
            "0000  ff d8 ff e0 00 10 4a 46  49 46 00 01 01 00 00 01",
            "0010  00 01 00 00 ff db 00 43  00 08 06 06 07 06 05 08",
            "0020  07 07 07 09 09 08 0a 0c  14 0d 0c 0b 0b 0c 19 12",
            "0030  13 0f 14 1d 1a 1f 1e 1d  ?? ?? ?? ?? ?? ?? ?? ??",
          ].map((line, i) => (
            <text key={i} x="44" y={34 + i * 15} fill={i === 3 ? RED : CYAN} opacity={i === 3 ? 0.95 : 0.55}>
              {line}
            </text>
          ))}
        </g>
        <rect x="44" y="102" width="512" height="1.4" fill={CYAN} opacity="0.5" />

        {/* ── マクロブロック。JPEG が化けた区画 ───────────────────── */}
        <g>
          <rect x="208" y="672" width="348" height="112" fill="#0d0d18" />
          {macro.map((m, i) => (
            <rect key={i} x={m.x} y={m.y} width="16" height="16" fill={m.c} opacity={m.o} />
          ))}
          <rect x="208" y="672" width="348" height="112" fill="none" stroke={CYAN} strokeWidth="1" opacity="0.45" />
          {/* 升目の罫。8x8 のブロックであることを見せる */}
          <g stroke={BG} strokeWidth="0.7" opacity="0.55">
            {Array.from({ length: 22 }, (_, i) => (
              <line key={`v${i}`} x1={208 + i * 16} y1="672" x2={208 + i * 16} y2="784" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1="208" y1={672 + i * 16} x2="556" y2={672 + i * 16} />
            ))}
          </g>
        </g>

        {/* 地の注記。左下 */}
        <g fontFamily="'Courier New', ui-monospace, monospace" fontSize="10" letterSpacing="2.2">
          <text x="44" y="694" fill={RED} fontWeight="700">SIGNAL LOST</text>
          <text x="44" y="712" fill={PAPER} opacity="0.6">SHIFT  ±58 PX</text>
          <text x="44" y="728" fill={PAPER} opacity="0.6">SPLIT  R / C</text>
          <text x="44" y="744" fill={PAPER} opacity="0.6">ROWS   40</text>
          <text x="44" y="768" fill={CYAN} opacity="0.85">0x00FF0040</text>
        </g>

        {/* 走査線。ブラウン管越し。強めに入れて「映像」だと言い切る */}
        <rect width="600" height="800" fill={`url(#${ATLAS.scanlines})`} opacity="0.3" />
        <rect width="600" height="800" filter={`url(#${ATLAS.grainCoarse})`} opacity="0.13" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
