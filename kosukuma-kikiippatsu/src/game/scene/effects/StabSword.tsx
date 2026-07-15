"use client";

// 自分の剣。stabbing で「きらめきながら構え → 一気に突き刺す」、
// suspense で柄が小刻みに震え、safe の間は刺さったまま残る
// (idle に戻った瞬間に Swords の刺さり済みインスタンスへ引き継がれる)。

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { T_STAB } from "@/lib/config";
import { useGameStore } from "@/game/store";
import { getHoleWorld } from "@/game/scene/sharedRefs";
import { backOut, easeInCubic, easeOutCubic } from "./easing";
import { makeCircleTexture, makeStarTexture } from "./textures";

// 寸法(ローカル座標: 剣先が原点、+Y が柄の向き)
const BLADE_LEN = 1.5;
const TIP_BURIED = -(BLADE_LEN * 2) / 3; // 刃の 2/3 が埋まる深さ
const RAISE_H = 1.9; // 構えの高さ(穴の法線上)
/** 自分の剣は引きの2ショットでも見えるように大きめの「ヒーローサイズ」 */
const HERO_SCALE = 1.55;

const UP = new THREE.Vector3(0, 1, 0);
// 毎フレームの割り当てを避けるスクラッチ
const _pos = new THREE.Vector3();
const _n = new THREE.Vector3();
const _qAlign = new THREE.Quaternion();
const _qYaw = new THREE.Quaternion();

interface SwordRig {
  root: THREE.Group;
  inner: THREE.Group;
  sparkle: THREE.Sprite;
  sparkleMat: THREE.SpriteMaterial;
  halo: THREE.Sprite;
  haloMat: THREE.SpriteMaterial;
  dispose: () => void;
}

