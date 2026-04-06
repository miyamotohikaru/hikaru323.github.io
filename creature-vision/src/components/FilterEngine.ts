// FilterEngine.ts
// Pixel-level RGBA canvas filter implementations for Creature Vision
// All filters operate on Canvas ImageData via getImageData / putImageData
// Some filters use ctx directly for compositing operations

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Sobel edge detection; returns a Float32Array of magnitudes (0-255 range) */
function sobelMagnitude(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const mag = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const lum = (px: number, py: number) => {
        const i = (py * width + px) * 4;
        return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      };
      const tl = lum(x - 1, y - 1), tm = lum(x, y - 1), tr = lum(x + 1, y - 1);
      const ml = lum(x - 1, y),               mr = lum(x + 1, y);
      const bl = lum(x - 1, y + 1), bm = lum(x, y + 1), br = lum(x + 1, y + 1);
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
      mag[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return mag;
}

/** Apply vignette darkening to ImageData in-place. */
function applyVignette(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  innerR: number,
  outerR: number,
  vigColor: [number, number, number]
): void {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy);
  const inner = innerR * maxR;
  const outer = outerR * maxR;
  const span = outer - inner || 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= inner) continue;
      const t = Math.min((dist - inner) / span, 1);
      const i = (y * width + x) * 4;
      data[i]     = clamp(data[i]     + (vigColor[0] - data[i])     * t);
      data[i + 1] = clamp(data[i + 1] + (vigColor[1] - data[i + 1]) * t);
      data[i + 2] = clamp(data[i + 2] + (vigColor[2] - data[i + 2]) * t);
    }
  }
}

/** Simple box blur, returns new Uint8ClampedArray */
function boxBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  const r = Math.max(1, radius | 0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sr = 0, sg = 0, sb = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const ni = (ny * width + nx) * 4;
          sr += data[ni]; sg += data[ni + 1]; sb += data[ni + 2];
          count++;
        }
      }
      const oi = (y * width + x) * 4;
      out[oi]     = sr / count;
      out[oi + 1] = sg / count;
      out[oi + 2] = sb / count;
      out[oi + 3] = data[oi + 3];
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Context-based filter type (filters that need ctx directly)
// ---------------------------------------------------------------------------
type CtxFilter = (ctx: CanvasRenderingContext2D, w: number, h: number, fp: Record<string, unknown>) => void;

// ---------------------------------------------------------------------------
// ImageData-based filter implementations
// ---------------------------------------------------------------------------

// 1. Human vision (baseline - no modification)
function filterHuman(
  _data: Uint8ClampedArray,
  _width: number,
  _height: number,
  _fp: Record<string, unknown>
): void {
  // intentionally empty - return image unmodified
}

// 3. Dichromatic / 2-colour vision
function filterDichro(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const channels = (fp.channels as [[number, number, number], [number, number, number]]) ??
    [[255, 200, 0], [0, 100, 255]];
  const vig = fp.vig as [number, number, [number, number, number]] | undefined;
  const ch0 = channels[0];
  const ch1 = channels[1];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const warm = (r * 0.7 + g * 0.3) / 255;
    const cool = (g * 0.3 + b * 0.7) / 255;
    data[i]     = clamp(warm * ch0[0] + cool * ch1[0]);
    data[i + 1] = clamp(warm * ch0[1] + cool * ch1[1]);
    data[i + 2] = clamp(warm * ch0[2] + cool * ch1[2]);
  }

  if (vig) applyVignette(data, width, height, vig[0], vig[1], vig[2]);
}

// 8. Motion detection
function filterMotion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const movR  = (fp.movR  as number) ?? 0;
  const movG  = (fp.movG  as number) ?? 255;
  const movB  = (fp.movB  as number) ?? 80;
  const bgDim = (fp.bgDim as number) ?? 0.15;
  const bgR   = (fp.bgR   as number) ?? 0;
  const bgG   = (fp.bgG   as number) ?? 20;
  const bgB   = (fp.bgB   as number) ?? 0;

  const mag = sobelMagnitude(data, width, height);
  const threshold = 30;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx  = (y * width + x) * 4;
      const edge = mag[y * width + x];

      if (edge > threshold) {
        const strength = Math.min(edge / 255, 1);
        data[idx]     = clamp(movR * strength);
        data[idx + 1] = clamp(movG * strength);
        data[idx + 2] = clamp(movB * strength);
      } else {
        data[idx]     = clamp(data[idx]     * bgDim + bgR);
        data[idx + 1] = clamp(data[idx + 1] * bgDim + bgG);
        data[idx + 2] = clamp(data[idx + 2] * bgDim + bgB);
      }
    }
  }
}

// 9. Sharp / raptor vision
function filterSharp(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const saturation = (fp.saturation as number) ?? 1.8;
  const sharpness  = (fp.sharpness  as number) ?? 2.0;
  const fovea      = (fp.fovea      as number) ?? 0.25;

  // Saturation boost
  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    s = Math.min(1, s * saturation);
    const [nr, ng, nb] = hslToRgb(h, s, l);
    data[i]     = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  // Unsharp mask
  const blurred = boxBlur(data, width, height, 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = clamp(data[i]     + (data[i]     - blurred[i])     * sharpness);
    data[i + 1] = clamp(data[i + 1] + (data[i + 1] - blurred[i + 1]) * sharpness);
    data[i + 2] = clamp(data[i + 2] + (data[i + 2] - blurred[i + 2]) * sharpness);
  }

  // Foveal zoom: magnify centre circle (1.5x)
  if (fovea > 0) {
    const cx = width  / 2;
    const cy = height / 2;
    const fovRadius = fovea * Math.min(cx, cy);
    const zoomFactor = 1.5;
    const snapshot = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > fovRadius) continue;

        const sx = cx + dx / zoomFactor;
        const sy = cy + dy / zoomFactor;

        const x0 = sx | 0, y0 = sy | 0;
        const x1 = Math.min(x0 + 1, width  - 1);
        const y1 = Math.min(y0 + 1, height - 1);
        const fx = sx - x0, fy = sy - y0;

        const i00 = (y0 * width + x0) * 4;
        const i10 = (y0 * width + x1) * 4;
        const i01 = (y1 * width + x0) * 4;
        const i11 = (y1 * width + x1) * 4;

        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          data[idx + c] = clamp(
            snapshot[i00 + c] * (1 - fx) * (1 - fy) +
            snapshot[i10 + c] *      fx  * (1 - fy) +
            snapshot[i01 + c] * (1 - fx) *      fy  +
            snapshot[i11 + c] *      fx  *      fy
          );
        }
      }
    }
  }
}

