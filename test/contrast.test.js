import test from 'node:test';
import assert from 'node:assert/strict';
import { read } from './load.js';

const css = read('style.css');

function tokens(selector) {
  const i = css.indexOf(selector);
  assert.ok(i >= 0, selector);
  const body = css.slice(i, css.indexOf('}', i));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toLowerCase()]));
}

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// 文字と下地の組（4.5:1以上）
const TEXT = [['text', 'bg'], ['text', 'surface'], ['text', 'surface-2'], ['text', 'pad-bg'], ['muted', 'surface'], ['muted', 'bg'], ['muted', 'surface-2'],
  ['accent', 'surface'], ['accent', 'surface-2'], ['accent', 'bg'], ['on-accent', 'accent'], ['on-accent', 'accent-hover'], ['warn-text', 'warn-bg'],
  ['error-text', 'surface']];
// 文字以外の部品（点の輪・選んだ点・線・棒）と下地の組（3:1以上。WCAG 1.4.11）
const UI = [['pad-ring', 'surface'], ['pad-ring', 'pad-bg'], ['pad-line', 'pad-bg'], ['accent', 'pad-bg'], ['bar', 'surface'], ['bar', 'surface-2'],
  ['text', 'surface']];

const LIGHT = tokens(':root {');
const DARK = tokens(':root[data-theme="dark"] {');
const OS_DARK = tokens(':root:not([data-theme="light"]) {');

test('配色のコントラスト: ライト・ダークとも、文字は4.5:1以上、文字以外の部品は3:1以上', () => {
  for (const [name, t] of [['light', LIGHT], ['dark', DARK]]) {
    for (const [a, b] of TEXT) {
      assert.ok(t[a] && t[b], `${name} ${a}/${b}`);
      assert.ok(ratio(t[a], t[b]) >= 4.5, `${name} ${a}/${b}: ${ratio(t[a], t[b]).toFixed(2)}`);
    }
    for (const [a, b] of UI) assert.ok(ratio(t[a], t[b]) >= 3, `${name} ${a}/${b}: ${ratio(t[a], t[b]).toFixed(2)}`);
  }
});

test('ダークの上書きは、明示（data-theme）と OS の設定の2か所で同じ。ライトと同じ名前をすべて上書きする', () => {
  assert.deepEqual(OS_DARK, DARK);
  assert.deepEqual(Object.keys(DARK).sort(), Object.keys(LIGHT).sort());
});

test('入力欄は16px、操作の要素は44px以上（点は56px）。動きを減らす設定に従う。!important は動きを止めるときだけ', () => {
  assert.match(css, /input\[type="text"\] \{[^}]*font-size: 16px;[^}]*min-height: 44px;/);
  assert.match(css, /button \{[^}]*min-height: 44px;/);
  assert.match(css, /\.help-icon \{[^}]*width: 44px;[^}]*height: 44px;/);
  assert.match(css, /\.node \{[^}]*width: 56px;[^}]*height: 56px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /min-height: 100dvh;/);
  assert.equal(css.split('!important').length - 1, 2);
});

test('選ばれていないタブは button の既定（アクセントの下地に白い文字）を打ち消す。タブの間はフォーカスの枠より広い', () => {
  const rule = (selector) => {
    const i = css.indexOf(`${selector} {`);
    assert.ok(i >= 0, selector);
    return css.slice(i, css.indexOf('}', i));
  };
  assert.match(rule('.tab'), /background: transparent;[^}]*color: var\(--muted\);/);
  assert.match(rule('.tab[aria-selected="true"]'), /background: var\(--accent\);[^}]*color: var\(--on-accent\);/);
  assert.match(rule('.tabs'), /gap: 8px;[^}]*padding: 6px;/);
  assert.match(css, /:focus-visible \{\s*outline: 3px solid var\(--focus\);\s*outline-offset: 2px;/);
  // ? ボタンは見出しのすぐ隣にあるので、枠を箱の内側に出す（外側に出すと見出しの文字にかかる）
  assert.match(rule('.help-icon:focus-visible'), /outline-offset: -4px;/);
  // 関連ツールのリンクの真下に説明がある。枠（外側に5px）が説明の文字にかからないよう、間をあける
  assert.match(rule('.related-desc'), /display: block;\s*margin-top: 6px;/);
});

test('狭い画面の表: 1行ずつのかたまりにするとき、各セルの見出しは折り返す（縮めないと幅320pxで表がはみ出した）。数字だけの表は表のまま', () => {
  const i = css.indexOf('td::before {');
  assert.ok(i >= 0);
  assert.doesNotMatch(css.slice(i, css.indexOf('}', i)), /flex-shrink: 0/);
  assert.match(css, /\.data-table:not\(\.numbers\) tr \{\s*display: block;/);
  assert.match(css,
    /\.data-table\.numbers td,\s*\.data-table\.numbers thead th:not\(:first-child\) \{\s*text-align: right;\s*font-variant-numeric: tabular-nums;/);
  assert.match(css, /@media \(max-width: 400px\) \{\s*\.data-table\.numbers \{\s*font-size: 0\.85rem;/);
});
