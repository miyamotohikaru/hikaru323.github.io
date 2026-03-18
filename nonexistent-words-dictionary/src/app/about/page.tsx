import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "このサイトについて - 存在しない言葉辞典",
  description: "「存在しない言葉辞典」は、ユーザーが造語を投稿して辞典を育てる参加型Webサービスです。",
};

export default function AboutPage() {
  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">このサイトについて</h1>
      </div>

      <div className="static-content">
        <section className="static-section">
          <h2>「存在しない言葉辞典」とは</h2>
          <p>
            通常の辞書は「知らない言葉を調べる場所」です。
            しかし、この辞典は逆。<strong>「存在しない言葉」だけを受け付ける辞書</strong>です。
          </p>
          <p>
            ユーザーが造語とその定義を投稿すると、辞書の見出し語として掲載されます。
            みんなの創作で空っぽの辞典が育っていく——そんな参加型の辞書体験を提供します。
          </p>
        </section>

        <section className="static-section">
          <h2>遊び方</h2>
          <ol className="static-list">
            <li>トップページの入力欄に、あなたが考えた「存在しない言葉」を入力します。</li>
            <li>読み・品詞・定義文を記入します。</li>
            <li>「この言葉を辞典に載せる」ボタンを押すと、辞典に掲載されます。</li>
            <li>気に入った造語には「いいね」を押して応援しましょう。</li>
            <li>SNSでシェアして、友達にも見せてあげてください。</li>
          </ol>
        </section>

        <section className="static-section">
          <h2>ルール</h2>
          <ul className="static-list">
            <li>すでに実在する言葉は投稿できません。</li>
            <li>不適切な内容を含む投稿は削除される場合があります。</li>
            <li>投稿は1分間に1回までです。</li>
            <li>他の投稿者を尊重し、楽しい辞典づくりにご協力ください。</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>お問い合わせ</h2>
          <p>
            不具合の報告やご意見がありましたら、各投稿ページの「不適切な投稿を報告」機能をご利用ください。
          </p>
        </section>
      </div>
    </main>
  );
}
