// PatternLock Security Trainer の計算部（DOM を使わない通常のスクリプト。globalThis.PatternCore に置く）
// 点の番号は 0〜8（左上が0、左から右・上から下）。古い Android の gesture.key のバイトと同じ並び
(function (root) {
  'use strict';

  const SIZE = 3;
  const NODES = SIZE * SIZE;
  const MIN_LENGTH = 4; // AOSP LockPatternUtils.MIN_LOCK_PATTERN_SIZE

  const xy = (i) => [i % SIZE, Math.floor(i / SIZE)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

  // a から b へまっすぐ引いたときに通る点（端を除く）。3×3 では多くても1つ
  function passes(a, b) {
    const [ca, ra] = xy(a);
    const [cb, rb] = xy(b);
    const dc = cb - ca;
    const dr = rb - ra;
    const g = gcd(Math.abs(dc), Math.abs(dr));
    const out = [];
    for (let k = 1; k < g; k++) out.push((ra + (dr / g) * k) * SIZE + (ca + (dc / g) * k));
    return out;
  }
  const PASS = Array.from({ length: NODES }, (_, a) => Array.from({ length: NODES }, (_, b) => (a === b ? [] : passes(a, b))));

  const isNode = (n) => Number.isInteger(n) && n >= 0 && n < NODES;

  // Android の規則で、パターンの最後に点を足す（LockPatternView の detectAndAddHit と同じ）。
  // 飛び越える点がまだ使われていなければ、その点を先に入れる。使った点・同じ点は足さない
  // 戻り値: 足した点の配列（何も足さなければ空）
  function extend(pattern, next) {
    if (!isNode(next) || pattern.includes(next)) return [];
    const added = [];
    if (pattern.length) {
      for (const m of PASS[pattern[pattern.length - 1]][next]) if (!pattern.includes(m)) added.push(m);
    }
    added.push(next);
    pattern.push(...added);
    return added;
  }

  // なぞった点の列（重複を含んでよい）から、Android の規則でパターンを作る
  function fromTouches(touches) {
    const p = [];
    for (const n of touches) extend(p, n);
    return p;
  }

  // パターンとして正しいか（Android で設定できるか）
  function validate(pattern) {
    if (!Array.isArray(pattern) || !pattern.every(isNode)) return 'node';
    if (new Set(pattern).size !== pattern.length) return 'repeat';
    for (let i = 1; i < pattern.length; i++) {
      const before = pattern.slice(0, i - 1);
      if (PASS[pattern[i - 1]][pattern[i]].some((m) => !before.includes(m))) return 'jump';
    }
    if (pattern.length < MIN_LENGTH) return 'short';
    return null;
  }

  // 文字で書いたパターンを読む。数字 0〜8 を、区切り（空白・ハイフン・カンマ・矢印）でも、続けても書ける
  // 飛び越えた点は Android と同じく自動で入れる。error: 'empty' | 'char' | 'repeat' | 'short'
  function parse(text) {
    const s = String(text == null ? '' : text).trim();
    if (!s) return { pattern: [], error: 'empty' };
    if (/[^0-8\s,\-→>、・]/.test(s)) return { pattern: [], error: 'char' };
    const digits = s.replace(/[\s,\-→>、・]+/g, '').split('').map(Number);
    const p = [];
    for (const d of digits) {
      if (p.includes(d)) return { pattern: p, error: 'repeat', repeated: d };
      extend(p, d);
    }
    return { pattern: p, error: p.length < MIN_LENGTH ? 'short' : null };
  }

  const format = (pattern) => pattern.join('-');

  // ---- 形の特徴 ----
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const within = (p, a, b) => Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
  const onSegment = (p, a, b) => cross(a, b, p) === 0 && within(p, a, b);

  // 2本の線分の関係: 'cross'（互いの内側で交わる）| 'touch'（一方の端か通過点で触れる）| 'overlap'（同じ直線上で重なる）| 'none'
  function relation(p1, p2, q1, q2) {
    const d1 = cross(q1, q2, p1);
    const d2 = cross(q1, q2, p2);
    const d3 = cross(p1, p2, q1);
    const d4 = cross(p1, p2, q2);
    if (d1 === 0 && d2 === 0) {
      const t = (p) => (p2[0] - p1[0]) * (p[0] - p1[0]) + (p2[1] - p1[1]) * (p[1] - p1[1]);
      const lo = Math.max(0, Math.min(t(q1), t(q2)));
      const hi = Math.min(t(p2), Math.max(t(q1), t(q2)));
      if (hi > lo) return 'overlap';
      return hi === lo ? 'touch' : 'none';
    }
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 'cross';
    if (onSegment(p1, q1, q2) || onSegment(p2, q1, q2) || onSegment(q1, p1, p2) || onSegment(q2, p1, p2)) return 'touch';
    return 'none';
  }

  // 通過した点で区切った単位の線分（向きなし）の番号。単位の線分は 3×3 で28本
  const UNIT_INDEX = new Map();
  for (let a = 0; a < NODES; a++) {
    for (let b = a + 1; b < NODES; b++) if (!PASS[a][b].length) UNIT_INDEX.set(a * NODES + b, UNIT_INDEX.size);
  }
  function unitSegments(pattern) {
    const out = [];
    for (let i = 0; i + 1 < pattern.length; i++) {
      const pts = [pattern[i], ...PASS[pattern[i]][pattern[i + 1]], pattern[i + 1]];
      for (let j = 0; j + 1 < pts.length; j++) out.push(UNIT_INDEX.get(Math.min(pts[j], pts[j + 1]) * NODES + Math.max(pts[j], pts[j + 1])));
    }
    return out;
  }

  const startClass = (n) => (n === 4 ? 'center' : n % 2 === 0 ? 'corner' : 'edge');

  // 形の特徴。交差・重なりの数え方は Golla ら（USEC 2019）の定義:
  // 交差＝隣り合わない線分どうしが交わるか触れる（点で触れるだけも数える）、重なり＝前に引いた単位の線分をもう一度通る
  function features(pattern) {
    const n = pattern.length;
    let length = 0;
    let knightMoves = 0;
    for (let i = 0; i + 1 < n; i++) {
      const [ax, ay] = xy(pattern[i]);
      const [bx, by] = xy(pattern[i + 1]);
      const dx = Math.abs(ax - bx);
      const dy = Math.abs(ay - by);
      length += Math.hypot(dx, dy);
      if ((dx === 1 && dy === 2) || (dx === 2 && dy === 1)) knightMoves++;
    }
    let intersections = 0;
    for (let i = 0; i + 1 < n; i++) {
      for (let j = i + 2; j + 1 < n; j++) {
        const r = relation(xy(pattern[i]), xy(pattern[i + 1]), xy(pattern[j]), xy(pattern[j + 1]));
        if (r === 'cross' || r === 'touch') intersections++;
      }
    }
    let overlaps = 0;
    let seen = 0;
    for (const u of unitSegments(pattern)) {
      if (seen & (1 << u)) overlaps++;
      else seen |= 1 << u;
    }
    return { nodes: n, length, intersections, overlaps, knightMoves, start: n ? startClass(pattern[0]) : null, lines: seen };
  }

  // Sun・Wang・Zheng（2014）の強度 PS = S × log2(L + I + O)。全パターンの範囲は 6.340〜46.807
  function sunScore(f) {
    return f.nodes >= MIN_LENGTH ? f.nodes * Math.log2(f.length + f.intersections + f.overlaps) : 0;
  }
  // Ye ら（NDSS 2017）の区分: 19未満＝単純、33超＝複雑、その間＝中間
  const SUN_SIMPLE_BELOW = 19;
  const SUN_COMPLEX_ABOVE = 33;
  const sunClass = (ps) => (ps < SUN_SIMPLE_BELOW ? 'simple' : ps > SUN_COMPLEX_ABOVE ? 'complex' : 'median');

  // ---- 全パターンの数え上げ（最初に使うときに1回だけ計算する） ----
  let cache = null;
  function stats() {
    if (cache) return cache;
    const byLength = {};
    const bySet = new Map();
    const byLines = new Map();
    const scores = [];
    const p = [];
    const visit = (used) => {
      if (p.length >= MIN_LENGTH) {
        byLength[p.length] = (byLength[p.length] || 0) + 1;
        bySet.set(used, (bySet.get(used) || 0) + 1);
        const f = features(p);
        byLines.set(f.lines, (byLines.get(f.lines) || 0) + 1);
        scores.push(sunScore(f));
      }
      if (p.length === NODES) return;
      const last = p[p.length - 1];
      for (let b = 0; b < NODES; b++) {
        if (used & (1 << b)) continue;
        if (PASS[last][b].some((m) => !(used & (1 << m)))) continue;
        p.push(b);
        visit(used | (1 << b));
        p.pop();
      }
    };
    for (let s = 0; s < NODES; s++) {
      p.push(s);
      visit(1 << s);
      p.pop();
    }
    const sorted = Float64Array.from(scores).sort();
    const total = scores.length;
    cache = { total, byLength, bySet, byLines, sorted };
    return cache;
  }

  // 長さ L 以下のパターンの数（短い順に全部試す攻撃者が、長さ L のパターンに当たるまでの最悪の回数）
  function shortestFirstWorst(len) {
    const s = stats();
    let acc = 0;
    for (let l = MIN_LENGTH; l <= len; l++) acc += s.byLength[l] || 0;
    return acc;
  }

  // 汚れから、使った点がわかったとき／引いた線（向きなし）がわかったときに残る候補の数
  function smudgeCandidates(pattern) {
    const s = stats();
    const set = pattern.reduce((m, n) => m | (1 << n), 0);
    return { points: s.bySet.get(set) || 0, lines: s.byLines.get(features(pattern).lines) || 0 };
  }

  // PS が自分より小さいパターンの割合（0〜1）
  function sunPercentile(ps) {
    const a = stats().sorted;
    let lo = 0;
    let hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid] < ps - 1e-9) lo = mid + 1;
      else hi = mid;
    }
    return lo / a.length;
  }

  // ---- Android の待ち時間 ----
  // AOSP system/gatekeeper/gatekeeper.cpp ComputeRetryTimeout（android-7.0.0_r1 以降、main と同じ）。count は失敗の通算回数
  function gatekeeperTimeoutMs(count) {
    if (count <= 0) return 0;
    if (count <= 10) return count % 5 === 0 ? 30000 : 0;
    if (count < 30) return 30000;
    if (count < 140) return 30000 * 2 ** Math.floor((count - 30) / 10);
    return 24 * 60 * 60 * 1000;
  }
  // android-5.1.1 以前のロック画面（LockPatternUtils FAILED_ATTEMPTS_BEFORE_TIMEOUT = 5、FAILED_ATTEMPT_TIMEOUT_MS = 30000）
  const legacyTimeoutMs = (count) => (count > 0 && count % 5 === 0 ? 30000 : 0);

  // n 回目を試せるようになるまでの待ちの合計（秒）。それまでの n−1 回はすべて失敗とする
  function waitBeforeAttempt(n, timeout = gatekeeperTimeoutMs) {
    let ms = 0;
    for (let c = 1; c < n; c++) ms += timeout(c);
    return ms / 1000;
  }
  // seconds 秒のあいだに試せる回数
  function attemptsWithin(seconds, timeout = gatekeeperTimeoutMs) {
    let ms = 0;
    let n = 1;
    for (;;) {
      const next = ms + timeout(n);
      if (next > seconds * 1000) return n;
      ms = next;
      n++;
    }
  }

  // ---- 文献の値（出典は SOURCES。README と画面はここから読む） ----
  // Løge 2015 表5.6「All」の始点の割合（%）。0始まりに並べ替えた
  const START_SHARE = [44, 9, 15, 6, 4, 2, 14, 2, 4];
  // Løge 2015 図5.5(b) の長さの割合（%）
  const LENGTH_SHARE = { 4: 36, 5: 23, 6: 12, 7: 12, 8: 4, 9: 12 };
  const FACTS = {
    loge: { respondents: 802, patterns: 3393, topLeft: 44, corners: 77, center: 4, top100: 42 },
    uellenbeck: { topLeft: 38, corners: 75, center: 6, guesses10: 4, guesses30: 9 },
    aviv2015: { guesses: 20, share3: 15, share4: 19 },
    aviv2010: { partial: 92, full: 68 },
    aviv2017: { withLines: 64.2, withoutLines: 35.3, pin6: 10.8 },
    ye2017: { attempts: 5, within: 95, complexFirst: 97.5, simpleFirst: 60 },
    abdelrahman2017: { seconds: 30, noOverlap: 100, withOverlap: 16.67, pin: 72 },
  };
  const SOURCES = {
    loge: 'Marte Dybevik Løge, "Tell Me Who You Are and I Will Tell You Your Unlock Pattern", Master\'s thesis, NTNU, 2015',
    uellenbeck: 'Uellenbeck, Dürmuth, Wolf, Holz, "Quantifying the Security of Graphical Passwords: The Case of Android Unlock Patterns", ACM CCS 2013',
    aviv2010: 'Aviv, Gibson, Mossop, Blaze, Smith, "Smudge Attacks on Smartphone Touch Screens", USENIX WOOT 2010',
    aviv2015: 'Aviv, Budzitowski, Kuber, "Is Bigger Better? Comparing User-Generated Passwords on 3x3 vs. 4x4 Grid Sizes for Android\'s Pattern Unlock", ACSAC 2015',
    aviv2017: 'Aviv, Davin, Wolf, Kuber, "Towards Baselines for Shoulder Surfing on Mobile Authentication", ACSAC 2017',
    ye2017: 'Ye, Tang, Fang, Chen, Kim, Taylor, Wang, "Cracking Android Pattern Lock in Five Attempts", NDSS 2017',
    abdelrahman2017: 'Abdelrahman, Khamis, Schneegass, Alt, "Stay Cool! Understanding Thermal Attacks on Mobile-based User Authentication", CHI 2017',
    sun2014: 'Sun, Wang, Zheng, "Dissecting pattern unlock: The effect of pattern strength meter on pattern selection", Journal of Information Security and Applications, 2014',
    golla2019: 'Golla, Rimkus, Aviv, Dürmuth, "On the In-Accuracy and Influence of Android Pattern Strength Meters", NDSS USEC 2019',
    aosp: 'Android Open Source Project: LockPatternUtils.java, LockPatternView.java (frameworks/base), gatekeeper.cpp (system/gatekeeper)',
  };

  root.PatternCore = {
    SIZE, NODES, MIN_LENGTH, xy, passes, extend, fromTouches, validate, parse, format, relation, unitSegments, startClass, features,
    sunScore, sunClass, SUN_SIMPLE_BELOW, SUN_COMPLEX_ABOVE, stats, shortestFirstWorst, smudgeCandidates, sunPercentile,
    gatekeeperTimeoutMs, legacyTimeoutMs, waitBeforeAttempt, attemptsWithin, START_SHARE, LENGTH_SHARE, FACTS, SOURCES,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
