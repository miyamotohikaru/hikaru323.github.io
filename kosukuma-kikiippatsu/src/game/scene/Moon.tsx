"use client";

// 月本体。CanvasTextureで薄いクレーター模様を決定的に描き、のっぺり感を防ぐ。
// 原点固定・回転しない(カメラの方が回る)。

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { COLORS, MOON_RADIUS, POLAR_CAP_DEG } from "@/lib/config";
import { hashString, mulberry32, randRange } from "@/lib/prng";

const TEX_SIZE = 1024;

interface Crater {
  x: number;
  y: number;
  r: number;
  depth: number; // 0..1 濃さ
}

/** クレーターの配置をprngで決定的に生成(map/bumpの両方で同じ配置を使う) */
function makeCraters(): Crater[] {
  const rng = mulberry32(hashString("kosukuma-moon-craters"));
  const list: Crater[] = [];
  for (let i = 0; i < 110; i++) {
    list.push({
      x: rng() * TEX_SIZE,
      // 極付近はUVが歪むので中央帯に寄せる
      y: TEX_SIZE * 0.5 * (0.14 + 0.72 * rng()),
      r: randRange(rng, 5, 26),
      depth: randRange(rng, 0.25, 0.7),
    });
  }
  return list;
}

/** カラー用テクスチャ(淡いグレー+うっすらクレーター) */
function makeMap(craters: Crater[]): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE / 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  ctx.fillStyle = COLORS.moon;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 大きな「海」っぽい淡い模様
  const rng = mulberry32(hashString("kosukuma-moon-seas"));
  for (let i = 0; i < 7; i++) {
    const x = rng() * canvas.width;
    const y = canvas.height * (0.2 + 0.6 * rng());
    const r = randRange(rng, 60, 160);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(169,174,203,0.16)");
    g.addColorStop(1, "rgba(169,174,203,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // クレーター(ふち明るめ・中うっすら暗め)
  for (const c of craters) {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    g.addColorStop(0, `rgba(169,174,203,${0.35 * c.depth})`);
    g.addColorStop(0.75, `rgba(169,174,203,${0.18 * c.depth})`);
    g.addColorStop(1, "rgba(169,174,203,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    // ハイライトのふち
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * c.depth})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.92, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** バンプマップ(クレーターの凹み+ふちの盛り上がり) */
function makeBump(craters: Crater[]): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE / 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const c of craters) {
    // 凹み
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    g.addColorStop(0, `rgba(70,70,70,${0.55 * c.depth})`);
    g.addColorStop(0.8, `rgba(96,96,96,${0.3 * c.depth})`);
    g.addColorStop(1, "rgba(128,128,128,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    // ふちのリム(明るい=盛り上がり)
    ctx.strokeStyle = `rgba(178,178,178,${0.4 * c.depth})`;
    ctx.lineWidth = Math.max(1.5, c.r * 0.12);
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

interface RingDeco {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  radius: number;
  tube: number;
}

/** 装飾クレーターのリム(トーラス)を数個、北極キャップを避けて決定的に配置 */
function makeRings(): RingDeco[] {
  const rng = mulberry32(hashString("kosukuma-moon-rings"));
  const capCos = Math.cos(((POLAR_CAP_DEG + 8) * Math.PI) / 180);
  const zAxis = new THREE.Vector3(0, 0, 1);
  const out: RingDeco[] = [];
  for (let i = 0; i < 6; i++) {
    const y = randRange(rng, -0.95, capCos);
    const th = randRange(rng, 0, Math.PI * 2);
    const r = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    out.push({
      position: n.clone().multiplyScalar(MOON_RADIUS - 0.015),
      // トーラスは既定でXY平面(軸=Z)なので、Z軸を法線に向ける
      quaternion: new THREE.Quaternion().setFromUnitVectors(zAxis, n),
      radius: randRange(rng, 0.26, 0.52),
      tube: randRange(rng, 0.028, 0.05),
    });
  }
  return out;
}

export default function Moon() {
  const { map, bump } = useMemo(() => {
    const craters = makeCraters();
    return { map: makeMap(craters), bump: makeBump(craters) };
  }, []);
  const rings = useMemo(makeRings, []);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLORS.moonCrater,
        roughness: 1,
        metalness: 0,
      }),
    []
  );

  // アンマウント時にGPUリソースを解放
  useEffect(() => {
    return () => {
      map.dispose();
      bump.dispose();
      ringMaterial.dispose();
    };
  }, [map, bump, ringMaterial]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[MOON_RADIUS, 64, 48]} />
        <meshStandardMaterial
          map={map}
          bumpMap={bump}
          bumpScale={0.5}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {rings.map((r, i) => (
        <mesh
          key={i}
          position={r.position}
          quaternion={r.quaternion}
          material={ringMaterial}
        >
          <torusGeometry args={[r.radius, r.tube, 8, 28]} />
        </mesh>
      ))}
    </group>
  );
}
