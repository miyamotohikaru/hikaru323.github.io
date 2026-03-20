import Link from "next/link";

const svgPaths = [
  { d: "M 50 200 Q 150 50, 300 180 T 550 160", color: "#ccff00", delay: 0, len: 600 },
  { d: "M 700 100 Q 600 250, 450 200 T 200 280", color: "#ff3366", delay: 0.5, len: 700 },
  { d: "M 100 350 Q 250 250, 400 350 T 650 320", color: "#00ccff", delay: 1.0, len: 550 },
  { d: "M 600 50 C 650 150, 500 200, 550 300", color: "#ff9900", delay: 1.5, len: 400 },
  { d: "M 150 100 Q 200 200, 350 120", color: "#ff00ff", delay: 2.0, len: 300 },
];

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated SVG background */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
          pointerEvents: "none",
        }}
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        {svgPaths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={p.len}
            strokeDashoffset={p.len}
            style={{
              animation: `draw 2s ease ${p.delay}s forwards`,
            }}
          />
        ))}
      </svg>

      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid #2a2a2a",
        position: "relative",
        zIndex: 10,
      }}>
        <h1 style={{
          color: "#ccff00",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.05em",
        }}>
          らくがきのブラウザ
        </h1>
        <nav style={{ display: "flex", gap: 24, fontSize: 14, color: "#888" }}>
          <Link href="/draw" style={{ transition: "color 0.2s" }}>
            描く
          </Link>
          <Link href="/gallery" style={{ transition: "color 0.2s" }}>
            ギャラリー
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <p style={{
            color: "#ccff00",
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.2em",
            marginBottom: 16,
            animation: "fadeIn 0.6s ease",
          }}>
            RAKUGAKI BROWSER
          </p>

          <h2 style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 20,
            animation: "fadeIn 0.6s ease 0.2s both",
          }}>
            らくがきの
            <br />
            <span style={{ color: "#ccff00" }}>ブラウザ</span>
          </h2>

          <p style={{
            color: "#888",
            fontSize: 18,
            marginBottom: 48,
            animation: "fadeIn 0.6s ease 0.4s both",
          }}>
            どのサイトにも落書きでき、URLでシェアできる。
          </p>

          {/* Features */}
          <ul style={{
            textAlign: "left",
            color: "#888",
            listStyle: "none",
            maxWidth: 460,
            margin: "0 auto 48px",
            animation: "fadeIn 0.6s ease 0.6s both",
          }}>
            {[
              "11種類のブラシで自由に描ける — ペン、マーカー、水彩、エアブラシなど",
              "Adobeスタイルのカラーピッカーで無限の色を選択",
              "描いた作品を保存して、ギャラリーでみんなの作品を鑑賞",
            ].map((text, i) => (
              <li key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
                lineHeight: 1.6,
              }}>
                <span style={{ color: "#ccff00", marginTop: 2, flexShrink: 0 }}>—</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/draw"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ccff00",
              color: "#000",
              fontWeight: 700,
              padding: "16px 36px",
              borderRadius: 40,
              fontSize: 18,
              textDecoration: "none",
              transition: "background 0.2s",
              animation: "slideUp 0.6s ease 0.8s both",
            }}
          >
            描きはじめる →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "20px 32px",
        borderTop: "1px solid #2a2a2a",
        textAlign: "center",
        fontSize: 14,
        color: "#888",
        position: "relative",
        zIndex: 10,
      }}>
        「ネットは荒れる」という前提をひっくり返す社会実験。
      </footer>
    </div>
  );
}
