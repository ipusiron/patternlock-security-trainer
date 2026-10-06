// 画面に出す文言（通常のスクリプト。globalThis.PatternMessages に置く）。{name} は値で埋める
(function (root) {
  'use strict';

  const ja = {
    'ui.subtitle': 'Android式の3×3パターンロックを、攻撃の種類ごとに、文献と全パターンの数え上げで調べる',
    'ui.noscript': 'このツールはJavaScriptで動きます。JavaScriptを有効にしてください。',
    'ui.noticeHeading': '使う前に',
    'ui.notice1': '実際に使っているロックパターンは入力しないでください。',
    'ui.notice2': 'パターンはブラウザーの中だけで扱い、どこにも送りません。「保存」を押したときだけ、このブラウザーに保存します。',
    'ui.tabsLabel': '機能の切り替え',
    'ui.tabCheck': '調べる',
    'ui.tabExamples': 'パターン例',
    'ui.tabLearn': '座学',
    'ui.drawHeading': 'パターンを描く',
    'ui.drawHint': '点から指（マウス）を離さずになぞります。キーボードでは Tab で点を選び、Enter で順に足します。飛び越えた点は、Android と同じく自動で入ります。',
    'ui.undo': '1手戻す',
    'ui.clear': 'クリア',
    'ui.showNumbers': '点の番号を表示',
    'ui.patternInputLabel': '文字で入れる（点の番号0〜8。例 0-4-8-5）',
    'ui.shapeHeading': '形の特徴',
    'ui.helpShapeLabel': '形の特徴の数え方',
    'ui.kNodes': '点の数',
    'ui.kLength': '線の長さ（点の間隔を1）',
    'ui.kIntersections': '交差',
    'ui.kOverlaps': '重なり（引き直した線）',
    'ui.kKnight': '桂馬飛び',
    'ui.kStart': '始点',
    'ui.biasHeading': '人の選び方と比べる',
    'ui.biasNote': 'Løge（2015）が集めた3,393個のパターンで、各点から始めた人の割合と、長さの割合です。枠のある点・行が、いまのパターンです。',
    'ui.startMapLabel': '始点の割合の図',
    'ui.lengthBarsLabel': '長さの割合',
    'ui.attackHeading': '攻撃ごとに見る',
    'ui.helpAttacksLabel': '攻撃ごとの見方',
    'ui.attackNote': '1つの点数にはまとめません。攻撃によって効く性質が逆になるからです（複雑な形は覗き見には強くても、動画の攻撃にはかえって弱いことがある）。'
      + '数字は、全389,112通りの数え上げか、出典のある研究の値だけです。',
    'ui.savedHeading': '保存して比べる',
    'ui.savedNote': '名前と点の並びだけを、このブラウザーに保存します。値は表示のたびに計算し直します。',
    'ui.saveNameLabel': '名前（空なら自動で付ける。50字まで）',
    'ui.save': '保存',
    'ui.colName': '名前',
    'ui.colPattern': 'パターン',
    'ui.colNodes': '点',
    'ui.colLines': '線の汚れの候補',
    'ui.colSun': '複雑さ（PS）',
    'ui.colActions': '操作',
    'ui.savedEmpty': '保存したパターンはありません。',
    'ui.clearSaved': 'すべて削除',
    'ui.examplesHeading': 'パターン例',
    'ui.examplesNote': 'どれも Android で設定できる有効なパターンです。値はすべて画面の中で計算しています。「調べる」で、そのパターンを「調べる」タブに入れます。',
    'ui.learnHeading': '座学',
    'ui.close': '閉じる',
    'ui.helpShape1': '交差: 隣り合わない2本の線が交わるか、点で触れる回数です。重なり: 前に引いた線（点と点の間の1区間）をもう一度通る回数です。数え方は Golla ら（2019）の定義に合わせています。',
    'ui.helpShape2': '桂馬飛び: 横2・縦1、または横1・縦2だけ離れた点へ直接引く線です。間に点がないので、何も自動で入りません。',
    'ui.helpShape3': '始点は角（0・2・6・8）、辺（1・3・5・7）、中央（4）に分けます。',
    'ui.helpAttacks1': '当て推量と総当たりは、端末の画面で試す攻撃です。Android 7以降は、失敗が続くと待たされます'
      + '（5回目・10回目で30秒、11回目から毎回30秒、30回目から10回ごとに倍、140回目から毎回24時間）。',
    'ui.helpAttacks2': '覗き見・汚れ・熱・動画は、パターンそのものを盗み見る攻撃です。数字は、それぞれの研究の条件（人数・距離・時間）での値で、どの場面にも当てはまるわけではありません。',
    'ui.confirmTitle': '保存したパターンをすべて削除しますか？',
    'ui.confirmYes': 'すべて削除する',
    'ui.confirmNo': 'やめる',
    'ui.footerRepo': 'GitHubリポジトリー',
    'ui.themeToDark': 'ダークモードにする',
    'ui.themeToLight': 'ライトモードにする',

    'node.label': '点{n}（{pos}）',
    'pos.0': '左上', 'pos.1': '上', 'pos.2': '右上', 'pos.3': '左', 'pos.4': '中央', 'pos.5': '右', 'pos.6': '左下', 'pos.7': '下', 'pos.8': '右下',
    'start.corner': '角', 'start.edge': '辺', 'start.center': '中央',
    'start.value': '{n}（{cls}）',
    'sun.simple': '単純', 'sun.median': '中間', 'sun.complex': '複雑',
    'sun.value': '{ps}（{cls}）',
    'unit.lines': '{n}本',
    'unit.times': '{n}回',
    'length.row': '{n}点',
    'share.value': '{n}%',

    'seq.value': 'パターン: {seq}（{n}点）',
    'seq.none': 'パターン: なし',
    'err.char': '0〜8の数字と区切り（空白・ハイフン・カンマ）だけを使えます。',
    'err.repeat': '点{n}は2回目です（飛び越えて自動で入った点も数えます）。',
    'err.short': '4点以上が必要です（いま{n}点）。',

    'status.empty': 'パターンを描くか、文字で入れてください。',
    'status.short': '4点以上を描くと、攻撃ごとの値が出ます（Android は4点未満を設定できません）。',
    'status.computing': '全389,112通りを数えています…',

    'card.guess.title': '当て推量（端末で試す）',
    'card.guess.start': '始点の点{node}は、調査で{share}%の人が選んだ点です（9点中{rank}位）。',
    'card.guess.length': '{n}点のパターンは、調査で{share}%でした（長さ6種類のうち{rank}位）。',
    'card.guess.rate': 'Android 7以降の待ち時間では、1日に{day}回、1週間に{week}回しか試せません。',
    'card.guess.paper': '人の選び方の順に試すと、{guesses}回で3×3のパターンの{share}%が当たりました（Aviv ら 2015）。',
    'card.brute.title': '総当たり（全部を順に試す）',
    'card.brute.count': '{n}点のパターンは{count}通りです。短い順に全部試すと、最悪{worst}回目に当たります。',
    'card.brute.time': '端末の画面で{worst}回試すには、待ち時間だけで{time}かかります（Android 7以降）。',
    'card.brute.legacy': '古い Android（5.1以前）は、パターンを塩なしの SHA-1 にして gesture.key に保存していました。このファイルが抜かれると、'
      + '全{total}通りの表を引くだけで一瞬で戻ります。',
    'card.shoulder.title': '覗き見（肩越し）',
    'card.shoulder.length': '{n}点です。長いほど覗き見されにくくなります。',
    'card.shoulder.paper': '6点のパターンを1回見ただけで、線を表示する設定では{withLines}%、線を表示しない設定では{withoutLines}%が再現されました'
      + '（6桁の PIN は{pin}%。Aviv ら 2017）。交差や桂馬飛びの効き目は、はっきりしませんでした。',
    'card.shoulder.tip': 'Android の「パターンを表示する」をオフにすると、描いた線が画面に出なくなります。',
    'card.smudge.title': '汚れ（画面に残る指の跡）',
    'card.smudge.points': '使った点だけがわかると、候補は{points}通り残ります。',
    'card.smudge.lines': '引いた線（向きなし）までわかると、候補は{lines}通りです。',
    'card.smudge.paper': '画面の汚れを撮影すると、条件によって{partial}%で一部が、{full}%で全部がわかりました（Aviv ら 2010）。',
    'card.thermal.title': '熱（サーモカメラ）',
    'card.thermal.none': '重なりはありません。重なりのないパターンは、入力後{seconds}秒以内なら熱の跡から{rate}%当てられました（Abdelrahman ら 2017、18人）。',
    'card.thermal.some': '重なりが{o}本あります。重なりのあるパターンでは、{seconds}秒以内の当たりが{rate}%に下がりました（Abdelrahman ら 2017、18人）。',
    'card.video.title': '動画（離れた場所からの撮影）',
    'card.video.score': 'Sun らの複雑さは PS {ps}（{cls}）です。',
    'card.video.paper': '指先を追う動画の攻撃では、{attempts}回以内に{within}%超が当たりました。1回目に当たったのは「複雑」（PS 33超）で{complex}%、'
      + '「単純」（19未満）で{simple}%です（Ye ら 2017）。複雑な形ほど、この攻撃には弱いことがあります。',
    'ref.title': '参考: 視覚的な複雑さ（Sun ら 2014）',
    'ref.line': 'PS ＝ 点の数 × log₂（線の長さ＋交差＋重なり）＝ {ps}。PS がこれより小さいパターンは、全{total}通りの{pct}%です。',
    'ref.caveat': 'この種の強度メーターの値は、実際の推測されやすさとの相関が低いと報告されています（Golla ら 2019）。目安にとどめてください。',

    'dur.seconds': '{n}秒', 'dur.minutes': '{n}分', 'dur.hours': '{n}時間', 'dur.days': '{n}日', 'dur.years': '{n}年',

    'save.defaultName': 'パターン {n}',
    'save.saved': '「{name}」を保存しました。',
    'save.short': '4点以上のパターンを保存できます。',
    'save.failed': '保存できませんでした（ブラウザーの設定で保存が止められている可能性があります）。',
    'save.load': '調べる',
    'save.delete': '削除',
    'save.deleteLabel': '「{name}」を削除',
    'save.loadLabel': '「{name}」を調べる',
    'save.deleted': '「{name}」を削除しました。',
    'save.loaded': '「{name}」を読み込みました。',
    'save.cleared': 'すべて削除しました。',

    'ex.check': '調べる',
    'ex.checkLabel': '「{title}」を調べる',
    'ex.values': '{n}点・始点の割合{share}%・線の汚れの候補{lines}通り・重なり{o}本・PS {ps}（{cls}）',
    'ex.topLeft4.title': '左上から4点',
    'ex.topLeft4.lesson': 'いちばん選ばれやすい始点（{start}%）と長さ（{len}%）の組み合わせ。端末で当て推量する攻撃者が最初に試す形です。',
    'ex.letterL.title': 'L字',
    'ex.letterL.lesson': '左上から下へ、下の段を右へ。文字や記号の形は人が選びやすく、推測の候補に入りやすい形です。',
    'ex.letterZ.title': 'Z字',
    'ex.letterZ.lesson': '{n}点あっても、上の段・斜め・下の段と、たどり方が素直です。点が多いことと、推測されにくいことは別です。',
    'ex.snake9.title': '9点の蛇行',
    'ex.snake9.lesson': '全部の点を使うので、覗き見には強い長さです。点の汚れだけなら候補は{points}通りでも、線の汚れが見えると{lines}通りまで絞られます。',
    'ex.overlap.title': '引き直しのある形',
    'ex.overlap.lesson': '0から2へ引くとき、使った1の上を通り、1-0 の線をもう一度なぞります。重なりは熱の跡を乱すので、熱の攻撃に強くなります。',
    'ex.knight.title': '桂馬飛びの4点',
    'ex.knight.lesson': '4点でも交差と桂馬飛びがあります。ただし4点なので、短い順に試す総当たりでは最初の{count}通りの中に入ります。',
    'ex.center.title': '中央から始める',
    'ex.center.lesson': '中央から始めた人は{share}%だけでした。始点の偏りを外すと、当て推量の最初の候補から外れやすくなります。',
    'ex.complex.title': 'もっとも複雑な形の1つ',
    'ex.complex.lesson': 'Sun らの PS が最大（{max}）の形です。複雑な形は覗き見には強くても、動画の攻撃ではかえって当てられやすいことがあります。',
  };

  const MESSAGES = { ja };
  let language = 'ja';

  function t(key, vars = {}) {
    const dict = MESSAGES[language] || ja;
    const s = key in dict ? dict[key] : key in ja ? ja[key] : key;
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }

  const setLanguage = (lang) => {
    if (MESSAGES[lang]) language = lang;
  };
  const getLanguage = () => language;

  root.PatternMessages = { MESSAGES, t, setLanguage, getLanguage };
})(typeof globalThis !== 'undefined' ? globalThis : this);
