// チャーム(剣にぶら下げる小さなかざり)の形。
// 画像アセットを足さない方針なので、12種すべての輪郭を点列/数式で作り、
// ExtrudeGeometry で厚みと面取りをつけて「つやのある小さな樹脂パーツ」にする。
// 隠しチャーム「ちきゅう」だけは平たい板ではなく小さな球で、
// これだけ makeEarthCharmParts() で別に作る(下のセクション)。
//
// 座標の約束: 原点 = ぶら下げ点(= 形の上端の中央)。チャームは原点から下(-Y)へ垂れる。
// そうしておくと、呼び出し側はひもの先に置くだけで正しくぶら下がる。

import * as THREE from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
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

// ── 隠しチャーム「ちきゅう」────────────────────────────────
// 地球を1000回つついて こわした人だけが手に入れる。
// ただの青い宝石だと「ほうせき」と見分けがつかないので、**小さな地球そのもの**
// にして、「こわした証」を3つの記号で見せる:
//   1. ギザギザのひびが正面を走っている
//   2. かけらがふたつ、ちょこんと浮いている(戻せなくなった感じ)
//   3. ゆっくり自転する(呼び出し側が回す。生きてはいる)
// 割れて中身が見えたりはしない。こわれたけど元気、がこのゲームのトーン。
//
// 座標の約束はほかのチャームと同じ: 原点 = 上端の中央、下へ垂れる。

/** 大陸/ひびを球の表面から浮かせる量(1 = 海の半径)。Zファイトを避ける */
const EARTH_LAND_LIFT = 1.035;
const EARTH_CRACK_LIFT = 1.055;

/** 単位ベクトルに直交する2軸(接平面の基底)。(t1, t2, d) が右手系になる */
function tangentBasis(d: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const t1 = new THREE.Vector3(0, 1, 0);
  if (Math.abs(d.y) > 0.9) t1.set(1, 0, 0);
  t1.cross(d).normalize();
  const t2 = new THREE.Vector3().crossVectors(d, t1);
  return [t1, t2];
}

/** 位置をそのまま法線にする(球にはりつく面は、球と同じ陰影になってほしい) */
function normalsFromPosition(geo: THREE.BufferGeometry): void {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const n = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const l = Math.hypot(x, y, z) || 1;
    n[i * 3] = x / l;
    n[i * 3 + 1] = y / l;
    n[i * 3 + 2] = z / l;
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(n, 3));
}

/**
 * 球の上にはりつく大陸ひとつ。中心 dir から角半径 ang ぶんの円を、
 * ふちをゆらして描く(まん丸だと水玉模様に見えてしまう)。
 *
 * 中心から縁へ一気に三角形を張ると、三角形は平らなので弦が球の中へもぐり、
 * 大陸のまんなかから海が突きぬけてしまう。同心の輪に分けて細かく張ること。
 */
