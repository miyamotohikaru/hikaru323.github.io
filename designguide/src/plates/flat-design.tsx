/**
 * フラットデザイン。
 *
 * ■ 前稿の失敗（検分でここを作り直した）
 *   前稿は帆船・太陽・雲・三角の山を並べた風景画だった。
 *   フラットな塗りではあるが、絵として幼児向け教材にしか見えない。
 *   フラットデザインは「割り切りの思想」であって「稚拙」ではない。
 *   Metro（Windows Phone 2010）と iOS 7 が捨てたのは装飾であって、
 *   組版の厳密さはむしろ強めている。だから版面そのもので見せる形に替えた。
 *
 * ■ この版で「らしさ」を作っているもの
 *   1. 8の倍数だけで組んだタイル。単位84・間隔8。位置も大きさも
 *      その格子から外れない。フラットの根拠は影の不在ではなく格子にある。
 *   2. 右の余白を8しか取らず、格子を紙の外へ送り出している。
 *      左48・右8という非対称の版面が Metro の一番の特徴。
 *      左右均等に置いた時点でこの様式ではなくなる。
 *   3. 階調・透明度をひとつも使っていない。薄い文字は「黒の50%」ではなく
 *      #92a0a8 という別の実色。前稿は註に「0 ALPHA」と書きながら
 *      本文で opacity を使っていて、絵が自分の宣言に嘘をついていた。
 *   4. アイコンは全部おなじ太さ（4）の線。塗りつぶしと線を混ぜない。
 *   5. 空いたタイルを1枚わざと残す。フラットでは余白も部品のひとつ。
 *
 * ■ 直近で踏んだこと
 *   ・題字を細ウェイトで組んだら、上のタイルに負けて版面の重心が
 *     上に張りついた。太いジオメトリックに替えて下側に重さを戻した。
 *   ・タイルを色で埋め尽くしたら色見本になった。白のタイルを2枚混ぜて
 *     「面の色で境目を作る」という原理が見えるようにした。
 */
import { ATLAS } from "@/lib/plate";

const P = "fd";

/* spine の5色。ここから外れる色相は足さない */
const PAPER = "#f5f6f8";
const BLUE = "#2d9cdb";
const RED = "#eb5757";
const YELLOW = "#f2c94c";
const GREEN = "#27ae60";

/* 派生は「濃淡」ではなく別の実色として置く。opacity は最後まで使わない */
const INK = "#0d2c3d"; // 青の家族を暗くした墨。文字とタイル
const GREY = "#92a0a8"; // 副次の文字。黒の透過ではない
const RULE = "#dfe3e8"; // 罫。紙より一段だけ暗い実色
const WHITE = "#ffffff";

