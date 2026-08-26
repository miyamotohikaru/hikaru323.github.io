/**
 * ジャパンディ。
 *
 * わびさびの隣に置くので、**同じベージュで別のことを言う**必要がある。
 * わびさびが「歪み・欠け・時間」なら、こちらは「直線・寸法・整理」。
 * 感情でいえば **きちんとしている**。だから絵の骨格を、器ではなく
 * **建築の立面図**にした。手描きの揺らぎを1本も入れていない。
 *
 * ■ この絵の骨
 *   1. 通り芯（A・B・C）と寸法線を入れる。図面の作法をそのまま持ち込むと、
 *      「静かなインテリア写真」ではなく「整理されている」が一撃で伝わる。
 *   2. 壁を上、床を下に切り、その境目（y=618）で版面を割る。
 *      家具・照明・敷物を、通り芯の上にきっちり載せる。
 *   3. 素材は木・紙・麻の3つだけ。木は横の木目線、紙は行灯の横リブ、
 *      麻は織りのパターン。平らな塗りで終わらせない。
 *   4. 黒（#2f2c26）は花器と細線だけに使う。北欧側の「一点の黒」。
 *
 * ■ 失敗して直したところ
 *   初稿は家具と小物を置いただけで、わびさびと同じ「ベージュの静物」だった。
 *   通り芯・寸法線・目盛りという**製図の言語**を足した瞬間に、
 *   別の様式として立った。ジャパンディの正体は素材ではなく整理の作法。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "jp";
const WALL = "#eae5db";
const FLOOR = "#e0d9cd";
const WOOD = "#b9ab97";
const WOOD_D = "#9c8f7c";
const MID = "#6f6656";
const DARK = "#2f2c26";
const LINEN = "#c8bfae";

const FLOOR_Y = 618;   // 壁と床の境。版面を割る線
const AXES = [128, 300, 452]; // 通り芯

export default function Plate() {
  const rg = rand(6100);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ジャパンディ様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>

        {/* 麻の織り。敷物用。縦横の細い糸を交差させる */}
        {/* 麻の織り。初稿は目が粗くギンガムに見えた（コテージコアと被る）。
            目を半分にし、縦糸だけをわずかに沈ませて平織りにした */}
        <pattern id={`${P}-linen`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={LINEN} />
          <rect width="4" height="1.6" fill="#d0c8b8" />
          <rect width="1.6" height="4" fill="#c0b7a5" opacity="0.5" />
        </pattern>

        {/* 障子から入る光。上ほど明るい */}
        <linearGradient id={`${P}-shoji`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#f7f4ec" />
          <stop offset="1" stopColor="#e9e3d7" />
        </linearGradient>
        {/* 行灯の紙。中央が明るく、縁で落ちる */}
        <linearGradient id={`${P}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ddd5c6" />
          <stop offset="0.38" stopColor="#f6f1e6" />
          <stop offset="1" stopColor="#d5cdbe" />
        </linearGradient>
        {/* 灯りの落ちる範囲 */}
        {/* 灯り。円錐の帯で描いた2稿は、白い三角が画面で一番強くなり
            舞台照明に見えた。帯をやめ、笠の下に丸い滲みを置くだけにした */}
        <radialGradient id={`${P}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fdfaf2" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#fbf6ea" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fbf6ea" stopOpacity="0" />
        </radialGradient>
        {/* 木口。板の厚みに一段の陰 */}
        <linearGradient id={`${P}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2b49f" />
          <stop offset="1" stopColor="#ab9d88" />
        </linearGradient>
        {/* 壁の足元。床に近いほどわずかに沈む */}
        <linearGradient id={`${P}-wallfoot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#6f6656" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={WALL} />
        <rect y={FLOOR_Y} width="600" height={800 - FLOOR_Y} fill={FLOOR} />
        <rect y={FLOOR_Y - 120} width="600" height="120" fill={`url(#${P}-wallfoot)`} />
        {/* 幅木。ここで版面が上下に割れる。無いと壁と床が同じ紙に見える */}
        <rect y={FLOOR_Y - 9} width="600" height="9" fill="#d9d2c5" />
        <line x1="0" y1={FLOOR_Y - 9} x2="600" y2={FLOOR_Y - 9} stroke={MID} strokeWidth="1" opacity="0.4" />
        <line x1="0" y1={FLOOR_Y} x2="600" y2={FLOOR_Y} stroke={MID} strokeWidth="1.4" opacity="0.55" />

        {/* 壁の目地。40の倍数。整理の下地はここに敷いておく */}
        <g stroke={MID} strokeWidth="0.5" opacity="0.13">
          {Array.from({ length: 15 }, (_, i) => (
            <line key={i} x1="0" y1={40 + i * 40} x2="600" y2={40 + i * 40} />
          ))}
        </g>

        {/* 通り芯。図面の言語。これがあるだけで「整えてある」に変わる */}
        <g opacity="0.32">
          {AXES.map((x, i) => (
            <g key={i}>
              <line x1={x} y1="62" x2={x} y2={FLOOR_Y + 92} stroke={MID} strokeWidth="0.9"
                    strokeDasharray="10 4 2 4" />
              <circle cx={x} cy="48" r="11" fill="none" stroke={MID} strokeWidth="0.9" />
              <text x={x} y="52" textAnchor="middle" fill={MID}
                    fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                    fontSize="11" letterSpacing="0.5">{"ABC"[i]}</text>
            </g>
          ))}
        </g>

        {/* ── 障子。B 通りの左に納める ───────────────────────── */}
        <g>
          <rect x="56" y="104" width="196" height="348" fill={`url(#${P}-shoji)`} />
          <g stroke={MID} strokeWidth="1.4" opacity="0.62">
            {Array.from({ length: 2 }, (_, i) => (
              <line key={`v${i}`} x1={56 + (196 / 3) * (i + 1)} y1="104" x2={56 + (196 / 3) * (i + 1)} y2="452" />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1="56" y1={104 + (348 / 6) * (i + 1)} x2="252" y2={104 + (348 / 6) * (i + 1)} />
            ))}
          </g>
          <rect x="56" y="104" width="196" height="348" fill="none" stroke={MID} strokeWidth="3.2" />
          {/* 框の内側にもう1本。framing が締まる */}
          <rect x="61" y="109" width="186" height="338" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        </g>

        {/* ── 提灯。C 通りに吊る ─────────────────────────────── */}
        <line x1="452" y1="0" x2="452" y2="198" stroke={DARK} strokeWidth="1.4" />
        <rect x="444" y="192" width="16" height="9" fill={DARK} />
        {/* 紙の笠。上が細く下が広い切頭円錐 */}
        <path d="M 434 201 L 470 201 L 508 316 Q 452 328 396 316 Z" fill={`url(#${P}-shade)`} />
        <g stroke="#b3a894" strokeWidth="0.8" opacity="0.5">
          {Array.from({ length: 7 }, (_, i) => {
            const t = (i + 1) / 8;
            const half = 18 + t * 38;
            const y = 201 + t * 115;
            return <line key={i} x1={452 - half} y1={y} x2={452 + half} y2={y} />;
          })}
        </g>
        <path d="M 434 201 L 470 201 L 508 316 Q 452 328 396 316 Z" fill="none" stroke={MID}
              strokeWidth="1.2" opacity="0.55" />
        {/* 灯りの落ちる範囲。台の上で消す */}
        {/* 天板を照らす楕円も足したが、台の右端からはみ出して
            白い円盤が浮いて見えたので消した。滲みは笠の下だけ */}
        <ellipse cx="452" cy="336" rx="132" ry="96" fill={`url(#${P}-pool)`} />

        {/* ── 低い飾り台 ─────────────────────────────────────── */}
        {/* 天板 */}
        <rect x="96" y="486" width="382" height="15" fill={`url(#${P}-wood)`} />
        <rect x="96" y="499" width="382" height="3" fill={WOOD_D} opacity="0.7" />
        {/* 胴。引き出し2杯。目地は左右対称に割る */}
        <rect x="110" y="502" width="354" height="64" fill={WOOD} />
        <g stroke={WOOD_D} strokeWidth="1.2" opacity="0.8">
          <line x1="287" y1="502" x2="287" y2="566" />
          <line x1="110" y1="566" x2="464" y2="566" />
        </g>
        {/* 木目。横に流す。縦だと突板に見えない */}
        <g stroke="#a89a86" strokeWidth="0.6" opacity="0.45">
          {Array.from({ length: 13 }, (_, i) => {
            const y = 506 + i * 4.6 + rg(-1, 1);
            return <line key={i} x1="112" y1={y} x2="462" y2={y + rg(-0.8, 0.8)} />;
          })}
        </g>
        {/* 掘り込みの取手。金物を出さないのがこの様式 */}
        <g fill={WOOD_D} opacity="0.8">
          <rect x="182" y="528" width="46" height="5" rx="2.5" />
          <rect x="346" y="528" width="46" height="5" rx="2.5" />
        </g>
        {/* 開いた脚。北欧側の作法 */}
        <g fill={WOOD_D}>
          <path d="M 126 566 L 137 566 L 121 618 L 112 618 Z" />
          <path d="M 448 566 L 459 566 L 470 618 L 461 618 Z" />
          <path d="M 236 566 L 245 566 L 236 618 L 228 618 Z" opacity="0.75" />
          <path d="M 340 566 L 349 566 L 354 618 L 346 618 Z" opacity="0.75" />
        </g>
        {/* 接地の影。細く、短く */}
        <g fill={MID} opacity="0.18">
          <rect x="104" y="617" width="30" height="3" rx="1.5" />
          <rect x="222" y="617" width="24" height="3" rx="1.5" />
          <rect x="340" y="617" width="24" height="3" rx="1.5" />
          <rect x="452" y="617" width="30" height="3" rx="1.5" />
        </g>

        {/* ── 台の上。3点だけ。左から花器・鉢・冊子 ───────────── */}
        {/* 花器。黒はここに集める */}
        <path d="M 152 486 L 156 404 L 186 404 L 190 486 Z" fill={DARK} />
        <rect x="154" y="404" width="34" height="4" fill="#3d3931" />
        <rect x="158" y="416" width="6" height="52" fill="#4a463d" opacity="0.55" />
        {/* 枝。1本、葉は4枚。左右に散らさない */}
        <g stroke={MID} strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M 171 404 L 178 356 L 196 312 L 212 286" />
          <path d="M 180 348 L 200 336" strokeWidth="1.1" />
          <path d="M 190 322 L 172 316" strokeWidth="1.1" />
        </g>
        <g fill={MID} opacity="0.85">
          <ellipse cx="204" cy="332" rx="11" ry="4.6" transform="rotate(-22 204 332)" />
          <ellipse cx="168" cy="313" rx="10" ry="4.2" transform="rotate(16 168 313)" />
          <ellipse cx="216" cy="288" rx="9" ry="4" transform="rotate(-34 216 288)" />
          <ellipse cx="186" cy="368" rx="9.5" ry="4" transform="rotate(24 186 368)" />
        </g>
        {/* 浅い鉢 */}
        <path d="M 254 466 L 314 466 Q 308 486 284 486 Q 260 486 254 466 Z" fill="#d9d1c2" />
        <ellipse cx="284" cy="466" rx="30" ry="5" fill="#c5bcaa" />
        <ellipse cx="284" cy="466" rx="23" ry="3.4" fill="#b3a894" opacity="0.6" />
        {/* 平積みの冊子。角は揃える */}
        <rect x="340" y="474" width="86" height="6" fill={LINEN} />
        <rect x="344" y="480" width="82" height="6" fill={WOOD} />
        <line x1="340" y1="477" x2="426" y2="477" stroke={MID} strokeWidth="0.6" opacity="0.5" />

        {/* ── 敷物。麻の織り。房を左右に出す ─────────────────── */}
        <rect x="72" y={FLOOR_Y + 4} width="428" height="74" fill={`url(#${P}-linen)`} />
        <rect x="72" y={FLOOR_Y + 4} width="428" height="74" fill="none" stroke={WOOD_D}
              strokeWidth="1" opacity="0.5" />
        <line x1="86" y1={FLOOR_Y + 14} x2="486" y2={FLOOR_Y + 14} stroke={MID} strokeWidth="1.6" opacity="0.35" />
        <line x1="86" y1={FLOOR_Y + 68} x2="486" y2={FLOOR_Y + 68} stroke={MID} strokeWidth="1.6" opacity="0.35" />
        <g stroke={WOOD_D} strokeWidth="0.8" opacity="0.5">
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1="67" y1={FLOOR_Y + 11 + i * 8} x2="72" y2={FLOOR_Y + 11 + i * 8} />
              <line x1="500" y1={FLOOR_Y + 11 + i * 8} x2="505" y2={FLOOR_Y + 11 + i * 8} />
            </g>
          ))}
        </g>

        {/* ── 寸法線。この一本が様式を決める ─────────────────── */}
        <g stroke={MID} strokeWidth="0.9" opacity="0.65">
          <line x1="96" y1="726" x2="252" y2="726" />
          <line x1="322" y1="726" x2="478" y2="726" />
          <line x1="96" y1="718" x2="96" y2="734" />
          <line x1="478" y1="718" x2="478" y2="734" />
          <line x1="287" y1="710" x2="287" y2="742" strokeDasharray="3 3" opacity="0.7" />
        </g>
        <text x="287" y="730" textAnchor="middle" fill={MID}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="11"
              letterSpacing="1.6" opacity="0.85">1200</text>

        {/* ── 文字 ───────────────────────────────────────────── */}
        <text transform="translate(566 716) rotate(-90)" fill={DARK}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="15"
              fontWeight="500" letterSpacing="8.5" opacity="0.72">JAPANDI</text>
        <text x="40" y="762" fill={DARK} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="9.5" fontWeight="600" letterSpacing="3.4" opacity="0.6">
          ELEVATION — 1:20
        </text>
        <text x="40" y="780" fill={MID} fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="8.5" letterSpacing="2.2" opacity="0.5">
          PAPER · OAK · LINEN — THREE MATERIALS, NO MORE
        </text>

        {/* 上質紙の目。ざら紙にすると北欧側が消える */}
        <rect width="600" height="800" filter={`url(#${ATLAS.grain})`} opacity="0.13"
              style={{ mixBlendMode: "multiply" }} />
      </g>
    </svg>
  );
}
