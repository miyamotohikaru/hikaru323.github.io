"use client";

// WebAudio合成による全SFX。音声ファイルは一切使わず、コードだけで鳴らす。
// 「ピコピコ安物」にしないための道具立て:
//   - exponentialRamp のエンベロープ(アタック/ディケイ)
//   - バンドパス/ローパスのスイープ(ヒュッ・シャキーン系)
//   - 共有ノイズバッファ(打撃・シンバル・噴射)
//   - 倍音を重ねたベル音色(ファンファーレ・トロフィー・オルゴール)
//   - FeedbackDelay 風のセンドバス(キラキラの余韻)
//
// グラフ:
//   音源 → sfxBus / ambientBus ─→ master(ミュート制御) → コンプレッサ → 出力
//   音源 --(send)--> delaySend → delay ⇄ feedback → wet → master

/** 初期化済みオーディオグラフ。ambient.ts もここに接続する */
export interface AudioGraph {
  ctx: AudioContext;
  /** ミュート制御対象。全音がここを通る */
  master: GainNode;
  /** SFX用バス */
  sfxBus: GainNode;
  /** 環境音用バス(SFXよりずっと小さく運用する) */
  ambientBus: GainNode;
  /** FeedbackDelay風エコーへのセンド入力 */
  delaySend: GainNode;
  /** 共有ホワイトノイズ(1.5秒) */
  noise: AudioBuffer;
}

let graph: AudioGraph | null = null;

/**
 * AudioContext を生成/再開する。**必ずユーザージェスチャ内で呼ぶこと**。
 * 2回目以降は既存グラフを返す(suspendedなら resume を試みる)。
 */
export function initAudio(): AudioGraph | null {
  if (graph) {
    if (graph.ctx.state === "suspended") void graph.ctx.resume();
    return graph;
  }
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();

  // ── マスターチェーン: master → コンプレッサ → 出力 ──
  const master = ctx.createGain();
  master.gain.value = 1;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; // 重なった瞬間だけ軽く潰してクリッピング防止
  comp.knee.value = 24;
  comp.ratio.value = 5;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  master.connect(comp);
  comp.connect(ctx.destination);

  // ── バス ──
  const sfxBus = ctx.createGain();
  sfxBus.gain.value = 1;
  sfxBus.connect(master);
  const ambientBus = ctx.createGain();
  ambientBus.gain.value = 0.9; // 個々の環境音はさらに極小ゲインで鳴らす
  ambientBus.connect(master);

  // ── FeedbackDelay風エコー(キラキラ系の余韻) ──
  const delaySend = ctx.createGain();
  delaySend.gain.value = 1;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.27;
  const delayTone = ctx.createBiquadFilter(); // 反復のたびに丸くなる
  delayTone.type = "lowpass";
  delayTone.frequency.value = 3200;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.34;
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  delaySend.connect(delay);
  delay.connect(delayTone);
  delayTone.connect(feedback);
  feedback.connect(delay);
  delayTone.connect(wet);
  wet.connect(master);

  // ── 共有ノイズバッファ ──
  const noise = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 1.5),
    ctx.sampleRate
  );
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  graph = { ctx, master, sfxBus, ambientBus, delaySend, noise };
  if (ctx.state === "suspended") void ctx.resume();
  return graph;
}

/** 初期化済みグラフ(ambient.ts が使う)。未初期化なら null */
export function getAudioGraph(): AudioGraph | null {
  return graph;
}

/** AudioContext が生成済みか */
export function isAudioReady(): boolean {
  return graph !== null;
}

/** ミュート即時反映。マスターGainを短いランプで0/1へ(クリック音防止) */
export function setMuted(muted: boolean): void {
  if (!graph) return;
  const t = graph.ctx.currentTime;
  graph.master.gain.cancelScheduledValues(t);
  graph.master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.015);
}

/** タブ非表示時に呼ぶ */
export function suspendAudio(): void {
  if (graph && graph.ctx.state === "running") void graph.ctx.suspend();
}

/** タブ復帰時に呼ぶ */
export function resumeAudio(): void {
  if (graph && graph.ctx.state === "suspended") void graph.ctx.resume();
}

// ══════════════════════════════════════════════════════
// 内部ヘルパー
// ══════════════════════════════════════════════════════

