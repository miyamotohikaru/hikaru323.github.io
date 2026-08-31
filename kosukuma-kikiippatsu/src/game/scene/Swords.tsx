"use client";

// 月に刺さっている全員の剣(最大1000本)。
// 剣は「1色成型のプラスチック」なので刃も柄もひとつのジオメトリに結合でき、
// 剣まるごとを InstancedMesh 1本で描ける。ただし metalness/opacity は
// インスタンスごとに変えられないので、スキンごとにメッシュを分ける
// (実際に刺さっているスキンぶんだけ出すので、ふだんは1〜2本)。
// 色はインスタンスカラー、チャームは鍔の下の小さなビーズ1個に簡略化する。
// 向きは法線+prng(holeId)による決定的な傾き(全プレイヤーで同じ見た目)。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CHARMS, HOLE_COUNT, SWORD_COLORS, SWORD_SKINS } from "@/lib/config";
import { getBit } from "@/lib/bitmask";
import { getHolePoints } from "@/lib/holes";
import { charmOf, skinOf } from "@/lib/style";
import { useGameStore } from "@/game/store";
import { makeCircleTexture } from "@/game/scene/effects/textures";
import {
  makeCharmBeadGeometry,
  makeSwordMaterial,
  makeToySwordGeometry,
  orientSword,
  tickSwordMaterial,
} from "@/game/scene/sword/buildSword";

const tmpObj = new THREE.Object3D();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpColor = new THREE.Color();

