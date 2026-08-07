import type { Case } from "./types";

/**
 * 収録CASE。
 *
 * 記述の原則（『世界のFLIP図鑑 収録・編集方針 v0.2』）:
 *  - 実行主体による説明 / 確認できた事実 / こす.くまによるFLIP読解 を混ぜない。
 *  - 点数・順位・レアリティを付けない。収録は賞賛・推奨・免責を意味しない。
 *  - 情報が対立・不明の場合、その状態を隠さず notes に残す。
 */
export const cases: Case[] = [
  {
    id: "01",
    slug: "fountain-duchamp",
    titleJa: "泉",
    titleOrig: "Fountain",
    year: 1917,
    yearLabel: "1917",
    place: "NEW YORK, アメリカ",
    actor: "マルセル・デュシャン（R. Mutt名義）",
    actorRole: "作家／出品者（アンデパンダン協会理事）",
    form: "レディメイド・展覧会介入",
    oneline:
      "量産品の小便器に別名の署名を入れて無審査を掲げる展覧会に出品し、除外の決定とその記録の公表までを一連の手続きとして行った。",
    facts:
      "1917年4月、ニューヨークのアンデパンダン協会（Society of Independent Artists）第1回展（4月10日〜5月6日、グランド・セントラル・パレス）に、「R. Mutt」名義で磁器製小便器が《Fountain》として出品された。同展は無審査で、会費6ドルを払えば誰でも出品できる規約だった。デュシャンは同協会の理事の一人。開幕直前に理事会が除外を決め、作品は会場に置かれなかった。デュシャンとウォルター・アレンズバーグは理事を辞任した。5月、デュシャンらが編集する雑誌『The Blind Man』第2号に、アルフレッド・スティーグリッツが画廊「291」で撮影した写真と、無署名の論説「The Richard Mutt Case」が掲載された。原物は展覧会後に失われ、この写真が唯一の記録である。1950年のシドニー・ジャニス画廊向けを最初に、1964年ミラノのシュヴァルツ画廊による8点組を含む複数のレプリカが制作され、フィラデルフィア美術館、テート、SFMOMA、ポンピドゥーなどが所蔵する。",
    before:
      "小便器は建築設備のカタログ品であり、衛生と排泄の用途、および性別で分けられた空間の内側でのみ意味を持つ器具だった。見るために置かれる物ではなく、視線を外すために置かれる物である。一方で展覧会は、手仕事の技量と作者の署名が真正性を担保する場であり、「無審査」を掲げる場合でも、何が作品でありうるかの線引きは言明されない前提として共有されていた。",
    operation:
      "量産された衛生器具を入手し、向きを変えて台座に据え、《Fountain》と題し、実名ではない「R. Mutt」の署名と年号を書き入れ、規約どおり会費を払って出品手続きを踏んだ。制作は行わず、選択・改題・署名・出品という手続きだけを実行している。除外決定後は、理事辞任と、写真および無署名論説の雑誌掲載という第二の配置へ移した。",
    foregrounded:
      "作品が作品として成立する条件が、物の側ではなく、選択・命名・台座・署名・出品手続き・そして受理する側の判断の側にあることが、見る対象として立ち上がった。「無審査」という宣言が実際には未言明の線引きに支えられていたことも、除外という決定そのものによって表に出た。用途の下に隠れていた器具の輪郭と、制度の輪郭が同時に前景へ戻されている。",
    flipReading:
      "こす.くまはこれを、物を変えずに物の置き場所と呼び名だけを変えた事例として読む。動いたのは小便器ではなく、それを囲む台座・題名・署名・会場・規約の配置である。除外という応答が返ってきたことで、ふだん働いているのに見えない選別の手つきが、記録可能な出来事の形をとった。作り手が答えを持って提示したというより、判断を判断する側に返し、その判断を紙に残した点に、別の輪郭で見直せる状況の作り方がある。",
    counter:
      "この配置は理事会・画廊・雑誌・収集家という美術制度の内側で完結しており、外部への介入ではなかったという読み方がある。原物が失われ、後年のレプリカが高額で取引されて美術館の常設に収まった経過は、制度への問いが制度の資産へ回収された過程とも見える。また1917年4月11日付の妹スュザンヌ宛書簡にある「女友達の一人」という記述をめぐり、エルザ・フォン・フライターク＝ロリングホーフェンの関与を主張する説と、これを否定する研究が対立しており、単独作者という前提自体が確定していない。",
    chronology: [
      { date: "1917-04-10", event: "アンデパンダン協会第1回展がグランド・セントラル・パレスで開幕（〜5月6日）。無審査・会費6ドルの規約。" },
      { date: "1917-04", event: "「R. Mutt」名義で《Fountain》が出品されるが、開幕直前に理事会が除外を決定。会場に展示されず。" },
      { date: "1917-04-11", event: "デュシャンが妹スュザンヌに宛てた書簡で、「Richard Mutt」名義の小便器の出品に言及。" },
      { date: "1917-04", event: "デュシャンとウォルター・アレンズバーグが理事を辞任。" },
      { date: "1917-05", event: "『The Blind Man』第2号に、スティーグリッツ撮影の写真と無署名論説「The Richard Mutt Case」を掲載。" },
      { date: "1917", event: "原物が展覧会後に失われる（所在不明）。以後、写真が唯一の記録となる。" },
      { date: "1950", event: "シドニー・ジャニス画廊の展覧会のためのレプリカ。デュシャンが「R. Mutt 1917」と記入。現在フィラデルフィア美術館蔵。" },
      { date: "1964-10", event: "ミラノのシュヴァルツ画廊が8点組のレプリカを制作。テート、SFMOMA、カナダ国立美術館などが所蔵。" },
      { date: "1999-11-17", event: "サザビーズ・ニューヨークでレプリカが1,762,500ドルで落札。" },
      { date: "2006-01", event: "ピノンセリがポンピドゥー・センター展示のレプリカをハンマーで打ち欠く。同年、パリの裁判所が罰金と執行猶予付き禁錮を科す。" },
      { date: "2017", event: "フィラデルフィア美術館が百周年展「Marcel Duchamp and the Fountain Scandal」を開催。" },
      { date: "2019", event: "『Burlington Magazine』誌上でドーン・アデスとブラッドリー・ベイリーが、フライターク＝ロリングホーフェン帰属説に反論。" },
    ],
    sources: [
      { label: "S1", publisher: "Philadelphia Museum of Art", title: "Marcel Duchamp and the Fountain Scandal（展覧会プレスリリース）", url: "https://press.philamuseum.org/marcel-duchamp-and-the-fountain-scandal/", confirmed: true },
      { label: "S2", publisher: "Duchamp Research Portal / Philadelphia Museum of Art", title: "Fountain, 1950 (replica of 1917 original), object 92488", url: "https://www.duchamparchives.org/pma/object/92488/", confirmed: true },
      { label: "S3", publisher: "San Francisco Museum of Modern Art", title: "Marcel Duchamp, Fountain, 1917/1964", url: "https://www.sfmoma.org/artwork/98.291/", confirmed: true },
      { label: "S4", publisher: "Tate", title: "Marcel Duchamp, Fountain, 1917, replica 1964 (T07573)", url: "https://www.tate.org.uk/art/artworks/duchamp-fountain-t07573", confirmed: true },
      { label: "S5", publisher: "Cabinet Magazine", title: "An Overview of the Seventeen Known Versions of 'Fountain'", url: "https://www.cabinetmagazine.org/issues/27/duchamp.php", confirmed: true },
      { label: "S6", publisher: "Artforum", title: "The R. Mutt Dossier", url: "https://www.artforum.com/features/the-r-mutt-dossier-206122/", confirmed: true },
      { label: "S7", publisher: "Artnet News", title: "Did Duchamp Steal Credit for 'The Fountain' from a Woman Artist?", url: "https://news.artnet.com/art-world/duchamp-fountain-dispute-2379304", confirmed: true },
      { label: "S8", publisher: "Bowdoin College Museum of Art", title: "A Fascinating 'Fountain' and 'The Blind Man' Enter the BCMA Collection", url: "https://www.bowdoin.edu/art-museum/news/2020/blind-man-duchamp.html", confirmed: true },
    ],
    notes:
      "【未確認】(1) 小便器の入手先。デュシャンは1966年のインタビューで五番街のJ. L. Mott Iron Worksを挙げたが、1917年の同社カタログに該当の型が見当たらないことが指摘されており、購入先は確定していない。(2) 出品作の作者。1917年4月11日付書簡の「女友達の一人」が誰を指すかについて、ルイーズ・ノートン説とエルザ・フォン・フライターク＝ロリングホーフェン説があり、後者は2019年に強く反論されている。未決着として counter に記載。(3) 会場で衝立の裏に隠されたとするビアトリス・ウッドらの回想の細部は一次資料で裏取りできていないため本文に含めていない。(4) 1917年の一件に違法認定・逮捕・訴訟はない。刑事手続きが生じたのは2006年のピノンセリによる器物損壊のみで、これは本CASEの実行主体とは別人による後年の行為である。【画像権利】スティーグリッツによる1917年の写真は1917年米国公表のためパブリックドメインと解されるが、掲載時は所蔵館のデジタル画像利用条件を要確認。1950年以降のレプリカ本体および現代の展示写真は遺族側（ADAGP／ARS）と撮影者の権利下にあり、無断掲載不可。",
    axes: { era: "1900s", region: "北米", field: "現代アート", actorType: "個人作家", scale: "小", legality: "合法" },
    flipOps: ["文脈置換", "命名", "制度介入"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["レディメイド", "署名", "展示制度", "無審査", "匿名性", "台座"],
  },

  {
    id: "02",
    slug: "tenji-block",
    titleJa: "点字ブロック",
    titleOrig: "Tactile Walking Surface Indicators",
    year: 1967,
    yearLabel: "1967",
    place: "OKAYAMA, 日本",
    actor: "三宅精一／安全交通試験研究センター",
    actorRole: "考案・命名・寄贈設置",
    form: "都市インフラ・規格",
    oneline:
      "歩道の舗装表面に突起を規則配列したコンクリート板を敷き、足裏と白杖で読み取れる情報を路面そのものに持たせた。",
    facts:
      "三宅精一は1965年、岡山市の自宅を開放して任意団体「安全交通試験研究センター」を掲げ、コンクリート板の表面に半球状突起を7×7＝49個配列したブロックを考案し「点字ブロック」と命名した。1967年3月18日、旧建設省岡山国道工事事務所等との交渉を経て、岡山県立岡山盲学校近くの旧国道2号（現・国道250号）原尾島交差点付近の横断歩道周辺に230枚を寄贈・敷設。日本初かつ世界初とされる。同1967年、日本ライトハウス理事長・岩橋英行が世界盲人福祉協議会の場で海外に紹介した。1970年3月、大阪府立盲学校教職員の陳情を受け国鉄阪和線我孫子町駅ホームに鉄道駅として初敷設。同年10月、東京都が高田馬場駅東側一帯を交通安全モデル地区に指定し、この頃突起は6×6＝36個、色は黄色に改められた。1975年3月の旧建設省委託研究報告書で線状ブロックが生まれた。1997年には44種類が併存し、2001年9月20日にJIS T 9251が制定、2012年3月にISO 23599が発行された。",
    before:
      "歩道と車道の境、駅ホームの縁、交差点の手前は、目で一瞬に確かめられる境界として扱われ、路面そのものは何も語らない均質な下地とされていた。街路の情報はほぼすべて視覚に載せられ、標識・信号・白線・案内板として頭上と前方に配置されていた。足裏が触れている面は歩行者にとって「見る対象」ではなく、ただ踏むだけの背景だった。視覚を使わずに歩く人にとって、その背景は情報のない空白として広がっていた。",
    operation:
      "新しい装置を街に足すのではなく、既にある路面の表層だけを差し替えた。コンクリート板の表面に半球状突起を規則配列し、突起のある面／ない面という二値の差を舗装の高さ数ミリの中につくる。読み取りは足裏と白杖の先端が担う。1974年以降の研究で点（警告）と線（誘導）が組み合わされ、位置の告知だけでなく進行方向まで路面に載せた。色は途中で黄色へ変更され、弱視者向けの輝度差も同じ板が兼ねることになった。",
    foregrounded:
      "路面が「読む面」として立ち上がった。突起が置かれた瞬間、それまで背景だった舗装は、歩行者が身体で照会する情報の層に変わる。同時に、歩道上に視覚以外の感覚で移動する人がいるという事実が、街路の設計条件として前景へ戻された。晴眼者にとっても黄色い帯は「ここを別の歩き方をする人が通る」という表示として日常の視界に入り続ける。誰のために設計されているかが、路面の形そのものとして街に露出した。",
    flipReading:
      "こす.くまはこの事例を、新設ではなく既存インフラの表層を書き換えることで配置を動かした例として読む。動いたのは物量ではなく尺度と用途である。数ミリの高低差という、都市計画の解像度では丸められる寸法が、歩行の可否を決める寸法として扱い直された。舗装という用途の確定していた面が読み取り面へ転用され、視覚に集中していた街路情報の一部が触覚側へ移された。さらに「点字ブロック」という命名は、実際には点字ではないにもかかわらず対象の輪郭を先に確定させ、普及の経路をつくっている。230枚から始まった静かな配置変更が、34年後にJIS、45年後にISOという制度の側へ折り返した過程まで含めて記録する。",
    counter:
      "突起は視覚障害者にとっての情報だが、車椅子・歩行器・ベビーカーの利用者や足腰の弱い高齢者にとっては段差と振動になる。バリアフリーの内部で利害が衝突する典型例であり、後年の設置ガイドラインは当事者参加の評価実験を経て整備された。考案者は晴眼者であり、初期の形状決定に視覚障害当事者がどの段階から関与したかは資料上明瞭でない。規格統一までの34年間は44種類が併存し、駅構内での混在、摩耗や不適切敷設に起因する事故も報告されている。敷設の有無を決めるのは現在も当事者ではなく道路管理者・事業者である。",
    chronology: [
      { date: "1965", event: "視覚障害者誘導用ブロックを考案。任意団体「安全交通試験研究センター」を掲げる。突起は7×7＝49個、色はセメント色。" },
      { date: "1967-03-18", event: "岡山県立岡山盲学校近くの旧国道2号 原尾島交差点付近に230枚を寄贈・敷設。日本初・世界初とされる。" },
      { date: "1967", event: "岩橋英行が世界盲人福祉協議会（WCWB）実行委員会で写真と資料により海外へ紹介。" },
      { date: "1970-03", event: "国鉄阪和線我孫子町駅ホームに鉄道駅として初敷設（大阪府立盲学校教職員の陳情による）。" },
      { date: "1970-10", event: "東京都が高田馬場駅東側一帯を全国初の交通安全モデル地区に指定。この頃突起は6×6＝36個、色は黄色へ。" },
      { date: "1974-10-01", event: "私財を基本財産として財団法人安全交通試験研究センターとして再発足。" },
      { date: "1975-03", event: "旧建設省委託研究「道路における盲人誘導システム」報告書提出。点状に加え線状ブロックが生まれる。" },
      { date: "1982-07", event: "三宅精一死去。" },
      { date: "1997", event: "点状・線状あわせて44種類の併存が確認され、紛らわしさが問題化。" },
      { date: "2001-09-20", event: "JIS T 9251（視覚障害者誘導用ブロック等の突起の形状・寸法及びその配列）制定・官報公示。" },
      { date: "2010", event: "岡山県視覚障害者協会の申請により3月18日が「点字ブロックの日」として認定される。" },
      { date: "2012-03", event: "ISO 23599（Tactile walking surface indicators）発行。2019年に改正版。" },
    ],
    sources: [
      { label: "S1", publisher: "岡山県（障害福祉課）", title: "点字ブロックは岡山で生まれました！", url: "https://www.pref.okayama.jp/page/950468.html", confirmed: true },
      { label: "S2", publisher: "一般財団法人 安全交通試験研究センター", title: "財団のあゆみ（二代目理事長・三宅三郎による一人称記録）", url: "https://www.tsrc.or.jp/anzen/history/", confirmed: true },
      { label: "S3", publisher: "日本障害者リハビリテーション協会（DINF）", title: "時代を読む44 日本で初めて敷設された点字ブロック", url: "https://www.dinf.ne.jp/doc/japanese/prdl/jsrd/norma/n383/n383001.html", confirmed: true },
      { label: "S4", publisher: "社会福祉法人 岡山県視覚障害者協会", title: "点字ブロック豆知識", url: "https://www.ossk-33.jp/braille_block/", confirmed: true },
      { label: "S5", publisher: "ISO", title: "ISO 23599:2019 Tactile walking surface indicators", url: "https://www.iso.org/standard/76106.html", confirmed: false },
      { label: "S6", publisher: "総務省 関東管区行政評価局", title: "視覚障害者誘導用ブロックの維持管理等に関する調査 結果報告書（平成30年4月）", url: "https://www.soumu.go.jp/main_content/000547116.pdf", confirmed: false },
      { label: "S7", publisher: "国際交通安全学会（IATSS）", title: "視覚障害者誘導用ブロック（点字ブロック）の設置ガイドラインの作成", url: "https://iatss.or.jp/research/h966.html", confirmed: false },
    ],
    notes:
      "【動機の扱い】発端について二系統の説明が流通している。実行主体側の記録（S2＝実弟・三宅三郎の一人称回想）では、発端は交差点で白杖使用者が車に接近される場面を目撃したこととされる。一方、一般向け記事では「友人・岩橋が数年で失明すると知ったこと」を発端とし、岩橋から聞いた「コケと土の境は足の感覚で分かる」という言葉が着想源だとする語りが広く流通しているが、これは今回の調査範囲では一次資料で確認できなかった。伝承として扱い、本文では断定していない。【未確認】導入当初に視覚障害当事者から出た批判・要望の一次記録は未取得。S6・S7は書誌のみ確認。ISO公式ページは自動取得が403となり、規格の書誌は複数の二次情報で照合した。【名称】「点字ブロック」は点字（braille）ではなく、法令上の名称は「視覚障害者誘導用ブロック」。命名の意図は S2 に実行主体側の説明として明記あり。【画像権利】原尾島交差点の記念モニュメント写真、当時の新聞紙面はいずれも権利未クリア。掲載時は自主撮影、または岡山県・岡山市・安全交通試験研究センターの許諾取得が必要。",
    axes: { era: "1960s", region: "東アジア", field: "都市・インフラ", actorType: "個人・民間", scale: "小", legality: "許可済み" },
    flipOps: ["用途転換", "可視化", "命名"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["触覚", "歩道", "標準化", "岡山", "ISO 23599"],
  },

  {
    id: "03",
    slug: "woonerf",
    titleJa: "ボンエルフ（生活の庭）",
    titleOrig: "Woonerf",
    year: 1976,
    yearLabel: "1968–1976",
    place: "DELFT, オランダ",
    actor: "ニーク・デ・ブール、ヨースト・ファール／デルフト市・エメン市／オランダ政府",
    actorRole: "設計・制度化",
    form: "都市設計・道路交通法規",
    oneline:
      "住宅地の道路に樹木・ベンチ・遊具・車道の屈曲を配置し、歩行者が全幅を使い自動車が歩く速さで走る空間として、1976年にオランダの道路交通法規に定義した。",
    facts:
      "1968年、都市計画家ニーク・デ・ブールがエメン市エメルハウトの新住宅地で、自動車を歩行者・自転車に従属させる街路を設計し、erf（庭・屋敷地）から woonerf の語を作った。1969年以降、教え子のヨースト・ファールが既成市街地デルフトの既存街路に適用し、1970年にオランダ初の減速ハンプをデルフトに設置した。車道の絞り込み、ハンプ、プランター、ベンチ、遊具により、自動車と自転車・歩行者・遊ぶ子どもの混在を図った。1976年8月27日の王令（Stb.453）で「woonerf」「einde woonerf」の道路標識が定められ、woonerf が道路交通法規に位置づけられた。歩行者は全幅を使え、子どもは遊んでよく、車は歩く速さで走り、通過交通を想定しないことが規定された。1988年に呼称が erf に変更され、適用範囲が商業地・学校周辺などへ広がった。現行のRVV1990第44〜46条が、全幅使用・最高15km/h・指定場所以外の駐車禁止を定める。ドイツは1980年のStVO改正で verkehrsberuhigter Bereich（標識325）を導入し、英国は2000年交通法第268条で home zone を制度化した。",
    before:
      "住宅地の道路は、自動車が通り抜けるための通路として引かれ、幅員・線形・舗装はいずれも走行速度を落とさないことを前提に決められていた。歩行者は縁石で区切られた歩道に押し込まれ、子どもの遊び、立ち話、樹木、ベンチは、道路の外側に置くべき余剰として扱われた。街路は住居と住居のあいだの移動路であって、住むための面積には数えられていなかった。",
    operation:
      "舗装の連続を断ち切る位置に、ハンプ、車道の絞り込み、屈曲、プランター、樹木、ベンチ、遊具、駐車マスを置いた。縁石で歩車を分ける代わりに段差を消して面をひとつにし、車が直進で加速できない配置にした。さらに、この物理的配置に対応する標識と条文を用意し、歩行者が道路の全幅を使えること、子どもが遊べること、自動車は歩く速さで走ることを法規の側に書き込んだ。設計と法文を同じ対象に同時にかけている。",
    foregrounded:
      "道路が「移動の通路」ではなく「住居の外側にある床」として現れる。舗装面の幅、樹木の位置、ベンチの向き、子どもの立つ場所が、通行量や所要時間と並ぶ道路の変数として扱われる対象になった。同時に、誰が主で誰が客かという、それまで道路に書かれていなかった序列が標識と条文の形で明文化され、運転者は自分がその空間へ入る側であることを、標識を通して読み取る位置に置かれた。",
    flipReading:
      "こす.くまはこれを、道路という既存物の輪郭を引き直した操作として読む。新しい施設を建てたのではなく、すでにそこにあった舗装面の用途と、そこに立つ人と車の役割を入れ替えている。注目すべきは、樹木やベンチという物の配置と、道路交通法規の条文という制度の記述が、同じ一枚の面に対して同時に働いている点である。物だけを置けば運転者の裁量に戻り、条文だけを書けば速度は落ちない。配置と定義を一組にしたことで、道路は別の輪郭で見直せる状態に置かれた。",
    counter:
      "歩く速さの規定は当初 stapvoets と曖昧で、後に15km/hへ数値化された経緯があり、条文と実際の走行速度の一致は自明でない。改修は舗装・排水・植栽をやり直すため通常の街路より高額で、緊急車両やごみ収集車の動線、駐車台数の減少が設計制約として残る。1988年の erf への改称は運用上の整理でもあった。事故件数は元々少なく、街路単位での安全効果の統計的検証には限界がある。改修街路の資産価値上昇と居住者交替については本件では未確認。",
    chronology: [
      { date: "1968", event: "ニーク・デ・ブールがエメン市エメルハウトの新住宅地で、自動車を歩行者・自転車に従属させる街路を設計。erf から woonerf の語を作る。" },
      { date: "1969", event: "デ・ブールの教え子ヨースト・ファールが、デルフトの既存街路への適用を始める。" },
      { date: "1970", event: "ファールがデルフトにオランダ初の減速ハンプを設置。" },
      { date: "1976-08-27", event: "王令（Stb.453）で「woonerf」「einde woonerf」の標識を制定。woonerf が道路交通法規に位置づけられる。" },
      { date: "1978-06-23", event: "ベルギーで woonerven に関する省令通達が出される。" },
      { date: "1980-07-21", event: "ドイツのStVO改正で verkehrsberuhigter Bereich（標識325）を導入。" },
      { date: "1988", event: "オランダで呼称を woonerf から erf へ変更し、適用範囲を商業地・学校周辺などへ拡大。" },
      { date: "1990", event: "RVV1990 第44〜46条が、全幅使用・速度・駐車の規定を引き継ぐ。" },
      { date: "1999", event: "英国で home zone のパイロット事業（9地区）が始まる。" },
      { date: "2001-02-01", event: "英国 Transport Act 2000 第268条（quiet lanes and home zones）施行。" },
    ],
    sources: [
      { label: "S1", publisher: "ANWB（オランダ王立自動車連盟）", title: "Het woonerf is populair, binnen én buiten Nederland", url: "https://www.anwb.nl/over-anwb/geschiedenis/woonerf", confirmed: true },
      { label: "S2", publisher: "オランダ政府（wetten.overheid.nl）", title: "Reglement verkeersregels en verkeerstekens 1990（RVV 1990）第44〜46条", url: "https://wetten.overheid.nl/BWBR0004825", confirmed: true },
      { label: "S3", publisher: "TU Delft／DASH", title: "The Heritage of the Woonerf", url: "https://journals.open.tudelft.nl/dash/article/view/4581", confirmed: true },
      { label: "S4", publisher: "Het Nieuwe Instituut", title: "Joost Váhl（Habitat: Expanding Architecture）", url: "https://nieuweinstituut.nl/projects/habitat-expanding-architecture/joost-vahl", confirmed: true },
      { label: "S5", publisher: "英国政府（legislation.gov.uk）", title: "Transport Act 2000, Section 268: Quiet lanes and home zones", url: "https://www.legislation.gov.uk/ukpga/2000/38/section/268", confirmed: true },
      { label: "S6", publisher: "Wegenwiki", title: "Woonerf（1976年8月27日王令 Stb.453による標識制定）", url: "https://www.wegenwiki.nl/Woonerf", confirmed: false },
      { label: "S7", publisher: "TRL（英国運輸研究所）／DfT", title: "Pilot home zone schemes: Evaluation of Morice Town, Plymouth（TRL640）", url: "https://www.trl.co.uk/uploads/trl/documents/TRL640.pdf", confirmed: false },
    ],
    notes:
      "【最重要・未確認】「デルフトの住民が夜間に自分たちで道路の舗装を掘り起こし、車が徐行せざるを得ないようにした」という起源譚は、英語圏のメディアに広く流通するが、ANWB、Het Nieuwe Instituut、オランダ語版資料、TU Delft／DASHのいずれにも該当記述が見当たらず、一次資料での裏が取れなかった。伝承として流通するが未確認。本文には採用していない。【起源地の整理】概念と語の初出はエメン市（デ・ブール、1968年）であり、デルフトは既成市街地の既存街路への適用と初の減速ハンプ設置（ファール、1969〜70年）の地。両者を混同しないこと。【本人の距離】ファール自身は woonerf という語を好まず、交通の分離ではなく混在を目的としていたとされる。「発明者」という単一の帰属は避けた。【法令番号】1976年8月27日 Stb.453 は二次情報に依拠し、Staatsblad原本での直接確認は未了。【数値の未確認】「1999年時点で6,000か所以上」「事故40%減」といった流通数値は原典を特定できず、本文に採用していない。【画像権利】未取得。オランダ国立公文書館（Nationaal Archief／Anefo）のCC-BY-SA画像、またはHet Nieuwe Instituut所蔵のVáhlアーカイブに照会すること。",
    axes: { era: "1970s", region: "西欧", field: "都市・インフラ", actorType: "行政・住民", scale: "大", legality: "合法" },
    flipOps: ["役割反転", "用途転換", "制度介入"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["道路", "歩行者優先", "交通静穏化", "共有空間", "住宅地"],
  },

  {
    id: "04",
    slug: "grameen-bank",
    titleJa: "グラミン銀行",
    titleOrig: "Grameen Bank",
    year: 1976,
    yearLabel: "1976–",
    place: "CHITTAGONG, バングラデシュ",
    actor: "ムハマド・ユヌス／チッタゴン大学経済学部",
    actorRole: "設計・運営",
    form: "金融制度・社会実験",
    oneline:
      "担保も法的契約も取らずに少額を貸し、五人一組の借り手が週ごとに返済する方式を、村の実験から国の銀行法へ移した。",
    facts:
      "1976年、チッタゴン大学の経済学者ムハマド・ユヌスが大学近郊のジョブラ村で実験融資を始めた。グラミン銀行公式は「42世帯」（別ページでは「42人の女性」）に自己資金から計27米ドルを貸したと記す。一人あたり約0.64ドルにあたる。同年、ジャナタ銀行からの借入を得て大学のアクションリサーチ事業として拡大し、1979年に中央銀行と国有商業銀行の関与でタンガイル県へ、その後ダッカ・ロングプール・パトゥアカリ各県へ広がった。1983年10月2日のGrameen Bank Ordinanceにより、農村の土地なし層への与信を目的とする法人格を持つ銀行として設立された。担保・保証人・法的執行文書を取らず、五人一組のグループと週次のセンター会合を通じて貸付と返済を扱う。公式には法的な連帯保証は課さないとされ、集団の圧力と再借入資格が実質的な履行手段となる。2006年、ノーベル平和賞をユヌスと同行が共同受賞。公式値では2026年6月時点で借り手1,062万人、女性97〜98%、2,568支店、回収率95.57%。",
    before:
      "銀行の与信は、担保・信用履歴・法的に執行可能な契約を前提に組み立てられていた。資産を持たない者は審査に入る前段で対象外として処理され、金融統計上も部門の外側に置かれた。農村の少額資金需要は村の金貸しや親族間の融通といった非公式領域に属し、制度の記述には現れなかった。貧困は所得移転や慈善の対象として語られ、与信の設計問題としては配置されていなかった。",
    operation:
      "貸付の担保を個人の資産から五人一組の関係に置き換え、金額を数十ドル単位へ、返済周期を年次から週次へ縮めた。審査と受渡しの場を支店の窓口から村のセンター会合へ移し、借り手が銀行へ来る動線を銀行員が村へ出向く方向に反転させた。法的契約と担保を外し、継続的な再借入の可否を履行の担保に置き換えた。さらに借り手を出資者に組み込み、1983年の条例で貸し手と借り手の所有関係を国の法制度の側に固定した。",
    foregrounded:
      "担保を持たない世帯の返済行動が、記録され集計される対象として前景に戻った。週次の会合は、統計に現れていなかった村内の資金の出入りを可視の帳簿へ移した。「信用がない」と分類されていた層を、返済率という既存の銀行部門と同じ尺度に並べて見直せる状況が生まれた。同時に、貧困層の資金需要が慈善の対象ではなく金融商品の需要として国際的な議論の場に置かれた。",
    flipReading:
      "こす.くまはこれを、担保という物の欠如を、関係と時間の配置で置き換えた操作として読む。動いたのは金額ではなく尺度と周期である。年単位・大口・担保付きという銀行の既定の刻みを、週単位・小口・無担保に組み替えたとき、「信用がない」という判定は対象の属性ではなく測定側の刻みの問題として現れる。誰が信用に値するかではなく、どの刻みで測れば返済行動が見えるのかを問う配置に移った、と読む。ただし尺度を変えれば見えるという構図は、見えたあとに何を負わせるかまでは保証しない。",
    counter:
      "効果の実証は割れている。Banerjee et al.（AEJ Applied 2015、ハイデラバードRCT）は事業投資の増加を認める一方、消費・健康・教育・女性の地位に有意な変化を見ていない。6カ国RCTの総括も「穏やかに正だが変革的ではない」とする。Pitt=Khandker（1998）の女性向け融資の効果はRoodman=Morduch（2014）に再現性を問われ、論争は未決着である。2010年インド・アンドラプラデシュ州では多重債務と強圧的な取立てが問題化し、州条例による規制に至った。Batemanは98%返済率の算定方法と初期の補助金依存を問う。2011年ユヌスは中央銀行に解任され、2024年に暫定政権首席顧問に就任、2025年に政府持分が25%から10%へ縮小された。制度の所有と政治の距離は決着していない。",
    chronology: [
      { date: "1976", event: "ジョブラ村で実験融資。公式記述では42世帯（または42人の女性）に自己資金から計27米ドル。" },
      { date: "1976-12", event: "ジャナタ銀行からの借入を得て、チッタゴン大学のアクションリサーチ事業として拡大。" },
      { date: "1979", event: "中央銀行と国有商業銀行の関与でタンガイル県へ展開。" },
      { date: "1983-10-02", event: "Grameen Bank Ordinance により独立した銀行として設立。払込資本の約40%を借り手が出資。" },
      { date: "2002", event: "Grameen II へ移行。返済期間・金額・スケジュールを可変にし、柔軟融資を導入。" },
      { date: "2006-10-13", event: "ノーベル平和賞をユヌスと同行が共同受賞。" },
      { date: "2010-10-15", event: "インド・アンドラプラデシュ州がマイクロファイナンス規制条例を施行。多重債務と強圧的取立てが背景。" },
      { date: "2011-03-02", event: "バングラデシュ中央銀行が定年を理由にユヌスを常務理事から解任。" },
      { date: "2013", event: "議会が Grameen Bank Act 2013 を可決し1983年条例を置換。政府の運営関与が強化される。" },
      { date: "2024-08-08", event: "ユヌスがバングラデシュ暫定政権の首席顧問に就任。" },
      { date: "2025-05-12", event: "官報告示により政府持分を25%から10%へ引き下げ、借り手株主が90%を保有。" },
    ],
    sources: [
      { label: "S1", publisher: "Grameen Bank", title: "Introduction（公式・2026年6月時点の統計と沿革）", url: "https://grameenbank.org.bd/about/introduction", confirmed: true },
      { label: "S2", publisher: "Grameen Bank", title: "Founder（公式・42人／27ドル、ジャナタ銀行借入）", url: "https://grameenbank.org.bd/about/founder", confirmed: true },
      { label: "S3", publisher: "NobelPrize.org", title: "The Nobel Peace Prize 2006 — Press release", url: "https://www.nobelprize.org/prizes/peace/2006/press-release/", confirmed: true },
      { label: "S4", publisher: "American Economic Journal: Applied Economics 7(1)", title: "Banerjee, Duflo, Glennerster, Kinnan「The Miracle of Microfinance?」", url: "https://www.aeaweb.org/articles?id=10.1257/app.20130533", confirmed: true },
      { label: "S5", publisher: "American Economic Journal: Applied Economics 7(1)", title: "Banerjee, Karlan, Zinman「Six Randomized Evaluations of Microcredit」", url: "https://www.aeaweb.org/articles?id=10.1257/app.20140287", confirmed: true },
      { label: "S6", publisher: "Center for Global Development", title: "Roodman & Morduch「The Impact of Microcredit on the Poor in Bangladesh: Revisiting the Evidence」", url: "https://www.cgdev.org/publication/impact-microcredit-poor-bangladesh-revisiting-evidence-working-paper-174-june-2013", confirmed: true },
      { label: "S7", publisher: "Strategic Change / Wiley", title: "Philip Mader「Rise and Fall of Microfinance in India: The Andhra Pradesh Crisis in Perspective」", url: "https://onlinelibrary.wiley.com/doi/10.1002/jsc.1921", confirmed: true },
      { label: "S8", publisher: "Library of Congress, Global Legal Monitor", title: "Bangladesh: Supreme Court Rejects Appeal of Muhammad Yunus over Removal from Bank", url: "https://www.loc.gov/item/global-legal-monitor/2011-05-12/bangladesh-supreme-court-rejects-appeal-of-muhammad-yunus-over-removal-from-bank/", confirmed: true },
      { label: "S9", publisher: "Laws of Bangladesh（法務省）", title: "The Grameen Bank Ordinance, 1983", url: "http://bdlaws.minlaw.gov.bd/act-details-651.html", confirmed: false },
    ],
    notes:
      "【数字の裏取り】「42人・27ドル」はグラミン銀行公式に記載があるが、公式サイト内で記述が割れている。Introductionページは「42 families」かつ発端を1974年の飢饉に結びつけ、Founderページは「42 women」かつ1976年とする。額は27米ドル『総額』であり一人あたり約0.64ドル。二次資料に「一人あたり27ドル」とする誤記があり、採用しない。年（1974／1976）と対象（世帯／女性）の不一致は未解決のまま残す。【返済率】公式値は95.57%（2026年6月）だが、旧資料では98.5%、他資料では96.29%と幅がある。Batemanは算定方法そのものを問題化しており、単一の数値を確定値として書かない。【連帯保証】グラミン側は「法的な連帯責任は課さない」と説明する一方、実務上はグループ単位の再借入停止や集団の圧力が履行手段として働く。この二層を混ぜて書かない。【未確認】1983年条例原文と2013年法の官報原本は取得に失敗しており、条例番号と日付は二次資料の一致に基づく暫定記載。【当事者の扱い】借り手個人の返済失敗・自殺事例を個別事例として描写しない。アンドラプラデシュ州の自殺報道は件数・因果ともに推計に幅があり、個別の物語として引用しない。【画像権利】未取得。【政治的中立】2024年以降ユヌスは暫定政権首席顧問であり、2025年の政府持分引き下げは同人が長を務める政権下で行われた。利益相反の指摘は counter に記すが、当否の判断は書かない。記述は2026年8月時点。",
    axes: { era: "1970s", region: "南アジア", field: "金融・経済", actorType: "個人・機関", scale: "巨大", legality: "合法" },
    flipOps: ["尺度変更", "役割反転", "制度介入"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["無担保", "信用", "マイクロファイナンス", "グループ連帯", "週次返済", "RCT"],
  },

  {
    id: "05",
    slug: "wrapped-reichstag",
    titleJa: "包まれたライヒスタッグ",
    titleOrig: "Wrapped Reichstag, Berlin, 1971-95",
    year: 1995,
    yearLabel: "1971–1995",
    place: "BERLIN, ドイツ",
    actor: "クリスト＆ジャンヌ＝クロード",
    actorRole: "作家",
    form: "都市介入・一時的インスタレーション",
    oneline:
      "24年の交渉を経て連邦議会の記名投票で許可を得たうえで、旧帝国議会議事堂を10万m²の布と約15,600mのロープで14日間覆った。",
    facts:
      "1971年8月、ベルリン在住の歴史家ミヒャエル・S・カレンがクリストとジャンヌ＝クロードにライヒスタッグ被覆を提案した。以後、連邦議会議長カール・カルステンス（1977年）、リヒャルト・シュテュックレン（1981年）、フィリップ・イェニンガー（1987年）が拒否。1988年就任のリタ・ジュスムートが支持に回り、1994年2月3日に会派横断の動議が提出された。同年2月25日、本会議で討論と記名投票が行われ、賛成292、反対223、棄権9、無効1で可決。首相ヘルムート・コールと会派代表ヴォルフガング・ショイブレは反対した。1994年10月18日に連邦議会と実施会社が契約を締結。1995年6月17日、足場・クレーンを使わず、90名の職業登攀者と120名の設営要員が作業を開始した。6月24日に70枚のアルミ蒸着ポリプロピレン布（計10万m²）で被覆を完了し、翌日に約15,600mの青いロープで結束した。下部構造の鋼材は約200t。7月7日まで公開され、来場者は500万人を超えた。費用は約1,500万マルクで、クリストの習作売却により全額自己負担した。",
    actorStatement:
      "両名は作品に象徴もメッセージもないと繰り返し述べた。ジャンヌ＝クロードは、真の芸術作品と同様にいかなる目的もなく、メッセージでも象徴でもなく、ただの芸術作品だと語っている。助成やスポンサーを受けず自己資金で賄うのも、完全な自由のための選択だと説明した。会期延長の要請も、一時性が強度を生むとして退けた。",
    before:
      "ライヒスタッグは1894年竣工、1933年の火災、1945年の戦闘、東西分断を経て、ベルリンの壁のすぐ西側に立っていた。戦後は西ドイツ議会の常設会場ではなく、展示施設と象徴的建造物として扱われる期間が長かった。市民にとっては通りすがりに視界へ入る石造の巨塊であり、その表面装飾や塔の形状が個別に見られる対象になることはほとんどなかった。統一後は連邦議会議事堂への改修が決まり、足場に覆われる直前の状態にあった。",
    operation:
      "建物の外形を消さずに、ファサード・塔・彫刻・屋根の凹凸を布でなぞらせた。70枚に裁断した布を吊り、石材を傷めないよう約200tの鋼構造を介して荷重を逃がし、青いロープで締めて襞を固定した。足場やクレーンを使わず登攀者が施工し、施工そのものを公開した。さらに、許可の判断を議長の裁量や長老評議会から本会議の記名投票へ移し、一件の作品の可否を立法府の議事日程に載せた。",
    foregrounded:
      "布が細部を伏せて輪郭だけを残したため、見慣れた石の装飾ではなく、建物の体積・比例・塔の配置といった全体の形が見る対象になった。同時に、動議文・議事録・投票記録という形で、誰がどの理由で可否を判断したかが公開資料として残った。作品の題名に「1971-95」と交渉期間が刻まれ、24年という時間そのものが作品の寸法の一部として提示された。施工中の登攀作業も公開され、包む行為自体が観覧対象になった。",
    flipReading:
      "こす.くまは、この事例を「隠すことで前景へ戻した」配置として読む。細部を布で伏せると、日常の視界で情報として処理されていた建物が、量塊と輪郭に還元されて見る対象へ戻る。ただし本件で動いたのは物の配置だけではない。許可の経路を議長の裁量から本会議の記名投票へ移した時点で、可否の判断そのものが公開の記録になり、立法府が一時的に鑑賞と論争の場へ置き換わった。作者は象徴解釈を否定したが、その否定は制度側で起きた配置換えを取り消さない。こす.くまは、24年の交渉を作品の準備期間ではなく、作品が占有した時間の実寸として記述する。",
    counter:
      "作者自身は意味も象徴もないと述べており、交渉過程を作品の一部とみなす読みは第三者の解釈である。ただし題名に1971-95が含まれる点、クリストが許可交渉の局面を「ソフトウェア」と呼んだ点は、この読みを支える。批判としては、右派が「スターリニズムの犠牲者への侮辱」として抗議し、議会内でも歴史的建造物を実験の対象にすべきでないという反論があった。写真や記念品の大量流通が体験を商品化したという指摘も残り、500万人の動員を観光イベントと区別できるかは問いとして残る。",
    chronology: [
      { date: "1971-08", event: "歴史家ミヒャエル・S・カレンがクリストとジャンヌ＝クロードに被覆を提案。" },
      { date: "1977-05-27", event: "連邦議会議長カール・カルステンスが拒否。" },
      { date: "1981-04", event: "議長リヒャルト・シュテュックレンが反対を表明。" },
      { date: "1987-06", event: "議長フィリップ・イェニンガーが政治的理由で拒否。賛成署名7万筆が提出される。" },
      { date: "1988-11-25", event: "リタ・ジュスムートが連邦議会議長に就任。" },
      { date: "1993-01-11", event: "コール首相とショイブレ会派代表がCDU/CSU会派で反対を表明。" },
      { date: "1994-02-03", event: "長老評議会で決着せず、会派横断の動議が提出される。" },
      { date: "1994-02-25", event: "本会議で討論と記名投票。賛成292・反対223・棄権9・無効1で可決。" },
      { date: "1994-10-18", event: "連邦議会と実施会社が契約を締結。" },
      { date: "1995-06-17", event: "内庭から被覆開始。90名の職業登攀者と120名の設営要員が施工。" },
      { date: "1995-06-24", event: "70枚目の布を展開し被覆完了。翌日に青いロープでの結束を完了。" },
      { date: "1995-07-07", event: "公開終了、解体開始。来場者は500万人超。" },
    ],
    sources: [
      { label: "S1", publisher: "Deutscher Bundestag", title: "Datenhandbuch Kap.18.4 — Chronik der Verhüllung des Reichstagsgebäudes (1995)", url: "https://www.bundestag.de/resource/blob/272546/0622382ce28fc7768dc3538bdd520967/Kapitel_18_04_Chronik_Verhuellung_des_Reichstagsgebaeudes_1995.pdf", confirmed: true },
      { label: "S2", publisher: "Deutscher Bundestag", title: "25. Februar 1994: Bundestag erlaubt Reichstagsverhüllung", url: "https://www.bundestag.de/dokumente/textarchiv/1994-02-25-christo-215814", confirmed: true },
      { label: "S3", publisher: "Deutscher Bundestag", title: "Kunst im Bundestag — Christo", url: "https://www.bundestag.de/en/visittheBundestag/art/artists/christo_inhalt-369928", confirmed: true },
      { label: "S4", publisher: "Tate", title: "Lost Art: Christo and Jeanne-Claude", url: "https://www.tate.org.uk/art/artists/christo-905/lost-art-christo-and-jeanne-claude", confirmed: true },
      { label: "S5", publisher: "visitBerlin", title: "Wrapped Reichstag in Berlin: the freedom of art", url: "https://www.visitberlin.de/en/blog/wrapped-reichstag-berlin-freedom-art", confirmed: true },
      { label: "S6", publisher: "ARTnews", title: "Christo's Most Controversial Artworks", url: "https://www.artnews.com/art-news/artists/christo-controversies-the-gates-wrapped-reichstag-1202689331/", confirmed: true },
      { label: "S7", publisher: "Christo and Jeanne-Claude Foundation", title: "Wrapped Reichstag, Berlin, 1971-95（公式作品ページ）", url: "https://christojeanneclaude.net/artworks/wrapped-reichstag/", confirmed: false },
    ],
    notes:
      "【一次資料の未取得】公式サイト christojeanneclaude.net はJavaScript描画のため本文を取得できず confirmed:false とした。素材数値は連邦議会Datenhandbuch と美術館・観光公社系資料の一致を根拠に採用。【数値の異同】(1) 投票結果は連邦議会Datenhandbuch の「賛成292・反対223・棄権9・無効1」を採用。連邦議会テキストアーカイブの要約からは295/226/10という別数値も読めたため要再確認。(2) 布面積は10万m²（別資料は109,400m²）。(3) 費用は約1,500万マルク（英語圏資料は「1,500万米ドル」と記す。通貨の混同の可能性があるためマルク表記のみとした）。(4) ロープ長は約15km／15,600mと幅がある。【画像権利】クリスト＆ジャンヌ＝クロード財団の権利管理は厳格。作品画像の大半はWolfgang Volz撮影で、作品著作権と写真著作権の二重処理が必要。図版掲載は無許諾では行わない。【編集上の注意】作家自身が象徴解釈を明示的に否定しているため、実行主体の説明とFLIP読解を混ぜないこと。「24年の交渉が作品の一部か」は確定した事実ではなく解釈であり、counter に論拠と留保を残した。",
    axes: { era: "1990s", region: "西欧", field: "現代アート", actorType: "個人作家", scale: "巨大", legality: "許可済み" },
    flipOps: ["可視化", "制度介入", "文脈置換"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["包む", "連邦議会", "一時性", "自己資金", "記名投票"],
  },

  {
    id: "06",
    slug: "bogota-mimes",
    titleJa: "パントマイムの交通整理",
    titleOrig: "Mimos de Bogotá / Cultura Ciudadana",
    year: 1995,
    yearLabel: "1995–2003",
    place: "BOGOTÁ, コロンビア",
    actor: "アンタナス・モックス（ボゴタ市長）",
    actorRole: "首長・政策設計",
    form: "都市政策・社会実験",
    oneline:
      "収賄が常態化していた交通警察を解散し、パントマイム芸人と市民に配った賛否のカードに街頭の規則運用を担わせた一連の市政策。",
    facts:
      "モックスは1995〜97年と2001〜03年にボゴタ市長を務めた。第一期に交通警察を解散し（人数は資料により1,800〜3,200人と食い違う）、まず職業パントマイム芸人20人を街頭に配置、のち約400人を訓練して計420人体制とした。芸人は発話せず、横断規則を守らない歩行者や運転者の動作をその場で模倣した。市は「correcto／incorrecto」を示す親指の上下カードを35万枚配布した。1997年の水危機では市長自らシャワーの映像に出演し、2か月で使用量が14%減、のち危機前比40%減と市長側が説明している。2002年の自主上乗せ納税「110% con Bogotá」には約63,000人が応じ、追加収入は約11〜12億ペソだった。2001年3月9日の「女性の夜」は19時30分〜翌1時、強制力のない呼びかけで、女性警官1,500人が市の警備に就いた。ボゴタの殺人率は1993年の約80／10万人から2004年に22へ、交通事故死は1992年をピークに2003年までにほぼ半減した。",
    before:
      "交通規則の運用は、制服・笛・切符・罰金という警察装置の内側にあった。違反は警官と運転者の二者間で処理され、賄賂によって取り消しうる私的な交渉になっていた。街路にいる他の通行者は、その交渉の外側に置かれた背景であり、規則が守られているかどうかを判定する立場にはなかった。歩行者の死は統計の行として集計され、路上のどこで誰が死んだかは通行者の視界から消えていた。",
    operation:
      "市は交通警察を解散し、罰金を切れない者、つまり声を持たないパントマイム芸人を同じ街路に立たせた。制裁の通貨を金銭から模倣に替え、違反者の動作をその場で反復して見せる。同時に親指の上下を印刷したカードを市民に配り、判定の道具を警察の手から通行者の手へ移した。歩道には歩行者が死んだ地点に黒い星を描いた。規則違反は当事者間の私的交渉から、街路にいる全員の面前で進行する出来事の位置へ移された。",
    foregrounded:
      "立ち上がったのは違反そのものではなく、違反を見ている他人である。運転者にとって背景だった歩行者と同乗者が、判定を下しうる観客として前景に戻った。芸人の模倣は違反者の身体動作を街路に複製し、当人が自分の動きを外から見る位置をつくる。黒い星は、通行の速度の下に埋もれていた死者の座標を舗装面に固定した。街路が、通り抜ける空間から、互いが互いに見られている場所として現れた。",
    flipReading:
      "こす.くまはこれを、罰の強度ではなく罰の宛先を動かした事例として読む。従来、違反の宛先は国家であり、市民は無関係な第三者だった。この配置では宛先が隣にいる他人へ移り、そのぶん規則は交渉不能になる。賄賂を渡すべき相手が街路全体に分散するからである。芸人が言葉を持たない点も読解の要点で、無言は反論すべき相手を消し、違反者を自分の動作とだけ向き合わせる。ただし本図鑑はこの手法の移植可能性を主張しない。ここで動いたのは制裁の主体と可視性の配置であり、効果の量ではない。",
    counter:
      "効果の帰属は確定していない。世界銀行／米州開発銀行のケーススタディは、殺人の減少がモックス就任前の1994年から始まり全国的な低下と同期していたと指摘する。同書が引く分解では、殺人減の53%が検挙率で説明され、市民文化施策の寄与は11%にとどまる。交通事故死については個別施策の効果を測った研究が存在しないと同書は明記する。倫理面では、恥を規制手段に用いる設計が共同体による相互監視へ、すなわち街頭の警官を頭の中の警官へ置き換える構図に転じうるという批判がある。芸人配置は1990年代のうちに終了し、持続したのは制度ではなく記憶の側だった。",
    chronology: [
      { date: "1995-01", event: "モックスがボゴタ市長に就任（第一期）。市政方針として Cultura Ciudadana を掲げる。" },
      { date: "1995", event: "収賄が常態化していた交通警察を解散。職業パントマイム芸人20人を街頭に配置し、のち約400人を訓練して計420人体制とする。" },
      { date: "1995-05", event: "親指の上下を示す市民カードを配布。計35万枚。" },
      { date: "1995-12", event: "深夜1時以降の酒類販売を禁じる「ley zanahoria」を施行。" },
      { date: "1997", event: "水危機。市長自身がシャワーの映像に出演し節水を呼びかける。2か月で使用量14%減と市が発表。" },
      { date: "1997-04", event: "大統領選出馬のため市長を辞任。" },
      { date: "2001-01", event: "モックスが市長に復帰（第二期）。" },
      { date: "2001-03-09", event: "「女性の夜」。強制力のない措置として男性に在宅を呼びかけ、女性警官1,500人が警備に就く。" },
      { date: "2002", event: "自主上乗せ納税「110% con Bogotá」。約63,000人が10%上乗せ分を納付。" },
      { date: "2003-12", event: "第二期任期終了。殺人率は1993年の約80／10万人から2004年に22へ低下。" },
      { date: "2007", event: "モックスが Corpovisionarios を設立し、市民文化調査を各都市で継続。" },
    ],
    sources: [
      { label: "S1", publisher: "World Bank / Inter-American Development Bank", title: "Llorente & Rivas (2005)『La caída del crimen en Bogotá』", url: "https://www.humanas.unal.edu.co/colantropos/files/5314/7415/7787/la_caida_del_crimen_en_Bogota.pdf", confirmed: true },
      { label: "S2", publisher: "Harvard Gazette", title: "Academic turns city into a social experiment（2004年3月）", url: "https://news.harvard.edu/gazette/story/2004/03/academic-turns-city-into-a-social-experiment/", confirmed: true },
      { label: "S3", publisher: "New Directions for Youth Development", title: "Cala Buendía, F. (2010) More carrots than sticks: Antanas Mockus's civic culture policy in Bogotá", url: "https://pubmed.ncbi.nlm.nih.gov/20391615/", confirmed: true },
      { label: "S4", publisher: "SSRN / LSE", title: "Yamin et al. (2021) The Power of Narratives in Social Norm Interventions", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3978846", confirmed: true },
      { label: "S5", publisher: "El Tiempo", title: "El día en el que Bogotá prohibió que los hombres salieran a la calle…", url: "https://www.eltiempo.com/bogota/el-dia-en-el-que-bogota-prohibio-que-los-hombres-salieran-a-la-calle-para-que-las-mujeres-se-sientan-seguras-3549258", confirmed: true },
      { label: "S6", publisher: "German Marshall Fund of the United States", title: "Citizenship Culture", url: "https://www.gmfus.org/gmf-cities/democracy-actions-cities/citizenship-culture", confirmed: true },
      { label: "S7", publisher: "Inter-American Development Bank", title: "Cultura ciudadana, programa contra la violencia en Santa Fe de Bogotá, 1995-1997", url: "https://publications.iadb.org/es/publicacion/15112/cultura-ciudadana-programa-contra-la-violencia-en-santa-fe-de-bogota-colombia", confirmed: false },
      { label: "S8", publisher: "Harvard Kennedy School Case Program", title: "Antanas Mockus: The Prohibition of Fireworks in Bogotá", url: "https://case.hks.harvard.edu/antanas-mockus-the-prohibition-of-fireworks-in-bogota/", confirmed: false },
    ],
    notes:
      "【誇張されて流通している数字】(1)「420人のパントマイム芸人が交通警察を置き換えた」は同時配置ではない。当初は職業芸人20人、その後約400人を訓練して計420人。(2) 解散した交通警察の人数は1,800人・2,000人・3,200人と食い違い、確定できない。(3)「芸人が活動した中心部で交通死が50%減った」という記述が広く流通しているが、S1は交通事故死の個別施策効果を測った研究は存在しないと明記しており、裏付けは取れない。(4)「殺人70%減」「交通死50%減」は都市全体・約10年の変化で、モックス2期のほかペニャロサ市政（1998-2000）を含む期間の数値。(5) 節水「40%減」は市長側の自己申告で、独立した効果分解は確認できていない。(6)「女性の夜」の参加者数は50万人超〜70万人と幅があり、回数も未確定。(7) 自主納税の追加収入は市歳入に占める比率が極小。額ではなく参加人数の事例として扱うべき。(8) 寄与度分解の原論文（Sánchez・Espinosa・Rivas 2003）は未取得で、S1経由の二次引用。【画像権利】未取得。1995年当時の芸人・カード・黒い星の写真はいずれも権利者未確認のため、掲載前に個別許諾が必要。",
    axes: { era: "1990s", region: "中南米", field: "公共制度", actorType: "行政", scale: "大", legality: "合法" },
    flipOps: ["役割反転", "可視化", "参加化"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["市民文化", "恥", "交通", "パントマイム", "自主納税"],
  },

  {
    id: "07",
    slug: "piano-stairs",
    titleJa: "ピアノ階段",
    titleOrig: "Pianotrappan / The Fun Theory",
    year: 2009,
    yearLabel: "2009",
    place: "STOCKHOLM, スウェーデン",
    actor: "Volkswagen Sweden／DDB Stockholm",
    actorRole: "広告主・制作",
    form: "広告キャンペーン・公共空間介入",
    oneline:
      "地下鉄駅の階段に踏むと音が鳴る鍵盤を敷設し、その様子を撮影して自動車メーカーの広告映像として公開した。",
    facts:
      "2009年秋、フォルクスワーゲン・スウェーデンとDDB Stockholmは、環境技術BlueMotion Technologiesの訴求を目的とする企画「Rolighetsteorin（The Fun Theory）」を実施し、ストックホルム地下鉄Odenplan駅の階段に踏むと音が鳴る鍵盤を敷設して撮影、映像をYouTubeで公開した。「66%」は実施主体側の発表数値であり、DDBのリリースは「平常日より66%多くの人がエスカレーターではなく階段を選んだ」と記す。観測人数、観測日の選定、平常日の基準、計測手法はいずれも公開されていない。ピアノ階段自体を対象とした独立測定や査読検証は確認できない。企画はCannes Lions 2010サイバー部門グランプリとPR部門シルバー、Guldägget 2010映画部門ディプロムを受けた。Peetersら（Persuasive 2013）は、ピアノ階段の効果は導入初日に集中し反復通行下での持続は示されていないとして、後継装置Social Stairsを大学構内で3週間運用した。フォルクスワーゲンは2015年9月18日、米EPAからディーゼル車の排ガス不正に関するクリーンエア法違反通知を受けた。",
    before:
      "駅の階段とエスカレーターは、隣り合って同じ高さを結ぶ二本の経路として置かれている。通勤者にとって選択は所要時間と身体的負荷の比較に還元され、階段は「エスカレーターが混んでいるときの代替」として背景に沈む。段の一枚一枚に個別の輪郭はなく、上下移動という機能の総体としてのみ扱われる。駅は通過するための場所であり、足が床に触れるという出来事は、記録も応答も残さないまま反復される。",
    operation:
      "階段の踏面を白黒の鍵盤に置き換え、各段に接触センサーと音源を接続した。段は移動経路の一部から、押されると音を返す個別の単位へ分割される。エスカレーターは撤去も封鎖もされず、隣に並置されたまま残された。設置は短期間で、映像の撮影と公開を前提としている。行為の対象は「階段を上る」から「階段を鳴らす」へ移り、通行そのものが記録され配信される素材になった。",
    foregrounded:
      "足が床に触れるという、駅で毎日起きていて誰も見ていなかった出来事が、音として返ってくることで見る対象になった。段の枚数、歩幅、足を置く順序、他人の通行が同時に鳴らす音——移動の内部に埋もれていた細部が前景へ戻る。同時に、エスカレーターと階段が並置されたまま残されたことで、日々無自覚に反復していた経路選択が、選択という輪郭を持って立ち上がる。",
    flipReading:
      "こす.くまはこれを、移動という不可視の行為に応答を与えた配置転換として読む。動いているのは階段の用途だけではなく、通行者と床の関係である。床は踏まれる側から鳴る側へ、通行者は運ばれる者から音を出す者へ位置を変える。ただしこの読解は、映像が示す一日の光景の範囲に限られる。持続や健康上の効果を読解の根拠に置くことはできない。前景へ戻ったのは「階段を選ぶべきだ」という規範ではなく、足が床に触れているという事実そのものだと、こす.くまは受け取る。",
    counter:
      "別の読み方も立つ。第一に、この配置は行動を望ましい方向へ寄せる最適化であり、別の輪郭で見直す状況をつくることと同義ではない。第二に、66%は実施主体の発表で、母数も計測方法も公開されていない。数字は広告の成果物であって観測記録ではない、という読みを排除できない。第三に、企画の目的はBlueMotion Technologiesの訴求であり、公共空間への介入は広告として機能した。第四に、事実として、この広告主は2015年9月に米EPAからディーゼル車排ガス不正の違反通知を受けている。因果は主張しないが、環境行動を主題とした広告と後年の不正は、同一主体の記録として時系列上に並ぶ。",
    chronology: [
      { date: "1982", event: "Remo Saraceniの床置き型鍵盤「Walking Piano」がニューヨークのFAO Schwarzに設置される。足で踏んで鳴らす鍵盤の先行例。" },
      { date: "2009-10-07", event: "ピアノ階段の映像がRolighetsteorin.se名義でYouTubeに公開される。" },
      { date: "2009-12-18", event: "Volkswagen Sverigeがプレスリリースで結果を発表（サイト訪問約120万人、映像1,000万回再生、応募約600件）。" },
      { date: "2010-06", event: "Cannes Lions 2010でThe Fun Theoryがサイバー部門グランプリを受賞（PR部門シルバーも受賞）。" },
      { date: "2010", event: "スウェーデンの広告賞Guldäggetで映画部門ディプロムを受ける。" },
      { date: "2013-04", event: "Peetersらが Persuasive 2013 で Social Stairs を発表。ピアノ階段の効果は導入初日に集中するとし、反復通行下での持続を課題として提示。" },
      { date: "2015-09-18", event: "米EPAがフォルクスワーゲンにクリーンエア法違反通知を発出（2.0Lディーゼル車 約59万台に排ガス試験回避ソフト）。" },
      { date: "2015-11-02", event: "米EPAが3.0Lディーゼル車について第二の違反通知を発出。" },
    ],
    sources: [
      { label: "S1", publisher: "PR Newswire（DDB Worldwide 公式リリース）", title: "DDB's Fun Theory for Volkswagen Takes Home Cannes Cyber Grand Prix", url: "https://www.prnewswire.com/news-releases/ddbs-fun-theory-for-volkswagen-takes-home-cannes-cyber-grand-prix-97156119.html", confirmed: true },
      { label: "S2", publisher: "Guldägget（スウェーデン広告賞・公式記録）", title: "Rolighetsteorin Pianotrappan — Volkswagen Sverige / DDB Stockholm, 2010", url: "https://guldagget.se/bidrag/rolighetsteorin-pianotrappan/", confirmed: true },
      { label: "S3", publisher: "Volkswagen Group Sverige（一次資料）", title: "Rolighetsteorin inspirerar till glädjefyllt klimatarbete（2009年12月18日）", url: "https://www.vwgroup.se/nyheter--media/pressmeddelanden/2009/12/rolighetsteorin-inspirerar-till-gladjefyllt-klimatarbete/", confirmed: true },
      { label: "S4", publisher: "Springer / Persuasive 2013 (DOI 10.1007/978-3-642-37157-8_21)", title: "Peeters et al. \"Social Stairs: taking the Piano Staircase towards long-term behavioral change\"", url: "https://research.tue.nl/en/publications/social-stairs-taking-the-piano-staircase-towards-long-term-behavi/", confirmed: true },
      { label: "S5", publisher: "iNudgeyou", title: "The Piano Stairs – Short Run Fun And Not A Nudge!", url: "https://inudgeyou.com/en/the-piano-stairs-short-run-fun-and-not-a-nudge/", confirmed: true },
      { label: "S6", publisher: "U.S. Environmental Protection Agency（一次資料）", title: "Learn About Volkswagen Violations", url: "https://19january2021snapshot.epa.gov/enforcement/learn-about-volkswagen-violations_.html", confirmed: true },
      { label: "S7", publisher: "METAMORPHOSIS（EU Horizon 2020）", title: "Piano stairs in several cities（66%を出典表示なしで引用する例）", url: "https://www.metamorphosis-project.eu/case-studies/piano-stairs-several-cities.html", confirmed: true },
      { label: "S8", publisher: "thefuntheory.com / rolighetsteorin.se（実施主体の原サイト）", title: "The Fun Theory — Piano Staircase 原ページ（66%の元文言）", url: "https://www.thefuntheory.com/piano-staircase", confirmed: false },
    ],
    notes:
      "【flip_statusを「境界事例」とした理由】配置転換（床が鳴る／通行が演奏になる）は成立しており、足が床に触れるという出来事は前景へ戻っている。しかし本件の目的は広告主の環境技術の訴求であり、企画自体が成果を「階段選択率の上昇」という行動指標で語る。前景化と行動最適化が同一の装置に同居しているうえ、中心的な効果数値が実施主体の自己申告で事実の層が薄い。片側の基準だけでは「収録」と判断できないため境界事例とする。【未確認事項】(1) 原典サイトの当時のページはアーカイブへ直接到達できず、66%の元文言はDDBのリリース経由でのみ確認した。(2) 設置期間の公式記録は見つからなかった。(3) ピアノ階段そのものを対象とした独立測定・査読研究は確認できない。S4は後継装置の研究であり原典の追試ではない。(4) 66%は独立検証を経ないまま、EU助成プロジェクトの資料等で出典表示なしに再引用されている。(5) 許認可文書は確認できていない（legality は推定）。【画像権利】映像・写真の権利は Volkswagen Sverige／DDB Stockholm に帰属。許諾は未取得。【記述上の注意】Dieselgateは時系列上の事実としてのみ記録し、ピアノ階段との因果・意図の連関は記述しない。",
    axes: { era: "2000s", region: "北欧", field: "広告・キャンペーン", actorType: "企業", scale: "小", legality: "許可済み" },
    flipOps: ["用途転換", "参加化", "可視化"],
    flipStatus: "境界事例",
    publishStatus: "公開可",
    keywords: ["ナッジ", "階段", "遊び", "広告", "自社発表数値"],
  },

  {
    id: "08",
    slug: "g0v-taiwan",
    titleJa: "零時政府（g0v）",
    titleOrig: "g0v.tw／台灣零時政府",
    year: 2012,
    yearLabel: "2012–",
    place: "TAIPEI, 台湾",
    actor: "高嘉良（Chia-liang Kao）ほか市民ハッカーコミュニティ",
    actorRole: "発起・分散協働",
    form: "市民テック・分散型プロジェクト群",
    oneline:
      "政府機関のドメイン .gov.tw の「o」を「0」に置き換えた .g0v.tw 上に、予算・辞書・議事録などを市民が作り直して置く分散型プロジェクト群。",
    facts:
      "2012年10月、行政院が「經濟動能推升方案」の宣伝動画を公開し、内容説明を欠く反復表現が批判を集めた。高嘉良ら「Hacker #15」チームはYahoo! Open Hack Day 2012の出品作を中央政府総予算の視覚化に差し替え、賞金5万台湾ドルを得た。同賞金を原資に2012年12月1日「第零次動員戡亂黑客松」を開催し、g0vが発足した。ハッカソンは2か月に一度の周期で継続し、揪松網には第74次までが記録されている。名称はgovのoを0に置き換えたもので、政府機関URLの .gov.tw を .g0v.tw に替えると市民が作り直した版に到達する構成をとる。主なプロジェクトは中央政府総預算視覚化（budget.g0v.tw）、萌典（moedict、教育部辞書データをCC0で再公開）、hackfoldr、Cofacts等。2014年3月の318（ひまわり）学生運動では立法院内外の中継設備設置とhackfoldrによる情報集約・共同記録を担った。2015年開始のvTaiwanは26件の法案審議に関与。2020年2月6日のマスク実名制開始時には、健保署のオープンデータをもとに唐鳳（オードリー・タン、当時政務委員）の招集で口罩地圖群が作られた。",
    before:
      "政府の情報は「すでに公開されている」ことになっていた。総予算はPDFの冊子として、辞書は検索窓の奥に、立法院の記録は公報の体裁で存在した。閲覧は可能だが、分量・形式・分割のされ方によって読み通す対象にはならず、内容は担当者と専門家の手元にとどまる。市民の側に残る動作は、広告や記者会見で要約された言葉を受け取るか受け取らないかに絞られていた。データは背景に置かれ、見えているが見られていない状態にあった。",
    operation:
      "操作の最小単位はドメインの1文字である。.gov.tw の「o」を「0」に替えるだけで、既存の政府サイトの隣に市民版が並ぶ。URLという既存の道筋をそのまま使い、末尾の1字だけを差し替えることで、公式と非公式が同じ住所体系に置かれる。その上でPDFの予算書はツリーマップに、辞書データはAPIとアプリに、議事の進行は共同編集の文書と中継に組み替えられた。2か月に一度のハッカソンが、この置き換えを続ける時間の単位になった。",
    foregrounded:
      "前景へ戻ったのは、まず数字と条文そのものである。総予算がひとつの面積として一望でき、どの区画が大きいかを比べる対象になった。同時に、政府サイトの読みにくさが仕様ではなく選択の結果でありうることが、隣に並ぶ別版によって比較可能になった。さらに、公共の情報を作り直す作業が誰の職務でもないという前提が外れ、「沒有人（誰もいない）」という空席が、そこへ入れる場所として立ち上がった。",
    flipReading:
      "こす.くまはこれを、批判の言葉ではなく住所の1文字で行われた配置替えとして読む。反対を表明する代わりに、同じ住所体系の隣に別版を置く。公式を消さず、否定もせず、比較可能な位置に並べるだけである。「不要問為什麼沒有人做這個，先承認『你』就是『沒有人』」というスローガンは、批判する側の役割を実装する側の役割へ入れ替える言い換えとして働いた。ここで動いたのは技術というより、誰がその席に座れるかという役割の配置である。",
    counter:
      "別の読み方も要る。制作の大半は無償の余暇労働で、続けられる人は職業・言語・可処分時間の面で偏る。人類学者Aaron Suは、参加者自身が「行動者は労働者ではない」と語る点を挙げつつ、承認されにくい組織運営やケアの労働が階級や性別に沿って偏在すると指摘する。政府側との接近は、成果の制度化と同時に取り込みの問いを残す。vTaiwanは2018年以降に主要な決定へ使われなくなり、操作性と参加者の減少、政府に採択義務がない点が課題として報じられた。作り直された版が保守されずに止まったとき誰が引き取るのか、という問いも残る。",
    chronology: [
      { date: "2012-10", event: "行政院「經濟動能推升方案」の宣伝動画が公開され、内容説明を欠く反復表現が批判を集める。" },
      { date: "2012-10", event: "Yahoo! Open Hack Day 2012で「Hacker #15」チームが出品作を中央政府総予算の視覚化へ差し替え、賞金5万台湾ドルを獲得。" },
      { date: "2012-12-01", event: "賞金を原資に「第零次動員戡亂黑客松」開催、g0v発足。以後2か月に一度の周期。" },
      { date: "2013", event: "萌典（moedict）公開。教育部辞書データを国語・台語・客語で再構成し、CC0で提供。" },
      { date: "2014-03", event: "318（ひまわり）学生運動。立法院内外の中継設備設置、hackfoldrによる情報集約と共同記録。" },
      { date: "2015-08", event: "vTaiwanでUber規制が最初の本格案件として扱われる。" },
      { date: "2016-10-01", event: "唐鳳（オードリー・タン）が行政院政務委員に就任。" },
      { date: "2018", event: "vTaiwanが主要な決定に用いられた最後の時期とされる（累計26件の法案に関与）。" },
      { date: "2020-02-06", event: "マスク実名制開始。健保署のオープンデータ公開を受け、唐鳳の招集で口罩地圖群が公開される。" },
      { date: "2026-07", event: "揪松網に第74次黑客松までが記録される。" },
    ],
    sources: [
      { label: "S1", publisher: "g0v.tw", title: "g0v Manifesto（英語版）", url: "https://g0v.tw/intl/en/manifesto/en/", confirmed: true },
      { label: "S2", publisher: "g0v.tw", title: "Portfolio（hackfoldr／Cofacts／政府預算視覚化／萌典ほか）", url: "https://g0v.tw/intl/en/portfolio/", confirmed: true },
      { label: "S3", publisher: "g0v 揪松團（Jothon）", title: "歷屆黑客松共筆（第零次動員戡亂黑客松 2012-12-01 以降の全記録）", url: "https://jothon.g0v.tw/events/", confirmed: true },
      { label: "S4", publisher: "g0v.tw", title: "中央政府總預算視覺化 budget.g0v.tw", url: "https://budget.g0v.tw/", confirmed: true },
      { label: "S5", publisher: "報導者 The Reporter", title: "拆政府原地重建，零時政府3年躋身全球前3大黑客社群", url: "https://www.twreporter.org/a/g0v-civic-tech-community", confirmed: true },
      { label: "S6", publisher: "Taiwan Insight（University of Nottingham）", title: "Aaron Su「Labours of g0v: Rethinking Work from the Perspective of Data Activists」", url: "https://taiwaninsight.org/2022/10/11/labours-of-g0v-rethinking-work-from-the-perspective-of-data-activists/", confirmed: true },
      { label: "S7", publisher: "衛生福利部 臺灣COVID-19防疫關鍵決策網", title: "唐鳳政務委員邀集民間社群透過健保署open data產製「防疫口罩查詢」應用平臺", url: "https://covid19.mohw.gov.tw/ch/cp-4822-53563-205.html", confirmed: true },
      { label: "S8", publisher: "Reboot Democracy（Beth Simone Noveck）", title: "Was vTaiwan such a big flop, after all?（26法案／2018年以降の停滞）", url: "https://rebootdemocracy.ai/blog/was-vtaiwan-such-a-big-flop-after-all", confirmed: true },
      { label: "S9", publisher: "Medium（游知澔 chihao yo）", title: "g0v (2018). What is g0v? Who are g0v?", url: "https://chihaoyo.medium.com/g0v-2018-93aab924dd8", confirmed: true },
    ],
    notes:
      "【一次資料の限界】g0v公式マニフェスト本文には、.gov.tw→.g0v.tw のドメイン置換や「影の政府サイト」を明示する記述は確認できなかった。当該説明はコミュニティ内で共有された理解であり、参加者による解説と各言語版Wikipediaに依拠している。マニフェストの公式条文ではない点に注意。【スローガン】「不要問為什麼沒有人做這個，先承認你就是『沒有人』」はg0vの各種告知・イベント名で広く用いられるが、マニフェスト本文の一節としては未確認。【未確認】萌典の初回公開日は特定できず（2013年頃とされる）。口罩地圖は単一プロダクトではなく複数実装の総称で、個々の開発者の網羅は行っていない。第零次黑客松の会場は未確認。「東アジア最大級」等の規模表現は評価語のため採用しない。【画像権利】g0vロゴ、各プロジェクトのスクリーンショット、318学運の中継画像はいずれも権利状態を未確認。【政治的配慮】台湾の政治状況・両岸関係・特定政党への評価は本項では扱わない。318学運およびvTaiwanについても、経過と報じられた課題のみを記述し是非は書かない。",
    axes: { era: "2010s", region: "東アジア", field: "市民テック", actorType: "匿名・市民集団", scale: "大", legality: "グレー" },
    flipOps: ["命名", "可視化", "参加化"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["オープンデータ", "ドメイン", "分散協働", "ハッカソン", "沒有人"],
  },

  {
    id: "09",
    slug: "love-is-in-the-bin",
    titleJa: "愛はゴミ箱の中に",
    titleOrig: "Love is in the Bin",
    year: 2018,
    yearLabel: "2018–2021",
    place: "LONDON, イギリス",
    actor: "バンクシー",
    actorRole: "作家（匿名）",
    form: "市場介入・自己破壊装置",
    oneline:
      "オークションで落札が成立した数秒後、額縁に内蔵された装置が絵画を途中まで裁断し、同じ物体が改題・再認証されて3年後に同じ会場で再び売却された。",
    facts:
      "2018年10月5日、ロンドンSotheby'sのContemporary Art Evening Auctionで《Girl with Balloon》（Lot 67、推定20万〜30万ポンド）が出品され、ハンマー86万ポンド、手数料込み104万2000ポンドで落札。当時の作家記録。落札成立の数秒後、作家が額装した枠内の遠隔操作式装置が作動し、キャンバスが下端から送り出されて途中で停止、下半分が短冊状になった。落札者（欧州の個人コレクター）は約1週間の交渉を経て同額で購入を確定。Pest Controlが新たな証明書と制作年（2018年）を発行し、題名を《Love is in the Bin》に変更した。Sotheby'sは事前の関与を否定し、Oliver Barkerは「我々はBanksyされた」と述べた。作品はMuseum Frieder Burda（2019年2月5日〜3月3日）を経てStaatsgalerie Stuttgartへ貸与。2021年10月14日、同じNew Bond Streetで再出品（推定400万〜600万ポンド）、9名が約10分競り、ハンマー1600万ポンド、手数料込み1858万2000ポンドでアジアの収集家が落札。2018年比で約17.8倍。2024年1月、Pest Controlが同作を《Girl Without Balloon》（2021年）へ再度改題・改年していたことが報じられた。",
    actorStatement:
      "バンクシー側は2018年10月17日にInstagramで動画「Shred the Love: the director's cut」を公開し、字幕「In rehearsals it worked every time…」とともに全面が裁断されるリハーサル映像を示した。同時に「本当に裁断された」「オークションハウスは関与していない」と投稿。装置の設置時期、リハーサルの実施、停止が不具合であったかは、いずれも実行主体の自己説明であり、独立には検証されていない。",
    before:
      "額縁は、作品を保護し価値を保存するための周辺物として扱われる。鑑定・輸送・保険の手続きでは中身が主で、枠は容器である。オークションのハンマーは所有権と金額を確定させる終点であり、それ以後に作品の物理状態が変わることは前提に入っていない。カタログに「作家による額装」と記されても、その内部が見られることはない。",
    operation:
      "作品本体ではなく額縁の内部に遠隔操作の裁断機構を置き、起動の時点をハンマーが落ちた直後に合わせた。売買の終点を、物理的変化の起点に接続した。作品はその場で状態を変え、Pest Controlが新しい証明書・題名・制作年を発行したことで、同一の物体が別の作品として登録し直された。会場・観客・記録映像は、そのまま制作の現場と記録に置き換わった。",
    foregrounded:
      "額縁の内側、落札成立から所有権移転までの数秒、そして「どの状態を作品と呼ぶか」を決める認証の手続きが、見る対象として前面へ戻った。作品の同一性を確定するのは作家か、認証機関か、オークションハウスか、所有者か——その配置が、価格表示と同じ画面の上に並べて置かれ、別の輪郭で見直せる状況が生まれた。",
    flipReading:
      "こす.くまはこれを「破壊」ではなく「登録の書き換え」として読む。物体はほぼ残っており、変わったのは繊維の並びと、証明書・題名・制作年という登録側の記述である。裁断は所有権移転の直前ではなく直後に置かれ、確定した売買を無効化せずに対象だけを差し替えた。作品の輪郭を決めているのは物質ではなく認証の手続きだという配置が、その順序によって前景へ戻る。2024年の再改題は、その書き換えが一度きりでないことも示している。",
    counter:
      "別の読み方も残る。市場への介入とされた行為の結果、価格は約17.8倍になり、批判は市場の商品として回収された。Sotheby'sは事前の関与を否定し、バンクシー側も共謀を否定するが、匿名情報源に基づき「会場側は何かが起きると察していた」とする報道もあり、両者は対立したままである。装置が途中で止まったのが不具合か演出かは、実行主体が公開した映像以外に検証手段がない。額縁の持ち込みと据え付けが会場の手続きを通過した経緯も、公開情報だけでは追えない。",
    chronology: [
      { date: "2006", event: "《Girl with Balloon》のキャンバス作品が制作され、作家から個人に譲渡される（作家側は、この時期に自己破壊機構を額に組み込んだと後に説明）。" },
      { date: "2018-10-05", event: "Sotheby's London、Lot 67。ハンマー86万ポンド、手数料込み104万2000ポンドで落札。直後に額内の装置が作動し、キャンバスが途中まで裁断される。" },
      { date: "2018-10-06", event: "バンクシーがInstagramで裁断を公表。Sotheby's側が「Banksyされたようだ」と発言。" },
      { date: "2018-10-11", event: "落札者が同額での購入を確定。Pest Controlが新証明書を発行し、《Love is in the Bin》（2018年）として認証。" },
      { date: "2018-10-17", event: "バンクシー側が動画「Shred the Love: the director's cut」を公開（実行主体の説明、独立検証なし）。" },
      { date: "2019-02-05", event: "Museum Frieder Burda（バーデン＝バーデン）で初公開（〜3月3日）。" },
      { date: "2019-03-07", event: "Staatsgalerie Stuttgartで公開開始。終期は資料により異なる。" },
      { date: "2021-09-03", event: "Sotheby'sが再出品を発表（推定400万〜600万ポンド）。ロンドン・香港・台北・ニューヨークを巡回展示。" },
      { date: "2021-10-14", event: "9名が約10分競り、ハンマー1600万ポンド、手数料込み1858万2000ポンドでアジアの収集家が落札。作家の競売記録。" },
      { date: "2024-01-23", event: "Pest Controlが同作を《Girl Without Balloon》（2021年）へ再度改題・改年していたことが報じられる。公式説明はない。" },
    ],
    sources: [
      { label: "S1", publisher: "Sotheby's（公式プレスリリース）", title: "Banksy's Love is in the Bin — Press Release, 3 September 2021", url: "https://sothebys-com.brightspotcdn.com/54/44/8b5ebd5140cc9b7488b457ac4cd8/sothebys-press-release-banksys-love-is-in-the-bin.pdf", confirmed: true },
      { label: "S2", publisher: "Sotheby's（公式ロットページ）", title: "Banksy | Love is in the Bin | Contemporary Art Evening Auction, 14 October 2021, Lot 20", url: "https://www.sothebys.com/buy/22a80d8e-43b4-429e-9723-c6bd81ac60a1/lots/86b4f4ba-85e9-489b-bdba-73c2b38b9488", confirmed: true },
      { label: "S3", publisher: "Sotheby's（公式記事）", title: "Latest Banksy Artwork 'Love is in the Bin' Created Live at Auction", url: "https://www.sothebys.com/en/articles/latest-banksy-artwork-love-is-in-the-bin-created-live-at-auction", confirmed: true },
      { label: "S4", publisher: "The Art Newspaper", title: "Banksy world record as shredded work sells to Asian collector for £18.6m at Sotheby's", url: "https://www.theartnewspaper.com/2021/10/14/banksys-shredded-love-is-in-the-bin-sells-for-pound185m", confirmed: true },
      { label: "S5", publisher: "The Art Newspaper", title: "Banksy video reveals shredding mechanism failed at Sotheby's", url: "https://www.theartnewspaper.com/2018/10/18/banksy-video-reveals-shredding-mechanism-failed-at-sothebys", confirmed: true },
      { label: "S6", publisher: "The Art Newspaper", title: "Banksy's shredded Girl with Balloon retitled and redated for second time", url: "https://www.theartnewspaper.com/2024/01/23/banksys-shredded-girl-with-balloon-retitled-and-redated-for-second-time", confirmed: true },
      { label: "S7", publisher: "Artnet News（Kenny Schachter）", title: "Here's What Really Happened With Banksy's Art-Shredding Stunt at Sotheby's, According to Kenny Schachter's Source", url: "https://news.artnet.com/art-world-archives/kenny-schachter-on-banksy-at-sothebys-stunt-1372921", confirmed: false },
    ],
    notes:
      "【画像権利】Pest Control Office が著作権・真正性の双方を厳格に管理しており、作品画像の掲載は許諾なしには行えない。オークション会場の記録映像・報道写真も Sotheby's および各通信社の権利下にある。【数値の扱い】2018年はハンマー86万ポンド／手数料込み104万2000ポンド、2021年はハンマー1600万ポンド／手数料込み1858万2000ポンドが確認範囲。英語版Wikipediaが18,582,000ポンドを hammer price と表記するのは誤りと判断した。【対立情報】(1) Sotheby's の事前認知：Sotheby's とバンクシー側の双方が関与を否定。一方で匿名情報源に基づき「会場側は何かが起きると察していた」とする記事がある。両者は未解決。(2) シュレッダーが途中で止まった理由：不具合とする説明は実行主体の動画のみが根拠で、独立検証なし。(3) 遠隔操作の実行者・所在は特定されていない。(4) Staatsgalerie Stuttgart の展示期間は資料により異なるため、記載を2019年開始の確認済み事実に限定した。【その他】2024年の再改題は Pest Control による公式説明がない。",
    axes: { era: "2010s", region: "西欧", field: "現代アート", actorType: "匿名作家", scale: "小", legality: "グレー" },
    flipOps: ["消去", "制度介入", "文脈置換"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["オークション", "破壊", "真正性", "認証"],
  },

  {
    id: "10",
    slug: "atm-leaderboard",
    titleJa: "ATMリーダーボード",
    titleOrig: "ATM Leaderboard",
    year: 2022,
    yearLabel: "2022",
    place: "MIAMI BEACH, アメリカ",
    actor: "MSCHF",
    actorRole: "制作集団",
    form: "装置・参加型作品",
    oneline:
      "実際に稼働するATMを美術見本市の会場に置き、利用者の口座残高と顔写真を、残高の多い順のランキング表として頭上の画面に表示した。",
    facts:
      "MSCHFはATM製造業者から入手した実働機を改造し、2022年11月29日から12月3日のArt Basel Miami BeachのPerrotinブースに設置した。利用者がデビットカードを挿入し暗証番号を入力すると、機械は口座残高を読み取り、内蔵カメラで撮影した顔写真とともに、頭上の「LEADERBOARD」画面へ残高の多い順に並べて表示した。アーケードゲームのハイスコア表を模した演出が取引ごとに再生された。残高照会も現金引き出しも金融ネットワークを通る実取引だった。会期序盤にDJのDiploが約300万ドルで首位となり投稿したが、その後約500万ドルの利用者に抜かれ、最終的に約950万ドルを記録した匿名の利用者が首位になったと報じられた。表には残高ゼロの行も並んだ。作品は会期中に7万5000ドルでマイアミの匿名コレクターへ売却され、機内に残っていた現金6000〜7000ドルも併せて引き渡された。",
    actorStatement:
      "MSCHFはこの装置を「富の誇示衝動をきわめて文字通りに蒸留したもの」と説明した。ランボルギーニやロレックスが密集するマイアミの光景を前提に、「実際の数字を出して、周囲と順位をつけよう」と述べている。ブランド品や車は見せられるのに価格そのものは公開しない、という非対称を出発点に置いたとしている。",
    before:
      "ATMは銀行の窓口機能を街路に分散させた設備であり、通行の途中で立ち止まり、口座の数字を自分ひとりの視界にだけ収めて立ち去るための箱として扱われてきた。残高は本人と金融機関のあいだにだけある数値で、他人の残高を見る機会はほぼない。一方、美術見本市の会場では、時計・車・服・落札額といった富の代理表現が絶えず視界に入る。金額そのものは隠され、その外側の記号だけが流通していた。",
    operation:
      "MSCHFは実働するATMをそのまま見本市の販売ブースに置き、装置に本来はない出力先を一つ足した。カメラの映像と読み取った残高を、利用者ひとりの画面から、頭上の共有スクリーンへ回した。並べ方は口座の大小順、様式はアーケードのハイスコア表。取引自体は本物のまま、結果の宛先だけが個人から会場全体へ移された。上位記録は会期後も保持し、次の展示先へ持ち越す設計とされた。",
    foregrounded:
      "通常は本人の視界の内側で完結する残高という数値が、顔写真と並んだ状態で会場の共有画面に載った。同時に、来場者が身につけていた富の代理表現が、金額という単一の尺度に置き換えられ、互いに比較可能な一列になった。誰が引き出せるかではなく、誰がいくら持っているかが、会場内での並び順として立ち上がった。ゼロの行も同じ表に並んだ。",
    flipReading:
      "こす.くまはこれを、装置の出力先だけを差し替えた配置転換として読む。ATMは新しい機能を得ていない。残高照会も出金も従来どおりで、動いたのは「誰に向けて表示するか」の一点である。それだけで、個人と金融機関の二者間にあった数値が第三者のいる場へ移り、順位という形式を与えられた。富の指標は普段から見えていたが、代理物としてしか見えていなかった。金額そのものを前景へ戻したとき、比較が可能になり、同時に見せる／見せないの判断が各人の手に返された。ハイスコア表という様式がその判断を遊戯の外形で包んだ点も含めて読む。",
    counter:
      "批判の対象である富の誇示と、上位に載る快楽は、この装置の上で分離できない。首位の投稿が拡散した経緯が示すとおり、装置は誇示衝動を批評すると同時に、それを実行する舞台も提供した。参加は自発的な操作を要したが、顔写真や残高が保存される範囲、表示の期間、削除の手続きについて、公開資料に記述は見当たらない。上位記録を次の展示先へ持ち越す設計であることを踏まえると、この空白は問いとして残る。さらに、富の可視化を主題とする作品が7万5000ドルで個人に売却され、機内の現金ごと所有物になった点も、批評の立ち位置を問い直す材料になる。",
    chronology: [
      { date: "2022-11-29", event: "Art Basel Miami Beach 2022のプライベートデー初日。Perrotinブースで《ATM Leaderboard》が稼働を開始。" },
      { date: "2022-11-30", event: "DJのDiploが約300万ドルで首位に立ち、投稿が拡散する。" },
      { date: "2022-12-01", event: "一般公開初日。首位が約500万ドルの利用者に交代したと報じられる。" },
      { date: "2022-12-02", event: "作品が7万5000ドルでマイアミの匿名コレクターに売却されたと報道。機内の現金6000〜7000ドルも併せて引き渡し。" },
      { date: "2022-12-03", event: "会期最終日。装置の稼働終了。" },
      { date: "2022-12-05", event: "最終的な首位が約950万ドルの匿名利用者だったと報じられる。" },
    ],
    sources: [
      { label: "S1", publisher: "The Art Newspaper", title: "Who is the richest person at Art Basel Miami Beach? ATM reveals users' bank balances", url: "https://www.theartnewspaper.com/2022/11/29/who-is-the-richest-person-at-art-basel-miami-beach-atm-reveals-users-bank-balances", confirmed: true },
      { label: "S2", publisher: "Miami New Times", title: "This Year's Art Basel Banana? An ATM with a Scoreboard", url: "https://www.miaminewtimes.com/arts-culture/mschfs-wealth-ranking-atm-sells-at-art-basel-miami-beach-2022-15843456/", confirmed: true },
      { label: "S3", publisher: "Brooklyn Magazine", title: "Art Basel's ATM Leaderboard 'winner' has $9.5m in the bank — and isn't Diplo", url: "https://www.bkmag.com/2022/12/05/atm-leaderboard-basel/", confirmed: true },
      { label: "S4", publisher: "CBS News Miami", title: "Who is the wealthiest person at Art Basel? This ATM is displaying users' bank balances for all to see", url: "https://www.cbsnews.com/miami/news/who-is-the-wealthiest-person-at-art-basel-this-atm-is-displaying-users-bank-balances-for-all-to-see", confirmed: true },
      { label: "S5", publisher: "Gizmodo", title: "MSCHF's Latest Project Is an ATM That Broadcasts Your Account Balance", url: "https://gizmodo.com/mschf-debuts-atm-that-broadcasts-your-account-balance-1849837682", confirmed: true },
      { label: "S6", publisher: "Dezeen", title: "MSCHF's ATM Leaderboard a \"distillation of wealth-flaunting impulses\"", url: "https://www.dezeen.com/2022/12/12/mschf-atm-leader-board-art-basel/", confirmed: false },
      { label: "S7", publisher: "Perrotin", title: "ATM Leaderboard by MSCHF（ギャラリー公式作品ページ）", url: "https://www.perrotin.com/en/artists/mschf/artworks/atm-leaderboard-2022-indoor-sculpture", confirmed: false },
    ],
    notes:
      "【売却額】当初の想定にあった「2023年に約30万ドルで落札」は裏付けが取れなかった。オークションハウスでの《ATM Leaderboard》の落札記録は確認できず、確認できたのは2022年12月の会期中にPerrotin経由で7万5000ドル・マイアミの匿名コレクターへ売却されたという一次市場での取引のみ。本項は7万5000ドルで記載した。【最高残高】報道により約290万／約300万／約500万／約900万／約950万ドルと数字が揺れる。会期序盤の首位はDiplo（約300万ドル）、最終首位は匿名利用者（約950万ドル）として記載。【発言者の帰属】「wealth-flaunting impulses」の発言者は媒体により Kevin Wiesner と Daniel Greenberg で不一致。個人名を特定せず「MSCHF」の説明として扱った。【個人情報・同意】撮影と表示に関する事前同意の手続き、保存されるデータの範囲、保存期間、削除手続きについて、公開資料に記述を見つけられなかった。存在しないとも存在するとも書かず、未確認として扱う。【氏名の表示】Miami New Timesは氏名も表示されたと記述するが、他媒体は写真と残高のみを記す。要追加確認のため本文では触れていない。【画像権利】MSCHFおよびPerrotinの写真は使用条件未確認。掲載にはPerrotinプレス窓口への照会が必要。【その他】買い手が公共の場に設置したかどうか、装置の現在地は未確認。",
    axes: { era: "2020s", region: "北米", field: "現代アート", actorType: "集団・企業", scale: "小", legality: "許可済み" },
    flipOps: ["可視化", "参加化", "文脈置換"],
    flipStatus: "収録",
    publishStatus: "公開可",
    keywords: ["残高", "序列", "ATM", "富の可視化", "ハイスコア"],
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
