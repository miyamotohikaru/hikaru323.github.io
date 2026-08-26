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

const P = "jpd";
const WALL = "#eae5db";
const FLOOR = "#d5ccbc";
const WOOD = "#b9ab97";
const WOOD_D = "#9c8f7c";
const MID = "#6f6656";
const DARK = "#2f2c26";
const LINEN = "#bdb2a0";

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
        <rect y={FLOOR_Y - 10} width="600" height="10" fill="#cec5b5" />
        <line x1="0" y1={FLOOR_Y - 9} x2="600" y2={FLOOR_Y - 9} stroke={MID} strokeWidth="1" opacity="0.4" />
        <line x1="0" y1={FLOOR_Y} x2="600" y2={FLOOR_Y} stroke={MID} strokeWidth="1.6" opacity="0.7" />

        {/* 壁の目地。40の倍数。整理の下地はここに敷いておく */}
        <g stroke={MID} strokeWidth="0.6" opacity="0.16">
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
          <rect x="48" y="88" width="220" height="386" fill={`url(#${P}-shoji)`} />
          <g stroke={MID} strokeWidth="1.8" opacity="0.72">
            {Array.from({ length: 2 }, (_, i) => (
              <line key={`v${i}`} x1={48 + (220 / 3) * (i + 1)} y1="88" x2={48 + (220 / 3) * (i + 1)} y2="474" />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1="48" y1={88 + (386 / 6) * (i + 1)} x2="268" y2={88 + (386 / 6) * (i + 1)} />
            ))}
          </g>
          <rect x="48" y="88" width="220" height="386" fill="none" stroke={DARK} strokeWidth="3.6" opacity="0.72" />
          {/* 框の内側にもう1本。framing が締まる */}
          <rect x="54" y="94" width="208" height="374" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.55" />
        </g>

        {/* ── 提灯。C 通りに吊る ─────────────────────────────── */}
        <line x1="452" y1="0" x2="452" y2="198" stroke={DARK} strokeWidth="1.4" />
        <rect x="444" y="192" width="16" height="9" fill={DARK} />
        {/* 紙の笠。上が細く下が広い切頭円錐 */}
        <path d="M 430 198 L 474 198 L 518 330 Q 452 344 386 330 Z" fill={`url(#${P}-shade)`} />
        <g stroke="#b3a894" strokeWidth="0.8" opacity="0.5">
          {Array.from({ length: 7 }, (_, i) => {
            const t = (i + 1) / 8;
            const half = 22 + t * 44;
            const y = 198 + t * 132;
            return <line key={i} x1={452 - half} y1={y} x2={452 + half} y2={y} />;
          })}
        </g>
        <path d="M 430 198 L 474 198 L 518 330 Q 452 344 386 330 Z" fill="none" stroke={MID}
              strokeWidth="1.5" opacity="0.7" />
        {/* 灯りの落ちる範囲。台の上で消す */}
        {/* 天板を照らす楕円も足したが、台の右端からはみ出して
            白い円盤が浮いて見えたので消した。滲みは笠の下だけ */}
        <ellipse cx="452" cy="336" rx="132" ry="96" fill={`url(#${P}-pool)`} />

        {/* ── 低い飾り台 ─────────────────────────────────────── */}
        {/* 天板 */}
        <rect x="88" y="478" width="398" height="17" fill={`url(#${P}-wood)`} />
        <rect x="88" y="493" width="398" height="3.4" fill={WOOD_D} opacity="0.8" />
        {/* 胴。引き出し2杯。目地は左右対称に割る */}
        <rect x="102" y="496" width="370" height="76" fill={WOOD} />
        <g stroke={WOOD_D} strokeWidth="1.2" opacity="0.8">
          <line x1="287" y1="496" x2="287" y2="572" />
          <line x1="102" y1="572" x2="472" y2="572" />
        </g>
        {/* 木目。横に流す。縦だと突板に見えない */}
        <g stroke="#a89a86" strokeWidth="0.6" opacity="0.45">
          {Array.from({ length: 13 }, (_, i) => {
            const y = 502 + i * 5.2 + rg(-1, 1);
            return <line key={i} x1="104" y1={y} x2="470" y2={y + rg(-0.8, 0.8)} />;
          })}
        </g>
        {/* 掘り込みの取手。金物を出さないのがこの様式 */}
        <g fill={WOOD_D} opacity="0.8">
          <rect x="176" y="528" width="52" height="6" rx="3" />
          <rect x="346" y="528" width="52" height="6" rx="3" />
        </g>
        {/* 開いた脚。北欧側の作法 */}
        <g fill={WOOD_D}>
          <path d="M 118 572 L 131 572 L 112 618 L 101 618 Z" />
          <path d="M 443 572 L 456 572 L 473 618 L 462 618 Z" />
          <path d="M 232 572 L 242 572 L 232 618 L 223 618 Z" opacity="0.75" />
          <path d="M 342 572 L 352 572 L 358 618 L 349 618 Z" opacity="0.75" />
        </g>
        {/* 接地の影。細く、短く */}
        <g fill={MID} opacity="0.18">
          <rect x="95" y="617" width="30" height="3.4" rx="1.7" />
          <rect x="217" y="617" width="24" height="3.4" rx="1.7" />
          <rect x="345" y="617" width="24" height="3.4" rx="1.7" />
          <rect x="456" y="617" width="30" height="3.4" rx="1.7" />
        </g>

        {/* ── 台の上。3点だけ。左から花器・鉢・冊子 ───────────── */}
        {/* 花器。黒はここに集める */}
        <path d="M 146 478 L 151 380 L 191 380 L 196 478 Z" fill={DARK} />
        <rect x="149" y="380" width="44" height="5" fill="#3d3931" />
        <rect x="156" y="394" width="8" height="66" fill="#4a463d" opacity="0.55" />
        {/* 枝。1本、葉は4枚。左右に散らさない */}
        <g stroke={MID} strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M 171 380 L 178 330 L 198 288 L 216 260" />
          <path d="M 181 322 L 203 310" strokeWidth="1.1" />
          <path d="M 192 296 L 172 290" strokeWidth="1.1" />
        </g>
        <g fill={MID} opacity="0.85">
          <ellipse cx="207" cy="306" rx="13" ry="5.4" transform="rotate(-22 207 306)" />
          <ellipse cx="168" cy="287" rx="12" ry="5" transform="rotate(16 168 287)" />
          <ellipse cx="220" cy="262" rx="11" ry="4.6" transform="rotate(-34 220 262)" />
          <ellipse cx="187" cy="344" rx="11" ry="4.6" transform="rotate(24 187 344)" />
        </g>
        {/* 浅い鉢 */}
        <path d="M 252 454 L 320 454 Q 313 478 286 478 Q 259 478 252 454 Z" fill="#d3cabb" />
        <ellipse cx="286" cy="454" rx="34" ry="5.6" fill="#bfb5a3" />
        <ellipse cx="286" cy="454" rx="26" ry="3.8" fill="#a89b86" opacity="0.7" />
        {/* 平積みの冊子。角は揃える */}
        <rect x="346" y="464" width="94" height="7" fill={LINEN} />
        <rect x="350" y="471" width="90" height="7" fill={WOOD} />
        <line x1="346" y1="467.5" x2="440" y2="467.5" stroke={MID} strokeWidth="0.7" opacity="0.6" />

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
          <line x1="88" y1="726" x2="252" y2="726" />
          <line x1="322" y1="726" x2="486" y2="726" />
          <line x1="88" y1="718" x2="88" y2="734" />
          <line x1="486" y1="718" x2="486" y2="734" />
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