/* ── 8の倍数の格子。全部の座標をここから引く ────────────────── */
const U = 84; // タイル1枚
const G = 8; // 間隔
const L = 48; // 左の版面。右は8しか取らない（非対称が Metro の骨）
const col = (i: number) => L + i * (U + G); // 48 140 232 324 416 508
const row = (i: number) => 104 + i * (U + G); // 104 196 288 380
const span = (n: number) => n * U + (n - 1) * G; // 84 176 268 360

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** タイル。角は立てる。影も枠も持たない。空のタイルだけ1pxの罫を持つ */
const Tile = ({
  cx, cy, w, h, fill, outline,
}: { cx: number; cy: number; w: number; h: number; fill: string; outline?: boolean }) => (
  <rect
    x={col(cx)} y={row(cy)} width={w} height={h}
    fill={fill}
    stroke={outline ? RULE : "none"} strokeWidth={outline ? 1 : 0}
  />
);

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="フラットデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 見出しの行。細い罫1本で版面の天を決める ─────────── */}
        <text x={L} y="46" fill={INK} fontFamily={SANS} fontSize="11" fontWeight="700" letterSpacing="4.4">
          FLAT DESIGN
        </text>
        <text x="592" y="46" textAnchor="end" fill={GREY} fontFamily={SANS} fontSize="9" fontWeight="600" letterSpacing="2.2">
          METRO 2010 — iOS 7 · 2013
        </text>
        <rect x={L} y="62" width={592 - L} height="1" fill={RULE} />

        {/* 8刻みの目盛り。この絵の全部の寸法がここに乗っている、という註。
            近くで見ると格子が実在することが分かる */}
        <g fill={RULE}>
          {Array.from({ length: 69 }, (_, i) => L + i * 8).filter((x) => x <= 592).map((x, i) => (
            <rect key={i} x={x} y="76" width="1" height={i % 5 === 0 ? 10 : 5} />
          ))}
        </g>

        {/* ── タイルの組。ここが図版の本体 ───────────────────── */}

        {/* 大 2×2。青。線アイコンは全部おなじ太さ4で通す */}
        <Tile cx={0} cy={0} w={span(2)} h={span(2)} fill={BLUE} />
        <g stroke={WHITE} strokeWidth="4" fill="none" strokeLinecap="square">
          <path d={`M${col(0) + 34} ${row(0) + 88} H${col(0) + 138}`} />
          <path d={`M${col(0) + 112} ${row(0) + 62} L${col(0) + 138} ${row(0) + 88} L${col(0) + 112} ${row(0) + 114}`} />
        </g>
        {/* 註はタイルの内側で完結させる。前は文字がはみ出して隣の黄へ乗った */}
        <text x={col(0) + 16} y={row(0) + 166} fill={WHITE} fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="2">
          ONE ACCENT PER TILE
        </text>

        {/* 横長 2×1。緑。チェックも同じ線幅 */}
        <Tile cx={2} cy={0} w={span(2)} h={U} fill={GREEN} />
        <path
          d={`M${col(2) + 30} ${row(0) + 44} L${col(2) + 46} ${row(0) + 60} L${col(2) + 80} ${row(0) + 26}`}
          stroke={WHITE} strokeWidth="4" fill="none" strokeLinecap="square"
        />
        <text x={col(2) + 100} y={row(0) + 48} fill={WHITE} fontFamily={SANS} fontSize="10" fontWeight="700" letterSpacing="1.8">
          2px
        </text>
        <text x={col(2) + 100} y={row(0) + 62} fill={WHITE} fontFamily={SANS} fontSize="7" fontWeight="600" letterSpacing="1.2">
          EVERY STROKE
        </text>

        {/* 小 1×1 ×2。赤と墨。原型の図形をそのまま置く */}
        <Tile cx={4} cy={0} w={U} h={U} fill={RED} />
        <g stroke={WHITE} strokeWidth="4" fill="none">
          <path d={`M${col(4) + 42} ${row(0) + 24} V${row(0) + 60}`} />
          <path d={`M${col(4) + 24} ${row(0) + 42} H${col(4) + 60}`} />
        </g>

        <Tile cx={5} cy={0} w={U} h={U} fill={INK} />
        <g stroke={WHITE} strokeWidth="4" fill="none" strokeLinecap="square">
          <circle cx={col(5) + 38} cy={row(0) + 38} r="15" />
          <path d={`M${col(5) + 49} ${row(0) + 49} L${col(5) + 62} ${row(0) + 62}`} />
        </g>

        {/* 横長 3×1。黄。文字は面の上に直接。囲みも影も置かない */}
        <Tile cx={2} cy={1} w={span(3)} h={U} fill={YELLOW} />
        <text x={col(2) + 22} y={row(1) + 50} fill={INK} fontFamily={SANS} fontSize="26" fontWeight="700" letterSpacing="1.5">
          SOLID FILLS
        </text>
        <text x={col(2) + 22} y={row(1) + 68} fill={INK} fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="2.6">
          COLOUR IS THE ONLY EDGE
        </text>

        {/* 空のタイル。フラットでは余白も部品なので1枚わざと残す */}
        <Tile cx={5} cy={1} w={U} h={U} fill={PAPER} outline />
        <rect x={col(5) + 26} y={row(1) + 26} width="32" height="32" fill="none" stroke={RULE} strokeWidth="1" strokeDasharray="4 4" />

        {/* 横長 3×1。墨。反転した白文字 */}
        <Tile cx={0} cy={2} w={span(3)} h={U} fill={INK} />
        <text x={col(0) + 22} y={row(2) + 52} fill={WHITE} fontFamily={SANS} fontSize="28" fontWeight="700" letterSpacing="1">
          NO SHADOW
        </text>

        {/* 原型3つ。円・三角・四角。塗りだけ、線だけ、を混ぜない */}
        <Tile cx={3} cy={2} w={U} h={U} fill={YELLOW} />
        <polygon
          points={`${col(3) + 42},${row(2) + 24} ${col(3) + 62},${row(2) + 60} ${col(3) + 22},${row(2) + 60}`}
          fill={INK}
        />
        <Tile cx={4} cy={2} w={U} h={U} fill={GREEN} />
        <circle cx={col(4) + 42} cy={row(2) + 42} r="19" fill={WHITE} />
        <Tile cx={5} cy={2} w={U} h={U} fill={RED} />
        <rect x={col(5) + 24} y={row(2) + 24} width="36" height="36" fill={WHITE} />

        {/* 横長 2×1。白。文字の段は2つだけ、という註を棒で示す */}
        <Tile cx={0} cy={3} w={span(2)} h={U} fill={PAPER} outline />
        <rect x={col(0) + 20} y={row(3) + 26} width="88" height="12" fill={INK} />
        <rect x={col(0) + 20} y={row(3) + 48} width="52" height="5" fill={GREY} />
        <text x={col(0) + 120} y={row(3) + 36} fill={GREY} fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.4">
          TWO
        </text>
        <text x={col(0) + 120} y={row(3) + 55} fill={GREY} fontFamily={SANS} fontSize="8" fontWeight="700" letterSpacing="1.4">
          SIZES
        </text>

        {/* 横長 4×1。青。右端は紙の外へ8で切れる */}
        <Tile cx={2} cy={3} w={span(4)} h={U} fill={BLUE} />
        <text x={col(2) + 22} y={row(3) + 52} fill={WHITE} fontFamily={SANS} fontSize="28" fontWeight="700" letterSpacing="1">
          NO GRADIENT
        </text>
        <g stroke={WHITE} strokeWidth="4" fill="none" strokeLinecap="square">
          <path d={`M${col(5) + 40} ${row(3) + 28} L${col(5) + 58} ${row(3) + 46} L${col(5) + 40} ${row(3) + 64}`} />
        </g>

        {/* ── 題字。上のタイルに負けないよう太く大きく組む ───────── */}
        <text x={L - 4} y="600" fill={INK} fontFamily={SANS} fontSize="150" fontWeight="700" letterSpacing="-4">
          FLAT
        </text>
        <text x={L} y="640" fill={GREY} fontFamily={SANS} fontSize="24" fontWeight="300" letterSpacing="16">
          DESIGN
        </text>

        {/* 右の註。題字と縦位置をずらして衝突を避ける */}
        <g fill={GREY} fontFamily={SANS} fontSize="9" fontWeight="600" letterSpacing="1.6">
          <text x="592" y="542" textAnchor="end">GRID 8 — TILE 84 — GAP 8</text>
          <text x="592" y="560" textAnchor="end">MARGIN 48 LEFT, 8 RIGHT</text>
          <text x="592" y="578" textAnchor="end">FIVE FILLS, ELEVEN TILES</text>
        </g>
        <text x="592" y="640" textAnchor="end" fill={INK} fontFamily={SANS} fontSize="11" fontWeight="700" letterSpacing="2">
          DEPTH REMOVED ON PURPOSE
        </text>

        {/* ── 下の帯。刷り色と目盛り ─────────────────────────── */}
        <rect x={L} y="700" width={592 - L} height="1" fill={RULE} />

        <g>
          {[BLUE, RED, YELLOW, GREEN, INK].map((c, i) => (
            <rect key={i} x={L + i * 56} y="720" width="40" height="14" fill={c} />
          ))}
          {["2D9CDB", "EB5757", "F2C94C", "27AE60", "0D2C3D"].map((h, i) => (
            <text
              key={h} x={L + i * 56} y="748"
              fill={GREY} fontFamily={SANS} fontSize="6.5" fontWeight="700" letterSpacing="0.6"
            >
              {h}
            </text>
          ))}
          <text x={L} y="768" fill={GREY} fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="2">
            FIVE FILLS · NO TINTS · NO ALPHA
          </text>
        </g>

        {/* 8刻みの物差し。上の目盛りと対にして、格子が本物だと示す */}
        <g>
          <rect x="392" y="726" width="200" height="1" fill={GREY} />
          {Array.from({ length: 26 }, (_, i) => 392 + i * 8).map((x, i) => (
            <rect key={i} x={x} y="726" width="1" height={i % 5 === 0 ? 9 : 5} fill={GREY} />
          ))}
          <text x="592" y="752" textAnchor="end" fill={GREY} fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="2">
            8 · 16 · 24 · 32 · 40 …
          </text>
          <text x="592" y="768" textAnchor="end" fill={GREY} fontFamily={SANS} fontSize="8" fontWeight="600" letterSpacing="2">
            NOTHING OFF THE MODULE
          </text>
        </g>

        {/* 紙の目。刷り物としての最低限。面の平坦さは壊さない薄さ */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.07"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
