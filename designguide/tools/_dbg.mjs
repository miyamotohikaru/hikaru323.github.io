import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1100 });
await p.goto("http://localhost:3031/style/glassmorphism", { waitUntil: "networkidle0", timeout: 60000 });
const r = await p.evaluate(() => {
  const el = document.querySelector(".sty__desc");
  const box = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    width: Math.round(box.width),
    font: cs.fontSize,
    maxWidth: cs.maxWidth,
    lines: [...el.querySelectorAll(".jp-l")].map((s) => ({
      w: Math.round(s.getBoundingClientRect().width),
      h: Math.round(s.getBoundingClientRect().height),
      t: s.textContent,
    })),
  };
});
console.log(`欄の幅 ${r.width}px  字 ${r.font}  max-width ${r.maxWidth}`);
r.lines.forEach((l) => console.log(`  [${String(l.t.length).padStart(2)}字 ${String(l.w).padStart(3)}px h${l.h}] ${l.t}`));
await b.close();
