/**
 * プレシジョニズム。
 *
 * 1920年代アメリカ。シーラー、デムス、クロフォード。
 * 穀物サイロ・工場・給水塔を、製図のような硬い面に還元して描いた。
 * 煙も人も消し、機械だけが立っている。
 *
 * ■ この版でやっていること
 *   1. グラデーションを1つも使わない。円筒の丸みは「段」で作る。
 *      縁＝中間、次＝ハイライト、次＝地色、次＝陰、端＝最暗の5段。
 *      滑らかに繋ぐと写真になり、精密主義でなくなる。彼らは
 *      丸みを面の集合として翻訳した画家たちだった。
 *   2. 光線（ray lines）。画面の外の一点から発した細い直線が、
 *      物体を無視して版面を横切る。デムスの発明で、この様式の指紋。
 *      物の輪郭とわざと交差させ、面をもう一度切り直す。
 *   3. 影は必ず直線の縁を持つ。ぼけた影は1つもない。
 *   4. ステンシルの数字。工場の躯体に刷られた文字をそのまま図に入れる。
 *      デムスの《黄金の5》へのうなずき。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "pc";

const PALE = "#e2e6e8";
const STEEL = "#6f8a9c";
const RUST = "#c07a4a";
const DARK = "#1e2831"; // 一段深く。前は影が中間調に留まって画面が眠かった
const SAND = "#d9c9a8";
/* 5色から作った段 */
const HI = "#fbfcfc"; // 陽の面はほぼ白まで上げる
const EDGE = "#8fa0ac";
const MID = "#31404d";
const SKY1 = "#5c7787";
const SKY2 = "#7d95a4";
const SKY3 = "#a9bcc6";
const SKY4 = "#cdd9de";
const RUST_D = "#8a5330";

const GND = 640; // 地面

/**
 * 円筒。丸みを6段の縦帯で作る。光は左上から。
 * 初稿は等幅の帯にしたので、5本ぜんぶが同じ縞になりバーコードに見えた。
 * 円筒を正面から見ると帯は端ほど詰まる（x = (1-cosθ)/2）。
 * この割りにするだけで、平塗りのままで丸くなる。
 */
const BAND: [number, number][] = [
  [0, 0.067], [0.067, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 0.933], [0.933, 1],
];
const TONE = ["#8fa0ac", "#f0ece0", "#d9c9a8", "#8ba0ae", "#55666f", "#313c46"];
/** ステンシルの数字も同じ割りで陰る。躯体に刷られた文字だから */
const TONE_RUST = ["#a8683e", "#e0975c", "#c07a4a", "#8a5330", "#6b4026", "#4e2f1d"];

function Silo({ x, w, top, cap }: { x: number; w: number; top: number; cap?: boolean }) {
  const bands: [number, number, string][] = BAND.map(([a, b], i) => [a, b, TONE[i]]);
  return (
    <g>
      {bands.map(([a, b, c], i) => (
        <rect key={`b${i}`} x={x + w * a} y={top} width={w * (b - a) + 0.4} height={GND - top} fill={c} />
      ))}
      {/* 冠。サイロの頂部の帯。段をもう一度ずらして厚みを出す */}
      {cap !== false && (
        <>
          <rect x={x - 3} y={top - 14} width={w + 6} height="14" fill={SAND} />
          <rect x={x - 3 + (w + 6) * 0.56} y={top - 14} width={(w + 6) * 0.44} height="14" fill={STEEL} />
          <rect x={x - 3} y={top - 14} width={w + 6} height="3.5" fill={HI} />
        </>
      )}
      {/* 継ぎ目の縦線。コンクリートの打ち継ぎ */}
      <rect x={x + w - 0.9} y={top} width="1.8" height={GND - top} fill={DARK} opacity="0.5" />
    </g>
  );
}

