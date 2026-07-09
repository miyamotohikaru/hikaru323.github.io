"use client";

// トロフィーホール(宇宙の殿堂)。/api/trophies から歴代勝者を取得し、
// 自前の <Canvas> に手続き生成トロフィーを2列で並べる。
// タップで選択→カメラが寄り、詳細カード(DOM)を表示する。

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { TrophiesResponse, TrophyRecord } from "@/lib/types";
import { mulberry32 } from "@/lib/prng";
import { getTrophyParams } from "@/lib/trophy";
import TrophyMesh from "@/game/trophy/TrophyMesh";
import "./trophies.css";

const PER_PAGE = 8;

// ── 配置: 4体×2列。後列は高い台座で顔が見えるように ──
function standAt(i: number): { x: number; z: number; top: number } {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: (col - 1.5) * 1.55,
    z: row === 0 ? 0.95 : -1.4,
    top: row === 0 ? 0.55 : 0.95,
  };
}

// ── 見た目まわりの小物 ────────────────────────────────

/** 金属を照らす環境光。外部アセットなしで RoomEnvironment を焼き込む */
function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const rt = pmrem.fromScene(room, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      rt.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** 簡易星空(Points)。決定的な配置 */
function StarDome() {
  const geom = useMemo(() => {
    const rng = mulberry32(20260704);
    const count = 420;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const y = rng() * 2 - 1;
      const r = 26 + rng() * 14;
      const xz = Math.sqrt(Math.max(0, 1 - y * y));
      pos[i * 3] = Math.cos(a) * xz * r;
      pos[i * 3 + 1] = Math.abs(y) * r * 0.75 - 3;
      pos[i * 3 + 2] = Math.sin(a) * xz * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <points geometry={geom}>
      <pointsMaterial
        size={0.16}
        color="#dfe4ff"
        transparent
        opacity={0.85}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}

/** 反射風の暗いグラデ円の床 */
function Floor() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(40,48,116,0.95)");
      g.addColorStop(0.55, "rgba(14,19,58,0.75)");
      g.addColorStop(1, "rgba(5,7,26,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.2]}>
      <circleGeometry args={[9, 48]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/** 台座下のラベル「第N代 {name}」(CanvasTextureプレート) */
function makeLabelTexture(text: string): {
  texture: THREE.CanvasTexture;
  redraw: () => void;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let fam = "sans-serif";
    try {
      fam = getComputedStyle(document.body).fontFamily || fam;
    } catch {
      /* noop */
    }
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = "rgba(12,17,55,0.88)";
    ctx.beginPath();
    ctx.roundRect(4, 4, 504, 120, 30);
    ctx.fill();
    ctx.strokeStyle = "#f2c14e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 26);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 56;
    ctx.font = `800 ${size}px ${fam}`;
    while (size > 18 && ctx.measureText(text).width > 450) {
      size -= 2;
      ctx.font = `800 ${size}px ${fam}`;
    }
    ctx.fillStyle = "#fffef2";
    ctx.fillText(text, 256, 66);
    texture.needsUpdate = true;
  };
  draw();
  return { texture, redraw: draw };
}

interface StandProps {
  item: TrophyRecord;
  index: number;
  selected: boolean;
  onPick: () => void;
}

/** 台座+トロフィー+ラベル1式 */
function TrophyStand({ item, index, selected, onPick }: StandProps) {
  const { x, z, top } = standAt(index);
  const spinRef = useRef<THREE.Group>(null);
  const speed = useRef(0.18);
  const label = useMemo(
    () => makeLabelTexture(`第${item.roundNo}代 ${item.name}`),
    [item.roundNo, item.name]
  );

  useEffect(() => {
    let alive = true;
    if (document.fonts) {
      void document.fonts.ready.then(() => {
        if (alive) label.redraw();
      });
    }
    return () => {
      alive = false;
      label.texture.dispose();
      document.body.style.cursor = "auto";
    };
  }, [label]);

  useFrame((_, dt) => {
    // 選ばれている間はうれしそうに速く回る
    const target = selected ? 0.95 : 0.18;
    speed.current += (target - speed.current) * Math.min(1, dt * 4);
    const g = spinRef.current;
    if (g) g.rotation.y += speed.current * dt;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick();
  };

  return (
    <group position={[x, 0, z]}>
      {/* 台座 */}
      <mesh position={[0, top / 2, 0]}>
        <cylinderGeometry args={[0.42, 0.47, top, 36]} />
        <meshStandardMaterial color="#10163f" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, top, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.018, 8, 40]} />
        <meshStandardMaterial
          color="#ffd93d"
          metalness={0.8}
          roughness={0.3}
          emissive="#7a5210"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 選択中の足元グロー */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <circleGeometry args={[0.62, 32]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.28}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* トロフィー(ゆっくり回転) */}
      <group ref={spinRef} position={[0, top, 0]} scale={0.9}>
        <TrophyMesh roundNo={item.roundNo} name={item.name} />
      </group>

      {/* ラベル「第N代 {name}」 */}
      <mesh position={[0, top * 0.45, 0.48]}>
        <planeGeometry args={[0.85, 0.21]} />
        <meshBasicMaterial map={label.texture} transparent />
      </mesh>

      {/* 大きめの透明タップ判定(モバイル向け) */}
      <mesh
        position={[0, (top + 1.15) / 2, 0]}
        onClick={handleClick}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.56, 0.56, top + 1.15, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** 選択に合わせてゆったり寄る/戻るカメラ */
function HallCamera({
  focus,
}: {
  focus: { x: number; y: number; z: number } | null;
}) {
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpTgt = useMemo(() => new THREE.Vector3(), []);
  const curTgt = useRef(new THREE.Vector3(0, 0.75, -0.3));
  useFrame(({ camera, clock }, dt) => {
    const t = clock.getElapsedTime();
    if (focus) {
      tmpPos.set(focus.x * 0.7, focus.y + 0.75, focus.z + 1.9);
      tmpTgt.set(focus.x, focus.y + 0.42, focus.z);
    } else {
      // ゆらゆらと漂う定位置
      tmpPos.set(Math.sin(t * 0.25) * 0.35, 1.75, 5.4);
      tmpTgt.set(0, 0.75, -0.3);
    }
    const k = 1 - Math.exp(-3 * Math.min(dt, 0.1));
    camera.position.lerp(tmpPos, k);
    curTgt.current.lerp(tmpTgt, k);
    camera.lookAt(curTgt.current);
  });
  return null;
}

// ── DOMまわりのヘルパ ─────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** ISO 3166-1 alpha-2 → 国旗絵文字。不明なら空文字 */
function flagEmoji(cc: string | null): string {
  if (!cc || !/^[A-Za-z]{2}$/.test(cc)) return "";
  const up = cc.toUpperCase();
  return String.fromCodePoint(
    0x1f1e6 + up.charCodeAt(0) - 65,
    0x1f1e6 + up.charCodeAt(1) - 65
  );
}

// ── 本体 ────────────────────────────────────────────

export default function TrophyHall() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TrophiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    fetch(`/api/trophies?perPage=${PER_PAGE}&page=${page}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<TrophiesResponse>;
      })
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, retry]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.perPage ?? PER_PAGE;
  const maxPage = Math.max(1, Math.ceil(total / perPage));
  const sel: TrophyRecord | undefined =
    selected !== null ? items[selected] : undefined;
  const focus = useMemo(() => {
    if (selected === null || !sel) return null;
    const s = standAt(selected);
    return { x: s.x, y: s.top, z: s.z };
  }, [selected, sel]);
  const selRare = sel ? getTrophyParams(sel.roundNo, sel.name).rare : false;

  const goPage = (p: number) => {
    if (p < 1 || p > maxPage) return;
    setSelected(null);
    setPage(p);
  };

  return (
    <div className="th-root">
      <div className="th-canvas">
        <Canvas
          dpr={[1, 2]}
          camera={{ fov: 42, position: [0, 1.75, 5.4], near: 0.1, far: 80 }}
          onPointerMissed={() => setSelected(null)}
        >
          <color attach="background" args={["#05071a"]} />
          <fog attach="fog" args={["#05071a", 9, 26]} />
          <StudioEnv />
          <ambientLight intensity={0.25} color="#aab3ff" />
          <directionalLight position={[3, 6, 4]} intensity={1.2} color="#fff6dd" />
          <pointLight position={[0, 3.2, 1]} intensity={8} distance={12} color="#ffd93d" />
          <pointLight position={[-3, 1.5, -3]} intensity={5} distance={10} color="#ffb3c7" />
          <StarDome />
          <Floor />
          {items.map((it, i) => (
            <TrophyStand
              key={it.roundNo}
              item={it}
              index={i}
              selected={selected === i}
              onPick={() => setSelected(i)}
            />
          ))}
          <HallCamera focus={focus} />
        </Canvas>
      </div>

      {/* ── DOMオーバーレイ ── */}
      <header className="th-head">
        <Link href="/" className="th-back">
          ← ゲームへもどる
        </Link>
        <h1 className="th-title">🏆 トロフィーホール</h1>
        <p className="th-sub">
          これまでに <b>{total.toLocaleString("ja-JP")}</b> 人が とばした
        </p>
      </header>

      {loading && <div className="th-loading">よみこみちゅう…</div>}

      {failed && !loading && (
        <div className="th-message">
          <p>つうしんエラーが おきたよ</p>
          <button
            type="button"
            className="th-btn"
            onClick={() => setRetry((n) => n + 1)}
          >
            もういちど
          </button>
        </div>
      )}

      {!loading && !failed && total === 0 && (
        <div className="th-message">
          <p>
            まだ だれも とばしていない。
            <br />
            さいしょの1人に なろう！
          </p>
          <Link href="/" className="th-btn">
            ゲームへ
          </Link>
        </div>
      )}

      {sel && (
        <div className="th-card" role="dialog" aria-label="トロフィーのくわしい情報">
          <button
            type="button"
            className="th-card-close"
            aria-label="とじる"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <div className="th-card-gen">
            第{sel.roundNo}代{selRare && <span className="th-card-rare">✨ レア</span>}
          </div>
          <div className="th-card-name">
            {sel.name}
            {flagEmoji(sel.country) && (
              <span className="th-card-flag">{flagEmoji(sel.country)}</span>
            )}
          </div>
          <dl className="th-card-rows">
            <div>
              <dt>とばした日</dt>
              <dd>{formatDate(sel.wonAt)}</dd>
            </div>
            <div>
              <dt>その代のちょうせん回数</dt>
              <dd>{sel.stabCount.toLocaleString("ja-JP")}回</dd>
            </div>
          </dl>
        </div>
      )}

      {total > 0 && (
        <footer className="th-pager">
          <button
            type="button"
            className="th-btn"
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
          >
            ←まえ
          </button>
          <span className="th-page-no">
            {page} / {maxPage}
          </span>
          <button
            type="button"
            className="th-btn"
            disabled={page >= maxPage}
            onClick={() => goPage(page + 1)}
          >
            つぎ→
          </button>
        </footer>
      )}
    </div>
  );
}
