import test from 'node:test';
import assert from 'node:assert/strict';
import { read, load, core } from './load.js';

const { MESSAGES, t } = load('js/messages.js').PatternMessages;
const C = core();
const html = read('index.html');
// かな・カタカナ・漢字・全角の記号（当たるのは文言だけ）
const JAPANESE = new RegExp('[' + [[0x3000, 0x303f], [0x3040, 0x30ff], [0x3400, 0x9fff], [0xff00, 0xffef]]
  .map(([a, b]) => String.fromCharCode(a) + '-' + String.fromCharCode(b)).join('') + ']');
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

test('画面の文言は messages.js に集め、ほかの JS のコード（コメント以外）に日本語を書かない', () => {
  for (const f of ['script.js', 'js/pattern-core.js', 'js/theme.js', 'js/theme-init.js', 'js/tabs.js']) {
    const lines = stripComments(read(f)).split('\n');
    const hit = lines.findIndex((l) => JAPANESE.test(l));
    assert.equal(hit, -1, `${f}:${hit + 1} ${lines[hit]}`);
  }
});

test('script.js・theme.js が使うキーは、すべて日本語の辞書にある（組み立てるキーも含む）', () => {
  const keys = new Set();
  for (const f of ['script.js', 'js/theme.js']) for (const m of read(f).matchAll(/\bt\('([\w.]+)'/g)) keys.add(m[1]);
  for (const c of ['guess', 'brute', 'shoulder', 'smudge', 'thermal', 'video']) keys.add(`card.${c}.title`);
  for (const s of ['corner', 'edge', 'center']) keys.add(`start.${s}`);
  for (const s of ['simple', 'median', 'complex']) keys.add(`sun.${s}`);
  for (let i = 0; i < 9; i++) keys.add(`pos.${i}`);
  for (const ex of C.EXAMPLES) for (const k of ['title', 'lesson']) keys.add(`ex.${ex.id}.${k}`);
  const missing = [...keys].filter((k) => !(k in MESSAGES.ja));
  assert.deepEqual(missing, []);
  assert.ok(keys.size > 60, String(keys.size));
});

test('index.html の data-i18n のキーは辞書にあり、HTML に書いた日本語は辞書の日本語と同じ', () => {
  const pairs = [...html.matchAll(/data-i18n="([\w.]+)">([^<]*)</g)].map((m) => [m[1], m[2]]);
  assert.ok(pairs.length > 40, String(pairs.length));
  for (const [k, text] of pairs) {
    assert.ok(k in MESSAGES.ja, k);
    assert.equal(text, MESSAGES.ja[k], k);
  }
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const part of m[1].split(';')) assert.ok(part.split(':')[1] in MESSAGES.ja, part);
  }
});

test('文言に書いた数字は、計算部の値と同じ', () => {
  const ja = MESSAGES.ja;
  const total = C.stats().total.toLocaleString('en-US');
  for (const k of ['ui.attackNote', 'status.computing']) assert.ok(ja[k].includes(total), k);
  assert.ok(ja['ui.biasNote'].includes(C.FACTS.loge.patterns.toLocaleString('en-US')));
  // ヘルプの待ち時間の説明は、Gatekeeper の表のとおり
  const g = C.gatekeeperTimeoutMs;
  assert.deepEqual([g(5), g(10), g(11), g(30), g(40), g(140)], [30000, 30000, 30000, 30000, 60000, 86400000]);
  assert.match(ja['ui.helpAttacks1'], /5回目・10回目で30秒、11回目から毎回30秒、30回目から10回ごとに倍、140回目から毎回24時間/);
  // 例の説明の数字は、画面で値を入れる（辞書に固定の割合や件数を書かない）
  for (const ex of C.EXAMPLES) assert.doesNotMatch(ja[`ex.${ex.id}.lesson`], /\d+%|\d,\d{3}|\d+\.\d{3}/, ex.id);
});

test('置き場所 {name} を値で埋める。未知のキーはキーのまま', () => {
  assert.equal(t('err.short', { n: 3 }), '4点以上が必要です（いま3点）。');
  assert.equal(t('no.such.key'), 'no.such.key');
  assert.equal(t('dur.days', {}), '{n}日');
});
