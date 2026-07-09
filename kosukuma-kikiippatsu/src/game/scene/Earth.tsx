"use client";

// 遠景の小さな地球。CanvasTextureで青い海+緑の大陸+白い雲を
// prngで決定的に描き、ゆっくり自転する。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { hashString, mulberry32, pick, randInt, randRange } from "@/lib/prng";

const TEX_W = 512;
const TEX_H = 256;

const LAND_COLORS = ["#57a05a", "#6fb46a", "#4e9455"] as const;

/** 経度方向の継ぎ目が出ないよう、x±W にも同じ図形を描く */
function wrapCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  for (const ox of [-TEX_W, 0, TEX_W]) {
    ctx.beginPath();
    ctx.arc(x + ox, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function wrapEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number
) {
  for (const ox of [-TEX_W, 0, TEX_W]) {
    ctx.beginPath();
    ctx.ellipse(x + ox, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makeEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  const rng = mulberry32(hashString("kosukuma-earth"));

  // 海
  ctx.fillStyle = "#2f6fc4";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // 大陸: 中心点のまわりに丸を重ねてぽってりした形に
  for (let c = 0; c < 7; c++) {
    const cx = rng() * TEX_W;
    const cy = TEX_H * (0.18 + 0.64 * rng());
    const blobs = 10 + randInt(rng, 14);
    ctx.fillStyle = pick(rng, LAND_COLORS);
    for (let b = 0; b < blobs; b++) {
      const x = cx + randRange(rng, -34, 34);
      const y = cy + randRange(rng, -20, 20);
      wrapCircle(ctx, x, y, randRange(rng, 7, 24));
    }
  }

  // 極の氷冠
  const capTop = ctx.createLinearGradient(0, 0, 0, 26);
  capTop.addColorStop(0, "rgba(255,255,255,0.95)");
  capTop.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = capTop;
  ctx.fillRect(0, 0, TEX_W, 26);
  const capBottom = ctx.createLinearGradient(0, TEX_H - 26, 0, TEX_H);
  capBottom.addColorStop(0, "rgba(255,255,255,0)");
  capBottom.addColorStop(1, "rgba(255,255,255,0.95)");
  ctx.fillStyle = capBottom;
  ctx.fillRect(0, TEX_H - 26, TEX_W, 26);

  // 雲: 半透明の白い横長エリプス
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  for (let i = 0; i < 26; i++) {
    const x = rng() * TEX_W;
    const y = TEX_H * (0.1 + 0.8 * rng());
    wrapEllipse(ctx, x, y, randRange(rng, 14, 42), randRange(rng, 4, 10));
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(makeEarthTexture, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  // ゆっくり自転
  useFrame((_, delta) => {
    const earth = earthRef.current;
    if (earth) earth.rotation.y += delta * 0.02;
  });

  return (
    // 遠景なのでレイキャスト不要
    <group position={[-18, 8, -28]} rotation={[0, 0, 0.2]}>
      <mesh ref={earthRef} raycast={() => undefined}>
        <sphereGeometry args={[2, 48, 32]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>
      {/* うっすら大気のハロ */}
      <mesh scale={1.07} raycast={() => undefined}>
        <sphereGeometry args={[2, 32, 24]} />
        <meshBasicMaterial
          color="#6fb0ff"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
