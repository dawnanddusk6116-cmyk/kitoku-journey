// ============================================================
// KITOKU ENGINE v1.0
// 将軍（河上貴徳）× 格さん
//
// このファイルはKITOKUの計算・描画の核心です。
// 5000年の知恵を正確に実装しています。
//
// ⚠️ 絶対に触らないでください。
// 修正が必要な時は必ず格さんと相談してください。
//
// 検証済み（2026/5/3）：
//   将軍（1967/6/14）本命六白・月命一白・傾斜一白・同会二黒 ✅
//   年納音：天河水 / 月納音：天河水 ✅
//   日盤中宮：八白 / 月盤：六白 / 年盤：一白 ✅
//   南東ランク4（本命・月命ともに吉）✅
// ============================================================

// ============================================================
// 【第1〜3層】データ定義・計算関数・吉凶判定（316行）
// ============================================================

const STARS={
  1:{k:'一白',j:'一白水星',arch:'静かな賢者',c:'#6dd4e8',elem:'水',elemColor:'#6dd4e8',
     color:'黒・紺・白',food:'塩味のもの・豆腐・海藻・貝類',
     conbini:['温かい昆布だし・お吸い物系スープ','豆腐・海藻サラダ','塩おにぎり（昆布・梅）']},
  2:{k:'二黒',j:'二黒土星',arch:'大地の守人',c:'#c4a043',elem:'土',elemColor:'#c4a043',
     color:'黄色・茶色・アイボリー',food:'甘味のもの・根菜・芋類・発酵食品',
     conbini:['さつまいもスイーツ・芋けんぴ','根菜の煮物・おでん（大根・芋）','甘酒・乳酸菌飲料']},
  3:{k:'三碧',j:'三碧木星',arch:'夜明けの先駆者',c:'#78d060',elem:'木',elemColor:'#78d060',
     color:'青・緑・碧',food:'酸味のもの・柑橘類・新鮮な野菜',
     conbini:['緑野菜サラダ・グリーンスムージー','柑橘系ジュース・レモネード','酢の物・さっぱり系おかず']},
  4:{k:'四緑',j:'四緑木星',arch:'縁結びの風',c:'#56cc94',elem:'木',elemColor:'#56cc94',
     color:'緑・青緑・白',food:'酸味のもの・ハーブ・風にさらしたもの',
     conbini:['ハーブティー・緑茶（さっぱり系）','青じそ入りサラダ・生野菜','ヨーグルト・乳酸菌系']},
  5:{k:'五黄',j:'五黄土星',arch:'孤高の帝王',c:'#d4a830',elem:'土',elemColor:'#d4a830',
     color:'黄色・金色・茶色',food:'甘味・根菜・土のもの全般',
     conbini:['かぼちゃ・さつまいも系スイーツ','おでん（全種）・根菜煮物','黒豆・ごま系和菓子']},
  6:{k:'六白',j:'六白金星',arch:'天命のリーダー',c:'#b8cce0',elem:'金',elemColor:'#b8d0e8',
     color:'白・金・銀',food:'辛味のもの・白い食べ物・根菜',
     conbini:['大根おろし・辛み系サラダ','白米おにぎり・白パン','辛口缶コーヒー・白湯']},
  7:{k:'七赤',j:'七赤金星',arch:'喜びの使者',c:'#e870a0',elem:'金',elemColor:'#e87090',
     color:'白・金・銀',food:'辛味のもの・白い食べ物・発酵食品',
     conbini:['サラダチキン・白いチキン系','烏龍茶・ジャスミン茶','白あんまん・白玉系スイーツ']},
  8:{k:'八白',j:'八白土星',arch:'不屈の継承者',c:'#a09878',elem:'土',elemColor:'#b0a888',
     color:'白・黄色・ベージュ',food:'甘味・山のもの・根菜・漬物',
     conbini:['山菜おこわ・栗ご飯系','たくあん・浅漬け・糠漬け','温かい麦茶・ほうじ茶']},
  9:{k:'九紫',j:'九紫火星',arch:'真実の炎',c:'#e86070',elem:'火',elemColor:'#e86070',
     color:'赤・紫・オレンジ',food:'苦味のもの・南国フルーツ・赤い食べ物',
     conbini:['ビターチョコ・コーヒー','トマト・赤パプリカ系サラダ','マンゴー・パッションフルーツジュース']},
};

const HP={1:'N',2:'SW',3:'E',4:'SE',5:'C',6:'NW',7:'W',8:'NE',9:'S'};
const OPP={N:'S',S:'N',E:'W',W:'E',NE:'SW',SW:'NE',SE:'NW',NW:'SE',C:'C'};
const JP={N:'北',S:'南',E:'東',W:'西',NE:'北東',NW:'北西',SE:'南東',SW:'南西',C:'中央'};
const EN={N:'N',S:'S',E:'E',W:'W',NE:'NE',NW:'NW',SE:'SE',SW:'SW'};
const ALL8=['N','NE','E','SE','S','SW','W','NW'];
const LAYOUT=[['SE','S','SW'],['E','C','W'],['NE','N','NW']];
const ZODIAC=[{k:'子',d:'N'},{k:'丑',d:'NE'},{k:'寅',d:'NE'},{k:'卯',d:'E'},{k:'辰',d:'SE'},{k:'巳',d:'SE'},{k:'午',d:'S'},{k:'未',d:'SW'},{k:'申',d:'SW'},{k:'酉',d:'W'},{k:'戌',d:'NW'},{k:'亥',d:'NW'}];
const BRANCH_DIR=['N','NE','NE','E','SE','SE','S','SW','SW','W','NW','NW'];
const BRANCH_NAME=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
function getZodiac(y){return ZODIAC[((y-2020)%12+12)%12];}
const SANGO_MAP={子:{group:'水局',dirs:['N','SE','SW']},丑:{group:'金局',dirs:['SE','W','NE']},寅:{group:'火局',dirs:['NE','S','NW']},卯:{group:'木局',dirs:['NW','E','SW']},辰:{group:'水局',dirs:['N','SE','SW']},巳:{group:'金局',dirs:['SE','W','NE']},午:{group:'火局',dirs:['NE','S','NW']},未:{group:'木局',dirs:['NW','E','SW']},申:{group:'水局',dirs:['N','SE','SW']},酉:{group:'金局',dirs:['SE','W','NE']},戌:{group:'火局',dirs:['NE','S','NW']},亥:{group:'木局',dirs:['NW','E','SW']}};
const AISEI={1:[1,3,4,6,7],2:[2,6,7,8,9],3:[1,3,4,9],4:[1,3,4,9],6:[1,2,6,7,8],7:[1,2,6,7,8],8:[2,6,7,8,9],9:[2,3,4,8,9]};
function aiseiList(s){return new Set((AISEI[s]||[]).filter(x=>x!==5&&x!==s));}
const TSUKI_MATRIX={A:[8,7,6,5,4,3,2,1,9,8,7,6],B:[5,4,3,2,1,9,8,7,6,5,4,3],C:[2,1,9,8,7,6,5,4,3,2,1,9]};
const KAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const SHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];


