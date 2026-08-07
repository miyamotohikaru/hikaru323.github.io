import type { Metadata } from "next";
import { cases } from "@/data/cases";

export const metadata: Metadata = {
  title: "収録・編集方針 — 世界のFLIP図鑑",
  description:
    "何を載せ、何を載せないか。FLIP性・公開可能性・編集バランスの三段階と、収録しないもの。",
};

function H2({ ja, latin }: { ja: string; latin: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3 border-b border-line pb-2.5">
      <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">{ja}</h2>
      <span className="label">{latin}</span>
    </div>
  );
}

const STAGES = [
  {
    n: "01",
    ja: "FLIP性",
    latin: "IS IT READABLE AS A FLIP",
    body: "何が当たり前だったか。現実の配置をどう動かしたか。別の見え方が生まれるか。",
  },
  {
    n: "02",
    ja: "公開可能性",
    latin: "CAN IT BE PUBLISHED",
    body: "実在と事実を確認できるか。出典・権利・当事者への配慮を責任を持って扱えるか。",
  },
  {
    n: "03",
    ja: "編集バランス",
    latin: "WHAT IS THE ARCHIVE MISSING",
    body: "年代・地域・分野・主体の偏りを見直し、未調査の空白を把握する。",
  },
];

const CRITERIA = [
  ["何が見えなくなっていたか", "背景化・用途化・数値化・カテゴリー化・自然化・因果の切断などによって、どの存在・関係・前提が認知の外へ落ちていたかを説明できる。"],
  ["現実の何をどう配置し直したか", "説明文やコピーだけでなく、物、空間、時間、尺度、役割、因果、用途、参加行為のいずれかが実際に動いている。"],
  ["操作自体が問いを体現しているか", "仕掛けを別テーマへ差し替えても成立するなら、結びつきが弱い。"],
  ["別の見え方が生まれる余地がある", "受け手が以前の分類だけでは処理しきれない状況に出会う。評価や結論は一つに限定されなくてよい。"],
  ["面白さが思想の包装ではない", "哲学的な説明を外しても、物・行為・空間・参加の仕組み自体に驚きや可笑しさがある。"],
  ["外部事実として記述できる", "何が起きたかを、作者の自己説明だけに依存せず、資料・記録・報道・証言から確認できる。"],
];

const EXCLUDED = [
  ["主張の装飾", "伝えたい結論が先にあり、奇抜な形式は注目を集める包装にすぎない。"],
  ["単なる奇抜さ・炎上", "驚きや話題はあるが、何の見え方がどう動いたかを説明できない。"],
  ["後づけのFLIP化", "実施後に哲学的な言葉を加え、最初から配置変更を設計していたことにする。"],
  ["行動だけの最適化", "購入・寄付・クリック・移動は増えたが、その行為の意味や対象の見え方は扱っていない。"],
  ["啓蒙・プロパガンダの偽装", "正解を強く固定しながら、批判されたときだけ「解釈は自由」と説明する。"],
  ["当事者の素材化", "他者の身体・貧困・死・病気・弱さを、制作者の注目や思想の証明のためだけに消費する。"],
  ["検証不能な都市伝説", "事実関係が確認できず、対立情報も整理できない。アイデアの面白さだけで史実として載せない。"],
  ["物語内の反転だけ", "登場人物の立場が逆転する、オチがひっくり返るだけでは対象を無限に広げる。"],
];

const LABELS: [string, string, string][] = [
  ["FLIP性", "収録", "現時点の基準で、配置変更と見え方の揺らぎを明確に記述できる。"],
  ["FLIP性", "境界事例", "一部は該当するが、啓蒙・広告・偶発性など別の原理が強い。論点ごと載せる価値がある。"],
  ["FLIP性", "調査保留", "資料不足、対象単位が不明、事実関係が対立している。"],
  ["FLIP性", "非収録", "現時点では、単なる奇抜さや主張の装飾を越える構造を確認できない。"],
  ["公開状態", "公開可", "本文・出典・権利・リスクの確認が完了。"],
  ["公開状態", "内部記録", "FLIP性はあるが、画像権利、法的表現、当事者配慮などの理由で未公開。"],
  ["公開状態", "更新要", "公開後に新情報・訂正・権利期限の確認が必要。"],
];

