# パターンロックの研究と実装 - 専門家向けの背景資料

このツール（PatternLock Security Trainer）が使っている数字の出典と、その条件をまとめた資料です。論文は本文で、Androidの実装はAOSPのソースコードで確かめた値だけを載せています。確かめられなかったものは、その旨を書いています。

点の番号は0〜8（左上が0、左から右・上から下）で書きます。論文によっては1〜9で数えているので、引用するときは注意してください。

---

## 1. Androidの実装

### 1.1 パターンの規則

- 3×3の9点を一筆でなぞる。最小は4点（`LockPatternUtils`の`MIN_LOCK_PATTERN_SIZE = 4`）。4点未満の誤りは失敗に数えない
- まだ使っていない点を飛び越えると、その点が自動で入る（`LockPatternView`の`detectAndAddHit`）。縦横に2つ、または斜めに2つ離れた点への線が対象で、桂馬飛び（横2・縦1など）には何も入らない。使った点の上は通れる
- この規則で作れるパターンは389,112通り（長さ4〜9で1,624・7,152・26,016・72,912・140,704・140,704）。このツールの数え上げと、Løge（2015）の表2.1が一致する

### 1.2 古いAndroidの保存方法（4.4〜5.1）

- `LockPatternUtils.patternToHash`は、各点を`row*3+column`の1バイト（0〜8、文字ではない）にして、塩なしのSHA-1を取る。コードのコメントは「Not the most secure」と書いている
- 結果は`/data/system/gesture.key`に保存された。ファイルを読めれば、全389,112通りのSHA-1の表を引くだけでパターンが戻る。鑑識の道具（Andriller、sch3m4のスクリプトなど）もこの方法を使う
- android-6.0.0_r1から、パターンはGatekeeperに登録する形に変わった。古いgesture.keyは1回SHA-1で照合してから移される

### 1.3 失敗したときの待ち時間

android-7.0.0_r1以降の`system/gatekeeper/gatekeeper.cpp`（`ComputeRetryTimeout`、mainと同じ）は、失敗の通算回数に応じて次の待ち時間を返します。

| 失敗の回数 | 次を試すまでの待ち |
|---|---|
| 1〜4回目・6〜9回目 | 待ちなし |
| 5回目・10回目 | 30秒 |
| 11〜29回目 | 毎回30秒 |
| 30〜139回目 | 30秒を10回ごとに倍（130〜139回目は約8.5時間） |
| 140回目以降 | 毎回24時間 |

- この表のとおりなら、端末で試せるのは1日に111回、1週間に139回、30日で162回になる
- android-6.0.0_r1では、11回目以降も30秒のまま（倍にならない）。android-5.1.1以前のロック画面は、5回失敗するごとに30秒待たせた（`FAILED_ATTEMPTS_BEFORE_TIMEOUT = 5`、`FAILED_ATTEMPT_TIMEOUT_MS = 30000L`）
- 実機では、Gatekeeperはメーカーの信頼できる実行環境（TEE）の中で動く。公式の説明は待ち時間の値を定めておらず、メーカーが変えられる

### 1.4 いまのAndroidの保存方法

- 公式の説明（File-based encryption）によると、画面ロックのPIN・パターン・パスワードはscryptで引き伸ばされ（約25ミリ秒・約2MiBを目安）、セキュアチップかTEEにある秘密（WeaverかGatekeeperとKeystoreの鍵）と結びつけられて、データを暗号化する合成パスワードを守る
- 同じ説明は、scryptだけではあまり安全にならず、守りの本体はハードウェアが強制する回数の制限だとしている

---

## 2. 人の選び方

| 出典 | 調べたもの | 左上から | 角から | 中央から | 長さ |
|---|---|---|---|---|---|
| Løge 2015 | 802人・3,393個 | 44% | 77%（表5.6の和） | 4% | スマートフォン用の平均5.40点 |
| Uellenbeckら、2013 | 実際のパターン（105人） | 38% | 75% | 6% | 平均5.63点 |
| Uellenbeckら、2013 | ゲーム形式の調査 | 43〜44% | 78% | 2% | 守りの平均6.59点 |

- Løge（2015）の長さの割合（図5.5(b)の値）は、4点36%・5点23%・6点12%・7点12%・8点4%・9点12%。上位100個のパターンで全体の42%を占めた
- Løge（2015）の始点の割合（表5.6）は、左上44%・上9%・右上15%・左6%・中央4%・右2%・左下14%・下2%・右下4%
- Uellenbeckら（2013）の部分推測エントロピーは、守りのパターンで8.72・9.10・10.90ビット（10%・20%・50%を当てるまで）。一様に選んだ場合は18.57ビット。10回の推測で約4%、30回で約9%が当たった（攻めの場面で作ったパターンは約7%・約19%）
- Avivら（2015）は、20回の推測で3×3の15%、4×4の19%が当たったとしている。4×4の有効なパターンは4,350,069,823,024通りあるが、人が選ぶパターンの推測されやすさは大きくは変わらなかった

---

## 3. パターンそのものを盗み見る攻撃

| 攻撃 | 値 | 条件 | 出典 |
|---|---|---|---|
| 汚れ | 一部がわかった92%、全部がわかった68% | 画面の汚れを撮影。条件によって最悪37%・14% | Avivら、2010 |
| 覗き見 | 線を表示する6点のパターン64.2%、線を表示しない設定35.3%、6桁のPIN10.8% | 1回見ただけ。複数回では79.9%・52.1%・26.5% | Avivら、2017 |
| 動画 | 5回以内に95%超。1回目に「複雑」97.5%・「単純」60% | 120個のパターン、2m先からの撮影 | Yeら、2017 |
| 熱 | 重なりのないパターン100%、重なりのあるパターン16.67% | 入力後30秒以内、18人 | Abdelrahmanら、2017 |

