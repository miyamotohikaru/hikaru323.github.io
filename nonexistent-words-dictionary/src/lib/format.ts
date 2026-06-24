// 表示用フォーマッタ

// 縦書きの見出しでは、半角ピリオド「.」などの区切り記号が文字枠の左下に寄って
// 不自然に見える（例:「こす.くま」）。縦書きで字面の中央に収まる中黒「・」へ
// 変換して見栄えを整える。データ自体は変更せず、表示時のみ適用する。
export function vDot(word: string): string {
  return word.replace(/[.·．･]/g, "・");
}

// 「定義文。。▽用例…」のように句点「。」が連続してしまう表示崩れを直す。
// 既存データの kojienFormatted には重複句点が焼き込まれているため、表示時に畳む。
export function tidyFormatted(s: string): string {
  return s.replace(/。{2,}/g, "。");
}

// 定義文＋用例を広辞苑風の本文に整形する。定義末尾の「。」が重複しないよう、
// 末尾の句点をいったん除いてから1つだけ付与する（用例があれば続けて付ける）。
export function formatKojienBody(definition: string, example: string): string {
  const def = definition.trim().replace(/。+$/, "");
  const base = def ? `${def}。` : "";
  return example ? `${base}▽用例「${example}」` : base;
}