/** SWORD_COLORS / CHARMS を THREE.Color に変換したキャッシュ */
const SWORD_TINTS = SWORD_COLORS.map((c) => new THREE.Color(c.hex));
const CHARM_TINTS = CHARMS.map((c) => new THREE.Color(c.hex));

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
  const mask = useGameStore((s) => s.mask);
  const stabColors = useGameStore((s) => s.stabColors);
  const stabStyles = useGameStore((s) => s.stabStyles);
  const myStabs = useGameStore((s) => s.myStabs);
  const swordColor = useGameStore((s) => s.swordColor);
  const remoteStabs = useGameStore((s) => s.remoteStabs);

  const points = useMemo(() => getHolePoints(), []);
  const geometry = useMemo(() => makeToySwordGeometry("field"), []);
  const beadGeometry = useMemo(() => makeCharmBeadGeometry(), []);

  // スキンごとの InstancedMesh。ref はスキンindexで引けるようにしておく
  const meshes = useRef(new Map<number, THREE.InstancedMesh>());
  const beadRef = useRef<THREE.InstancedMesh>(null);

  // マテリアルは使い回す(スキンが増えても既存を作り直さない)
  const materials = useMemo(() => new Map<number, THREE.MeshPhysicalMaterial>(), []);
  const materialFor = (skin: number): THREE.MeshPhysicalMaterial => {
    let m = materials.get(skin);
    if (!m) {
      // tinted なスキンは白地にして、色はインスタンスカラーで塗る
      const s = SWORD_SKINS[skin];
      m = makeSwordMaterial(skin, s.tinted ? "#ffffff" : s.hex);
      materials.set(skin, m);
    }
    return m;
  };
  // チャームのビーズもプラスチックの質感を借りる(色はインスタンスカラー)
  const beadMaterial = useMemo(() => makeSwordMaterial(0, "#ffffff"), []);

  useEffect(() => {
    const geo = geometry;
    const bead = beadGeometry;
    const mats = materials;
    const beadMat = beadMaterial;
    return () => {
      geo.dispose();
      bead.dispose();
      beadMat.dispose();
      // キャッシュは空にしない(空にすると、再マウント時に描画中のメッシュと
      // マテリアルの参照がずれて、にじいろの更新先を見失う)
      mats.forEach((m) => m.dispose());
    };
  }, [geometry, beadGeometry, materials, beadMaterial]);

  // いま「降ってきて刺さる」演出の最中の穴。ここでは描かない(二重に見せない)
  const hidden = useMemo(
    () => new Set(remoteStabs.map((r) => r.holeId)),
    [remoteStabs]
  );

  // この代に実在するスキンだけメッシュを出す(ふだんは プラスチック1本で済む)
  const presentSkins = useMemo(() => {
    let bits = 0;
    for (let id = 0; id < HOLE_COUNT; id++) {
      if (getBit(mask, id)) bits |= 1 << skinOf(stabStyles[id]);
    }
    const out: number[] = [];
    for (let s = 0; s < SWORD_SKINS.length; s++) {
      if (bits & (1 << s)) out.push(s);
    }
    return out;
  }, [mask, stabStyles]);

  // mask/色/スキン/演出中の穴 が変わったときだけ行列と色を再構築
  useEffect(() => {
    const counts = new Map<number, number>();
    const bead = beadRef.current;
    let beadN = 0;

    for (let id = 0; id < HOLE_COUNT; id++) {
      if (!getBit(mask, id)) continue;
      if (hidden.has(id)) continue;
      const style = stabStyles[id];
      const skin = skinOf(style);
      const mesh = meshes.current.get(skin);
      if (!mesh) continue;

      const p = points[id];
      tmpNormal.set(p.normal[0], p.normal[1], p.normal[2]);
      const size = orientSword(tmpNormal, id, tmpQuat);
      tmpObj.position.set(p.position[0], p.position[1], p.position[2]);
      tmpObj.quaternion.copy(tmpQuat);
      tmpObj.scale.setScalar(size);
      tmpObj.updateMatrix();

      const n = counts.get(skin) ?? 0;
      mesh.setMatrixAt(n, tmpObj.matrix);
      // 色: 0=デフォルト / 1..N=選ばれた色。固定色のスキンでは塗らない
      if (SWORD_SKINS[skin].tinted) {
        const c = stabColors[id];
        tmpColor.copy(SWORD_TINTS[c > 0 && c <= SWORD_TINTS.length ? c - 1 : 0]);
        mesh.setColorAt(n, tmpColor);
      }
      counts.set(skin, n + 1);

      // チャームは鍔の下のビーズ1個。剣とおなじ行列をそのまま使える
      const charm = charmOf(style);
      if (charm > 0 && bead) {
        bead.setMatrixAt(beadN, tmpObj.matrix);
        bead.setColorAt(beadN, CHARM_TINTS[Math.min(charm, CHARM_TINTS.length) - 1]);
        beadN++;
      }
    }

    meshes.current.forEach((mesh, skin) => {
      mesh.count = counts.get(skin) ?? 0;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
    if (bead) {
      bead.count = beadN;
      bead.instanceMatrix.needsUpdate = true;
      if (bead.instanceColor) bead.instanceColor.needsUpdate = true;
    }
  }, [mask, stabColors, stabStyles, points, hidden, presentSkins]);

  // にじいろスキンだけ、見る角度で回る色相を時間でもゆっくり動かす
  const iridescentSkins = useMemo(
    () => presentSkins.filter((s) => SWORD_SKINS[s].iridescent),
    [presentSkins]
  );
  useFrame((state) => {
    for (const s of iridescentSkins) {
      tickSwordMaterial(materialFor(s), state.clock.elapsedTime);
    }
  });

  const myColorHex = SWORD_COLORS[swordColor]?.hex ?? SWORD_COLORS[0].hex;

  return (
    <group>
      {/* 穴のホバー/タップを遮らないようレイキャスト対象から外す */}
      {presentSkins.map((skin) => (
        <instancedMesh
          key={skin}
          ref={(el) => {
            if (el) {
              el.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
              meshes.current.set(skin, el);
            } else {
              meshes.current.delete(skin);
            }
          }}
          args={[geometry, materialFor(skin), HOLE_COUNT]}
          frustumCulled={false}
          raycast={() => undefined}
        />
      ))}
      {/* チャームのビーズ(スキンをまたいで1本にまとめる) */}
      <instancedMesh
        ref={beadRef}
        args={[beadGeometry, beadMaterial, HOLE_COUNT]}
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
