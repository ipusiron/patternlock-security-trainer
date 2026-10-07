import test from 'node:test';
import assert from 'node:assert/strict';
import { read, load } from './load.js';

const html = read('index.html');

test('CSP: インラインのスクリプト・スタイルを許さず、外部へつながない。meta で効かない指定は書かない', () => {
  const m = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
  assert.ok(m);
  const csp = m[1];
  for (const d of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self' data:", "connect-src 'none'", "object-src 'none'",
    "base-uri 'none'", "form-action 'none'"]) {
    assert.ok(csp.includes(d), d);
  }
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https:|frame-ancestors/);
  assert.doesNotMatch(html, /X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|http-equiv="Referrer-Policy"|Permissions-Policy/);
  assert.match(html, /<meta name="referrer" content="no-referrer" \/>/);
  assert.match(html, /<noscript>/);
  assert.match(html, /<link rel="icon" href="data:," \/>/, 'favicon がないと Edge が /favicon.ico を取りに行って404になる');
});

test('インラインのスクリプト・イベントハンドラー・style 属性がない。スクリプトは決まった順に読む（file:// でも動く通常のスクリプト）', () => {
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/);
  assert.doesNotMatch(html, /\son[a-z]+=/i);
  assert.doesNotMatch(html, /\sstyle=/);
  assert.doesNotMatch(html, /type="module"/);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(scripts, ['js/theme-init.js', 'js/messages.js', 'js/i18n.js', 'js/pattern-core.js', 'js/theme.js', 'js/tabs.js', 'script.js']);
  for (const s of scripts.slice(1)) assert.match(html, new RegExp(`<script src="${s}" defer></script>`));
  for (const f of ['script.js', 'js/pattern-core.js', 'js/messages.js', 'js/theme.js', 'js/tabs.js', 'js/theme-init.js', 'js/i18n.js']) {
    const src = read(f);
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/, f);
    assert.doesNotMatch(src, /\.cssText|setAttribute\('style'|alert\(|confirm\(|prompt\(|Math\.random/, f);
  }
});

test('画面の要素の id がそろっている（それぞれ1つだけ）', () => {
  const ids = ['btnLang', 'btnTheme', 'pad', 'padCanvas', 'btnUndo', 'btnClear', 'showNumbers', 'patternInput', 'patternError', 'sequence', 'kNodes', 'kLength',
    'kIntersections', 'kOverlaps', 'kKnight', 'kStart', 'startMap', 'lengthBars', 'attackStatus', 'attackCards', 'reference', 'saveName', 'btnSave',
    'saveStatus', 'savedTable', 'savedEmpty', 'btnClearSaved', 'exampleGrid', 'learnBody', 'helpDialog', 'helpTitle', 'helpClose', 'confirmDialog',
    'confirmYes', 'confirmNo', 'tab-check', 'tab-examples', 'tab-learn', 'panel-check', 'panel-examples', 'panel-learn', 'compareA', 'compareB',
    'compareError', 'btnCopyA', 'compareSaved', 'compareStatus', 'compareTable', 'checklist', 'checklistStatus'];
  for (const id of ids) assert.equal(html.split(`id="${id}"`).length - 1, 1, id);
  const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(all).size, all.length);
});

test('ボタンには type、入力欄にはラベル、状態の表示は aria-live、外部リンクは noopener noreferrer', () => {
  for (const m of html.matchAll(/<button\b[^>]*>/g)) assert.match(m[0], /type="button"/, m[0]);
  for (const m of html.matchAll(/<input\b[^>]*id="([^"]+)"/g)) {
    if (m[1] === 'showNumbers') continue;
    assert.match(html, new RegExp(`<label[^>]* for="${m[1]}"`), m[1]);
  }
  assert.match(html, /<label class="check"><input type="checkbox" id="showNumbers" \/>/, 'チェックボックスは label の中');
  for (const id of ['patternError', 'sequence', 'attackStatus', 'saveStatus', 'compareError', 'compareStatus', 'checklistStatus']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*aria-live="polite"`), id);
  }
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="noopener noreferrer"/, m[0]);
  assert.match(html, /id="patternInput"[^>]*aria-describedby="patternError"/);
  assert.match(html, /id="compareB"[^>]*aria-describedby="compareError"/);
  assert.match(html, /<label class="inline-label" for="compareSaved"/);
});

test('タブは3つ（調べる・パターン例・座学）。タブとパネルが対応し、最初のタブだけが選ばれて見えている', () => {
  const { PatternTabs } = load('js/tabs.js');
  const tabRe = new RegExp('<button type="button" class="tab" role="tab" id="tab-(\\w+)" aria-controls="panel-(\\w+)" '
    + 'aria-selected="(\\w+)" tabindex="(-?\\d)" data-tab="(\\w+)">', 'g');
  const tabs = [...html.matchAll(tabRe)];
  assert.deepEqual(tabs.map((m) => m[1]), [...PatternTabs.NAMES]);
  for (const [, id, panel, selected, tabindex, name] of tabs) {
    assert.equal(panel, id);
    assert.equal(name, id);
    assert.equal(selected, String(id === 'check'));
    assert.equal(tabindex, id === 'check' ? '0' : '-1');
    const hidden = id === 'check' ? '' : ' hidden';
    assert.match(html, new RegExp(`<div class="tab-panel" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${hidden}>`), id);
  }
  assert.match(html, /<div class="tabs" role="tablist" aria-label="[^"]+" data-i18n-attr="aria-label:ui\.tabsLabel">/);
});

test('関連ツールは座学のタブに7本。Day の順に、公開ページへのリンク（新しいタブ）と日英の説明がある', () => {
  const { MESSAGES } = load('js/messages.js').PatternMessages;
  const panel = html.slice(html.indexOf('id="panel-learn"'), html.indexOf('<dialog'));
  assert.match(panel, /<section class="card" aria-labelledby="relatedHeading">/);
  const re = new RegExp('<a href="https://ipusiron\\.github\\.io/([a-z0-9-]+)/" target="_blank" rel="noopener noreferrer">Day(\\d{3}) [^<]+</a>\\s*'
    + '<span class="related-desc" data-i18n="ui\\.relatedDay(\\d{3})">', 'g');
  const items = [...panel.matchAll(re)];
  assert.deepEqual(items.map((m) => m[2]), ['001', '048', '060', '063', '073', '088', '089']);
  assert.equal(new Set(items.map((m) => m[1])).size, 7);
  for (const [, slug, day, key] of items) {
    assert.equal(key, day, slug);
    for (const lang of ['ja', 'en']) assert.ok(MESSAGES[lang][`ui.relatedDay${day}`], `${lang} ${day}`);
  }
  assert.equal((html.match(/class="related-desc"/g) || []).length, 7);
});

test('ヘルプの ? ボタンには、それぞれの話題がある。ヘルプと確認はダイアログ', () => {
  const helps = [...html.matchAll(/class="help-icon" data-help="(\w+)" aria-label="[^"]+"/g)].map((m) => m[1]);
  assert.deepEqual(helps, ['shape', 'attacks', 'compare']);
  for (const h of helps) assert.match(html, new RegExp(`data-help-topic="${h}" hidden`), h);
  assert.match(html, /<dialog id="helpDialog" class="help-dialog" aria-labelledby="helpTitle">/);
  assert.match(html, /<dialog id="confirmDialog" class="help-dialog" aria-labelledby="confirmTitle">/);
});