// 11. Sonar / echolocation
function filterSonar(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const tint      = (fp.tint      as [number, number, number]) ?? [0, 255, 200];
  const bg        = (fp.bg        as [number, number, number]) ?? [0, 10, 20];
  const ringColor = (fp.ringColor as [number, number, number]) ?? [0, 180, 255];
  const ringGap   = (fp.ringGap   as number) ?? 40;

  const mag = sobelMagnitude(data, width, height);
  const maxMag = 255 * 4;
  const cx = width  / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const edge = Math.min(mag[y * width + x] / maxMag * 4, 1);

      let r = bg[0] + (tint[0] - bg[0]) * edge;
      let g = bg[1] + (tint[1] - bg[1]) * edge;
      let b = bg[2] + (tint[2] - bg[2]) * edge;

      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const ring = (Math.sin((dist / ringGap) * Math.PI) * 0.5 + 0.5) * 0.25;
      r = clamp(r + ringColor[0] * ring);
      g = clamp(g + ringColor[1] * ring);
      b = clamp(b + ringColor[2] * ring);

      data[idx]     = clamp(r);
      data[idx + 1] = clamp(g);
      data[idx + 2] = clamp(b);
    }
  }
}

// 12. Compound eye / hexagonal mosaic
function filterCompound(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const hexSize = (fp.hexSize as number) ?? 12;
  const uvShift = (fp.uvShift as number) ?? 0.05;
  const gridOpacity = (fp.gridOpacity as number) ?? 0.4;
  const barrel = (fp.barrel as boolean) ?? false;

  // If barrel distortion is requested, apply it first
  if (barrel) {
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const k = 0.3; // barrel distortion strength
    const snapshot = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - cx) / maxR;
        const dy = (y - cy) / maxR;
        const r2 = dx * dx + dy * dy;
        const distort = 1 + k * r2;
        const sx = cx + dx * distort * maxR;
        const sy = cy + dy * distort * maxR;

        const idx = (y * width + x) * 4;
        if (sx >= 0 && sx < width - 1 && sy >= 0 && sy < height - 1) {
          const x0 = sx | 0, y0 = sy | 0;
          const x1 = x0 + 1, y1 = y0 + 1;
          const fx = sx - x0, fy = sy - y0;
          const i00 = (y0 * width + x0) * 4;
          const i10 = (y0 * width + x1) * 4;
          const i01 = (y1 * width + x0) * 4;
          const i11 = (y1 * width + x1) * 4;
          for (let c = 0; c < 3; c++) {
            data[idx + c] = clamp(
              snapshot[i00 + c] * (1 - fx) * (1 - fy) +
              snapshot[i10 + c] *      fx  * (1 - fy) +
              snapshot[i01 + c] * (1 - fx) *      fy  +
              snapshot[i11 + c] *      fx  *      fy
            );
          }
        } else {
          data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0;
        }
      }
    }
  }

  // Hex grid math
  const hexHeight = hexSize * Math.sqrt(3);
  const colStep   = hexSize * 1.5;
  const rowStep   = hexHeight;

  const out = new Uint8ClampedArray(data.length);
  for (let i = 3; i < data.length; i += 4) out[i] = 255;

  const cols = Math.ceil(width  / colStep) + 2;
  const rows = Math.ceil(height / rowStep) + 2;

  const hexAccR = new Float32Array(rows * cols);
  const hexAccG = new Float32Array(rows * cols);
  const hexAccB = new Float32Array(rows * cols);
  const hexCnt  = new Uint32Array(rows * cols);

  function nearestHex(px: number, py: number): [number, number] {
    const col = Math.round(px / colStep);
    const colOffset = col % 2 === 0 ? 0 : rowStep / 2;
    const row = Math.round((py - colOffset) / rowStep);
    return [row, col];
  }

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const [hr, hc] = nearestHex(px, py);
      const rc = hr + 1;
      const cc = hc + 1;
      if (rc < 0 || rc >= rows || cc < 0 || cc >= cols) continue;
      const key = rc * cols + cc;
      const idx = (py * width + px) * 4;
      hexAccR[key] += data[idx];
      hexAccG[key] += data[idx + 1];
      hexAccB[key] += data[idx + 2];
      hexCnt[key]++;
    }
  }

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const [hr, hc] = nearestHex(px, py);
      const rc = hr + 1;
      const cc = hc + 1;
      if (rc < 0 || rc >= rows || cc < 0 || cc >= cols) continue;
      const key = rc * cols + cc;
      const cnt = hexCnt[key] || 1;
      const r = hexAccR[key] / cnt;
      const g = hexAccG[key] / cnt;
      const b = hexAccB[key] / cnt;

      let [h, s, l] = rgbToHsl(r, g, b);
      h = (h + uvShift) % 1;
      const [nr, ng, nb] = hslToRgb(h, s, l);

      const idx = (py * width + px) * 4;
      out[idx]     = nr;
      out[idx + 1] = ng;
      out[idx + 2] = nb;
      out[idx + 3] = 255;
    }
  }

  if (gridOpacity > 0) {
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const [hr, hc] = nearestHex(px, py);
        let isBorder = false;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nx = px + dx, ny = py + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const [nr2, nc2] = nearestHex(nx, ny);
          if (nr2 !== hr || nc2 !== hc) { isBorder = true; break; }
        }
        if (isBorder) {
          const idx = (py * width + px) * 4;
          out[idx]     = clamp(out[idx]     * (1 - gridOpacity));
          out[idx + 1] = clamp(out[idx + 1] * (1 - gridOpacity));
          out[idx + 2] = clamp(out[idx + 2] * (1 - gridOpacity));
        }
      }
    }
  }

  data.set(out);
}

