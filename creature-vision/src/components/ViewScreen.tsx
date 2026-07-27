"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Icon from "./Icon";
import { applyFilter, FOV_DATA } from "./FilterEngine";
import { PanoramaViewer } from "./PanoramaViewer";
import { CATEGORY_COLORS } from "@/styles/theme";
import { SHARE_TEXTS } from "@/data/shareTexts";
import { TRIVIA } from "@/data/trivia";

interface Creature {
  id: string;
  name: string;
  en: string;
  cat: string;
  color: string;
  filterType: string;
  fp: Record<string, unknown>;
  detail: string;
  bio: string;
}

interface Props {
  creatures: Creature[];
  selectedId: string;
  mediaFile: File;
  favs: string[];
  onBack: () => void;
  onToggleFav: (id: string) => void;
  onSelect: (id: string) => void;
}

const MAX_W = 900;

/* ── SVG Icons ── */

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "#FF6B6B" : "none"}
        stroke={filled ? "#FF6B6B" : "#999"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L12 16" stroke="#555" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8L12 3L17 8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#000" />
      <path d="M13.544 10.456L17.88 5.5H16.68L13.008 9.672L10.068 5.5H6.5L11.04 12.78L6.5 18H7.7L11.58 13.564L14.68 18H18.248L13.544 10.456ZM12.196 12.852L11.656 12.076L8.136 6.412H9.492L12.676 10.416L13.216 11.192L16.68 17.636H15.324L12.196 12.852Z" fill="white"/>
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#06C755" />
      <path d="M19.5 10.6c0-3.42-3.36-6.2-7.5-6.2s-7.5 2.78-7.5 6.2c0 3.07 2.66 5.63 6.25 6.12.24.05.57.16.66.37.07.18.05.47.02.66l-.1.64c-.03.2-.15.77.66.42.82-.35 4.4-2.66 6-4.56C19.06 13.08 19.5 11.92 19.5 10.6z" fill="white"/>
      <path d="M10.25 8.8H9.5a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h.75a.3.3 0 0 0 .3-.3V9.1a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M14.75 8.8H14a.3.3 0 0 0-.3.3v1.96l-1.44-2.1a.3.3 0 0 0-.26-.16h-.75a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h.75a.3.3 0 0 0 .3-.3v-1.96l1.44 2.1a.3.3 0 0 0 .26.16h.75a.3.3 0 0 0 .3-.3V9.1a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M8.5 11.35H7.2V9.1a.3.3 0 0 0-.3-.3h-.75a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3H8.5a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3z" fill="#06C755"/>
      <path d="M18.15 9.85a.3.3 0 0 0 .3-.3V8.8a.3.3 0 0 0-.3-.3h-2.4a.3.3 0 0 0-.3.3v3.3a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3H16.5v-.5h1.65a.3.3 0 0 0 .3-.3v-.75a.3.3 0 0 0-.3-.3H16.5v-.5h1.65z" fill="#06C755"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path d="M16.5 12.5l.5-3h-3V8c0-.83.4-1.63 1.7-1.63H17V3.88S15.82 3.5 14.7 3.5c-2.33 0-3.86 1.41-3.86 3.97V9.5H8v3h2.84V21h3.5V12.5H16.5z" fill="white"/>
    </svg>
  );
}

/* ── Share image generation ── */

/** Canvas を PNG Blob 化（長押し切り替え用の個別画像アップロードに使う） */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 0.92);
  });
}

/** data: / blob: URL を Blob 化（パノラマ用マスター画像のアップロードに使う） */
async function urlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

async function generateShareImage(
  creatureCanvas: HTMLCanvasElement,
  humanCanvas: HTMLCanvasElement,
  creature: Creature
): Promise<Blob> {
  const srcW = creatureCanvas.width;
  const srcH = creatureCanvas.height;

  const padding = 20;
  const halfW = Math.round(srcW / 2);
  const gap = 4;
  const totalW = srcW + padding * 2;
  const footerH = 100;
  const totalH = srcH + footerH + padding * 2;

  const cv = document.createElement("canvas");
  cv.width = totalW;
  cv.height = totalH;
  const ctx = cv.getContext("2d")!;

  ctx.fillStyle = "#FFF9F2";
  ctx.fillRect(0, 0, totalW, totalH);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, padding, halfW - gap / 2, srcH, [12, 0, 0, 12]);
  ctx.clip();
  ctx.drawImage(creatureCanvas, 0, 0, srcW, srcH, padding, padding, halfW - gap / 2, srcH);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding + halfW + gap / 2, padding, halfW - gap / 2, srcH, [0, 12, 12, 0]);
  ctx.clip();
  ctx.drawImage(humanCanvas, srcW / 4, 0, srcW / 2, srcH, padding + halfW + gap / 2, padding, halfW - gap / 2, srcH);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding + halfW, padding);
  ctx.lineTo(padding + halfW, padding + srcH);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(padding + 8, padding + 8, 80, 26);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(`${creature.name}のめ`, padding + 14, padding + 25);

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(padding + halfW + gap / 2 + 8, padding + 8, 80, 26);
  ctx.fillStyle = "#fff";
  ctx.fillText("👁 人間のめ", padding + halfW + gap / 2 + 14, padding + 25);

  const footerY = padding + srcH + 16;
  ctx.fillStyle = "#2D2D2D";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`${creature.name}の目で見た世界`, padding, footerY + 20);

  ctx.fillStyle = "#888";
  ctx.font = "13px sans-serif";
  ctx.fillText(SHARE_TEXTS[creature.id] || "", padding, footerY + 42);

  ctx.fillStyle = "#bbb";
  ctx.font = "11px sans-serif";
  ctx.fillText("👁 生き物の目で世界を見よう — creature-vision.vercel.app", padding, footerY + 68);

  return new Promise((resolve) => {
    cv.toBlob((blob) => resolve(blob!), "image/png", 0.92);
  });
}