- 覗き見では、長さの影響が大きかった。交差・桂馬飛び・位置の影響ははっきりしなかった（Avivら、2017）
- 動画の攻撃では、Sunらの複雑さが高いパターンのほうが、1回目に当たりやすかった（Yeら、2017）。見た目を複雑にすることが、攻撃によっては逆効果になる
- 重なりは熱の跡を乱すので、熱の攻撃には強くなる。桂馬飛びは、点の熱の跡は乱さない（Abdelrahmanら、2017）
- このツールの数え上げでは、引いた線（向きなし）が全部見えると、全パターンの50.2%が1通りに決まり、90.3%が2通り以内になる。使った点だけがわかる場合、候補の数の中央値は20,944通り

---

## 4. 強度メーター

- Sunら（2014）の強度は、PS＝点の数×log₂（線の長さ＋交差＋重なり）。全パターンでの範囲は6.340〜46.807（Løge 2015の式2.1の説明）。原典は読めなかったので、式はLøge（2015）とYeら（2017）、Gollaら（2019）の引用で確かめた
- 交差・重なりの数え方は、Gollaら（2019）の定義（交差は点で触れるだけも数える、重なりは引き直した線分）を使った。この定義で全パターンを数えると、範囲6.340〜46.807が再現する
- Songら（2015）のメーターを見せたグループでは、パターンの約10%が当たるまでの推測の回数が16回から48回に増えた（101個のパターン。要約で確認）
- Gollaら（2019）は、見た目の性質（長さ・交差・重なりなど）にもとづく強度の推定は、実際の推測されやすさとの相関が低いと報告している

---

## 5. 守りの考え方

### 使う人

- 点を増やす（覗き見と総当たりの両方に関係する）
- 左上・角から始めない（始点の偏りは推測の最初の候補になる）
- 「パターンを表示する」をオフにする（覗き見の再現が64.2%から35.3%に下がった）
- 覗き見が心配な場面では、6桁以上のPINも選択肢になる
- 見た目を複雑にすれば安全とは限らない（動画の攻撃）

### 作る人

- 最小の長さを決め、失敗が続いたら待たせる（Gatekeeperの表）
- パターンは塩つきの遅いハッシュにし、回数の制限はハードウェアで守る。塩なしのSHA-1は全パターンの表で戻る
- 強度メーターを付けるなら、その限界も利用者に伝える
- 線を表示しない設定を用意する

---

## 6. 確かめられなかったもの

- Sunら（2014）の原典（有料で読めなかった）。式と範囲は引用で確かめた
- Andriotisら（WiSec 2013・HAS 2014）の原典（アクセスが止められていた）。このツールでは使っていない
- メーカーごとのGatekeeperの待ち時間（AOSPの既定の実装だけを確かめた）

---

## 7. 参考文献

1. Marte Dybevik Løge, "Tell Me Who You Are and I Will Tell You Your Unlock Pattern", Master's thesis, NTNU, 2015. https://hdl.handle.net/11250/2380967
2. Uellenbeck, Dürmuth, Wolf, Holz, "Quantifying the Security of Graphical Passwords: The Case of Android Unlock Patterns", ACM CCS 2013. https://doi.org/10.1145/2508859.2516700
3. Aviv, Gibson, Mossop, Blaze, Smith, "Smudge Attacks on Smartphone Touch Screens", USENIX WOOT 2010. https://www.usenix.org/legacy/events/woot10/tech/full_papers/Aviv.pdf
4. Aviv, Budzitowski, Kuber, "Is Bigger Better? Comparing User-Generated Passwords on 3x3 vs. 4x4 Grid Sizes for Android's Pattern Unlock", ACSAC 2015. https://doi.org/10.1145/2818000.2818014
5. Aviv, Davin, Wolf, Kuber, "Towards Baselines for Shoulder Surfing on Mobile Authentication", ACSAC 2017. https://doi.org/10.1145/3134600.3134609
6. Ye, Tang, Fang, Chen, Kim, Taylor, Wang, "Cracking Android Pattern Lock in Five Attempts", NDSS 2017. https://www.ndss-symposium.org/wp-content/uploads/2017/09/ndss2017_03A-5_Ye_paper.pdf
7. Abdelrahman, Khamis, Schneegass, Alt, "Stay Cool! Understanding Thermal Attacks on Mobile-based User Authentication", CHI 2017. https://doi.org/10.1145/3025453.3025461
8. Sun, Wang, Zheng, "Dissecting pattern unlock: The effect of pattern strength meter on pattern selection", Journal of Information Security and Applications, 2014. https://doi.org/10.1016/j.jisa.2014.10.009
9. Golla, Rimkus, Aviv, Dürmuth, "On the In-Accuracy and Influence of Android Pattern Strength Meters", NDSS USEC 2019. https://www.ndss-symposium.org/wp-content/uploads/2019/02/usec2019_04-1_Golla_paper.pdf
10. Song, Cho, Oh, Kim, Huh, "On the Effectiveness of Pattern Lock Strength Meters: Measuring the Strength of Real World Pattern Locks", CHI 2015. https://doi.org/10.1145/2702123.2702365
11. Android Open Source Project, `system/gatekeeper/gatekeeper.cpp`. https://android.googlesource.com/platform/system/gatekeeper/+/refs/heads/main/gatekeeper.cpp
12. Android Open Source Project, File-based encryption. https://source.android.com/docs/security/features/encryption/file-based

この資料は、防御と学習のために書いています。
