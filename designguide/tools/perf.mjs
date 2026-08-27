/** 一覧の重さを測る。80枚のSVGを同時に置いて描けるのかの確認 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1000 });
const t0 = Date.now();
await p.goto("http://localhost:3031/", { waitUntil: "networkidle0", timeout: 120000 });
const loaded = Date.now() - t0;

const m = await p.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const paints = Object.fromEntries(performance.getEntriesByType("paint").map((x) => [x.name, Math.round(x.startTime)]));
  return {
    domInteractive: Math.round(nav.domInteractive),
    domComplete: Math.round(nav.domComplete),
    paints,
    svg: document.querySelectorAll("svg").length,
    svgNodes: document.querySelectorAll("svg *").length,
    cards: document.querySelectorAll("[data-card]").length,
    js: performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".js"))
      .reduce((a, r) => a + (r.encodedBodySize || 0), 0),
  };
});

// 下までスクロールして描き切れるか（図版は全部サーバ描画なので、ここで詰まると本番でも詰まる）
const t1 = Date.now();
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 800) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
const scrolled = Date.now() - t1;

console.log(`読み込み完了まで        ${loaded} ms`);
console.log(`domInteractive          ${m.domInteractive} ms`);
console.log(`domComplete             ${m.domComplete} ms`);
console.log(`first-contentful-paint  ${m.paints["first-contentful-paint"]} ms`);
console.log(`最下部までスクロール    ${scrolled} ms`);
console.log(`SVG                     ${m.svg} 枚 / 要素 ${m.svgNodes} 個`);
console.log(`カード                  ${m.cards} 枚`);
console.log(`JS転送量                ${(m.js / 1024).toFixed(1)} KB`);
await b.close();
