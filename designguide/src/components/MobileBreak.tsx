/**
 * 携帯のときだけ効く改行。
 *
 * 実体は `<br className="mobile-break" />` だけ。表示の切り替えはCSS側にある。
 * 閾値はこのサイトの既存の「携帯」＝620px に合わせている
 * （`.sa-nav__en` が英字を畳む所と同じ）。
 *
 * kosukuma-dev の他プロジェクトと同じ作法。地の文には記号を埋め込み、
 * BreakText が ◆→これ、◇→ふつうの <br> に開く。
 */
export default function MobileBreak() {
  return <br className="mobile-break" />;
}
