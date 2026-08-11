import { PixelGfx } from "./gfx";

// こすくまくん。こす.くまの公式キャラクター。
//
// 出典: ~/Desktop/こすくま/デザイン/ロゴ/こすくま_ポーズ01〜03.png（正式なロゴデータ）
//
// ── 実物の特徴（ここを外すと別のくまになる）──
//  1. **輪郭が非常に太い。** 図の横幅の3.5%（453pxの図で16px）。中の面より輪郭が主役。
//  2. **頭が体より大きい。** 頭が丈の約58%を占め、幅もほぼ図いっぱい。
//  3. **耳は頭の後ろから覗く円。** 頭の上の角から外へ半分だけ出る。頭の輪郭が耳を切る。
//  4. **顔が極端に小さく、低い位置にある。** 目は1点ずつの丸で、頭の高さの4割あたり。
//     間隔は頭幅の1/6ほどしかない。中心よりわずかに左に寄る。
//  5. **口が無い。** 目の下に鼻の点が1つあるだけ。笑わせない。
//  6. **お腹の右下に濃い緑のほくろが1つ。** これが無いと似ない。
//  7. 手は胴の脇から出る小さな丸。足は下から左右に少し覗く。
//  8. 塗りはごく淡いクリーム（#f7f7d8 前後）。白ではない。
//
// ── 描き方 ──
// 形ごとに「塗ってから輪郭を引く」を、奥から手前の順に重ねる。
// あとの形の塗りが前の形の輪郭を消すので、実物と同じように
// 手前の形の輪郭だけが残る（頭の輪郭が耳と胴を切る）。

export const KUMA = {
  fill: "#f7f7d8",
  line: "#141210",
  /** お腹のほくろ。黒ではなく濃い緑 */
  mole: "#28382c",
  /** 頬を入れるとき用。実物のロゴには無いので既定では使わない */
  blush: "#f5c4c4",
};

/**
 * 形は超楕円ひとつで足りる。n=2 で楕円、n を上げるほど角丸の四角に近づく。
 * 実物の頭は側面がほぼ直線（丈の29%〜57%のあいだ幅が85%で一定）なので、
 * 円ではなく角丸の四角。ここを円にすると途端に別のくまになる。
 */
type Shape = { cx: number; cy: number; rx: number; ry: number; n: number };

const blob = (cx: number, cy: number, rx: number, ry: number, n = 2): Shape => ({
  cx,
  cy,
  rx,
  ry,
  n,
});

function inside(s: Shape, x: number, y: number): boolean {
  const dx = Math.abs((x - s.cx) / (s.rx + 0.5));
  const dy = Math.abs((y - s.cy) / (s.ry + 0.5));
  return Math.pow(dx, s.n) + Math.pow(dy, s.n) <= 1;
}

/** 形を1つ、塗ってから輪郭を引く。輪郭は「中にいて、隣に外がある」画素。 */
function paint(g: PixelGfx, s: Shape, fill: string, line: string, diag = true) {
  const x0 = Math.floor(s.cx - s.rx) - 1;
  const x1 = Math.ceil(s.cx + s.rx) + 1;
  const y0 = Math.floor(s.cy - s.ry) - 1;
  const y1 = Math.ceil(s.cy + s.ry) + 1;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (!inside(s, x, y)) continue;
      // 斜めも見る。4近傍だけだと階段の角に1pxの穴が開いて輪郭が切れる。
      // 実物の輪郭は図の幅の3.5%と太いので、少し太るぶんにはむしろ近い。
      // 斜めも見る。4近傍だけだと階段の角に1pxの穴が開いて輪郭が切れる。
      // ただし小さく描くときは、8近傍だと輪郭が中の面を食い尽くすので4近傍に落とす。
      let edge =
        !inside(s, x - 1, y) ||
        !inside(s, x + 1, y) ||
        !inside(s, x, y - 1) ||
        !inside(s, x, y + 1);
      if (!edge && diag)
        for (let j = -1; j <= 1 && !edge; j += 2)
          for (let i = -1; i <= 1 && !edge; i += 2)
            if (!inside(s, x + i, y + j)) edge = true;
      g.px(x, y, edge ? line : fill);
    }
}

export type KumaOptions = {
  fill?: string;
  line?: string;
  mole?: string;
  /** 目を閉じる（まばたき） */
  blink?: boolean;
  /** 左右を反転する */
  flip?: boolean;
  /** ほくろを描かない。小さく出すときだけ */
  noMole?: boolean;
};

/**
 * こすくまくんの寸法。置き場所の計算に使う。
 * 実物の縦横比は 0.760（453 x 596）。26 x 34 = 0.765。
 * 23 x 30 でも比は合うが、丸みが出ず全体が角ばって見えたので一回り大きく取った。
 */
export const KUMA_SIZE = { w: 26, h: 34 };

