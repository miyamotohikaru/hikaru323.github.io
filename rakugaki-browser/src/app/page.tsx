import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Background doodles */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        {/* House */}
        <path d="M120 280 L170 230 L220 280 L220 340 L120 340 Z" fill="none" stroke="#d4c9b8" strokeWidth="2"
          strokeDasharray="400" strokeDashoffset="400" style={{ animation: "draw 2s ease 0.2s forwards" }} />
        <rect x="155" y="300" width="30" height="40" fill="none" stroke="#d4c9b8" strokeWidth="1.5"
          strokeDasharray="140" strokeDashoffset="140" style={{ animation: "draw 1.5s ease 1s forwards" }} />
        {/* Flower */}
        <g transform="translate(650, 120)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
            <ellipse key={i} cx={Math.cos(a * Math.PI / 180) * 35} cy={Math.sin(a * Math.PI / 180) * 35}
              rx="22" ry="22" fill="none" stroke="#f4cfc4" strokeWidth="1.5" opacity="0.5"
              strokeDasharray="140" strokeDashoffset="140"
              style={{ animation: `draw 1s ease ${0.3 + i * 0.1}s forwards` }} />
          ))}
        </g>
        {/* Circles */}
        <circle cx="500" cy="450" r="80" fill="none" stroke="#d8d0f0" strokeWidth="1.5" opacity="0.4"
          strokeDasharray="500" strokeDashoffset="500" style={{ animation: "draw 2s ease 0.5s forwards" }} />
        <circle cx="100" cy="480" r="50" fill="none" stroke="#e8626e20" strokeWidth="1.5"
          strokeDasharray="320" strokeDashoffset="320" style={{ animation: "draw 2s ease 0.8s forwards" }} />
        {/* Lines */}
        <path d="M300 500 Q 400 460 550 490" fill="none" stroke="#4ec9a040" strokeWidth="2"
          strokeDasharray="300" strokeDashoffset="300" style={{ animation: "draw 1.5s ease 1s forwards" }} />
        <path d="M50 350 Q 150 380 250 350" fill="none" stroke="#f0c75e40" strokeWidth="2"
          strokeDasharray="250" strokeDashoffset="250" style={{ animation: "draw 1.5s ease 1.2s forwards" }} />
        <path d="M680 400 L 750 380 L 720 350" fill="none" stroke="#e8844a30" strokeWidth="2"
          strokeDasharray="120" strokeDashoffset="120" style={{ animation: "draw 1s ease 1.5s forwards" }} />
      </svg>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", position: "relative", zIndex: 10,
      }}>
        <span style={{ fontSize: 24 }}>✏️</span>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/draw" style={{
            padding: "8px 20px", borderRadius: 20, border: "1px solid #e8e0d8",
            fontSize: 14, color: "#666", background: "#fff",
          }}>描く</Link>
          <Link href="/gallery" style={{
            padding: "8px 20px", borderRadius: 20, border: "1px solid #e8e0d8",
            fontSize: 14, color: "#666", background: "#fff",
          }}>ギャラリー</Link>
        </nav>
      </header>

      {/* Hero */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "40px 40px 20px", position: "relative", zIndex: 10, maxWidth: 700,
      }}>
        <h1 style={{
          fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 900,
          letterSpacing: "0.15em", lineHeight: 1.3, marginBottom: 24,
          animation: "fadeIn 0.6s ease 0.3s both",
        }}>
          ら く が き の<br />ブ ラ ウ ザ
        </h1>
        <p style={{
          color: "#999", fontSize: 16, lineHeight: 1.8, marginBottom: 40,
          animation: "fadeIn 0.6s ease 0.5s both",
        }}>
          どのサイトにも落書きでき、URLでシェアできる。<br />
          みんなの落書きが重なって、ひとつのアートになる。
        </p>
        <div style={{ animation: "slideUp 0.6s ease 0.7s both" }}>
          <Link href="/draw" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#e07a3a", color: "#fff", fontWeight: 700,
            padding: "16px 36px", borderRadius: 40, fontSize: 17,
          }}>
            描きはじめる →
          </Link>
        </div>
      </main>

      {/* Feature descriptions */}
      <div style={{
        display: "flex", gap: 32, padding: "20px 40px 40px",
        position: "relative", zIndex: 10, flexWrap: "wrap",
        animation: "fadeIn 0.6s ease 0.9s both",
        borderTop: "1px solid #ece5dc",
        marginTop: 8,
      }}>
        {[
          { num: "01", title: "自由に落書き", desc: "11種のブラシで、好きなように描ける" },
          { num: "02", title: "URLで共有", desc: "同じページを開いた全員の落書きが重なる" },
          { num: "03", title: "アーカイブ", desc: "累積された落書きがアートとして成立する" },
        ].map((f, i) => (
          <div key={i} style={{ flex: "1 1 180px" }}>
            <span style={{ fontSize: 11, color: "#ccc", fontFamily: "monospace", letterSpacing: "0.1em" }}>{f.num}</span>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 4, marginBottom: 4 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        padding: "16px 40px", textAlign: "center", fontSize: 13, color: "#ccc",
        position: "relative", zIndex: 10,
      }}>
        「ネットは荒れる」という前提をひっくり返す社会実験。
      </footer>
    </div>
  );
}
