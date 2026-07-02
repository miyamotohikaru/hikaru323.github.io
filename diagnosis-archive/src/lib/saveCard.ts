import type { Card, Lang } from "@/data/cards";
import { pickGlyph } from "@/components/CardIcon";
import { REGION_LABELS, STATUS_META, cardText, yearLabel } from "@/lib/meta";

const INK = "#252a4a";
const PAPER = "#f3f0e6";
const ACCENT = "#e4506e";
const MUTED = "#70738a";
const LINE = "#c9c5b6";

/** 日本語対応の文字単位折り返し */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) return lines;
    } else {
      line += ch;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && ctx.measureText(text).width > maxWidth * maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…";
  }
  return lines;
}

/** アーカイブカードをPNGとして書き出す */
export async function saveCardPng(card: Card, lang: Lang): Promise<void> {
  const t = cardText(card, lang);
  const W = 340;
  const H = 470;
  const SHADOW = 9;
  const S = 3; // 解像度

  await Promise.all([
    document.fonts.load('italic 600 30px "Playfair Display"'),
    document.fonts.load('700 24px "Shippori Mincho"'),
    document.fonts.load('500 11px "IBM Plex Mono"'),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(S, S);

  const cw = W - SHADOW;
  const ch = H - SHADOW;

  // ピンクのハードシャドウ → 紙面 → インク枠
  ctx.fillStyle = ACCENT;
  ctx.fillRect(SHADOW, SHADOW, cw, ch);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(1.25, 1.25, cw - 2.5, ch - 2.5);

  const P = 22;

  // № と年
  ctx.fillStyle = ACCENT;
  ctx.font = 'italic 600 28px "Playfair Display", serif';
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`№${card.num}`, P, P + 26);
  ctx.fillStyle = INK;
  ctx.font = '500 11px "IBM Plex Mono", monospace';
  ctx.textAlign = "right";
  ctx.fillText(yearLabel(card), cw - P, P + 22);
  ctx.textAlign = "left";

  // ハーフトーン
  const cx = cw / 2;
  const cy = 158;
  const R = 74;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = ACCENT;
  for (let gx = cx - R; gx <= cx + R; gx += 6.5) {
    for (let gy = cy - R; gy <= cy + R; gy += 6.5) {
      const d = Math.hypot(gx - cx, gy - cy);
      if (d < R) {
        const r = Math.max(0.35, 2.7 * (1 - d / R));
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // グリフ
  const glyph = pickGlyph(card);
  const gs = 96;
  ctx.save();
  ctx.translate(cx - gs / 2, cy - gs / 2);
  ctx.scale(gs / 24, gs / 24);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const p of glyph.paths) {
    const path = new Path2D(p.d);
    if (p.filled) ctx.fill(path);
    else ctx.stroke(path);
  }
  ctx.restore();

  // 罫線・英語名・和名
  let y = 262;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(P, y);
  ctx.lineTo(cw - P, y);
  ctx.stroke();

  y += 20;
  ctx.fillStyle = MUTED;
  ctx.font = '500 9px "IBM Plex Mono", monospace';
  const en = t.enName.toUpperCase();
  ctx.fillText(en.length > 40 ? en.slice(0, 39) + "…" : en, P, y);

  y += 10;
  ctx.fillStyle = INK;
  ctx.font = '700 23px "Shippori Mincho", serif';
  const nameLines = wrapText(ctx, t.name, cw - P * 2, 2);
  for (const line of nameLines) {
    y += 30;
    ctx.fillText(line, P, y);
  }

  // 要約
  y += 22;
  ctx.fillStyle = MUTED;
  ctx.font = '400 11.5px "Hiragino Kaku Gothic ProN", sans-serif';
  const meaningLines = wrapText(ctx, t.meaning, cw - P * 2, nameLines.length > 1 ? 2 : 3);
  for (const line of meaningLines) {
    ctx.fillText(line, P, y);
    y += 18;
  }

  // フッター
  const fy = ch - 34;
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(P, fy);
  ctx.lineTo(cw - P, fy);
  ctx.stroke();
  ctx.font = '500 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = ACCENT;
  ctx.fillText("−", P, fy + 20);
  ctx.fillStyle = INK;
  ctx.fillText(STATUS_META[card.cat].label[lang], P + 14, fy + 20);
  ctx.fillStyle = ACCENT;
  ctx.textAlign = "right";
  ctx.fillText(REGION_LABELS[card.region][lang], cw - P, fy + 20);
  ctx.textAlign = "left";

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `diagnosis-archive_${card.id}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      resolve();
    }, "image/png");
  });
}
