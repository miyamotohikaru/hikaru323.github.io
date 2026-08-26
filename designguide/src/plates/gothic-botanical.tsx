/**
 * ゴシック・ボタニカル。
 *
 * 18–19世紀の植物図譜（herbarium plate）の書式を、黒い地に反転させる。
 * 白紙に黒線ではなく、闇に骨色の線。そこだけが現代の折衷。
 *
 * ■ ここで作っている「らしさ」
 *   1. 図譜の書式を守ること。全形図・解剖図・番号・学名・図版番号。
 *      「暗い背景に植物のイラスト」では図譜にならない。
 *      解剖図（種子・雄しべ・蒴果の断面）と番号があってはじめて、
 *      これは観察の記録である、という顔になる。
 *   2. 線が観察の線であること。装飾の曲線ではない。
 *      葉は sin で葉縁を刻み、葉脈を葉裂の先へ通し、
 *      その間だけにハッチを入れる。輪郭をなぞるだけだと標本に見えない。
 *   3. 色は一点だけ。全体は骨色の線画で、花弁だけが葡萄酒色。
 *      二色目を足した瞬間に図譜ではなく壁紙になる。
 *   4. 根を見せること。図譜は地上部だけを描かない。
 *      掘り上げた全草を描くのが標本の作法で、これが「ゴシック」に効く。
 *
 * ■ 隣のアール・ヌーヴォーと混ざらないようにしたこと
 *   あちらは太さの変わる装飾曲線、こちらは太さの一定な観察線。
 *   だから taper を一切使っていない。線幅は 0.8〜1.4 で固定。
 */
import { ATLAS, rand, rad, onCircle, shift, alpha } from "@/lib/plate";

const P = "gb";
const NIGHT = "#101512";
const GREEN = "#2f4a35";
const WINE = "#7a2f3a";
const BONE = "#c8b88a";
const LIGHT = "#e6e2d6";

/** 葉。葉縁を sin で刻む。単なる楕円だと標本に見えない */
const lobeW = (t: number, w: number, lobes: number, ph: number) => {
  // 先を尖らせる包絡。基部を細く、中程で最大、先端で 0 に落とす
  const env = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.7);
  // 切れ込み。|cos| を鈍らせると裂片が丸く、鋭くすると深く切れる
  const cut = 0.22 + 0.78 * Math.pow(Math.abs(Math.cos(t * Math.PI * lobes + ph)), 0.55);
  return w * env * cut;
};

function leafPath(len: number, w: number, lobes: number) {
  const N = 72;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    top.push(`${(t * len).toFixed(1)} ${(-lobeW(t, w, lobes, 0)).toFixed(1)}`);
    // 下側は半周期ずらす。同位相にすると帯になる（初稿でそうなった）
    bot.push(`${(t * len).toFixed(1)} ${lobeW(t, w, lobes, Math.PI / 2).toFixed(1)}`);
  }
  return `M${top.join(" L")} L${bot.reverse().join(" L")} Z`;
}

/** 葉の一枚。輪郭・葉脈・ハッチを同じ形から作る */
function Leaf({ id, x, y, len, w, rot, lobes, flip = 1 }: {
  id: string; x: number; y: number; len: number; w: number; rot: number; lobes: number; flip?: number;
}) {
  const d = leafPath(len, w, lobes);
  // 側脈は裂片の先へ通す。上下で位相が違うので別々に取る
  const veins = Array.from({ length: lobes * 2 }, (_, k) => {
    const up = k % 2 === 0;
    const t = ((up ? k / 2 : (k - 1) / 2) + (up ? 0 : 0.5)) / lobes;
    return { t, hw: lobeW(t, w, lobes, up ? 0 : Math.PI / 2), up };
  }).filter((v) => v.t > 0.06 && v.t < 0.96);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${flip})`}>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={alpha(GREEN, 0.42)} stroke={BONE} strokeWidth="1.1" />
      {/* ハッチ。葉の中だけ。片側を密にして丸みを出す */}
      <g clipPath={`url(#${id})`} stroke={BONE} strokeWidth="0.6" opacity="0.5">
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={i * (len / 24)} y1={-w * 1.3} x2={i * (len / 24) - w * 1.6} y2={w * 1.3} opacity={0.25 + (i % 3) * 0.22} />
        ))}
      </g>
      {/* 主脈と側脈。側脈は必ず葉裂の先へ通す */}
      <line x1="0" y1="0" x2={len} y2="0" stroke={BONE} strokeWidth="1.2" />
      {veins.map((v, i) => (
        <line
          key={i}
          x1={v.t * len * 0.82}
          y1="0"
          x2={v.t * len + len * 0.03}
          y2={(v.up ? -1 : 1) * v.hw * 0.9}
          stroke={BONE}
          strokeWidth="0.7"
        />
      ))}
    </g>
  );
}

