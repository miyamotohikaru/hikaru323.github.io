import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - 存在しない言葉辞典",
  description: "存在しない言葉辞典のプライバシーポリシーについて。",
};

export default function PrivacyPage() {
  return (
    <main className="main-content">
      <div className="gojuon-header">
        <Link href="/" className="back-link">
          ← 辞典に戻る
        </Link>
        <h1 className="page-title">プライバシーポリシー</h1>
      </div>

      <div className="dictionary-page">
        <div className="dictionary-page-content">
          <h2 className="dict-section-heading">個人情報の取り扱いについて</h2>
          <p className="dict-section-text">
            本サイト「存在しない言葉辞典」（以下、「当サイト」）は、ユーザーのプライバシーを尊重し、
            個人情報の保護に努めます。
          </p>

          <h2 className="dict-section-heading">収集する情報</h2>
          <p className="dict-section-text">当サイトでは、以下の情報を収集する場合があります。</p>
          <ul className="dict-section-list">
            <li><strong>投稿情報:</strong> ニックネーム、造語、定義文などの投稿内容。これらはサイト上で公開されます。</li>
            <li><strong>アクセスログ:</strong> IPアドレス、ブラウザ情報、アクセス日時など。サービス改善およびスパム対策のために使用します。</li>
            <li><strong>Cookie / localStorage:</strong> ニックネームの保存、いいねの重複防止、投稿制限の管理のために使用します。</li>
          </ul>

          <h2 className="dict-section-heading">Google Analyticsについて</h2>
          <p className="dict-section-text">
            当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。
            Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。
            このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="dict-section-text">
            この機能はCookieを無効にすることで収集を拒否することが可能です。
            お使いのブラウザの設定をご確認ください。
          </p>

          <h2 className="dict-section-heading">広告について</h2>
          <p className="dict-section-text">
            当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
          </p>
          <p className="dict-section-text">
            Googleが広告Cookieを使用することにより、ユーザーが当サイトや他のサイトにアクセスした際の情報に基づいて、
            適切な広告を表示することが可能になります。
          </p>

          <h2 className="dict-section-heading">免責事項</h2>
          <p className="dict-section-text">
            当サイトに掲載されている造語および定義は、すべてユーザーの創作物です。
            当サイトは投稿内容の正確性・適切性について保証するものではありません。
          </p>

          <h2 className="dict-section-heading">プライバシーポリシーの変更</h2>
          <p className="dict-section-text">
            当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
            変更があった場合は、当ページにて公開します。
          </p>
          <p className="dict-section-text">最終更新日: 2026年3月18日</p>
        </div>
      </div>
    </main>
  );
}