// ── KITOKU全画像マッピング ──
const KITOKU_IMAGES = {
  kyusei: {
    "一白水星":"https://drive.google.com/thumbnail?id=15K-iQWK2f8TYFy9b0XTCQrornepMwNwW&sz=w600",
    "二黒土星":"https://drive.google.com/thumbnail?id=1EXBui0y6dt9t4Wfi3bcr_OyR967pPGgu&sz=w600",
    "三碧木星":"https://drive.google.com/thumbnail?id=1-EgEqIg9Uw3v_4u_UH99pB76dRmIv3XV&sz=w600",
    "四緑木星":"https://drive.google.com/thumbnail?id=1sO81rruZu29nGyEpnexXcUipPKYPCnAS&sz=w600",
    "五黄土星":"https://drive.google.com/thumbnail?id=1kuKypFoXk6f0z9pRYeYnJ4URfZMK4Byp&sz=w600",
    "六白金星":"https://drive.google.com/thumbnail?id=1Xr3YRE28zPqKW_QGZcqntFpYIuew_IHt&sz=w600",
    "七赤金星":"https://drive.google.com/thumbnail?id=1BO87Qdnq-EuyHW9_laOWUKfLQRojKTEG&sz=w600",
    "八白土星":"https://drive.google.com/thumbnail?id=1hPOiscabyjLh6EhfKO9ZcKjYjDnBUIHs&sz=w600",
    "九紫火星":"https://drive.google.com/thumbnail?id=1MIP53-b-Ah4gH_Mm0QkJ4lGK_tqjW_BV&sz=w600",
  },
  nacchin: {
    "井泉水":"https://drive.google.com/thumbnail?id=18eo7-g-3C2pW8M-XC1784gSfKNgiwwn0&sz=w600",
    "屋上土":"https://drive.google.com/thumbnail?id=1LbDerIZBUb9EDE9jN_mb4YQLBh6Ggazi&sz=w600",
    "海中金":"https://drive.google.com/thumbnail?id=195LYCcqdkPDJMqtrSwZVuo0TEM_hqNlS&sz=w600",
    "金箔金":"https://drive.google.com/thumbnail?id=1Wa686LL7fafAPqTByCHEtHugWgLztOfp&sz=w600",
    "桑柘木":"https://drive.google.com/thumbnail?id=1wBwhrufKiGT50yxnD4qOLBf-LBpxjk1o&sz=w600",
    "剣鋒金":"https://drive.google.com/thumbnail?id=1B04JEq59BywZ1m2IXLQMHvYECid5FGZd&sz=w600",
    "沙中金":"https://drive.google.com/thumbnail?id=1FT0-l3GTksjOv3HTl2-A741SIEJWoaDq&sz=w600",
    "沙中土":"https://drive.google.com/thumbnail?id=1b1E98hdjCY4rugWX-hivBhWt9zHLYCKr&sz=w600",
    "山下火":"https://drive.google.com/thumbnail?id=19JTG2EAnT2xq-Hvio9gpG4KiYVvG4hFL&sz=w600",
    "山頭火":"https://drive.google.com/thumbnail?id=1r5HzI8AOkWV_IjwBW8Xh67o7f8V81kp5&sz=w600",
    "澗下水":"https://drive.google.com/thumbnail?id=1Yc5PYNwtovvAUSXrD__MM0xSPXInlAdv&sz=w600",
    "松柏木":"https://drive.google.com/thumbnail?id=1FfUaUGG0LDTOehjFhfn87VOvzoB8EW2W&sz=w600",
    "城頭土":"https://drive.google.com/thumbnail?id=1Am-_nWeDcQi54bL1DZ8pzrkr2G6XuqLJ&sz=w600",
    "石榴木":"https://drive.google.com/thumbnail?id=1waHgo-gQuotBR0AfFuj0dOL0l4A5OwOX&sz=w600",
    "大駅土":"https://drive.google.com/thumbnail?id=1YYC1Y3POpMiKNw6XIYq3eM4_zb2vuTCK&sz=w600",
    "大渓水":"https://drive.google.com/thumbnail?id=1tZ4oan5V6dTa8327QJ4nAqourio0bOMB&sz=w600",
    "大林木":"https://drive.google.com/thumbnail?id=1MvVrPwqcoSl-Gcy5JBOEiwCNyfsKiynl&sz=w600",
    "長流水":"https://drive.google.com/thumbnail?id=1A8ptwwFyuX7EJel7ooTaBUqkG0df4Y3h&sz=w600",
    "天河水":"https://drive.google.com/thumbnail?id=1UN5_xR4iGAsFA_w82yaDdJtjyQr8v7YF&sz=w600",
    "天上火":"https://drive.google.com/thumbnail?id=1C_KlM1r8fgs92Cd6OjObxuAIk0Jbo5Vg&sz=w600",
    "白蝋金":"https://drive.google.com/thumbnail?id=1VQ1iU9gP4A1nTm1xy11UL6SwtaXZlybU&sz=w600",
    "覆燈火":"https://drive.google.com/thumbnail?id=1_z7Wzgpb8eRWkA0KjoeKeoTlWex_12H-&sz=w600",
    "平地木":"https://drive.google.com/thumbnail?id=13EeX1IXT51DVsy5hWNUCk7IdU3SK4i_e&sz=w600",
    "壁上土":"https://drive.google.com/thumbnail?id=19rWGVXDzg7HHGM-N6ZmOPet6h28X3UU-&sz=w600",
    "楊柳木":"https://drive.google.com/thumbnail?id=1JGnXXOoJFwjOxWraB8g2CF7KjTyeeCli&sz=w600",
    "炉中火":"https://drive.google.com/thumbnail?id=15SfDto0oyMOpqEXbruuY81S3EOKSqBuB&sz=w600",
    "路傍土":"https://drive.google.com/thumbnail?id=1c-v5Qpt9vrakkjuzGsRrOQG_JCGpQGTg&sz=w600",
    "釵釧金":"https://drive.google.com/thumbnail?id=1C12ZbxQ_c3IF0r-jT3tpHQPE0SCaJsjL&sz=w600",
    "霹靂火":"https://drive.google.com/thumbnail?id=1ToBiD2ugFuQY388fzjsdsb0uU4IOpRJS&sz=w600",
    "大海水":"https://drive.google.com/thumbnail?id=1vHteNLLNAWaaX6FsJVwuOqng7HhtCvr_&sz=w600",
  },
  concept: {
    // ★重要
    "5層の人生ピラミッド":"https://drive.google.com/thumbnail?id=1sGz1X0-5TT6YJ2y_fpNXQrdEGPnkblX0&sz=w600",
    "九星相性マトリクス":"https://drive.google.com/thumbnail?id=1-aDAUzVOGq6pDwyXn8qf4jYD_M1741Mh&sz=w600",
    "新・実語教":"https://drive.google.com/thumbnail?id=1MCo9pEmufcPOZw5d0QkFcdmKTK7P-tzc&sz=w600",
    "人生を調和させる命の羅針盤":"https://drive.google.com/thumbnail?id=12Bv0e9gXxsumFnMkgIVoYrSRo8x0q5om&sz=w600",
    "盤面の使い分け":"https://drive.google.com/thumbnail?id=1RZ1zm5JOcBAONmqc5eXuXKlhKO37yOnM&sz=w600",
    "納音相性ガイド":"https://drive.google.com/thumbnail?id=1D54QURa648HR0H_sZAcEmvcjTX4YQZKH&sz=w600",
    // 九星開運ガイド
    "一白水星：運気と開運習慣":"https://drive.google.com/thumbnail?id=19FRDIZkAoQZMrZ8k4vi6Th2lvMY-1LBa&sz=w600",
    "一白水星と二黒土星の開運ガイド":"https://drive.google.com/thumbnail?id=1aIef8S5or8PK4tGFqcYuW8AkG0Ci6b9S&sz=w600",
    "二黒土星の開運ガイド":"https://drive.google.com/thumbnail?id=1x4WNys0gCg5Q1TDI54Xn9FM3ofHXtaJq&sz=w600",
    "三碧木星の開運ガイド":"https://drive.google.com/thumbnail?id=1PIh9w3X_pKVplGuKLujNHGxKhY5RUjlP&sz=w600",
    "四緑木星の開運アクションガイド":"https://drive.google.com/thumbnail?id=1X1RyWFa3jtWSvzB22VX9KenvUlOWNpUB&sz=w600",
    "五黄土星の最強開運ガイド":"https://drive.google.com/thumbnail?id=1MUB6GWBQoofcJpA2THZZO9XR9-WAJ5jx&sz=w600",
    "六白金星の開運極意ガイド":"https://drive.google.com/thumbnail?id=1ehJS2J7EaCIaQJf62px63ouZpPPwhvra&sz=w600",
    "七赤金星の開運言葉ガイド":"https://drive.google.com/thumbnail?id=1fCSMxFdKQdyYp60tffUPpKpsgbRgoQv5&sz=w600",
    "八白土星の開運ガイド":"https://drive.google.com/thumbnail?id=1mF0SPqJnyOyJaEOe3deC3TP3SWC59Pto&sz=w600",
    "八白土星 3つの開運アクション":"https://drive.google.com/thumbnail?id=1cp6v1mMra7fkMMwgRvYKJWZf6Ij8S6s-&sz=w600",
    "九紫火星 開運の羅針盤":"https://drive.google.com/thumbnail?id=1VYXZQWYZhcGxIWjADBX94-jQ5XFdL8aZ&sz=w600",
    // 納音関連
    "運命の羅針盤と魂の楽器":"https://drive.google.com/thumbnail?id=1cm5Ez_GGV7ZUdX2Bb_WytS13Ojxi3sFM&sz=w600",
    "納音：魂が奏でる独自の音色":"https://drive.google.com/thumbnail?id=1fS1MQdkSe1XvLXoBKtWj6Ez6opbzNMqo&sz=w600",
    "納音「土」グループ":"https://drive.google.com/thumbnail?id=1zcVlrzu64Z09PDE1muNftsJnslx1sbIv&sz=w600",
    "魂を響かせる木の音色":"https://drive.google.com/thumbnail?id=1yOax6nK0d76_Coo5K8SHRA1hTsJAF3wP&sz=w600",
    "長流水関係性の調和":"https://drive.google.com/thumbnail?id=1tPr5ktE_USBr9625f8TMmqHOeZFsi0DY&sz=w600",
    "納音「6つの金」タイプ別特徴":"https://drive.google.com/thumbnail?id=1CZjbaenLCDtMarVQwjdDOnHLNu_IgiR2&sz=w600",
    "納音「火」グループのY理論解説":"https://drive.google.com/thumbnail?id=1lEaN5zCQDKXTM16nsFy8GxkMVnadsBr_&sz=w600",
    "納音「大海水」魂の調律図":"https://drive.google.com/thumbnail?id=1uvb9SbpdHfA6VAmmG20m6VOPDBT90sCe&sz=w600",
    "納音「大渓水」第3のピース":"https://drive.google.com/thumbnail?id=1NUs-y1La2417zsyV2xxThQhhKMHAt9sp&sz=w600",
    "納音相性と五行の調律ガイド":"https://drive.google.com/thumbnail?id=18EcfpYO7_tQ__la8J8ZX9pw1VgAba4A8&sz=w600",
    "摩擦を宝に変える人間関係の羅針盤":"https://drive.google.com/thumbnail?id=1T4BHUMJk031ZRQcfciuqn3E5TD9swTmx&sz=w600",
    "釵釧金と次世代リーダーシップ":"https://drive.google.com/thumbnail?id=1pJ8_G5Raf_bWUXTpwCJ7j4v-V3v3jIv4&sz=w600",
    "井泉水の調律と魂の合奏":"https://drive.google.com/thumbnail?id=1t0Ywf6CRBcFe74j6hJrdbzVZbtGCRhXc&sz=w600",
    "澗下水魂の音色図鑑":"https://drive.google.com/thumbnail?id=1kypalpfL5un7ihMkllLqvvMCkBr4xIQN&sz=w600",
    "大海水：22世紀のデータレイク":"https://drive.google.com/thumbnail?id=1XR57ImERLISy8lZg5qQ-AJejXVzb7n1B&sz=w600",
    // その他
    "22世紀への羅針盤サバイバルガイド":"https://drive.google.com/thumbnail?id=1oX_ujh8zvEz4Av4xrEHaAcQnoAr5cyiQ&sz=w600",
    "魂の調律 ３つのステップ":"https://drive.google.com/thumbnail?id=1YGyltdwVJzSSM7MpZJtXovpk9_9LhS6s&sz=w600",
    "人生を好転させる3つのステップ":"https://drive.google.com/thumbnail?id=12hGF1k9XNos2ArRIEKqkhxa4xdNNVGQk&sz=w600",
    "運命を調律する人生設計マニュアル":"https://drive.google.com/thumbnail?id=1h8CSWccM6heL8zVYB59zLU3gk2Jk_HaT&sz=w600",
    "天地契約と2026年危機突破戦略":"https://drive.google.com/thumbnail?id=1UQVt6xZqqcqalooyuxOm2lT037yfhowQ&sz=w600",
    "日本の四大転換期と未来への備え":"https://drive.google.com/thumbnail?id=1c2zqm6lVHMyhs3HDCdhLBilJygeDZOmL&sz=w600",
  },
};

