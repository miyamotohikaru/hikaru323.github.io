"use client";

// 刺さっている剣。手続き生成のローポリ剣を「刃」と「柄まわり」の2つの
// InstancedMesh に分け、柄まわりはインスタンスカラーでプレイヤーが選んだ
// 色に塗る(刃は共通の銀)。自分が刺した剣にはふんわり光るハロを重ねる。
// 向きは法線+prng(holeId)による決定的な傾き(全プレイヤーで同じ見た目)。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { COLORS, HOLE_COUNT, SWORD_COLORS } from "@/lib/config";
import { getBit } from "@/lib/bitmask";
import { getHolePoints } from "@/lib/holes";
import { hashString, mulberry32, randRange } from "@/lib/prng";
import { useGameStore } from "@/game/store";
import { makeCircleTexture } from "@/game/scene/effects/textures";

const UP = new THREE.Vector3(0, 1, 0);
const tmpObj = new THREE.Object3D();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpQuatLocal = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpColor = new THREE.Color();

/** デフォルト(色未指定)の柄の色 = いままでの金 */
const DEFAULT_HILT = new THREE.Color(COLORS.accent);
/** SWORD_COLORS を THREE.Color に変換したキャッシュ */
const HILT_COLORS = SWORD_COLORS.map((c) => new THREE.Color(c.hex));

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
 * 刃。原点=月面への刺さり口、+Y=柄の方向(法線向きに配置する)。
 * 刃の先端は月内部(-Y)へ埋まる。
 */
function makeBladeGeometry(): THREE.BufferGeometry {
  // 4角柱を平たく潰してダイヤ断面に。先端(下)ほど細い
  const blade = new THREE.CylinderGeometry(0.05, 0.012, 0.9, 4, 1);
  blade.scale(1.7, 1, 0.45);
  blade.translate(0, -0.12, 0); // 表面上に出るのは~0.33
  paint(blade, "#dfe7f5"); // 薄い銀
  return blade;
}

/**
 * 柄まわり(鍔+グリップ+柄頭)。頂点カラーは白系の濃淡だけにして、
 * インスタンスカラー(プレイヤーの色)を乗算して仕上げる。
 */
function makeHiltGeometry(): THREE.BufferGeometry {
  const guard = new THREE.BoxGeometry(0.32, 0.05, 0.1);
  guard.translate(0, 0.355, 0);
  paint(guard, "#ffffff");

  const grip = new THREE.CylinderGeometry(0.034, 0.042, 0.24, 8, 1);
  grip.translate(0, 0.5, 0);
  paint(grip, "#d9d9d9"); // グリップはひと段暗く(立体感)

  const pommel = new THREE.SphereGeometry(0.06, 8, 6);
  pommel.translate(0, 0.65, 0);
  paint(pommel, "#ffffff");

  const merged = mergeGeometries([guard, grip, pommel]);
  guard.dispose();
  grip.dispose();
  pommel.dispose();
  return merged;
}

/** 自分の剣の上でふんわり光るハロ(1個分) */
function MyGlow({ holeId, colorHex }: { holeId: number; colorHex: string }) {
  const matRef = useRef<THREE.SpriteMaterial>(null);
  const texture = useMemo(() => makeCircleTexture(), []);
  const { pos, phase } = useMemo(() => {
    const p = getHolePoints()[holeId];
    return {
      pos: new THREE.Vector3(
        p.position[0] + p.normal[0] * 0.45,
        p.position[1] + p.normal[1] * 0.45,
        p.position[2] + p.normal[2] * 0.45
      ),
      phase: (holeId % 10) * 0.63, // となり同士で明滅がそろわないように
    };
  }, [holeId]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame((state) => {
    const m = matRef.current;
    if (m) m.opacity = 0.3 + 0.18 * Math.sin(state.clock.elapsedTime * 2.6 + phase);
  });

  return (
    <sprite position={pos} scale={[0.62, 0.62, 0.62]} raycast={() => undefined}>
      <spriteMaterial
        ref={matRef}
        map={texture}
        color={colorHex}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

export default function Swords() {
  const bladeRef = useRef<THREE.InstancedMesh>(null);
  const hiltRef = useRef<THREE.InstancedMesh>(null);
  const mask = useGameStore((s) => s.mask);
  const stabColors = useGameStore((s) => s.stabColors);
  const myStabs = useGameStore((s) => s.myStabs);
  const swordColor = useGameStore((s) => s.swordColor);
  const points = useMemo(() => getHolePoints(), []);
  const bladeGeometry = useMemo(makeBladeGeometry, []);
  const hiltGeometry = useMemo(makeHiltGeometry, []);
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
      bladeGeometry.dispose();
      hiltGeometry.dispose();
      material.dispose();
    };
  }, [bladeGeometry, hiltGeometry, material]);

  // mask/色が変わったときだけ行列と色を再構築(毎フレームは触らない)
  useEffect(() => {
    const blades = bladeRef.current;
    const hilts = hiltRef.current;
    if (!blades || !hilts) return;
    blades.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    hilts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
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
      blades.setMatrixAt(n, tmpObj.matrix);
      hilts.setMatrixAt(n, tmpObj.matrix);

      // 柄の色: 0=デフォルト金 / 1..N=選ばれた色
      const c = stabColors[id];
      if (c > 0 && c <= HILT_COLORS.length) {
        tmpColor.copy(HILT_COLORS[c - 1]);
      } else {
        tmpColor.copy(DEFAULT_HILT);
      }
      hilts.setColorAt(n, tmpColor);
      n++;
    }
    blades.count = n;
    hilts.count = n;
    blades.instanceMatrix.needsUpdate = true;
    hilts.instanceMatrix.needsUpdate = true;
    if (hilts.instanceColor) hilts.instanceColor.needsUpdate = true;
  }, [mask, stabColors, points]);

  const myColorHex = SWORD_COLORS[swordColor]?.hex ?? SWORD_COLORS[0].hex;

  return (
    <group>
      {/* 穴のホバー/タップを遮らないようレイキャスト対象から外す */}
      <instancedMesh
        ref={bladeRef}
        args={[bladeGeometry, material, HOLE_COUNT]}
        frustumCulled={false}
        raycast={() => undefined}
      />
      <instancedMesh
        ref={hiltRef}
        args={[hiltGeometry, material, HOLE_COUNT]}
        frustumCulled={false}
        raycast={() => undefined}
      />
      {/* 自分の剣の目印(この端末で刺したもの)。色は刺したときの色に合わせる */}
      {myStabs.map((id) => {
        if (!getBit(mask, id)) return null;
        const c = stabColors[id];
        const hex =
          c > 0 && c <= SWORD_COLORS.length
            ? SWORD_COLORS[c - 1].hex
            : myColorHex;
        return <MyGlow key={id} holeId={id} colorHex={hex} />;
      })}
    </group>
  );
}
