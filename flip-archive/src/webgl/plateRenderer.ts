import * as THREE from "three";
import { plateFragmentShader, plateVertexShader } from "./shaders";

/**
 * 索引・詳細ページ用の単票レンダラ。
 *
 * 図版1枚ごとにWebGLコンテキストを作るとブラウザの上限に当たるため、
 * 共有のオフスクリーンレンダラで描いた結果を各 <canvas> へ転写する。
 */

type Shared = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  width: number;
  height: number;
};

let shared: Shared | null = null;
let unsupported = false;

export type PlateParams = {
  seed: number;
  plate: number;
  progress: number;
  aspect: number; // w / h
};

const PAPER = new THREE.Color("#fffefb");
const INK = new THREE.Color("#121110");
const ACCENT = new THREE.Color("#c7452a");

function ensure(width: number, height: number): Shared | null {
  if (unsupported) return null;
  if (!shared) {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
      unsupported = true;
      return null;
    }
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 1, 1),
      new THREE.ShaderMaterial({
        vertexShader: plateVertexShader,
        fragmentShader: plateFragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: 0 },
          uProgress: { value: 0 },
          uPlate: { value: 0 },
          uFade: { value: 1 },
          uAppear: { value: 1 },
          uSize: { value: new THREE.Vector2(1, 1.38) },
          uPaper: { value: PAPER },
          uInk: { value: INK },
          uAccent: { value: ACCENT },
          uGrain: { value: 0.05 },
          uFocus: { value: 0 },
        },
      }),
    );
    scene.add(mesh);

    shared = { renderer, scene, camera, mesh, width: 0, height: 0 };
  }

  if (shared.width !== width || shared.height !== height) {
    shared.renderer.setSize(width, height, false);
    shared.width = width;
    shared.height = height;
  }
  return shared;
}

export function isPlateSupported() {
  return !unsupported;
}

/** 指定した2Dキャンバスへ図版を1フレーム描き込む。 */
export function drawPlate(
  target: HTMLCanvasElement,
  params: PlateParams,
): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(target.clientWidth * dpr));
  const h = Math.max(2, Math.round(target.clientHeight * dpr));
  if (target.width !== w || target.height !== h) {
    target.width = w;
    target.height = h;
  }

  const s = ensure(w, h);
  if (!s) return false;

  const u = s.mesh.material.uniforms;
  u.uSeed.value = params.seed;
  u.uPlate.value = params.plate;
  u.uProgress.value = params.progress;
  u.uSize.value.set(params.aspect, 1);

  s.renderer.render(s.scene, s.camera);

  const ctx = target.getContext("2d");
  if (!ctx) return false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(s.renderer.domElement, 0, 0, w, h);
  return true;
}