/** ローポリの剣を手続き生成(刃+鍔+柄+柄頭の星) */
function buildSword(): SwordRig {
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const tex = makeStarTexture();

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material): THREE.Mesh => {
    geoms.push(g);
    if (!mats.includes(m)) mats.push(m);
    return new THREE.Mesh(g, m);
  };

  const bladeMat = new THREE.MeshStandardMaterial({
    color: "#eef2ff",
    metalness: 0.85,
    roughness: 0.25,
    // 引きの構図でも月面に埋もれないよう強めに光らせる
    emissive: "#7e8ee0",
    emissiveIntensity: 0.55,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: "#ffd93d",
    metalness: 0.6,
    roughness: 0.35,
    emissive: "#7a5c00",
    emissiveIntensity: 0.3,
  });
  const gripMat = new THREE.MeshStandardMaterial({ color: "#ff9db8", roughness: 0.75 });

  // 剣先(四角錐を下向きに。刃と同じく平たくつぶす)
  const tip = mesh(new THREE.ConeGeometry(0.1, 0.26, 4), bladeMat);
  tip.rotation.x = Math.PI;
  tip.position.y = 0.13;
  tip.scale.z = 0.5;
  // 刀身
  const blade = mesh(new THREE.BoxGeometry(0.17, BLADE_LEN - 0.26, 0.055), bladeMat);
  blade.position.y = 0.26 + (BLADE_LEN - 0.26) / 2;
  // 鍔
  const guard = mesh(new THREE.BoxGeometry(0.54, 0.1, 0.14), goldMat);
  guard.position.y = BLADE_LEN + 0.05;
  // 柄
  const grip = mesh(new THREE.CylinderGeometry(0.06, 0.068, 0.4, 8), gripMat);
  grip.position.y = BLADE_LEN + 0.3;
  // 柄頭の星(平たい八面体)
  const pommel = mesh(new THREE.OctahedronGeometry(0.1), goldMat);
  pommel.position.y = BLADE_LEN + 0.57;
  pommel.scale.z = 0.55;

  // 構え中に刃を走るきらめき(加算スプライト)
  const sparkleMat = new THREE.SpriteMaterial({
    map: tex,
    color: "#fff6c8",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const sparkle = new THREE.Sprite(sparkleMat);
  sparkle.scale.setScalar(0.001);

  // 引きの構図でも「ここに剣がある」と分かる、やわらかい光のハロ
  const haloTex = makeCircleTexture();
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex,
    color: "#ffe9a0",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.position.set(0, BLADE_LEN * 0.55, 0);
  halo.scale.setScalar(1.15);

  const inner = new THREE.Group();
  inner.add(tip, blade, guard, grip, pommel, sparkle, halo);
  const root = new THREE.Group();
  root.add(inner);
  root.visible = false;

  return {
    root,
    inner,
    sparkle,
    sparkleMat,
    halo,
    haloMat,
    dispose: () => {
      geoms.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      sparkleMat.dispose();
      haloMat.dispose();
      haloTex.dispose();
      tex.dispose();
    },
  };
}

export default function StabSword() {
  // マウント時(=stabbing 開始時)の選択穴を固定。演出中に store 側が null になっても保持する
  const holeId = useMemo(() => useGameStore.getState().selectedHole, []);
  const rig = useMemo(buildSword, []);
  useEffect(() => () => rig.dispose(), [rig]);

  useFrame(() => {
    if (holeId === null) return;
    const s = useGameStore.getState();
    const hw = getHoleWorld(holeId);
    _pos.copy(hw.pos);
    _n.copy(hw.normal);
    const t = Date.now() - s.phaseAt;

    let h = TIP_BURIED; // 剣先の高さ(法線方向)
    let yaw = 0;
    let scale = 1;
    let sparkleT = -1; // 0..1: 構え中のきらめき進行(負なら非表示)
    let tiltX = 0;
    let tiltZ = 0;

    if (s.phase === "stabbing") {
      const p = Math.min(t / T_STAB, 1);
      if (p < 0.55) {
        // 構え: ふわっと降りてきて、くるっと回りながらきらめく
        const q = p / 0.55;
        scale = backOut(Math.min(q / 0.28, 1));
        h =
          RAISE_H +
          0.6 * (1 - easeOutCubic(Math.min(q / 0.5, 1))) +
          0.05 * Math.sin(q * Math.PI * 3);
        yaw = (1 - easeOutCubic(q)) * 2.6;
        sparkleT = q;
      } else if (p < 0.68) {
        // ため: ほんの少しだけ引き上げる
        const q = (p - 0.55) / 0.13;
        h = RAISE_H + 0.35 * easeOutCubic(q);
      } else {
        // 一閃: 一気に突き刺す(p=1 で impact イベントと着地が同期)
        const q = Math.min((p - 0.68) / 0.31, 1);
        h = RAISE_H + 0.35 + (TIP_BURIED - RAISE_H - 0.35) * easeInCubic(q);
      }
    } else if (s.phase === "suspense") {
      // 判定待ち: 柄が小刻みに震える(複数周波数の合成で機械っぽさを消す)
      const tt = t / 1000;
      tiltX = Math.sin(tt * 43) * 0.022 + Math.sin(tt * 29 + 1.3) * 0.013;
      tiltZ = Math.cos(tt * 37 + 0.5) * 0.02 + Math.sin(tt * 53) * 0.011;
    } else {
      // safe: 刺したての揺れの余韻だけ残して静止
      const settle = Math.exp(-t / 200);
      tiltX = Math.sin((t / 1000) * 32) * 0.05 * settle;
    }

    const g = rig.root;
    g.visible = true;
    g.position.copy(_pos).addScaledVector(_n, h);
    _qAlign.setFromUnitVectors(UP, _n);
    _qYaw.setFromAxisAngle(UP, yaw);
    g.quaternion.copy(_qAlign).multiply(_qYaw);
    g.scale.setScalar(Math.max(scale, 0.001) * HERO_SCALE);
    rig.inner.rotation.set(tiltX, 0, tiltZ);

    // ハロ: 構え〜判定待ちの間ふんわり光り、セーフで消えていく
    const tSec = t / 1000;
    if (s.phase === "stabbing") {
      rig.haloMat.opacity = 0.3;
    } else if (s.phase === "suspense") {
      rig.haloMat.opacity = 0.22 + 0.14 * Math.sin(tSec * 6.5);
    } else {
      rig.haloMat.opacity = Math.max(0, 0.25 - tSec * 0.35);
    }

    // きらめき: 刃に沿って星が走る
    if (sparkleT >= 0) {
      const q = sparkleT;
      rig.sparkle.position.set(0.09, 0.15 + 1.15 * q, 0.08);
      const tw = 0.3 * Math.sin(Math.PI * q) * (0.75 + 0.25 * Math.sin(q * 26));
      rig.sparkle.scale.setScalar(Math.max(tw, 0.001));
      rig.sparkleMat.opacity = Math.sin(Math.PI * q);
      rig.sparkleMat.rotation = q * 2.5;
    } else {
      rig.sparkleMat.opacity = 0;
    }
  });

  if (holeId === null) return null;
  return <primitive object={rig.root} />;
}