// 15. Ultra low resolution
function filterLowres(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const pixelCount = (fp.pixels   as number)  ?? 32;
  const levels     = (fp.levels   as number)  ?? 4;
  const tint       = fp.tint as [number, number, number] | undefined;
  const vigIn      = (fp.vigIn    as number)  ?? 0.6;
  const vigOut     = (fp.vigOut   as number)  ?? 1.0;
  const pixelate   = (fp.pixelate as boolean) ?? true;

  const blockW = Math.max(1, Math.round(width  / pixelCount));
  const blockH = Math.max(1, Math.round(blockW * height / width));

  const cols = Math.ceil(width  / blockW);
  const rows = Math.ceil(height / blockH);
  const downR = new Float32Array(cols * rows);
  const downG = new Float32Array(cols * rows);
  const downB = new Float32Array(cols * rows);
  const downC = new Uint32Array(cols * rows);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const col = (x / blockW) | 0;
      const row = (y / blockH) | 0;
      const k   = row * cols + col;
      const i   = (y * width + x) * 4;
      downR[k] += data[i]; downG[k] += data[i + 1]; downB[k] += data[i + 2];
      downC[k]++;
    }
  }

  function quantize(v: number): number {
    const step = 255 / (levels - 1);
    return Math.round(Math.round(v / step) * step);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const col = (x / blockW) | 0;
      const row = (y / blockH) | 0;
      const k   = row * cols + col;
      const cnt = downC[k] || 1;
      let r = quantize(downR[k] / cnt);
      let g = quantize(downG[k] / cnt);
      let b = quantize(downB[k] / cnt);
      if (tint) {
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        r = clamp(lum * tint[0]);
        g = clamp(lum * tint[1]);
        b = clamp(lum * tint[2]);
      }
      const i = (y * width + x) * 4;
      data[i]     = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  applyVignette(data, width, height, vigIn, vigOut, [0, 0, 0]);
}

// 16. Monochromatic / 1-colour vision
function filterMono(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const tint = (fp.tint as [number, number, number]) ?? [255, 220, 180];
  const boost = (fp.boost as number) ?? 1.0;
  const vig = fp.vig as [number, number, [number, number, number]] | undefined;

  for (let i = 0; i < data.length; i += 4) {
    const lum = clamp((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * boost) / 255;
    data[i]     = clamp(lum * tint[0]);
    data[i + 1] = clamp(lum * tint[1]);
    data[i + 2] = clamp(lum * tint[2]);
  }

  if (vig) applyVignette(data, width, height, vig[0], vig[1], vig[2]);

  // Water caustics: semi-transparent random ellipses
  const cx = width / 2, cy = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Caustic pattern using layered sine waves
      const c1 = Math.sin(x * 0.03 + y * 0.02) * Math.cos(y * 0.04 - x * 0.01);
      const c2 = Math.sin(x * 0.05 - y * 0.03) * Math.cos(x * 0.02 + y * 0.05);
      const caustic = (c1 + c2) * 0.5;
      if (caustic > 0.3) {
        const intensity = (caustic - 0.3) * 0.15;
        const i = (y * width + x) * 4;
        data[i]     = clamp(data[i]     + intensity * 60);
        data[i + 1] = clamp(data[i + 1] + intensity * 80);
        data[i + 2] = clamp(data[i + 2] + intensity * 100);
      }
    }
  }

  // Deep-sea vignette (dark blue edges)
  applyVignette(data, width, height, 0.4, 1.0, [0, 5, 30]);
}

// 17. Electroreception
function filterElectro(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const rMul      = (fp.rMul       as number) ?? 0.4;
  const gMul      = (fp.gMul       as number) ?? 1.2;
  const bMul      = (fp.bMul       as number) ?? 1.8;
  const fieldColor = (fp.fieldColor as [number, number, number]) ?? [0, 255, 180];

  const mag = sobelMagnitude(data, width, height);
  const maxMag = 255 * 4;
  const cx = width  / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx  = (y * width + x) * 4;
      const edge = Math.min(mag[y * width + x] / maxMag * 4, 1);

      let r = clamp(data[idx]     * rMul);
      let g = clamp(data[idx + 1] * gMul);
      let b = clamp(data[idx + 2] * bMul);

      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const wave = (Math.sin(dist / 20) * 0.5 + 0.5) * 0.3;
      r = clamp(r + fieldColor[0] * wave + edge * fieldColor[0] * 0.5);
      g = clamp(g + fieldColor[1] * wave + edge * fieldColor[1] * 0.5);
      b = clamp(b + fieldColor[2] * wave + edge * fieldColor[2] * 0.5);

      data[idx]     = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }
}

