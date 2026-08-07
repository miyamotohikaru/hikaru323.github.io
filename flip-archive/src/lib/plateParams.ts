import type { Case } from "@/data/types";
import { seedFromString } from "./seed";

/**
 * CASEごとの作図プログラム番号。
 * 図版は共通のパターン生成器ではなく、事例ごとに別の図として描く。
 */
const PLATE_PROGRAM: Record<string, number> = {
  "fountain-duchamp": 0, // 展示室の枠と、外から中へ移された量産品
  "tenji-block": 1, // 均質な舗装の上に現れる、足裏で読める経路
  woonerf: 2, // まっすぐな車路が、屈曲と植栽で全幅へ開く
  "grameen-bank": 3, // 少数の大口が、五人一組の小さな単位へ分解される
  "wrapped-reichstag": 4, // 細部が布で伏せられ、量塊と輪郭が残る
  "bogota-mimes": 5, // 縁にいた見る側が前へ出て、判定の記号を掲げる
  "piano-stairs": 6, // 段の断面。踏面が鍵盤に置き換わる
  "g0v-taiwan": 7, // 系統樹の一文字が置き換わり、隣に別版が生える
  "love-is-in-the-bin": 8, // 額の中の一枚が、下半分だけ短冊になる
  "atm-leaderboard": 9, // 閉じた箱から数値が抜き出され、大きい順に並ぶ
};

export function plateParamsFor(c: Case) {
  return {
    seed: seedFromString(c.slug),
    plate: PLATE_PROGRAM[c.slug] ?? 0,
  };
}
