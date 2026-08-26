/**
 * プロンプトビルダーが本当に動くかを、実際に押して確かめる。
 * 見た目だけ整っていて中身が動かない、が起きやすい所なので毎回これで見る。
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await p.setViewport({ width: 1440, height: 1000 });
await p.goto("http://localhost:3031/build", { waitUntil: "networkidle0", timeout: 90000 });

const body = () => p.$eval(".pb__body", (e) => e.textContent ?? "");
const mark = (ok) => (ok ? "OK  " : "NG  ");

const t0 = await body();
console.log(mark(t0.includes("バウハウス")), "初期表示にバウハウスが入っている");

await p.click('[data-pick="vaporwave"]');
await new Promise((r) => setTimeout(r, 400));
const t1 = await body();
console.log(mark(t1.includes("ヴェイパーウェイヴ")), "図版を押すと様式が変わる");
console.log(mark(t1.includes("#ff71ce")), "選んだ様式の色が仕様書に入る");

await p.type(".fld__in", "海辺の小さな町の朝");
await new Promise((r) => setTimeout(r, 300));
const t2 = await body();
console.log(mark(t2.includes("海辺の小さな町の朝")), "主題が仕様書に反映される");

const fmts = await p.$$(".fmt__b");
await fmts[3].click();
await new Promise((r) => setTimeout(r, 300));
const t3 = await body();
console.log(mark(t3.includes("16:9")), "判型を変えると比率が変わる");

console.log(mark(t3.includes("文字・ロゴ・透かし・署名を一切入れない")), "文字が空なら「入れない」と明示される");
await p.type('input[placeholder="COASTAL MOMENTS"]', "SEASIDE");
await new Promise((r) => setTimeout(r, 300));
const t4 = await body();
console.log(mark(t4.includes("「SEASIDE」")), "文字を入れると指示が切り替わる");

const tabs = await p.$$(".pb__tab");
await tabs[1].click();
await new Promise((r) => setTimeout(r, 300));
const t5 = await body();
console.log(mark(t5.includes("vaporwave") && t5.includes("Negative")), "English に切り替わり、除外語が付く");
console.log(mark(t5.includes("16:9")), "英語側にも比率が入る");

await p.type(".fld__q", "riso");
await new Promise((r) => setTimeout(r, 400));
const shown = await p.$$eval("[data-pick]", (els) => els.filter((e) => e.dataset.hit !== "0").length);
console.log(mark(shown > 0 && shown < 10), `語でしぼれる（"riso" で ${shown} 件）`);

console.log(errs.length ? `\n⚠ 画面のエラー:\n  ${errs.slice(0, 5).join("\n  ")}` : "\n画面のエラーなし");
console.log(`\n仕様書の長さ: ${t4.length} 文字`);
await b.close();