// ── 納音画像マッピング（後方互換・新URLに更新） ──
const NACCHIN_IMAGES = KITOKU_IMAGES.nacchin;

const NT=[
  {n:'海中金', r:'かいちゅうきん', e:'金', kw:'秘められた宝・深い誠実さ・時間で輝く才能',
   body:'深海に眠る金のように、派手に自己主張しないが内側に揺るぎない誠実さと深い洞察力を持つ。真に価値を分かってくれる人との出会いで一気に輝き出す。'},
  {n:'炉中火', r:'ろちゅうか', e:'火', kw:'創造の炎・情熱・人を温める力',
   body:'鍛冶屋の炉のようにあらゆるものを精錬する創造の炎。目標が定まった時の集中力は30種中最高クラス。人の心を温め勇気を与えるエネルギー。'},
  {n:'大林木', r:'だいりんぼく', e:'木', kw:'大きな森・包容力・揺るぎない存在感',
   body:'大きな森のように多くの命を包み育てる存在。組織の中で縁の下の力持ちとして輝く。雨（天河水）に潤われると最大限に成長する。'},
  {n:'路傍土', r:'ろぼうど', e:'土', kw:'揺るぎない道・誠実・踏まれるほど強くなる',
   body:'多くの人が安心して歩ける道のエネルギー。踏まれるほどに硬く強くなる30種屈指の忍耐力と誠実さ。目立たなくても努力は必ず豊かな実りとなる。'},
  {n:'剣鋒金', r:'けんぽうきん', e:'金', kw:'智慧の刃・一言で本質を切る・鋭い洞察',
   body:'30種中最も鋭く研ぎ澄まされた智慧の刃。一言で本質を切り取り誰も気づかない真実を照らす。その鋭さは欠点ではなく最高の才能。'},
  {n:'山頭火', r:'さんとうか', e:'火', kw:'山頂の炎・高い理想・人を照らす光',
   body:'山の頂上に燃える炎。遠くから見ても希望の灯台となる存在。高い理想と孤高の輝きを持つが、その炎が人の道を照らす時に最も美しく燃える。'},
  {n:'澗下水', r:'かんかすい', e:'水', kw:'谷の清流・浄化・見えない場所で潤す',
   body:'谷底を流れる清らかな水。目立たない場所で静かに大地を潤す。その純粋さと謙虚さが最終的に大きな流れとなって世に出る。'},
  {n:'城頭土', r:'じょうとうど', e:'土', kw:'城壁の土・守護・高みから守る',
   body:'城の壁を支える土。高い場所から守護し秩序を保つ力。責任感が強く守るべきものへの献身は30種中随一。'},
  {n:'白蝋金', r:'はくろうきん', e:'金', kw:'白蝋の輝き・品格・静かな美',
   body:'白蝋のように静かに輝く金。華やかさより品格と純粋さを重んじる。その静かな美しさと誠実さが長期的に人を惹きつける。'},
  {n:'楊柳木', r:'ようりゅうぼく', e:'木', kw:'柳の柔軟さ・しなやかな強さ・縁を結ぶ',
   body:'柳のようにしなやかに風に揺れながら折れない強さ。縁を大切にし人と人を結ぶ才能に優れる。柔軟性が最大の武器。'},
  {n:'井泉水', r:'せいちゅうすい', e:'水', kw:'泉の水・不変の純度・慈しみ',
   body:'岩の中から湧き出る清らかな泉。どんな状況でも純粋さと優しさを失わない。その変わらない慈しみの心が人々の心の拠り所となる。'},
  {n:'屋上土', r:'おくじょうど', e:'土', kw:'守護・俯瞰・高潔な孤独',
   body:'屋根の上の土。高い場所から守護し全体を俯瞰する。孤独を感じやすいが、その高潔さと広い視野は替えの利かない才能。'},
  {n:'霹靂火', r:'へきれきか', e:'火', kw:'雷の閃き・覚醒・瞬間の変革',
   body:'雷のように瞬間に世界を照らし変革をもたらす炎。直感の閃きと決断の速さは30種中随一。その瞬発力が多くの人の目を覚まさせる。'},
  {n:'松柏木', r:'しょうはくぼく', e:'木', kw:'松の品格・一貫性・年輪の力',
   body:'松や柏のように厳しい環境でも常緑を保つ。品格と一貫性を持ち時間をかけて磨かれた年輪の力は長期的に最大の信頼を生む。'},
  {n:'長流水', r:'ちょうりゅうすい', e:'水', kw:'大河の意志・継続・深い影響力',
   body:'長く流れ続ける大河。継続する力と広範囲に及ぶ影響力を持つ。時間をかけて大地を深く刻む意志の強さが最大の才能。'},
  {n:'沙中金', r:'さちゅうきん', e:'金', kw:'隠れた才能・晩成・本物の輝き',
   body:'砂の中に隠れた金。若い頃は気づかれにくいが磨かれるほど本物の輝きを放つ。晩成型の典型で時間が経つほど価値が増す。'},
  {n:'山下火', r:'さんげか', e:'火', kw:'洗練・情緒・夜に輝く才能',
   body:'山の麓に灯る火。昼より夜に輝く洗練された情緒を持つ。芸術・表現・人の心の機微を感じ取る才能に優れる。'},
  {n:'平地木', r:'へいちぼく', e:'木', kw:'社会基盤・共生・安心感を与える',
   body:'平地に広がる木々。社会の基盤を作り多くの人に安心感を与える。共生と協調の精神で周囲を支える存在感は替えが利かない。'},
  {n:'壁上土', r:'へきじょうど', e:'土', kw:'高潔・秩序・清潔な美しさ',
   body:'壁に塗られた土。高潔さと秩序を重んじ美しい境界線を保つ。天河水に潤われると本来の輝きを取り戻す。清潔な美しさが最大の魅力。'},
  {n:'金箔金', r:'きんぱくきん', e:'金', kw:'審美眼・プロデュース・価値の証明',
   body:'薄く広がる金箔のように美しさと価値を目に見える形にする才能。審美眼と演出力に優れ他者の才能を輝かせるプロデュース能力を持つ。'},
  {n:'覆燈火', r:'ふくとうか', e:'火', kw:'隠れた知性・静寂の力・夜の羅針盤',
   body:'覆いの中で燃える灯火。表には出ないが静かに確実に周囲を照らす知性を持つ。夜の羅針盤として人々の道を導く力がある。'},
  {n:'天河水', r:'てんがすい', e:'水', kw:'博愛・高い視座・慈雨・人を導く才能',
   body:'30種の中でも最も高い場所に源を持つ最強の水のエネルギー。誰にでも平等に注ぐ博愛と高い視点から世界を見渡す洞察力は、コーチング・教育・人を導く役割において最高の才能を発揮する。少し孤独を感じるのは、それだけ高い場所に立っているから。ただそこにいて潤いを放つだけで砂漠はオアシスになる。'},
  {n:'大駅土', r:'たいえきど', e:'土', kw:'夢の実現力・ハブ・循環させる力',
   body:'多くの人が行き交う宿場の土。人と情報と夢を循環させるハブとしての才能を持つ。動くほどに縁が広がり夢を現実に変える実現力がある。'},
  {n:'釵釧金', r:'さいせんきん', e:'金', kw:'完成された美・品格・不変の価値',
   body:'美しい装飾品の金。完成された美と品格を持ち不変の価値を体現する。その洗練された感性と存在感は時代を超えて輝き続ける。'},
  {n:'桑柘木', r:'そうしゃくぼく', e:'木', kw:'変容・利他・価値の織り手',
   body:'桑の木のように自らを与えることで価値を生む。変容と利他の精神を持ち他者の才能を引き出し価値ある形に織り上げる稀有な能力がある。'},
  {n:'大渓水', r:'だいけいすい', e:'水', kw:'突破力・指向性・意志ある流れ',
   body:'山間を勢いよく流れる渓流。障害にぶつかるほど力を増す突破力と強い意志を持つ。方向性が定まった時のエネルギーは30種中最大級。'},
  {n:'沙中土', r:'さちゅうど', e:'土', kw:'フィルタリング・隠れた価値・柔軟な受容',
   body:'砂の中の土。余分なものを濾過し本質だけを残す才能を持つ。柔軟に受容しながら価値あるものを見極める眼力が最大の強み。'},
  {n:'天上火', r:'てんじょうか', e:'火', kw:'公明正大・博愛・全てを照らす慈愛',
   body:'天の最も高い場所で燃える火。公明正大で分け隔てなく全てを照らす慈愛のエネルギー。その高潔な志が多くの人の精神的な支柱となる。'},
  {n:'石榴木', r:'ざくろぼく', e:'木', kw:'逆転・晩成・圧縮された才能',
   body:'石榴のように圧縮された種に無限の可能性を秘める。若い頃の苦労が後の大きな逆転の礎となる晩成型。実を結んだ時の輝きは誰も予想できないほど美しい。'},
  {n:'大海水', r:'たいかいすい', e:'水', kw:'包摂・無限の器・宇宙的な調和',
   body:'30種の中で最大の器を持つ大海のエネルギー。全てを包み込む包容力と宇宙的な調和を体現する。その深さと広さは計り知れず全ての源泉となる存在。'},
];

