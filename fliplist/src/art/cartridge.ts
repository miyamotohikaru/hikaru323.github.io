import { PixelGfx, mix } from "./gfx";
import { shell, type ShellColors } from "./palette";
import { CART, CART_BUFFER } from "./spec";

/**
 * カセットの外装（樹脂の本体）を描く。ラベルは別に描いて後から貼る。
 *
 * 実機のドット絵を1pxずつ測って分かったこと:
 *   ・形は「上が広い板 ＋ 下だけ左右を切り欠いた差込口側の段」の1枚きり。
 *     段を別の箱として描き足すと、途端にブラウン管テレビに見える。
 *   ・輪郭は1px。面の中は 明・面・暗・深 の4段でほぼ足りる。
 *   ・上のへりだけが明るく、左右と下は同じくらい暗い。正面から見た抜き勾配。
 *   ・ラベルの落ち込みは1pxだけ。額縁にすると絵が沈む。
 *   ・上寄りの左右のへりに、指がかりの刻みが数本入っている。
 *
 * なので陰影は面ごとに手で置かず、「形のへりまで何px あるか」だけから決める。
 * こうすると切り欠きの内側の角にも自然に段差がつき、面の切り替わりが読める。
 */
export type CartridgeOptions = {
  shellName: string;
  /** 型番。外装に直接刻まれている想定 */
  code: string;
  /** 差し込めない＝未公開のカセットは、樹脂だけの無地にする */
  blank?: boolean;
  /** 影を描くか */
  shadow?: boolean;
};

/** 本体（広い面）が占める高さ。これより下は差込口側の細い段になる。 */
const BODY_H = 56;
/** 差込口側の段が本体より内側に入る量。ラベルの余白より1pxだけ外に出す。 */
const SHROUD_INSET = 8;

/** 指がかりの刻み。実機は上寄りの左右のへりに数本ある。 */
const RIDGE_TOP = 5;
const RIDGE_COUNT = 4;
const RIDGE_STEP = 3;

// ── 形 ────────────────────────────────────────────────────────

/** 樹脂の塊の輪郭。形の定義はここ1か所だけ。 */
function isSolid(x: number, y: number): boolean {
  const { W, H } = CART;
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  if (y < BODY_H) {
    // 上の2隅を1pxだけ落とす。角が立ちすぎると板に見える
    return !(y === 0 && (x === 0 || x === W - 1));
  }
  const l = SHROUD_INSET;
  const r = W - 1 - SHROUD_INSET;
  if (x < l || x > r) return false;
  return !(y === H - 1 && (x === l || x === r));
}

type EdgeDist = {
  solid: Uint8Array;
  /** そのピクセルから上／下／左／右に、へりまで何px 続いているか。0 = すぐ外 */
  up: Int16Array;
  down: Int16Array;
  left: Int16Array;
  right: Int16Array;
};

let CACHED: EdgeDist | null = null;

/** 形は毎回同じなので、へりまでの距離は一度だけ数えて使い回す。 */
function edgeDist(): EdgeDist {
  if (CACHED) return CACHED;
  const { W, H } = CART;
  const n = W * H;
  const solid = new Uint8Array(n);
  const up = new Int16Array(n);
  const down = new Int16Array(n);
  const left = new Int16Array(n);
  const right = new Int16Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) solid[y * W + x] = isSolid(x, y) ? 1 : 0;

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!solid[i]) continue;
      up[i] = y > 0 && solid[i - W] ? up[i - W] + 1 : 0;
      left[i] = x > 0 && solid[i - 1] ? left[i - 1] + 1 : 0;
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (!solid[i]) continue;
      down[i] = y < H - 1 && solid[i + W] ? down[i + W] + 1 : 0;
      right[i] = x < W - 1 && solid[i + 1] ? right[i + 1] + 1 : 0;
    }
  CACHED = { solid, up, down, left, right };
  return CACHED;
}

// ── 色 ────────────────────────────────────────────────────────

type Tones = {
  edge: string;
  deep: string;
  dark: string;
  mid: string;
  face: string;
  light: string;
  lightest: string;
  emboss: string;
};

/** 外装色から、面の段に使う色を作る。段は6つ。これ以上増やすと写真になる。 */
function tones(s: ShellColors): Tones {
  return {
    edge: s.edge,
    deep: mix(s.dark, s.edge, 0.5),
    dark: s.dark,
    mid: mix(s.face, s.dark, 0.5),
    face: s.face,
    light: s.light,
    lightest: s.lightest,
    // 型番の刻印。実物の彫りは離れると見えない。ここも寄って初めて読める濃さにする
    emboss: mix(s.face, s.emboss, 0.13),
  };
}

/**
 * へりまでの距離から面の色を選ぶ。上から順に効く。
 * 右を先に見ているのは、右上の角で「上のハイライト」より「右の陰」を勝たせるため。
 * 実機のドット絵もそうなっていて、ここが逆だと角が光って風船みたいになる。
 */
function toneAt(t: Tones, u: number, d: number, l: number, r: number): string {
  if (u === 0 || d === 0 || l === 0 || r === 0) return t.edge;
  if (r <= 1) return t.deep;
  if (u <= 1) return t.lightest;
  if (l <= 1 || d <= 1) return t.dark;
  if (r <= 2) return t.dark;
  if (u <= 2) return t.light;
  if (l <= 2) return t.dark;
  if (d <= 2 || l <= 3 || r <= 3) return t.mid;
  return t.face;
}