// 18. Polarization
function filterPolarized(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const rShift = (fp.rShift as number) ?? 0.08;
  const bShift = (fp.bShift as number) ?? -0.08;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];

    const angle = Math.atan2(b - g, r - g);
    const hue = ((angle / (2 * Math.PI)) + 0.5) % 1;

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const dr = lum + (r - lum) * 0.6;
    const dg = lum + (g - lum) * 0.6;
    const db = lum + (b - lum) * 0.6;

    let [h, s, l] = rgbToHsl(r, g, b);
    h = (h + rShift + bShift) % 1;
    if (h < 0) h += 1;

    const [rr, rg, rb] = hslToRgb(hue, 1, 0.5);

    data[i]     = clamp(dr * 0.6 + rr * 0.4);
    data[i + 1] = clamp(dg * 0.6 + rg * 0.4);
    data[i + 2] = clamp(db * 0.6 + rb * 0.4);
  }
}

// 20. Bioluminescence
function filterBiolum(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const glowR = (fp.glowR as number) ?? 0;
  const glowG = (fp.glowG as number) ?? 255;
  const glowB = (fp.glowB as number) ?? 180;

  const glowMask = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    glowMask[p] = lum > 128 ? (lum - 128) / 127 : 0;
    data[i]     = clamp(data[i]     * 0.15);
    data[i + 1] = clamp(data[i + 1] * 0.15);
    data[i + 2] = clamp(data[i + 2] * 0.15);
  }

  const blurredGlow = new Float32Array(width * height);
  const blurR = 4;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0, count = 0;
      for (let dy = -blurR; dy <= blurR; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -blurR; dx <= blurR; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          sum += glowMask[ny * width + nx];
          count++;
        }
      }
      blurredGlow[y * width + x] = sum / count;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p   = y * width + x;
      const idx = p * 4;
      const sharp  = glowMask[p];
      const aura   = blurredGlow[p];
      const total  = Math.min(sharp + aura * 0.6, 1);
      data[idx]     = clamp(data[idx]     + glowR * total);
      data[idx + 1] = clamp(data[idx + 1] + glowG * total);
      data[idx + 2] = clamp(data[idx + 2] + glowB * total);
    }
  }

  // Random glow spots
  const spotCount = 8 + Math.floor(Math.random() * 8);
  for (let s = 0; s < spotCount; s++) {
    const sx = Math.floor(Math.random() * width);
    const sy = Math.floor(Math.random() * height);
    const sr = 3 + Math.floor(Math.random() * 6);
    for (let dy = -sr; dy <= sr; dy++) {
      for (let dx = -sr; dx <= sr; dx++) {
        const nx = sx + dx, ny = sy + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > sr) continue;
        const intensity = 1 - dist / sr;
        const idx = (ny * width + nx) * 4;
        data[idx]     = clamp(data[idx]     + glowR * intensity * 0.5);
        data[idx + 1] = clamp(data[idx + 1] + glowG * intensity * 0.5);
        data[idx + 2] = clamp(data[idx + 2] + glowB * intensity * 0.5);
      }
    }
  }
}

// 21. Thermal / infrared
function filterThermal(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const noise = (fp.noise as number) ?? 8;

  const stops: [number, number, number, number][] = [
    [0.00,  30,   0, 120],
    [0.15,  60,   0, 200],
    [0.30, 120,   0, 200],
    [0.45, 200,   0,  80],
    [0.60, 255, 100,   0],
    [0.75, 255, 200,   0],
    [0.90, 255, 255,  50],
    [1.00, 255, 255, 255],
  ];

  function thermalColor(t: number): [number, number, number] {
    t = Math.max(0, Math.min(1, t));
    let i = 0;
    while (i < stops.length - 2 && stops[i + 1][0] <= t) i++;
    const [t0, r0, g0, b0] = stops[i];
    const [t1, r1, g1, b1] = stops[i + 1];
    const f = (t - t0) / (t1 - t0);
    return [r0 + (r1 - r0) * f, g0 + (g1 - g0) * f, b0 + (b1 - b0) * f];
  }

  for (let i = 0; i < data.length; i += 4) {
    const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const n = (Math.random() - 0.5) * (noise / 255);
    const [r, g, b] = thermalColor(lum + n);
    data[i]     = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  // Noise particles
  for (let p = 0; p < 200; p++) {
    const px = Math.floor(Math.random() * width);
    const py = Math.floor(Math.random() * height);
    const idx = (py * width + px) * 4;
    const nv = (Math.random() - 0.5) * 40;
    data[idx]     = clamp(data[idx]     + nv);
    data[idx + 1] = clamp(data[idx + 1] + nv);
    data[idx + 2] = clamp(data[idx + 2] + nv);
  }
}

// 22. Tetrachromatic / UV-enhanced
function filterTetra(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const saturation = (fp.saturation as number) ?? 1.5;
  const uvTint = (fp.uvTint as [number, number, number]) ?? [180, 0, 255];
  const uvStrength = (fp.uvStrength as number) ?? 0.3;
  const sharp = (fp.sharp as number) ?? 0;

  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    s = Math.min(1, s * saturation);
    const [nr, ng, nb] = hslToRgb(h, s, l);
    data[i]     = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  for (let i = 0; i < data.length; i += 4) {
    const uvVal = data[i + 2] / 255;
    data[i]     = clamp(data[i]     + uvVal * uvTint[0] * uvStrength);
    data[i + 1] = clamp(data[i + 1] + uvVal * uvTint[1] * uvStrength);
    data[i + 2] = clamp(data[i + 2] + uvVal * uvTint[2] * uvStrength);
  }

  if (sharp > 0) {
    const blurred = boxBlur(data, width, height, 1);
    const amount = sharp;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = clamp(data[i]     + (data[i]     - blurred[i])     * amount);
      data[i + 1] = clamp(data[i + 1] + (data[i + 1] - blurred[i + 1]) * amount);
      data[i + 2] = clamp(data[i + 2] + (data[i + 2] - blurred[i + 2]) * amount);
    }
  }
}