// ── 月納音計算 ──
function calcMonthNayin(by, bm, bd) {
  // 節入り日で気学月を確定
  const {kM} = getKD(by, bm, bd);
  // 月干支の天干：年の天干グループ（甲己年=甲から、乙庚年=丙から、etc）
  const yearStem = ((by - 4) % 10 + 10) % 10;
  const baseStems = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲〜癸年の月1月天干
  const mStem = (baseStems[yearStem] + (kM - 1)) % 10;
  // 月支：気学月から（1月=寅=2）
  const monthBranchMap = [2,3,4,5,6,7,8,9,10,11,0,1]; // kM1〜12 → 支インデックス
  const mBranch = monthBranchMap[kM - 1];
  const kanshiIdx = ((by - 4) % 60 + 60) % 60; // 年用（参考）
  // 月干支から納音インデックス（正しい60干支通し番号公式）
  // n = (天干*6 + 地支*5) % 60
  const ntIdx = Math.floor(((mStem * 6 + mBranch * 5) % 60) / 2);
  return { ...NT[ntIdx], ks: KAN[mStem] + SHI[mBranch], idx: ntIdx };
}

function calcNayin(y){const i=((y-4)%60+60)%60;const idx=Math.floor(i/2);return{...NT[idx],ks:KAN[i%10]+SHI[i%12],idx:idx};}
function ds9(n){while(n>9){let s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}n=s;}return n;}
function m9(x){const r=((x%9)+9)%9;return r===0?9:r;}
function red(v){if(v>=10)return v-9;if(v<=0)return v+9;return v;}
function pal(n,C){return((n-C+4)%9+9)%9+1;}
function sat(P,C){return((C+P-6)%9+9)%9+1;}
const SEKKI_DB={2020:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2021:{1:5,2:3,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2022:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2023:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},2024:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:7},2025:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2026:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2027:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:7,10:8,11:7,12:7},2028:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6}};
const SEKKI_KM={1:12,2:1,3:2,4:3,5:4,6:5,7:6,8:7,9:8,10:9,11:10,12:11};
const SEKKI_SHI=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
function getSekkiDay(y,m){if(SEKKI_DB[y])return SEKKI_DB[y][m];const A={1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:8,10:8,11:7,12:7};return A[m];}
function getKD(y,mo,d){const sd=getSekkiDay(y,mo);if(d<sd){const pm=mo===1?12:mo-1;return{kY:mo<=2?y-1:y,kM:SEKKI_KM[pm]};}return{kY:mo===1?y-1:y,kM:SEKKI_KM[mo]};}
function calcHonmei(kY){return m9(11-ds9(kY));}
function calcTsukimei(h,kM){const b=[1,4,7].includes(h)?10:[2,5,8].includes(h)?13:16;return red(b-(kM+1));}
function calcKeisha(h,t){return pal(h,t);}
function calcDokai(h,t){const Q=pal(t,h);return sat(10-Q,h);}
function yearCenter(y){const n=((2027-y)%9+9)%9;return n===0?9:n;}
function starPos(s,c){return HP[((s-c+4)%9+9)%9+1];}
function buildBoardFromCenter(c){const p2s={};for(let s=1;s<=9;s++){const d=starPos(s,c);p2s[d]=s;}return p2s;}
function getNodeMonthIdx(year,month,day){const sd=getSekkiDay(year,month);let m=day>=sd?month:(month===1?12:month-1);if(m===2)return 0;if(m>=3)return m-2;return 11;}
function getMonthCenter(year,month,day){const ni=getNodeMonthIdx(year,month,day);const cycleYear=(ni===11&&month<=2)?year-1:year;const c=yearCenter(cycleYear);const grp=[1,4,7].includes(c)?'A':[3,6,9].includes(c)?'B':'C';return TSUKI_MATRIX[grp][ni];}
function getMonthBranch(year,month,day){return(getNodeMonthIdx(year,month,day)+2)%12;}
const NICHIBAN_ANCHORS={2025:{yoto:{ref:new Date(2025,2,6),stem:1,branch:0,star:9,endDate:new Date(2025,5,21)},into:{ref:new Date(2025,5,22),stem:2,branch:1,star:8}},2026:{yoto:{ref:new Date(2026,2,4),stem:3,branch:1,star:2,endDate:new Date(2026,5,20)},into:{ref:new Date(2026,5,21),stem:2,branch:2,star:7}},2027:{yoto:{ref:new Date(2027,2,6),stem:5,branch:3,star:9,endDate:new Date(2027,5,21)},into:{ref:new Date(2027,5,22),stem:6,branch:4,star:8}},2028:{yoto:{ref:new Date(2028,2,5),stem:7,branch:5,star:7,endDate:new Date(2028,5,20)},into:{ref:new Date(2028,5,21),stem:8,branch:6,star:6}}};
function _getDayData(y,mo,d){const t=new Date(y,mo-1,d);const a=NICHIBAN_ANCHORS[y];if(!a)return null;const useY=t<=a.yoto.endDate;const anc=useY?a.yoto:a.into;const diff=Math.round((t-anc.ref)/86400000);const stem=((anc.stem+diff)%10+10)%10;const branch=((anc.branch+diff)%12+12)%12;const star=useY?(((anc.star-1+diff)%9)+9)%9+1:(((anc.star-1-diff)%9)+9)%9+1;return{stem,branch,star};}
function getDayCenter(y,mo,d){const dd=_getDayData(y,mo,d);if(!dd){const ref=new Date(2026,2,4);const diff=Math.round((new Date(y,mo-1,d)-ref)/86400000);return(((2-1+diff)%9)+9)%9+1;}return dd.star;}
function getDayBranch(y,mo,d){const dd=_getDayData(y,mo,d);if(!dd){const ref=new Date(2026,2,4);const diff=Math.round((new Date(y,mo-1,d)-ref)/86400000);return((1+diff)%12+12)%12;}return dd.branch;}
function getDayStem(y,mo,d){const dd=_getDayData(y,mo,d);if(!dd)return 0;return dd.stem;}
// 天道：月の十干（天干）から算出
// 甲乙→NE, 丙丁→S, 戊己→N, 庚辛→SW, 壬癸→N
const TENDO_BY_STEM=['NE','NE','S','S','N','N','SW','SW','N','N'];
function getTendoDir(ty,tm,td){
  // 月の天干を計算
  const yearStem=((ty-4)%10+10)%10;
  const baseStems=[2,4,6,8,0,2,4,6,8,0];
  const ni=getNodeMonthIdx(ty,tm,td); // 0-11
  const mStem=(baseStems[yearStem]+ni)%10;
  return TENDO_BY_STEM[mStem];
}
function rankDir(dir,starN,honmei,tsukimei,sangoSet,tendoDir){
  if(dir==='C')return{rank:0,badges:[]};
  const honList=aiseiList(honmei),tsukiList=aiseiList(tsukimei);
  const inHon=honList.has(starN),inTsuki=tsukiList.has(starN),inSango=sangoSet.has(dir);
  const inTendo=tendoDir&&dir===tendoDir;
  if(inHon&&inTsuki&&inSango)return{rank:5,badges:['✦ 本命・月命・三合','🔥 最高の吉方',(inTendo?'☀️ 天道':null)].filter(Boolean)};
  if(inHon&&inTsuki)return{rank:4,badges:['✦ 本命・月命　ともに吉',(inTendo?'☀️ 天道':null)].filter(Boolean)};
  if(inHon&&inSango)return{rank:3,badges:['✦ 吉方','🔥 三合の後押しあり',(inTendo?'☀️ 天道':null)].filter(Boolean)};
  if(inHon)return{rank:2,badges:['✦ 吉方',(inTendo?'☀️ 天道':null)].filter(Boolean)};
  if(inTendo)return{rank:1,badges:['☀️ 天道']};
  return{rank:0,badges:[]};
}
function getKyouDirs(boardCenter,honmei,breakDir,tsukimei,banType,opts){
  opts=opts||{};
  const p2s=buildBoardFromCenter(boardCenter);
  const goouDir=Object.keys(p2s).find(d=>p2s[d]===5)||null;
  const ankenDir=goouDir?OPP[goouDir]:null;
  const hmDir=Object.keys(p2s).find(d=>p2s[d]===honmei)||null;
  const hmTDir=hmDir?OPP[hmDir]:null;
  const teiiDir=Object.keys(p2s).find(function(d){var s=p2s[d];return d!=='C'&&s!==5&&HP[s]&&HP[s]!=='C'&&OPP[HP[s]]===d;})||null;
  const teiiTDir=teiiDir?OPP[teiiDir]:null;
  const items=[];
  if(goouDir&&goouDir!=='C')items.push({name:'五黄殺',dir:goouDir});
  if(ankenDir&&ankenDir!=='C')items.push({name:'暗剣殺',dir:ankenDir});
  // 破れの名前を盤種別で正しく表示
  const breakName=banType==='year'?'歳破':banType==='month'?'月破':'日破';
  if(breakDir&&breakDir!=='C')items.push({name:breakName,dir:breakDir});
  if(hmDir&&hmDir!=='C')items.push({name:'本命殺',dir:hmDir});
  if(hmTDir&&hmTDir!=='C')items.push({name:'本命的殺',dir:hmTDir});
  if(teiiDir&&teiiDir!=='C'){
    // 定位対冲：「宇宙のブレーキを方位に含める」がONの場合のみ凶に追加
    if(opts.teiiAsKyo)items.push({name:'定位対冲',dir:teiiDir});
  }
  if(teiiTDir&&teiiTDir!=='C'){
    if(opts.teiiAsKyo)items.push({name:'定位対冲（裏）',dir:teiiTDir});
    else items.push({name:'定位対冲（裏）',dir:teiiTDir}); // 裏は常に表示
  }
  // 月命的殺（設定がonの場合のみ）
  const showTsukimei=opts.tsukimeiSatsu==='on';
  if(showTsukimei&&tsukimei){
    const tmDir=Object.keys(p2s).find(d=>p2s[d]===tsukimei)||null;
    const tmTDir=tmDir?OPP[tmDir]:null;
    if(tmDir&&tmDir!=='C'){
      const existing=items.find(i=>i.dir===tmDir);
      if(existing)existing.name+='・月命殺';
      else items.push({name:'月命殺',dir:tmDir});
    }
    if(tmTDir&&tmTDir!=='C'){
      const existing=items.find(i=>i.dir===tmTDir);
      if(existing)existing.name+='・月命的殺';
      else items.push({name:'月命的殺',dir:tmTDir});
    }
  }
  const kyouSet=new Set(items.map(i=>i.dir));
  return{items,kyouSet};
}



