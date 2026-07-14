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
import { getHoleWorld } from "./sharedRefs";

// 穴は本物のクレーター(縁が盛り上がり中が凹む地形)として描く。
// 色はその場所の月面テクスチャから拾って馴染ませる(黒い穴の集合にしない)。
const COLOR_BASE = new THREE.Color("#9a948a"); // テクスチャ読込前のフォールバック
const COLOR_HOVER = new THREE.Color("#ffe9a0"); // ホバーで暖かく光る
const COLOR_SELECTED = new THREE.Color(COLORS.accent);
const COLOR_PULSE = new THREE.Color("#fff4b8"); // 選択中の明滅の明るい側

const UP = new THREE.Vector3(0, 1, 0);
const tmpObj = new THREE.Object3D();
const tmpColor = new THREE.Color();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

/** クレーターを月面から浮かせる量。すり鉢の底はあえて球面下に沈め、
    月面テクスチャがそのまま「クレーターの底」になるようにする */
const LIFT = 0.006;

/**
 * 月面テクスチャから各穴の位置の色を拾う(非同期)。
 * クレーターを周囲の地形色に馴染ませるための下地色になる。
 */
function sampleMoonColors(
  onReady: (colors: Float32Array) => void
): () => void {
  let cancelled = false;
  const img = new Image();
  img.onload = () => {
    if (cancelled) return;
    const W = 512;
    const H = 256;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;
    const pts = getHolePoints();
    const out = new Float32Array(HOLE_COUNT * 3);
    const c = new THREE.Color();
    for (let i = 0; i < HOLE_COUNT; i++) {
      const [nx, ny, nz] = pts[i].normal;
      // three.jsのSphereGeometryと同じ equirect UV (φ = atan2(z, -x))
      const u = (Math.atan2(nz, -nx) / (Math.PI * 2) + 1) % 1;
      const y = Math.acos(Math.min(1, Math.max(-1, ny))) / Math.PI; // 0=北極
      const px = Math.min(W - 1, Math.floor(u * W));
      const py = Math.min(H - 1, Math.floor(y * H));
      const o = (py * W + px) * 4;
      // ほんの少し明るくして「地形」として読めるように
      c.setRGB(data[o] / 255, data[o + 1] / 255, data[o + 2] / 255)
        .convertSRGBToLinear()
        .multiplyScalar(1.18);
      out[i * 3] = Math.min(1, c.r);
      out[i * 3 + 1] = Math.min(1, c.g);
      out[i * 3 + 2] = Math.min(1, c.b);
    }
    onReady(out);
  };
  img.src = "/textures/moon_color.jpg";
  return () => {
    cancelled = true;
  };
}

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
      pos[i * 3] = p.position[0] + tmpNormal.x * LIFT;
      pos[i * 3 + 1] = p.position[1] + tmpNormal.y * LIFT;
      pos[i * 3 + 2] = p.position[2] + tmpNormal.z * LIFT;
      tmpQuat.setFromUnitVectors(UP, tmpNormal);
      quat[i * 4] = tmpQuat.x;
      quat[i * 4 + 1] = tmpQuat.y;
      quat[i * 4 + 2] = tmpQuat.z;
      quat[i * 4 + 3] = tmpQuat.w;
      size[i] = p.scale;
    }
    return { pos, quat, size };
  }, [points]);

  const geometry = useMemo(() => {
    // すり鉢クレーターの断面(中心→外)。縁が盛り上がり、すそ野は月面に接する
    const profile = [
      new THREE.Vector2(0.0, -0.01),
      new THREE.Vector2(0.04, -0.008),
      new THREE.Vector2(0.075, 0.002),
      new THREE.Vector2(0.098, 0.024),
      new THREE.Vector2(0.112, 0.032), // 縁の頂上
      new THREE.Vector2(0.124, 0.012),
      new THREE.Vector2(0.135, 0.0),
    ];
    return new THREE.LatheGeometry(profile, 24);
  }, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff", // インスタンスカラーをそのまま見せる
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide, // 月の輪郭ぎわで裏から見えてもスキマを出さない
      }),
    []
  );

  // アニメ管理: 現在スケールと「動いている穴」だけを毎フレーム更新する
  const scales = useRef(new Float32Array(HOLE_COUNT).fill(1));
  const active = useRef(new Set<number>());
  const prevHover = useRef<number | null>(null);
  const prevSelected = useRef<number | null>(null);
  // 月面テクスチャから拾った各穴の下地色(読込完了までnull)
  const baseColors = useRef<Float32Array | null>(null);

  useEffect(() => {
    return sampleMoonColors((colors) => {
      baseColors.current = colors;
      const mesh = meshRef.current;
      if (!mesh) return;
      for (let i = 0; i < HOLE_COUNT; i++) {
        tmpColor.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        mesh.setColorAt(i, tmpColor);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, []);

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

  // 選択中の穴を指す光るターゲットリング(クレーターは地形色なので目印が要る)
  const markerRef = useRef<THREE.Mesh>(null);
  const markerGeom = useMemo(() => {
    const g = new THREE.RingGeometry(0.16, 0.205, 32);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const markerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.accent,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      markerGeom.dispose();
      markerMat.dispose();
    };
  }, [geometry, material, markerGeom, markerMat]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const s = useGameStore.getState();
    const hovered = s.phase === "idle" ? s.hoveredHole : null;
    const selected = s.selectedHole;
    const set = active.current;
    const time = state.clock.elapsedTime;

    // ターゲットリングの表示・脈動
    const marker = markerRef.current;
    if (marker) {
      const show =
        selected !== null &&
        (s.phase === "confirming" ||
          s.phase === "stabbing" ||
          s.phase === "suspense");
      marker.visible = show;
      if (show && selected !== null) {
        const hw = getHoleWorld(selected);
        marker.position.copy(hw.pos).addScaledVector(hw.normal, 0.04);
        tmpQuat.setFromUnitVectors(UP, hw.normal);
        marker.quaternion.copy(tmpQuat);
        marker.scale.setScalar(
          Math.max(1, base.size[selected]) * (1 + 0.07 * Math.sin(time * 5))
        );
        markerMat.opacity = 0.72 + 0.22 * Math.sin(time * 5);
      }
    }

    // 対象が変わった穴をアニメ対象に追加
    if (hovered !== prevHover.current || selected !== prevSelected.current) {
      for (const id of [prevHover.current, prevSelected.current, hovered, selected]) {
        if (id !== null) set.add(id);
      }
      prevHover.current = hovered;
      prevSelected.current = selected;
    }
    if (set.size === 0) return;

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
        const bc = baseColors.current;
        if (bc) {
          tmpColor.setRGB(bc[id * 3], bc[id * 3 + 1], bc[id * 3 + 2]);
        } else {
          tmpColor.copy(COLOR_BASE);
        }
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
      {/* 選択中の穴を指す光るターゲットリング */}
      <mesh
        ref={markerRef}
        geometry={markerGeom}
        material={markerMat}
        visible={false}
        raycast={() => undefined}
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