/** 再生できる状態のグラフ。suspended中は音を積まない(復帰時の音塊防止) */
function ready(): AudioGraph | null {
  return graph && graph.ctx.state === "running" ? graph : null;
}

/** pan≠0 なら StereoPanner を dest の手前に挟み、音源の接続先を返す */
function withPan(
  g: AudioGraph,
  dest: AudioNode,
  pan: number | undefined
): AudioNode {
  if (!pan || typeof g.ctx.createStereoPanner !== "function") return dest;
  const p = g.ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  p.connect(dest);
  return p;
}

/** エンベロープ後の信号をディレイセンドへ分岐 */
function tapSend(g: AudioGraph, from: AudioNode, amount: number | undefined) {
  if (!amount) return;
  const s = g.ctx.createGain();
  s.gain.value = amount;
  from.connect(s);
  s.connect(g.delaySend);
}

interface FilterOpts {
  type: BiquadFilterType;
  freq: number;
  q?: number;
  /** スイープ先周波数(sweepTime かけて exponentialRamp) */
  sweepTo?: number;
  sweepTime?: number;
}

function makeFilter(g: AudioGraph, o: FilterOpts, t0: number): BiquadFilterNode {
  const f = g.ctx.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.freq, t0);
  if (o.sweepTo !== undefined) {
    f.frequency.exponentialRampToValueAtTime(o.sweepTo, t0 + (o.sweepTime ?? 0.2));
  }
  if (o.q !== undefined) f.Q.value = o.q;
  return f;
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  /** [t0からの秒, 周波数] の列でグリッサンド */
  glide?: ReadonlyArray<readonly [number, number]>;
  /** 発音開始のオフセット秒 */
  at?: number;
  attack?: number;
  /** ピークから無音までの秒 */
  decay: number;
  peak: number;
  detune?: number;
  filter?: FilterOpts;
  /** ディレイセンド量 0..1 */
  send?: number;
  pan?: number;
  bus?: AudioNode;
}

/** オシレータ1本 + エンベロープ(+フィルタ/パン/センド) */
function tone(o: ToneOpts): void {
  const g = ready();
  if (!g) return;
  const t0 = g.ctx.currentTime + (o.at ?? 0);
  const attack = o.attack ?? 0.004;

  const osc = g.ctx.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glide) {
    for (const [dt, f] of o.glide) {
      osc.frequency.exponentialRampToValueAtTime(f, t0 + dt);
    }
  }
  if (o.detune) osc.detune.value = o.detune;

  const amp = g.ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(o.peak, t0 + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + o.decay);

  let src: AudioNode = osc;
  if (o.filter) {
    const f = makeFilter(g, o.filter, t0);
    src.connect(f);
    src = f;
  }
  src.connect(amp);
  amp.connect(withPan(g, o.bus ?? g.sfxBus, o.pan));
  tapSend(g, amp, o.send);

  osc.start(t0);
  osc.stop(t0 + attack + o.decay + 0.05);
}

interface NoiseOpts {
  at?: number;
  attack?: number;
  decay: number;
  peak: number;
  filter?: FilterOpts;
  send?: number;
  pan?: number;
  bus?: AudioNode;
}

/** ノイズバースト + エンベロープ(+フィルタ/パン/センド) */
function noiseHit(o: NoiseOpts): void {
  const g = ready();
  if (!g) return;
  const t0 = g.ctx.currentTime + (o.at ?? 0);
  const attack = o.attack ?? 0.003;

  const src = g.ctx.createBufferSource();
  src.buffer = g.noise;
  src.loop = true; // 長い減衰でも途切れないように

  const amp = g.ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(o.peak, t0 + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + o.decay);

  let head: AudioNode = src;
  if (o.filter) {
    const f = makeFilter(g, o.filter, t0);
    head.connect(f);
    head = f;
  }
  head.connect(amp);
  amp.connect(withPan(g, o.bus ?? g.sfxBus, o.pan));
  tapSend(g, amp, o.send);

  src.start(t0);
  src.stop(t0 + attack + o.decay + 0.05);
}

interface BellOpts {
  freq: number;
  at?: number;
  peak: number;
  decay: number;
  /** [倍音比, 相対音量] の列。省略時は明るいベル */
  partials?: ReadonlyArray<readonly [number, number]>;
  send?: number;
  pan?: number;
}