// ---------------------------------------------------------------------------
// Context-based filter implementations (need ctx for compositing)
// ---------------------------------------------------------------------------

// 2. Kosukuma - custom bear vision
const filterKosukuma: CtxFilter = (ctx, w, h, fp) => {
  const d = ctx.getImageData(0, 0, w, h), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i], g = px[i+1], b = px[i+2];
    const l = 0.299*r + 0.587*g + 0.114*b;
    r = l + (r - l) * 0.5;
    g = l + (g - l) * 0.7;
    b = l + (b - l) * 0.6;
    r = Math.min(255, r * 1.08 + 12);
    g = Math.min(255, g * 1.03 + 8);
    b = Math.min(255, b * 0.88);
    r = r * 0.75 + 128 * 0.25;
    g = g * 0.75 + 128 * 0.25;
    b = b * 0.75 + 128 * 0.25;
    px[i] = r; px[i+1] = g; px[i+2] = b;
  }
  ctx.putImageData(d, 0, 0);
  ctx.globalAlpha = 0.12;
  ctx.drawImage(ctx.canvas, -2, -2, w+4, h+4);
  ctx.drawImage(ctx.canvas, 2, 2, w-4, h-4);
  ctx.globalAlpha = 1;
  const vg = ctx.createRadialGradient(w/2,h/2,w*0.4,w/2,h/2,w*0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(50,30,10,0.15)");
  ctx.fillStyle = vg; ctx.fillRect(0,0,w,h);
};

// 4. Night vision
const filterNightvision: CtxFilter = (ctx, w, h, fp) => {
  const tint       = (fp.tint       as [number, number, number]) ?? [50, 255, 70];
  const brightness = (fp.brightness as number) ?? 2.5;

  const d = ctx.getImageData(0, 0, w, h), px = d.data;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(cx, cy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = Math.min((0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) * brightness, 255);
      const t = lum / 255;

      let r = t * tint[0];
      let g = t * tint[1];
      let b = t * tint[2];

      const noiseVal = (Math.random() - 0.5) * 20;
      r = clamp(r + noiseVal);
      g = clamp(g + noiseVal);
      b = clamp(b + noiseVal);

      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const vigFactor = Math.max(0, 1 - (dist / maxR) ** 2);
      px[i]     = clamp(r * vigFactor);
      px[i + 1] = clamp(g * vigFactor);
      px[i + 2] = clamp(b * vigFactor);
    }
  }
  ctx.putImageData(d, 0, 0);

  // Noise particles scattered across
  ctx.globalAlpha = 0.15;
  for (let p = 0; p < 60; p++) {
    const nx = Math.random() * w;
    const ny = Math.random() * h;
    const nr = 1 + Math.random() * 2;
    ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${0.3 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Green vignette overlay
  const vg = ctx.createRadialGradient(cx, cy, maxR * 0.5, cx, cy, maxR * 1.2);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,${Math.floor(tint[1] * 0.15)},0,0.4)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
};

// 5. Panorama - horse vision
const filterPanorama: CtxFilter = (ctx, w, h, fp) => {
  // Step 1: Apply 2-color dichro (yellow + blue)
  const d = ctx.getImageData(0, 0, w, h), px = d.data;
  const ch0: [number, number, number] = [255, 220, 0];
  const ch1: [number, number, number] = [0, 100, 255];

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const warm = (r * 0.7 + g * 0.3) / 255;
    const cool = (g * 0.3 + b * 0.7) / 255;
    px[i]     = clamp(warm * ch0[0] + cool * ch1[0]);
    px[i + 1] = clamp(warm * ch0[1] + cool * ch1[1]);
    px[i + 2] = clamp(warm * ch0[2] + cool * ch1[2]);
  }

  // Step 2: Barrel distortion (fish-eye wide angle feel)
  const cx = w / 2, cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const k = 0.25;
  const snapshot = new Uint8ClampedArray(px);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / maxDist;
      const dy = (y - cy) / maxDist;
      const r2 = dx * dx + dy * dy;
      const distort = 1 + k * r2;
      const sx = cx + dx * distort * maxDist;
      const sy = cy + dy * distort * maxDist;

      const idx = (y * w + x) * 4;
      if (sx >= 0 && sx < w - 1 && sy >= 0 && sy < h - 1) {
        const x0 = sx | 0, y0 = sy | 0;
        const x1 = x0 + 1, y1 = y0 + 1;
        const fx = sx - x0, fy = sy - y0;
        const i00 = (y0 * w + x0) * 4;
        const i10 = (y0 * w + x1) * 4;
        const i01 = (y1 * w + x0) * 4;
        const i11 = (y1 * w + x1) * 4;
        for (let c = 0; c < 3; c++) {
          px[idx + c] = clamp(
            snapshot[i00 + c] * (1 - fx) * (1 - fy) +
            snapshot[i10 + c] *      fx  * (1 - fy) +
            snapshot[i01 + c] * (1 - fx) *      fy  +
            snapshot[i11 + c] *      fx  *      fy
          );
        }
      } else {
        px[idx] = 0; px[idx + 1] = 0; px[idx + 2] = 0;
      }
    }
  }

  ctx.putImageData(d, 0, 0);

  // Step 3: Center blind spot (blurry white overlay in center)
  const blindRadius = Math.min(w, h) * 0.12;
  const blindGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blindRadius);
  blindGrad.addColorStop(0, "rgba(255,255,255,0.25)");
  blindGrad.addColorStop(0.5, "rgba(255,255,255,0.12)");
  blindGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = blindGrad;
  ctx.fillRect(0, 0, w, h);

  // Center blur effect
  ctx.globalAlpha = 0.3;
  ctx.drawImage(ctx.canvas,
    cx - blindRadius, cy - blindRadius, blindRadius * 2, blindRadius * 2,
    cx - blindRadius - 2, cy - blindRadius - 2, blindRadius * 2 + 4, blindRadius * 2 + 4
  );
  ctx.globalAlpha = 1;

  // Step 4: Minimal vignette (very wide field of view - 350 degrees)
  const vg = ctx.createRadialGradient(cx, cy, Math.max(w, h) * 0.55, cx, cy, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
};