// ============================================================
// 【第4層】描画エンジン（方位盤・リスト描画）
// ============================================================
// ※ DOM操作を含む。ブラウザ専用。
// ============================================================

function navBan(dir){
  const type=gState.currentBan;
  if(type==='year'){
    gState.navYear+=dir;
  }else if(type==='month'){
    let m=gState.navMonth+dir;
    let y=gState.navYear;
    if(m>12){m=1;y++;}
    if(m<1){m=12;y--;}
    gState.navYear=y;gState.navMonth=m;
    // 月の最終日に調整
    const lastDay=new Date(y,m,0).getDate();
    if(gState.navDay>lastDay)gState.navDay=lastDay;
  }else{
    const cur=new Date(gState.navYear,gState.navMonth-1,gState.navDay);
    cur.setDate(cur.getDate()+dir);
    gState.navYear=cur.getFullYear();
    gState.navMonth=cur.getMonth()+1;
    gState.navDay=cur.getDate();
  }
  updateBanNavLabel();
  renderBanNav();
}

function renderBanNav(){
  // ナビ用の日付で盤面を再計算
  const {honmei,tsukimei,by,bm,bd}=gState;
  const ty=gState.navYear,tm=gState.navMonth,td=gState.navDay;
  const type=gState.currentBan;
  const dayCenter=getDayCenter(ty,tm,td);
  const monthCenter=getMonthCenter(ty,tm,td);
  const yearCent=yearCenter(ty);
  // 一時的に上書き
  const saved={ty:gState.ty,tm:gState.tm,td:gState.td,dayCenter:gState.dayCenter,monthCenter:gState.monthCenter,yearCent:gState.yearCent};
  gState.ty=ty;gState.tm=tm;gState.td=td;
  gState.dayCenter=dayCenter;gState.monthCenter=monthCenter;gState.yearCent=yearCent;
  renderBan(type);
  // 元に戻す（gStateのnavYear/Month/Dayは保持）
  gState.ty=saved.ty;gState.tm=saved.tm;gState.td=saved.td;
  gState.dayCenter=saved.dayCenter;gState.monthCenter=saved.monthCenter;gState.yearCent=saved.yearCent;
}