/* ── Decode image file to HTMLImageElement (HEIC-safe) ── */

async function decodeImageFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to decode image: ${file.name} (${file.type})`));
  });
  // NOTE: don't revoke URL — img element needs it alive for canvas drawImage
  console.log(`[decode] Loaded ${file.name}: ${img.naturalWidth}x${img.naturalHeight}`);
  return img;
}

/* ── Normalize image for API (max 1024px, JPEG 85%) ── */

async function normalizeImage(
  inputBlob: Blob,
  maxDim: number = 1024
): Promise<{ blob: Blob; width: number; height: number; orientation: "landscape" | "portrait" | "square" }> {
  const img = inputBlob instanceof File
    ? await decodeImageFile(inputBlob)
    : await (async () => {
        const url = URL.createObjectURL(inputBlob);
        const el = new Image();
        el.src = url;
        await new Promise<void>((res, rej) => { el.onload = () => res(); el.onerror = () => rej(); });
        return el;
      })();
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const scale = Math.min(1, maxDim / Math.max(imgW, imgH));
  const w = Math.round(imgW * scale);
  const h = Math.round(imgH * scale);
  const aspectRatio = w / h;
  const orientation: "landscape" | "portrait" | "square" =
    aspectRatio > 1.05 ? "landscape" : aspectRatio < 0.95 ? "portrait" : "square";

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
  console.log(`[normalize] ${imgW}x${imgH} → ${w}x${h} (${orientation}, ${blob.size}B)`);
  return { blob, width: w, height: h, orientation };
}

/* ── マスター拡張画像の生成（写真1枚につき1回・360°ぶん・全生き物で使い回す） ── */

async function generateMaster(normalizedBlob: Blob): Promise<HTMLImageElement | null> {
  const formData = new FormData();
  formData.append("image", normalizedBlob, "photo.jpg");
  formData.append("expansion", "3.0"); // 360°ぶん固定
  formData.append("direction", "horizontal");

  try {
    const res = await fetch("/api/expand", { method: "POST", body: formData });
    if (!res.ok) {
      console.error("[master] API error:", res.status, await res.text());
      return null;
    }
    const blob = await res.blob();
    if (blob.size < 1000) {
      console.error("[master] Tiny blob:", blob.size);
      return null;
    }
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    try {
      await img.decode();
    } catch {
      console.error("[master] Failed to decode image");
      return null;
    }
    if (!img.naturalWidth || !img.naturalHeight) return null;
    console.log(`[master] ready: ${img.naturalWidth}x${img.naturalHeight}`);
    return img;
  } catch (err) {
    console.error("[master] Exception:", err);
    return null;
  }
}

// 拡張画像の良し悪しをスコア化。横幅（拡張量）が大きく、継ぎ目（縦の線）が
// 目立たないほど高スコア。線が入った失敗画像を弾くのに使う。
function masterScore(img: HTMLImageElement): number {
  const widthRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  let seamRatio = 1;
  try {
    const w = 240;
    const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const cx = c.getContext("2d", { willReadFrequently: true })!;
    cx.drawImage(img, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data;
    const col = new Float64Array(w);
    for (let x = 1; x < w; x++) {
      let s = 0;
      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4, j = (y * w + x - 1) * 4;
        const l1 = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const l2 = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
        s += Math.abs(l1 - l2);
      }
      col[x] = s / h;
    }
    let mean = 0; for (let x = 1; x < w; x++) mean += col[x]; mean /= (w - 1);
    let max = 0; for (let x = 1; x < w; x++) if (col[x] > max) max = col[x];
    seamRatio = max / (mean + 0.001); // 継ぎ目の縦線があるとここが跳ねる
  } catch { /* ignore */ }
  return widthRatio - seamRatio * 0.15;
}

// 2枚生成して「完全に拡張がうまくいった方（線が入っていない・広い方）」を選ぶ。
async function generateBestMaster(normalizedBlob: Blob): Promise<HTMLImageElement | null> {
  const [a, b] = await Promise.all([generateMaster(normalizedBlob), generateMaster(normalizedBlob)]);
  const cands = [a, b].filter(Boolean) as HTMLImageElement[];
  if (cands.length === 0) return null;
  if (cands.length === 1) return cands[0];
  const scored = cands.map((img) => ({ img, s: masterScore(img) })).sort((x, y) => y.s - x.s);
  console.log("[master] 2候補スコア:", scored.map((z) => z.s.toFixed(2)).join(", "), "→ 良い方を採用");
  return scored[0].img;
}

// マスター拡張画像を「写真(File)単位」でページを跨いで保持するモジュールキャッシュ。
// 戻って生き物を選び直しても（ViewScreen再マウントでも）同じ写真なら再生成しない。
// WeakMapなので写真を変えて参照が消えれば自動で破棄される。
const MASTER_CACHE = new WeakMap<File, HTMLImageElement>();
const MASTER_PROMISE_CACHE = new WeakMap<File, Promise<HTMLImageElement | null>>();

/* ── 色フィルターの上書き（スクロールパノラマ用・色のみ） ── */
// スクロール方式では「見回す」が視野を担当するので、色覚だけを別レイヤーで適用する。
// 既存filterTypeが形状まで焼くもの（分割眼・上下反転・魚眼など）は、
// パノラマが歪まないよう色のみのフィルターに差し替える。ここに無い生き物は
// 自身の filterType（色専用）＋ fp をそのまま使う。
// パノラマ画像に使う色フィルターの上書き。horse/goatの"panorama"/"horizoneye"は
// バレル/横伸ばしの形状を焼くのでスクロールパノラマには不向き→色のみ(dichro)にする。
// それ以外（カメレオン=dualeye, ヨツメウオ=spliteye 等）は本来のfilterTypeをそのまま
// パノラマ画像に適用し、スクロールで見回せるようにする（＝形状フィルターもパノラマに乗る）。
const PANO_COLOR: Record<string, { filter: string; fp?: Record<string, unknown> }> = {
  // 馬・ヤギとも二色覚（黄と青だけ）。ヤギは後段で横長レターボックス（長方形瞳孔）を追加。
  horse: { filter: "dichro", fp: { channels: [[255, 216, 0], [10, 90, 255]] } },
  goat: { filter: "dichro", fp: { channels: [[255, 216, 0], [10, 90, 255]] } },
};

// マスター画像を fov に応じて中心からクロップして ctx いっぱいに描画
function cropMasterForFov(
  ctx: CanvasRenderingContext2D,
  master: HTMLImageElement,
  fov: number,
  w: number,
  h: number
): void {
  const cropRatio = Math.min(1.0, Math.max(0.33, fov / 360));
  const cropW = master.naturalWidth * cropRatio;
  const cropX = (master.naturalWidth - cropW) / 2; // 中心基準（元写真は中央）
  ctx.drawImage(master, cropX, 0, cropW, master.naturalHeight, 0, 0, w, h);
}

/* ── Main component ── */

export default function ViewScreen({
  creatures,
  selectedId,
  mediaFile,
  favs,
  onBack,
  onToggleFav,
  onSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humanCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState<number | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [trivia, setTrivia] = useState("");
  const [progress, setProgress] = useState(0); // 生成待ちの擬似プログレス(0-100)
  // スクロール式パノラマ用の画像（フィルター済みマスター＝生き物のめ／元色マスター＝人間のめ）と人間切替
  const [panoUrl, setPanoUrl] = useState("");
  const [panoHumanUrl, setPanoHumanUrl] = useState("");
  const [showHuman, setShowHuman] = useState(false);
  // マスター拡張画像は写真(File)単位のモジュールキャッシュ(MASTER_CACHE)で保持する。
  const normalizedBlobRef = useRef<Blob | null>(null);
  // 正規化（API送信用画像の用意）の進行中Promise。描画がこれを await できる。
  const normalizedBlobPromiseRef = useRef<Promise<Blob> | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const renderVersionRef = useRef(0);
  // シェアメニューを開いた時点で先読み生成したシェアURLをキャッシュ（about:blankの待ち時間を消すため）
  const sharePrepRef = useRef<{ url: string; creatureId: string } | null>(null);
  const [preparingShare, setPreparingShare] = useState(false);

  const creature = creatures.find((c) => c.id === selectedId)!;
  const catColor = CATEGORY_COLORS[creature.cat];
  const fovData = FOV_DATA[creature.id];

  // Close share menu on outside click
  useEffect(() => {
    if (!showShareMenu) return;
    const handler = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShareMenu]);

  // Alternate loading text during expansion
  useEffect(() => {
    if (!expanding) {
      setLoadingTextIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % 2);
    }, 1800);
    return () => clearInterval(interval);
  }, [expanding]);

  // 生成待ち／シェア準備中の擬似プログレスバー。時間経過で伸び、最後はゆっくり95%に漸近。
  useEffect(() => {
    if (!(processing || expanding || preparingShare)) { setProgress(0); return; }
    setProgress(6);
    const iv = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + (96 - p) * 0.06));
    }, 200);
    return () => clearInterval(iv);
  }, [processing, expanding, preparingShare]);

  // 変換中＋シェアリンク準備中の豆知識（ランダムで開始→2.5秒ごとに3つをローテーション）
  useEffect(() => {
    if (!(processing || expanding || preparingShare)) return;
    const list = TRIVIA[creature.id] || [];
    if (list.length === 0) { setTrivia(""); return; }
    let i = Math.floor(Math.random() * list.length);
    setTrivia(list[i]);
    const interval = setInterval(() => {
      i = (i + 1) % list.length;
      setTrivia(list[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [processing, expanding, preparingShare, creature.id]);

  const loadingTexts = [
    `${creature.name}の視点に変換中...`,
    `🔭 視界を広げているよ...`,
  ];

  // Normalize image for API on mount
  useEffect(() => {
    let cancelled = false;
    // マスターは写真(File)単位のキャッシュなので、写真ごとに自然にmiss→生成される。
    // 正規化のPromiseをrefに保持。描画が正規化より先に走っても、
    // handleCreatureChange側でこのPromiseを await できる（レース対策）。
    const p = normalizeImage(mediaFile, 1024).then(({ blob }) => {
      if (!cancelled) normalizedBlobRef.current = blob;
      return blob;
    });
    normalizedBlobPromiseRef.current = p;
    return () => { cancelled = true; };
  }, [mediaFile]);

  // Load image and initial render
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const img = await decodeImageFile(mediaFile);
        if (cancelled) return;

        imgRef.current = img;
        const canvas = canvasRef.current;
        const humanCanvas = humanCanvasRef.current;
        if (!canvas) return;

        const scale = Math.min(1, MAX_W / img.naturalWidth);
        const w = Math.floor(img.naturalWidth * scale);
        const h = Math.floor(img.naturalHeight * scale);
        canvas.width = w;
        canvas.height = h;
        setCanvasRatio(w / h);

        if (humanCanvas) {
          humanCanvas.width = w;
          humanCanvas.height = h;
          humanCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        }

        console.log("[load] Image ready:", img.naturalWidth, "x", img.naturalHeight, "→ canvas:", w, "x", h);
        handleCreatureChange(selectedId, img, w, h);
      } catch (e) {
        console.error("[load] Failed to load image:", e);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFile]);

  // Re-render when creature changes
  useEffect(() => {
    if (!imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    handleCreatureChange(selectedId, imgRef.current, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Main rendering function
  const handleCreatureChange = useCallback(
    async (creatureId: string, originalImage: CanvasImageSource, w: number, h: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const c = creatures.find((cr) => cr.id === creatureId)!;
      const fov = FOV_DATA[creatureId];
      const exp = fov?.expansion ?? 1.0;
      const thisVersion = ++renderVersionRef.current;

      console.log("=== CREATURE CHANGE ===", creatureId, "expansion:", exp, "version:", thisVersion);

      // --- STEP 1: Loading ---
      setLoadingText(`${c.name}に転生中...`);
      setProcessing(true);
      setShowHuman(false); // 生き物を切り替えたら生き物のめから

      // --- STEP 2: マスター拡張画像を用意（広視野=exp>1.0 のときだけ。写真1枚に1回生成し全生き物で使い回す） ---
      let master: HTMLImageElement | null = null;
      if (exp > 1.0) {
        const cached = MASTER_CACHE.get(mediaFile);
        if (cached) {
          master = cached; // 生成済み（同じ写真なら戻ってきても即座に使い回し）
        } else {
          // 正規化が描画より遅れて完了するレースがある（最初の生き物で発生）。
          // ここで正規化の完了を待ってから生成する（待たないとマスターが永久にスキップされる）。
          let blob = normalizedBlobRef.current;
          if (!blob && normalizedBlobPromiseRef.current) {
            setLoadingText("🔭 視界をひろげてるよ...");
            setExpanding(true);
            try { blob = await normalizedBlobPromiseRef.current; } catch { blob = null; }
          }
          if (blob) {
            setLoadingText("🔭 視界をひろげてるよ...");
            setExpanding(true);
            try {
              // 多重生成防止: 写真単位で生成Promiseを共有。2枚生成して良い方を採用。
              let p = MASTER_PROMISE_CACHE.get(mediaFile);
              if (!p) {
                p = generateBestMaster(blob);
                MASTER_PROMISE_CACHE.set(mediaFile, p);
              }
              master = await p;
              if (master) MASTER_CACHE.set(mediaFile, master);
              else MASTER_PROMISE_CACHE.delete(mediaFile); // 失敗時は次回リトライ可
            } catch (e) {
              console.error("[master] failed:", e);
              MASTER_PROMISE_CACHE.delete(mediaFile);
            }
          }
          setExpanding(false);
        }
      }

      // Abort if a newer render has started
      if (renderVersionRef.current !== thisVersion) {
        console.log("[draw] Stale render, aborting version:", thisVersion);
        return;
      }

      const useMaster = exp > 1.0 && !!master;
      const override = PANO_COLOR[creatureId];
      const colorFilter = override?.filter ?? c.filterType;
      const colorFp = override ? (override.fp ?? {}) : c.fp;

      try {
        // --- STEP 3: 正面ビュー（シェア用にcanvasRefへ）。マスターをfovでクロップ／狭視野は元写真 ---
        try {
          if (useMaster && master) {
            cropMasterForFov(ctx, master, fov?.fov ?? 360, w, h);
          } else {
            ctx.drawImage(originalImage, 0, 0, w, h);
          }
        } catch (e) {
          console.error("[draw] source failed, falling back to original:", e);
          ctx.drawImage(originalImage, 0, 0, w, h);
        }

        // Verify canvas has content (detect blank canvas)
        const sample = ctx.getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data;
        if (sample[0] === 0 && sample[1] === 0 && sample[2] === 0 && sample[3] === 0) {
          console.warn("[draw] Canvas is blank after drawImage, redrawing with original");
          ctx.drawImage(originalImage, 0, 0, w, h);
        }

        // --- STEP 4: 色・質感フィルター（色はここで全部やる。幾何変換はしない） ---
        applyFilter(ctx, w, h, colorFilter, colorFp);

        // --- STEP 5: 狭視野(exp<1.0)は中央ズーム＋周辺暗転 ---
        if (exp > 0 && exp < 1.0) {
          const filtered = document.createElement("canvas");
          filtered.width = w;
          filtered.height = h;
          filtered.getContext("2d")!.drawImage(ctx.canvas, 0, 0);
          const cropW = w * exp;
          const cropH = h * exp;
          const sx = (w - cropW) / 2;
          const sy = (h - cropH) / 2;
          ctx.drawImage(filtered, sx, sy, cropW, cropH, 0, 0, w, h);

          const darkness = Math.max(0, 1 - exp) * 0.8;
          const vg = ctx.createRadialGradient(
            w / 2, h / 2, w * exp * 0.3,
            w / 2, h / 2, w * 0.6
          );
          vg.addColorStop(0, "rgba(0,0,0,0)");
          vg.addColorStop(1, `rgba(0,0,0,${darkness})`);
          ctx.fillStyle = vg;
          ctx.fillRect(0, 0, w, h);
        }

        // --- STEP 6: スクロール式パノラマ用の画像を用意（広視野・形状組以外） ---
        // マスター拡張画像全体に色フィルターを適用した1枚を作り、PanoramaViewerに渡す。
        // 人間の目用は色フィルターなしのマスター（元の色）。
        if (useMaster && master) {
          try {
            const mw = master.naturalWidth, mh = master.naturalHeight;
            const pc = document.createElement("canvas");
            pc.width = mw; pc.height = mh;
            const pctx = pc.getContext("2d")!;
            pctx.drawImage(master, 0, 0);
            applyFilter(pctx, mw, mh, colorFilter, colorFp);
            // ヤギ: 横長の長方形瞳孔＝水平の帯だけクッキリ、上下は暗い(レターボックス)。
            // 馬との違いを表現（馬は上下を暗くせず、より広いフルパノラマ）。
            if (creatureId === "goat") {
              const band = mh * 0.3;
              const gTop = pctx.createLinearGradient(0, 0, 0, band);
              gTop.addColorStop(0, "rgba(0,0,0,0.9)");
              gTop.addColorStop(1, "rgba(0,0,0,0)");
              pctx.fillStyle = gTop;
              pctx.fillRect(0, 0, mw, band);
              const gBot = pctx.createLinearGradient(0, mh - band, 0, mh);
              gBot.addColorStop(0, "rgba(0,0,0,0)");
              gBot.addColorStop(1, "rgba(0,0,0,0.9)");
              pctx.fillStyle = gBot;
              pctx.fillRect(0, mh - band, mw, band);
            }
            const url = pc.toDataURL("image/jpeg", 0.9);
            if (renderVersionRef.current === thisVersion) {
              setPanoUrl(url);
              setPanoHumanUrl(master.src);
            }
          } catch (e) {
            console.error("[pano] build failed:", e);
            if (renderVersionRef.current === thisVersion) { setPanoUrl(""); setPanoHumanUrl(""); }
          }
        } else if (renderVersionRef.current === thisVersion) {
          setPanoUrl(""); setPanoHumanUrl(""); // 狭視野はパノラマなし（通常表示）
        }
      } catch (e) {
        console.error("[draw] Rendering pipeline failed:", e);
        // Last resort: draw original image unfiltered
        try { ctx.drawImage(originalImage, 0, 0, w, h); } catch { /* give up */ }
      } finally {
        // --- STEP 7: Done ---
        setProcessing(false);
        setLoadingText("");
      }
    },
    [creatures, mediaFile]
  );

  // 比較画像を生成→アップロードしてOGP付きシェアページURLを返す（失敗時はnull）
  const createShareUrl = useCallback(async (): Promise<string | null> => {
    const creatureCanvas = canvasRef.current;
    const humanCanvas = humanCanvasRef.current;
    if (!creatureCanvas || !humanCanvas) return null;
    try {
      // OGP用の合成画像（正面ビューの左右並び）は共通
      const composite = await generateShareImage(creatureCanvas, humanCanvas, creature);
      const fd = new FormData();
      fd.append("image", composite, `${creature.id}.png`);
      fd.append("creatureId", creature.id);

      if (panoUrl && panoHumanUrl) {
        // パノラマ表示の生き物: フィルター済みマスター(生き物のめ)＋元色マスター(人間のめ)を共有。
        // → シェアページも本編と同じスクロールパノラマ＋押している間だけ人間の目にできる。
        const [cimg, himg] = await Promise.all([urlToBlob(panoUrl), urlToBlob(panoHumanUrl)]);
        fd.append("creatureImage", cimg, `${creature.id}-creature.jpg`);
        fd.append("humanImage", himg, `${creature.id}-human.jpg`);
        fd.append("panorama", "1");
        fd.append("photoAspect", String(canvasRatio ?? 1));
      } else {
        // 狭視野など: 従来どおり正面ビューの個別画像（長押し切替）
        const [cimg, himg] = await Promise.all([
          canvasToBlob(creatureCanvas),
          canvasToBlob(humanCanvas),
        ]);
        fd.append("creatureImage", cimg, `${creature.id}-creature.png`);
        fd.append("humanImage", himg, `${creature.id}-human.png`);
      }
      const res = await fetch("/api/share", { method: "POST", body: fd });
      if (!res.ok) {
        console.error("[share] create failed:", res.status);
        return null;
      }
      const data = await res.json();
      return data.shareUrl ?? null;
    } catch (e) {
      console.error("[share] create error:", e);
      return null;
    }
  }, [creature, panoUrl, panoHumanUrl, canvasRatio]);

  // シェアメニューを開いた瞬間にURLを先読み生成しておく（about:blankの待ち時間を消す）
  const prepareShareUrl = useCallback(async () => {
    if (sharePrepRef.current?.creatureId === creature.id) return; // この生き物は生成済み
    setPreparingShare(true);
    const url = await createShareUrl();
    if (url) sharePrepRef.current = { url, creatureId: creature.id };
    setPreparingShare(false);
  }, [creature, createShareUrl]);

  // Share to specific SNS
  const shareToSns = useCallback(
    async (sns: "x" | "line" | "facebook") => {
      const shareText = SHARE_TEXTS[creature.id] || "";
      const fullText = `${shareText}\n\n👁 生き物の目で世界を見よう`;
      // 共有するURL。シェアページ作成に失敗したら従来どおりトップURLにフォールバック
      let url = "https://creature-vision.vercel.app";

      // 先読み済みならタブを開かず即遷移できる（about:blankの空白が出ない）
      const prepared =
        sharePrepRef.current?.creatureId === creature.id
          ? sharePrepRef.current.url
          : null;

      let win: Window | null = null;
      if (prepared) {
        url = prepared;
      } else {
        // 未生成: タブを先に開き「準備中…」を表示してからURLを差し込む
        // （アップロード後に window.open するとポップアップブロックされるため。特にSafari対策）
        win = window.open("about:blank", "_blank");
        if (win) {
          win.opener = null;
          win.document.write(
            `<!doctype html><meta charset="utf-8"><title>準備中…</title>` +
              `<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#FFF9F2;font-family:sans-serif;color:#666">` +
              `<div style="text-align:center"><div style="font-size:44px">🐾</div>` +
              `<div style="margin-top:12px;font-size:14px">シェアリンクを準備中…</div></div></body>`
          );
        }
        const created = await createShareUrl();
        if (created) {
          url = created;
          sharePrepRef.current = { url: created, creatureId: creature.id };
        }
      }

      let shareUrl = "";
      switch (sns) {
        case "x":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`;
          break;
        case "line":
          shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(fullText)}`;
          break;
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullText)}`;
          break;
      }
      if (win) {
        win.location.href = shareUrl;
      } else {
        // 先読み済み or タブを開けなかった場合
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
      setShowShareMenu(false);
    },
    [creature, createShareUrl]
  );

  const isFav = favs.includes(selectedId);

  return (
    <div
      className="min-h-screen px-4 py-6 mx-auto"
      style={{ maxWidth: 960, animation: "fadeUp 0.4s ease-out" }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={onBack} className="pill-btn">
          ← もどる
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onToggleFav(selectedId)}
          className="pill-btn"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>

      {/* Creature nav pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {creatures.map((c) => {
          const active = c.id === selectedId;
          const col = CATEGORY_COLORS[c.cat];
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex-shrink-0 cursor-pointer"
              style={{
                padding: "6px 14px",
                borderRadius: 100,
                background: active ? (col?.accent ?? "#999") : "#fff",
                color: active ? "#fff" : "#2D2D2D",
                border: "2px solid rgba(0,0,0,0.05)",
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Title area */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: catColor?.bg ?? "#f5f5f5",
          }}
        >
          <Icon id={creature.id} name={creature.name} cat={creature.cat} size={36} />
        </div>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900 }}>{creature.name}のめ</span>
          <div style={{ fontSize: 13, color: "#999" }}>{creature.en}</div>
        </div>
      </div>

      {/* 表示エリア */}
      <div className="relative">
        {/* 広視野: スクロール式パノラマ（Street Viewのように見回す） */}
        {panoUrl ? (
          <PanoramaViewer
            imageUrl={showHuman ? panoHumanUrl : panoUrl}
            fov={showHuman ? 120 : fovData?.fov ?? 360}
            photoAspect={canvasRatio ?? 1}
            frozen={showHuman}
            loop={!showHuman && (fovData?.fov ?? 0) >= 360}
            label={showHuman ? "👁 人間のめ" : `${creature.name}のめ`}
          />
        ) : null}

        {/* 狭視野（人間・フクロウ・深海魚・モグラ）: 通常表示＋長押しで人間のめ。
            広視野でもシェア用にcanvasは常時描画（パノラマ時は非表示）。 */}
        <div
          className="relative"
          style={{
            display: panoUrl ? "none" : "block",
            borderRadius: 18, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
          onMouseDown={() => setIsHolding(true)}
          onMouseUp={() => setIsHolding(false)}
          onMouseLeave={() => setIsHolding(false)}
          onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
          onTouchEnd={() => setIsHolding(false)}
          onTouchCancel={() => setIsHolding(false)}
        >
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ height: "auto", aspectRatio: canvasRatio ?? undefined }}
          />
          <canvas
            ref={humanCanvasRef}
            className="absolute top-0 left-0 block w-full"
            style={{
              height: "auto", aspectRatio: canvasRatio ?? undefined,
              opacity: (isHolding || showHuman) ? 1 : 0,
              transition: "opacity 0.3s ease", pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute", top: 12, left: "50%",
              transform: "translateX(-50%)", padding: "6px 16px",
              borderRadius: 100,
              background: (isHolding || showHuman) ? "rgba(255,255,255,0.9)" : `${catColor?.accent ?? "#999"}ee`,
              color: (isHolding || showHuman) ? "#333" : "#fff",
              fontSize: 12, fontWeight: 900,
              transition: "all 0.3s ease", pointerEvents: "none",
            }}
          >
            {(isHolding || showHuman) ? "👁 人間のめ" : `${creature.name}のめ`}
          </div>
        </div>

        {/* Loading overlay */}
        {(processing || expanding) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(255,249,242,0.95)", zIndex: 20, borderRadius: 18 }}
          >
            <div style={{ animation: "eyeOpen 2s ease-in-out infinite" }}>
              <Icon id={creature.id} name={creature.name} cat={creature.cat} size={60} />
            </div>
            <p
              key={expanding ? loadingTextIndex : "init"}
              className="mt-4"
              style={{
                fontWeight: 900, fontSize: 16, color: "#2D2D2D",
                textAlign: "center",
                animation: "fadeInText 0.5s ease",
              }}
            >
              {expanding ? loadingTexts[loadingTextIndex] : loadingText}
            </p>

            {/* 擬似プログレスバー（生成待ちの目安） */}
            <div style={{ width: 220, maxWidth: "70%", marginTop: 14 }}>
              <div style={{ height: 8, borderRadius: 100, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(progress)}%`,
                    borderRadius: 100,
                    background: `${catColor?.accent ?? "#F5A623"}`,
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>

            {/* 豆知識カード */}
            {trivia && (
              <div
                key={trivia}
                style={{
                  marginTop: 20,
                  background: "#fff",
                  borderRadius: 16,
                  padding: "16px 20px",
                  maxWidth: 320,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  animation: "fadeInText 0.5s ease",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 900, color: "#E8A838", marginBottom: 6 }}>
                  💡 豆知識
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5F5E5A", whiteSpace: "pre-line" }}>
                  {trivia}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 人間の目ボタン（人間以外の全生き物・押している間だけ人間の目）。
          パノラマは画像を切替、狭視野(モグラ/深海魚等)は人間canvasを重ねる。 */}
      {creature.id !== "human" && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button
            onPointerDown={(e) => {
              setShowHuman(true); // 先に切替（capture失敗でも確実に人間へ）
              try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* 指の微動対策・best effort */ }
            }}
            onPointerUp={() => setShowHuman(false)}
            onPointerCancel={() => setShowHuman(false)}
            onLostPointerCapture={() => setShowHuman(false)}
            style={{
              padding: "10px 20px", borderRadius: 100, border: "none",
              background: showHuman ? (catColor?.accent ?? "#999") : "#2D2D2D",
              color: "#fff", fontWeight: 900, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              touchAction: "none", userSelect: "none",
            }}
          >
            {showHuman ? "👁 人間のめ（はなすと戻る）" : "👆 押している間だけ人間の目"}
          </button>
        </div>
      )}

      {/* Hint + FOV */}
      {creature.id === "human" && (
        <p className="mt-3 text-center" style={{ fontSize: 13, color: "#999", fontWeight: 500, lineHeight: 1.8 }}>
          これがあなたの世界。
          <br />でも電磁スペクトルのたった0.0035%しか見えていません。
          <br />他の生き物をタップして、別の世界を覗いてみよう。
        </p>
      )}

      {fovData && (
        <p className="mt-1 text-center" style={{ fontSize: 13, fontWeight: 700, color: "#999" }}>
          🔭 視野角: {fovData.fov === 0 ? "なし（目が退化）" : `${fovData.fov}°（人間は120°）`}
        </p>
      )}

      {/* Share button + popup */}
      <div className="relative flex justify-center" ref={shareMenuRef}>
        {showShareMenu && (
          <div
            style={{
              position: "absolute", bottom: "100%", marginBottom: 12,
              background: "#fff", borderRadius: 16, padding: "16px 24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              animation: "fadeUp 0.2s ease-out", zIndex: 10,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "#999", marginBottom: 12 }}>
              {preparingShare ? "リンク準備中…" : "シェアする"}
            </p>
            {preparingShare && (
              <div style={{ width: "100%", maxWidth: 260, marginBottom: 12 }}>
                <div style={{ height: 8, borderRadius: 100, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", width: `${Math.round(progress)}%`, borderRadius: 100,
                      background: catColor?.accent ?? "#F5A623", transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}
            {preparingShare && trivia && (
              <div style={{ background: "#FFF8EC", borderRadius: 12, padding: "10px 14px", marginBottom: 12, maxWidth: 260 }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#E8A838", marginBottom: 4 }}>💡 豆知識</p>
                <p key={trivia} style={{ fontSize: 12.5, lineHeight: 1.55, color: "#5F5E5A", whiteSpace: "pre-line" }}>
                  {trivia}
                </p>
              </div>
            )}
            <div className="flex gap-5">
              {([["x", <XIcon key="x" />, "X"], ["line", <LineIcon key="l" />, "LINE"], ["facebook", <FacebookIcon key="f" />, "Facebook"]] as const).map(([sns, icon, label]) => (
                <button
                  key={sns}
                  onClick={() => shareToSns(sns)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 48, height: 48, borderRadius: 14, background: "#f0f0f0", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {icon}
                  </div>
                  <span style={{ fontSize: 10, color: "#999" }}>{label}</span>
                </button>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #fff" }} />
          </div>
        )}
        <button
          onClick={() => {
            const next = !showShareMenu;
            setShowShareMenu(next);
            if (next) prepareShareUrl(); // 開いた瞬間にリンクを先読み生成
          }}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 16,
            border: "2px solid rgba(0,0,0,0.06)",
            background: shareFeedback ? "#f0fff0" : "#fff",
            color: "#333", fontSize: 15, fontWeight: 900, fontFamily: "inherit",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, marginTop: 12, transition: "all 0.2s",
          }}
        >
          <ShareIcon />
          {shareFeedback ? "✅ 画像を保存しました！" : "この見え方をシェアする"}
        </button>
      </div>

      {/* Bio panel */}
      <div className="mt-6">
        <div style={{ padding: 20, borderRadius: 18, background: catColor?.bg ?? "#f5f5f5" }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>🧬 なんでこうなの？</div>
          <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.8, color: "#555" }}>
            {creature.bio}
          </p>
        </div>
      </div>

      <style>{`
        .pill-btn {
          background: #fff; border: 2px solid rgba(0,0,0,0.07);
          border-radius: 100px; padding: 8px 16px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all 0.2s; font-family: inherit; color: #2D2D2D;
        }
        .pill-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes eyeOpen {
          0%   { transform: scaleY(1); }
          20%  { transform: scaleY(0); }
          80%  { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