/** 倍音を重ねたベル。高い倍音ほど速く減衰させて金属感を出す */
function bell(o: BellOpts): void {
  const partials = o.partials ?? [
    [1, 1],
    [2, 0.4],
    [3, 0.15],
  ];
  for (const [ratio, amp] of partials) {
    tone({
      type: "sine",
      freq: o.freq * ratio,
      at: o.at,
      attack: 0.002,
      decay: ratio > 2 ? o.decay / 1.8 : o.decay,
      peak: o.peak * amp,
      send: o.send,
      pan: o.pan,
    });
  }
}

// ══════════════════════════════════════════════════════
// 公開SFX
// ══════════════════════════════════════════════════════

/** まるいポップ音(ボタン押下など汎用UI) */
export function uiTap(): void {
  if (!ready()) return;
  tone({ type: "sine", freq: 520, glide: [[0.07, 800]], decay: 0.12, peak: 0.2 });
  tone({ type: "triangle", freq: 1560, attack: 0.002, decay: 0.05, peak: 0.05 });
}

/** ごく小さいクリック(穴ホバー) */
export function hover(): void {
  if (!ready()) return;
  noiseHit({
    attack: 0.001,
    decay: 0.03,
    peak: 0.05,
    filter: { type: "highpass", freq: 3800 },
  });
  tone({ type: "sine", freq: 1900, attack: 0.001, decay: 0.03, peak: 0.03 });
}

/** シャキーン: 高域へ抜けるスイープ + キラの2音 */
export function swordRaise(): void {
  if (!ready()) return;
  noiseHit({
    attack: 0.01,
    decay: 0.26,
    peak: 0.16,
    filter: { type: "bandpass", freq: 1400, q: 5, sweepTo: 7400, sweepTime: 0.22 },
    send: 0.3,
  });
  // 金属のエッジ
  tone({
    type: "sawtooth",
    freq: 1244.5,
    attack: 0.005,
    decay: 0.12,
    peak: 0.05,
    filter: { type: "highpass", freq: 1800 },
  });
  // キラ
  tone({ type: "sine", freq: 2793.8, at: 0.12, decay: 0.5, peak: 0.07, send: 0.55, pan: -0.2 });
  tone({ type: "sine", freq: 3520.0, at: 0.16, decay: 0.55, peak: 0.06, send: 0.6, pan: 0.25 });
}

/** ヒュッ: バンドパスを下降スイープするノイズ */
export function thrust(): void {
  if (!ready()) return;
  noiseHit({
    attack: 0.012,
    decay: 0.17,
    peak: 0.3,
    filter: { type: "bandpass", freq: 3400, q: 1.4, sweepTo: 320, sweepTime: 0.16 },
  });
}

/** ドスッ: 低いサインのピッチ落ち + ノイズバースト */
export function impact(): void {
  if (!ready()) return;
  tone({ type: "sine", freq: 135, glide: [[0.2, 40]], attack: 0.003, decay: 0.3, peak: 0.6 });
  noiseHit({
    decay: 0.11,
    peak: 0.35,
    filter: { type: "lowpass", freq: 850, sweepTo: 160, sweepTime: 0.1 },
  });
  // 打撃のエッジ
  noiseHit({ decay: 0.03, peak: 0.1, filter: { type: "highpass", freq: 2500 } });
}

// ── suspense: ドクン…ドクン…の心拍ループ ─────────────

let heartTimer: ReturnType<typeof setTimeout> | null = null;
let heartActive = false;

/** 心拍1発(ドッ)。strength で「ドッ/クン」の強弱をつける */
function heartThump(at: number, strength: number): void {
  tone({
    type: "sine",
    freq: 62,
    glide: [[0.09, 38]],
    at,
    attack: 0.005,
    decay: 0.16,
    peak: 0.5 * strength,
  });
  noiseHit({
    at,
    decay: 0.05,
    peak: 0.12 * strength,
    filter: { type: "lowpass", freq: 300 },
  });
}

/** 心拍ループ開始(だんだん速くなる)。多重呼び出しは無視 */
export function startSuspense(): void {
  if (heartActive) return;
  heartActive = true;
  let interval = 0.95;
  const beat = () => {
    if (!heartActive) return;
    heartThump(0, 1); // ドッ
    heartThump(0.17, 0.6); // クン
    interval = Math.max(0.55, interval * 0.93); // 緊張が高まる
    heartTimer = setTimeout(beat, interval * 1000);
  };
  beat();
}

