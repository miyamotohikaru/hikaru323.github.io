"use client";

/**
 * 戻る動線: 一覧(索引/年表/系譜)から詳細へ飛ぶ時にスクロール位置を保存し、
 * 詳細の「もどる」ボタンで元のページ・元の位置へ復帰する。
 */

const KEY = "vja-return";
const LIST_PATHS = ["/", "/timeline", "/lineage"];

export type ReturnInfo = { path: string; y: number };

/** 一覧ページでのみ現在位置を保存（詳細→詳細の移動では上書きしない） */
export function saveReturn() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (!LIST_PATHS.includes(path)) return;
  const info: ReturnInfo = { path, y: window.scrollY };
  sessionStorage.setItem(KEY, JSON.stringify(info));
}

export function readReturn(): ReturnInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReturnInfo) : null;
  } catch {
    return null;
  }
}

export function clearReturn() {
  sessionStorage.removeItem(KEY);
}