export default function Plate() {
  const r = rand(19270411);

  /* 貨車の窓のような小窓。ヘッドハウスに開ける */
  const windows = Array.from({ length: 14 }, (_, i) => ({
    x: 262 + (i % 7) * 34,
    y: 200 + Math.floor(i / 7) * 26,
    lit: i % 5 === 1,
  }));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="プレシジョニズム様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        <mask id={`${P}-five`}>
          <rect width="600" height="800" fill="#000" />
          <text
            x="374" y="590"
            fill="#fff"
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fontSize="168"
            fontWeight="800"
            textAnchor="middle"
          >
            5
          </text>
        </mask>
        <clipPath id={`${P}-yard`}>
          <rect x="0" y={GND} width="600" height={800 - GND} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* ── 空。4段。滑らかに繋がない ─────────────────────────── */}
        <rect width="600" height="176" fill={SKY1} />
        <rect y="176" width="600" height="152" fill={SKY2} />
        <rect y="328" width="600" height="164" fill={SKY3} />
        <rect y="492" width="600" height={GND - 492} fill={SKY4} />
        {/* 斜めの光の帯。空を斜めにもう一度割る */}
        <path d="M-20 -20 L212 -20 L-20 372 Z" fill={PALE} opacity="0.2" />
        <path d="M600 96 L600 -20 L336 -20 Z" fill={DARK} opacity="0.12" />

        {/* ── 遠景の低い建屋。地平を刻む ───────────────────────── */}
        <rect x="-20" y="590" width="140" height={GND - 590} fill={STEEL} />
        <path d="M-20 590 L52 566 L120 590 Z" fill={EDGE} />
        <rect x="540" y="576" width="80" height={GND - 576} fill={MID} />
        <rect x="540" y="576" width="80" height="6" fill={STEEL} />

        {/* ── 煙突。左を垂直に押さえる ───────────────────────────── */}
        <g>
          <path d={`M92 ${GND} L104 24 L136 24 L152 ${GND} Z`} fill={SAND} />
          <path d={`M124 ${GND} L128 24 L136 24 L152 ${GND} Z`} fill={STEEL} />
          <path d={`M141 ${GND} L133 24 L136 24 L152 ${GND} Z`} fill={MID} />
          <path d="M100 24 L140 24 L142 44 L98 44 Z" fill={MID} />
          <path d="M100 24 L140 24 L140 29 L100 29 Z" fill={HI} />
          {/* 帯。等間隔でなく、下ほど詰める */}
          {[120, 236, 358, 470, 560].map((y, i) => {
            const t = (y - 24) / (GND - 24);
            const x0 = 92 + (104 - 92) * (1 - t);
            const x1 = 152 - (152 - 136) * (1 - t);
            return <rect key={`bd${i}`} x={x0} y={y} width={x1 - x0} height={7 - i * 0.6} fill={RUST_D} opacity="0.8" />;
          })}
        </g>

        {/* ── サイロ群。5本。頭に建屋を載せる ─────────────────────── */}
        <rect x="240" y="176" width="272" height="78" fill={SAND} />
        <rect x="240" y="176" width="272" height="11" fill={HI} />
        <rect x="240" y="176" width="18" height="78" fill={EDGE} />
        <rect x="446" y="176" width="66" height="78" fill={STEEL} />
        <rect x="490" y="176" width="22" height="78" fill={MID} />
        {windows.map((w, i) => (
          <rect key={`wn${i}`} x={w.x} y={w.y} width="16" height="18" fill={w.lit ? RUST : DARK} />
        ))}

        <Silo x={248} w={63} top={254} />
        <Silo x={311} w={63} top={254} />
        <Silo x={374} w={63} top={254} />
        <Silo x={437} w={63} top={254} />

        {/* 点検回廊。縦縞を横で断つ。円筒の列は横の帯が1本入るだけで建物になる */}
        <rect x="240" y="424" width="256" height="15" fill={MID} />
        <rect x="240" y="424" width="256" height="4" fill={SAND} />
        <rect x="240" y="439" width="256" height="3" fill={DARK} opacity="0.55" />
        <g stroke={MID} strokeWidth="2">
          {Array.from({ length: 15 }, (_, i) => (
            <line key={`rl${i}`} x1={246 + i * 17} y1={406} x2={246 + i * 17} y2={424} />
          ))}
          <line x1="240" y1="407" x2="496" y2="407" strokeWidth="2.4" />
          <line x1="240" y1="415" x2="496" y2="415" strokeWidth="1.6" />
        </g>

        {/* 基礎。円筒が地面で切り落とされると宙に浮く */}
        <rect x="238" y="598" width="260" height={GND - 598} fill={SAND} />
        <rect x="238" y="598" width="260" height="6" fill="#f0ece0" />
        <rect x="238" y={GND - 12} width="260" height="12" fill={MID} />
        <rect x="440" y="598" width="58" height={GND - 598} fill={STEEL} />
        <rect x="474" y="598" width="24" height={GND - 598} fill={MID} />

        {/* ステンシルの数字。躯体に刷られた「5」。デムスの《黄金の5》。
           初稿は数字の上に半透明の矩形を重ねて陰らせたので、四角い染みが出た。
           マスクを切り、数字の中身を円筒と同じ割りの朱で塗り分ける */}
        <g mask={`url(#${P}-five)`}>
          {[248, 311, 374, 437].map((sx) =>
            BAND.map(([a, b], i) => (
              <rect
                key={`f${sx}-${i}`}
                x={sx + 63 * a} y={446} width={63 * (b - a) + 0.4} height={152}
                fill={TONE_RUST[i]}
              />
            )),
          )}
        </g>

        {/* ── 給水塔。右の高い所を占める ───────────────────────────── */}
        <g>
          {/* 脚。先に描いて、槽の背後へ回す */}
          {[520, 546, 578, 608].map((x, i) => (
            <path key={`lg${i}`} d={`M${x} 372 L${x + 6} 372 L${x + 16 - i * 4} ${GND} L${x + 8 - i * 4} ${GND} Z`} fill={MID} />
          ))}
          <g stroke={MID} strokeWidth="2.6">
            <line x1="522" y1="452" x2="616" y2="486" />
            <line x1="616" y1="452" x2="522" y2="486" />
            <line x1="524" y1="548" x2="614" y2="580" />
            <line x1="614" y1="548" x2="524" y2="580" />
          </g>
          <rect x="516" y="450" width="104" height="4" fill={MID} />
          <rect x="518" y="546" width="104" height="4" fill={MID} />
          {/* 槽。円筒と同じ割りで陰らせる */}
          {BAND.map(([a, b], i) => (
            <rect key={`tk${i}`} x={512 + 108 * a} y={306} width={108 * (b - a) + 0.4} height={68} fill={TONE[i]} />
          ))}
          <path d="M506 308 L626 308 L602 284 L530 284 Z" fill={SAND} />
          <path d="M572 308 L626 308 L602 284 L572 284 Z" fill={STEEL} />
          <path d="M598 308 L626 308 L602 284 L594 284 Z" fill={MID} />
          <rect x="506" y="304" width="120" height="5" fill={HI} />
          <rect x="560" y="262" width="7" height="24" fill={DARK} />
        </g>

        {/* ── 搬送橋。煙突とサイロを斜めに結ぶ ───────────────────── */}
        <path d="M140 322 L252 262 L252 288 L140 348 Z" fill={SAND} />
        <path d="M140 336 L252 276 L252 288 L140 348 Z" fill={STEEL} />
        <path d="M140 322 L252 262 L252 268 L140 328 Z" fill={HI} />
        {/* 橋の骨組。斜材は帯の中で折り返す。はみ出すと梯子に見える（初稿の失敗） */}
        <g stroke={MID} strokeWidth="2.2">
          {Array.from({ length: 10 }, (_, i) => {
            const t = i / 9;
            const x = 142 + t * 104;
            const y = 323 - t * 55;
            const up = i % 2 === 0;
            return (
              <line key={`tr${i}`}
                    x1={x} y1={up ? y + 2 : y + 24}
                    x2={x + 11} y2={up ? y + 24 : y + 2} />
            );
          })}
        </g>

        {/* ── 影。すべて直線の縁を持ち、右へ倒れる ─────────────────── */}
        <g clipPath={`url(#${P}-yard)`}>
          <rect x="0" y={GND} width="600" height="160" fill={SAND} />
          <path d={`M248 ${GND} L500 ${GND} L600 ${GND + 118} L336 ${GND + 118} Z`} fill={STEEL} opacity="0.85" />
          <path d={`M92 ${GND} L152 ${GND} L206 ${GND + 92} L142 ${GND + 92} Z`} fill={STEEL} opacity="0.7" />
          {/* 引き込み線。手前で開く */}
          <g stroke={MID} strokeWidth="3">
            <line x1="196" y1={GND} x2="20" y2="800" />
            <line x1="226" y1={GND} x2="118" y2="800" />
            <line x1="392" y1={GND} x2="470" y2="800" />
            <line x1="420" y1={GND} x2="566" y2="800" />
          </g>
          {/* 枕木。遠近で詰める */}
          <g fill={MID} opacity="0.55">
            {Array.from({ length: 12 }, (_, i) => {
              const t = (i / 11) ** 1.7;
              const y = GND + 6 + t * 150;
              const w = 46 + t * 120;
              const x = 210 - t * 150;
              return <rect key={`ts${i}`} x={x} y={y} width={w} height={3 + t * 3} />;
            })}
          </g>
          {/* 貨車。1両だけ。尺度の物差し */}
          <rect x="404" y={GND + 12} width="140" height="40" fill={RUST_D} />
          <rect x="404" y={GND + 12} width="140" height="7" fill={RUST} />
          <rect x="404" y={GND + 44} width="140" height="8" fill={DARK} />
          {[420, 444, 502, 526].map((x, i) => (
            <circle key={`wh${i}`} cx={x} cy={GND + 56} r="7" fill={DARK} />
          ))}
          <rect x="416" y={GND + 22} width="116" height="1.6" fill={DARK} opacity="0.6" />
        </g>

        {/* ── 光線。物を無視して版面を横切る。この様式の指紋 ───────── */}
        {/* 広い光の面を2枚。線だけだと紙の引っかき傷に見えた。
            プレシジョニズムの光は「線」であると同時に「透明な面」でもある */}
        <g>
          <path d="M-40 -40 L128 -40 L440 800 L96 800 Z" fill={HI} opacity="0.11" />
          <path d="M620 40 L620 -40 L390 -40 L96 800 L330 800 Z" fill={DARK} opacity="0.07" />
        </g>
        <g strokeLinecap="butt">
          {Array.from({ length: 8 }, (_, i) => {
            const a = -0.62 + i * 0.09 + r(-0.008, 0.008);
            const L = 1500;
            return (
              <line
                key={`ry${i}`}
                x1={-180} y1={-160}
                x2={-180 + Math.cos(a) * L} y2={-160 + Math.sin(a) * L}
                stroke={i % 3 === 0 ? DARK : PALE}
                strokeWidth={i % 3 === 0 ? 1.2 : 1.8}
                opacity={i % 3 === 0 ? 0.22 : 0.34}
              />
            );
          })}
          {/* 逆向きにもう一群。交点が面を切り直す */}
          {Array.from({ length: 4 }, (_, i) => {
            const a = 2.05 + i * 0.1;
            return (
              <line
                key={`ry2${i}`}
                x1={760} y1={-120}
                x2={760 + Math.cos(a) * 1500} y2={-120 + Math.sin(a) * 1500}
                stroke={PALE}
                strokeWidth="1.4"
                opacity="0.4"
              />
            );
          })}
        </g>

        {/* ── 題字。地面の帯に。機械の銘板のように ────────────────── */}
        <rect x="0" y="742" width="600" height="58" fill={DARK} />
        <text
          x="36" y="774"
          fill={PALE}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="23"
          fontWeight="700"
          letterSpacing="6.5"
        >
          PRECISIONISM
        </text>
        <text
          x="38" y="790"
          fill={SAND}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="9"
          letterSpacing="2.6"
          opacity="0.8"
        >
          CONCRETE — STEEL — GRAIN / ELEVATOR No. 5 / 1927
        </text>
        {/* 銘板の右端に、面の段を並べた見本。近くで見る細部 */}
        <g>
          {[HI, SAND, STEEL, MID, DARK].map((c, i) => (
            <rect key={`sw${i}`} x={512 + i * 16} y={756} width="14" height="30" fill={c} stroke={PALE} strokeWidth="0.6" />
          ))}
        </g>

        {/* 紙の目。薄く。硬い縁を殺さない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grain})`}
          opacity="0.11"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
