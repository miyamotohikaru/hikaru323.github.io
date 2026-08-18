// mac/Assets/kosukuma.json （公式Illustratorデータの抽出結果）から
// サイト用の src/lib/poses.ts を作り直す。
//
// なぜ生成物をコミットするか:
//   ・アプリ側の Assets を Next のバンドルに直接 import すると、
//     使わないポーズ（curled は 15KB ある）まで全部入って重くなる
//   ・mac/ 配下を触らずに済む。JSON が更新されたら `npm run poses` を叩き直すだけ
//
// 画像ファイルを一切置かないのは意図的。こすくまくんは全部 inline SVG で出す。

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "mac/Assets/kosukuma.json");
const OUT = resolve(root, "src/lib/poses.ts");
const ICON = resolve(root, "src/app/icon.svg");

// サイトで実際に使うポーズだけ。増やしたらここに足す。
// curled と lying は入れていない: パーツが「クリームの塗り → 黒の輪郭」の順に
// 何十枚も重なっていて、そのまま塗り重ねると輪郭が団子になって読めなくなる
// （アプリ側は変形をかけながら描くので成立するが、静止画のサイトでは崩れる）。
const WANTED = ["front", "side"];

const raw = JSON.parse(readFileSync(SRC, "utf8"));

const round = (n) => Number(n.toFixed(2));

const poses = {};
for (const name of WANTED) {
  const p = raw.poses[name];
  if (!p) throw new Error(`pose "${name}" が kosukuma.json にありません`);
  poses[name] = {
    w: round(p.w),
    h: round(p.h),
    // JSONの座標は「原点=バウンディングボックス中心 / Y下向き（SVG準拠）」なので、
    // viewBox を中心原点にすればパスの d をそのまま使える
    viewBox: `${round(-p.w / 2)} ${round(-p.h / 2)} ${round(p.w)} ${round(p.h)}`,
    parts: p.parts.map((part) => ({ id: part.id, d: part.d, fill: part.fill })),
  };
}

const body = `// 自動生成ファイル。直接編集しないこと。
// 作り直す: npm run poses  （元データ: mac/Assets/kosukuma.json）
//
// 座標系: 原点=バウンディングボックス中心 / Y下向き（SVGそのまま）/ 身長 ${raw.unit}

export type PosePart = { id: string; d: string; fill: string };
export type Pose = { w: number; h: number; viewBox: string; parts: PosePart[] };

/** 公式の色。SVGの塗りはこの値で固定する（ダークモードでも変えない＝キャラの色だから） */
export const COLOR = {
  cream: "${raw.cream}",
  ink: "${raw.ink}",
  mole: "#1a251f",
} as const;

export const POSES: Record<${WANTED.map((n) => `"${n}"`).join(" | ")}, Pose> = ${JSON.stringify(
  poses,
  null,
  2,
)};

export type PoseName = keyof typeof POSES;
`;

writeFileSync(OUT, body);

/* --- ファビコン -------------------------------------------------------------
   タブの中で他のサイトと並ぶので、余白を作らず正方形いっぱいに詰める。
   中身はシルエット1枚だけ。16pxまで縮むと内側の線は消えるし、
   アプリのメニューバーアイコン（AppDelegate.menuBarIcon）も同じ描き方をしている。
   -------------------------------------------------------------------------- */

const front = raw.poses.front;
const outline = front.parts.find((p) => p.id === "silhouette");
if (!outline) throw new Error("front に silhouette パーツがありません");

// 高さを100%使い切る倍率。上下は地の色に触れるまで詰まる
const k = round(100 / front.h);
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" fill="${raw.cream}"/>
<g transform="translate(50 50) scale(${k})"><path d="${outline.d}" fill="${raw.ink}"/></g>
</svg>
`;
writeFileSync(ICON, icon);

console.log(
  `✓ ${OUT}  (${WANTED.join(", ")} / ${(body.length / 1024).toFixed(1)}KB)\n` +
    `✓ ${ICON}  (${(icon.length / 1024).toFixed(1)}KB)`,
);
