"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

// 版の色をCSSのトークンとそのまま一致させる（線形化させない）
THREE.ColorManagement.enabled = false;
import gsap from "gsap";
import { cases } from "@/data/cases";
import {
  plateFragmentShader,
  plateVertexShader,
  shadowFragmentShader,
  shadowVertexShader,
} from "./shaders";
import { plateParamsFor } from "@/lib/plateParams";

/* ------------------------------------------------------------------ *
 * 配置のパラメータ
 * ------------------------------------------------------------------ */
const CARD_W = 0.98;
const CARD_H = CARD_W * 1.38; // 図鑑シリーズ共通の判型比
const SPACING = 0.36; // リボン方向の間隔
const REPEATS = 2; // 収録数が少ないあいだは同じ列を繰り返して帯を長く保つ
const ROT_Y = -Math.PI / 6; // 版面の振り
const DEPTH_K = 1.5; // 奥行きへの倒し込み
const LERP = 0.1; // ポインタ／ドラッグ追従
const HOVER_SHIFT = 0.26;
const SHADOW_PAD = 1.34;

const PAPER = new THREE.Color("#fffefb");
const INK = new THREE.Color("#121110");
const ACCENT = new THREE.Color("#c7452a");

type Tile = {
  index: number; // 帯の中での通し位置
  caseIndex: number; // 収録CASEの番号
  root: THREE.Group; // 位置と回転
  shifter: THREE.Group; // ホバー時のずれ
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  hit: THREE.Mesh;
  progress: { v: number };
  fade: { v: number };
  hovered: boolean;
};

export type RibbonHandle = {
  focusIndex: number;
};

