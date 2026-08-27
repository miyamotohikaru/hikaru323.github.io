/**
 * src/plates/*.tsx と src/data/entries/*.ts を読み、索引を書き出す。
 *
 * 図版と解説は1スタイル1ファイル。80人がかりで同時に書いても衝突しないよう、
 * 索引だけを機械が作る。中身を足したら必ずこれを走らせる。
 *   node tools/gen-index.mjs
 */
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const platesDir = join(root, "src/plates");
const entriesDir = join(root, "src/data/entries");
mkdirSync(entriesDir, { recursive: true });

const list = (dir, ext) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(ext) && !f.startsWith("index."))
        .map((f) => f.slice(0, -ext.length))
        .sort()
    : [];

const plates = list(platesDir, ".tsx");
const entries = list(entriesDir, ".ts");

const ident = (s) => "_" + s.replace(/-/g, "_");

writeFileSync(
  join(platesDir, "index.ts"),
  `// 自動生成。手で書き換えない。→ node tools/gen-index.mjs
import type { ComponentType } from "react";
import type { PlateProps } from "@/lib/plate";
${plates.map((s) => `import ${ident(s)} from "./${s}";`).join("\n")}

export const PLATES: Record<string, ComponentType<PlateProps>> = {
${plates.map((s) => `  "${s}": ${ident(s)},`).join("\n")}
};

export const PLATE_SLUGS = Object.keys(PLATES);
`,
  "utf8",
);

writeFileSync(
  join(entriesDir, "..", "entries.ts"),
  `// 自動生成。手で書き換えない。→ node tools/gen-index.mjs
import type { DesignStyle } from "./types";
${entries.map((s) => `import { style as ${ident(s)} } from "./entries/${s}";`).join("\n")}

export const ENTRIES: Record<string, DesignStyle> = {
${entries.map((s) => `  "${s}": ${ident(s)},`).join("\n")}
};
`,
  "utf8",
);

console.log(`plates  ${plates.length} 枚`);
console.log(`entries ${entries.length} 件`);
const missingPlate = entries.filter((s) => !plates.includes(s));
const missingEntry = plates.filter((s) => !entries.includes(s));
if (missingPlate.length) console.log(`図版なし: ${missingPlate.join(", ")}`);
if (missingEntry.length) console.log(`解説なし: ${missingEntry.join(", ")}`);