function updateBanNavLabel(){
  const type=gState.currentBan;
  const y=gState.navYear,m=gState.navMonth,d=gState.navDay;
  const lbl=document.getElementById('banNavLabel');
  const sub=document.getElementById('banNavSub');
  if(!lbl)return;
  if(type==='year'){
    lbl.textContent=`${y}年`;
    sub.textContent='年盤 — 年間の大きな流れ';
  }else if(type==='month'){
    lbl.textContent=`${y}年 ${m}月`;
    sub.textContent='月盤 — 月の流れ';
  }else{
    lbl.textContent=`${y}年 ${m}月 ${d}日`;
    sub.textContent='日盤 — 今日の方位';
  }
}

function renderBan(type){
  const {honmei,tsukimei,ty,tm,td,dayCenter,monthCenter,yearCent}=gState;
  let center;
  if(type==='day')center=dayCenter;
  else if(type==='month')center=monthCenter;
  else center=yearCent;

  const p2s=buildBoardFromCenter(center);
  const z=getZodiac(ty);
  const sangoInfo=SANGO_MAP[z.k]||{dirs:[]};
  const sangoSet=new Set(sangoInfo.dirs);

  let breakDir='C';
  if(type==='year')breakDir=OPP[z.d];
  else if(type==='month'){const mb=getMonthBranch(ty,tm,td);breakDir=OPP[BRANCH_DIR[mb]];}
  else{const db=getDayBranch(ty,tm,td);breakDir=OPP[BRANCH_DIR[db]];}

  const {items:kyouItems,kyouSet}=getKyouDirs(center,honmei,breakDir,gState.tsukimei,type);

  // 天道：月盤・日盤のみ表示（年盤は不要）
  const tendoDir=(type!=='year')?getTendoDir(ty,tm,td):null;

  // 各方向の吉凶ランク
  const dirData={};
  ALL8.forEach(dir=>{
    const starN=p2s[dir];
    const r=rankDir(dir,starN,honmei,tsukimei,sangoSet,tendoDir);
    const isKyo=kyouSet.has(dir);
    dirData[dir]={starN,rank:r.rank,badges:r.badges,isKyo};
  });
  dirData['C']={starN:p2s['C']||center,rank:0,badges:[],isKyo:false};

  // DAILYで使えるよう日盤のdirDataをgStateに保存
  if(type==='day') gState.dayDirData=dirData;

  // コンパス盤描画
  const wrap=document.getElementById('compassWrap');
  wrap.innerHTML='';

  // グリッド（向きに応じてLAYOUTを切り替え）
  const LAYOUT_NORTH=[['NW','N','NE'],['W','C','E'],['SW','S','SE']];
  const currentLayout=(gState.orient==='north')?LAYOUT_NORTH:LAYOUT;
  const gridDiv=document.createElement('div');
  gridDiv.className='compass-grid';
  currentLayout.forEach(row=>{
    row.forEach(dir=>{
      const cell=document.createElement('div');
      const isCenter=(dir==='C');
      const dd=dirData[dir];
      let cls='cell ';
      if(isCenter)cls+='cell-center';
      else if(dd.isKyo)cls+='cell-kyo';
      else if(dd.rank>=5)cls+='cell-saikokichi';
      else if(dd.rank>=4)cls+='cell-saikokichi';
      else if(dd.rank>=3)cls+='cell-daikichi';
      else if(dd.rank>=2)cls+='cell-kichi';
      else cls+='cell-normal';
      cell.className=cls;
      if(!isCenter)cell.onclick=()=>openDirPopup(dir,center,dirData,kyouItems,kyouSet);

      const numEl=document.createElement('div');
      numEl.className='cell-num';
      numEl.textContent=dd.starN||'';
      cell.appendChild(numEl);

      if(!isCenter){
        const nameEl=document.createElement('div');
        nameEl.className='cell-name';
        nameEl.textContent=STARS[dd.starN]?.k||'';
        cell.appendChild(nameEl);
      }
      gridDiv.appendChild(cell);
    });
  });
  wrap.appendChild(gridDiv);

  // 方位ラベル生成関数
  function makeDirCell(dir){
    const div=document.createElement('div');
    div.style.cssText='text-align:center;overflow:hidden;line-height:1.3;padding:2px 1px;';
    if(dir&&dir!==''){
      const dd=dirData[dir];
      let subText='';
      let labelClass='dir-label-text normal';
      if(dd.isKyo){
        labelClass='dir-label-text kyo';
        const kns=kyouItems.filter(k=>k.dir===dir);
        if(kns.length)subText=kns.map(k=>k.name.split('/')[0]).join('・');
      }
      else if(dd.rank>=4){labelClass='dir-label-text kichi';subText=dd.rank>=5?'本命・月命・三合':'本命・月命 吉';}
      else if(dd.rank>=3){labelClass='dir-label-text kichi';subText='吉方';}
      else if(dd.rank>=2){labelClass='dir-label-text kichi';subText='吉方';}
      else if(dd.rank>=1){labelClass='dir-label-text kichi';subText='天道';}
      const dirEl=document.createElement('div');
      dirEl.className=labelClass;
      dirEl.style.cssText='font-size:.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      dirEl.textContent=JP[dir];
      div.appendChild(dirEl);
      if(subText){
        const badge=document.createElement('div');
        badge.className='dir-badge '+(dd.isKyo?'kyo':dd.rank>=4?'dai':'kichi');
        badge.style.cssText='font-size:.44rem;margin-top:2px;padding:1px 3px;border-radius:3px;display:inline-block;max-width:100%;overflow:hidden;white-space:nowrap;';
        badge.textContent=subText;
        div.appendChild(badge);
      }
    }
    return div;
  }

  // 東西の縦ラベル生成
  function makeSideLabel(dir){
    const div=document.createElement('div');
    div.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 2px;flex-shrink:0;width:24px;';
    const dd=dirData[dir];
    let labelClass='dir-label-text normal';
    let subText='';
    if(dd.isKyo){
      labelClass='dir-label-text kyo';
      const kns=kyouItems.filter(k=>k.dir===dir);
      if(kns.length)subText=kns.map(k=>k.name.split('/')[0]).join('・');
    }
    else if(dd.rank>=4){labelClass='dir-label-text kichi';subText=dd.rank>=5?'本命・月命・三合':'本命・月命 吉';}
    else if(dd.rank>=3){labelClass='dir-label-text kichi';subText='吉方';}
    else if(dd.rank>=2){labelClass='dir-label-text kichi';subText='吉方';}
    else if(dd.rank>=1){labelClass='dir-label-text kichi';subText='天道';}
    const dirEl=document.createElement('div');
    dirEl.className=labelClass;
    dirEl.style.cssText='font-size:.78rem;font-weight:700;writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:.1em;';
    dirEl.textContent=JP[dir];
    div.appendChild(dirEl);
    if(subText){
      const badge=document.createElement('div');
      badge.className='dir-badge '+(dd.isKyo?'kyo':dd.rank>=4?'dai':'kichi');
      badge.style.cssText='font-size:.38rem;margin-top:4px;padding:2px 3px;border-radius:3px;display:inline-block;writing-mode:vertical-rl;white-space:nowrap;';
      badge.textContent=subText;
      div.appendChild(badge);
    }
    return div;
  }

  const isSouth=gState.orient!=='north';
  // 南上：盤面上段=SE/S/SW、下段=NE/N/NW
  // 北上：盤面上段=NW/N/NE、下段=SW/S/SE
  const topRow=   isSouth?['SE','S','SW']:['NW','N','NE'];
  const bottomRow=isSouth?['NE','N','NW']:['SW','S','SE'];
  const leftDir=  isSouth?'E':'W';
  const rightDir= isSouth?'W':'E';

  const gridStyle='display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:4px;max-width:280px;margin-left:auto;margin-right:auto;';

  // 上段ラベル（盤面の上）
  const topDiv=document.createElement('div');
  topDiv.style.cssText=gridStyle+'margin-bottom:4px;';
  topRow.forEach(dir=>topDiv.appendChild(makeDirCell(dir)));
  wrap.insertBefore(topDiv, gridDiv);

  // 東西ラベルで盤面を挟む（盤面と同じ幅に収める）
  const midWrap=document.createElement('div');
  midWrap.style.cssText='display:flex;align-items:center;max-width:320px;margin:0 auto;';
  // gridDivをmidWrapに移す
  wrap.insertBefore(midWrap, gridDiv);
  const leftLabel=makeSideLabel(leftDir);
  leftLabel.style.cssText+='min-width:28px;max-width:28px;';
  const rightLabel=makeSideLabel(rightDir);
  rightLabel.style.cssText+='min-width:28px;max-width:28px;';
  midWrap.appendChild(leftLabel);
  gridDiv.style.flex='1';
  gridDiv.style.minWidth='0';
  midWrap.appendChild(gridDiv);
  midWrap.appendChild(rightLabel);

  // 下段ラベル（盤面の下）
  const bottomDiv=document.createElement('div');
  bottomDiv.style.cssText=gridStyle+'margin-top:4px;';
  bottomRow.forEach(dir=>bottomDiv.appendChild(makeDirCell(dir)));
  wrap.appendChild(bottomDiv);

  // 吉方リスト
  renderKichiList(dirData,p2s);

  // 凶方リスト
  renderKyoList(kyouItems,type);

  // AIプロンプト生成
  generateAIPrompt(dirData,p2s,type);
}

