// ゲーム全体の定数。サーバー/クライアント両方から参照する。

/** 月に開いた剣穴の総数(1ラウンドあたり) */
export const HOLE_COUNT = 1000;

/** 月の半径 (three.js units) */
export const MOON_RADIUS = 5;

/** こすくまくんが刺さっている北極まわりの、穴を置かない角度(度) */
export const POLAR_CAP_DEG = 34;

/** 同一プレイヤーの連続刺し禁止時間(秒) */
export const COOLDOWN_SEC = 60;

/** 状態ポーリング間隔(ms) — /api/state はCDNで3秒キャッシュされる */
export const POLL_MS = 4000;

/** 名前の最大文字数 */
export const NAME_MAX_LEN = 12;

// ── 演出タイミング (ms) ──────────────────────────────
export const T_STAB = 1100; // 剣を構えて刺すまで
export const T_SUSPENSE = 1600; // 刺した後の「……」の間
export const T_SAFE = 2200; // セーフ演出
export const T_LAUNCH = 6500; // こすくまくん発射カットシーン
export const T_TROPHY = 4500; // トロフィー授与式
export const T_NEW_ROUND = 3500; // 新こすくまくん降臨

// ── パレット ────────────────────────────────────────
export const COLORS = {
  space: "#0a0e2a", // 宇宙の紺
  spaceDeep: "#05071a",
  moon: "#cfd3e8", // 月の淡いグレー
  moonCrater: "#a9aecb",
  kosukuma: "#fdf7c1", // こすくまくんのクリーム
  accent: "#ffd93d", // 星の黄色
  accentPink: "#ffb3c7",
  ui: "#fffef2", // UI地色
  uiText: "#3a3730",
  danger: "#ff6b6b",
  safe: "#7ce38b",
} as const;