/** 花弁。縁を波打たせる。ケシの花弁は必ず皺が寄っている */
function petalPath(r: number, spread: number, wob: number) {
  const N = 40;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const a = -spread + (spread * 2 * i) / N;
    const rr = r * (0.82 + 0.18 * Math.sin(rad(a) * 5 + wob));
    pts.push(`${(Math.sin(rad(a)) * rr).toFixed(1)} ${(-Math.cos(rad(a)) * rr).toFixed(1)}`);
  }
  return `M0 0 L${pts.join(" L")} Z`;
}

/** 蛾。夜の図譜の常連。輪郭だけ */
function Moth({ x, y, s, rot }: { x: number; y: number; s: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={alpha(BONE, 0.16)} stroke={BONE} strokeWidth="0.9">
      {[1, -1].map((f) => (
        <g key={f} transform={`scale(${f} 1)`}>
          {/* 前翅。三角に近い。丸くすると蝶になる */}
          <path d="M2 -10 C 20 -22 44 -18 48 -4 C 50 6 30 14 4 6 Z" />
          <path d="M3 6 C 20 8 30 16 25 26 C 20 34 8 27 2 15 Z" />
          <path d="M9 -10 C 22 -16 36 -13 44 -5" fill="none" strokeWidth="0.6" opacity="0.85" />
          <path d="M6 -2 C 20 -3 34 -1 46 0" fill="none" strokeWidth="0.5" opacity="0.6" />
          <path d="M7 10 C 17 12 23 18 22 24" fill="none" strokeWidth="0.6" opacity="0.85" />
          {/* 触角。櫛歯。蛾はここが蝶と違う */}
          <path d="M1 -12 C -6 -22 -12 -28 -20 -31" fill="none" strokeWidth="0.9" />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={-2 - i * 3.2} y1={-16 - i * 2.7} x2={-6 - i * 3.4} y2={-20 - i * 3.4} strokeWidth="0.5" />
          ))}
        </g>
      ))}
      <ellipse rx="3.4" ry="15" fill={alpha(BONE, 0.4)} />
      <circle cy="-14" r="3.6" fill={alpha(BONE, 0.5)} />
    </g>
  );
}

