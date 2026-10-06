import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

// 既知の値は、計算部とは別に書いた参照実装（深さ優先の列挙・部分集合の動的計画法）と、文献の値から取った
const C = core();

test('飛び越えた点は、まだ使っていなければ自動で入る（Android の detectAndAddHit と同じ）', () => {
  assert.deepEqual(C.fromTouches([0, 2]), [0, 1, 2]);
  assert.deepEqual(C.fromTouches([0, 8]), [0, 4, 8]);
  assert.deepEqual(C.fromTouches([2, 6]), [2, 4, 6]);
  assert.deepEqual(C.fromTouches([1, 7]), [1, 4, 7]);
  assert.deepEqual(C.fromTouches([0, 5, 6]), [0, 5, 6], '桂馬飛び（2,1）は何も入らない');
  assert.deepEqual(C.fromTouches([1, 0, 2]), [1, 0, 2], '使った点は飛び越えてよい');
  assert.deepEqual(C.fromTouches([0, 0, 1, 1, 0, 2]), [0, 1, 2], '同じ点・使った点は足さない');
  // 9通りの点から9通りの点へ: 飛び越えるのは縦横・斜めに2つ離れた8組（向きを数えて16組）だけ
  let pairs = 0;
  for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) if (a !== b && C.passes(a, b).length) pairs++;
  assert.equal(pairs, 16);
});

test('パターンとして正しいかを判定する（4点以上・同じ点なし・使っていない点を飛び越えない）', () => {
  assert.equal(C.validate([0, 1, 2, 5]), null);
  assert.equal(C.validate([0, 1, 2]), 'short');
  assert.equal(C.validate([0, 2, 5, 8]), 'jump');
  assert.equal(C.validate([1, 0, 2, 5]), null);
  assert.equal(C.validate([0, 1, 0, 3]), 'repeat');
  assert.equal(C.validate([0, 1, 9, 3]), 'node');
  assert.equal(C.validate('0125'), 'node');
});

test('文字で書いたパターンを読む', () => {
  assert.deepEqual(C.parse('0-4-8-5'), { pattern: [0, 4, 8, 5], error: null });
  assert.deepEqual(C.parse('0485'), { pattern: [0, 4, 8, 5], error: null });
  assert.deepEqual(C.parse(' 0 → 1 → 2 → 5 '), { pattern: [0, 1, 2, 5], error: null });
  assert.deepEqual(C.parse('0,8,2,6').pattern, [0, 4, 8, 5, 2, 6], '飛び越えた点は自動で入る');
  assert.equal(C.parse('').error, 'empty');
  assert.equal(C.parse('0-1-9').error, 'char');
  assert.equal(C.parse('a').error, 'char');
  assert.equal(C.parse('012').error, 'short');
  const r = C.parse('0-2-8-5');
  assert.equal(r.error, 'repeat', '0→2 で1、2→8 で5が自動で入るので、最後の5は2回目');
  assert.equal(r.repeated, 5);
  assert.equal(C.format([0, 4, 8, 5]), '0-4-8-5');
});

test('有効なパターンは長さ4〜9で 1,624・7,152・26,016・72,912・140,704・140,704、計389,112通り', () => {
  const s = C.stats();
  assert.deepEqual(s.byLength, { 4: 1624, 5: 7152, 6: 26016, 7: 72912, 8: 140704, 9: 140704 });
  assert.equal(s.total, 389112);
  assert.equal(s.sorted.length, 389112);
  assert.deepEqual([4, 5, 6, 7, 8, 9].map(C.shortestFirstWorst), [1624, 8776, 34792, 107704, 248408, 389112]);
});

test('交差・重なりは Golla ら（USEC 2019）の例のとおりに数える', () => {
  assert.equal(C.features([4, 0, 1, 3]).intersections, 1, '4-0 と 1-3 が交わる');
  const t = C.features([1, 4, 5, 3]);
  assert.equal(t.intersections, 1, '5-3 が点4で 1-4 に触れる');
  assert.equal(t.overlaps, 1, '5-3 が 4-5 を引き直す');
  assert.equal(C.features([7, 4, 1, 0, 2]).overlaps, 1, '0-2 が 1-0 を引き直す');
  // 現行版で数え落としていた、最初と最後の線分の交差
  const k = C.features([5, 0, 7, 2]);
  assert.equal(k.intersections, 1);
  assert.equal(k.knightMoves, 3);
  assert.equal(C.features([0, 1, 2, 5]).length, 3);
  assert.equal(C.features([0, 1, 2, 5]).start, 'corner');
  assert.equal(C.features([1, 0, 3, 6]).start, 'edge');
  assert.equal(C.features([4, 0, 1, 2]).start, 'center');
  assert.equal(C.relation([0, 0], [2, 2], [0, 2], [2, 0]), 'cross');
  assert.equal(C.relation([0, 0], [2, 0], [1, 0], [1, 2]), 'touch');
  assert.equal(C.relation([0, 0], [2, 0], [1, 0], [0, 0]), 'overlap');
  assert.equal(C.relation([0, 0], [1, 0], [0, 1], [1, 1]), 'none');
});