function renderKichiList(dirData,p2s){
  const list=document.getElementById('kichiList');
  // 吉方を rank降順でソート
  const kichis=ALL8
    .filter(d=>dirData[d].rank>=2&&!dirData[d].isKyo)
    .sort((a,b)=>dirData[b].rank-dirData[a].rank);

  if(kichis.length===0){
    list.innerHTML='<div style="font-size:.68rem;color:var(--mist);padding:10px 0;">今日は特に吉方がありません。無理に外出せず、内なる充電の日にしましょう。</div>';
    return;
  }

  list.innerHTML=kichis.map(dir=>{
    const dd=dirData[dir];
    const s=STARS[dd.starN];
    let cls='kichi-item';
    if(dd.rank>=5||dd.rank>=4)cls+=' saiko';
    else if(dd.rank>=3)cls+=' dai';
    const rankLabel=dd.rank>=5?'本命・月命・三合　最高の吉方':dd.rank>=4?'本命・月命　ともに吉方':dd.rank>=3?'吉方（三合の後押しあり）':'吉方（人に与える日）';
    return `<div class="${cls}">
      <div class="kichi-dir-badge">
        <div class="kichi-dir">${EN[dir]}</div>
        <div class="kichi-dir-jp">${JP[dir]}</div>
      </div>
      <div class="kichi-info">
        <div class="kichi-rank">${rankLabel}</div>
        <div class="kichi-star">${s.j}</div>
        <div class="kichi-badges">${dd.badges.map(b=>`<span class="kbadge">${b}</span>`).join('')}</div>
        <div class="kichi-tap">タップして飲食提案を見る 👆</div>
      </div>
    </div>`;
  }).join('');

  // onclick再設定（文字列HTMLのため）
  list.querySelectorAll('.kichi-item').forEach((el,i)=>{
    const dir=kichis[i];
    el.onclick=()=>{
      // 現在の盤データを再取得
      const {honmei,tsukimei,ty,tm,td,currentBan}=gState;
      const center=currentBan==='day'?gState.dayCenter:currentBan==='month'?gState.monthCenter:gState.yearCent;
      const z=getZodiac(ty);
      const sangoSet=new Set((SANGO_MAP[z.k]||{dirs:[]}).dirs);
      let breakDir='C';
      if(currentBan==='year')breakDir=OPP[z.d];
      else if(currentBan==='month'){const mb=getMonthBranch(ty,tm,td);breakDir=OPP[BRANCH_DIR[mb]];}
      else{const db=getDayBranch(ty,tm,td);breakDir=OPP[BRANCH_DIR[db]];}
      const p2s=buildBoardFromCenter(center);
      const {items:kyouItems,kyouSet}=getKyouDirs(center,honmei,breakDir,gState.tsukimei,currentBan);
      const allDirData={};
      const tendoDir2=(currentBan!=='year')?getTendoDir(ty,tm,td):null;
      ALL8.forEach(d=>{const starN=p2s[d];const r=rankDir(d,starN,honmei,tsukimei,sangoSet,tendoDir2);allDirData[d]={starN,rank:r.rank,badges:r.badges,isKyo:kyouSet.has(d)};});
      openDirPopup(dir,center,allDirData,kyouItems,kyouSet);
    };
  });
}

