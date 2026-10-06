import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.js';

const { PatternTabs } = load('js/tabs.js');

test('URL の #tab= か ?tab= から開くタブを読む（# を先に見る。知らない名前は null）', () => {
  assert.deepEqual([...PatternTabs.NAMES], ['check', 'examples', 'learn']);
  assert.equal(PatternTabs.fromUrl('?tab=examples', ''), 'examples');
  assert.equal(PatternTabs.fromUrl('', '#tab=learn'), 'learn');
  assert.equal(PatternTabs.fromUrl('?lang=ja&tab=learn', ''), 'learn');
  assert.equal(PatternTabs.fromUrl('?tab=examples', '#tab=check'), 'check');
  assert.equal(PatternTabs.fromUrl('?tab=examples', '#tab=unknown'), 'examples');
  assert.equal(PatternTabs.fromUrl('?tab=EXAMPLES', ''), null);
  assert.equal(PatternTabs.fromUrl('?tab=', ''), null);
  assert.equal(PatternTabs.fromUrl('', ''), null);
  assert.equal(PatternTabs.fromUrl(undefined, undefined), null);
});

test('左右の矢印キーは端で反対の端へ回る。Home・End は最初と最後。ほかのキーは null', () => {
  assert.equal(PatternTabs.nextIndex('ArrowRight', 0, 3), 1);
  assert.equal(PatternTabs.nextIndex('ArrowRight', 2, 3), 0);
  assert.equal(PatternTabs.nextIndex('ArrowLeft', 0, 3), 2);
  assert.equal(PatternTabs.nextIndex('Home', 2, 3), 0);
  assert.equal(PatternTabs.nextIndex('End', 0, 3), 2);
  for (const key of ['Enter', ' ', 'Tab', 'ArrowDown', 'ArrowUp']) assert.equal(PatternTabs.nextIndex(key, 1, 3), null, key);
});

// 画面の DOM の代わりに、タブとパネルの最小限の偽物を作る
function fakeDom(selected = 'check') {
  const panels = {};
  const focused = [];
  const tabs = PatternTabs.NAMES.map((name) => {
    panels[`panel-${name}`] = { hidden: name !== selected };
    const attrs = { 'aria-controls': `panel-${name}`, 'aria-selected': String(name === selected) };
    const handlers = {};
    return {
      dataset: { tab: name }, tabIndex: name === selected ? 0 : -1, handlers,
      getAttribute: (k) => attrs[k], setAttribute: (k, v) => { attrs[k] = v; },
      addEventListener: (type, fn) => { handlers[type] = fn; },
      focus() { focused.push(name); },
    };
  });
  const nav = { querySelectorAll: () => tabs, ownerDocument: { getElementById: (id) => panels[id] } };
  const key = (tab, k) => {
    const e = { key: k, prevented: false, preventDefault() { this.prevented = true; } };
    tab.handlers.keydown(e);
    return e.prevented;
  };
  return { nav, tabs, panels, focused, key };
}

const shown = (d) => Object.entries(d.panels).filter(([, p]) => !p.hidden).map(([id]) => id);

test('選んだタブだけが aria-selected=true・tabindex=0 になり、そのパネルだけが見える', () => {
  const d = fakeDom();
  const changes = [];
  const api = PatternTabs.init(d.nav, (name) => changes.push(name));
  assert.equal(api.current(), 'check');
  d.tabs[2].handlers.click();
  assert.equal(api.current(), 'learn');
  assert.deepEqual(shown(d), ['panel-learn']);
  assert.deepEqual(d.tabs.map((t) => t.tabIndex), [-1, -1, 0]);
  assert.deepEqual(d.focused, [], 'クリックではフォーカスを動かさない');
  api.select('examples');
  assert.deepEqual(shown(d), ['panel-examples']);
  api.select('nothing');
  assert.deepEqual(shown(d), ['panel-check'], '知らない名前は最初のタブ');
  assert.deepEqual(changes, ['check', 'learn', 'examples', 'check']);
});

test('キーで移るとフォーカスも移る。関係のないキー（Enter・Space・Tab）は奪わない', () => {
  const d = fakeDom();
  const api = PatternTabs.init(d.nav);
  assert.equal(d.key(d.tabs[0], 'ArrowLeft'), true);
  assert.equal(api.current(), 'learn');
  assert.equal(d.key(d.tabs[2], 'ArrowRight'), true);
  assert.equal(api.current(), 'check');
  assert.equal(d.key(d.tabs[0], 'End'), true);
  assert.equal(d.key(d.tabs[2], 'Home'), true);
  assert.deepEqual(d.focused, ['learn', 'check', 'learn', 'check']);
  for (const k of ['Enter', ' ', 'Tab']) assert.equal(d.key(d.tabs[0], k), false, k);
  assert.equal(api.current(), 'check');
});
