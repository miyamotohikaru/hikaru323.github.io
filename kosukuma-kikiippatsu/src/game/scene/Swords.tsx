"use client";

// 刺さっている剣。手続き生成のローポリ剣(刃+鍔+柄+柄頭)を1ジオメトリに
// マージし、mask のビットが立っている穴へ InstancedMesh で配置する。
// 向きは法線+prng(holeId)による決定的な傾き(全プレイヤーで同じ見た目)。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { COLORS, HOLE_COUNT } from "@/lib/config";
import { getBit } from "@/lib/bitmask";
import { getHolePoints } from "@/lib/holes";
import { hashString, mulberry32, randRange } from "@/lib/prng";
import { useGameStore } from "@/game/store";

const UP = new THREE.Vector3(0, 1, 0);
const tmpObj = new THREE.Object3D();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpQuatLocal = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();

/** ジオメトリ全頂点に単色の頂点カラーを塗る */
function paint(geo: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const c = new THREE.Color(hex);
  const count = geo.getAttribute("position").count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return geo;
}

/**
 * ローポリ剣。原点=月面への刺さり口、+Y=柄の方向(法線向きに配置する)。
 * 刃の先端は月内部(-Y)へ埋まる。
 */
function makeSwordGeometry(): THREE.BufferGeometry {
  // 刃: 4角柱を平たく潰してダイヤ断面に。先端(下)ほど細い
  const blade = new THREE.CylinderGeometry(0.05, 0.012, 0.9, 4, 1);
  blade.scale(1.7, 1, 0.45);
  blade.translate(0, -0.12, 0); // 表面上に出るのは~0.33
  paint(blade, "#dfe7f5"); // 薄い銀

  // 鍔(つば)
  const guard = new THREE.BoxGeometry(0.32, 0.05, 0.1);
  guard.translate(0, 0.355, 0);
  paint(guard, COLORS.accent);

  // 柄(グリップ)。鍔寄りがやや太い
  const grip = new THREE.CylinderGeometry(0.034, 0.042, 0.24, 8, 1);
  grip.translate(0, 0.5, 0);
  paint(grip, "#e0a92e"); // アクセントを少し落とした金

  // 柄頭(ポンメル)
  const pommel = new THREE.SphereGeometry(0.06, 8, 6);
  pommel.translate(0, 0.65, 0);
  paint(pommel, COLORS.accent);

  const merged = mergeGeometries([blade, guard, grip, pommel]);
  blade.dispose();
  guard.dispose();
  grip.dispose();
  pommel.dispose();
  return merged;
}

export default function Swords() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mask = useGameStore((s) => s.mask);
  const points = useMemo(() => getHolePoints(), []);
  const geometry = useMemo(makeSwordGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.32,
        metalness: 0.55,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // mask が変わったときだけ行列を再構築(毎フレームは触らない)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    let n = 0;
    for (let id = 0; id < HOLE_COUNT; id++) {
      if (!getBit(mask, id)) continue;
      const p = points[id];
      tmpNormal.set(p.normal[0], p.normal[1], p.normal[2]);
      tmpQuat.setFromUnitVectors(UP, tmpNormal);
      // 決定的な傾き(2〜6°)とロール。誰の画面でも同じ剣の向きになる
      const rng = mulberry32(hashString(`sword-${id}`));
      const tilt = THREE.MathUtils.degToRad(randRange(rng, 2, 6));
      const tiltDir = randRange(rng, 0, Math.PI * 2);
      const roll = randRange(rng, 0, Math.PI * 2);
      tmpEuler.set(Math.cos(tiltDir) * tilt, roll, Math.sin(tiltDir) * tilt, "YXZ");
      tmpQuatLocal.setFromEuler(tmpEuler);
      tmpQuat.multiply(tmpQuatLocal);

      tmpObj.position.set(p.position[0], p.position[1], p.position[2]);
      tmpObj.quaternion.copy(tmpQuat);
      tmpObj.scale.setScalar(randRange(rng, 0.92, 1.08));
      tmpObj.updateMatrix();
      mesh.setMatrixAt(n, tmpObj.matrix);
      n++;
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  }, [mask, points]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, HOLE_COUNT]}
      frustumCulled={false}
      // 穴のホバー/タップを遮らないようレイキャスト対象から外す
      raycast={() => undefined}
    />
  );
}