function renderKyoList(kyouItems,type){
  const body=document.getElementById('kyoBody');
  // 帰着日設定がOFFの場合、日盤の凶に「年盤・月盤が吉なら無視OK」の注釈を追加
  const showKichakuNote=(!gState.kichakuWarn)&&(type==='day');
  if(kyouItems.length===0){
    body.innerHTML='<div style="font-size:.62rem;color:var(--mist);padding-top:6px;">今日は特に注意すべき方向はありません。</div>';
    return;
  }
  const dirMap={};
  kyouItems.forEach(item=>{
    if(!dirMap[item.dir])dirMap[item.dir]=[];
    dirMap[item.dir].push(item.name);
  });
  body.innerHTML=Object.entries(dirMap).map(([dir,names])=>`
    <div class="kyo-row">
      <div class="kyo-dir">${JP[dir]}</div>
      <div class="kyo-name">${names.join('・')}</div>
    </div>
  `).join('')+(showKichakuNote?'<div style="font-size:.58rem;color:rgba(200,215,240,.4);margin-top:6px;line-height:1.7;">※ 年盤・月盤が吉なら日盤の凶は気にしすぎなくてOKです（KITOKU推奨）</div>':'');
  // 土用期間中の注意（設定ONかつ日盤の場合）
  if(gState.seasonAlert&&type==='day'&&gState.ty&&gState.tm&&gState.td){
    if(isDoyoPeriod(gState.ty,gState.tm,gState.td)){
      body.innerHTML+='<div style="margin-top:8px;padding:8px 10px;background:rgba(232,160,40,.08);border:1px solid rgba(232,160,40,.25);border-radius:6px;font-size:.62rem;color:rgba(232,160,40,.9);line-height:1.8;">🌿 土用期間中です。月建方向への<strong>旅行</strong>は注意。引越し（定住）は問題ありません。</div>';
    }
  }
}

function toggleKyo(){
  const body=document.getElementById('kyoBody');
  const arrow=document.getElementById('kyoArrow');
  body.classList.toggle('open');
  arrow.textContent=body.classList.contains('open')?'▴':'▾';
}

// ── 方位ポップアップ ──

