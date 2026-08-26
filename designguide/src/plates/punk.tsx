/**
 * パンクデザイン。
 *
 * ジェイミー・リードの「God Save the Queen」を軸に組む。
 * パンクの版面は「デザイン」ではなく「複写と切り貼り」でできている。
 * だから、それらしいノイズを撒くのではなく、複写機の物理を絵の構造に入れた。
 *
 * ■ 初稿の失敗と、直したところ
 *   1稿目は顔を黒いシルエットにして、目と口を白く抜いた。
 *   結果はステッカーの図案で、複写物には見えなかった。
 *   実際のコピー機は二値化するので、光が当たった面は「紙の白」に飛び、
 *   影の面は「トナーの黒」に潰れる。つまり顔は白が主で、黒は影である。
 *   2稿目でここを反転させたら、一気に写真の複写になった。
 *
 * ■ 灰色の作り方
 *   二値の機械に中間調は無い。それでも背景が灰色に見えるのは、
 *   黒い粒が半分ほど散っているから。だから背景はベタ塗りではなく
 *   粒の密度で作った。遠目には灰色、近づくと白と黒しかない。
 *   これがコピー機の一番の見どころなので、ここは手を抜かない。
 *
 * ■ 網点は使わない
 *   コピー機は網点ではなく閾値で潰す。点を敷くと新聞になってしまう。
 */
import { ATLAS, rand } from "@/lib/plate";

const P = "pk";
const PAPER = "#e8e4d8";
const INK = "#111111";
const RED = "#e8194b";
const WHITE = "#f2f2f2";
const GREY = "#5a5a5a";

/** 手で千切った紙。天地は千切れ、左右は断裁されている */
function scrap(x: number, y: number, w: number, h: number, seed: number, amp = 4) {
  const r = rand(seed);
  const step = Math.max(6, w / 14);
  const top: string[] = [];
  for (let t = 0; t <= w; t += step) top.push(`${(x + Math.min(t, w)).toFixed(1)},${(y + r(-amp, amp)).toFixed(1)}`);
  top.push(`${(x + w).toFixed(1)},${(y + r(-amp, amp)).toFixed(1)}`);
  const bot: string[] = [];
  for (let t = w; t >= 0; t -= step) bot.push(`${(x + Math.max(t, 0)).toFixed(1)},${(y + h + r(-amp, amp)).toFixed(1)}`);
  bot.push(`${x.toFixed(1)},${(y + h + r(-amp, amp)).toFixed(1)}`);
  return `M${top.join(" L")} L${bot.join(" L")} Z`;
}

/** 折れ線の上に粒を撒く。白と黒を混ぜて撒くと、境界だけが割れて見える。
 *  白地の上の白い粒・黒地の上の黒い粒は消えるので、境界の破れだけが残る */
function breakUp(pts: [number, number][], n: number, seed: number, spread: number) {
  const r = rand(seed);
  const segs = pts.length - 1;
  return Array.from({ length: n }, () => {
    const t = r() * segs;
    const k = Math.min(segs - 1, Math.floor(t));
    const f = t - k;
    return {
      x: pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f + r(-spread, spread),
      y: pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f + r(-spread, spread),
      s: r(1.0, 3.4),
      w: r() > 0.5,
    };
  });
}

/** 頭蓋の天。モヒカンの根元をこの曲線に生やす */
const skullY = (x: number) => -108 + (x / 70) ** 2 * 34;

