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
    'ui.drawHint': '点から指（マウス）を離さずになぞります。キーボードではTabで点を選び、Enterで順に足します。飛び越えた点は、Androidと同じく自動で入ります。',
    'ui.undo': '1手戻す',
    'ui.clear': 'クリア',
    'ui.showNumbers': '点の番号を表示',
    'ui.patternInputLabel': '文字で入れる（点の番号0〜8。例0-4-8-5）',
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
    'ui.attackNote': '1つの点数にはまとめません。攻撃によって、強くなる形の性質が逆になるからです（複雑な形は覗き見には強くても、動画の攻撃にはかえって弱いことがある）。'
      + '数字は、全389,112通りの数え上げか、出典のある研究の値だけです。',
    'ui.savedHeading': '保存する',
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
    'ui.examplesNote': 'どれもAndroidで設定できる有効なパターンです。値はすべて画面の中で計算しています。「調べる」で、そのパターンを「調べる」タブに入れます。',
    'ui.learnHeading': '座学',
    'ui.close': '閉じる',
    'ui.helpShape1': '交差: 隣り合わない2本の線が交わるか、点で触れる回数です。重なり: 前に引いた線（点と点の間の1区間）をもう一度通る回数です。数え方はGollaら（2019）の定義に合わせています。',
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
    'ui.langButton': 'EN',
    'ui.switchLang': '英語に切り替える',

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
    'status.short': '4点以上を描くと、攻撃ごとの値が出ます（Androidは4点未満を設定できません）。',
    'status.computing': '全389,112通りを数えています…',

    'card.guess.title': '当て推量（端末で試す）',
    'card.guess.start': '始点の点{node}は、調査で{share}%の人が選んだ点です（9点中{rank}位）。',
    'card.guess.length': '{n}点のパターンは、調査で{share}%でした（長さ6種類のうち{rank}位）。',
    'card.guess.rate': 'Android 7以降の待ち時間では、1日に{day}回、1週間に{week}回しか試せません。',
    'card.guess.paper': '人の選び方の順に試すと、{guesses}回で3×3のパターンの{share}%が当たりました（Avivら、2015）。',
    'card.brute.title': '総当たり（全部を順に試す）',
    'card.brute.count': '{n}点のパターンは{count}通りです。短い順に全部試すと、最悪{worst}回目に当たります。',
    'card.brute.time': '端末の画面で{worst}回試すには、待ち時間だけで{time}かかります（Android 7以降）。',
    'card.brute.legacy': '古いAndroid（5.1以前）は、パターンを塩なしのSHA-1にしてgesture.keyに保存していました。このファイルが抜かれると、'
      + '全{total}通りの表を引くだけで一瞬で戻ります。',
    'card.shoulder.title': '覗き見（肩越し）',
    'card.shoulder.length': '{n}点です。長いほど覗き見されにくくなります。',
    'card.shoulder.paper': '6点のパターンを1回見ただけで、線を表示する設定では{withLines}%、線を表示しない設定では{withoutLines}%が再現されました'
      + '（6桁のPINは{pin}%。Avivら、2017）。交差や桂馬飛びの影響は、はっきりしませんでした。',
    'card.shoulder.tip': 'Androidの「パターンを表示する」をオフにすると、描いた線が画面に出なくなります。',
    'card.smudge.title': '汚れ（画面に残る指の跡）',
    'card.smudge.points': '使った点だけがわかると、候補は{points}通り残ります。',
    'card.smudge.lines': '引いた線（向きなし）までわかると、候補は{lines}通りです。',
    'card.smudge.paper': '画面の汚れを撮影すると、条件によって{partial}%で一部が、{full}%で全部がわかりました（Avivら、2010）。',
    'card.thermal.title': '熱（サーモカメラ）',
    'card.thermal.none': '重なりはありません。重なりのないパターンは、入力後{seconds}秒以内なら熱の跡から{rate}%当てられました（Abdelrahmanら、2017、18人）。',
    'card.thermal.some': '重なりが{o}本あります。重なりのあるパターンでは、{seconds}秒以内の当たりが{rate}%に下がりました（Abdelrahmanら、2017、18人）。',
    'card.video.title': '動画（離れた場所からの撮影）',
    'card.video.score': 'Sunらの複雑さはPS {ps}（{cls}）です。',
    'card.video.paper': '指先を追う動画の攻撃では、{attempts}回以内に{within}%超が当たりました。1回目に当たったのは「複雑」（PS 33超）で{complex}%、'
      + '「単純」（19未満）で{simple}%です（Yeら、2017）。複雑な形ほど、この攻撃には弱いことがあります。',
    'ref.title': '参考: 視覚的な複雑さ（Sunら、2014）',
    'ref.line': 'PS＝点の数×log₂（線の長さ＋交差＋重なり）＝{ps}。PSがこれより小さいパターンは、全{total}通りの{pct}%です。',
    'ref.caveat': 'この種の強度メーターの値は、実際の推測されやすさとの相関が低いと報告されています（Gollaら、2019）。目安にとどめてください。',

    'dur.seconds': '{n}秒', 'dur.minutes': '{n}分', 'dur.hours': '{n}時間', 'dur.days': '{n}日', 'dur.years': '{n}年',

    'save.defaultName': 'パターン{n}',
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
    'ex.overlap.lesson': '0から2へ引くとき、使った1の上を通り、1-0の線をもう一度なぞります。重なりは熱の跡を乱すので、熱の攻撃に強くなります。',
    'ex.knight.title': '桂馬飛びの4点',
    'ex.knight.lesson': '4点でも交差と桂馬飛びがあります。ただし4点なので、短い順に試す総当たりでは最初の{count}通りの中に入ります。',
    'ex.center.title': '中央から始める',
    'ex.center.lesson': '中央から始めた人は{share}%だけでした。始点の偏りを外すと、当て推量の最初の候補から外れやすくなります。',
    'ex.complex.title': '最も複雑な形の1つ',
    'ex.complex.lesson': 'SunらのPSが最大（{max}）の形です。複雑な形は覗き見には強くても、動画の攻撃ではかえって当てられやすいことがあります。',

    'ui.compareHeading': '2つを比べる',
    'ui.helpCompareLabel': '比べ方',
    'ui.compareNote': 'いまのパターン（A）と、もう1つのパターン（B）を並べます。Bを書き換えて、点を足したときや始点を変えたときに、攻撃ごとの値がどう変わるかを見ます。',
    'ui.compareALabel': 'A（いまのパターン）',
    'ui.compareBLabel': 'B（文字で入れる）',
    'ui.copyA': 'AをBに写す',
    'ui.compareSavedLabel': '保存したパターンをBに',
    'ui.colItem': '項目',
    'ui.colWinner': 'この点で有利',
    'ui.helpCompare1': '「この点で有利」は、その攻撃に対してどちらが手間をかけさせるかです。人が選んだ割合は小さいほう、候補の数・回数・待ち時間・点の数・重なりは大きいほうを有利とします。',
    'ui.helpCompare2': '複雑さ（PS）には有利を付けません。複雑な形は覗き見には強くても、動画の攻撃ではかえって当たりやすかったからです（Yeら、2017）。',
    'ui.checklistHeading': '端末の設定を見直す',
    'ui.checklistNote': '実際の端末の設定画面で確かめる項目です。このツールには本物のパターンを入れないでください。チェックは保存しません（ページを閉じると消えます）。',
    'ui.relatedHeading': '関連ツール',
    'ui.relatedDay001': '人が考えたパスワードの強さを、辞書や規則も含めて確かめる',
    'ui.relatedDay048': 'トークンや鍵のランダムな部分のビット数と、総当たりにかかる時間を見積もる',
    'ui.relatedDay060': 'アカウントごとの回数制限を、1つのパスワードを多くの人に試す攻撃がすり抜ける様子を見る',
    'ui.relatedDay063': 'キーを押している時間と押す間隔を測り、打ち方の癖で人を見分ける仕組みを試す',
    'ui.relatedDay073': '情報量（ビット）の考え方を基礎から学ぶ',
    'ui.relatedDay088': '暗証番号（PIN）への指紋の跡・熱・音・盗撮による攻撃と、守り方を試す',
    'ui.relatedDay089': 'キーボードの並びに頼ったパスワードを見つける',
    'ui.relatedNote': 'リンクはページを開くだけで、描いたパターンは渡しません。',

    'compare.nodes': '点の数（覗き見・総当たり）',
    'compare.startShare': '始点を選んだ人の割合（当て推量）',
    'compare.lengthShare': '同じ長さを選んだ人の割合（当て推量）',
    'compare.worst': '短い順に試したときの最悪の回数（総当たり）',
    'compare.waitSeconds': 'その回数を端末で試す待ち時間（総当たり）',
    'compare.points': '使った点からの候補（汚れ）',
    'compare.lines': '引いた線からの候補（汚れ）',
    'compare.overlaps': '重なり（熱）',
    'compare.ps': '複雑さPS（動画・参考）',
    'compare.winner.a': 'A',
    'compare.winner.b': 'B',
    'compare.winner.same': '同じ',
    'compare.winner.none': '—（攻撃によって逆）',
    'compare.savedNone': '—',
    'compare.needA': 'Aに4点以上のパターンを入れると比べられます。',
    'compare.needB': 'Bに4点以上のパターンを入れると比べられます。',
    'compare.summary': '有利な行の数は、Aが{a}、Bが{b}、同じが{same}です（複雑さPSは数えない）。',

    'check.lines': '「パターンを表示する」をオフにした（覗き見での再現が{withLines}%から{withoutLines}%に下がった。Avivら、2017）',
    'check.length': 'パターンを長めにした（覗き見では長さの影響が最も大きかった。Avivら、2017。4点のパターンは{count4}通りしかない）',
    'check.start': '左上・角から始めていない（左上から始めた人は{topLeft}%、角からは{corners}%。Løge 2015）',
    'check.pin': '覗き見が心配な場面では、6桁以上のPINも考えた（1回の覗き見での再現は{pin}%。Avivら、2017）',
    'check.wipe': '人に渡す前に画面を拭く（汚れからは条件によって{full}%で全部がわかった。Avivら、2010。熱の跡も入力後{seconds}秒ほど残る。Abdelrahmanら、2017）',
    'check.os': 'Android 6.0以降を使っている（5.1以前は、パターンを塩なしのSHA-1で保存していた）',
    'check.real': 'このツールに、実際に使っているパターンを入れていない',
    'check.status': '{done}/{total}項目を確かめました。',

    'learn.basics.title': 'パターンロックの仕組み',
    'learn.basics.p1': '3×3の9個の点を、指を離さずに一筆でなぞります。Androidでは4点以上が必要で、同じ点は2回使えません。',
    'learn.basics.p2': 'まだ使っていない点を飛び越えると、その点が自動で入ります（0→2は0→1→2になる）。使った点の上は通れます。'
      + '桂馬飛び（横2・縦1など）は、間に点がないので直接つながります。',
    'learn.basics.p3': 'この規則で作れるパターンは全部で{total}通りです。短い順に全部試す攻撃者は、長さLのパターンに「L点以下の合計」回目までに必ず当たります。',
    'learn.colLength': '長さ',
    'learn.colCount': 'パターンの数',
    'learn.colWorst': '短い順に試したときの最悪の回数',
    'learn.device.title': '端末はどう守っているか',
    'learn.device.p1': 'Android 7以降は、失敗が続くと次を試せるまで待たされます（AOSPのGatekeeper）。待ち時間は次のとおりで、'
      + '1日に{day}回、1週間に{week}回、30日で{month}回しか試せません。実機ではメーカーの安全な領域（TEE）の中で動き、値はメーカーが変えられます。',
    'learn.colFailures': '失敗の回数',
    'learn.colWait': '次を試すまでの待ち',
    'learn.noWait': '待ちなし',
    'learn.range': '{from}〜{to}回目',
    'learn.single': '{n}回目',
    'learn.andAfter': '{n}回目以降',
    'learn.device.p2': 'いまのAndroidは、パターンをscryptで引き伸ばし、端末の安全な領域にある秘密と結びつけて、データを暗号化する鍵を守ります。'
      + '公式の説明は、scryptだけではあまり安全にならず、守りの本体はハードウェアによる回数の制限だとしています。',
    'learn.device.p3': '古いAndroid（4.4〜5.1）は、パターンの各点を0〜8の1バイトにして塩なしのSHA-1を取り、/data/system/gesture.keyに保存していました。'
      + '全{total}通りのSHA-1の表を作っておけば、ファイルが抜かれた時点で一瞬で戻ります。鑑識の道具もこの方法を使います。Android 6.0からはGatekeeperに移りました。',
    'learn.people.title': '人はどう選ぶか',
    'learn.people.loge': 'Løge（2015）の調査（{respondents}人・{patterns}個）では、左上から始めたのが{topLeft}%、角から始めたのが{corners}%、中央からは{center}%でした。'
      + 'よく使われた上位100個のパターンで、全体の{top100}%を占めました。',
    'learn.people.uellenbeck': 'Uellenbeckら（2013）が集めた実際のパターンでは、左上から始めたのが{topLeft}%、角からが{corners}%、中央からは{center}%でした。'
      + '人の選び方の順に推測すると、守りを意識して作ったパターンの約{g10}%が10回で、約{g30}%が30回で当たりました。',
    'learn.grid.title': '点を4×4に増やすと',
    'learn.grid.p1': 'Androidの標準の画面は3×3です。同じ規則（4点以上、同じ点は2回使えない、まだ使っていない点を飛び越えるとその点が入る）を4×4の16点に広げて数えると、'
      + '全部で{total4}通りになり、Avivら（2015）が報告した数と一致します。3×3の{total3}通り（約2の{bits3}乗）が、約2の{bits4}乗に増えます。',
    'learn.grid.p2': '長さ別の数は次のとおりです（3×3は9点まで）。',
    'learn.colGrid3': '3×3',
    'learn.colGrid4': '4×4',
    'learn.gridTotal': '合計',
    'learn.gridNone': '—',
    'learn.grid.p3': 'ただし、人が選ぶパターンは、盤の大きさほどには推測しにくくなりませんでした。Avivら（2015）の実験では、{guesses}回の推測で3×3の{share3}%、'
      + '4×4の{share4}%が当たりました。差が出たのは推測を重ねたあとで、{many}回では3×3の{many3}%、4×4の{many4}%でした。',
    'learn.grid.p4': '紙に描いてもらった実験では、長さの平均は3×3で{mean3}点、4×4で{mean4}点でした。4×4でも左上から始めたパターンが最も多く、{topLeft4}%でした（Avivら、2015）。',
    'learn.attacks.title': '盗み見る攻撃',
    'learn.attacks.smudge': '汚れ: 画面に残る指の跡を撮影すると、条件によって{partial}%で一部が、{full}%で全部がわかりました（Avivら、2010）。'
      + 'このツールの数え上げでは、引いた線（向きなし）が全部見えると、{unique}%のパターンが1通りに決まります。',
    'learn.attacks.shoulder': '覗き見: 6点のパターンを1回見ただけで、線を表示する設定では{withLines}%、線を表示しない設定では{withoutLines}%が再現されました。'
      + '6桁のPINは{pin}%でした（Avivら、2017）。',
    'learn.attacks.video': '動画: 指先の動きを追う攻撃では、5回以内に{within}%超が当たりました。複雑な形ほど1回目に当たりやすく、「複雑」は{complex}%、'
      + '「単純」は{simple}%でした（Yeら、2017）。',
    'learn.attacks.thermal': '熱: 入力後{seconds}秒以内なら、重なりのないパターンは{noOverlap}%当たりました。重なりがあると{withOverlap}%に下がりました。'
      + 'PINは重複する数字があっても{pin}%超でした（Abdelrahmanら、2017、18人）。',
    'learn.users.title': '選ぶときに（使う人向け）',
    'learn.users.l1': '点を増やす。覗き見では長さの影響が最も大きく、総当たりの候補も増えます。',
    'learn.users.l2': '左上・角から始めない。始点の偏りは、当て推量の最初の候補になります。',
    'learn.users.l3': 'Androidの「パターンを表示する」をオフにする。覗き見での再現が{withLines}%から{withoutLines}%に下がりました。',
    'learn.users.l4': '覗き見が心配な場面では、6桁以上のPINも選択肢です（1回の覗き見での再現は{pin}%）。',
    'learn.users.l5': '形を複雑にすれば安全とは限りません。動画の攻撃では、複雑な形のほうが当たりやすいことがありました。',
    'learn.users.l6': '入力したあとの画面には汚れや熱の跡が残るので、人に渡す前に拭くと手がかりが減ります。',
    'learn.users.l7': 'このツールには、実際に使っているパターンを入れないでください。',
    'learn.devs.title': '作るときに（開発する人向け）',
    'learn.devs.l1': '最小の長さを決める（Androidは4点）。短いパターンほど、総当たりの最初の候補に入ります。',
    'learn.devs.l2': '失敗が続いたら待たせる。AndroidのGatekeeperは、140回目からは1回ごとに24時間待たせます。',
    'learn.devs.l3': 'パターンは塩つきの遅いハッシュ（scryptなど）にし、回数の制限はハードウェアで守る。塩なしのSHA-1は、全{total}通りの表で戻ります。',
    'learn.devs.l4': '強度メーターを付けるなら、限界も伝える。見た目の複雑さの指標は推測されやすさとの相関が低い一方（Gollaら、2019）、'
      + 'Songら（2015）のメーターでは、パターンの約{share}%が当たるまでの推測の回数が{without}回から{with}回に増えました。',
    'learn.devs.l5': '線を表示しない設定を用意する（覗き見の対策）。',
    'learn.sources.title': '出典',
  };

  const en = {
    'ui.subtitle': 'Examine Android-style 3×3 unlock patterns attack by attack, using published research and an exact count of every pattern',
    'ui.noscript': 'This tool runs on JavaScript. Please enable JavaScript.',
    'ui.noticeHeading': 'Before you start',
    'ui.notice1': 'Do not enter an unlock pattern you actually use.',
    'ui.notice2': 'Patterns are handled only inside your browser and are never sent anywhere. They are stored in this browser only when you press “Save”.',
    'ui.tabsLabel': 'Switch features',
    'ui.tabCheck': 'Check',
    'ui.tabExamples': 'Examples',
    'ui.tabLearn': 'Learn',
    'ui.drawHeading': 'Draw a pattern',
    'ui.drawHint': 'Trace the dots without lifting your finger (or mouse). With a keyboard, choose a dot with Tab and add it with Enter. '
      + 'A dot you jump over is added automatically, as on Android.',
    'ui.undo': 'Undo one step',
    'ui.clear': 'Clear',
    'ui.showNumbers': 'Show dot numbers',
    'ui.patternInputLabel': 'Type a pattern (dot numbers 0–8, e.g. 0-4-8-5)',
    'ui.shapeHeading': 'Shape',
    'ui.helpShapeLabel': 'How the shape is counted',
    'ui.kNodes': 'Dots',
    'ui.kLength': 'Line length (dot spacing = 1)',
    'ui.kIntersections': 'Intersections',
    'ui.kOverlaps': 'Overlaps (retraced lines)',
    'ui.kKnight': 'Knight moves',
    'ui.kStart': 'Start dot',
    'ui.biasHeading': 'Compared with how people choose',
    'ui.biasNote': 'Share of people who started at each dot, and share of each length, in the 3,393 patterns collected by Løge (2015). '
      + 'The framed dot and row are your pattern.',
    'ui.startMapLabel': 'Share of start dots',
    'ui.lengthBarsLabel': 'Share of lengths',
    'ui.attackHeading': 'Attack by attack',
    'ui.helpAttacksLabel': 'How to read the attacks',
    'ui.attackNote': 'There is no single score, because different attacks reward opposite properties (a complex shape may resist shoulder surfing '
      + 'but be easier for a video attack). Every number comes from counting all 389,112 patterns or from published research.',
    'ui.savedHeading': 'Save',
    'ui.savedNote': 'Only the name and the dot sequence are saved in this browser. The values are recomputed every time.',
    'ui.saveNameLabel': 'Name (added automatically if empty, up to 50 characters)',
    'ui.save': 'Save',
    'ui.colName': 'Name',
    'ui.colPattern': 'Pattern',
    'ui.colNodes': 'Dots',
    'ui.colLines': 'Candidates from line smudges',
    'ui.colSun': 'Complexity (PS)',
    'ui.colActions': 'Actions',
    'ui.savedEmpty': 'No saved patterns.',
    'ui.clearSaved': 'Delete all',
    'ui.examplesHeading': 'Example patterns',
    'ui.examplesNote': 'Every example is a valid pattern you can set on Android. All values are computed on this page. '
      + '“Check” puts the pattern into the Check tab.',
    'ui.learnHeading': 'Learn',
    'ui.close': 'Close',
    'ui.helpShape1': 'Intersections: how many times two non-adjacent lines cross or touch at a dot. Overlaps: how many times a line between '
      + 'two neighboring dots is drawn again. These follow the definitions of Golla et al. (2019).',
    'ui.helpShape2': 'Knight move: a line straight to a dot two across and one down (or one across and two down). No dot lies in between, '
      + 'so nothing is added automatically.',
    'ui.helpShape3': 'The start dot is a corner (0, 2, 6, 8), an edge (1, 3, 5, 7) or the center (4).',
    'ui.helpAttacks1': 'Guessing and brute force are attacks tried on the device screen. Since Android 7, repeated failures make you wait '
      + '(30 seconds after the 5th and 10th failure, 30 seconds after each failure from the 11th, doubling every 10 failures from the 30th, '
      + 'and 24 hours after each failure from the 140th).',
    'ui.helpAttacks2': 'Shoulder surfing, smudge, thermal and video are attacks that observe the pattern itself. The numbers come from each '
      + 'study’s conditions (participants, distance, time) and do not apply to every situation.',
    'ui.confirmTitle': 'Delete all saved patterns?',
    'ui.confirmYes': 'Delete all',
    'ui.confirmNo': 'Cancel',
    'ui.footerRepo': 'GitHub repository',
    'ui.themeToDark': 'Switch to dark mode',
    'ui.themeToLight': 'Switch to light mode',
    'ui.langButton': '日本語',
    'ui.switchLang': 'Switch to Japanese',

    'node.label': 'Dot {n} ({pos})',
    'pos.0': 'top left', 'pos.1': 'top', 'pos.2': 'top right', 'pos.3': 'left', 'pos.4': 'center', 'pos.5': 'right', 'pos.6': 'bottom left',
    'pos.7': 'bottom', 'pos.8': 'bottom right',
    'start.corner': 'corner', 'start.edge': 'edge', 'start.center': 'center',
    'start.value': '{n} ({cls})',
    'sun.simple': 'simple', 'sun.median': 'medium', 'sun.complex': 'complex',
    'sun.value': '{ps} ({cls})',
    'unit.lines': '{n}',
    'unit.times': '{n}',
    'length.row': '{n} dots',
    'share.value': '{n}%',

    'seq.value': 'Pattern: {seq} (dots: {n})',
    'seq.none': 'Pattern: none',
    'err.char': 'Use only the digits 0–8 and separators (space, hyphen, comma).',
    'err.repeat': 'Dot {n} is used twice (dots added automatically by a jump count too).',
    'err.short': 'At least 4 dots are needed (now: {n}).',

    'status.empty': 'Draw a pattern or type one.',
    'status.short': 'Draw 4 or more dots to see the values for each attack (Android does not accept fewer than 4).',
    'status.computing': 'Counting all 389,112 patterns…',

    'card.guess.title': 'Guessing (on the device)',
    'card.guess.start': 'Start dot {node} was chosen by {share}% of people in the study (rank {rank} of 9).',
    'card.guess.length': 'Patterns of this length ({n} dots) made up {share}% in the study (rank {rank} of 6 lengths).',
    'card.guess.rate': 'With the waits of Android 7 and later, an attacker can try only {day} patterns a day and {week} a week.',
    'card.guess.paper': 'Guessing in the order people tend to choose found {share}% of 3×3 patterns within {guesses} guesses (Aviv et al., 2015).',
    'card.brute.title': 'Brute force (trying everything in order)',
    'card.brute.count': 'There are {count} patterns with {n} dots. Trying the shortest first, this one is found by guess {worst} at the latest.',
    'card.brute.time': 'Trying {worst} patterns on the device takes {time} of waiting alone (Android 7 and later).',
    'card.brute.legacy': 'Old Android (5.1 and earlier) stored the pattern as an unsalted SHA-1 in gesture.key. If that file is taken, '
      + 'looking it up in a table of all {total} patterns recovers it at once.',
    'card.shoulder.title': 'Shoulder surfing',
    'card.shoulder.length': 'Dots: {n}. Longer patterns are harder to observe.',
    'card.shoulder.paper': 'After a single observation, {withLines}% of 6-dot patterns were reproduced with lines shown and {withoutLines}% '
      + 'with lines hidden ({pin}% for 6-digit PINs; Aviv et al., 2017). The effect of intersections and knight moves was unclear.',
    'card.shoulder.tip': 'Turning off “Make pattern visible” on Android hides the drawn lines.',
    'card.smudge.title': 'Smudge (finger traces on the screen)',
    'card.smudge.points': 'Candidates left if only the dots used are known: {points}.',
    'card.smudge.lines': 'Candidates left if the drawn lines (without direction) are also known: {lines}.',
    'card.smudge.paper': 'Photographing screen smudges revealed part of the pattern in {partial}% and all of it in {full}% of the conditions '
      + '(Aviv et al., 2010).',
    'card.thermal.title': 'Thermal (heat camera)',
    'card.thermal.none': 'No overlaps. Within {seconds} seconds of entry, patterns without overlaps were recovered from heat traces {rate}% '
      + 'of the time (Abdelrahman et al., 2017, 18 participants).',
    'card.thermal.some': 'Overlaps: {o}. With overlaps, recovery within {seconds} seconds fell to {rate}% (Abdelrahman et al., 2017, 18 participants).',
    'card.video.title': 'Video (filmed from a distance)',
    'card.video.score': 'Sun et al.’s complexity is PS {ps} ({cls}).',
    'card.video.paper': 'A video attack tracking the fingertip cracked over {within}% within {attempts} attempts. On the first attempt it cracked '
      + '{complex}% of “complex” patterns (PS over 33) and {simple}% of “simple” ones (under 19) (Ye et al., 2017). '
      + 'More complex shapes can be weaker against this attack.',
    'ref.title': 'Reference: visual complexity (Sun et al., 2014)',
    'ref.line': 'PS = dots × log₂(line length + intersections + overlaps) = {ps}. {pct}% of all {total} patterns have a smaller PS.',
    'ref.caveat': 'Meters of this kind are reported to correlate poorly with how easily patterns are actually guessed (Golla et al., 2019). '
      + 'Treat it as a rough guide.',

    'dur.seconds': '{n} s', 'dur.minutes': '{n} min', 'dur.hours': '{n} h', 'dur.days': '{n} days', 'dur.years': '{n} yr',

    'save.defaultName': 'Pattern {n}',
    'save.saved': 'Saved “{name}”.',
    'save.short': 'Only patterns with 4 or more dots can be saved.',
    'save.failed': 'Could not save (the browser may be blocking storage).',
    'save.load': 'Check',
    'save.delete': 'Delete',
    'save.deleteLabel': 'Delete “{name}”',
    'save.loadLabel': 'Check “{name}”',
    'save.deleted': 'Deleted “{name}”.',
    'save.loaded': 'Loaded “{name}”.',
    'save.cleared': 'Deleted all.',

    'ex.check': 'Check',
    'ex.checkLabel': 'Check “{title}”',
    'ex.values': 'Dots: {n} · start share {share}% · candidates from line smudges: {lines} · overlaps: {o} · PS {ps} ({cls})',
    'ex.topLeft4.title': 'Four dots from the top left',
    'ex.topLeft4.lesson': 'The most chosen start ({start}%) with the most chosen length ({len}%). This is what an attacker guessing on the device tries first.',
    'ex.letterL.title': 'L shape',
    'ex.letterL.lesson': 'Down from the top left, then along the bottom row. Letters and symbols are shapes people like, so they are early guesses.',
    'ex.letterZ.title': 'Z shape',
    'ex.letterZ.lesson': 'Even with {n} dots, the path is plain: top row, diagonal, bottom row. More dots does not mean harder to guess.',
    'ex.snake9.title': 'Nine-dot snake',
    'ex.snake9.lesson': 'Using every dot makes it long, which helps against shoulder surfing. Dot smudges alone leave {points} candidates, '
      + 'but visible line smudges narrow it to {lines}.',
    'ex.overlap.title': 'Retraced line',
    'ex.overlap.lesson': 'Going from 0 to 2 passes over the used dot 1 and draws the 1-0 line again. '
      + 'Overlaps blur heat traces, so this resists thermal attacks.',
    'ex.knight.title': 'Four dots with knight moves',
    'ex.knight.lesson': 'Even with four dots it has an intersection and knight moves. But with four dots it is among the first {count} patterns '
      + 'a shortest-first brute force tries.',
    'ex.center.title': 'Starting from the center',
    'ex.center.lesson': 'Only {share}% of people started from the center. Avoiding the common starts keeps the pattern out of the first guesses.',
    'ex.complex.title': 'One of the most complex shapes',
    'ex.complex.lesson': 'It has the highest PS of Sun et al. ({max}). Complex shapes may resist shoulder surfing yet be easier for a video attack.',

    'ui.compareHeading': 'Compare two',
    'ui.helpCompareLabel': 'How to compare',
    'ui.compareNote': 'Put your current pattern (A) next to another pattern (B). Edit B to see how the values for each attack change '
      + 'when you add a dot or change the start.',
    'ui.compareALabel': 'A (current pattern)',
    'ui.compareBLabel': 'B (type a pattern)',
    'ui.copyA': 'Copy A to B',
    'ui.compareSavedLabel': 'Use a saved pattern as B',
    'ui.colItem': 'Item',
    'ui.colWinner': 'Better here',
    'ui.helpCompare1': '“Better here” is the pattern that costs the attacker more for that attack. A smaller share of people is better; '
      + 'more candidates, guesses, waiting time, dots and overlaps are better.',
    'ui.helpCompare2': 'Complexity (PS) gets no mark, because complex shapes may resist shoulder surfing '
      + 'but were easier for the video attack (Ye et al., 2017).',
    'ui.checklistHeading': 'Review your device settings',
    'ui.checklistNote': 'Check these in your actual device settings. Do not enter your real pattern into this tool. '
      + 'The checks are not saved (they disappear when you close the page).',
    'ui.relatedHeading': 'Related tools',
    'ui.relatedDay001': 'Check the strength of passwords people make up, including dictionaries and rules',
    'ui.relatedDay048': 'Estimate the random bits of tokens and keys and the time a brute-force attack needs',
    'ui.relatedDay060': 'Watch an attack that tries one password on many accounts slip past per-account lockout',
    'ui.relatedDay063': 'Measure how long keys are held and the gaps between presses, and try telling people apart by how they type',
    'ui.relatedDay073': 'Learn the idea of information quantity (bits) from the basics',
    'ui.relatedDay088': 'Try attacks on PINs from fingerprint residue, heat, sound and video, and the defenses against them',
    'ui.relatedDay089': 'Find passwords that rely on keyboard runs',
    'ui.relatedNote': 'The links only open the pages; the pattern you drew is not passed on.',

    'compare.nodes': 'Dots (shoulder surfing, brute force)',
    'compare.startShare': 'Share choosing this start (guessing)',
    'compare.lengthShare': 'Share choosing this length (guessing)',
    'compare.worst': 'Worst case trying shortest first (brute force)',
    'compare.waitSeconds': 'Waiting time to try that many on the device (brute force)',
    'compare.points': 'Candidates from the dots used (smudge)',
    'compare.lines': 'Candidates from the drawn lines (smudge)',
    'compare.overlaps': 'Overlaps (thermal)',
    'compare.ps': 'Complexity PS (video, reference)',
    'compare.winner.a': 'A',
    'compare.winner.b': 'B',
    'compare.winner.same': 'Same',
    'compare.winner.none': '— (opposite for different attacks)',
    'compare.savedNone': '—',
    'compare.needA': 'Enter a pattern of 4 or more dots as A to compare.',
    'compare.needB': 'Enter a pattern of 4 or more dots as B to compare.',
    'compare.summary': 'Rows where A is better: {a}; B: {b}; same: {same} (PS not counted).',

    'check.lines': 'Turned off “Make pattern visible” (shoulder surfing dropped from {withLines}% to {withoutLines}%; Aviv et al., 2017)',
    'check.length': 'Made the pattern longer (length had the largest effect on shoulder surfing; Aviv et al., 2017. There are only {count4} four-dot patterns)',
    'check.start': 'Not starting at the top left or a corner ({topLeft}% of people started at the top left and {corners}% at a corner; Løge 2015)',
    'check.pin': 'Considered a PIN of 6 or more digits where shoulder surfing is a concern (reproduced {pin}% of the time after one observation; '
      + 'Aviv et al., 2017)',
    'check.wipe': 'Wipe the screen before handing the device to someone (smudges revealed the whole pattern in {full}% of conditions, Aviv et al., 2010; '
      + 'heat traces remain for about {seconds} seconds, Abdelrahman et al., 2017)',
    'check.os': 'Using Android 6.0 or later (5.1 and earlier stored the pattern as an unsalted SHA-1)',
    'check.real': 'Not entering a pattern you actually use into this tool',
    'check.status': 'Checked: {done} of {total}.',

    'learn.basics.title': 'How pattern locks work',
    'learn.basics.p1': 'You trace a single stroke over the nine dots of a 3×3 grid. Android needs at least four dots, and a dot cannot be used twice.',
    'learn.basics.p2': 'If you jump over a dot that is not used yet, it is added automatically (0→2 becomes 0→1→2). You can pass over a used dot. '
      + 'A knight move (two across and one down, for example) connects directly, because no dot lies in between.',
    'learn.basics.p3': 'These rules allow {total} patterns in total. An attacker who tries the shortest first finds a pattern of length L '
      + 'by the time they have tried all patterns of length L or less.',
    'learn.colLength': 'Length',
    'learn.colCount': 'Patterns',
    'learn.colWorst': 'Worst case trying shortest first',
    'learn.device.title': 'How the device protects you',
    'learn.device.p1': 'Since Android 7, repeated failures make you wait before the next try (AOSP Gatekeeper). With the waits below, '
      + 'only {day} tries are possible per day, {week} per week and {month} in 30 days. On real devices this runs inside the vendor’s '
      + 'trusted execution environment (TEE), and vendors can change the values.',
    'learn.colFailures': 'Failures',
    'learn.colWait': 'Wait before the next try',
    'learn.noWait': 'No wait',
    'learn.range': '{from}–{to}',
    'learn.single': '{n}',
    'learn.andAfter': '{n} and later',
    'learn.device.p2': 'Current Android stretches the pattern with scrypt and binds it to a secret in the device’s secure hardware to protect '
      + 'the key that encrypts your data. The official documentation says scrypt alone adds little, and the real protection is the '
      + 'hardware-enforced limit on attempts.',
    'learn.device.p3': 'Old Android (4.4 to 5.1) turned each dot into one byte (0–8), took an unsalted SHA-1 and stored it in /data/system/gesture.key. '
      + 'With a precomputed SHA-1 table of all {total} patterns, the pattern is recovered as soon as the file is taken. Forensic tools use '
      + 'this method. Android 6.0 moved to Gatekeeper.',
    'learn.people.title': 'How people choose',
    'learn.people.loge': 'In Løge’s (2015) study ({respondents} people, {patterns} patterns), {topLeft}% started at the top left, {corners}% '
      + 'at a corner and {center}% at the center. The 100 most common patterns made up {top100}% of all patterns.',
    'learn.people.uellenbeck': 'In real patterns collected by Uellenbeck et al. (2013), {topLeft}% started at the top left, {corners}% at a corner '
      + 'and {center}% at the center. Guessing in the order people tend to choose found about {g10}% of the patterns made with security '
      + 'in mind within 10 guesses and about {g30}% within 30.',
    'learn.grid.title': 'Going to a 4×4 grid',
    'learn.grid.p1': 'Android’s standard grid is 3×3. Counting with the same rules (at least four dots, no dot twice, a skipped unused dot is added) '
      + 'on a 4×4 grid of 16 dots gives {total4} patterns, the same number Aviv et al. (2015) report. '
      + 'The {total3} patterns of 3×3 (about 2^{bits3}) grow to about 2^{bits4}.',
    'learn.grid.p2': 'The counts by length are below (3×3 stops at nine dots).',
    'learn.colGrid3': '3×3',
    'learn.colGrid4': '4×4',
    'learn.gridTotal': 'Total',
    'learn.gridNone': '—',
    'learn.grid.p3': 'The patterns people choose, however, did not become as hard to guess as the grid size suggests. In Aviv et al. (2015), '
      + '{guesses} guesses found {share3}% of 3×3 and {share4}% of 4×4 patterns. The difference appeared only after many more guesses: '
      + '{many} guesses found {many3}% of 3×3 and {many4}% of 4×4.',
    'learn.grid.p4': 'When participants drew patterns on paper, the mean length was {mean3} dots for 3×3 and {mean4} dots for 4×4. '
      + 'On 4×4 as well, the top left was the most common start ({topLeft4}%) (Aviv et al., 2015).',
    'learn.attacks.title': 'Attacks that observe the pattern',
    'learn.attacks.smudge': 'Smudge: photographing finger traces revealed part of the pattern in {partial}% and all of it in {full}% of the '
      + 'conditions (Aviv et al., 2010). By this tool’s count, if every drawn line (without direction) is visible, {unique}% of patterns '
      + 'are narrowed to one.',
    'learn.attacks.shoulder': 'Shoulder surfing: after a single observation, {withLines}% of 6-dot patterns were reproduced with lines shown '
      + 'and {withoutLines}% with lines hidden. For 6-digit PINs it was {pin}% (Aviv et al., 2017).',
    'learn.attacks.video': 'Video: an attack tracking the fingertip cracked over {within}% within 5 attempts. Complex shapes were cracked more '
      + 'often on the first attempt: {complex}% of “complex” and {simple}% of “simple” patterns (Ye et al., 2017).',
    'learn.attacks.thermal': 'Thermal: within {seconds} seconds of entry, patterns without overlaps were recovered {noOverlap}% of the time. '
      + 'With overlaps it fell to {withOverlap}%. PINs stayed above {pin}% even with repeated digits (Abdelrahman et al., 2017, 18 participants).',
    'learn.users.title': 'When choosing (for users)',
    'learn.users.l1': 'Use more dots. Length had the largest effect on shoulder surfing, and it also increases the brute-force candidates.',
    'learn.users.l2': 'Do not start at the top left or a corner. Common starts are the first guesses.',
    'learn.users.l3': 'Turn off “Make pattern visible” on Android. Shoulder surfing dropped from {withLines}% to {withoutLines}%.',
    'learn.users.l4': 'Where shoulder surfing is a concern, a PIN of 6 or more digits is also an option (reproduced {pin}% of the time after one observation).',
    'learn.users.l5': 'A more complex shape is not always safer. In the video attack, complex shapes were cracked more often.',
    'learn.users.l6': 'Smudges and heat traces stay on the screen after entry, so wiping it before handing the device to someone leaves fewer clues.',
    'learn.users.l7': 'Do not enter a pattern you actually use into this tool.',
    'learn.devs.title': 'When building (for developers)',
    'learn.devs.l1': 'Set a minimum length (Android uses four dots). Short patterns are among the first brute-force candidates.',
    'learn.devs.l2': 'Make the user wait after repeated failures. Android’s Gatekeeper waits 24 hours after each failure from the 140th.',
    'learn.devs.l3': 'Store the pattern with a salted, slow hash (such as scrypt) and enforce the attempt limit in hardware. '
      + 'An unsalted SHA-1 is recovered with a table of all {total} patterns.',
    'learn.devs.l4': 'If you add a strength meter, explain its limits. Visual complexity measures correlate poorly with how easily patterns '
      + 'are guessed (Golla et al., 2019), while with Song et al.’s (2015) meter the guesses needed to crack about {share}% of patterns '
      + 'rose from {without} to {with}.',
    'learn.devs.l5': 'Offer a setting that hides the drawn lines (against shoulder surfing).',
    'learn.sources.title': 'Sources',
  };

  const MESSAGES = { ja, en };
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
