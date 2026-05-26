export interface Creature {
  id: string;
  name: string;
  en: string;
  cat: string;
  color: string;
  filterType: string;
  fp: Record<string, unknown>;
  desc: string;
  detail: string;
  bio: string;
}

export const CREATURES: Creature[] = [
  { id:"kosukuma", name:"こすくまくん", en:"Kosukuma", cat:"special", color:"#F0EDD0", filterType:"kosukuma", fp:{}, desc:"", detail:"", bio:"こすくまくんの世界は、笑っちゃうぐらい色が爆発してて、現実が溶けてる。色と色が境界をなくしてグニャグニャ混ざって、ピンクとシアンとマゼンタとイエローが全部いっぺんに襲ってくる。形は抽象化されて、何が何だかわからなくなる。クマだから本当は2色しか見えないはずなのに、こすくまくんの脳の中ではこんなにバキバキに変換されてる。世界がエモすぎて、感じすぎちゃうから、横になって休む時間が必要なんだよ。" },
  { id:"human", name:"人間", en:"Human", cat:"special", color:"#FFCC88", filterType:"human", fp:{}, desc:"", detail:"", bio:"人間の目は赤・緑・青の3種類の細胞で約1,000万色を見分けられるんです。すごそうでしょ？でも実は、光の全体（電磁スペクトル）のたった0.0035%しか見えてないんだよ。紫外線も赤外線も電波も見えない。この世界は「ほんのちょっとだけ見えてる世界」なんです。" },
  { id:"dog", name:"犬", en:"Dog", cat:"land", color:"#D4935A", filterType:"dichro", fp:{channels:[[255,204,0],[0,77,255]]}, desc:"", detail:"", bio:"犬の目には色を見分ける細胞が2種類しかなくて、「黄色」と「青」の世界なんです。赤いボールを芝生に投げると、犬にはどっちも同じ黄土色に見えてるんだよ。でも暗いところでは人間の5倍見えるし、鼻は人間の1億倍。色がなくても全然平気。" },
  { id:"horse", name:"馬", en:"Horse", cat:"land", color:"#A0764A", filterType:"panorama", fp:{}, desc:"", detail:"", bio:"馬の目は顔の横についてるから、なんと視野が約350度もあるんです。見えないのは鼻の真正面と真後ろだけ。ライオンに狙われてもすぐ気づける設計なんだね。でも色は2色しか見えなくて、世界は黄色と青で出来てるんだよ。" },
  { id:"goat", name:"ヤギ", en:"Goat", cat:"land", color:"#B8925E", filterType:"horizoneye", fp:{}, desc:"", detail:"", bio:"ヤギの瞳孔は丸じゃなくて、横に長い長方形なんです。これで水平方向はものすごく広く見えるけど、上下は狭い。草原で天敵がどこから来ても気づけるように、地平線全体を一度に見られる設計なんだよ。しかも頭を下げて草を食べてる時も、瞳孔が回転して常に水平を保つんです。" },
  { id:"chameleon", name:"カメレオン", en:"Chameleon", cat:"reptile", color:"#5CBF50", filterType:"dualeye", fp:{}, desc:"", detail:"", bio:"カメレオンの左右の目はバラバラに動くんです。右目で前を見ながら左目で後ろを見る、なんてことができる。獲物を見つけた瞬間、両目をガッとそろえて「望遠鏡モード」に切り替え。距離を測って、舌をビュッ！この切り替えがカッコいいんだよ。" },
  { id:"frog", name:"カエル", en:"Frog", cat:"reptile", color:"#5CBF50", filterType:"motion", fp:{movR:0.5,movG:1.5,movB:0.3,bgDim:0.25,bgR:0.3,bgG:0.5,bgB:0.3}, desc:"", detail:"", bio:"カエルの目には「バグディテクター」という特別な神経があるんです。動いてるものだけに反応して、止まったものは見えなくなる。だから虫が止まった瞬間、カエルの世界からその虫は「消える」。動いたものだけが「存在する」世界なんだね。" },
  { id:"eagle", name:"ワシ", en:"Eagle", cat:"sky", color:"#8B6914", filterType:"sharp", fp:{saturation:1.8,sharpness:2.0,foveaZoom:1.4}, desc:"", detail:"", bio:"ワシの目には「中心窩」っていう超高解像度エリアが2つもあるんです。人間の4〜8倍の視力で、2km先のウサギも見つけられる。空の上から地上を見る時、まるで望遠鏡がついてるみたいに中央だけグーッとズームできるんだよ。" },
  { id:"owl", name:"フクロウ", en:"Owl", cat:"sky", color:"#B08050", filterType:"nightvision", fp:{tint:[25,255,38],brightness:2.5}, desc:"", detail:"", bio:"フクロウの目は暗いところで人間の100倍も見えるんです。月のあかりの10分の1でもネズミを見つけられる。目が大きすぎて眼球を動かせないから、首を270度ぐるっと回して補ってるんだよ。" },
  { id:"bat", name:"コウモリ", en:"Bat", cat:"sky", color:"#4A4A5A", filterType:"sonar", fp:{tint:[153,77,230],bg:[5,3,13],ringColor:[140,80,220],ringGap:60}, desc:"", detail:"", bio:"コウモリは「エコーロケーション」で世界を見てるんです。超音波を出して、跳ね返ってきた音で周りの形がわかる。飛んでる蛾の羽ばたきまで聞き分けられるくらい正確。音が「目」になるって、すごくない？" },
  { id:"cockroach", name:"ゴキブリ", en:"Cockroach", cat:"insect", color:"#8B5A2B", filterType:"compound", fp:{hexSize:6,uvShift:0.3,gridOpacity:0.3}, desc:"", detail:"", bio:"ゴキブリの複眼は時間を人間の6倍のスローモーションで見てるんです。人間が新聞紙を振り下ろしても、ゴキブリにはゆーっくり迫ってくるように見える。さらに視野はほぼ360度。だからあんなに素早く逃げられるんだよ。" },
  { id:"mantis", name:"カマキリ", en:"Mantis", cat:"insect", color:"#4CAF50", filterType:"stereo3d", fp:{}, desc:"", detail:"", bio:"カマキリは昆虫の中で唯一、立体視（3D）ができるんです。両目の位置がずれていて、そのズレから獲物までの距離を正確に測れる。人間が3D映画を見る時と同じ原理だよ。獲物をロックオンしたら、60〜100ミリ秒で鎌をふるう。昆虫界最速のハンターなんです。" },
  { id:"spider", name:"クモ", en:"Spider", cat:"insect", color:"#5A4A6A", filterType:"multieye", fp:{}, desc:"", detail:"", bio:"クモには目が8つもあるんです。でも全部同じ役割じゃない。前の2つ（主眼）は高解像度カメラみたいに獲物をハッキリ見る用。残りの6つは「動きセンサー」で、横や後ろの動きを見張ってるんです。チームプレーで世界を見てるんだね。" },
  { id:"koala", name:"コアラ", en:"Koala", cat:"land", color:"#A0A8B0", filterType:"drowsy", fp:{}, desc:"", detail:"", bio:"コアラは1日22時間も寝てるんです。起きてる2時間もほぼボーッとしてる。実はコアラの脳は哺乳類の中で一番小さくて（体重比）、脳の表面のシワもほとんどない。2色覚で赤も見えないし、目の解像度も低い。でもユーカリの毒がある葉とない葉を鼻で嗅ぎ分けられる。世界はぼんやりだけど、鼻だけはしっかり起きてるんだよ。" },
  { id:"dolphin", name:"イルカ", en:"Dolphin", cat:"ocean", color:"#5CC8D9", filterType:"mono", fp:{tint:[38,166,217],boost:1.2}, desc:"", detail:"", bio:"イルカの目には色を見分ける細胞が1種類しかないんです。だから世界は青緑の1色だけ。でも水の中では人間の10倍もよく見える。さらに「エコーロケーション」という超音波で、目を使わずに周りの形がわかるんです。音で「見てる」んだね。" },
  { id:"shark", name:"サメ", en:"Shark", cat:"ocean", color:"#7A8B99", filterType:"electro", fp:{rMul:0.3,gMul:0.5,bMul:1.2,fieldColor:[74,144,217]}, desc:"", detail:"", bio:"サメの顔には「ロレンチーニ器官」という特別なセンサーがあるんです。これで生き物の筋肉が出す、ものすごーく弱い電気を感じ取れる。砂の中に隠れた魚も「電気の気配」でバレバレ。人間には絶対見えない世界だね。" },
  { id:"octopus", name:"タコ", en:"Octopus", cat:"ocean", color:"#E07070", filterType:"polarized", fp:{rShift:0.3,bShift:0.5}, desc:"", detail:"", bio:"タコは色が1色しか見えないのに、体の色を自由に変えられる不思議な生き物。実は「偏光」っていう光の振動の向きが見えるんです。透明なエビも偏光の違いで丸見え。さらに皮膚にも光を感じるセンサーがあって、体全体が「目」みたいなもの。" },
  { id:"foureyedfish", name:"ヨツメウオ", en:"Four-eyed Fish", cat:"ocean", color:"#6A9B70", filterType:"spliteye", fp:{}, desc:"", detail:"", bio:"ヨツメウオの目は水面で上下に分かれてるんです。上半分で空を飛ぶ鳥を見張りながら、下半分で水中のエサを探す。しかもレンズの上と下で光の曲がり方が違うんだよ。空気と水、2つの世界を同時に見る目ってすごくない？" },
  { id:"deepsea", name:"深海魚", en:"Deep-sea Fish", cat:"ocean", color:"#1A2A4A", filterType:"biolum", fp:{glowR:77,glowG:153,glowB:255}, desc:"", detail:"", bio:"太陽の光が届かない深海では、自分で光るしかないんです。深海魚の目は「光の粒1つ」でも感じ取れるくらい超高感度。真っ暗な世界で、生き物たちの光だけがポツポツ浮かぶ。まるで宇宙にいるみたい。" },
  { id:"snake", name:"ヘビ", en:"Snake", cat:"reptile", color:"#5CBF50", filterType:"thermal", fp:{}, desc:"", detail:"", bio:"ヘビの顔にある「ピット器官」という穴で、赤外線を感じ取れるんです。暗闇でも獲物の体温が赤や黄色の色として「見える」。0.003度の温度差もわかるんだよ。しかも普通の目で見る映像と赤外線の映像を、脳の中で合体させてるんです。" },
  { id:"mshrimp", name:"シャコ", en:"Mantis Shrimp", cat:"ocean", color:"#FF5588", filterType:"tetra", fp:{saturation:2.2,uvTint:[102,51,204],uvStrength:0.8,sharp:1.5}, desc:"", detail:"", bio:"シャコの目には色を感じる細胞が16種類もあるんです（人間は3つだけ）。紫外線も見えるし、「円偏光」っていう特殊な光も見える。でも研究でわかったのは、色を「比べる」んじゃなくて「パッと判別する」方式なんだって。豊かさより確実さを選んだ目なんだね。" },
  { id:"mole", name:"モグラ", en:"Mole", cat:"land", color:"#5A3018", filterType:"lowres", fp:{pixels:6,levels:2,tint:[128,77,51],vignette:true,pixelate:true}, desc:"", detail:"", bio:"モグラの目は皮膚に埋もれた超ちっちゃい目で、光があるかないかしかわからないんです。でもその代わり鼻に「アイマー器官」っていう超高感度の触覚センサーがあって、左右の鼻で匂いの方向までわかる「ステレオ嗅覚」を持ってるんだよ。" },
  { id:"flamingo", name:"フラミンゴ", en:"Flamingo", cat:"sky", color:"#FF8FA0", filterType:"upsidedown", fp:{}, desc:"", detail:"", bio:"フラミンゴはエサを食べる時、頭を逆さまにして水中に突っ込むんです。だから脳は「逆さまの世界」を処理するのに慣れてる。しかも目のフィルターで赤い色素を強く感じ取れるから、エビやプランクトンの赤がすごく目立って見える。ピンク色に見える世界で、逆さまにご飯を食べる。なかなかユニークな生き方だよね。" },
  { id:"pigeon", name:"ハト", en:"Pigeon", cat:"sky", color:"#9A8EC0", filterType:"magneticvision", fp:{}, desc:"", detail:"", bio:"ハトの目には色を感じる細胞が5種類もあるんです（人間は3つ）。紫外線も偏光も見えるから、人間の何倍もカラフルな世界。でも一番すごいのは、目の中にある「クリプトクロム」っていう分子。これで地球の磁場が色のパターンとして視界に重なって見えるんだよ。だから数百km離れても巣に帰れる。ハトの目にはGPSが内蔵されてるんです。" },
];
