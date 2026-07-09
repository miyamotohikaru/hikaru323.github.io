// 月面上の穴の配置。フィボナッチ球で均等散布し、こすくまくんが刺さっている
// 北極まわり(POLAR_CAP_DEG)は除外する。決定的(サーバー/全クライアントで同一)。

import { HOLE_COUNT, MOON_RADIUS, POLAR_CAP_DEG } from "./config";

export interface HolePoint {
  /** 月中心からのローカル座標(半径 MOON_RADIUS 上) */
  position: [number, number, number];
  /** 外向き法線(単位ベクトル) */
  normal: [number, number, number];
}

let cache: HolePoint[] | null = null;

/** HOLE_COUNT 個の穴の位置を返す(index = holeId)。結果はモジュール内キャッシュ */
export function getHolePoints(): HolePoint[] {
  if (cache) return cache;
  const capCos = Math.cos((POLAR_CAP_DEG * Math.PI) / 180);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts: HolePoint[] = [];
  // 十分多めに生成して、キャップ外のものから先頭 HOLE_COUNT 個を採用
  const overshoot = Math.ceil(HOLE_COUNT / (1 - (1 - capCos) / 2)) + 64;
  for (let i = 0; i < overshoot && pts.length < HOLE_COUNT; i++) {
    const y = 1 - (2 * (i + 0.5)) / overshoot; // 1 → -1
    if (y > capCos) continue; // 北極キャップは除外
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const nx = Math.cos(theta) * r;
    const nz = Math.sin(theta) * r;
    pts.push({
      position: [nx * MOON_RADIUS, y * MOON_RADIUS, nz * MOON_RADIUS],
      normal: [nx, y, nz],
    });
  }
  cache = pts;
  return pts;
}
