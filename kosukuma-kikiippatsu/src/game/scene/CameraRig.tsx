"use client";

// フェーズ駆動のカメラ演出。title/idleはOrbitControlsでユーザー操作、
// それ以外は controls を無効化して easing.damp3 でカメラを運ぶ。
// "impact" イベントで減衰振動のカメラシェイク。

import { useEffect, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { damp3 } from "maath/easing";
import { MOON_RADIUS } from "@/lib/config";
import { useGameStore } from "@/game/store";
import { onGameEvent } from "@/game/events";
import { getHoleWorld, kosukumaWorldPos } from "./sharedRefs";

type ControlsImpl = ComponentRef<typeof OrbitControls>;

const DEFAULT_POS = new THREE.Vector3(0, 5.5, 17.5);
// 注視点は月中心より少し上: 月を画面下寄りにして、主役のこすくまくんを見切れさせない
const ORIGIN = new THREE.Vector3(0, 1.6, 0);
// タイトルは下から見上げるヒーローショット: 主役をロゴと重ねず画面中央帯に
const TITLE_TARGET = new THREE.Vector3(0, 4.6, 0);
const TROPHY_POS = new THREE.Vector3(0, 4.5, 14);
const TROPHY_TARGET = new THREE.Vector3(0, 3, 0);

const SHAKE_DUR = 0.4;

// 3/4アングル計算用のスクラッチ
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WORLD_X = new THREE.Vector3(1, 0, 0);
const _side = new THREE.Vector3();
const _tanUp = new THREE.Vector3();

export default function CameraRig() {
  const controlsRef = useRef<ControlsImpl>(null);
  const lookRef = useRef(new THREE.Vector3(0, 0, 0)); // 現在の注視点(補間される)
  const desired = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const wasManual = useRef(false);
  const shakeRef = useRef(0);
  const lastHole = useRef(0); // safe中はselectedHoleが消えるので直前の穴を覚えておく

  // 刺さった瞬間のカメラシェイク
  useEffect(
    () =>
      onGameEvent((type) => {
        if (type === "impact") shakeRef.current = SHAKE_DUR;
      }),
    []
  );

  useFrame((state, delta) => {
    const s = useGameStore.getState();
    const phase = s.phase;
    const cam = state.camera;
    const controls = controlsRef.current;

    // ユーザー操作を許すフェーズ(それ以外はカメラ演出が運転する)
    const orbit = phase === "boot" || phase === "title" || phase === "idle";
    if (controls) {
      controls.enabled = orbit;
      controls.autoRotate = phase === "boot" || phase === "title";
      // タイトル⇄ゲームで注視点をなめらかに移す(panは無効なので安全)
      if (orbit) {
        const tgt = phase === "idle" ? ORIGIN : TITLE_TARGET;
        if (controls.target.distanceToSquared(tgt) > 1e-4) {
          damp3(controls.target, tgt, 0.6, delta);
        }
      }
    }

    const manual = !orbit;
    if (manual && !wasManual.current) {
      // OrbitControlsから注視点を引き継いでカクつきを防ぐ
      lookRef.current.copy(controls ? controls.target : ORIGIN);
    }
    if (!manual && wasManual.current && controls) {
      // 演出から操作に戻るときは注視点を基準点へリセット
      controls.target.copy(ORIGIN);
    }
    wasManual.current = manual;

    if (manual) {
      let smooth = 0.45;
      let lookSmooth = 0.25;

      switch (phase) {
        case "confirming":
        case "stabbing":
        case "suspense":
        case "safe": {
          // 穴を斜め横(3/4アングル)から見る。真上からだと法線上を
          // 上がってくる剣がカメラを突き抜けて絵にならない。
          if (s.selectedHole !== null) lastHole.current = s.selectedHole;
          const h = getHoleWorld(s.selectedHole ?? lastHole.current);
          _side.crossVectors(h.normal, WORLD_UP);
          if (_side.lengthSq() < 0.04) _side.crossVectors(h.normal, WORLD_X);
          _side.normalize();
          _tanUp.crossVectors(_side, h.normal).normalize(); // 接平面上の「上」
          desired.current
            .copy(h.pos)
            .addScaledVector(h.normal, 3.1)
            .addScaledVector(_side, 3.0)
            .addScaledVector(_tanUp, 1.1);
          if (phase === "safe") {
            // セーフは少し引いて、残った剣を見せる
            desired.current
              .addScaledVector(h.normal, 0.9)
              .addScaledVector(_side, 0.8);
            smooth = 0.5;
          } else if (phase !== "confirming") {
            smooth = 0.35;
          } else {
            smooth = 0.5;
          }
          // 穴と、構えた剣の両方が入る注視点
          desiredLook.current.copy(h.pos).addScaledVector(h.normal, 1.1);
          break;
        }
        case "launch": {
          // こすくまくんを追い、時間とともに引きながら見上げる
          const t = Math.max(0, (Date.now() - s.phaseAt) / 1000);
          const pull = 1 + Math.min(3, t * 0.45);
          desired.current.set(
            kosukumaWorldPos.x + 5 * pull,
            kosukumaWorldPos.y - 2.5,
            kosukumaWorldPos.z + 9 * pull
          );
          desiredLook.current.copy(kosukumaWorldPos);
          smooth = 0.45;
          lookSmooth = 0.22;
          break;
        }
        case "name-entry":
        case "trophy":
          // 授与式は定位置で静止
          desired.current.copy(TROPHY_POS);
          desiredLook.current.copy(TROPHY_TARGET);
          smooth = 0.8;
          lookSmooth = 0.5;
          break;
        case "new-round":
        default:
          // デフォルト軌道に戻って降臨を見守る
          desired.current.copy(DEFAULT_POS);
          desiredLook.current.copy(ORIGIN);
          smooth = 0.7;
          lookSmooth = 0.4;
          break;
      }

      damp3(cam.position, desired.current, smooth, delta);
      damp3(lookRef.current, desiredLook.current, lookSmooth, delta);
      // 補間経路が月を貫通しないようにクランプ
      const minR = MOON_RADIUS + 1.2;
      if (cam.position.lengthSq() < minR * minR) cam.position.setLength(minR);
      cam.lookAt(lookRef.current);
    }

    // カメラシェイク(減衰振動)。位置に足すだけなので操作中でも安全
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - delta);
      const k = shakeRef.current / SHAKE_DUR;
      const amp = 0.16 * k * k;
      const now = state.clock.elapsedTime;
      cam.position.x += Math.sin(now * 63) * amp;
      cam.position.y += Math.cos(now * 51) * amp * 0.7;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 4.6, 0]}
      enablePan={false}
      minDistance={8}
      maxDistance={24}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      autoRotateSpeed={0.5}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
    />
  );
}
