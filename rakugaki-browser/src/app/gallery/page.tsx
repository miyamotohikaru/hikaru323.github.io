import Link from "next/link";

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <Link href="/" className="text-neon font-bold text-lg tracking-wide">
          らくがきのブラウザ
        </Link>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/draw" className="hover:text-neon transition-colors">
            描く
          </Link>
          <Link href="/gallery" className="text-neon">
            ギャラリー
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">ギャラリー</h2>
          <p className="text-muted mb-8">
            みんなの落書きがここに集まります。
          </p>
          <p className="text-muted text-sm">
            （準備中 — Firebase連携後に公開予定）
          </p>
        </div>
      </main>
    </div>
  );
}
