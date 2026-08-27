/**
 * 全ページ×複数の幅で、和文の行末を一気に見る。
 * 携帯だけの改行を入れると、閾値のすぐ上（621〜900px）で
 * 逆に行が長くなって割れることがあるので、そこも必ず見る。
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PATHS = ["/", "/build", "/recipes", "/style/bauhaus", "/style/vaporwave", "/style/wabi-sabi"];
const WIDTHS = [320, 360, 390, 430, 540, 620, 640, 768, 900, 1024, 1280, 1440, 1920];

const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();

const scan = async () =>
  p.evaluate(() => {
    const hasJa = (s) => /[ぁ-んァ-ヶ一-龥]/.test(s);
    const nodes = [];
    const walk = (el) => {
      for (const c of el.childNodes) {
        if (c.nodeType === 3 && hasJa(c.textContent) && c.textContent.trim().length > 6) {
          const par = c.parentElement;
          if (par && !par.closest("svg") && !par.closest("pre") && !par.closest("code")
              && getComputedStyle(par).display !== "none") nodes.push(c);
        } else if (c.nodeType === 1) walk(c);
      }
    };
    walk(document.body);
    const CLOSERS = "。、）」』】〉》・ー…！？：；";
    const bad = [];
    for (const n of nodes) {
      const t = n.textContent;
      const r = document.createRange();
      const lines = []; let cur = ""; let lastTop = null;
      for (let i = 0; i < t.length; i++) {
        r.setStart(n, i); r.setEnd(n, i + 1);
        const rect = r.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) { cur += t[i]; continue; }
        const top = Math.round(rect.top);
        if (lastTop !== null && Math.abs(top - lastTop) > 3) { lines.push(cur); cur = ""; }
        cur += t[i]; lastTop = top;
      }
      if (cur) lines.push(cur);
      for (let i = 0; i < lines.length - 1; i++) {
        const l = lines[i].trim();
        if (l && !CLOSERS.includes(l[l.length - 1])) {
          bad.push(`${(n.parentElement.className || n.parentElement.tagName).toString().split(" ")[0]}｜${l}`);
        }
      }
    }
    return bad;
  });

let total = 0;
for (const w of WIDTHS) {
  await p.setViewport({ width: w, height: 1100 });
  const row = [];
  for (const path of PATHS) {
    await p.goto(`http://localhost:3031${path}`, { waitUntil: "networkidle0", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 260));
    const bad = await scan();
    total += bad.length;
    row.push(`${path}=${bad.length}`);
    if (bad.length) bad.forEach((x) => console.log(`   ${w}px ${path}  ▲ ${x}`));
  }
  console.log(`${String(w).padStart(4)}px  ${row.join("  ")}`);
}
console.log(`\n合計の割れ: ${total} 箇所`);
await b.close();
