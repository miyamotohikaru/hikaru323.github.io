// チャーム(剣にぶら下げる小さなかざり)の形。
// 画像アセットを足さない方針なので、12種すべての輪郭を点列/数式で作り、
// ExtrudeGeometry で厚みと面取りをつけて「つやのある小さな樹脂パーツ」にする。
//
// 座標の約束: 原点 = ぶら下げ点(= 形の上端の中央)。チャームは原点から下(-Y)へ垂れる。
// そうしておくと、呼び出し側はひもの先に置くだけで正しくぶら下がる。

import * as THREE from "three";
import type { CharmShape } from "@/lib/config";

/** 輪郭はいったん「半径1くらいの円に収まる」正規化空間で作り、最後に size へ縮める */
const NORM = 1;

// ── 輪郭づくりの小道具 ────────────────────────────────

/** 閉じた点列から Shape を作る */
function shapeFromPoints(pts: THREE.Vector2[]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
  s.closePath();
  return s;
}

/** 数値の組から点列へ(見た目の座標をそのまま書けるように) */
function v2(xy: number[][]): THREE.Vector2[] {
  return xy.map(([x, y]) => new THREE.Vector2(x, y));
}

/** 点列をまとめて回す(星や三日月の「向き」をそろえる用) */
function rotate(pts: THREE.Vector2[], angle: number): THREE.Vector2[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return pts.map((p) => new THREE.Vector2(p.x * c - p.y * s, p.x * s + p.y * c));
}

/** 極座標 r(θ) をサンプリングした輪郭。花びら系はこれがいちばん素直 */
function polar(n: number, radius: (angle: number) => number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = radius(a);
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
}

// ── 12種の輪郭 ──────────────────────────────────────

/** ほし: 5角星。頂点をひとつ真上に向ける */
function starPoints(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? NORM : NORM * 0.47;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
}

/**
 * みかづき: 大きい円から、ずらした小さい円を削った形。
 * 2円の交点を計算して、外側の弧 → 内側の弧 の順につなぐと三日月になる。
 * (面取りで潰れないよう、先が尖りすぎない太めの三日月にしてある)
 */
function moonPoints(): THREE.Vector2[] {
  const R = NORM;
  const r = NORM * 0.82;
  const d = NORM * 0.42;
  const x = (d * d + R * R - r * r) / (2 * d);
  const y = Math.sqrt(Math.max(0, R * R - x * x));
  const a0 = Math.atan2(y, x); // 外円上の交点
  const b0 = Math.atan2(y, x - d); // 内円上の交点
  const N = 16;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    // 外側: a0 → 2π-a0 を左回り(遠い側をぐるっと)
    const a = a0 + ((Math.PI * 2 - a0 * 2) * i) / N;
    pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R));
  }
  for (let i = 0; i <= N; i++) {
    // 内側: -b0 → b0 を右回りで戻る(削られる側の縁)
    const a = -b0 - ((Math.PI * 2 - b0 * 2) * i) / N;
    pts.push(new THREE.Vector2(d + Math.cos(a) * r, Math.sin(a) * r));
  }
  return rotate(pts, Math.PI * 0.62); // 開きを右上に向ける
}

/** しずく: 下がまるく、上がすっと尖るしずく曲線 */
function dropPoints(): THREE.Vector2[] {
  const N = 26;
  const m = 1.7;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = Math.cos(t);
    const y = Math.sin(t) * Math.pow(Math.abs(Math.sin(t / 2)), m) * 1.75;
    pts.push(new THREE.Vector2(-y, x)); // 90°回して先端を上へ
  }
  return pts;
}

/** ハート: おなじみのハート曲線 */
function heartPoints(): THREE.Vector2[] {
  const N = 30;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    pts.push(new THREE.Vector2(x / 16, y / 16));
  }
  return pts;
}

/** よつば: 4つのまるい葉 */
function cloverPoints(): THREE.Vector2[] {
  return polar(
    48,
    (a) => NORM * (0.38 + 0.62 * Math.pow(Math.abs(Math.cos(2 * a)), 0.5))
  );
}

/** ほうせき: 上が平らで下が尖った、カットされた宝石のシルエット */
function gemPoints(): THREE.Vector2[] {
  return v2([
    [-0.46, 0.88],
    [0.46, 0.88],
    [0.95, 0.28],
    [0, -1],
    [-0.95, 0.28],
  ]);
}