/** ホチキス。芯の下に紙の影が落ち、芯の上に一本だけ光が乗る */
const Staple = ({ x, y, rot }: { x: number; y: number; rot: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x="-11" y="0" width="24" height="7" fill={INK} opacity="0.3" />
    <rect x="-12" y="-3.5" width="24" height="7" fill="#2e2e2e" />
    <rect x="-12" y="-3.5" width="24" height="1.8" fill="#9c9c9c" />
    <rect x="-12" y="-3.5" width="3.4" height="7" fill={INK} />
    <rect x="8.6" y="-3.5" width="3.4" height="7" fill={INK} />
  </g>
);

/** 脅迫状の1文字。紙・書体・角度・天地をすべてバラす */
const TITLE = [
  { ch: "P", w: 116, h: 120, fs: 106, ff: "Georgia, 'Times New Roman', serif", fw: 700, rot: -5, bg: WHITE, fg: INK, dy: 4, seed: 41 },
  { ch: "U", w: 104, h: 108, fs: 92, ff: "'Helvetica Neue', Helvetica, Arial, sans-serif", fw: 800, rot: 4, bg: INK, fg: WHITE, dy: 16, seed: 42 },
  { ch: "N", w: 124, h: 128, fs: 118, ff: "'Arial Black', 'Helvetica Neue', Helvetica, sans-serif", fw: 900, rot: -2, bg: WHITE, fg: INK, dy: -8, seed: 43 },
  { ch: "K", w: 100, h: 104, fs: 84, ff: "'Courier New', ui-monospace, monospace", fw: 700, rot: 7, bg: RED, fg: INK, dy: 18, seed: 44 },
];

export default function Plate() {
  const r = rand(19770412);

  /* 二値の背景。粒の密度だけで灰色を作る。タイルにしないと重い */
  const tone = (n: number, seed: number, lo: number, hi: number) => {
    const t = rand(seed);
    return Array.from({ length: n }, () => ({ x: t(0, 160), y: t(0, 160), s: t(lo, hi) }));
  };
  const toneA = tone(920, 811, 0.6, 1.7); // 地のこまかい粒
  const toneB = tone(600, 822, 1.2, 3.4); // 濃い側。伏せて密度を場所で変える
  /* トナーの溜まり。上辺と隅に塊ができる。粒が均一だと機械の噴霧に見える */
  const clumps = Array.from({ length: 30 }, () => ({ x: r(48, 474), y: r(50, 200), s: r(3.5, 12) }));

  /* モヒカン。根元を頭蓋の天に沿わせ、穂先は後ろへ倒す */
  const spikes = Array.from({ length: 9 }, (_, i) => {
    const x = -64 + i * 16;
    const base = skullY(x);
    const hw = 9 + r(0, 5);
    const len = 84 + Math.cos((i - 3.4) * 0.62) * 62;
    return { x, base, hw, tipX: x + 10 + r(0, 22), tipY: base - len };
  });

  /* 閾値の破れ。影の境・生え際・襟・口のまわり */
  const edgeShadow = breakUp([[-66, -54], [-42, -14], [-30, 22], [-24, 62], [-21, 104], [-20, 128]], 90, 31, 5);
  const edgeHair = breakUp([[-70, -52], [-46, -84], [-4, -96], [42, -86], [72, -50]], 66, 32, 3.4);
  const edgeJaw = breakUp([[-40, 132], [-8, 152], [30, 146], [52, 128]], 46, 33, 5);
  const edgeCoat = breakUp([[-120, 208], [-46, 178], [26, 176], [104, 200]], 60, 34, 6);

  /* 切り抜いた新聞。文字は読ませない。行の長短だけで新聞に見える */
  const news = Array.from({ length: 21 }, () => r(36, 76));

  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="パンクデザイン様式の図版">
      <defs>
        <clipPath id={`${P}-page`}><rect width="600" height="800" /></clipPath>
        {/* コピー機の版。この矩形の外は複写されない＝黒 */}
        <clipPath id={`${P}-panel`}><rect x="40" y="42" width="442" height="434" /></clipPath>
        {/* 斜めに置かれた原稿そのもの。ここから外れた絵は切り落とす */}
        <clipPath id={`${P}-orig`}><rect x="48" y="50" width="426" height="418" /></clipPath>

        {/* 粒の密度で作る灰。薄いほうと濃いほう */}
        <pattern id={`${P}-toneA`} width="160" height="160" patternUnits="userSpaceOnUse">
          {toneA.map((d, i) => <rect key={i} x={d.x} y={d.y} width={d.s} height={d.s} fill={INK} />)}
        </pattern>
        <pattern id={`${P}-toneB`} width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="translate(43 71) rotate(9)">
          {toneB.map((d, i) => <rect key={i} x={d.x} y={d.y} width={d.s} height={d.s} fill={INK} />)}
        </pattern>
        {/* 粒の密度を場所で変えるための伏せ。上ほど濃い＝奥の壁が影 */}
        <linearGradient id={`${P}-fade`} x1="0" y1="50" x2="0" y2="470" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#7a7a7a" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
        <mask id={`${P}-mfade`}><rect x="40" y="42" width="442" height="434" fill={`url(#${P}-fade)`} /></mask>
        {/* 四隅が落ちる。原稿が浮いていると縁が影になる */}
        <radialGradient id={`${P}-vig`} cx="0.5" cy="0.5" r="0.62">
          <stop offset="0.42" stopColor="#000000" />
          <stop offset="1" stopColor="#dcdcdc" />
        </radialGradient>
        <mask id={`${P}-mvig`}><rect x="40" y="42" width="442" height="434" fill={`url(#${P}-vig)`} /></mask>
      </defs>

      <g clipPath={`url(#${P}-page)`}>
        <rect width="600" height="800" fill={PAPER} />

        {/* ── 複写された写真。斜めに置かれた原稿 ─────────────────── */}
        <g clipPath={`url(#${P}-panel)`}>
          {/* 原稿の外＝プラテンの闇。四辺に黒楔として残る */}
          <rect x="40" y="42" width="442" height="434" fill={INK} />

          <g transform="rotate(-2.4 261 259)">
            <g clipPath={`url(#${P}-orig)`}>
              <rect x="48" y="50" width="426" height="418" fill={WHITE} />
              {/* 灰色＝粒。遠目に灰、近づくと白と黒しかない。
                  一様に撒くと機械の噴霧に見えたので、伏せ2枚で密度に傾きを付けた */}
              <rect x="48" y="50" width="426" height="418" fill={`url(#${P}-toneA)`} opacity="0.9" />
              <g mask={`url(#${P}-mfade)`}>
                <rect x="48" y="50" width="426" height="418" fill={`url(#${P}-toneB)`} />
              </g>
              <g mask={`url(#${P}-mvig)`} opacity="0.75">
                <rect x="48" y="50" width="426" height="418" fill={`url(#${P}-toneB)`} />
              </g>
              <g fill={INK} opacity="0.85">
                {clumps.map((c, i) => (
                  <rect key={i} x={c.x} y={c.y} width={c.s} height={c.s * 0.68} />
                ))}
              </g>

              {/* ドラムの汚れ。縦に流れる。3代目のコピーは必ずこれが出る */}
              <g fill={INK}>
                <rect x="132" y="50" width="7" height="418" opacity="0.16" />
                <rect x="147" y="50" width="2.5" height="418" opacity="0.26" />
                <rect x="392" y="50" width="4" height="418" opacity="0.13" />
                <rect x="404" y="50" width="1.6" height="418" opacity="0.2" />
              </g>

              {/* ── 人物。白が主、黒は影 ────────────────────────── */}
              <g transform="translate(298 266) scale(0.86)">
                {/* 光の当たった面＝紙の白。ここが版面でいちばん明るい */}
                <path d="M -78,-26 C -88,44 -70,104 -30,132 C -8,148 22,148 44,130 C 78,104 88,40 78,-26 C 70,-84 34,-108 0,-108 C -36,-108 -70,-84 -78,-26 Z" fill={WHITE} />
                <path d="M 78,-6 C 96,-16 100,20 86,28 C 78,32 74,22 75,10 Z" fill={WHITE} />

                <g fill={INK}>
                  {/* 耳の穴 */}
                  <path d="M 84,2 C 93,0 93,19 84,23 Z" />
                  {/* 影の面。斜光が顔を縦に割る。左目は半分だけ闇に沈む */}
                  <path d="M -78,-26 C -88,44 -70,104 -30,132 L -20,126 L -30,102 L -18,74 L -32,48 L -22,20 L -38,-6 L -30,-34 L -46,-52 L -68,-52 Z" />
                  {/* 眼窩。眉と一体で黒く落ちる */}
                  <path d="M 12,-32 L 62,-22 L 64,-4 L 44,6 L 20,-4 L 13,-18 Z" />
                  <path d="M -62,-36 L -14,-27 L -12,-9 L -32,0 L -58,-12 Z" />
                  {/* 鼻。左へ落ちた硬い影が、頬の闇とつながる */}
                  <path d="M -2,-10 L -32,20 L -14,36 L 8,28 L 5,-6 Z" />
                  <ellipse cx="12" cy="34" rx="6" ry="3.6" transform="rotate(14 12 34)" />
                  {/* 叫ぶ口。中は闇 */}
                  <path d="M -38,54 C -22,38 26,38 42,58 C 45,96 22,124 0,124 C -24,124 -42,92 -38,54 Z" />
                  {/* 顎下の影 */}
                  <path d="M -36,124 C -10,144 20,142 46,122 L 54,138 C 24,162 -14,162 -42,138 Z" />
                  {/* 首 */}
                  <path d="M -30,128 L 30,128 L 32,182 L -32,182 Z" />
                  {/* 革の上着 */}
                  <path d="M -172,300 C -158,206 -76,180 -30,174 L 30,174 C 78,180 158,206 172,300 L 172,330 L -172,330 Z" />
                  {/* 冠。穂先の根元を1本に束ねる */}
                  <path d="M -66,-72 C -40,-104 40,-104 66,-72 L 66,-54 C 40,-84 -40,-84 -66,-54 Z" />
                  {spikes.map((s, i) => (
                    <polygon key={i} points={`${s.x - s.hw},${s.base + 8} ${s.x + s.hw},${s.base + 8} ${s.tipX},${s.tipY}`} />
                  ))}
                </g>

                {/* 白目と歯。白は紙の白と同じ。ここだけ光が抜ける */}
                <g fill={WHITE}>
                  <path d="M 22,-15 L 54,-8 L 47,3 L 24,-4 Z" />
                  <path d="M -32,-16 L -18,-13 L -20,-4 L -32,-9 Z" />
                  <path d="M -29,57 L 33,57 L 31,75 L -27,75 Z" />
                  <path d="M -23,105 L 27,105 L 23,113 L -19,113 Z" opacity="0.85" />
                  {/* 襟のふち */}
                  <path d="M -30,176 L -98,252 L -64,276 L -16,198 Z" opacity="0.92" />
                  <path d="M 30,176 L 98,252 L 64,276 L 16,198 Z" opacity="0.92" />
                </g>
                {/* 瞳と歯の隙間 */}
                <g fill={INK}>
                  <circle cx="38" cy="-6" r="5.2" />
                  <circle cx="-26" cy="-9" r="3.6" />
                  {[-17, -6, 6, 17, 26].map((x, i) => (
                    <rect key={i} x={x} y="57" width={i % 2 ? 2.6 : 1.8} height="18" />
                  ))}
                </g>
                {/* 鋲。襟に沿って一列。近くで見るときの取っ掛かり */}
                <g fill={WHITE}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <circle key={i} cx={-58 - i * 15} cy={222 + i * 9} r="2.6" opacity="0.9" />
                  ))}
                </g>
                {/* 刈り上げの地肌。短い黒線を寝かせる */}
                <g fill={INK} opacity="0.75">
                  {Array.from({ length: 26 }, (_, i) => {
                    const a = -0.9 + i * 0.07;
                    return <rect key={i} x={44 + Math.cos(a) * 22} y={-72 + i * 2.4} width={r(3, 9)} height="1.3" transform={`rotate(${-24 + i} 50 -60)`} />;
                  })}
                </g>

                {/* 閾値の破れ。白黒を混ぜて撒くと、境界だけが割れる */}
                {[edgeShadow, edgeHair, edgeJaw, edgeCoat].map((set, k) => (
                  <g key={k}>
                    {set.map((d, i) => (
                      <rect key={i} x={d.x} y={d.y} width={d.s} height={d.s} fill={d.w ? WHITE : INK} />
                    ))}
                  </g>
                ))}
              </g>

              {/* 貼り込んだ新聞の切れ端。読ませず、行の長短で新聞に見せる */}
              <g transform="rotate(-3.5 100 300)">
                <path d={scrap(58, 196, 84, 224, 77, 3.2)} fill="#dcd7c6" />
                <rect x="60" y="204" width="78" height="9" fill={INK} />
                <rect x="60" y="217" width="52" height="6" fill={INK} opacity="0.82" />
                <g fill={GREY} opacity="0.8">
                  {news.map((w, i) => (
                    <rect key={i} x="61" y={234 + i * 9.4} width={w} height="2.6" />
                  ))}
                </g>
              </g>

              {/* 複写の縁。原稿の端にできる黒い帯 */}
              <rect x="48" y="50" width="426" height="418" fill="none" stroke={INK} strokeWidth="3" opacity="0.55" />
            </g>
          </g>
        </g>

        {/* セロテープ。半透明で、縁だけがわずかに濃い */}
        <g opacity="0.44">
          <g transform="rotate(-38 64 60)">
            <rect x="20" y="48" width="88" height="26" fill="#c9c4b2" />
            <rect x="20" y="48" width="88" height="26" fill="none" stroke="#a49e8c" strokeWidth="1" />
          </g>
          <g transform="rotate(24 478 462)">
            <rect x="434" y="450" width="92" height="24" fill="#c9c4b2" />
            <rect x="434" y="450" width="92" height="24" fill="none" stroke="#a49e8c" strokeWidth="1" />
          </g>
        </g>

        {/* ホチキス。紙を綴じている物としての証拠 */}
        <Staple x={64} y={60} rot={-42} />
        <Staple x={464} y={58} rot={38} />
        <Staple x={60} y={460} rot={26} />

        {/* 安全ピン。紙を貫くので穴も要る */}
        <g transform="rotate(38 444 92)">
          <ellipse cx="404" cy="92" rx="3" ry="1.8" fill={INK} opacity="0.65" />
          <ellipse cx="486" cy="92" rx="3" ry="1.8" fill={INK} opacity="0.65" />
          <g fill="none" stroke="#3a3a3a" strokeWidth="3.4" strokeLinecap="round">
            <path d="M 404 90 L 480 90" />
            <path d="M 404 96 L 474 96" />
            <path d="M 404 90 A 7 7 0 1 0 404 96" />
          </g>
          <rect x="474" y="84.5" width="17" height="14" rx="3" fill="#3a3a3a" />
          <rect x="404" y="87.6" width="60" height="1.3" fill="#a4a4a4" />
        </g>

        {/* ── 脅迫状の題字 ────────────────────────────────────────── */}
        <g>
          {TITLE.reduce<{ x: number; nodes: React.ReactNode[] }>(
            (acc, t, i) => {
              const y = 500 + t.dy;
              const cx = acc.x + t.w / 2;
              const cy = y + t.h / 2;
              acc.nodes.push(
                <g key={i} transform={`rotate(${t.rot} ${cx} ${cy})`}>
                  <path d={scrap(acc.x + 3, y + 4, t.w, t.h, t.seed, 3)} fill={INK} opacity="0.3" />
                  <path d={scrap(acc.x, y, t.w, t.h, t.seed, 3)} fill={t.bg} />
                  <text
                    x={cx} y={y + t.h * 0.79}
                    textAnchor="middle"
                    fill={t.fg}
                    fontFamily={t.ff}
                    fontSize={t.fs}
                    fontWeight={t.fw}
                  >
                    {t.ch}
                  </text>
                </g>,
              );
              acc.x += t.w + 6;
              return acc;
            },
            { x: 52, nodes: [] },
          ).nodes}
        </g>

        {/* 切り取り線。版下の指示がそのまま刷られてしまった体 */}
        <g stroke={INK} strokeWidth="1.2" opacity="0.55" strokeDasharray="7 6">
          <line x1="56" y1="662" x2="266" y2="662" />
        </g>
        <g transform="translate(46 662)" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.6">
          <circle cx="-3" cy="-5" r="2.6" />
          <circle cx="-3" cy="5" r="2.6" />
          <path d="M -1 -4 L 9 3" />
          <path d="M -1 4 L 9 -3" />
        </g>
        <text
          x="56" y="682" fill={INK}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="9.5" fontWeight="700" letterSpacing="2.4" opacity="0.6"
        >
          CUT HERE — PASTE — COPY AGAIN
        </text>

        {/* 赤いゴム印。一色だけの差し色。インクが乗り切らず掠れる */}
        <g transform="rotate(-7 396 668)">
          <g opacity="0.92">
            <rect x="300" y="640" width="196" height="54" fill="none" stroke={RED} strokeWidth="4" />
            <text
              x="398" y="680" textAnchor="middle" fill={RED}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontSize="30" fontWeight="800" letterSpacing="1.5"
            >
              NO FUTURE
            </text>
          </g>
          {/* 掠れ。紙色で削って、押し付けの不均一を作る */}
          <g fill={PAPER}>
            <rect x="296" y="652" width="204" height="2.4" opacity="0.85" />
            <rect x="326" y="668" width="60" height="1.8" opacity="0.7" />
            <rect x="296" y="684" width="90" height="2" opacity="0.6" />
            <rect x="442" y="638" width="16" height="58" opacity="0.45" />
          </g>
        </g>

        {/* 地の黒帯。反転した文字を持たせる */}
        <rect x="-10" y="712" width="620" height="34" fill={INK} transform="rotate(-0.6 300 729)" />
        <text
          x="52" y="735" fill={WHITE}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="12" fontWeight="700" letterSpacing="3.2"
          transform="rotate(-0.6 300 729)"
        >
          THIRD GENERATION XEROX — CUT — STAPLED
        </text>

        <text
          x="52" y="772" fill={INK}
          fontFamily="'Courier New', ui-monospace, monospace"
          fontSize="10.5" fontWeight="700" letterSpacing="2.6" opacity="0.72"
        >
          A5 / 1 COLOUR + BLACK / 1977
        </text>
        <g fill={INK} opacity="0.5">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={430 + i * 9} y={764} width="1.6" height={i % 4 === 0 ? 11 : 6} />
          ))}
        </g>

        {/* ざら紙。コピー用紙は上質紙ではない */}
        <rect
          width="600" height="800"
          filter={`url(#${ATLAS.grainCoarse})`}
          opacity="0.3"
          style={{ mixBlendMode: "multiply" }}
        />
      </g>
    </svg>
  );
}