/** 心拍ループ停止 */
export function stopSuspense(): void {
  heartActive = false;
  if (heartTimer) {
    clearTimeout(heartTimer);
    heartTimer = null;
  }
}

/** ほっ: 下降2音 + ため息風ノイズ */
export function safe(): void {
  if (!ready()) return;
  tone({
    type: "triangle",
    freq: 659.25, // E5
    decay: 0.28,
    peak: 0.15,
    filter: { type: "lowpass", freq: 2200 },
    send: 0.2,
  });
  tone({
    type: "triangle",
    freq: 523.25, // C5
    at: 0.15,
    decay: 0.4,
    peak: 0.14,
    filter: { type: "lowpass", freq: 2000 },
    send: 0.2,
  });
  // ため息
  noiseHit({
    at: 0.1,
    attack: 0.09,
    decay: 0.5,
    peak: 0.06,
    filter: { type: "lowpass", freq: 1400, sweepTo: 350, sweepTime: 0.5 },
  });
}

/** ジャーン: 明るい和音のストラム + シンバル風ノイズ(当たりの瞬間) */
export function winFlash(): void {
  if (!ready()) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => {
    tone({
      type: "sawtooth",
      freq: f,
      at: i * 0.025,
      attack: 0.01,
      decay: 1.0,
      peak: 0.1,
      filter: { type: "lowpass", freq: 2600, q: 0.7 },
      send: 0.35,
      pan: (i - 1.5) * 0.15,
    });
  });
  noiseHit({
    attack: 0.005,
    decay: 1.2,
    peak: 0.2,
    filter: { type: "highpass", freq: 5200 },
    send: 0.3,
  });
  // 底を支えるドン
  tone({ type: "sine", freq: 98, glide: [[0.3, 60]], decay: 0.45, peak: 0.25 });
}

/** ロケット発射: ノイズのローパスが開いて閉じる + 上昇グリッサンド + 地響き */
export function launch(): void {
  const g = ready();
  if (!g) return;
  const t0 = g.ctx.currentTime;

  // 噴射(ローパスの開き→減衰)
  const src = g.ctx.createBufferSource();
  src.buffer = g.noise;
  src.loop = true;
  const f = g.ctx.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 0.8;
  f.frequency.setValueAtTime(160, t0);
  f.frequency.exponentialRampToValueAtTime(5200, t0 + 2.6);
  f.frequency.exponentialRampToValueAtTime(700, t0 + 4.6);
  const amp = g.ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.34, t0 + 0.7);
  amp.gain.setValueAtTime(0.34, t0 + 2.8);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.8);
  src.connect(f);
  f.connect(amp);
  amp.connect(g.sfxBus);
  src.start(t0);
  src.stop(t0 + 5);

  // 上昇グリッサンド(2声)
  tone({
    type: "sawtooth",
    freq: 85,
    glide: [[3.2, 900]],
    attack: 0.5,
    decay: 3.6,
    peak: 0.06,
    filter: { type: "lowpass", freq: 400, sweepTo: 2400, sweepTime: 3.2 },
    send: 0.25,
  });
  tone({ type: "sine", freq: 170, glide: [[3.2, 1800]], attack: 0.6, decay: 3.4, peak: 0.05, send: 0.4 });

  // 地響き
  tone({ type: "sine", freq: 42, glide: [[1.8, 30]], attack: 0.05, decay: 2.0, peak: 0.22 });
}

/** パパパン: 破裂3連 + キラキラ高音の散らし(上空の花火) */
export function fireworks(): void {
  if (!ready()) return;
  const bursts: ReadonlyArray<readonly [number, number]> = [
    [0, -0.45],
    [0.17, 0.4],
    [0.33, -0.05],
  ];
  for (const [at, pan] of bursts) {
    noiseHit({
      at,
      decay: 0.22,
      peak: 0.32,
      filter: { type: "bandpass", freq: 1400, q: 0.9, sweepTo: 240, sweepTime: 0.2 },
      pan,
    });
    tone({ type: "sine", freq: 180, glide: [[0.12, 62]], at, decay: 0.18, peak: 0.24, pan });
  }
  // キラキラの散らし
  for (let i = 0; i < 11; i++) {
    tone({
      type: "sine",
      freq: 1600 + Math.random() * 2800,
      at: 0.15 + Math.random() * 1.0,
      attack: 0.002,
      decay: 0.3 + Math.random() * 0.35,
      peak: 0.028 + Math.random() * 0.025,
      pan: (Math.random() * 2 - 1) * 0.8,
      send: 0.6,
    });
  }
}

