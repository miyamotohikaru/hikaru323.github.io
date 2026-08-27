/**
 * ストリームライン・モダン。
 *
 * 1930年代。風洞実験の見た目だけを、走らない物にまで移植した様式。
 * 冷蔵庫にも鉛筆削りにも「速そうな丸み」が付いた。
 * だから図版は、その語彙が最初に生まれた場所＝流線型機関車で組む。
 *
 * ■ この様式でなければ成立しない3つ
 *   1. 三本組の水平線（スピードライン）。1本でも4本でもなく3本。
 *      物の側面を鼻先まで巻き込んで走る。この線が無いと、
 *      ただの丸い機関車になる。
 *   2. 角の丸み。版面そのものを角丸の板にした。1930年代のラジオも
 *      建物の隅も、すべてこの半径を持っている。
 *   3. クロームの階調。平らな銀ではなく、明→暗→明の帯。
 *      金属の照りは色ではなく階調で描く。
 *
 * ■ 速度は「後ろ」で描く
 *   機関車そのものを傾けたり歪ませたりしない。空と地面に水平の
 *   流れ筋を引き、車体は静止させる。初稿で車体を斜めにしたら
 *   ただの事故現場に見えた。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "smd";

const CHROME = "#e4e6e3";
const STEEL = "#7a8f99";
const RED = "#c0392b";
const BRASS = "#d9b26a";
const NIGHT = "#2b3138";

const R = 54; // 角の丸み。この半径が様式そのもの

/* 三本組。鼻先で下がり、後方で水平になる */
const speed = (dy: number) =>
  `M50 ${540 + dy} C 56 ${508 + dy} 86 ${486 + dy} 142 ${476 + dy} C 242 ${462 + dy} 420 ${458 + dy} 620 ${458 + dy}`;

/* 車体。初稿は屋根を大きく反らせて船の舷側に見えた。
   屋根をほぼ水平にし、鼻先だけを落として、正面をほぼ垂直の
   丸い舳先にすると、途端に流線型機関車になる */
const BODY =
  "M620 610 L620 332 C 520 328 400 326 300 332 C 238 336 188 346 152 362 C 106 382 74 414 60 454 C 48 488 46 546 50 610 Z";

const GROUND = 614;
const RAIL = 656;
const WHEELS = [180, 280, 380, 480];

