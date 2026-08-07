/**
 * CASE図版（PLATE）のシェーダー。
 *
 * 実物の写真は権利処理が必要なため、図鑑側の図版はすべて生成物とする。
 * ただし共通のパターン生成器で描き分けるのではなく、
 * **CASEごとに固有の作図プログラム**を持たせる。
 *
 * 各プログラムは《変容前の配置》と《配置操作の実行後》の二状態を持ち、
 * uProgress がそのあいだを移す。図版そのものが配置操作を実演する。
 */

export const plateVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const plateFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSeed;
  uniform float uProgress;   // 配置操作の進行 0→1
  uniform float uPlate;      // どのCASEの作図プログラムか 0..9
  uniform float uFade;       // 帯の端でのフェード
  uniform float uAppear;     // 初回出現
  uniform vec2  uSize;       // 版面のワールド寸法
  uniform vec3  uPaper;
  uniform vec3  uInk;
  uniform vec3  uAccent;
  uniform float uGrain;
  uniform float uFocus;     // 帯の中で手前に読まれている版

  varying vec2 vUv;

  const float PI = 3.14159265359;

  // ---- 描き味の共通量 ---------------------------------------------------
  float AA;                 // 1ピクセルぶんの作画単位
  float INK;                // 図のインク
  float ACC;                // 朱で差す部分
  float LIN;                // 補助線

  float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453123); }
  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y);
  }

  // ---- SDF -------------------------------------------------------------
  float sdBox(vec2 p, vec2 h) {
    vec2 d = abs(p) - h;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }
  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }
  float fillOf(float d) { return 1.0 - smoothstep(-AA, AA, d); }
  float strokeOf(float d, float w) { return 1.0 - smoothstep(w - AA, w + AA, abs(d)); }

  float box(vec2 p, vec2 c, vec2 h) { return fillOf(sdBox(p - c, h)); }
  float frame(vec2 p, vec2 c, vec2 h, float w) { return strokeOf(sdBox(p - c, h), w); }
  float seg(vec2 p, vec2 a, vec2 b, float w) { return strokeOf(sdSeg(p, a, b), w); }
  float ring(vec2 p, vec2 c, float r, float w) { return strokeOf(length(p - c) - r, w); }
  float dashed(vec2 p, vec2 c, vec2 h, float w, float period) {
    return frame(p, c, h, w) * step(0.42, fract((p.x + p.y) * period));
  }

  // 版面の作画領域
  const vec2 AREA_H = vec2(0.290, 0.370);
  const vec2 AREA_C = vec2(0.0, -0.010);

  // ======================================================================
  // 01 泉 — 文脈置換
  //   変容前: 展示室の枠と、その中に整列した作品。枠の外に量産品がひとつ。
  //   実行後: 量産品が枠の内側へ移り、元の位置には破線が残る。
  // ======================================================================
  void plateFountain(vec2 p, float t) {
    vec2 rc = vec2(-0.030, 0.045);
    vec2 rh = vec2(0.190, 0.230);
    LIN += frame(p, rc, rh, 0.0016);

    // 展示室に整列した作品
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float col = mod(fi, 4.0), row = floor(fi / 4.0);
      vec2 c = rc + vec2((col - 1.5) * 0.098, (1.0 - row) * 0.140 - 0.035);
      float hh = 0.030 + 0.020 * hash11(fi * 3.1 + uSeed);
      INK += box(p, c, vec2(0.028, hh));
    }

    // 量産品。枠の外から、枠の内側へ。
    vec2 from = vec2(0.215, -0.300);
    vec2 to = rc + vec2(0.112, -0.178);
    vec2 c = mix(from, to, t);

    // 便器の断面に見えるよう、上が広く下がすぼまる形にする
    float body = box(p, c, vec2(0.046, 0.030));
    body += box(p, c + vec2(0.0, 0.036), vec2(0.030, 0.010));
    INK += body;

    // 元の位置に残る破線と、置き直した先の朱
    LIN += dashed(p, from, vec2(0.058, 0.052), 0.0013, 46.0) * t;
    ACC += (body + frame(p, c, vec2(0.058, 0.052), 0.0013)) * t;

    // 台座
    LIN += seg(p, c + vec2(-0.052, -0.034), c + vec2(0.052, -0.034), 0.0012);
  }

  // ======================================================================
  // 02 点字ブロック — 用途転換
  //   変容前: 情報を持たない均質な舗装。
  //   実行後: 足裏で読める経路が、同じ面の上に現れる。
  // ======================================================================
  void plateTactile(vec2 p, float t) {
    // 舗装。均質な面として、まず地を敷く。
    INK += box(p, AREA_C, AREA_H) * 0.09;
    LIN += frame(p, AREA_C, AREA_H, 0.0012);
    for (int i = 0; i < 9; i++) {
      float y = -0.34 + float(i) * 0.085;
      LIN += seg(p, vec2(-AREA_H.x, y), vec2(AREA_H.x, y), 0.0008) * 0.75;
    }
    for (int i = 0; i < 5; i++) {
      float x = -0.24 + float(i) * 0.12;
      LIN += seg(p, vec2(x, -0.36), vec2(x, 0.36), 0.0007) * 0.35;
    }

    // 経路。下から上へ伸び、途中で直角に折れる。
    float head = t * 1.06;
    for (int i = 0; i < 17; i++) {
      float fi = float(i);
      float s = fi / 16.0;
      vec2 c;
      if (s < 0.52) {
        c = vec2(-0.150, -0.340 + s * 1.16);
      } else if (s < 0.68) {
        c = vec2(-0.150 + (s - 0.52) * 1.85, 0.263);
      } else {
        c = vec2(0.146, 0.263 - (s - 0.68) * 0.30);
      }
      float on = smoothstep(s, s + 0.06, head);
      // 誘導は線状、折れ点は点状にする
      float warn = step(0.50, s) * step(s, 0.70);
      float d = mix(box(p, c, vec2(0.014, 0.030)), box(p, c, vec2(0.020, 0.020)), warn);
      INK += d * on;
      ACC += d * on * mix(0.35, 1.0, warn);
    }
  }

  // ======================================================================
  // 03 ボンエルフ — 役割反転
  //   変容前: まっすぐな車路。歩行者は縁へ押し出されている。
  //   実行後: 屈曲と植栽が入り、面の全幅が使われる。
  // ======================================================================
  void plateWoonerf(vec2 p, float t) {
    LIN += frame(p, AREA_C, AREA_H, 0.0012) * 0.6;

    // 車路の縁石。実行後には消える。
    float w = 0.088;
    LIN += seg(p, vec2(-w, -0.355), vec2(-w, 0.355), 0.0018) * (1.0 - t);
    LIN += seg(p, vec2(w, -0.355), vec2(w, 0.355), 0.0018) * (1.0 - t);
    // 縁石の外側＝歩行者が押し込まれていた細い帯
    LIN += seg(p, vec2(-0.245, -0.355), vec2(-0.245, 0.355), 0.0010) * (1.0 - t);
    LIN += seg(p, vec2(0.245, -0.355), vec2(0.245, 0.355), 0.0010) * (1.0 - t);

    // 車。多数がまっすぐ並んでいたものが、数を減らして蛇行する。
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float y = -0.320 + fi * 0.092;
      float sway = sin(fi * 1.9 + 0.6) * 0.115 * t;
      float keep = 1.0 - t * step(0.5, mod(fi, 2.0));
      INK += box(p, vec2(sway, y), vec2(0.030, 0.038)) * keep;
      LIN += frame(p, vec2(sway, y), vec2(0.030, 0.038), 0.0011) * keep;
    }

    // 歩行者。縁の細帯から、面の全幅へ散る。
    for (int i = 0; i < 16; i++) {
      float fi = float(i);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      float k = floor(fi / 2.0);
      vec2 from = vec2(side * (0.212 + 0.020 * hash11(fi + uSeed)), -0.320 + k * 0.092);
      vec2 to = vec2((hash11(fi * 3.7 + uSeed) - 0.5) * 0.470,
                     -0.330 + hash11(fi * 5.1 + uSeed) * 0.660);
      vec2 c = mix(from, to, t);
      float sz = mix(0.0085, 0.0155, t);
      INK += box(p, c, vec2(sz, sz));
    }

    // 植栽と滞留の島。実行後に車路のまん中へ据わる。
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      float y = -0.270 + fi * 0.145;
      vec2 from = vec2(side * 0.300, y);
      vec2 to = vec2(side * 0.062, y);
      vec2 c = mix(from, to, t);
      float o = box(p, c, vec2(0.042, 0.017));
      INK += o * t;
      ACC += o * t;
      LIN += seg(p, c + vec2(-0.042, -0.024), c + vec2(0.042, -0.024), 0.0011) * t;
    }
  }

  // ======================================================================
  // 04 グラミン銀行 — 尺度変更
  //   変容前: 少数の大口。担保のある者だけが対象。
  //   実行後: 同じ量が、五人一組の小さな単位へ分解される。
  // ======================================================================
  void plateGrameen(vec2 p, float t) {
    // 大口
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 c = vec2(-0.150 + fi * 0.150, 0.215);
      float s = 1.0 - t;
      INK += box(p, c, vec2(0.058, 0.052) * s) * s;
    }
    LIN += seg(p, vec2(-0.26, 0.128), vec2(0.26, 0.128), 0.0009);

    // 五人一組の群
    for (int g = 0; g < 6; g++) {
      float fg = float(g);
      vec2 gc = vec2(-0.176 + mod(fg, 3.0) * 0.176, -0.030 - floor(fg / 3.0) * 0.185);
      float appear = smoothstep(fg / 8.0, fg / 8.0 + 0.35, t);
      for (int k = 0; k < 5; k++) {
        float fk = float(k);
        float a = fk / 5.0 * 6.2831 - 1.5708;
        vec2 c = gc + vec2(cos(a), sin(a)) * 0.040;
        INK += box(p, c, vec2(0.014, 0.014)) * appear;
      }
      LIN += ring(p, gc, 0.058, 0.0009) * appear * 0.8;
      if (g == 1) ACC += ring(p, gc, 0.058, 0.0013) * appear;
    }

    // 尺度そのものの目盛
    LIN += seg(p, vec2(-0.26, -0.330), vec2(0.26, -0.330), 0.0009) * t;
    for (int i = 0; i < 11; i++) {
      float x = -0.26 + float(i) * 0.052;
      LIN += seg(p, vec2(x, -0.330), vec2(x, -0.330 + 0.014), 0.0008) * t;
    }
  }

  // ======================================================================
  // 05 包まれたライヒスタッグ — 可視化
  //   変容前: 装飾と開口で埋まった立面。細部で読み取っている。
  //   実行後: 布が細部を伏せ、量塊と輪郭だけが残る。
  // ======================================================================
  void plateWrapped(vec2 p, float t) {
    vec2 bc = vec2(0.0, -0.040);
    vec2 bh = vec2(0.230, 0.215);

    // 立面の細部
    float detail = 1.0 - t;
    for (int i = 0; i < 9; i++) {
      float x = -0.196 + float(i) * 0.049;
      for (int j = 0; j < 4; j++) {
        float y = -0.196 + float(j) * 0.098;
        INK += box(p, vec2(x, y), vec2(0.015, 0.030)) * detail;
      }
    }
    // 塔とペディメント
    INK += box(p, vec2(0.0, 0.215), vec2(0.055, 0.048)) * detail;
    LIN += ring(p, vec2(0.0, 0.208), 0.056, 0.0016);
    LIN += seg(p, vec2(-0.230, 0.168), vec2(0.230, 0.168), 0.0012);
    LIN += frame(p, bc, bh, 0.0014);

    // 布。輪郭をなぞりながら細部を伏せる。
    float drape = box(p, bc, bh) * t;
    INK += drape * 0.26;
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float x = -0.180 + fi * 0.060;
      float bow = sin(fi * 1.3 + uSeed) * 0.014;
      LIN += seg(p, vec2(x + bow, -0.245), vec2(x - bow, 0.160), 0.0009) * t * 0.7;
    }
    // 締めたロープ
    for (int i = 0; i < 3; i++) {
      float y = -0.170 + float(i) * 0.130;
      ACC += seg(p, vec2(-0.232, y), vec2(0.232, y + 0.012), 0.0014) * t;
    }
    LIN += frame(p, bc, bh, 0.0022) * t;
    LIN += seg(p, vec2(0.0, 0.208), vec2(0.0, 0.330), 0.0012); // 旗竿
    INK += box(p, vec2(0.0, 0.208), vec2(0.056, 0.052)) * t * 0.26;
  }

  // ======================================================================
  // 06 パントマイム — 役割反転
  //   変容前: 街路と車列。歩行者は縁の小さな点。
  //   実行後: 見ている側が前へ出て、判定の記号を掲げる。
  // ======================================================================
  void plateMime(vec2 p, float t) {
    LIN += seg(p, vec2(-0.29, 0.130), vec2(0.29, 0.130), 0.0013);
    LIN += seg(p, vec2(-0.29, -0.130), vec2(0.29, -0.130), 0.0013);
    for (int i = 0; i < 7; i++) {
      float x = -0.24 + float(i) * 0.08;
      LIN += seg(p, vec2(x, 0.0), vec2(x + 0.045, 0.0), 0.0010) * 0.7;
    }

    // 車列。後ろへ退く。
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float x = -0.20 + fi * 0.10;
      INK += box(p, vec2(x, 0.062), vec2(0.032, 0.030)) * (1.0 - t * 0.55);
    }

    // 見ている側。縁から前景へ。
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      float x = -0.245 + floor(fi / 2.0) * 0.098 + mod(fi, 2.0) * 0.049;
      vec2 from = vec2(x, side * 0.312);
      vec2 to = vec2(x * 0.86, side * 0.176);
      vec2 c = mix(from, to, t);
      float s = mix(0.0085, 0.020, t);
      INK += box(p, c, vec2(s, s));
      // 掲げられた判定の記号
      float up = step(0.5, hash11(fi * 5.3 + uSeed));
      float sign = seg(p, c + vec2(0.0, s * 1.6), c + vec2(0.0, s * 3.2), 0.0013)
                 + seg(p, c + vec2(-0.008, s * 3.2 - mix(0.0, 0.010, up)),
                          c + vec2(0.008, s * 3.2 - mix(0.010, 0.0, up)), 0.0013);
      ACC += sign * t;
    }

    // 舗装に描かれた星（死者の座標）
    for (int i = 0; i < 3; i++) {
      vec2 c = vec2(-0.170 + float(i) * 0.170, -0.062);
      for (int k = 0; k < 3; k++) {
        float a = float(k) / 3.0 * PI;
        INK += seg(p, c - vec2(cos(a), sin(a)) * 0.014,
                      c + vec2(cos(a), sin(a)) * 0.014, 0.0016) * t;
      }
      LIN += ring(p, c, 0.026, 0.0009) * t * 0.6;
    }
  }

  // ======================================================================
  // 07 ピアノ階段 — 用途転換
  //   変容前: 段の断面。隣にエスカレータの斜線。
  //   実行後: 踏面が鍵盤に置き換わり、踏むと音が返る。
  // ======================================================================
  void plateStairs(vec2 p, float t) {
    // 階段。躯体を面として置く。
    for (int i = 0; i < 7; i++) {
      float fj = float(i);
      float x0 = -0.270 + fj * 0.062;
      float y0 = -0.300 + fj * 0.070;
      INK += box(p, vec2(x0 + 0.031, (y0 - 0.360) * 0.5), vec2(0.031, (y0 + 0.360) * 0.5)) * 0.13;
    }
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float x0 = -0.270 + fi * 0.062;
      float y0 = -0.300 + fi * 0.070;
      LIN += seg(p, vec2(x0, y0), vec2(x0 + 0.062, y0), 0.0014);
      LIN += seg(p, vec2(x0 + 0.062, y0), vec2(x0 + 0.062, y0 + 0.070), 0.0014);

      // 踏面が鍵盤になる
      float key = box(p, vec2(x0 + 0.031, y0 + 0.011), vec2(0.026, 0.010));
      float black = step(0.5, mod(fi, 2.0));
      INK += key * t * mix(1.0, 0.0, black);
      LIN += frame(p, vec2(x0 + 0.031, y0 + 0.011), vec2(0.026, 0.010), 0.0010) * t;

      // 鳴った音
      float snd = ring(p, vec2(x0 + 0.031, y0 + 0.011), 0.022 + 0.009 * fi, 0.0010);
      ACC += snd * t * smoothstep(fi / 8.0, fi / 8.0 + 0.4, t) * 0.55;
    }

    // 隣に残されたエスカレータ
    LIN += seg(p, vec2(-0.250, 0.290), vec2(0.230, -0.055), 0.0012) * 0.8;
    LIN += seg(p, vec2(-0.250, 0.330), vec2(0.230, -0.015), 0.0012) * 0.8;
    for (int i = 0; i < 6; i++) {
      float s = float(i) / 5.0;
      vec2 c = mix(vec2(-0.240, 0.310), vec2(0.220, -0.035), s);
      INK += box(p, c, vec2(0.010, 0.010)) * (1.0 - t * 0.5);
    }
  }

  // ======================================================================
  // 08 零時政府 — 命名
  //   変容前: 一本の系統樹。末端に閉じた輪がひとつ。
  //   実行後: 輪の一文字が置き換わり、隣に同じ形の別版が生える。
  // ======================================================================
  void plateG0v(vec2 p, float t) {
    // 公式の系統。左側の一本。
    vec2 root = vec2(-0.235, 0.310);
    LIN += seg(p, root, root + vec2(0.0, -0.560), 0.0016);
    INK += box(p, root, vec2(0.014, 0.014));
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float y = 0.235 - fi * 0.118;
      float len = 0.086 + 0.030 * hash11(fi + uSeed);
      LIN += seg(p, vec2(root.x, y), vec2(root.x + len, y), 0.0013);
      INK += box(p, vec2(root.x + len, y), vec2(0.012, 0.012));
      for (int k = 0; k < 2; k++) {
        float fk = float(k);
        float sub = 0.034 + 0.024 * hash11(fi * 3.0 + fk + uSeed);
        vec2 e = vec2(root.x + len + sub, y - 0.026 + fk * 0.052);
        LIN += seg(p, vec2(root.x + len, y), e, 0.0011);
        INK += box(p, e, vec2(0.008, 0.008));
      }
    }

    // 住所の一文字。塗りつぶしの輪から、抜きの輪へ。
    vec2 nodeC = vec2(-0.235, -0.302);
    LIN += seg(p, vec2(-0.235, -0.250), nodeC, 0.0013);
    INK += fillOf(length(p - nodeC) - 0.026) * (1.0 - t);
    LIN += ring(p, nodeC, 0.026, 0.0022) * t;
    ACC += ring(p, nodeC, 0.026, 0.0026) * t;
    ACC += seg(p, nodeC + vec2(-0.016, -0.022), nodeC + vec2(0.016, 0.022), 0.0020) * t;

    // 置き換わった一文字から、同じ形の別版が生える。
    float grow = smoothstep(0.10, 0.95, t);
    vec2 root2 = vec2(0.075, 0.310);
    ACC += seg(p, nodeC + vec2(0.030, 0.010), vec2(root2.x, -0.250), 0.0013) * grow;
    ACC += seg(p, vec2(root2.x, -0.250), root2 * vec2(1.0, 1.0), 0.0015) * grow;
    ACC += box(p, root2, vec2(0.013, 0.013)) * grow;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float y = 0.235 - fi * 0.118;
      float g2 = smoothstep(0.15 + fi * 0.11, 0.45 + fi * 0.11, t);
      float len = 0.086 + 0.030 * hash11(fi + uSeed);
      ACC += seg(p, vec2(root2.x, y), vec2(root2.x + len, y), 0.0013) * g2;
      ACC += box(p, vec2(root2.x + len, y), vec2(0.012, 0.012)) * g2;
      for (int k = 0; k < 2; k++) {
        float fk = float(k);
        float sub = 0.034 + 0.024 * hash11(fi * 3.0 + fk + uSeed);
        vec2 e = vec2(root2.x + len + sub, y - 0.026 + fk * 0.052);
        ACC += seg(p, vec2(root2.x + len, y), e, 0.0011) * g2;
        ACC += box(p, e, vec2(0.008, 0.008)) * g2;
      }
    }
  }

  // ======================================================================
  // 09 愛はゴミ箱の中に — 消去
  //   変容前: 額に収まった一枚。落札の記録が並ぶ。
  //   実行後: 下半分が短冊になり、額の内側に残る。
  // ======================================================================
  void plateShred(vec2 p, float t) {
    vec2 fc = vec2(0.0, 0.030);
    vec2 fh = vec2(0.205, 0.230);
    LIN += frame(p, fc, fh, 0.0026);
    LIN += frame(p, fc, fh - 0.014, 0.0010);

    float cut = fc.y + 0.010;

    // 上半分は残る
    INK += box(p, vec2(fc.x, (cut + fc.y + fh.y - 0.020) * 0.5),
                  vec2(fh.x - 0.026, (fc.y + fh.y - 0.020 - cut) * 0.5)) * 0.88;

    // 下半分。変容前は一枚の面、実行後だけ短冊に割れる。
    float hLow = (cut - (fc.y - fh.y + 0.020)) * 0.5;
    vec2 cLow = vec2(fc.x, (cut + fc.y - fh.y + 0.020) * 0.5);
    INK += box(p, cLow, vec2(fh.x - 0.026, hLow)) * 0.88 * (1.0 - t);
    for (int i = 0; i < 13; i++) {
      float fi = float(i);
      float x = fc.x - 0.1656 + fi * 0.0276;
      float drop = (0.026 + 0.048 * hash11(fi * 4.1 + uSeed)) * t;
      vec2 c = vec2(x, cLow.y - drop);
      INK += box(p, c, vec2(0.0104, hLow)) * 0.88 * t;
    }

    // 裁断の線
    ACC += seg(p, vec2(fc.x - fh.x + 0.020, cut), vec2(fc.x + fh.x - 0.020, cut), 0.0018) * t;

    // 額の下に開いた口
    LIN += seg(p, vec2(fc.x - 0.176, fc.y - fh.y + 0.020),
                  vec2(fc.x + 0.176, fc.y - fh.y + 0.020), 0.0013) * t;

    // 落札の記録
    LIN += seg(p, vec2(-0.24, -0.320), vec2(0.24, -0.320), 0.0009);
    INK += box(p, vec2(-0.180, -0.300), vec2(0.038, 0.008));
    ACC += box(p, vec2(0.075, -0.300), vec2(0.145, 0.010)) * t;
  }

  // ======================================================================
  // 10 ATMリーダーボード — 可視化
  //   変容前: 閉じた箱が同じ大きさで並ぶ。中の数値は外から見えない。
  //   実行後: 数値が抜き出され、大きい順に並び替えられる。
  // ======================================================================
  void plateAtm(vec2 p, float t) {
    LIN += seg(p, vec2(-0.268, 0.352), vec2(0.268, 0.352), 0.0012);
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float v = 0.10 + 0.85 * hash11(fi * 7.7 + uSeed);
      float y = 0.290 - fi * 0.086;

      // 残高の大きい順に並べ替える
      float rank = 0.0;
      for (int j = 0; j < 8; j++) {
        float vj = 0.10 + 0.85 * hash11(float(j) * 7.7 + uSeed);
        rank += step(v, vj);
      }
      rank -= 1.0;
      float cy = mix(y, 0.290 - rank * 0.086, t);

      // 閉じた箱。中身は外から見えない。
      LIN += frame(p, vec2(-0.238, cy), vec2(0.034, 0.034), 0.0016);
      INK += box(p, vec2(-0.238, cy), vec2(0.020, 0.020)) * (1.0 - t);

      // 抜き出された数値
      float len = (0.020 + 0.400 * v) * t;
      float bar = box(p, vec2(-0.186 + len, cy), vec2(len, 0.022));
      INK += bar;
      if (i == 0) ACC += bar;
      LIN += seg(p, vec2(-0.186, cy - 0.036), vec2(-0.186, cy + 0.036), 0.0011) * t;
    }
    LIN += seg(p, vec2(-0.186, -0.372), vec2(-0.186, 0.330), 0.0013) * t;
    ACC += seg(p, vec2(-0.268, 0.352), vec2(0.268, 0.352), 0.0018) * t;
  }

  // ======================================================================
  void main() {
    float ar = uSize.x / uSize.y;
    vec2 p = vUv - 0.5;
    vec2 pa = vec2(p.x * ar, p.y);

    AA = fwidth(pa.x) * 0.85 + 1e-6;

    float t = uProgress;
    float te = t * t * (3.0 - 2.0 * t);

    INK = 0.0; ACC = 0.0; LIN = 0.0;

    float id = uPlate;
    if      (id < 0.5) plateFountain(pa, te);
    else if (id < 1.5) plateTactile(pa, te);
    else if (id < 2.5) plateWoonerf(pa, te);
    else if (id < 3.5) plateGrameen(pa, te);
    else if (id < 4.5) plateWrapped(pa, te);
    else if (id < 5.5) plateMime(pa, te);
    else if (id < 6.5) plateStairs(pa, te);
    else if (id < 7.5) plateG0v(pa, te);
    else if (id < 8.5) plateShred(pa, te);
    else               plateAtm(pa, te);

    // ---- 紙 ----
    vec3 col = uPaper;
    float grain = vnoise(vUv * 430.0) * 0.55 + vnoise(vUv * 1150.0) * 0.45;
    col -= (grain - 0.5) * uGrain;
    col -= (vnoise(vUv * 3.0 + uSeed * 3.0) - 0.5) * 0.014;

    // ---- 版面の柱 ----
    float hx = 0.5 * ar - 0.040;
    float hy = 0.462;

    float head = box(pa, vec2(-hx + 0.026, hy - 0.020), vec2(0.026, 0.0072));
    // 版番号を刻む。図版ごとに本数が変わる。
    for (int k = 0; k < 10; k++) {
      float on = step(float(k), uPlate);
      head += box(pa, vec2(-hx + 0.068 + float(k) * 0.0125, hy - 0.020),
                  vec2(0.0042, 0.0072)) * on;
    }
    float headRule = seg(pa, vec2(-hx, hy - 0.048), vec2(hx, hy - 0.048), 0.0008);

    float scaleBar = seg(pa, vec2(hx - 0.116, -hy + 0.024), vec2(hx, -hy + 0.024), 0.0008);
    float divs = 2.0 + mod(uPlate, 4.0);
    for (int k = 0; k < 6; k++) {
      if (float(k) > divs) break;
      float fx = hx - 0.116 + float(k) * (0.116 / divs);
      scaleBar += seg(pa, vec2(fx, -hy + 0.024), vec2(fx, -hy + 0.038), 0.0008);
    }

    // 四隅のトンボ
    vec2 th = vec2(hx, hy);
    vec2 aq = abs(pa);
    float ticks = strokeOf(aq.y - th.y, 0.0011) * step(aq.x, th.x) * step(th.x - 0.046, aq.x)
                + strokeOf(aq.x - th.x, 0.0011) * step(aq.y, th.y) * step(th.y - 0.046, aq.y);

    LIN += headRule * 0.55 + clamp(scaleBar, 0.0, 1.0) * 0.6;

    // ---- 合成 ----
    col = mix(col, uInk, clamp(INK, 0.0, 1.0) * 0.92);
    col = mix(col, uInk, clamp(LIN, 0.0, 1.0) * 0.62);
    col = mix(col, uInk, clamp(head, 0.0, 1.0) * 0.90);
    col = mix(col, uInk, clamp(ticks, 0.0, 1.0) * 0.34);
    col = mix(col, uAccent, clamp(ACC, 0.0, 1.0) * 0.94);

    // 帯の中で「いまどの版の話か」を示す小さな鉤
    float mk = strokeOf(sdSeg(pa, vec2(-hx, hy), vec2(-hx + 0.030, hy)), 0.0020)
             + strokeOf(sdSeg(pa, vec2(-hx, hy), vec2(-hx, hy - 0.030)), 0.0020);
    col = mix(col, uAccent, clamp(mk, 0.0, 1.0) * uFocus);

    // ---- 版の小口 ----
    vec2 hs = vec2(0.5 * ar, 0.5);
    float sd = sdBox(pa, hs);
    float alpha = 1.0 - smoothstep(-AA, AA, sd);
    col = mix(col, uInk, (1.0 - smoothstep(0.0, 0.0032, -sd)) * 0.16);

    alpha *= uFade * uAppear;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** 版の落ち影。板が空間に浮いていることを地の側で示す。 */
export const shadowVertexShader = plateVertexShader;

export const shadowFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uSize;      // 影の板の寸法
  uniform vec2 uPlate;     // 版面の寸法
  uniform float uFade;
  uniform float uAppear;
  varying vec2 vUv;

  float sdBox(vec2 p, vec2 h) {
    vec2 d = abs(p) - h;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    // 右下へわずかに落とす
    float d = sdBox(p - vec2(0.012, -0.016), uPlate * 0.5);
    float a = (1.0 - smoothstep(0.0, 0.075, d)) * 0.20;
    a *= uFade * uAppear;
    if (a < 0.002) discard;
    gl_FragColor = vec4(0.07, 0.065, 0.06, a);
  }
`;