/** 勝利ファンファーレ: I-IV-V-I のベルアルペジオ(約2秒) */
export function fanfare(): void {
  if (!ready()) return;
  const chords: ReadonlyArray<{
    at: number;
    notes: readonly number[];
    decay: number;
    peak: number;
  }> = [
    { at: 0, notes: [523.25, 659.25, 783.99], decay: 0.5, peak: 0.16 }, // C (I)
    { at: 0.42, notes: [523.25, 698.46, 880.0], decay: 0.5, peak: 0.16 }, // F (IV)
    { at: 0.84, notes: [587.33, 783.99, 987.77], decay: 0.55, peak: 0.17 }, // G (V)
    { at: 1.26, notes: [523.25, 659.25, 783.99, 1046.5], decay: 1.3, peak: 0.2 }, // C (I)
  ];
  for (const c of chords) {
    c.notes.forEach((f, i) => {
      bell({
        freq: f,
        at: c.at + i * 0.06,
        peak: c.peak,
        decay: c.decay,
        send: 0.35,
        pan: (i - 1) * 0.2,
      });
    });
  }
  // ベースと締めのシンバル
  tone({ type: "triangle", freq: 130.81, decay: 0.4, peak: 0.12 });
  tone({ type: "triangle", freq: 174.61, at: 0.42, decay: 0.4, peak: 0.12 });
  tone({ type: "triangle", freq: 196.0, at: 0.84, decay: 0.4, peak: 0.12 });
  tone({ type: "triangle", freq: 130.81, at: 1.26, decay: 1.0, peak: 0.14 });
  noiseHit({
    at: 1.26,
    attack: 0.01,
    decay: 1.1,
    peak: 0.1,
    filter: { type: "highpass", freq: 6000 },
    send: 0.3,
  });
}

/** キラーン: 倍音ベル(トロフィー授与) */
export function trophy(): void {
  if (!ready()) return;
  // グレースノート → 本命の順で「キ・ラーン」
  bell({ freq: 987.77, peak: 0.12, decay: 0.5, send: 0.5 });
  bell({
    freq: 1318.5,
    at: 0.09,
    peak: 0.24,
    decay: 1.5,
    partials: [
      [1, 1],
      [2.0, 0.4],
      [2.76, 0.22], // わずかに非整数倍音で金属感
      [5.4, 0.07],
    ],
    send: 0.6,
  });
  tone({ type: "sine", freq: 3951.1, at: 0.09, decay: 0.7, peak: 0.04, send: 0.7, pan: 0.3 });
}

/** オルゴール風4音モチーフ(新こすくまくん降臨) */
export function newRound(): void {
  if (!ready()) return;
  const motif: ReadonlyArray<readonly [number, number]> = [
    [783.99, 0], // G5
    [1046.5, 0.19], // C6
    [1318.5, 0.38], // E6
    [1568.0, 0.57], // G6
  ];
  motif.forEach(([f, at], i) => {
    bell({
      freq: f,
      at,
      peak: 0.14,
      decay: i === motif.length - 1 ? 1.2 : 0.7,
      partials: [
        [1, 1],
        [3.9, 0.12], // オルゴールの「チーン」成分
      ],
      send: 0.5,
      pan: (i - 1.5) * 0.25,
    });
  });
}

/** ぷぷっ: 柔らかい2音下降(クールダウン・先を越された等) */
export function error(): void {
  if (!ready()) return;
  tone({
    type: "triangle",
    freq: 392.0, // G4
    attack: 0.008,
    decay: 0.12,
    peak: 0.14,
    filter: { type: "lowpass", freq: 1000 },
  });
  tone({
    type: "triangle",
    freq: 311.1, // Eb4
    at: 0.13,
    attack: 0.008,
    decay: 0.16,
    peak: 0.13,
    filter: { type: "lowpass", freq: 900 },
  });
}