const BIAS = [
  ["年代", "近年のSNS事例ばかりになり、歴史的な系譜が見えなくなる。"],
  ["地域・言語", "日本・北米・西欧の有名事例だけが「世界」を代表してしまう。"],
  ["分野", "現代アートへ偏り、広告・公共制度・民俗・プロダクト・遊びが抜ける。"],
  ["実行主体", "著名作家や企業に偏り、匿名集団・市民・行政・地域実践が抜ける。"],
  ["規模・予算", "巨大で画像映えする案件だけが残り、小さな介入や継続制度が消える。"],
  ["合法性・派手さ", "無許可・逮捕・炎上が過大評価され、静かな配置変更が弱く見える。"],
  ["画像の残り方", "写真の強い事例が、記録の乏しい重要事例より優先される。"],
];

export default function AboutPage() {
  const regions = new Set(cases.map((c) => c.axes.region));
  const fields = new Set(cases.map((c) => c.axes.field));
  const eras = new Set(cases.map((c) => c.axes.era));

  return (
    <main className="px-4 pb-4 pt-20 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-[68rem]">
        <p className="label">KOSU.KUMA / INTERNAL WORKING DRAFT</p>
        <h1 className="mt-3 text-[2rem] font-medium leading-[1.2] tracking-[-0.025em] sm:text-[2.75rem]">
          収録・編集方針
        </h1>
        <p className="mt-2 text-13 text-mute">
          何を載せ、何を載せないか ／ v0.2
        </p>

        <p className="mt-8 max-w-[44rem] text-[0.9375rem] leading-[2.05]">
          世界中の「常識をひっくり返した企画・作品・介入・事件」を、分野の境界を越えて記録する。
          現代アート、広告、社会実験、商品、都市介入、制度、悪ふざけを一つの形式で並べ、
          何が当たり前で、何をどう配置し直したのかを比較できるようにする。
          奇抜なものを集めるだけのバズ事例集にはしない。作者や団体を格付けするランキングにもしない。
        </p>

        <div className="mt-6 max-w-[44rem] border-l border-line py-1 pl-5 text-[0.9375rem] leading-[2.05] text-mute">
          ここに収録された制作者が、自らの活動をFLIPと呼んでいるわけではありません。
          本図鑑は、こす.くまが世界の企画・作品・介入をFLIPという体験設計の視点から
          読み直したアーカイブです。
        </div>

        {/* 三段階 */}
        <div className="mt-16">
          <H2 ja="収録判断は、三つの段階を混ぜない" latin="THREE STAGES" />
          <div className="grid gap-3 sm:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.n} className="bg-paper p-5">
                <p className="label !text-accent tnum">{s.n}</p>
                <p className="mt-2 text-[1.05rem] font-medium">{s.ja}</p>
                <p className="label mt-0.5">{s.latin}</p>
                <p className="mt-3 text-12 leading-[1.95] text-mute">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="label mt-4 leading-[1.9]">
            ※ 収録は賞賛・推奨を意味しない。問題のある事例も、批判的に記述できるなら対象になり得る。
          </p>
        </div>

        {/* 第一段階の問い */}
        <div className="mt-16">
          <H2 ja="第一段階｜何が前景化されるか" latin="STAGE 01" />
          <p className="mb-6 max-w-[44rem] text-[0.9375rem] leading-[2.05]">
            その企画は、すでにそこにあったにもかかわらず、背景・用途・数字・分類・制度の中に
            埋もれていた存在・関係・前提を、現実の配置変更によって前景へ戻しているか。
            点数化せず、次の問いに文章で答える。
          </p>
          <ol className="border-t border-line">
            {CRITERIA.map(([q, a], i) => (
              <li
                key={q}
                className="grid grid-cols-[2rem_1fr] gap-4 border-b border-line py-4"
              >
                <span className="label tnum pt-1">{i + 1}</span>
                <span>
                  <span className="block text-13 font-medium">{q}</span>
                  <span className="mt-1 block text-13 leading-[1.9] text-mute">
                    {a}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 bg-paper p-5">
            <p className="text-13 font-medium">「認知させる」とは書かない</p>
            <p className="mt-2 text-13 leading-[1.95] text-mute">
              作り手が正解を所有し、受け手へ理解を注入する響きを避ける。図鑑では
              「前景へ戻す」「別の輪郭で見直せる状況をつくる」「見え直す可能性」と記述する。
            </p>
          </div>
        </div>

        {/* 三つの文章 */}
        <div className="mt-16">
          <H2 ja="三つの文章を混ぜない" latin="THREE VOICES" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-l border-line pl-4">
              <p className="label">ACTOR&apos;S OWN ACCOUNT</p>
              <p className="mt-1.5 text-13 font-medium">実行主体による説明</p>
            </div>
            <div className="border-l border-line pl-4">
              <p className="label">CONFIRMED FACTS</p>
              <p className="mt-1.5 text-13 font-medium">確認できた事実</p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="label !text-accent">READING BY KOSU.KUMA</p>
              <p className="mt-1.5 text-13 font-medium">こす.くまのFLIP読解</p>
            </div>
          </div>
          <p className="mt-4 text-13 leading-[1.95] text-mute">
            各CASEの本文は、この三つを別の欄に分けて書く。史実と編集解釈の境界を、
            読む側が判別できる状態に保つため。
          </p>
        </div>

        {/* 収録しないもの */}
        <div className="mt-16">
          <H2
            ja="収録しないもの／FLIPとして弱くなるもの"
            latin="WHAT IS NOT INCLUDED"
          />
          <ol className="border-t border-line">
            {EXCLUDED.map(([t, d], i) => (
              <li
                key={t}
                className="grid grid-cols-[2rem_1fr] gap-4 border-b border-line py-3.5"
              >
                <span className="label tnum pt-1">{i + 1}</span>
                <span>
                  <span className="block text-13 font-medium">{t}</span>
                  <span className="mt-1 block text-13 leading-[1.9] text-mute">
                    {d}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* 判断ラベル */}
        <div className="mt-16">
          <H2 ja="判断ラベル" latin="EDITORIAL LABELS" />
          <p className="mb-5 text-13 leading-[1.95] text-mute">
            作品や企画を点数で評価せず、編集作業上の状態だけを付ける。
            FLIP性と公開状態は別フィールドにする。
          </p>
          <dl className="border-t border-line">
            {LABELS.map(([group, label, meaning]) => (
              <div
                key={label}
                className="grid grid-cols-[4.5rem_5rem_1fr] gap-3 border-b border-line py-3 sm:grid-cols-[5.5rem_6rem_1fr] sm:gap-4"
              >
                <span className="label pt-0.5">{group}</span>
                <dt className="text-13 font-medium">{label}</dt>
                <dd className="text-13 leading-[1.9] text-mute">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 偏り */}
        <div className="mt-16">
          <H2 ja="第三段階｜図鑑全体として何が不足しているか" latin="STAGE 03" />
          <p className="mb-5 text-13 leading-[1.95] text-mute">
            空白を埋めるために弱い事例を無理に採用するのではなく、次の調査テーマを決めるために使う。
          </p>
          <dl className="border-t border-line">
            {BIAS.map(([axis, problem]) => (
              <div
                key={axis}
                className="grid grid-cols-[6rem_1fr] gap-4 border-b border-line py-3 sm:grid-cols-[8rem_1fr]"
              >
                <dt className="text-13 font-medium">{axis}</dt>
                <dd className="text-13 leading-[1.9] text-mute">{problem}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 bg-paper p-5">
            <p className="label mb-3">現在の収録状況 CURRENT STATE</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4">
              {[
                ["収録CASE", `${cases.length}件`],
                ["年代", `${eras.size}区分`],
                ["地域", `${regions.size}地域`],
                ["分野", `${fields.size}分野`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label">{k}</dt>
                  <dd className="tnum mt-0.5 text-[1.15rem] font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="label mt-4 leading-[1.9]">
              初期収録。アフリカ・中東・東南アジア・オセアニア、民俗／儀礼、プロダクトは未着手。
              空白は次の調査テーマとして扱う。
            </p>
          </div>
        </div>

        {/* 図版について */}
        <div className="mt-16">
          <H2 ja="図版について" latin="ON THE PLATES" />
          <p className="max-w-[44rem] text-[0.9375rem] leading-[2.05]">
            本図鑑に実物の写真は掲載していない。各CASEに添えた図版は、
            そのCASEの配置操作をもとに図鑑側が生成した配置図であり、記録写真ではない。
            静止時は変容前の配置を、操作すると配置操作そのものを描く。
            画像が使えないこと自体は、FLIP性の否定理由にはしない——
            この原則を、図版の側で引き受けるための形式である。
          </p>
        </div>

        <p className="label mt-16 leading-[2]">
          この文書は、完成した規則ではない。実際の収録・調査・公開を通じて更新するための基準点である。
          <br />
          出典：株式会社こす.くま『世界のFLIP図鑑 収録・編集方針 v0.2』（2026年8月）
        </p>
      </div>
    </main>
  );
}
