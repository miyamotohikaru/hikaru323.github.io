/**
 * 触れるか・読めるかの確認。
 * 目で見て綺麗でも、キーボードで辿れない／読み上げに出ない、が起きやすい。
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
const mark = (ok) => (ok ? "OK  " : "NG  ");

for (const path of ["/", "/build", "/recipes", "/style/bauhaus"]) {
  await p.goto("http://localhost:3031" + path, { waitUntil: "networkidle0", timeout: 90000 });
  const r = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const svgs = [...document.querySelectorAll("svg")];
    const btns = [...document.querySelectorAll("button")];
    const h1 = document.querySelectorAll("h1").length;
    return {
      lang: document.documentElement.lang,
      h1,
      imgNoAlt: imgs.filter((i) => i.alt === null || i.alt === undefined).length,
      imgNoSize: imgs.filter((i) => !i.width || !i.height).length,
      svgNoLabel: svgs.filter((s) => !s.getAttribute("role") && !s.getAttribute("aria-hidden") && s.closest("[aria-hidden]") === null).length,
      btnNoName: btns.filter((x) => !x.textContent.trim() && !x.getAttribute("aria-label") && !x.title).length,
      links: document.querySelectorAll("a[href]").length,
    };
  });
  console.log(`--- ${path}`);
  console.log(` ${mark(r.lang === "ja")}lang=${r.lang}`);
  console.log(` ${mark(r.h1 === 1)}h1 は ${r.h1} 個`);
  console.log(` ${mark(r.imgNoAlt === 0)}alt のない画像 ${r.imgNoAlt} 件`);
  console.log(` ${mark(r.imgNoSize === 0)}寸法のない画像 ${r.imgNoSize} 件（版ずれの原因）`);
  console.log(` ${mark(r.svgNoLabel === 0)}role も aria-hidden も無いSVG ${r.svgNoLabel} 件`);
  console.log(` ${mark(r.btnNoName === 0)}名前のないボタン ${r.btnNoName} 件`);
}

// キーボードで辿れるか
await p.goto("http://localhost:3031/", { waitUntil: "networkidle0" });
const reached = [];
for (let i = 0; i < 14; i++) {
  await p.keyboard.press("Tab");
  reached.push(await p.evaluate(() => {
    const a = document.activeElement;
    return a ? `${a.tagName.toLowerCase()}:${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 14)}` : "-";
  }));
}
console.log("\n--- Tabキーで辿れる順（先頭14）");
console.log(" " + reached.join(" → "));
await b.close();