test('Sun らの強度 PS の範囲は文献の 6.340〜46.807。Ye らの区分（19未満・33超）', () => {
  const s = C.stats();
  assert.equal(s.sorted[0].toFixed(3), '6.340');
  assert.equal(s.sorted[s.sorted.length - 1].toFixed(3), '46.807');
  assert.equal(C.sunScore(C.features([0, 1, 2, 5])).toFixed(3), '6.340');
  assert.equal(C.sunScore(C.features([0, 1, 2])), 0, '3点はパターンではない');
  assert.equal(C.sunClass(18.99), 'simple');
  assert.equal(C.sunClass(19), 'median');
  assert.equal(C.sunClass(33), 'median');
  assert.equal(C.sunClass(33.01), 'complex');
  assert.equal(C.sunPercentile(s.sorted[0]), 0);
  assert.ok(C.sunPercentile(40) > C.sunPercentile(20));
});

test('汚れから点がわかったとき・線がわかったときに残る候補の数', () => {
  assert.deepEqual(C.smudgeCandidates([0, 1, 2, 5, 8]), { points: 40, lines: 4 });
  assert.deepEqual(C.smudgeCandidates([0, 4, 8, 5]), { points: 18, lines: 3 });
  const s = C.stats();
  const lines = [...s.byLines.values()];
  // 線（向きなし）の集合ごとの候補の数を、パターンの数で重みづけして数える
  const upTo = (k) => lines.filter((c) => c <= k).reduce((a, c) => a + c, 0);
  assert.equal(upTo(1), 195512);
  assert.equal(upTo(2), 351520);
  assert.equal(upTo(4), 389112);
  assert.equal(Math.min(...s.bySet.values()), 2);
});

test('Android の待ち時間（AOSP gatekeeper.cpp の ComputeRetryTimeout）', () => {
  const t = C.gatekeeperTimeoutMs;
  assert.deepEqual([0, 1, 4, 5, 6, 9, 10, 11, 29].map(t), [0, 0, 0, 30000, 0, 0, 30000, 30000, 30000]);
  assert.deepEqual([30, 39, 40, 49, 50, 139].map(t), [30000, 30000, 60000, 60000, 120000, 30000 * 1024]);
  assert.deepEqual([140, 1000].map(t), [86400000, 86400000]);
  assert.equal(C.waitBeforeAttempt(1), 0);
  assert.equal(C.waitBeforeAttempt(6), 30);
  assert.equal(C.waitBeforeAttempt(140), 614730);
  assert.equal(C.waitBeforeAttempt(1624), 128832330);
  assert.equal(C.attemptsWithin(86400), 111);
  assert.equal(C.attemptsWithin(86400 * 7), 139);
  assert.equal(C.attemptsWithin(86400 * 30), 162);
  // android-5.1.1 以前のロック画面は5回ごとに30秒
  assert.deepEqual([4, 5, 10, 11].map(C.legacyTimeoutMs), [0, 30000, 30000, 0]);
  assert.equal(C.waitBeforeAttempt(1624, C.legacyTimeoutMs), 9720);
  assert.equal(C.attemptsWithin(86400, C.legacyTimeoutMs), 14405);
});

test('文献の値: 始点の割合は合計100%、長さの割合は丸めで99%', () => {
  assert.equal(C.START_SHARE.length, 9);
  assert.equal(C.START_SHARE.reduce((a, b) => a + b, 0), 100);
  assert.equal(C.START_SHARE[0], C.FACTS.loge.topLeft);
  assert.equal(C.START_SHARE[4], C.FACTS.loge.center);
  assert.equal([0, 2, 6, 8].reduce((a, i) => a + C.START_SHARE[i], 0), C.FACTS.loge.corners);
  assert.equal(Object.values(C.LENGTH_SHARE).reduce((a, b) => a + b, 0), 99);
  assert.deepEqual(Object.keys(C.LENGTH_SHARE).map(Number), [4, 5, 6, 7, 8, 9]);
  for (const k of Object.keys(C.FACTS)) assert.ok(C.SOURCES[k], k);
});
