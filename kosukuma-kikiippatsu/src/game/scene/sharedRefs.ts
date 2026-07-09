// 3Dシーン外(エフェクト・トロフィー・カメラ等)から参照する共有の座標情報。
// 月は原点固定・無回転なので、穴のローカル座標 = ワールド座標。

import * as THREE from "three";
import { MOON_RADIUS } from "@/lib/config";
import { getHolePoints } from "@/lib/holes";

/**
 * こすくまくんの現在ワールド座標。Kosukuma.tsx が毎フレーム更新する。
 * 読み取り専用として扱うこと(書き換えるのは Kosukuma.tsx だけ)。
 */
export const kosukumaWorldPos = new THREE.Vector3(0, MOON_RADIUS, 0);

export interface HoleWorld {
  /** 穴のワールド座標(月表面上) */
  pos: THREE.Vector3;
  /** 外向き法線(単位ベクトル) */
  normal: THREE.Vector3;
}

const cache = new Map<number, HoleWorld>();

/**
 * 穴IDからワールド座標と法線を返す。返すVector3はキャッシュ済みの共有
 * インスタンスなので、変更したい場合は呼び出し側で clone() すること。
 */
export function getHoleWorld(holeId: number): HoleWorld {
  let hit = cache.get(holeId);
  if (!hit) {
    const pts = getHolePoints();
    const idx = Math.min(Math.max(holeId, 0), pts.length - 1);
    const p = pts[idx];
    hit = {
      pos: new THREE.Vector3(p.position[0], p.position[1], p.position[2]),
      normal: new THREE.Vector3(p.normal[0], p.normal[1], p.normal[2]),
    };
    cache.set(holeId, hit);
  }
  return hit;
}
