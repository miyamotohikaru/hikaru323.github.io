"use client";

// 遠景の小さな地球。NASA Blue Marble(パブリックドメイン)の実写テクスチャで
// リアルに。ゆっくり自転する。

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/textures/earth.jpg");

  // テクスチャ設定は参照が変わったときだけ
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
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
        {/* シーンのライトは月向けで地球には夜側が向くため、
            emissiveMapで自発光させて「明るく輝く地球」に見せる */}
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.85}
          roughness={0.9}
          metalness={0}
        />
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
