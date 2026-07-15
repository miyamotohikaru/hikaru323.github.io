// 穴の刺さり状態(HOLE_COUNTビット)をbase64でやりとりするためのエンコード/デコード。
// サーバー(Node)とクライアント(ブラウザ)両方で動くこと。

import { HOLE_COUNT } from "./config";

export const MASK_BYTES = Math.ceil(HOLE_COUNT / 8);

export function emptyMask(): Uint8Array {
  return new Uint8Array(MASK_BYTES);
}

export function setBit(mask: Uint8Array, i: number): void {
  mask[i >> 3] |= 1 << (i & 7);
}

export function getBit(mask: Uint8Array, i: number): boolean {
  return (mask[i >> 3] & (1 << (i & 7))) !== 0;
}

export function countBits(mask: Uint8Array): number {
  let c = 0;
  for (let i = 0; i < mask.length; i++) {
    let v = mask[i];
    while (v) {
      v &= v - 1;
      c++;
    }
  }
  return c;
}

export function maskToBase64(mask: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(mask).toString("base64");
  }
  let bin = "";
  for (let i = 0; i < mask.length; i++) bin += String.fromCharCode(mask[i]);
  return btoa(bin);
}

export function base64ToMask(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const bin = atob(b64);
  const mask = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) mask[i] = bin.charCodeAt(i);
  return mask;
}