export default function Plate() {
  const r = rand(19360401);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ストリームライン・モダン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* 角丸の板。この形が様式の宣言 */}
        <clipPath id={`${P}-panel`}><rect x="18" y="18" width="564" height="764" rx={R} ry={R} /></clipPath>
        <clipPath id={`${P}-body`}><path d={BODY} /></clipPath>

        <linearGradient id={`${P}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#232931" />
          <stop offset="0.42" stopColor="#4e626e" />
          <stop offset="0.78" stopColor="#a8bac0" />
          <stop offset="1" stopColor="#dfe4e0" />
        </linearGradient>
        {/* クローム。明→暗→明。金属は色でなく階調 */}
        <linearGradient id={`${P}-chrome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.34" stopColor="#c3cbcd" />
          <stop offset="0.5" stopColor="#6d7a80" />
          <stop offset="0.68" stopColor="#d3d9d8" />
          <stop offset="1" stopColor="#f6f8f6" />
        </linearGradient>
        {/* 車体。上端に照り、下へ落ちる */}
        <linearGradient id={`${P}-hull`} x1="0.1" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#c2ced2" />
          <stop offset="0.18" stopColor="#93a6ae" />
          <stop offset="0.62" stopColor="#7a8f99" />
          <stop offset="1" stopColor="#56686f" />
        </linearGradient>
        <linearGradient id={`${P}-skirt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#39424a" />
          <stop offset="0.5" stopColor="#2b3138" />
          <stop offset="1" stopColor="#141a20" />
        </linearGradient>
        {/* 低い陽 */}
        <radialGradient id={`${P}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f0d9a4" stopOpacity="0.95" />
          <stop offset="0.35" stopColor={BRASS} stopOpacity="0.6" />
          <stop offset="1" stopColor={BRASS} stopOpacity="0" />
        </radialGradient>
        {/* 煙。鼻先が濃く、後方へ消える */}
        <linearGradient id={`${P}-smoke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cdd6da" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#cdd6da" stopOpacity="0.16" />
          <stop offset="1" stopColor="#cdd6da" stopOpacity="0" />
        </linearGradient>
        {/* 流れ筋。両端が消える */}
        <linearGradient id={`${P}-streak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${P}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b9b9f" />
          <stop offset="1" stopColor="#2f383e" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        {/* 板の外。角丸を成立させるための地 */}
        <rect width="600" height="800" fill="#cfd4d1" />

        <g clipPath={`url(#${P}-panel)`}>
          {/* ── 空 ─────────────────────────────────────── */}
          <rect width="600" height="600" fill={`url(#${P}-sky)`} />
          <circle cx="430" cy="572" r="176" fill={`url(#${P}-sun)`} />

          {/* 空の流れ筋。速度はここで描く。車体は歪ませない */}
          {Array.from({ length: 11 }, (_, i) => {
            const y = 120 + i * 38 + r(-14, 14);
            const x = r(-40, 200);
            return <rect key={i} x={x} y={y} width={r(200, 480)} height={r(1.4, 4)} fill={`url(#${P}-streak)`} opacity={r(0.14, 0.42)} />;
          })}

          {/* ── 煙。鼻先から後方へなびかせる。空の余白はこれで埋める。
                 車体を傾けずに速度を語る、もう一つの手。
                 楕円を並べたら数珠に見えたので、1枚の掃き出し形にした ─── */}
          <path
            d="M146 356 C 236 306 306 258 404 226 C 486 200 560 190 620 184 L620 288 C 548 296 476 318 404 348 C 322 382 236 400 158 402 Z"
            fill={`url(#${P}-smoke)`}
          />
          {Array.from({ length: 12 }, (_, i) => {
            const t = i / 11;
            const x = 170 + t * 430 + r(-18, 18);
            const y = 340 - t * 150 - Math.sin(t * 2.2) * 22 + r(-16, 16);
            return <ellipse key={i} cx={x} cy={y} rx={16 + t * 46 + r(-6, 6)} ry={11 + t * 28} fill="#cdd6da" opacity={(0.09 - t * 0.05) * r(0.6, 1.3)} />;
          })}

          {/* ── 題字。空の側に置き、車体と重ねない ────────── */}
          <text x="52" y="112" fill={CHROME} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="52" fontWeight="800" letterSpacing="-1.4">
            STREAMLINE
          </text>
          <text x="54" y="152" fill={BRASS} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="27" fontWeight="400" letterSpacing="15">
            MODERNE
          </text>
          {/* 題字から後方へ抜ける三本組 */}
          {[0, 9, 18].map((dy, i) => (
            <rect key={i} x={396 - i * 26} y={122 + dy} width={186 + i * 26} height="3.2" fill={CHROME} opacity={0.85 - i * 0.18} rx="1.6" />
          ))}

          {/* ── 地面と軌道 ─────────────────────────────── */}
          <rect y={GROUND} width="600" height={800 - GROUND} fill={`url(#${P}-ground)`} />
          {/* 枕木。手前ほど間隔が開く */}
          {Array.from({ length: 26 }, (_, i) => {
            const t = i / 25;
            const y = GROUND + 4 + t * t * 172;
            return <rect key={i} x={-20 + t * -60} y={y} width={640 + t * 120} height={1.5 + t * 5} fill={NIGHT} opacity={0.16 + t * 0.24} />;
          })}
          {/* 走行方向の流れ筋 */}
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={r(-60, 320)} y={GROUND + 6 + r(0, 172)} width={r(140, 420)} height={r(1.2, 3.4)} fill={`url(#${P}-streak)`} opacity={r(0.1, 0.34)} />
          ))}
          {/* 砕石。流れ筋だけだと水面に見える */}
          {Array.from({ length: 220 }, (_, i) => {
            const t = r();
            const y = GROUND + 8 + t * t * 172;
            return <circle key={i} cx={r(0, 600)} cy={y} r={0.7 + t * 2.4} fill={NIGHT} opacity={r(0.1, 0.4)} />;
          })}
          {/* レール。2本の光の筋 */}
          <rect x="-20" y={RAIL} width="640" height="3.4" fill={CHROME} opacity="0.55" />
          <rect x="-20" y={RAIL + 46} width="640" height="4" fill={CHROME} opacity="0.3" />

          {/* ── 車輪。車体より先に。スカートから覗かせる ───── */}
          {WHEELS.map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={RAIL - 34} r="34" fill="#1b2127" />
              <circle cx={x} cy={RAIL - 34} r="34" fill="none" stroke={CHROME} strokeWidth="2" opacity="0.35" />
              <circle cx={x} cy={RAIL - 34} r="13" fill="#3c464c" />
              <circle cx={x} cy={RAIL - 34} r="4" fill={BRASS} />
              {/* 回転の残像 */}
              {Array.from({ length: 5 }, (_, k) => (
                <line
                  key={k}
                  x1={x} y1={RAIL - 34}
                  x2={x + Math.cos((k * 72 + i * 17) * Math.PI / 180) * 30}
                  y2={RAIL - 34 + Math.sin((k * 72 + i * 17) * Math.PI / 180) * 30}
                  stroke={CHROME} strokeWidth="1.6" opacity="0.18"
                />
              ))}
            </g>
          ))}
          {/* 連結棒。斜めに1本入ると機械になる */}
          <rect x="170" y={RAIL - 22} width="330" height="7" rx="3.5" fill="#4d5a61" transform={`rotate(-2 335 ${RAIL - 18})`} />
          <rect x="170" y={RAIL - 22} width="330" height="2.4" rx="1.2" fill={CHROME} opacity="0.4" transform={`rotate(-2 335 ${RAIL - 18})`} />

          {/* ── 車体 ───────────────────────────────────── */}
          <g clipPath={`url(#${P}-body)`}>
            <path d={BODY} fill={`url(#${P}-hull)`} />

            {/* 三本組より下は暗い。二色に割るのが流線型の定石 */}
            <path d={`${speed(31)} L620 660 L0 660 Z`} fill={`url(#${P}-skirt)`} />
            {/* 裾のクローム。地面の光を拾う */}
            <path d="M50 596 C 140 594 340 592 620 592" stroke={CHROME} strokeWidth="3.4" fill="none" opacity="0.42" />

            {/* 赤の細帯。1930年代の塗り分けは必ず1本だけ赤が入る */}
            <path d={speed(-11)} stroke={RED} strokeWidth="7" fill="none" />

            {/* 三本組のスピードライン。この図版の主役 */}
            {[0, 13, 26].map((dy, i) => (
              <g key={i}>
                <path d={speed(dy)} stroke={`url(#${P}-chrome)`} strokeWidth="7" fill="none" />
                <path d={speed(dy + 4)} stroke="#141a20" strokeWidth="1.4" fill="none" opacity="0.5" />
              </g>
            ))}

            {/* 屋根の照り。1本の白い線で丸みが出る */}
            <path
              d="M64 464 C 80 420 122 388 186 368 C 268 344 430 338 620 340"
              stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.3"
            />
            <path
              d="M78 466 C 96 430 136 402 196 384 C 274 362 430 356 620 358"
              stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.34"
            />
            {/* 舳先を縦に走るクロームのフィン。流線型の決まり物 */}
            <path d="M60 454 C 48 488 46 546 50 610" stroke={`url(#${P}-chrome)`} strokeWidth="7" fill="none" />

            {/* 運転室の窓。鼻先の丸みに沿って巻く */}
            <path d="M116 412 C 140 390 172 376 204 370 L210 398 C 180 404 150 418 128 438 Z" fill="#161c23" />
            <path d="M116 412 C 140 390 172 376 204 370 L206 380 C 176 386 148 400 124 424 Z" fill="#a7bcc4" opacity="0.5" />
            <path d="M162 382 L166 408" stroke={CHROME} strokeWidth="2.2" opacity="0.7" />
            <path d="M116 412 C 140 390 172 376 204 370 L210 398 C 180 404 150 418 128 438 Z" fill="none" stroke={CHROME} strokeWidth="1.8" opacity="0.55" />

            {/* 舷窓。等間隔に3つ。真鍮の縁 */}
            {[300, 372, 444].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={392} r="17" fill={BRASS} />
                <circle cx={x} cy={392} r="13" fill="#171d24" />
                <circle cx={x - 4} cy={388} r="5" fill="#a9bcc4" opacity="0.55" />
                {[0, 90, 180, 270].map((a, k) => (
                  <circle key={k} cx={x + Math.cos((a * Math.PI) / 180) * 15} cy={392 + Math.sin((a * Math.PI) / 180) * 15} r="1.5" fill="#f0e0bc" />
                ))}
              </g>
            ))}

            {/* 通風の羽板。細い縦線の列 */}
            <g stroke={NIGHT} strokeWidth="2" opacity="0.5">
              {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={498 + i * 9} y1="356" x2={498 + i * 9} y2="392" />
              ))}
            </g>
            <g stroke="#cfd8da" strokeWidth="1" opacity="0.45">
              {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={500 + i * 9} y1="356" x2={500 + i * 9} y2="392" />
              ))}
            </g>

            {/* リベットの列。近くで見る細部 */}
            {Array.from({ length: 34 }, (_, i) => {
              const t = i / 33;
              const x = 60 + t * 560;
              const y = 528 - t * 84 - Math.max(0, (0.16 - t) * 320);
              return <circle key={i} cx={x} cy={y} r="1.5" fill="#eef2f1" opacity="0.4" />;
            })}

            {/* 鼻先の前照灯 */}
            <ellipse cx="84" cy="452" rx="17" ry="18" fill={BRASS} />
            <ellipse cx="84" cy="452" rx="11.5" ry="12.5" fill="#fff6df" />
            <ellipse cx="80" cy="447" rx="4.5" ry="5" fill="#ffffff" />
            {/* 舳先の意匠板。ここに車号を入れるのが1930年代の作法 */}
            <rect x="72" y="530" width="38" height="17" rx="8.5" fill={BRASS} />
            <text x="91" y="543" textAnchor="middle" fill="#2b3138" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="10" fontWeight="800" letterSpacing="-0.4">36</text>
          </g>
          {/* 車体の稜線 */}
          <path d={BODY} fill="none" stroke="#eef2f1" strokeWidth="1.6" opacity="0.35" />

          {/* 前照灯の光。鼻先から前へ抜ける */}
          <polygon points="52,444 52,462 -40,522 -40,378" fill="#f6e6bd" opacity="0.18" />

          {/* ── 小さな図解。空気の流れ。近くで見る細部 ─────── */}
          <g transform="translate(384 694)">
            <path d="M0 22 C 14 0 52 -6 92 4 C 128 13 150 22 176 22 C 150 22 128 31 92 40 C 52 50 14 44 0 22 Z" fill="none" stroke={CHROME} strokeWidth="1.3" opacity="0.6" />
            {[-16, 0, 16].map((dy, i) => (
              <path key={i} d={`M-34 ${22 + dy * 1.1} C 10 ${22 + dy} 120 ${22 + dy * 0.7} 210 ${22 + dy * 0.35}`} stroke={CHROME} strokeWidth="1" strokeDasharray="7 5" fill="none" opacity="0.45" />
            ))}
            <text x="0" y="66" fill={CHROME} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="7.5" fontWeight="600" letterSpacing="2.4" opacity="0.55">
              DRAG COEFFICIENT 0.24
            </text>
          </g>

          <text x="52" y="738" fill={CHROME} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" fontWeight="600" letterSpacing="3.6" opacity="0.68">
            AERODYNAMIC · CHROME · ROUNDED CORNER
          </text>
          <text x="52" y="758" fill={BRASS} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="9" fontWeight="600" letterSpacing="3.6" opacity="0.8">
            U.S.A. 1930s
          </text>

          <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.16" style={{ mixBlendMode: "multiply" }} />
        </g>

        {/* 角丸の縁。真鍮の細い罫を1本 */}
        <rect x="18" y="18" width="564" height="764" rx={R} ry={R} fill="none" stroke={BRASS} strokeWidth="1.6" opacity="0.85" />
        <rect x="26" y="26" width="548" height="748" rx={R - 8} ry={R - 8} fill="none" stroke={BRASS} strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  );
}
