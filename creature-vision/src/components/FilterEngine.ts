// FilterEngine.ts
// Pixel-level RGBA canvas filter implementations for Creature Vision
// All filters operate on Canvas ImageData via getImageData / putImageData

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
      // sample luminance of the 3x3 neighbourhood
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

/** Apply vignette darkening to ImageData in-place.
 *  innerRadius / outerRadius are fractions of min(width,height)/2.
 *  vigColor blends toward edges. */
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
// Filter implementations
// ---------------------------------------------------------------------------

// 1. Monochromatic / 1-colour vision
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
}

// 2. Dichromatic / 2-colour vision
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

// 3. Tetrachromatic / UV-enhanced
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

  // Saturation boost
  for (let i = 0; i < data.length; i += 4) {
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    s = Math.min(1, s * saturation);
    const [nr, ng, nb] = hslToRgb(h, s, l);
    data[i]     = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  // UV pseudo-channel: boost blue toward uvTint
  for (let i = 0; i < data.length; i += 4) {
    const uvVal = data[i + 2] / 255; // blue channel proxy
    data[i]     = clamp(data[i]     + uvVal * uvTint[0] * uvStrength);
    data[i + 1] = clamp(data[i + 1] + uvVal * uvTint[1] * uvStrength);
    data[i + 2] = clamp(data[i + 2] + uvVal * uvTint[2] * uvStrength);
  }

  // Optional unsharp mask
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

// 4. Compound eye / hexagonal mosaic
function filterCompound(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const hexSize = (fp.hexSize as number) ?? 12;
  const uvShift = (fp.uvShift as number) ?? 0.05;
  const gridOpacity = (fp.gridOpacity as number) ?? 0.4;

  // Hex grid math
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth  = hexSize * 2;
  const colStep   = hexSize * 1.5;
  const rowStep   = hexHeight;

  // Build a pixel → hex-center mapping, then average
  const out = new Uint8ClampedArray(data.length);
  // Copy alpha
  for (let i = 3; i < data.length; i += 4) out[i] = 255;

  // We iterate over each hex and fill it
  // Compute number of columns and rows to cover the canvas
  const cols = Math.ceil(width  / colStep) + 2;
  const rows = Math.ceil(height / rowStep) + 2;

  // For performance: first compute the average colour per hex by accumulating
  // We'll use a flat array keyed by [row, col]
  const hexAccR = new Float32Array(rows * cols);
  const hexAccG = new Float32Array(rows * cols);
  const hexAccB = new Float32Array(rows * cols);
  const hexCnt  = new Uint32Array(rows * cols);

  /** Cube-coordinate-free axial hex: given pixel (px,py) find closest hex center */
  function nearestHex(px: number, py: number): [number, number] {
    const col = Math.round(px / colStep);
    const colOffset = col % 2 === 0 ? 0 : rowStep / 2;
    const row = Math.round((py - colOffset) / rowStep);
    return [row, col];
  }

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const [hr, hc] = nearestHex(px, py);
      const rc = hr + 1; // offset by 1 to handle negatives
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

  // Second pass: fill each pixel with its hex's average colour (+ UV hue shift)
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const [hr, hc] = nearestHex(px, py);
      const rc = hr + 1;
      const cc = hc + 1;
      if (rc < 0 || rc >= rows || cc < 0 || cc >= cols) continue;
      const key = rc * cols + cc;
      const cnt = hexCnt[key] || 1;
      let r = hexAccR[key] / cnt;
      let g = hexAccG[key] / cnt;
      let b = hexAccB[key] / cnt;

      // UV hue shift
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

  // Draw hex grid lines by detecting pixels near a hex border
  if (gridOpacity > 0) {
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const [hr, hc] = nearestHex(px, py);
        // Check if any neighbour pixel maps to a different hex
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

// 5. Sonar / echolocation
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
  const maxMag = 255 * 4; // theoretical max
  const cx = width  / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const edge = Math.min(mag[y * width + x] / maxMag * 4, 1); // normalise

      // Base: lerp between bg and tint by edge strength
      let r = bg[0] + (tint[0] - bg[0]) * edge;
      let g = bg[1] + (tint[1] - bg[1]) * edge;
      let b = bg[2] + (tint[2] - bg[2]) * edge;

      // Concentric rings from centre
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

// 6. Thermal / infrared
function filterThermal(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const noise = (fp.noise as number) ?? 8;

  // Colormap stops: [t, r, g, b]
  const stops: [number, number, number, number][] = [
    [0.00,   0,   0,  80],
    [0.15,   0,   0, 200],
    [0.30,   0, 180, 255],
    [0.45,   0, 200,   0],
    [0.60, 255, 255,   0],
    [0.75, 255, 150,   0],
    [0.90, 255,   0,   0],
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
}

// 7. Night vision
function filterNightvision(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const tint       = (fp.tint       as [number, number, number]) ?? [50, 255, 70];
  const brightness = (fp.brightness as number) ?? 2.5;

  const cx = width  / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = Math.min((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * brightness, 255);
      const t = lum / 255;

      // Tint
      let r = t * tint[0];
      let g = t * tint[1];
      let b = t * tint[2];

      // Noise
      const noiseVal = (Math.random() - 0.5) * 20;
      r = clamp(r + noiseVal);
      g = clamp(g + noiseVal);
      b = clamp(b + noiseVal);

      // Vignette
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const vigFactor = Math.max(0, 1 - (dist / maxR) ** 2);
      data[i]     = clamp(r * vigFactor);
      data[i + 1] = clamp(g * vigFactor);
      data[i + 2] = clamp(b * vigFactor);
    }
  }
}

// 8. Ultra low resolution
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

  const blockW = Math.max(1, Math.round(width  / pixelCount));
  const blockH = Math.max(1, Math.round(blockW * height / width));

  // Build a downscaled buffer
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

  // Second pass: fill blocks
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

  // Vignette
  applyVignette(data, width, height, vigIn, vigOut, [0, 0, 0]);
}

// 9. Polarization
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

    // Polarization angle from channel differences
    const angle = Math.atan2(b - g, r - g); // -PI to PI
    const hue = ((angle / (2 * Math.PI)) + 0.5) % 1; // 0-1

    // Desaturate the original slightly
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const dr = lum + (r - lum) * 0.6;
    const dg = lum + (g - lum) * 0.6;
    const db = lum + (b - lum) * 0.6;

    // Apply channel hue shifts
    let [h, s, l] = rgbToHsl(r, g, b);
    h = (h + rShift + bShift) % 1;
    if (h < 0) h += 1;

    // Rainbow overlay colour
    const [rr, rg, rb] = hslToRgb(hue, 1, 0.5);

    // Blend 40% rainbow over 60% desaturated original
    data[i]     = clamp(dr * 0.6 + rr * 0.4);
    data[i + 1] = clamp(dg * 0.6 + rg * 0.4);
    data[i + 2] = clamp(db * 0.6 + rb * 0.4);
  }
}

