/* 図解。すべて inline SVG（画像ファイルは置かない）。
 *
 * 描き方の決め事:
 *  - 平面・ベタ塗り・角は立てる。グラデーションと影は使わない
 *  - 線は 2px でそろえる。こすくまくんの太い輪郭と同じ重さに見せる
 *  - 色は3つだけ: 線(--ink) / 面(--cream) / 面2(--muted-fill)
 * こすくまくん本体だけは公式ベクターの Kosukuma を使い、図の中では簡略な箱で示す。
 */

const INK = "var(--ink)";
const CREAM = "var(--cream)";
const SOFT = "var(--soft)";

type P = { className?: string };
const box = { fill: "none", stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const };

/** 小さなこすくまくん（図の中の記号として使う簡略形） */
function Bear({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-7" cy="-9" r="4.5" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="7" cy="-9" r="4.5" fill={CREAM} stroke={INK} strokeWidth="2" />
      <rect x="-11" y="-12" width="22" height="24" rx="9" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="-4" cy="-2" r="1.4" fill={INK} />
      <circle cx="4" cy="-2" r="1.4" fill={INK} />
    </g>
  );
}

/* ── できること ─────────────────────────────── */

export function DiagEyes({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <Bear x={44} y={44} />
      <path d="M64 30 L96 20" stroke={INK} strokeWidth="2" strokeDasharray="3 4" />
      <path d="M96 20 l-9 1 l5 6 z" fill={INK} />
    </svg>
  );
}

export function DiagStretch({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <rect x="42" y="14" width="24" height="52" rx="11" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="47" cy="12" r="4" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="61" cy="12" r="4" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="50" cy="22" r="1.4" fill={INK} />
      <circle cx="58" cy="22" r="1.4" fill={INK} />
      <path d="M54 8 v-4" stroke={INK} strokeWidth="2" />
      <path d="M54 4 l-4 4 M54 4 l4 4" stroke={INK} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function DiagKeys({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <Bear x={60} y={36} />
      <g {...box}>
        <path d="M34 56 h26 l6 8 H40 z" fill={SOFT} />
        <path d="M62 56 h26 l6 8 H68 z" fill={SOFT} />
      </g>
      <path d="M64 64 h26 l0 4 H68 z" fill={INK} opacity=".25" />
      <path d="M24 44 l-5 -5 M24 52 l-7 0" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export function DiagEdge({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <rect x="26" y="34" width="72" height="36" rx="4" fill={SOFT} stroke={INK} strokeWidth="2" />
      <path d="M26 44 h72" stroke={INK} strokeWidth="2" />
      <g clipPath="url(#cutEdge)">
        <Bear x={72} y={34} />
      </g>
      <defs>
        <clipPath id="cutEdge">
          <rect x="0" y="0" width="120" height="34" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function DiagSleep({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <ellipse cx="56" cy="52" rx="26" ry="15" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="36" cy="42" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
      <path d="M42 52 h5 M52 52 h5" stroke={INK} strokeWidth="2" />
      <text x="80" y="34" fontSize="13" fill={INK} fontFamily="ui-sans-serif, system-ui">z</text>
      <text x="88" y="24" fontSize="10" fill={INK} fontFamily="ui-sans-serif, system-ui">z</text>
    </svg>
  );
}

export function DiagThink({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <Bear x={44} y={50} />
      <rect x="58" y="12" width="50" height="22" rx="3" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M70 22 h26 M70 27 h16" stroke={INK} strokeWidth="2" opacity=".45" />
      <circle cx="54" cy="38" r="3" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="49" cy="43" r="2" fill="#fff" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export function DiagRoll({ className }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <Bear x={40} y={44} />
      <g transform="translate(82 48)">
        <circle r="11" fill={CREAM} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <circle key={i} cx={Math.cos(a) * 11} cy={Math.sin(a) * 11} r="3.4"
                    fill={CREAM} stroke={INK} strokeWidth="2" />
          );
        })}
      </g>
      <path d="M62 62 h26" stroke={INK} strokeWidth="2" strokeDasharray="3 4" />
      <path d="M88 62 l-6 -3 v6 z" fill={INK} />
    </svg>
  );
}

/* ── 入れかた ───────────────────────────────── */

export function StepZip({ className }: P) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <path d="M22 18 h34 l14 14 v34 H22 z" fill={SOFT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 18 v14 h14" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M40 30 h6 v6 h-6 z M46 36 h6 v6 h-6 z M40 42 h6 v6 h-6 z" fill={INK} opacity=".55" />
      <path d="M46 54 v10 M46 64 l-5 -5 M46 64 l5 -5" stroke={INK} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function StepApps({ className }: P) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <path d="M16 26 h20 l5 6 h26 v34 H16 z" fill={SOFT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <Bear x={72} y={30} s={0.8} />
      <path d="M60 44 h-14" stroke={INK} strokeWidth="2" strokeDasharray="3 4" />
      <path d="M46 44 l6 -4 v8 z" fill={INK} />
    </svg>
  );
}

export function StepBlocked({ className }: P) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <rect x="14" y="18" width="72" height="46" rx="5" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M14 28 h72" stroke={INK} strokeWidth="2" />
      <circle cx="50" cy="42" r="11" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <path d="M43 35 l14 14" stroke="var(--accent)" strokeWidth="3" />
    </svg>
  );
}

export function StepAllow({ className }: P) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <rect x="14" y="16" width="72" height="50" rx="5" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M24 30 h34 M24 40 h28" stroke={INK} strokeWidth="2" opacity=".35" />
      <rect x="24" y="48" width="34" height="12" rx="3" fill={CREAM} stroke={INK} strokeWidth="2" />
      <rect x="62" y="48" width="16" height="12" rx="6" fill={CREAM} stroke={INK} strokeWidth="2" />
      <circle cx="72" cy="54" r="4" fill={INK} />
    </svg>
  );
}

export function StepMenubar({ className }: P) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <rect x="10" y="20" width="80" height="14" rx="3" fill={SOFT} stroke={INK} strokeWidth="2" />
      <Bear x={72} y={27} s={0.42} />
      <path d="M18 27 h8 M32 27 h8" stroke={INK} strokeWidth="2" opacity=".35" />
      <path d="M72 42 v10" stroke={INK} strokeWidth="2" strokeDasharray="3 3" />
      <path d="M72 52 l-4 -5 h8 z" fill={INK} />
    </svg>
  );
}