// 6. Horizoneye - goat vision
const filterHorizoneye: CtxFilter = (ctx, w, h, fp) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w; tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  const stretchW = w * 1.4;
  const offsetX = (stretchW - w) / 2;
  ctx.drawImage(tempCanvas, -offsetX, 0, stretchW, h);
  // 2-color dichro
  const d = ctx.getImageData(0, 0, w, h), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i+1], b = px[i+2];
    const warm = r*0.6 + g*0.4, cool = g*0.3 + b*0.7;
    px[i] = Math.min(255, warm*0.9 + cool*0.05);
    px[i+1] = Math.min(255, warm*0.7 + cool*0.3);
    px[i+2] = Math.min(255, warm*0.0 + cool*0.9);
  }
  ctx.putImageData(d, 0, 0);
  // Top dark gradient
  const tg = ctx.createLinearGradient(0, 0, 0, h*0.35);
  tg.addColorStop(0, "rgba(0,0,0,0.8)"); tg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h*0.35);
  // Bottom dark gradient
  const bg = ctx.createLinearGradient(0, h*0.65, 0, h);
  bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = bg; ctx.fillRect(0, h*0.65, w, h*0.35);
};

// 7. Dualeye - chameleon vision
const filterDualeye: CtxFilter = (ctx, w, h, fp) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w; tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);
  const img = tempCanvas;

  const half = w / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, half, h); ctx.clip();
  ctx.drawImage(img, 0, 0, w*0.5, h, 0, 0, half*1.4, h);
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.rect(half, 0, half, h); ctx.clip();
  ctx.drawImage(img, w*0.5, 0, w*0.5, h, half*0.6, 0, half*1.4, h);
  ctx.restore();
  // Saturation boost 1.4x
  const d = ctx.getImageData(0,0,w,h), px = d.data;
  for (let i=0;i<px.length;i+=4) {
    const l = 0.299*px[i]+0.587*px[i+1]+0.114*px[i+2];
    px[i] = clamp(l+(px[i]-l)*1.4);
    px[i+1] = clamp(l+(px[i+1]-l)*1.4);
    px[i+2] = clamp(l+(px[i+2]-l)*1.4);
  }
  ctx.putImageData(d,0,0);
  // Center divider line
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, h); ctx.stroke();
};

// 10. UV Trail - kestrel vision
const filterUvtrail: CtxFilter = (ctx, w, h, fp) => {
  const d = ctx.getImageData(0,0,w,h), px = d.data;
  for (let i=0;i<px.length;i+=4) {
    let r=px[i],g=px[i+1],b=px[i+2];
    const l=0.299*r+0.587*g+0.114*b;
    r=l+(r-l)*1.5; g=l+(g-l)*1.5; b=l+(b-l)*1.5;
    b=Math.min(255,b+(255-r)*0.18);
    px[i]=clamp(r);
    px[i+1]=clamp(g);
    px[i+2]=clamp(b);
  }
  ctx.putImageData(d,0,0);
  // UV trails on bottom half
  ctx.globalCompositeOperation="screen"; ctx.globalAlpha=0.25;
  for (let t=0; t<5+Math.floor(Math.random()*4); t++) {
    ctx.beginPath();
    let tx=Math.random()*w, ty=h*0.5+Math.random()*h*0.4;
    ctx.moveTo(tx,ty);
    for (let s=0;s<15+Math.floor(Math.random()*20);s++) {
      tx+=(Math.random()-0.5)*40+10; ty+=(Math.random()-0.5)*20;
      ctx.lineTo(tx,ty);
    }
    ctx.strokeStyle=`rgba(255,240,60,${0.3+Math.random()*0.3})`;
    ctx.lineWidth=2+Math.random()*3; ctx.lineCap="round"; ctx.stroke();
  }
  ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=1;
};

