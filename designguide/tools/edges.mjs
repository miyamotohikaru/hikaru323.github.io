/**
 * 和文の本文が「端まで埋まって揃っているか」を全ページ×全幅で測る。
 * 各行の右端のばらつき（最大−最小、最終行は除く）を出す。
 * 揃っていれば 0px 前後。以前は最大175pxだった。
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PATHS = ["/", "/build", "/recipes", "/style/glassmorphism", "/style/wabi-sabi", "/style/bauhaus"];
const WIDTHS = [360, 390, 430, 620, 768, 1024, 1440];
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();

const scan = () => p.evaluate(() => {
  const SEL = [".hero__lead p", ".sec__lead", ".sty__desc", ".rc__lead", ".rcp__note",
               ".fld__note", ".pb__foot", ".sa-foot__note", ".sty__fig figcaption", ".rcp__how li"];
  const out = [];
  for (const sel of SEL) for (const el of document.querySelectorAll(sel)) {
    if (!el.textContent.trim()) continue;
    const walk = (n, acc) => { for (const c of n.childNodes) {
      if (c.nodeType === 3) acc.push(c); else if (c.nodeType === 1) walk(c, acc); } return acc; };
    const rights = []; let lastTop = null, lastRight = null;
    for (const tn of walk(el, [])) {
      const t = tn.textContent; const rg = document.createRange();
      for (let i = 0; i < t.length; i++) {
        rg.setStart(tn, i); rg.setEnd(tn, i + 1);
        const rc = rg.getBoundingClientRect();
        if (rc.width === 0 && rc.height === 0) continue;
        const top = Math.round(rc.top);
        if (lastTop !== null && Math.abs(top - lastTop) > 3) rights.push(lastRight);
        lastTop = top; lastRight = rc.right;
      }
    }
    if (lastRight !== null) rights.push(lastRight);
    if (rights.length > 2) {
      const full = rights.slice(0, -1);
      out.push({ sel, ragged: Math.round(Math.max(...full) - Math.min(...full)) });
    }
  }
  return out;
});

let worst = 0; const bad = [];
for (const w of WIDTHS) {
  await p.setViewport({ width: w, height: 1200 });
  let mx = 0;
  for (const path of PATHS) {
    await p.goto(`http://localhost:3031${path}`, { waitUntil: "networkidle0", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 260));
    for (const x of await scan()) {
      mx = Math.max(mx, x.ragged);
      if (x.ragged > 12) bad.push(`${w}px ${path} ${x.sel} → ${x.ragged}px`);
    }
  }
  worst = Math.max(worst, mx);
  console.log(`${String(w).padStart(4)}px  行末のばらつき 最大 ${mx}px`);
}
if (bad.length) { console.log("\n12pxを超えた所:"); bad.slice(0, 15).forEach((x) => console.log("  ▲ " + x)); }
console.log(`\n全体の最大: ${worst}px`);
await b.close();
