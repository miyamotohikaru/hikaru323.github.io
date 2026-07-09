"use client";

// 月の北極に腰まで刺さった「こすくまくん」。フェーズ駆動アニメは
// すべて useFrame + ref(setState禁止)。毎フレーム kosukumaWorldPos を更新する。

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  MOON_RADIUS,
  T_LAUNCH,
  T_NEW_ROUND,
  T_SAFE,
  T_STAB,
  T_SUSPENSE,
} from "@/lib/config";
import { useGameStore } from "@/game/store";
import { kosukumaWorldPos } from "./sharedRefs";

/** モデルスケール(高さ2units・足元原点のGLBを1.7倍) */
const SCALE = 1.7;
/** 埋まり深さ(スケール後の高さ3.4のうち約32%=太ももまで。腕は月面の上に出す) */
const BURY = SCALE * 2 * 0.32;

export default function Kosukuma() {
  const { scene } = useGLTF("/models/kosukuma.glb");
  const animRef = useRef<THREE.Group>(null); // フェーズアニメ用(位置/回転/スケール)
  const spinRef = useRef(0); // launch中のスピン蓄積

  // レンダリング側の設定は一度だけ
  useEffect(() => {
    scene.traverse((o) => {
      o.frustumCulled = false; // 発射で画面外へ飛んでもポップしない
    });
  }, [scene]);

  useFrame((state, delta) => {
    const anim = animRef.current;
    if (!anim) return;
    const s = useGameStore.getState();
    const phase = s.phase;
    const t = Math.max(0, (Date.now() - s.phaseAt) / 1000);
    const time = state.clock.elapsedTime;

    let px = 0;
    let py = 0;
    let pz = 0;
    let sx = 1;
    let sy = 1;
    let sz = 1;
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let visible = true;

    /** ゆっくり呼吸(体積を保つsquash&stretch) */
    const breathe = (speed: number, amp: number) => {
      const b = Math.sin(time * speed);
      sy *= 1 + amp * b;
      const k = 1 - amp * 0.6 * b;
      sx *= k;
      sz *= k;
    };

    if (phase !== "launch") spinRef.current = 0;

    switch (phase) {
      case "suspense": {
        // 小刻みプルプル。時間経過で振幅が増える
        const k = Math.min(1, t / (T_SUSPENSE / 1000));
        const a = 0.008 + 0.03 * k;
        px = Math.sin(time * 52) * a;
        pz = Math.cos(time * 47) * a * 0.8;
        rz = Math.sin(time * 61) * (0.02 + 0.05 * k);
        breathe(9, 0.012 + 0.02 * k);
        break;
      }

      case "safe": {
        // 安堵の2段バウンス(高→低)+着地squash
        const u = Math.min(1, t / (T_SAFE / 1000));
        const hop = (a: number, b: number, h: number) =>
          u < a || u > b ? 0 : Math.sin(((u - a) / (b - a)) * Math.PI) * h;
        py = hop(0.06, 0.38, 0.6) + hop(0.46, 0.7, 0.26);
        const air = Math.min(1, py * 2.2);
        const squash = (c: number, w: number, amt: number) => {
          const d = Math.abs(u - c);
          return d > w ? 0 : Math.cos((d / w) * Math.PI * 0.5) * amt;
        };
        const sq =
          squash(0.02, 0.04, 0.18) + // ほっとして一度沈む
          squash(0.42, 0.05, 0.26) + // 1回目の着地
          squash(0.73, 0.05, 0.16); // 2回目の着地
        sy = 1 + 0.22 * air - sq;
        const w = 1 - 0.12 * air + sq * 0.8;
        sx = w;
        sz = w;
        ry = Math.sin(u * Math.PI) * 0.5; // うれしさのひねり
        break;
      }

      case "launch": {
        const T = T_LAUNCH / 1000;
        if (t < 0.3) {
          // タメ: 0.3秒の沈み込み
          const p = t / 0.3;
          py = -0.4 * Math.sin(p * Math.PI * 0.5);
          sy = 1 - 0.25 * p;
          sx = 1 + 0.16 * p;
          sz = sx;
        } else {
          // 加速上昇+緩スピン+stretch
          const tt = t - 0.3;
          py = 1.55 * tt * tt;
          spinRef.current += delta * (0.6 + tt * 0.5);
          ry = spinRef.current;
          const st = Math.min(0.45, tt * 0.19);
          sy = 1 + st;
          sx = 1 / Math.sqrt(1 + st);
          sz = sx;
          // 80%以降は縮んで星になって消える(光の演出はエフェクト側)
          const fade = (t - T * 0.8) / (T * 0.2);
          if (fade > 0) {
            const shrink = Math.max(0, 1 - fade);
            sx *= shrink;
            sy *= shrink;
            sz *= shrink;
            if (fade >= 1) visible = false;
          }
        }
        break;
      }

      case "name-entry":
      case "trophy":
        visible = false;
        break;

      case "new-round": {
        // 上空から降下 → 着地squash → ぷるんと復帰
        const D = Math.min(2.4, (T_NEW_ROUND / 1000) * 0.7);
        if (t < D) {
          const p = t / D;
          const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
          py = 26 * (1 - e);
          ry = (1 - e) * Math.PI * 4; // くるくる回りながら
          sy = 1.05;
          sx = 0.97;
          sz = 0.97;
        } else {
          const p = Math.min(1, (t - D) / 0.6);
          const k = Math.exp(-3.5 * p) * Math.cos(p * Math.PI * 2.4);
          sy = 1 - 0.3 * k;
          const w = 1 / Math.sqrt(Math.max(0.5, sy));
          sx = w;
          sz = w;
          breathe(1.7, 0.015);
        }
        break;
      }

      // boot / title / idle / confirming / stabbing = 通常(呼吸+ゆらぎ)
      default: {
        breathe(1.7, 0.02);
        rz = Math.sin(time * 0.8) * 0.02;
        ry = Math.sin(time * 0.33) * 0.05;
        if (phase === "stabbing") {
          // 刺される予感でちょっと身構える
          const k = Math.min(1, t / (T_STAB / 1000));
          sy *= 1 - 0.04 * k;
          sx *= 1 + 0.02 * k;
          sz *= 1 + 0.02 * k;
        }
        break;
      }
    }

    anim.visible = visible;
    anim.position.set(px, py, pz);
    anim.rotation.set(rx, ry, rz);
    anim.scale.set(sx, sy, sz);

    // 非表示中も基準位置(北極)を提供し続ける
    anim.getWorldPosition(kosukumaWorldPos);
  });

  return (
    // 北極に腰まで埋め、8°ほど傾ける(x/zの複合でカメラ側へ)
    <group
      position={[0, MOON_RADIUS - BURY, 0]}
      rotation={[0.1, 0, 0.09]}
    >
      <group ref={animRef}>
        <primitive object={scene} scale={SCALE} />
      </group>
    </group>
  );
}