/** すず: つまみ付きのベル。小さくても「鈴」と分かる裾広がりのシルエット */
function bellShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.15, 0.7);
  s.quadraticCurveTo(-0.15, 0.98, 0, 0.98); // 上のつまみ
  s.quadraticCurveTo(0.15, 0.98, 0.15, 0.7);
  s.bezierCurveTo(0.7, 0.5, 0.86, 0.05, 0.86, -0.5); // 右の裾
  s.lineTo(1, -0.7);
  s.lineTo(-1, -0.7);
  s.lineTo(-0.86, -0.5);
  s.bezierCurveTo(-0.86, 0.05, -0.7, 0.5, -0.15, 0.7);
  s.closePath();
  return s;
}

/** おはな: 5枚の花びら */
function flowerPoints(): THREE.Vector2[] {
  return polar(
    50,
    (a) => NORM * (0.52 + 0.48 * Math.pow(Math.abs(Math.cos(2.5 * a)), 0.6))
  );
}

/** おさかな: ふっくらした体と二又の尾びれ */
function fishPoints(): THREE.Vector2[] {
  return v2([
    [1, 0],
    [0.62, 0.4],
    [0.1, 0.46],
    [-0.42, 0.18],
    [-1, 0.58],
    [-0.72, 0],
    [-1, -0.58],
    [-0.42, -0.18],
    [0.1, -0.46],
    [0.62, -0.4],
  ]);
}

/** かんむり: 3つの山とくぼみ */
function crownPoints(): THREE.Vector2[] {
  return v2([
    [-1, -0.62],
    [1, -0.62],
    [1, 0.12],
    [0.66, 0.96],
    [0.33, 0.22],
    [0, 1.06],
    [-0.33, 0.22],
    [-0.66, 0.96],
    [-1, 0.12],
  ]);
}

/** ほのお: 左右非対称にゆらいだ炎 */
function flameShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0.06, 1.1);
  s.bezierCurveTo(0.62, 0.55, 0.78, 0, 0.6, -0.4);
  s.quadraticCurveTo(0.42, -0.86, -0.06, -0.86);
  s.quadraticCurveTo(-0.56, -0.86, -0.66, -0.34);
  s.bezierCurveTo(-0.76, 0.12, -0.34, 0.28, -0.28, 0.62);
  s.quadraticCurveTo(-0.24, 0.9, 0.06, 1.1);
  s.closePath();
  return s;
}

/** にじ: 半円の帯 */
function rainbowShape(): THREE.Shape {
  const s = new THREE.Shape();
  const cy = -0.25;
  s.absarc(0, cy, 1, 0, Math.PI, false); // 外側の弧
  s.lineTo(-0.55, cy);
  s.absarc(0, cy, 0.55, Math.PI, 0, true); // 内側の弧を戻る
  s.closePath();
  return s;
}

/** CharmShape から2D輪郭を作る(UI側で線として使いたくなったとき用に公開) */
export function makeCharmShape(shape: CharmShape): THREE.Shape {
  switch (shape) {
    case "star":
      return shapeFromPoints(starPoints());
    case "moon":
      return shapeFromPoints(moonPoints());
    case "drop":
      return shapeFromPoints(dropPoints());
    case "heart":
      return shapeFromPoints(heartPoints());
    case "clover":
      return shapeFromPoints(cloverPoints());
    case "gem":
      return shapeFromPoints(gemPoints());
    case "bell":
      return bellShape();
    case "flower":
      return shapeFromPoints(flowerPoints());
    case "fish":
      return shapeFromPoints(fishPoints());
    case "crown":
      return shapeFromPoints(crownPoints());
    case "flame":
      return flameShape();
    case "rainbow":
      return rainbowShape();
    default:
      return shapeFromPoints(starPoints());
  }
}

/**
 * CharmShape から厚み付きのジオメトリを作る。
 * @param shape かたち
 * @param size いちばん長い辺の長さ(three.js units)
 * @returns 原点 = ぶら下げ点(上端の中央)、下へ垂れるジオメトリ
 */
export function makeCharmGeometry(
  shape: CharmShape,
  size = 0.085
): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(makeCharmShape(shape), {
    // 面取りを強めにして、小さくても縁がハイライトを拾う「つやつやの粒」にする
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  if (!bb) return geo;
  // boundingBox は translate/scale のたびに作り直されるので、先に数値で控える
  const { min, max } = bb;
  const midX = (min.x + max.x) / 2;
  const midZ = (min.z + max.z) / 2;
  const topY = max.y;
  const k = size / Math.max(max.x - min.x, max.y - min.y);
  // 前後左右を中央へ寄せてから、まとめて縮める
  geo.translate(-midX, 0, -midZ);
  geo.scale(k, k, k);
  // 上端を原点にそろえる = 原点から下にぶら下がる
  geo.translate(0, -topY * k, 0);
  return geo;
}