// 10. Electroreception
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
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx  = (y * width + x) * 4;
      const edge = Math.min(mag[y * width + x] / maxMag * 4, 1);

      let r = clamp(data[idx]     * rMul);
      let g = clamp(data[idx + 1] * gMul);
      let b = clamp(data[idx + 2] * bMul);

      // Electric field ripple: sine waves from centre
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

// 11. Motion detection
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

// 12. Human vision (baseline - no modification)
function filterHuman(
  _data: Uint8ClampedArray,
  _width: number,
  _height: number,
  _fp: Record<string, unknown>
): void {
  // intentionally empty - return image unmodified
}

// 13. Sharp / raptor vision
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

  // Foveal zoom: magnify centre circle (1.5x) by sampling from a smaller region
  if (fovea > 0) {
    const cx = width  / 2;
    const cy = height / 2;
    const fovRadius = fovea * Math.min(cx, cy);
    const zoomFactor = 1.5;
    const snapshot = new Uint8ClampedArray(data); // copy before overwriting

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > fovRadius) continue;

        // Map this pixel back to source with inverse zoom
        const sx = cx + dx / zoomFactor;
        const sy = cy + dy / zoomFactor;

        // Bilinear sample from snapshot
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

// 14. Bioluminescence
function filterBiolum(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fp: Record<string, unknown>
): void {
  const glowR = (fp.glowR as number) ?? 0;
  const glowG = (fp.glowG as number) ?? 255;
  const glowB = (fp.glowB as number) ?? 180;

  // First pass: darken everything, extract glow mask
  const glowMask = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    glowMask[p] = lum > 128 ? (lum - 128) / 127 : 0; // 0-1 strength for bright areas
    // Darken background
    data[i]     = clamp(data[i]     * 0.15);
    data[i + 1] = clamp(data[i + 1] * 0.15);
    data[i + 2] = clamp(data[i + 2] * 0.15);
  }

  // Blur the glow mask to create an aura (simple box blur)
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

  // Second pass: apply glow colour to both sharp and blurred glow
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
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filterType) {
    case 'mono':        filterMono        (data, width, height, fp); break;
    case 'dichro':      filterDichro      (data, width, height, fp); break;
    case 'tetra':       filterTetra       (data, width, height, fp); break;
    case 'compound':    filterCompound    (data, width, height, fp); break;
    case 'sonar':       filterSonar       (data, width, height, fp); break;
    case 'thermal':     filterThermal     (data, width, height, fp); break;
    case 'nightvision': filterNightvision (data, width, height, fp); break;
    case 'lowres':      filterLowres      (data, width, height, fp); break;
    case 'polarized':   filterPolarized   (data, width, height, fp); break;
    case 'electro':     filterElectro     (data, width, height, fp); break;
    case 'motion':      filterMotion      (data, width, height, fp); break;
    case 'human':       filterHuman       (data, width, height, fp); break;
    case 'sharp':       filterSharp       (data, width, height, fp); break;
    case 'biolum':      filterBiolum      (data, width, height, fp); break;
    default:
      console.warn(`[FilterEngine] Unknown filter type: "${filterType}"`);
      break;
  }

  ctx.putImageData(imageData, 0, 0);
}
