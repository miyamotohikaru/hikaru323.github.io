// 月面上の穴の配置。フィボナッチ球で均等散布したあと、決定的な乱数で
// 位置をずらし口径にも個体差をつけて、クレーターのような自然なバラつきに
// する。こすくまくんが刺さっている北極まわり(POLAR_CAP_DEG)は除外。
// 結果は決定的(サーバー/全クライアントで同一。index = holeId)。

import { HOLE_COUNT, MOON_RADIUS, POLAR_CAP_DEG } from "./config";
import { hashString, mulberry32 } from "./prng";

export interface HolePoint {
  /** 月中心からのローカル座標(半径 MOON_RADIUS 上) */
  position: [number, number, number];
  /** 外向き法線(単位ベクトル) */
  normal: [number, number, number];
  /** 穴の口径の個体差(1が標準。小さい穴多め・大きい穴少なめ) */
  scale: number;
}

/** 位置ずらしの最大距離(月面上の弧長, world units)。穴間隔は約0.56 */
const JITTER_MAX = 0.34;

let cache: HolePoint[] | null = null;

/** HOLE_COUNT 個の穴の位置を返す(index = holeId)。結果はモジュール内キャッシュ */
export function getHolePoints(): HolePoint[] {
  if (cache) return cache;
  const capCos = Math.cos((POLAR_CAP_DEG * Math.PI) / 180);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rng = mulberry32(hashString("kosukuma-holes-v2"));
  const pts: HolePoint[] = [];
  // 十分多めに生成して、キャップ外のものから先頭 HOLE_COUNT 個を採用
  const overshoot = Math.ceil(HOLE_COUNT / (1 - (1 - capCos) / 2)) + 64;
  for (let i = 0; i < overshoot && pts.length < HOLE_COUNT; i++) {
    const y = 1 - (2 * (i + 0.5)) / overshoot; // 1 → -1
    if (y > capCos) continue; // 北極キャップは除外
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    let nx = Math.cos(theta) * r;
    let ny = y;
    let nz = Math.sin(theta) * r;

    // ── 決定的ジッター(接平面方向へずらして再正規化) ──
    // 分岐に関わらず消費する乱数の個数を揃えて決定性を保つ
    const jAngle = rng() * Math.PI * 2;
    const jDist = Math.pow(rng(), 0.75) * JITTER_MAX;
    // 小さめ中心の分布(集合体恐怖症に配慮して「丸の群れ」感を抑える)
    const scale = 0.5 + 1.35 * Math.pow(rng(), 2.4);

    // 接平面の基底(法線がY軸に近い場合はX軸から作る)
    let t1x: number, t1y: number, t1z: number;
    if (Math.abs(ny) < 0.94) {
      // t1 = normalize(n × up)
      const len = Math.hypot(nz, nx);
      t1x = nz / len;
      t1y = 0;
      t1z = -nx / len;
    } else {
      // t1 = normalize(n × xAxis)
      const len = Math.hypot(nz, ny);
      t1x = 0;
      t1y = nz / len;
      t1z = -ny / len;
    }
    // t2 = n × t1
    const t2x = ny * t1z - nz * t1y;
    const t2y = nz * t1x - nx * t1z;
    const t2z = nx * t1y - ny * t1x;

    const ang = jDist / MOON_RADIUS; // 弧長→角度
    const ox = (t1x * Math.cos(jAngle) + t2x * Math.sin(jAngle)) * ang;
    const oy = (t1y * Math.cos(jAngle) + t2y * Math.sin(jAngle)) * ang;
    const oz = (t1z * Math.cos(jAngle) + t2z * Math.sin(jAngle)) * ang;
    const jx = nx + ox;
    const jy = ny + oy;
    const jz = nz + oz;
    const jlen = Math.hypot(jx, jy, jz);
    const jnx = jx / jlen;
    const jny = jy / jlen;
    const jnz = jz / jlen;

    // ずらした結果が北極キャップへ入るときだけ、ずらし無しにする
    if (jny <= capCos - 0.005) {
      nx = jnx;
      ny = jny;
      nz = jnz;
    }

    pts.push({
      position: [nx * MOON_RADIUS, ny * MOON_RADIUS, nz * MOON_RADIUS],
      normal: [nx, ny, nz],
      scale,
    });
  }
  cache = pts;
  return pts;
}
