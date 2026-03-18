import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <h1 className="text-neon font-bold text-lg tracking-wide">
          らくがきのブラウザ
        </h1>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/draw" className="hover:text-neon transition-colors">
            描く
          </Link>
          <Link href="/gallery" className="hover:text-neon transition-colors">
            ギャラリー
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="max-w-2xl text-center">
          <p className="text-neon font-mono text-sm tracking-widest mb-4">
            04
          </p>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            らくがきの
            <br />
            <span className="text-neon">ブラウザ</span>
          </h2>
          <p className="text-muted text-lg mb-12">
            どのサイトにも落書きでき、URLでシェアできる。
          </p>

          {/* Feature list */}
          <ul className="text-left text-muted space-y-3 mb-12 max-w-lg mx-auto">
            <li className="flex items-start gap-3">
              <span className="text-neon mt-1">—</span>
              <span>
                ブラウザ上に透明なキャンバスが重なり、自由に落書きできる
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-neon mt-1">—</span>
              <span>
                URLをキーに落書きを保存 → 同URLを開いた全員に落書きが見える
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-neon mt-1">—</span>
              <span>
                累積された落書きのアーカイブ自体がアートとして成立する
              </span>
            </li>
          </ul>

          <Link
            href="/draw"
            className="inline-flex items-center gap-2 bg-neon text-black font-bold px-8 py-4 rounded-full hover:bg-neon-dim transition-colors text-lg"
          >
            描きはじめる
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border text-center text-sm text-muted">
        <p>
          「ネットは荒れる」という前提をひっくり返す社会実験。
        </p>
      </footer>
    </div>
  );
}