export default function Ribbon({
  onFocusChange,
  onHoverChange,
}: {
  onFocusChange?: (index: number) => void;
  onHoverChange?: (index: number | null) => void;
}) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);
  const [cursor, setCursor] = useState<"grab" | "grabbing" | "pointer">("grab");

  const onFocusRef = useRef(onFocusChange);
  const onHoverRef = useRef(onHoverChange);
  onFocusRef.current = onFocusChange;
  onHoverRef.current = onHoverChange;

  const navigate = useCallback(
    (slug: string) => {
      router.push(`/case/${slug}`);
    },
    [router],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // --- WebGL の可否 ---
    const probe = document.createElement("canvas");
    const ok = !!(
      probe.getContext("webgl2") || probe.getContext("webgl")
    );
    if (!ok) {
      setSupported(false);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* -------------------------------------------------- *
     * レンダラ
     * -------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";

    const scene = new THREE.Scene();

    // 参照サイトと同じ超望遠（FOV5°）。ほぼ平行投影に近い圧縮がかかる。
    const camera = new THREE.PerspectiveCamera(
      5,
      host.clientWidth / host.clientHeight,
      0.1,
      1000,
    );
    const setCameraForViewport = () => {
      const aspect = host.clientWidth / host.clientHeight;
      camera.aspect = aspect;
      camera.position.set(0, 100 / 7.5, aspect < 1 ? 46 : 30);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    setCameraForViewport();

    /* -------------------------------------------------- *
     * タイル
     * -------------------------------------------------- */
    const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 1, 1);
    const shadowGeometry = new THREE.PlaneGeometry(
      CARD_W * SHADOW_PAD,
      CARD_H * SHADOW_PAD,
      1,
      1,
    );
    const hitGeometry = new THREE.PlaneGeometry(CARD_W * 1.02, CARD_H * 1.02, 1, 1);
    const tiles: Tile[] = [];
    const ribbon = Array.from({ length: cases.length * REPEATS }, (_, i) => i);
    const HALF = (ribbon.length * SPACING) / 2;

    ribbon.forEach((i) => {
      const ci = i % cases.length;
      const c = cases[ci];
      const pp = plateParamsFor(c);

      const material = new THREE.ShaderMaterial({
        vertexShader: plateVertexShader,
        fragmentShader: plateFragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: pp.seed },
          uProgress: { value: 0 },
          uPlate: { value: pp.plate },
          uFade: { value: 1 },
          uAppear: { value: 0 },
          uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
          uPaper: { value: PAPER },
          uInk: { value: INK },
          uAccent: { value: ACCENT },
          uGrain: { value: 0.05 },
          uFocus: { value: 0 },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);

      // 落ち影。板が空間に浮いていることを地の側で示す。
      const shadow = new THREE.Mesh(
        shadowGeometry,
        new THREE.ShaderMaterial({
          vertexShader: shadowVertexShader,
          fragmentShader: shadowFragmentShader,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uSize: { value: new THREE.Vector2(CARD_W * SHADOW_PAD, CARD_H * SHADOW_PAD) },
            uPlate: { value: new THREE.Vector2(CARD_W, CARD_H) },
            uFade: { value: 1 },
            uAppear: { value: 0 },
          },
        }),
      );
      shadow.position.z = -0.004;
      shadow.renderOrder = -1;

      const shifter = new THREE.Group();
      shifter.add(shadow);
      shifter.add(mesh);

      const hit = new THREE.Mesh(
        hitGeometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hit.userData.index = i;

      const root = new THREE.Group();
      root.add(shifter);
      root.add(hit);
      scene.add(root);

      tiles.push({
        index: i,
        caseIndex: ci,
        root,
        shifter,
        mesh,
        shadow,
        hit,
        progress: { v: 0 },
        fade: { v: 1 },
        hovered: false,
      });
    });

    /* -------------------------------------------------- *
     * 入力
     * -------------------------------------------------- */
    const state = {
      wheel: 0, // ホイールの累積
      dragX: 0, // ドラッグの累積
      dragY: 0,
      onX: 0,
      onY: 0,
      dragging: false,
      dragMoved: 0,
      pointer: new THREE.Vector2(-10, -10),
      smoothed: 0,
      entry: { x: -18 },
      locked: false, // 遷移中
    };

    const speed = canHover ? 100 : 55;

    const onWheel = (e: WheelEvent) => {
      if (state.locked) return;
      e.preventDefault();
      state.wheel += (e.deltaY + e.deltaX) * 0.55;
    };

    const pointerFromEvent = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      state.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      state.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (state.locked) return;
      state.dragging = true;
      state.dragMoved = 0;
      state.onX = state.dragX - e.clientX;
      state.onY = state.dragY - e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
      setCursor("grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerFromEvent(e);
      if (!state.dragging || state.locked) return;
      const nx = state.onX + e.clientX;
      const ny = state.onY + e.clientY;
      state.dragMoved += Math.abs(nx - state.dragX) + Math.abs(ny - state.dragY);
      state.dragX = nx;
      state.dragY = ny;
    };

    const endDrag = (e: PointerEvent) => {
      if (!state.dragging) return;
      state.dragging = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
      setCursor(hoveredIndex !== null ? "pointer" : "grab");
    };

    const onPointerLeave = () => {
      state.pointer.set(-10, -10);
    };

    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    /* -------------------------------------------------- *
     * ヒットテスト
     * -------------------------------------------------- */
    const raycaster = new THREE.Raycaster();
    let hoveredIndex: number | null = null;
    let focusIndex = -1;

    const setHovered = (idx: number | null) => {
      if (hoveredIndex === idx) return;
      hoveredIndex = idx;
      onHoverRef.current?.(idx === null ? null : tiles[idx].caseIndex);
      setCursor(idx !== null ? "pointer" : state.dragging ? "grabbing" : "grab");
    };

    const onClick = () => {
      if (state.locked) return;
      if (state.dragMoved > 6) return; // ドラッグは選択にしない
      if (hoveredIndex === null) return;
      const tile = tiles[hoveredIndex];
      const c = cases[tile.caseIndex];
      state.locked = true;
      // 選ばれた版だけを正面へ起こしてから遷移する
      gsap.to(tile.root.rotation, {
        y: 0,
        ease: "expo.inOut",
        duration: 1.1,
      });
      gsap.to(tile.progress, { v: 1, ease: "expo.out", duration: 0.9 });
      tiles.forEach((t) => {
        if (t.index === hoveredIndex) return;
        gsap.to(t.fade, { v: 0, ease: "expo.inOut", duration: 0.8 });
      });
      gsap.to(state.entry, {
        x: 0,
        duration: 1.1,
        ease: "expo.inOut",
        onComplete: () => navigate(c.slug),
      });
      gsap.to(tile.shifter.position, {
        x: 0,
        y: 0,
        ease: "expo.inOut",
        duration: 1.1,
      });
    };
    renderer.domElement.addEventListener("click", onClick);

    /* -------------------------------------------------- *
     * 出現
     * -------------------------------------------------- */
    tiles.forEach((t, i) => {
      gsap.to(t.mesh.material.uniforms.uAppear, {
        value: 1,
        duration: reduced ? 0.01 : 0.9,
        delay: reduced ? 0 : 0.15 + i * 0.045,
        ease: "power2.out",
      });
    });
    gsap.to(state.entry, {
      x: 0,
      duration: reduced ? 0.01 : 2.2,
      ease: "expo.out",
    });

    /* -------------------------------------------------- *
     * ループ
     * -------------------------------------------------- */
    const proj = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      const aspect = host.clientWidth / host.clientHeight;

      // ホイールとドラッグを一本の進行量にまとめて追従させる
      const target = state.dragX - state.dragY;
      state.smoothed += (target - state.smoothed) * LERP;
      const j = state.wheel / 26 - state.smoothed / speed + state.entry.x;

      // ヒットテスト
      if (!state.locked && state.pointer.x > -5) {
        raycaster.setFromCamera(state.pointer, camera);
        const hits = raycaster.intersectObjects(
          tiles.map((tt) => tt.hit),
          false,
        );
        const first = hits.find((h) => {
          const tile = tiles[(h.object as THREE.Mesh).userData.index as number];
          return tile.fade.v > 0.5;
        });
        setHovered(
          first ? ((first.object as THREE.Mesh).userData.index as number) : null,
        );
      }

      let bestIdx = 0;
      let bestDist = Infinity;

      tiles.forEach((tile) => {
        const f = tile.index - j;
        const x = gsap.utils.wrap(-HALF, HALF, f * SPACING);
        const z = -x * (aspect < 1 ? 5.4 : aspect * DEPTH_K);

        tile.root.position.set(x, 0, z);
        tile.root.rotation.y = state.locked && tile.index === hoveredIndex
          ? tile.root.rotation.y
          : ROT_Y;

        // 端で紙へ溶かし、巻き戻りを見せない
        const edge = 1 - Math.min(1, Math.abs(x) / HALF);
        const wrapFade = THREE.MathUtils.smoothstep(edge, 0.0, 0.16);

        const isHover = hoveredIndex === tile.index;
        if (isHover !== tile.hovered) {
          tile.hovered = isHover;
          gsap.to(tile.shifter.position, {
            x: isHover ? HOVER_SHIFT : 0,
            y: isHover ? -0.05 : 0,
            ease: "expo.out",
            duration: 0.55,
          });
          gsap.to(tile.progress, {
            v: isHover ? 1 : 0,
            ease: isHover ? "expo.out" : "power2.inOut",
            duration: isHover ? 1.0 : 0.6,
          });
        }

        const u = tile.mesh.material.uniforms;
        u.uTime.value = t;
        u.uProgress.value = tile.progress.v;
        u.uFade.value = wrapFade * tile.fade.v;
        const su = tile.shadow.material.uniforms;
        su.uFade.value = wrapFade * tile.fade.v;
        su.uAppear.value = u.uAppear.value;
        tile.hit.visible = wrapFade > 0.6 && tile.fade.v > 0.5;

        // 名乗る版は「画面に全部入っていて、いちばん手前にある版」。
        // 手前にあれば他の版に隠されないので、名乗りと絵が食い違わない。
        proj.set(x, 0, z).project(camera);
        const inside =
          Math.abs(proj.x) < 0.74 && Math.abs(proj.y) < 0.66 && wrapFade > 0.9;
        const d = inside ? -z : 1000 + Math.abs(proj.x);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = tile.index;
        }
      });

      if (process.env.NODE_ENV === "development") {
        (window as unknown as Record<string, unknown>).__flip = {
          j,
          entry: state.entry.x,
          aspect,
          cam: camera.position.toArray(),
          tiles: tiles.slice(0, 4).map((tt) => ({
            p: tt.root.position.toArray().map((n) => +n.toFixed(2)),
            fade: +tt.mesh.material.uniforms.uFade.value.toFixed(2),
            appear: +tt.mesh.material.uniforms.uAppear.value.toFixed(2),
            prog: +tt.mesh.material.uniforms.uProgress.value.toFixed(2),
          })),
        };
      }

      if (bestIdx !== focusIndex) {
        focusIndex = bestIdx;
        onFocusRef.current?.(tiles[focusIndex].caseIndex);
      }
      tiles.forEach((tt) => {
        const want = tt.index === (hoveredIndex ?? focusIndex) ? 1 : 0;
        const u2 = tt.mesh.material.uniforms.uFocus;
        u2.value += (want - u2.value) * 0.12;
      });

      renderer.render(scene, camera);
    };
    render();

    /* -------------------------------------------------- *
     * リサイズ
     * -------------------------------------------------- */
    const onResize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      setCameraForViewport();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    /* -------------------------------------------------- *
     * 後片付け
     * -------------------------------------------------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      tiles.forEach((tile) => {
        gsap.killTweensOf(tile.shifter.position);
        gsap.killTweensOf(tile.progress);
        gsap.killTweensOf(tile.fade);
        tile.mesh.material.dispose();
        tile.shadow.material.dispose();
        (tile.hit.material as THREE.Material).dispose();
      });
      geometry.dispose();
      shadowGeometry.dispose();
      hitGeometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [navigate]);

  if (!supported) return null;

  return (
    <div
      ref={hostRef}
      className="absolute inset-0"
      style={{ cursor }}
      aria-hidden="true"
    />
  );
}