function continentGeometry(
  dir: THREE.Vector3,
  radius: number,
  ang: number,
  seed: number
): THREE.BufferGeometry {
  const N = 20; // 円周の分割
  const RINGS = 3; // 中心から縁までの分割
  const [t1, t2] = tangentBasis(dir);
  const p = new THREE.Vector3();
  const pos: number[] = [dir.x * radius, dir.y * radius, dir.z * radius];
  const index: number[] = [];
  for (let r = 1; r <= RINGS; r++) {
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const edge =
        ang * (1 + 0.3 * Math.sin(3 * a + seed) + 0.17 * Math.sin(5 * a + seed * 1.7));
      const rr = (edge * r) / RINGS;
      p.copy(dir)
        .multiplyScalar(Math.cos(rr))
        .addScaledVector(t1, Math.cos(a) * Math.sin(rr))
        .addScaledVector(t2, Math.sin(a) * Math.sin(rr))
        .normalize()
        .multiplyScalar(radius);
      pos.push(p.x, p.y, p.z);
    }
  }
  const at = (r: number, i: number) => 1 + (r - 1) * N + (i % N);
  for (let i = 0; i < N; i++) {
    // まんなかは扇。外から見て反時計回り = 表向き
    index.push(0, at(1, i), at(1, i + 1));
    for (let r = 1; r < RINGS; r++) {
      index.push(at(r, i), at(r + 1, i), at(r, i + 1));
      index.push(at(r, i + 1), at(r + 1, i), at(r + 1, i + 1));
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  normalsFromPosition(geo);
  return geo;
}

/** 三角波 (-1..1)。ひびのジグザグに使う */
function triWave(x: number): number {
  return 4 * Math.abs(x - Math.floor(x + 0.5)) - 1;
}

/**
 * 球の表面を走るギザギザのひび。極角θを上から下へ流しながら、
 * 経度φを三角波で折り返して稲妻状にする。両端は細くすぼめる。
 */
function crackGeometry(radius: number): THREE.BufferGeometry {
  const N = 26;
  // 単位球での半幅。太いと「ひび」ではなく「模様」になるので、
  // 遠目に線として読める最小限にとどめる
  const HALF_W = 0.055;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = 0.5 + t * 2.0; // 上のほうから下のほうへ
    // 正面(+Z)まわりで折り返す。折り返しを増やしすぎると角で帯が自分と
    // 重なってしまうので、回数は少なめ・振れ幅は大きめにする
    const ph = 0.42 * triWave(t * 1.6);
    pts.push(
      new THREE.Vector3(
        Math.sin(th) * Math.sin(ph),
        Math.cos(th),
        Math.sin(th) * Math.cos(ph)
      )
    );
  }
  const pos: number[] = [];
  const index: number[] = [];
  const tan = new THREE.Vector3();
  const side = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const p = pts[i];
    tan.copy(pts[Math.min(i + 1, N)]).sub(pts[Math.max(i - 1, 0)]);
    side.crossVectors(p, tan).normalize(); // 接平面のなかで、進行方向と直角
    const w = HALF_W * (0.3 + 0.7 * Math.sin(Math.PI * (i / N)));
    for (const s of [-1, 1]) {
      v.copy(p).addScaledVector(side, w * s).normalize().multiplyScalar(radius);
      pos.push(v.x, v.y, v.z);
    }
    if (i > 0) {
      // 帯の表を外向きにする巻き方(逆にすると、暗いひびが裏返って消える)
      const a = (i - 1) * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  normalsFromPosition(geo);
  return geo;
}

/** ちきゅうチャームの部品。色を分けたいので3つに分かれている */
export interface EarthCharmParts {
  /** 海(球本体)+ 飛び散ったかけら */
  globe: THREE.BufferGeometry;
  /** 大陸 */
  land: THREE.BufferGeometry;
  /** ひび */
  crack: THREE.BufferGeometry;
}

/**
 * 隠しチャーム「ちきゅう」の部品を作る。
 * @param size 見かけの大きさ(ほかのチャームの「いちばん長い辺」とそろう)
 * @returns 原点 = ぶら下げ点(球の上端)、下へ垂れる3つのジオメトリ
 */
export function makeEarthCharmParts(size = 0.085): EarthCharmParts {
  const r = size * 0.46;

  // ── 海(球) + かけら ──
  const sphere = new THREE.SphereGeometry(r, 20, 14);
  // かけらは「ひびの外側」に置く。上のほうに置くとチェーンとけんかするので下寄り
  const chips: THREE.BufferGeometry[] = [sphere];
  const chipAt = (th: number, ph: number, k: number, spin: number) => {
    const g = new THREE.OctahedronGeometry(r * k, 0);
    g.scale(1, 0.6, 0.8); // 平たくして「かけら」に見せる
    g.rotateZ(spin);
    // 球からちょっとだけ離す。離しすぎると、ただの点が浮いているだけに見える
    const lift = r * 1.2;
    g.translate(
      Math.sin(th) * Math.sin(ph) * lift,
      Math.cos(th) * lift,
      Math.sin(th) * Math.cos(ph) * lift
    );
    // 多面体は非インデックスなので、球と混ぜる前にインデックス化する
    // (mergeGeometries は index の有無がそろっていないと null を返す)
    const indexed = mergeVertices(g, 1e-6);
    if (indexed !== g) g.dispose();
    return indexed;
  };
  chips.push(chipAt(1.75, 0.95, 0.17, 0.6));
  chips.push(chipAt(2.25, -0.42, 0.12, -0.9));
  const globe = mergeGeometries(chips) ?? sphere;
  if (globe !== sphere) chips.forEach((g) => g.dispose());

  // ── 大陸(3つ。並べる位置は「地球っぽく見える」だけを狙った手置き) ──
  const lands = [
    continentGeometry(new THREE.Vector3(0.42, 0.5, 0.76).normalize(), r * EARTH_LAND_LIFT, 0.62, 0.4),
    continentGeometry(new THREE.Vector3(-0.72, -0.24, 0.65).normalize(), r * EARTH_LAND_LIFT, 0.5, 2.1),
    continentGeometry(new THREE.Vector3(-0.1, -0.72, -0.68).normalize(), r * EARTH_LAND_LIFT, 0.44, 3.6),
  ];
  const land = mergeGeometries(lands) ?? lands[0];
  if (land !== lands[0]) lands.forEach((g) => g.dispose());

  const crack = crackGeometry(r * EARTH_CRACK_LIFT);

  // 上端を原点にそろえる(ほかのチャームと同じ約束)
  for (const g of [globe, land, crack]) g.translate(0, -r, 0);
  return { globe, land, crack };
}
