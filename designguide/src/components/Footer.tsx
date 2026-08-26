import Link from "next/link";

export default function Footer() {
  return (
    <footer className="sa-foot">
      <div className="shell sa-foot__in">
        <div>
          <p className="label">STYLE ATLAS</p>
          <p className="sa-foot__note">
            デザインスタイル80種と、それを呼び出すプロンプトの図鑑。
            <br />
            図版はすべて、各スタイルの作図規則から描き起こした固有のものです。
          </p>
        </div>
        <nav className="sa-foot__nav">
          <Link href="/">図鑑</Link>
          <Link href="/build">プロンプトを組む</Link>
          <Link href="/recipes">レシピ</Link>
        </nav>
      </div>
    </footer>
  );
}
