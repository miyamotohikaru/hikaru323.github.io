/** slug から安定した擬似乱数の種を作る。図版が毎回同じ絵になるようにするため。 */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 0〜100 のあいだに落として、シェーダー側の hash に渡しやすくする
  return ((h >>> 0) % 100000) / 1000;
}