// 13. Multieye - spider vision (8 circular windows)
const filterMultieye: CtxFilter = (ctx, w, h, fp) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w; tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  // Dark/blurred background
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, w, h);

  // Blur the temp canvas for small eyes
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = w; blurCanvas.height = h;
  const blurCtx = blurCanvas.getContext('2d')!;
  blurCtx.filter = 'blur(3px)';
  blurCtx.drawImage(tempCanvas, 0, 0);

  // Grayscale canvas for side eyes
  const grayCanvas = document.createElement('canvas');
  grayCanvas.width = w; grayCanvas.height = h;
  const grayCtx = grayCanvas.getContext('2d')!;
  grayCtx.drawImage(tempCanvas, 0, 0);
  const gd = grayCtx.getImageData(0, 0, w, h);
  const gpx = gd.data;
  for (let i = 0; i < gpx.length; i += 4) {
    const l = 0.299 * gpx[i] + 0.587 * gpx[i+1] + 0.114 * gpx[i+2];
    gpx[i] = l; gpx[i+1] = l; gpx[i+2] = l;
  }
  grayCtx.putImageData(gd, 0, 0);
  // Blur grayscale
  const grayBlurCanvas = document.createElement('canvas');
  grayBlurCanvas.width = w; grayBlurCanvas.height = h;
  const grayBlurCtx = grayBlurCanvas.getContext('2d')!;
  grayBlurCtx.filter = 'blur(2px)';
  grayBlurCtx.drawImage(grayCanvas, 0, 0);

  const cx = w / 2, cy = h / 2;
  const minDim = Math.min(w, h);

  // Eye definitions: [x, y, radius, type]
  // type: 0=large clear, 1=medium dark, 2=small grayscale
  const eyes: [number, number, number, number][] = [
    // 2 large center eyes (anterior median)
    [cx - minDim * 0.1, cy - minDim * 0.05, minDim * 0.15, 0],
    [cx + minDim * 0.1, cy - minDim * 0.05, minDim * 0.15, 0],
    // 2 upper eyes (anterior lateral)
    [cx - minDim * 0.22, cy - minDim * 0.2, minDim * 0.1, 1],
    [cx + minDim * 0.22, cy - minDim * 0.2, minDim * 0.1, 1],
    // 4 side eyes (posterior)
    [cx - minDim * 0.32, cy + minDim * 0.05, minDim * 0.07, 2],
    [cx + minDim * 0.32, cy + minDim * 0.05, minDim * 0.07, 2],
    [cx - minDim * 0.28, cy + minDim * 0.2, minDim * 0.07, 2],
    [cx + minDim * 0.28, cy + minDim * 0.2, minDim * 0.07, 2],
  ];

  for (const [ex, ey, er, etype] of eyes) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.clip();

    if (etype === 0) {
      // Large clear eyes - draw from original
      ctx.drawImage(tempCanvas, 0, 0);
    } else if (etype === 1) {
      // Medium eyes - slightly dark
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, w, h);
    } else {
      // Small grayscale eyes
      ctx.drawImage(grayBlurCanvas, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    // Thin green ring around each window
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,200,50,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
};

// 14. Multilayer - jumping spider vision
const filterMultilayer: CtxFilter = (ctx, w, h, fp) => {
  const d = ctx.getImageData(0, 0, w, h), px = d.data;
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  // Create blurred version
  const blurred = boxBlur(px, w, h, 3);

  // Create sharp version (saturation boost + unsharp mask)
  const sharpData = new Uint8ClampedArray(px);
  for (let i = 0; i < sharpData.length; i += 4) {
    const l = 0.299*sharpData[i]+0.587*sharpData[i+1]+0.114*sharpData[i+2];
    sharpData[i] = clamp(l+(sharpData[i]-l)*1.6);
    sharpData[i+1] = clamp(l+(sharpData[i+1]-l)*1.6);
    sharpData[i+2] = clamp(l+(sharpData[i+2]-l)*1.6);
  }
  const sharpBlur = boxBlur(sharpData, w, h, 1);
  for (let i = 0; i < sharpData.length; i += 4) {
    sharpData[i]   = clamp(sharpData[i]   + (sharpData[i]   - sharpBlur[i])   * 2);
    sharpData[i+1] = clamp(sharpData[i+1] + (sharpData[i+1] - sharpBlur[i+1]) * 2);
    sharpData[i+2] = clamp(sharpData[i+2] + (sharpData[i+2] - sharpBlur[i+2]) * 2);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const t = dist / maxR; // 0 at center, ~1 at corners
      const idx = (y * w + x) * 4;

      let srcR: number, srcG: number, srcB: number;

      if (t < 0.10) {
        // Center 10%: super clear (sharp + high saturation)
        srcR = sharpData[idx]; srcG = sharpData[idx+1]; srcB = sharpData[idx+2];
      } else if (t < 0.25) {
        // 10-25%: blurry
        srcR = blurred[idx]; srcG = blurred[idx+1]; srcB = blurred[idx+2];
      } else if (t < 0.40) {
        // 25-40%: clear again
        srcR = px[idx]; srcG = px[idx+1]; srcB = px[idx+2];
      } else {
        // 40%+: blurry + dark
        const darkFactor = Math.max(0.3, 1 - (t - 0.4) * 1.2);
        srcR = blurred[idx] * darkFactor;
        srcG = blurred[idx+1] * darkFactor;
        srcB = blurred[idx+2] * darkFactor;
      }

      // Slight green tint overall
      px[idx]   = clamp(srcR * 0.95);
      px[idx+1] = clamp(srcG * 1.05 + 5);
      px[idx+2] = clamp(srcB * 0.95);
    }
  }
  ctx.putImageData(d, 0, 0);

  // Thin green rings at layer boundaries
  const boundaries = [0.10, 0.25, 0.40];
  ctx.strokeStyle = "rgba(0,200,50,0.35)";
  ctx.lineWidth = 1.5;
  for (const b of boundaries) {
    ctx.beginPath();
    ctx.arc(cx, cy, b * maxR, 0, Math.PI * 2);
    ctx.stroke();
  }
};

// 19. Spliteye - four-eyed fish vision
const filterSpliteye: CtxFilter = (ctx, w, h, fp) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w; tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  const mid = h / 2;
  // Top half: warm
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,w,mid); ctx.clip();
  ctx.drawImage(tempCanvas,0,0,w,h);
  const dT=ctx.getImageData(0,0,w,mid), pT=dT.data;
  for(let i=0;i<pT.length;i+=4){
    pT[i]=clamp(pT[i]*1.1+10);
    pT[i+1]=clamp(pT[i+1]*1.05+5);
    pT[i+2]=clamp(pT[i+2]*0.85);
  }
  ctx.putImageData(dT,0,0); ctx.restore();
  // Bottom half: underwater
  ctx.save(); ctx.beginPath(); ctx.rect(0,mid,w,mid); ctx.clip();
  ctx.drawImage(tempCanvas,0,0,w,h);
  const dB=ctx.getImageData(0,mid,w,mid), pB=dB.data;
  for(let i=0;i<pB.length;i+=4){
    const l=0.299*pB[i]+0.587*pB[i+1]+0.114*pB[i+2];
    pB[i]=clamp(l*0.2+pB[i]*0.3);
    pB[i+1]=clamp(l*0.4+pB[i+1]*0.45+20);
    pB[i+2]=clamp(l*0.5+pB[i+2]*0.6+40);
  }
  ctx.putImageData(dB,0,mid); ctx.restore();
  // Water surface line
  ctx.beginPath(); ctx.moveTo(0,mid);
  for(let x=0;x<=w;x+=4) ctx.lineTo(x,mid+Math.sin(x*0.05)*3);
  ctx.strokeStyle="rgba(255,255,255,0.5)"; ctx.lineWidth=2.5; ctx.stroke();
};