/** 解剖図。番号つきの小図。図譜はこれが無いと図譜にならない */
function Fig({ n, x, y, label, children }: { n: number; x: number; y: number; label: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {children}
      <circle cx="-42" cy="-32" r="9" fill="none" stroke={BONE} strokeWidth="0.9" />
      <text x="-42" y="-28.6" textAnchor="middle" fill={LIGHT} fontFamily="Georgia, 'Times New Roman', serif" fontSize="10">
        {n}
      </text>
      <text x="0" y="50" textAnchor="middle" fill={alpha(BONE, 0.85)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7.4" letterSpacing="1.6">
        {label}
      </text>
    </g>
  );
}

export default function Plate() {
  const r = rand(1847);

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ゴシック・ボタニカル様式の図版">
      <defs>
        <clipPath id={`${P}-page`}>
          <rect width="600" height="800" />
        </clipPath>
        {/* 地。中央だけわずかに起こす。真っ黒だと紙に見えない */}
        <radialGradient id={`${P}-vig`} cx="46%" cy="40%" r="76%">
          <stop offset="0%" stopColor={shift(NIGHT, 0.16)} />
          <stop offset="62%" stopColor={NIGHT} />
          <stop offset="100%" stopColor={shift(NIGHT, -0.5)} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={`url(#${P}-vig)`} />

        {/* ── 図版の枠。細い罫2本だけ。図譜は額を飾らない ─────────── */}
        <rect x="28" y="28" width="544" height="744" fill="none" stroke={BONE} strokeWidth="1.2" />
        <rect x="36" y="36" width="528" height="728" fill="none" stroke={alpha(BONE, 0.4)} strokeWidth="0.6" />
        <text x="560" y="56" textAnchor="end" fill={alpha(BONE, 0.8)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" letterSpacing="2.6">
          PL. XLVII
        </text>
        <text x="40" y="56" fill={alpha(BONE, 0.8)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" letterSpacing="2.6">
          TAB. II
        </text>

        {/* ── 全形図。掘り上げた全草。根まで描くのが標本の作法 ─────── */}
        {/* 主茎。わずかに撓ませる。垂直に引くと造花に見える */}
        <path d="M240 614 C 234 522 246 412 252 326 C 256 274 258 236 258 214" fill="none" stroke={BONE} strokeWidth="2.4" />
        <path d="M240 614 C 234 522 246 412 252 326 C 256 274 258 236 258 214" fill="none" stroke={alpha(GREEN, 0.9)} strokeWidth="1.2" />
        {/* 茎の毛。ケシの茎には剛毛がある。近くで見たときの細部その1 */}
        <g stroke={alpha(BONE, 0.55)} strokeWidth="0.6">
          {Array.from({ length: 34 }, (_, i) => {
            const t = i / 34;
            const y = 614 - t * 396;
            const x = 240 + t * 16 + Math.sin(t * 5) * 4;
            const s = i % 2 === 0 ? 1 : -1;
            return <line key={i} x1={x} y1={y} x2={x + s * 5} y2={y - 4} />;
          })}
        </g>

        {/* 側枝 */}
        <path d="M250 386 C 286 366 320 338 340 300" fill="none" stroke={BONE} strokeWidth="1.8" />
        <path d="M246 452 C 214 434 190 400 178 356" fill="none" stroke={BONE} strokeWidth="1.8" />

        {/* 葉。互生。左右で大きさを変える */}
        <Leaf id={`${P}-lf0`} x={244} y={580} len={128} w={32} rot={196} lobes={4} />
        <Leaf id={`${P}-lf1`} x={246} y={518} len={116} w={28} rot={-22} lobes={4} />
        <Leaf id={`${P}-lf2`} x={244} y={458} len={124} w={29} rot={200} lobes={5} />
        <Leaf id={`${P}-lf3`} x={250} y={398} len={100} w={23} rot={-30} lobes={4} />
        <Leaf id={`${P}-lf4`} x={252} y={344} len={80} w={18} rot={206} lobes={3} />

        {/* 蒴果。左の枝の先。萼が落ちたあとの実 */}
        <g transform="translate(178 356)">
          <path d="M0 0 C -16 -6 -22 -22 -18 -38 C -14 -52 -4 -58 0 -58 C 4 -58 14 -52 18 -38 C 22 -22 16 -6 0 0 Z"
                fill={alpha(GREEN, 0.5)} stroke={BONE} strokeWidth="1.2" />
          {/* 柱頭の放射。ケシの実の頭は必ずこの星になる */}
          <ellipse cy="-58" rx="15" ry="4.6" fill={alpha(BONE, 0.3)} stroke={BONE} strokeWidth="1" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="0" y1="-58" x2={Math.cos((i / 9) * Math.PI * 2) * 14} y2={-58 + Math.sin((i / 9) * Math.PI * 2) * 4.2} stroke={BONE} strokeWidth="0.8" />
          ))}
          {/* 稜。実の縦線 */}
          {[-11, -5.5, 0, 5.5, 11].map((d, i) => (
            <path key={i} d={`M${d * 0.2} -2 C ${d} -18 ${d} -34 ${d * 0.85} -54`} fill="none" stroke={BONE} strokeWidth="0.7" opacity="0.7" />
          ))}
        </g>

        {/* 蕾。うなだれる。開花前のケシは必ず下を向く */}
        <g transform="translate(340 300) rotate(28)">
          <path d="M0 0 C -14 -4 -20 -18 -16 -32 C -12 -44 -4 -50 0 -50 C 4 -50 12 -44 16 -32 C 20 -18 14 -4 0 0 Z"
                fill={alpha(GREEN, 0.5)} stroke={BONE} strokeWidth="1.2" />
          <path d="M0 -50 C -6 -34 -6 -14 0 0" fill="none" stroke={BONE} strokeWidth="0.8" opacity="0.8" />
          <path d="M-9 -44 C -13 -28 -11 -12 -4 -2" fill="none" stroke={BONE} strokeWidth="0.6" opacity="0.6" />
          {/* 萼の毛 */}
          {Array.from({ length: 10 }, (_, i) => {
            const a = -150 + i * 26;
            const [x1, y1] = onCircle(0, -26, 17, a);
            const [x2, y2] = onCircle(0, -26, 24, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={alpha(BONE, 0.6)} strokeWidth="0.6" />;
          })}
        </g>

        {/* 花。色はここだけ。二色目を足すと図譜ではなくなる */}
        <g transform="translate(258 194)">
          {[[6, 62, 0.9], [96, 56, 2.1], [188, 60, 3.4], [274, 54, 4.8]].map(([rot, rr, wob], i) => (
            <path
              key={i}
              transform={`rotate(${rot})`}
              d={petalPath(rr as number, 62, wob as number)}
              fill={alpha(WINE, 0.86)}
              stroke={BONE}
              strokeWidth="1"
            />
          ))}
          {/* 花弁の皺。ケシは必ず皺が寄る */}
          <g stroke={alpha(BONE, 0.5)} strokeWidth="0.6" fill="none">
            {Array.from({ length: 16 }, (_, i) => {
              const a = -150 + i * 19;
              const [x2, y2] = onCircle(0, 0, 50, a);
              return <line key={i} x1="0" y1="0" x2={x2} y2={y2} />;
            })}
          </g>
          {/* 雄しべ。細い糸と葯。近くで見たときの細部その2 */}
          {Array.from({ length: 30 }, (_, i) => {
            const a = (i / 30) * 360 + r(-5, 5);
            const L = r(15, 26);
            const [x2, y2] = onCircle(0, 0, L, a);
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={x2} y2={y2} stroke={alpha(BONE, 0.85)} strokeWidth="0.6" />
                <ellipse cx={x2} cy={y2} rx="1.7" ry="1.1" transform={`rotate(${a} ${x2} ${y2})`} fill={LIGHT} />
              </g>
            );
          })}
          <circle r="11" fill={alpha(NIGHT, 0.9)} stroke={BONE} strokeWidth="1.1" />
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1="0" y1="0" x2={Math.sin((i / 10) * Math.PI * 2) * 10} y2={-Math.cos((i / 10) * Math.PI * 2) * 10} stroke={BONE} strokeWidth="0.7" />
          ))}
        </g>

        {/* 根。掘り上げた全草。ここが「ゴシック」に効く */}
        <g stroke={BONE} fill="none">
          <path d="M240 614 C 238 636 236 654 232 670" strokeWidth="3.4" />
          <path d="M240 614 C 238 636 236 654 232 670" strokeWidth="1.6" stroke={alpha(GREEN, 0.8)} />
          {Array.from({ length: 22 }, (_, i) => {
            const t = i / 21;
            const y = 620 + t * 50;
            const s = i % 2 === 0 ? 1 : -1;
            const L = r(14, 42) * (1 - t * 0.4);
            return (
              <path
                key={i}
                d={`M${239 - t * 7} ${y} C ${239 + s * L * 0.4} ${y + 8} ${239 + s * L * 0.8} ${y + 12} ${239 + s * L} ${y + r(8, 22)}`}
                strokeWidth={0.9 - t * 0.3}
                opacity={0.85 - t * 0.25}
              />
            );
          })}
          <path d="M232 670 C 230 682 228 688 226 694" strokeWidth="1.4" />
        </g>
        {/* 土の線。根の上に一本引くと「掘り上げた」ことが伝わる */}
        <g stroke={alpha(BONE, 0.4)} strokeWidth="0.7" strokeDasharray="7 6">
          <line x1="150" y1="610" x2="336" y2="610" />
        </g>

        <Moth x={438} y={614} s={1.15} rot={-16} />

        {/* ── 解剖図。右の列。番号と説明を必ずつける ───────────────── */}
        <line x1="404" y1="76" x2="404" y2="596" stroke={alpha(BONE, 0.28)} strokeWidth="0.6" />

        <Fig n={1} x={484} y={132} label="CAPSVLA · SECTIO">
          <circle r="34" fill={alpha(GREEN, 0.28)} stroke={BONE} strokeWidth="1.2" />
          <circle r="26" fill="none" stroke={BONE} strokeWidth="0.8" />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * 360;
            const [x2, y2] = onCircle(0, 0, 26, a);
            return <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke={BONE} strokeWidth="0.8" />;
          })}
          {Array.from({ length: 48 }, (_, i) => {
            const a = r(0, 360);
            const rr = Math.sqrt(r()) * 24;
            const [x, y] = onCircle(0, 0, rr, a);
            return <ellipse key={i} cx={x} cy={y} rx="1.9" ry="1.4" transform={`rotate(${r(0, 180)} ${x} ${y})`} fill={alpha(BONE, 0.75)} />;
          })}
          <circle r="4" fill={NIGHT} stroke={BONE} strokeWidth="0.8" />
        </Fig>

        <Fig n={2} x={484} y={266} label="PETALVM">
          <path d={petalPath(40, 56, 1.4)} transform="rotate(180)" fill={alpha(WINE, 0.8)} stroke={BONE} strokeWidth="1" />
          <g stroke={alpha(BONE, 0.55)} strokeWidth="0.6">
            {Array.from({ length: 11 }, (_, i) => {
              const a = 180 - 50 + i * 10;
              const [x2, y2] = onCircle(0, 0, 36, a);
              return <line key={i} x1="0" y1="0" x2={x2} y2={y2} />;
            })}
          </g>
        </Fig>

        <Fig n={3} x={484} y={404} label="STAMINA">
          {Array.from({ length: 13 }, (_, i) => {
            const u = i / 12 - 0.5;
            const tipX = u * 62;
            const tipY = -20 - (1 - Math.abs(u) * 1.5) * 14;
            return (
              <g key={i}>
                <path d={`M0 26 C ${tipX * 0.25} 4 ${tipX * 0.7} ${tipY + 16} ${tipX} ${tipY}`} fill="none" stroke={BONE} strokeWidth="0.8" />
                <ellipse cx={tipX} cy={tipY} rx="3.6" ry="2" transform={`rotate(${u * 60} ${tipX} ${tipY})`} fill={alpha(LIGHT, 0.9)} stroke={BONE} strokeWidth="0.6" />
              </g>
            );
          })}
          <path d="M-8 30 C -8 18 8 18 8 30 Z" fill={alpha(GREEN, 0.6)} stroke={BONE} strokeWidth="0.9" />
        </Fig>

        <Fig n={4} x={484} y={520} label="SEMINA · AVCTA">
          <circle r="34" fill="none" stroke={BONE} strokeWidth="1.2" />
          <circle r="34" fill={alpha(NIGHT, 0.4)} />
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * 360;
            const [x, y] = onCircle(0, 0, i === 0 ? 0 : 19, a);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${r(0, 180)})`}>
                <path d="M0 -7 C 8 -7 10 3 4 7 C -2 10 -8 5 -8 -1 C -8 -5 -4 -7 0 -7 Z" fill={alpha(BONE, 0.35)} stroke={BONE} strokeWidth="0.9" />
                {/* 種皮の網目。ケシの種はここが特徴 */}
                <g stroke={alpha(BONE, 0.7)} strokeWidth="0.4" fill="none">
                  <path d="M-6 -3 C -2 -1 2 -1 6 -3" />
                  <path d="M-6 1 C -2 3 2 3 5 1" />
                  <path d="M-2 -6 C -2 -1 -1 3 0 6" />
                </g>
              </g>
            );
          })}
          <text x="26" y="-24" fill={alpha(BONE, 0.7)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7">
            ×20
          </text>
        </Fig>

        {/* ── 銘。学名は斜体、科名は小さい大文字 ─────────────────── */}
        <line x1="40" y1="700" x2="560" y2="700" stroke={alpha(BONE, 0.5)} strokeWidth="0.8" />
        <text x="300" y="728" textAnchor="middle" fill={LIGHT} fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" letterSpacing="7.4">
          GOTHIC BOTANICAL
        </text>
        <text x="300" y="746" textAnchor="middle" fill={BONE} fontFamily="Georgia, 'Times New Roman', serif" fontSize="14" fontStyle="italic">
          Papaver somniferum L.
        </text>
        <text x="300" y="759" textAnchor="middle" fill={alpha(BONE, 0.75)} fontFamily="Georgia, 'Times New Roman', serif" fontSize="7.6" letterSpacing="3.6">
          PAPAVERACEAE · AD VIVVM DELIN. · HORTVS NOCTVRNVS
        </text>

        {/* 紙の目。図譜は厚い版画紙に刷る */}
        <rect width="600" height="800" filter={`url(#${ATLAS.fibre})`} opacity="0.14" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}
