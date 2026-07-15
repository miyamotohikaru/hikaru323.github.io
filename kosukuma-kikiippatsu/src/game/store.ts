"use client";

// ゲーム全体の状態機械(zustand)。3Dシーン・UI・音はすべてここを読む。
// フェーズ遷移と演出タイミングの正はこのファイル。

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  COOLDOWN_SEC,
  POLL_MS,
  T_LAUNCH,
  T_NEW_ROUND,
  T_SAFE,
  T_STAB,
  T_SUSPENSE,
  T_TROPHY,
} from "@/lib/config";
import { base64ToMask, emptyMask, getBit } from "@/lib/bitmask";
import type {
  ClaimResponse,
  StabResult,
  StateResponse,
  WinnerInfo,
} from "@/lib/types";
import { emitGameEvent } from "./events";

export type Phase =
  | "boot" // 初回ロード中
  | "title" // タイトル画面
  | "idle" // 月を回して穴を選べる
  | "confirming" // 穴を選択して確認中
  | "stabbing" // 刺すアニメ中
  | "suspense" // 判定の「……」
  | "safe" // セーフ演出
  | "launch" // 発射カットシーン(勝者/観客共通)
  | "name-entry" // 勝者の名前入力
  | "trophy" // トロフィー授与式
  | "new-round"; // 新こすくまくん降臨

/** 発射カットシーンで表示する勝者情報 */
export interface LaunchInfo {
  roundNo: number; // 飛んだこすくまくんの代
  holeId: number;
  name: string | null;
  country: string | null;
  isMe: boolean;
}

interface Toast {
  id: number;
  msg: string;
}

interface GameState {
  phase: Phase;
  /** phase が変わった時刻(performance.now基準ではなく Date.now) */
  phaseAt: number;

  // ── サーバー状態(表示用) ──
  roundNo: number;
  stabCount: number;
  mask: Uint8Array;
  recent: StateResponse["recent"];
  prevWinner: WinnerInfo | null;
  connected: boolean;

  // ── 自分の操作 ──
  selectedHole: number | null;
  hoveredHole: number | null;
  cooldownUntil: number; // epoch ms
  launchInfo: LaunchInfo | null;
  claimToken: string | null;
  claimRound: number | null;
  wonName: string | null; // 授与式で刻む名前
  toast: Toast | null;
  muted: boolean;
  ready3d: boolean; // 3Dアセット読み込み完了

  // ── actions ──
  init: () => void;
  start: () => void;
  setReady3d: () => void;
  hoverHole: (id: number | null) => void;
  selectHole: (id: number) => void;
  cancelSelect: () => void;
  confirmStab: () => Promise<void>;
  submitName: (name: string) => Promise<void>;
  showToast: (msg: string) => void;
  setMuted: (m: boolean) => void;
}

