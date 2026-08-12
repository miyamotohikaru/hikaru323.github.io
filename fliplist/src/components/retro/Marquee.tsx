/**
 * 電光掲示板。
 * 本物のHPの home.css に .marquee がそのまま残っている（HTMLではコメントアウト中）。
 *   font-weight:bold / font-size:50px / color:green / background:yellow
 *   font-style:italic / border:dotted 3px orangered / height:80px
 *   span は青の下線
 * その指定を1つも変えずに使っている。流れる動きだけCSSで足した。
 */
export default function Marquee() {
  return (
    <div className="marquee">
      <p>
        ようこそ！ふりっぷは<span>随時更新中</span>です！
      </p>
    </div>
  );
}
