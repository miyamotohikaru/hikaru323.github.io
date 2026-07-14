"use client";

// 1000個の剣穴。InstancedMeshひとつで描画し、ホバー/選択は
// インスタンスカラー+スケールのフレーム内アニメで表現する。

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { COLORS, HOLE_COUNT, MOON_RADIUS } from "@/lib/config";
import { getBit } from "@/lib/bitmask";
import { getHolePoints } from "@/lib/holes";
import { useGameStore } from "@/game/store";

const COLOR_BASE = new THREE.Color("#191613"); // 暗い穴の口(実写月面に合う暗灰)
const COLOR_HOVER = new THREE.Color("#e8e2d2"); // ホバーで明るく
const COLOR_SELECTED = new THREE.Color(COLORS.accent);
const COLOR_PULSE = new THREE.Color("#fff4b8"); // 選択中の明滅の明るい側

const UP = new THREE.Vector3(0, 1, 0);
const tmpObj = new THREE.Object3D();
const tmpColor = new THREE.Color();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

/** 穴を月面へ少し沈める量(リムだけ顔を出す) */
const SINK = 0.016;

export default function Holes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => getHolePoints(), []);

  // 各穴の基準位置・姿勢・口径の個体差を事前計算(毎フレームの再合成用)
  const base = useMemo(() => {
    const pos = new Float32Array(HOLE_COUNT * 3);
    const quat = new Float32Array(HOLE_COUNT * 4);
    const size = new Float32Array(HOLE_COUNT);
    for (let i = 0; i < HOLE_COUNT; i++) {
      const p = points[i];
      tmpNormal.set(p.normal[0], p.normal[1], p.normal[2]);
      pos[i * 3] = p.position[0] - tmpNormal.x * SINK;
      pos[i * 3 + 1] = p.position[1] - tmpNormal.y * SINK;
      pos[i * 3 + 2] = p.position[2] - tmpNormal.z * SINK;
      tmpQuat.setFromUnitVectors(UP, tmpNormal);
      quat[i * 4] = tmpQuat.x;
      quat[i * 4 + 1] = tmpQuat.y;
      quat[i * 4 + 2] = tmpQuat.z;
      quat[i * 4 + 3] = tmpQuat.w;
      size[i] = p.scale;
    }
    return { pos, quat, size };
  }, [points]);

  const geometry = useMemo(
    // 上がやや広い浅いシリンダー=すり鉢状の穴の口(近接でも丸く見える24分割)
    () => new THREE.CylinderGeometry(0.125, 0.095, 0.07, 24, 1),
    []
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff", // インスタンスカラーをそのまま見せる
        roughness: 0.9,
        metalness: 0,
      }),
    []
  );

  // アニメ管理: 現在スケールと「動いている穴」だけを毎フレーム更新する
  const scales = useRef(new Float32Array(HOLE_COUNT).fill(1));
  const active = useRef(new Set<number>());
  const prevHover = useRef<number | null>(null);
  const prevSelected = useRef<number | null>(null);

  /** 基準位置+姿勢+スケール(個体差×アニメ)で行列を書き込む */
  const writeMatrix = (mesh: THREE.InstancedMesh, id: number, sc: number) => {
    const { pos, quat, size } = base;
    tmpObj.position.set(pos[id * 3], pos[id * 3 + 1], pos[id * 3 + 2]);
    tmpObj.quaternion.set(
      quat[id * 4],
      quat[id * 4 + 1],
      quat[id * 4 + 2],
      quat[id * 4 + 3]
    );
    // 法線方向(ローカルY)の厚みは変えず、口径だけ広げる
    const s = sc * size[id];
    tmpObj.scale.set(s, 1, s);
    tmpObj.updateMatrix();
    mesh.setMatrixAt(id, tmpObj.matrix);
  };

  // 初期配置: 全インスタンスの行列と基本色
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < HOLE_COUNT; i++) {
      writeMatrix(mesh, i, 1);
      mesh.setColorAt(i, COLOR_BASE);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // idleを離れたらカーソルを戻す
  useEffect(() => {
    const unsub = useGameStore.subscribe((s) => {
      if (s.phase !== "idle") document.body.style.cursor = "";
    });
    return () => {
      unsub();
      document.body.style.cursor = "";
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const s = useGameStore.getState();
    const hovered = s.phase === "idle" ? s.hoveredHole : null;
    const selected = s.selectedHole;
    const set = active.current;

    // 対象が変わった穴をアニメ対象に追加
    if (hovered !== prevHover.current || selected !== prevSelected.current) {
      for (const id of [prevHover.current, prevSelected.current, hovered, selected]) {
        if (id !== null) set.add(id);
      }
      prevHover.current = hovered;
      prevSelected.current = selected;
    }
    if (set.size === 0) return;

    const time = state.clock.elapsedTime;
    const arr = scales.current;
    const done: number[] = [];
    const k = Math.min(1, delta * 14); // ばね風の追従

    for (const id of set) {
      const target = id === selected ? 1.45 : id === hovered ? 1.22 : 1;
      let sc = arr[id];
      sc += (target - sc) * k;
      // 色: 選択はaccentの明滅、ホバーは明るく、それ以外は基本色へ
      if (id === selected) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 7);
        tmpColor.copy(COLOR_SELECTED).lerp(COLOR_PULSE, pulse);
      } else if (id === hovered) {
        tmpColor.copy(COLOR_HOVER);
      } else {
        tmpColor.copy(COLOR_BASE);
        if (Math.abs(sc - 1) < 0.002) {
          sc = 1;
          done.push(id);
        }
      }
      arr[id] = sc;
      writeMatrix(mesh, id, sc);
      mesh.setColorAt(id, tmpColor);
    }
    for (const id of done) set.delete(id);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  /**
   * 月面のヒット位置から最寄りの「まだ空いている」穴を返す(タップ寛容化)。
   * 穴そのものは小さいので、見えない月サイズの球でレイを受けて
   * いちばん近い空き穴を選ぶ。遠すぎる(穴の隙間の広い場所)は null。
   */
  const pickNearest = (
    e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>
  ): number | null => {
    const p = e.point; // ピッキング球(半径MOON_RADIUS)上のワールド座標
    const mask = useGameStore.getState().mask;
    let best = -1;
    let bestD = Infinity;
    const { pos } = base;
    for (let i = 0; i < HOLE_COUNT; i++) {
      if (getBit(mask, i)) continue; // 刺さり済みは選ばせない
      const dx = pos[i * 3] - p.x;
      const dy = pos[i * 3 + 1] - p.y;
      const dz = pos[i * 3 + 2] - p.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    // 半径0.6unit以内なら採用(ジッターで隙間が広がった場所もカバー)
    return bestD < 0.36 ? best : null;
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const s = useGameStore.getState();
    if (s.phase !== "idle") {
      if (s.hoveredHole !== null) s.hoverHole(null);
      return;
    }
    const id = pickNearest(e);
    s.hoverHole(id);
    document.body.style.cursor = id !== null ? "pointer" : "";
  };

  const handleOut = () => {
    useGameStore.getState().hoverHole(null);
    document.body.style.cursor = "";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // ドラッグ(月回し)はタップ扱いにしない
    const id = pickNearest(e);
    if (id === null) return;
    useGameStore.getState().selectHole(id); // phase/cooldownの判定はstore側
  };

  return (
    <group>
      {/* 描画される1000個の穴(レイキャストはピッキング球に任せる) */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, HOLE_COUNT]}
        frustumCulled={false}
      />
      {/* 見えないピッキング球: 月面のどこを触っても最寄りの穴が選べる */}
      <mesh
        onPointerMove={handleMove}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[MOON_RADIUS, 24, 24]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