/**
 * 差込口側の段は本体より小さい部品なので、へりの丸みも浅い。
 * ここまで本体と同じ3段でやると、段が「別の箱」に見えてしまう。
 */
function toneAtShroud(t: Tones, d: number, l: number, r: number): string {
  if (d === 0 || l === 0 || r === 0) return t.edge;
  if (r <= 1) return t.deep;
  if (l <= 1 || d <= 1) return t.dark;
  if (l <= 2 || r <= 2 || d <= 2) return t.mid;
  return t.face;
}

// ── 描く ──────────────────────────────────────────────────────

export function drawCartridge(g: PixelGfx, o: CartridgeOptions) {
  const s: ShellColors = shell(o.shellName);
  const t = tones(s);
  const { W, H, LABEL_X, LABEL_Y, LABEL_W, LABEL_H } = CART;
  const D = edgeDist();

  if (o.shadow !== false) drawShadow(g, D);

  // ── 樹脂の面 ───────────────────────────────────────────────
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!D.solid[i]) continue;
      const c =
        y < BODY_H
          ? toneAt(t, D.up[i], D.down[i], D.left[i], D.right[i])
          : toneAtShroud(t, D.down[i], D.left[i], D.right[i]);
      g.px(x, y, c);
    }

  // 切り欠きの入り隅。ここだけは輪郭が直角に折れるので、1px落として角を殺す
  g.px(SHROUD_INSET, BODY_H - 1, t.dark);
  g.px(W - 1 - SHROUD_INSET, BODY_H - 1, t.dark);

  // ── 指がかりの刻み ─────────────────────────────────────────
  // 左右のへりの上寄りに数本。刻みの山が光を拾うので、当たりだけを1px置く。
  // 影まで付けると輪郭が欠けたように見えるので付けない。
  for (let k = 0; k < RIDGE_COUNT; k++) {
    const y = RIDGE_TOP + k * RIDGE_STEP;
    g.hline(1, y, 3, t.light);
    // 右はいちばん外の1px（へりのいちばん深い段）を残す。ここを潰すと輪郭が膨らむ
    g.hline(W - 5, y, 3, t.mid);
  }

  // ── ラベルの落ち込み ───────────────────────────────────────
  // 1pxだけ。上と左に影、下と右にわずかな返し。これ以上やると額縁になる。
  const rx = LABEL_X - 1;
  const ry = LABEL_Y - 1;
  const rw = LABEL_W + 2;
  const rh = LABEL_H + 2;
  g.hline(rx, ry, rw, t.dark);
  g.vline(rx, ry, rh, t.dark);
  g.hline(rx + 1, ry + rh - 1, rw - 1, t.mid);
  g.vline(rx + rw - 1, ry + 1, rh - 1, t.mid);

  if (o.blank) drawBlankRecess(g, s);

  // ── 刻印 ───────────────────────────────────────────────────
  // 実機は下の帯に型番が浅く彫ってある。読めるか読めないかの濃さで置く。
  const embossY = 53;
  g.text3x5(LABEL_X + 1, embossY, o.code, t.emboss);
  const maker = "KOSU.KUMA";
  g.text3x5(LABEL_X + LABEL_W - 2 - g.text3x5Width(maker), embossY, maker, t.emboss);
}

/** ラベルの貼られていない外装。凹みの底が見えている状態にする。 */
function drawBlankRecess(g: PixelGfx, s: ShellColors) {
  const { LABEL_X, LABEL_Y, LABEL_W, LABEL_H } = CART;
  const floor = mix(s.face, s.dark, 0.34);
  g.rect(LABEL_X, LABEL_Y, LABEL_W, LABEL_H, floor);
  // 梨地。粗さの違う2種をごく薄く重ねる。濃くすると汚れに見える
  g.noise(LABEL_X, LABEL_Y, LABEL_W, LABEL_H, mix(floor, s.dark, 0.18), 0.05, 9137);
  g.noise(LABEL_X, LABEL_Y, LABEL_W, LABEL_H, mix(floor, s.light, 0.16), 0.04, 4211);
  // 底の浅い段
  g.hline(LABEL_X, LABEL_Y, LABEL_W, mix(floor, s.dark, 0.45));
  g.vline(LABEL_X, LABEL_Y, LABEL_H, mix(floor, s.dark, 0.45));
  g.hline(LABEL_X + 1, LABEL_Y + LABEL_H - 1, LABEL_W - 1, mix(floor, s.light, 0.3));
  g.vline(LABEL_X + LABEL_W - 1, LABEL_Y + 1, LABEL_H - 1, mix(floor, s.light, 0.3));
}

/** 紙の上に落ちる影。カセットと同じ形を2回ずらして置き、外側ほど薄くする。 */
function drawShadow(g: PixelGfx, D: EdgeDist) {
  const { W, H } = CART;
  const layers: Array<[number, number, string]> = [
    [3, 3, "#00000012"],
    [2, 2, "#0000001a"],
  ];
  for (const [dx, dy, c] of layers)
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) if (D.solid[y * W + x]) g.px(x + dx, y + dy, c);
}

/** カセット1本を、影のぶんの余白込みで新しいバッファに描く。 */
export function renderCartridge(o: CartridgeOptions): PixelGfx {
  const g = new PixelGfx(CART_BUFFER.W, CART_BUFFER.H);
  drawCartridge(g, o);
  return g;
}