// ── localStorage helpers(SSR安全) ─────────────────────
const LS = {
  get(key: string): string | null {
    try {
      return typeof window === "undefined" ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, v: string) {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* private mode等は無視 */
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

export function getFingerprint(): string {
  let fp = LS.get("kk-fp");
  if (!fp) {
    fp = nanoid(21);
    LS.set("kk-fp", fp);
  }
  return fp;
}

/**
 * デモモード(?demo=win): 刺すと必ず「当たり」になり、発射〜トロフィー授与を
 * 体験できる。サーバーには一切書き込まない(記録は残らない)。
 */
function isDemoWin(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("demo") === "win"
    );
  } catch {
    return false;
  }
}

const DEMO_TOKEN = "demo";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;
/** カットシーン中に届いた新ラウンド状態を退避しておく */
let pendingState: StateResponse | null = null;

export const useGameStore = create<GameState>((set, get) => {
  const setPhase = (phase: Phase) => set({ phase, phaseAt: Date.now() });

  /** サーバー状態を表示へ反映 */
  const applyState = (s: StateResponse) => {
    const cur = get();
    // CDNキャッシュ(stale-while-revalidate)由来の古い応答でラウンドを巻き戻さない
    if (s.roundNo < cur.roundNo) return;
    const mask = base64ToMask(s.holesBase64);
    let stabCount = s.stabCount;
    if (s.roundNo === cur.roundNo) {
      // 同一ラウンド内でビットが消えることはない。自分の刺した直後に
      // 数秒古いキャッシュ応答が来ても剣が消えないよう和集合をとる
      const old = cur.mask;
      for (let i = 0; i < mask.length && i < old.length; i++) mask[i] |= old[i];
      stabCount = Math.max(stabCount, cur.stabCount);
    }
    set({
      roundNo: s.roundNo,
      stabCount,
      mask,
      recent: s.recent,
      prevWinner: s.prevWinner,
      connected: true,
    });
  };

  /** カットシーン中に退避した最新状態があれば反映する */
  const flushPending = () => {
    if (pendingState) {
      applyState(pendingState);
      pendingState = null;
    }
  };

  /** カットシーンなど「今は画面を書き換えたくない」フェーズか */
  const inCutscene = () => {
    const p = get().phase;
    return (
      p === "stabbing" ||
      p === "suspense" ||
      p === "safe" ||
      p === "launch" ||
      p === "name-entry" ||
      p === "trophy" ||
      p === "new-round"
    );
  };

  const fetchState = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const s: StateResponse = await res.json();
      // 通信は生きている(カットシーン中でも警告は消す)
      if (!get().connected) set({ connected: true });
      const cur = get();
      if (s.roundNo > cur.roundNo && cur.roundNo > 0) {
        // 誰かが当てて新ラウンドになった
        if (cur.phase === "idle" || cur.phase === "confirming") {
          // 観客として発射カットシーンを再生
          pendingState = s;
          const w = s.prevWinner;
          set({
            selectedHole: null,
            launchInfo: w
              ? { ...w, isMe: false }
              : {
                  roundNo: s.roundNo - 1,
                  holeId: 0,
                  name: null,
                  country: null,
                  isMe: false,
                },
          });
          emitGameEvent("win-flash");
          emitGameEvent("launch");
          setPhase("launch");
          void (async () => {
            await sleep(T_LAUNCH);
            emitGameEvent("new-round");
            setPhase("new-round");
            flushPending();
            await sleep(T_NEW_ROUND);
            flushPending(); // 降臨中に届いた分も適用してからidleへ
            setPhase("idle");
          })();
          return;
        }
        if (inCutscene()) {
          pendingState = s; // 自分のカットシーン後に反映
          return;
        }
      }
      if (!inCutscene()) applyState(s);
      else {
        // カットシーン中でも件数などの軽い更新は名前反映のため保持
        pendingState = s;
      }
    } catch {
      set({ connected: false });
    }
  };

  const schedulePoll = () => {
    if (pollTimer) clearTimeout(pollTimer);
    const jitter = Math.random() * 800;
    pollTimer = setTimeout(async () => {
      if (typeof document === "undefined" || !document.hidden) {
        await fetchState();
      }
      schedulePoll();
    }, POLL_MS + jitter);
  };

  return {
    phase: "boot",
    phaseAt: 0,
    roundNo: 0,
    stabCount: 0,
    mask: emptyMask(),
    recent: [],
    prevWinner: null,
    connected: true,
    selectedHole: null,
    hoveredHole: null,
    cooldownUntil: 0,
    launchInfo: null,
    claimToken: null,
    claimRound: null,
    wonName: null,
    toast: null,
    muted: LS.get("kk-muted") === "1",
    ready3d: false,

    init: () => {
      if (initialized) return;
      initialized = true;
      const cd = Number(LS.get("kk-cooldown") || 0);
      if (cd > Date.now()) set({ cooldownUntil: cd });
      // リロードで名前未入力のまま閉じた勝者の救済
      const token = LS.get("kk-claim-token");
      const round = Number(LS.get("kk-claim-round") || 0);
      if (token && round > 0) set({ claimToken: token, claimRound: round });
      void fetchState().then(() => {
        const s = get();
        if (s.phase === "boot") setPhase("title");
        // 未クレームの勝利があれば名前入力を再表示
        if (s.claimToken && s.claimRound) {
          set({
            launchInfo: {
              roundNo: s.claimRound,
              holeId: 0,
              name: null,
              country: null,
              isMe: true,
            },
          });
          setPhase("name-entry");
        }
      });
      schedulePoll();
    },

    start: () => {
      if (get().phase !== "title") return;
      emitGameEvent("ui-tap");
      setPhase("idle");
    },

    setReady3d: () => set({ ready3d: true }),

    hoverHole: (id) => {
      const cur = get();
      if (cur.hoveredHole === id) return;
      set({ hoveredHole: id });
      if (id !== null && cur.phase === "idle") emitGameEvent("hover");
    },

    selectHole: (id) => {
      const cur = get();
      if (cur.phase !== "idle") return;
      if (getBit(cur.mask, id)) {
        cur.showToast("そこは もう刺さってるよ！");
        emitGameEvent("error");
        return;
      }
      if (!isDemoWin() && cur.cooldownUntil > Date.now()) {
        const sec = Math.ceil((cur.cooldownUntil - Date.now()) / 1000);
        cur.showToast(`つぎに刺せるまで あと${sec}びょう`);
        emitGameEvent("error");
        return;
      }
      emitGameEvent("ui-tap");
      set({ selectedHole: id });
      setPhase("confirming");
    },

    cancelSelect: () => {
      if (get().phase !== "confirming") return;
      emitGameEvent("ui-tap");
      set({ selectedHole: null });
      setPhase("idle");
    },

    confirmStab: async () => {
      const cur = get();
      if (cur.phase !== "confirming" || cur.selectedHole === null) return;
      const holeId = cur.selectedHole;
      const body = JSON.stringify({
        holeId,
        roundNo: cur.roundNo,
        fp: getFingerprint(),
      });

      // 演出とAPIを並走させる。回線ハングでsuspenseに閉じ込められないよう
      // タイムアウトを付ける(非対応ブラウザではブラウザ既定に任せる)
      const timeoutSignal =
        typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
          ? AbortSignal.timeout(12000)
          : undefined;
      const resultPromise: Promise<StabResult> = isDemoWin()
        ? Promise.resolve<StabResult>({
            // デモ: サーバーを呼ばず必ず当たり(記録は残らない)
            result: "win",
            holeId,
            claimToken: DEMO_TOKEN,
            roundNo: cur.roundNo,
          })
        : fetch("/api/stab", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            signal: timeoutSignal,
          })
            .then((r) => r.json() as Promise<StabResult>)
            .catch(() => ({ result: "error", message: "つうしんエラー" }));

      setPhase("stabbing");
      emitGameEvent("sword-raise");
      setTimeout(() => emitGameEvent("thrust"), T_STAB * 0.55);
      setTimeout(() => {
        emitGameEvent("impact");
        setPhase("suspense");
        emitGameEvent("suspense");
      }, T_STAB);

      const [result] = await Promise.all([
        resultPromise,
        sleep(T_STAB + T_SUSPENSE),
      ]);

      switch (result.result) {
        case "safe": {
          const until = Date.now() + COOLDOWN_SEC * 1000;
          LS.set("kk-cooldown", String(until));
          set({
            mask: base64ToMask(result.holesBase64),
            stabCount: result.stabCount,
            cooldownUntil: until,
            selectedHole: null,
          });
          emitGameEvent("safe");
          setPhase("safe");
          await sleep(T_SAFE);
          flushPending();
          setPhase("idle");
          break;
        }
        case "win": {
          if (result.claimToken !== DEMO_TOKEN) {
            // デモの当たりはリロード復元の対象にしない
            LS.set("kk-claim-token", result.claimToken);
            LS.set("kk-claim-round", String(result.roundNo));
          }
          set({
            claimToken: result.claimToken,
            claimRound: result.roundNo,
            selectedHole: null,
            launchInfo: {
              roundNo: result.roundNo,
              holeId,
              name: null,
              country: null,
              isMe: true,
            },
          });
          emitGameEvent("win-flash");
          emitGameEvent("launch");
          setPhase("launch");
          await sleep(T_LAUNCH);
          setPhase("name-entry");
          break;
        }
        case "taken":
          set({
            mask: base64ToMask(result.holesBase64),
            selectedHole: null,
          });
          get().showToast("いちあしちがいで もう刺さってた！");
          emitGameEvent("error");
          flushPending();
          setPhase("idle");
          break;
        case "cooldown": {
          // サーバー判定のクールダウンをローカルにも反映(ピル表示と再打診防止)
          const until = Date.now() + result.remainingSec * 1000;
          LS.set("kk-cooldown", String(until));
          set({ selectedHole: null, cooldownUntil: until });
          get().showToast(
            `つぎに刺せるまで あと${result.remainingSec}びょう`
          );
          emitGameEvent("error");
          flushPending();
          setPhase("idle");
          break;
        }
        case "stale":
          set({ selectedHole: null });
          get().showToast("あたらしい こすくまくんが きたよ！");
          emitGameEvent("error");
          await fetchState();
          flushPending(); // suspense中の取得は退避されるので明示的に適用
          setPhase("idle");
          break;
        default:
          set({ selectedHole: null });
          get().showToast(result.message || "エラーがおきたよ");
          emitGameEvent("error");
          flushPending();
          setPhase("idle");
      }
    },

    submitName: async (name: string) => {
      const cur = get();
      if (cur.phase !== "name-entry" || !cur.claimToken || !cur.claimRound)
        return;
      const trimmed = name.trim().slice(0, 12) || "ななし";

      // デモの当たり: サーバーへ書き込まず授与式だけ体験する
      if (cur.claimToken === DEMO_TOKEN) {
        set({
          claimToken: null,
          claimRound: null,
          wonName: trimmed,
          launchInfo: cur.launchInfo
            ? { ...cur.launchInfo, name: trimmed }
            : null,
        });
        emitGameEvent("fanfare");
        emitGameEvent("trophy");
        setPhase("trophy");
        get().showToast("デモモードだから きろくには のこらないよ");
        await sleep(T_TROPHY);
        emitGameEvent("new-round");
        setPhase("new-round");
        await sleep(T_NEW_ROUND);
        flushPending();
        setPhase("idle");
        return;
      }

      try {
        const timeoutSignal =
          typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
            ? AbortSignal.timeout(12000)
            : undefined;
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundNo: cur.claimRound,
            token: cur.claimToken,
            name: trimmed,
          }),
          signal: timeoutSignal,
        });
        const data: ClaimResponse = await res.json();

        if (!data.ok) {
          if (data.code === "bad-token") {
            // もう成功しない(記録が消えた等)。トークンを片付けて静かに復帰
            LS.del("kk-claim-token");
            LS.del("kk-claim-round");
            set({ claimToken: null, claimRound: null, launchInfo: null });
            get().showToast(
              data.message || "きろくが見つからなかった…ごめんね"
            );
            emitGameEvent("error");
            await fetchState();
            flushPending();
            setPhase("idle");
            return;
          }
          // 名前NG・サーバーエラーは再入力/再送のチャンスを残す(トークン保持)
          get().showToast(data.message || "そのなまえは つかえないよ");
          emitGameEvent("error");
          return;
        }

        const finalName = data.name || trimmed;
        LS.del("kk-claim-token");
        LS.del("kk-claim-round");
        set({
          claimToken: null,
          claimRound: null,
          wonName: finalName,
          launchInfo: cur.launchInfo
            ? { ...cur.launchInfo, name: finalName }
            : null,
        });
        emitGameEvent("fanfare");
        emitGameEvent("trophy");
        setPhase("trophy");
        await sleep(T_TROPHY);
        emitGameEvent("new-round");
        setPhase("new-round");
        flushPending();
        if (get().roundNo <= (cur.claimRound ?? 0)) {
          // 退避が無かった/古かった場合は取り直してから適用
          await fetchState();
          flushPending();
        }
        await sleep(T_NEW_ROUND);
        flushPending(); // 降臨中に届いた分も適用してからidleへ
        setPhase("idle");
      } catch {
        get().showToast("つうしんエラー。もういちどためしてね");
      }
    },

    showToast: (msg: string) => {
      const id = Date.now();
      set({ toast: { id, msg } });
      setTimeout(() => {
        if (get().toast?.id === id) set({ toast: null });
      }, 3200);
    },

    setMuted: (m: boolean) => {
      LS.set("kk-muted", m ? "1" : "0");
      set({ muted: m });
    },
  };
});
