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

// ── 剣の色(プレイヤーが選べる。indexをAPI/DBに保存する) ──
// 黒ひげ危機一発の「1色成型のプラスチック剣」に合わせた、明るい原色パレット。
// 並び順を変えると過去の剣の色が変わってしまうので、追加は末尾にのみ行うこと。
export const SWORD_COLORS = [
  { name: "きいろ", hex: "#ffd93d" }, // 0: デフォルト(いままでの剣と同じ)
  { name: "あか", hex: "#ff5d5d" },
  { name: "オレンジ", hex: "#ff9f43" },
  { name: "みどり", hex: "#7ce38b" },
  { name: "みずいろ", hex: "#6fd3ff" },
  { name: "あお", hex: "#5d8bff" },
  { name: "むらさき", hex: "#b38bff" },
  { name: "ピンク", hex: "#ff8bc2" },
] as const;

// ── 剣のスキン(こすくまくんを とばした人だけが解放できる) ────────
// index を style バイトの下位3bitに詰めてAPI/DBへ保存する(src/lib/style.ts)。
// 3bit = 最大8種。並び順を変えると過去の剣の見た目が変わるので追加は末尾にのみ。
export interface SwordSkin {
  /** 表示名(ひらがな中心) */
  name: string;
  /** 解放に必要な「とばした回数」。0 = 最初から使える */
  needWins: number;
  /** true = プレイヤーが選んだ SWORD_COLORS で塗る / false = hex 固定 */
  tinted: boolean;
  /** tinted=false のときの固有色 */
  hex: string;
  metalness: number;
  roughness: number;
  /** 自発光の強さ(0=なし)。暗い宇宙でも剣が沈まないように */
  emissive: number;
  /** 1未満で半透明(クリスタル) */
  opacity: number;
  /** 見る角度で色が動く(にじいろ) */
  iridescent: boolean;
  /** UIのラベルにそえる小さな絵文字 */
  emoji: string;
}

export const SWORD_SKINS: readonly SwordSkin[] = [
  {
    name: "プラスチック",
    needWins: 0,
    tinted: true,
    hex: "#ffd93d",
    metalness: 0.04,
    roughness: 0.34,
    emissive: 0.09,
    opacity: 1,
    iridescent: false,
    emoji: "🗡",
  },
  {
    name: "ぎん",
    needWins: 1,
    tinted: false,
    hex: "#e8eefc",
    metalness: 1,
    roughness: 0.17,
    emissive: 0.05,
    opacity: 1,
    iridescent: false,
    emoji: "🥈",
  },
  {
    name: "きん",
    needWins: 1,
    tinted: false,
    hex: "#ffd06a",
    metalness: 1,
    roughness: 0.22,
    emissive: 0.1,
    opacity: 1,
    iridescent: false,
    emoji: "🥇",
  },
  {
    name: "クリスタル",
    needWins: 2,
    tinted: true,
    hex: "#bfe9ff",
    metalness: 0,
    roughness: 0.04,
    emissive: 0.34,
    opacity: 0.58,
    iridescent: false,
    emoji: "💠",
  },
  {
    name: "にじいろ",
    needWins: 3,
    tinted: false,
    hex: "#ffffff",
    metalness: 0.72,
    roughness: 0.14,
    emissive: 0.22,
    opacity: 1,
    iridescent: true,
    emoji: "🌈",
  },
] as const;

// ── チャーム(刺した本数でたまる、剣にぶら下げる かざり) ──────────
// index+1 を style バイトの上位5bitに詰める(0=チャームなし)。最大31段。
export type CharmShape =
  | "star"
  | "moon"
  | "drop"
  | "heart"
  | "clover"
  | "gem"
  | "bell"
  | "flower"
  | "fish"
  | "crown"
  | "flame"
  | "rainbow";

export interface Charm {
  /** 獲得に必要な通算の刺し本数 */
  need: number;
  name: string;
  emoji: string;
  shape: CharmShape;
  hex: string;
}

/** need の昇順で並べること(charmLevelOf が前提にしている) */
export const CHARMS: readonly Charm[] = [
  { need: 10, name: "ほし", emoji: "⭐️", shape: "star", hex: "#ffe066" },
  { need: 20, name: "みかづき", emoji: "🌙", shape: "moon", hex: "#ffd9a0" },
  { need: 30, name: "しずく", emoji: "💧", shape: "drop", hex: "#8fd8ff" },
  { need: 40, name: "ハート", emoji: "💗", shape: "heart", hex: "#ff9ec4" },
  { need: 50, name: "よつば", emoji: "🍀", shape: "clover", hex: "#8ce39a" },
  { need: 60, name: "ほうせき", emoji: "💎", shape: "gem", hex: "#a5c8ff" },
  { need: 70, name: "すず", emoji: "🔔", shape: "bell", hex: "#ffd06a" },
  { need: 80, name: "おはな", emoji: "🌼", shape: "flower", hex: "#fff0a6" },
  { need: 100, name: "おさかな", emoji: "🐟", shape: "fish", hex: "#7fd7e8" },
  { need: 150, name: "かんむり", emoji: "👑", shape: "crown", hex: "#ffcf47" },
  { need: 200, name: "ほのお", emoji: "🔥", shape: "flame", hex: "#ff8a4c" },
  { need: 300, name: "にじ", emoji: "🌈", shape: "rainbow", hex: "#c9a6ff" },
] as const;

/** 通算の刺し本数から「持っているチャームの数」(0..CHARMS.length) */
export function charmLevelOf(total: number): number {
  let n = 0;
  for (const c of CHARMS) {
    if (total >= c.need) n++;
    else break;
  }
  return n;
}

/** 剣にぶら下げて見せるチャームの最大数(多すぎるとシルエットが潰れる) */
export const CHARM_VISIBLE_MAX = 3;

// ── 他の人の刺しを見せる演出 ─────────────────────────
/** 他の人の剣が降ってきて刺さるまで(ms) */
export const T_REMOTE_STAB = 620;
/** 同時に届いた刺しをずらす間隔(ms) */
export const REMOTE_STAGGER = 300;
/** 一度に演出する最大数(残りは静かに反映) */
export const REMOTE_MAX = 6;

// ── 地球イースターエッグ ─────────────────────────────
/** 地球を何回タップしたら爆発するか */
export const EARTH_BOOM_CLICKS = 1000;
/** 爆発してから地球が再生するまで(ms) */
export const T_EARTH_BOOM = 5200;

// ── こすくまくんの吹き出し ───────────────────────────
/** セリフの既定表示時間(ms) */
export const T_SPEECH = 3200;

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