// ---------------------------------------------------------------------------
// Set of filters that operate directly on ctx (not via getImageData/putImageData in applyFilter)
// ---------------------------------------------------------------------------
const ctxFilters: Record<string, CtxFilter> = {
  kosukuma: filterKosukuma,
  nightvision: filterNightvision,
  panorama: filterPanorama,
  horizoneye: filterHorizoneye,
  dualeye: filterDualeye,
  uvtrail: filterUvtrail,
  multieye: filterMultieye,
  multilayer: filterMultilayer,
  spliteye: filterSpliteye,
};

// ---------------------------------------------------------------------------
// FOV (Field of View) data & expansion
// ---------------------------------------------------------------------------

export const FOV_DATA: Record<string, { fov: number; expansion: number; label: string }> = {
  kosukuma:      { fov: 270, expansion: 2.2,  label: "270°" },
  human:         { fov: 120, expansion: 1.0,  label: "120°" },
  dog:           { fov: 250, expansion: 2.1,  label: "250°" },
  cat:           { fov: 200, expansion: 1.7,  label: "200°" },
  horse:         { fov: 350, expansion: 2.9,  label: "350°" },
  goat:          { fov: 340, expansion: 2.8,  label: "340°" },
  panda:         { fov: 270, expansion: 2.2,  label: "270°" },
  chameleon:     { fov: 342, expansion: 2.8,  label: "342°" },
  frog:          { fov: 360, expansion: 3.0,  label: "360°" },
  eagle:         { fov: 340, expansion: 2.8,  label: "340°" },
  kestrel:       { fov: 340, expansion: 2.8,  label: "340°" },
  owl:           { fov: 110, expansion: 0.9,  label: "110°" },
  bat:           { fov: 360, expansion: 3.0,  label: "360°" },
  dragonfly:     { fov: 360, expansion: 3.0,  label: "360°" },
  bee:           { fov: 360, expansion: 3.0,  label: "360°" },
  cockroach:     { fov: 360, expansion: 3.0,  label: "360°" },
  fly:           { fov: 360, expansion: 3.0,  label: "360°" },
  spider:        { fov: 360, expansion: 3.0,  label: "360°" },
  jumpingspider: { fov: 90,  expansion: 0.75, label: "90°" },
  snail:         { fov: 100, expansion: 0.8,  label: "100°" },
  dolphin:       { fov: 300, expansion: 2.5,  label: "300°" },
  shark:         { fov: 360, expansion: 3.0,  label: "360°" },
  octopus:       { fov: 340, expansion: 2.8,  label: "340°" },
  foureyedfish:  { fov: 360, expansion: 3.0,  label: "360°" },
  deepsea:       { fov: 120, expansion: 1.0,  label: "120°" },
  platypus:      { fov: 360, expansion: 3.0,  label: "360°" },
  snake:         { fov: 300, expansion: 2.5,  label: "300°" },
  mshrimp:       { fov: 360, expansion: 3.0,  label: "360°" },
  starfish:      { fov: 360, expansion: 3.0,  label: "360°" },
  mole:          { fov: 20,  expansion: 0.17, label: "20°" },
  blindcavefish: { fov: 0,   expansion: 0,    label: "0°" },
};

export function expandFOV(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  img: CanvasImageSource,
  expansion: number
): void {
  if (expansion <= 0 || expansion >= 1.0) return;

  // Narrow FOV: zoom into center + darken periphery
  const imgW = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width;
  const imgH = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height;
  const cropW = imgW * expansion;
  const cropH = imgH * expansion;
  const sx = (imgW - cropW) / 2;
  const sy = (imgH - cropH) / 2;
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, w, h);

  // Darken periphery (narrower FOV = more darkness)
  const darkness = Math.max(0, 1 - expansion) * 0.8;
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * expansion * 0.3, w / 2, h / 2, w * 0.6);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,0,0,${darkness})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterType: string,
  fp: Record<string, unknown>
): void {
  // Check if this is a ctx-based filter first
  if (ctxFilters[filterType]) {
    ctxFilters[filterType](ctx, width, height, fp);
    return;
  }

  // Otherwise use ImageData-based filters
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filterType) {
    case 'human':       filterHuman       (data, width, height, fp); break;
    case 'dichro':      filterDichro      (data, width, height, fp); break;
    case 'motion':      filterMotion      (data, width, height, fp); break;
    case 'sharp':       filterSharp       (data, width, height, fp); break;
    case 'sonar':       filterSonar       (data, width, height, fp); break;
    case 'compound':    filterCompound    (data, width, height, fp); break;
    case 'lowres':      filterLowres      (data, width, height, fp); break;
    case 'mono':        filterMono        (data, width, height, fp); break;
    case 'electro':     filterElectro     (data, width, height, fp); break;
    case 'polarized':   filterPolarized   (data, width, height, fp); break;
    case 'biolum':      filterBiolum      (data, width, height, fp); break;
    case 'thermal':     filterThermal     (data, width, height, fp); break;
    case 'tetra':       filterTetra       (data, width, height, fp); break;
    default:
      console.warn(`[FilterEngine] Unknown filter type: "${filterType}"`);
      break;
  }

  ctx.putImageData(imageData, 0, 0);
}