/**
 * 正面のこすくまくんを (x, y) を左上として描く。26 x 34。
 *
 * 寸法は実物のロゴを画素で測って出した（数字はすべて図の幅／丈に対する割合）:
 *   耳が図の最大幅を決める（丈の10〜19%で幅100%）／頭の側面は29〜57%で幅85%一定／
 *   手が61〜70%で幅99%まで張り出す／胴は幅80%／
 *   目は左42% 右58%・高さ42%（間隔は幅の16%しかない）／鼻は50%・46%／
 *   ほくろは75%・82%。
 *
 * これより小さくすると目の1点が消えて別のくまになるので、縮めないこと。
 */
export function drawKosukuma(g: PixelGfx, x: number, y: number, o: KumaOptions = {}) {
  const fill = o.fill ?? KUMA.fill;
  const line = o.line ?? KUMA.line;
  const prev = g.pushOrigin(x, y);

  // 奥から手前へ。あとの塗りが前の輪郭を消す。
  // 耳 → 足 → 手 → 胴 → 頭 の順。実物も頭がいちばん手前にある。
  // 実測どおりに置くと、耳が頭の外へ出る量が1.7px しかなく「角の欠け」に見える。
  // 低い解像度では見分けのつく特徴を少し誇張するのが正しいので、
  // 頭をわずかに細くし、耳を外へ上へ出して覗かせている。
  //
  // 手は胴より下げてある。頭の底と同じ高さに置くと、頭の底の線と手の線が
  // 一直線に繋がって、図の真ん中を横切る棒になる（実物にはそんな線は無い）。
  paint(g, blob(4, 4, 4, 4), fill, line); // 左耳。頭より上に出る
  paint(g, blob(22, 4, 4, 4), fill, line); // 右耳
  paint(g, blob(7, 31, 4, 2.5), fill, line); // 左足。胴の下から覗く
  paint(g, blob(19, 31, 4, 2.5), fill, line); // 右足
  paint(g, blob(2.5, 23, 2.5, 4), fill, line); // 左手。丈の61〜70%で張り出す
  paint(g, blob(23.5, 23, 2.5, 4), fill, line); // 右手
  paint(g, blob(13, 26, 10, 7.5, 2.0), fill, line); // 胴。幅80%。楕円で丸く
  paint(g, blob(13, 11, 10, 9.5, 2.2), fill, line); // 頭。角丸の四角だが、
  // n を上げすぎると天と底が真っ平らになり、底の線が図を横切る棒になる。2.2 が上限。

  // ── 顔 ──────────────────────────────────────────────
  // 目は1点ずつ。間隔は頭幅の1/6。中心よりわずかに左。
  // 実物では目は図の幅の4%＝この寸法だと1点。間隔も3pxしかない。
  // 大きくすると「かわいい動物」になってしまい、こすくまの無表情が消える。
  if (o.blink) {
    g.hline(10, 14, 2, line);
    g.hline(15, 14, 2, line);
  } else {
    g.px(11, 14, line);
    g.px(15, 14, line);
  }
  g.px(13, 16, line); // 鼻。口は無い

  // ── お腹のほくろ ────────────────────────────────────
  if (!o.noMole) {
    const mole = o.mole ?? KUMA.mole;
    g.px(19, 27, mole);
    g.px(20, 27, mole);
    g.px(19, 28, mole);
    g.px(20, 28, mole);
  }

  g.popOrigin(prev);
}

/**
 * 小さいこすくまくん。15 x 26。
 *
 * 図の中で主役ではなく、風景の一部として置くときに使う。
 * 顔の点は1pxまで縮むので、**これ以上は小さくできない**。
 * 縮めるかわりに、見分けのつく特徴（耳・輪郭・ほくろ）は残す割合を上げてある。
 */
export const KUMA_SMALL_SIZE = { w: 15, h: 26 };

export function drawKosukumaSmall(g: PixelGfx, x: number, y: number, o: KumaOptions = {}) {
  const fill = o.fill ?? KUMA.fill;
  const line = o.line ?? KUMA.line;
  const prev = g.pushOrigin(x, y);

  paint(g, blob(2.5, 3, 2.5, 2.5), fill, line, false); // 左耳
  paint(g, blob(12.5, 3, 2.5, 2.5), fill, line, false); // 右耳
  paint(g, blob(4, 24, 2.5, 1.5), fill, line, false); // 左足
  paint(g, blob(11, 24, 2.5, 1.5), fill, line, false); // 右足
  paint(g, blob(1, 18, 1.5, 2.5), fill, line, false); // 左手
  paint(g, blob(14, 18, 1.5, 2.5), fill, line, false); // 右手
  paint(g, blob(7.5, 19, 6, 5.5, 2.0), fill, line, false); // 胴
  paint(g, blob(7.5, 8.5, 6.5, 7, 2.2), fill, line, false); // 頭

  if (o.blink) {
    g.px(5, 10, line);
    g.px(10, 10, line);
  } else {
    g.px(5, 10, line);
    g.px(10, 10, line);
  }
  g.px(7, 12, line); // 鼻

  if (!o.noMole) g.px(11, 20, o.mole ?? KUMA.mole);

  g.popOrigin(prev);
}
