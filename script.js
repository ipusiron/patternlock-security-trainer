// PatternLock Security Trainer の画面（DOM だけを扱う）。計算は js/pattern-core.js、文言は js/messages.js
// 画面に入れる文字列はすべて textContent で入れる（HTML として解釈しない）
(function () {
  'use strict';

  const C = globalThis.PatternCore;
  const { t, getLanguage } = globalThis.PatternMessages;
  const $ = (id) => document.getElementById(id);
  const num = (n) => n.toLocaleString('en-US');
  const pct = (x) => (Math.floor(x * 1000) / 10).toFixed(1);

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) node.append(c);
    return node;
  }

  // ---- 状態 ----
  // pattern: いまのパターン、steps: 1手ごとに足した点の数（「1手戻す」で、自動で入った点ごと戻す）
  const state = { pattern: [], steps: [], drawing: false, pointer: null, statsReady: false };

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // 秒を、いちばん読みやすい単位にする
  const oneDecimal = (x) => String(Number(x.toFixed(1)));
  function duration(sec) {
    if (sec < 60) return t('dur.seconds', { n: Math.round(sec) });
    if (sec < 3600) return t('dur.minutes', { n: oneDecimal(sec / 60) });
    if (sec < 2 * 86400) return t('dur.hours', { n: oneDecimal(sec / 3600) });
    if (sec < 365 * 86400) return t('dur.days', { n: num(Math.round(sec / 86400)) });
    return t('dur.years', { n: oneDecimal(sec / (365 * 86400)) });
  }

  // 値の大きい順の順位（同じ値は同じ順位）
  const rankOf = (values, v) => values.filter((x) => x > v).length + 1;

  // ---- パッド ----
  const pad = $('pad');
  const canvas = $('padCanvas');
  const nodeButtons = [];

  function buildPad() {
    for (let i = 0; i < C.NODES; i++) {
      const [col, row] = C.xy(i);
      const b = el('button', { type: 'button', className: 'node', 'data-node': String(i), 'aria-pressed': 'false' }, [
        el('span', { className: 'node-num', text: String(i) }),
      ]);
      b.style.left = `${(col * 2 + 1) * (100 / 6)}%`;
      b.style.top = `${(row * 2 + 1) * (100 / 6)}%`;
      // キーボード（Enter・Space）で押したときだけ、点を順に足す。ポインターは pad 側で扱う
      b.addEventListener('click', (e) => {
        if (e.detail === 0) addNode(i);
      });
      nodeButtons.push(b);
      pad.append(b);
    }
    labelNodes();
  }

  function labelNodes() {
    nodeButtons.forEach((b, i) => b.setAttribute('aria-label', t('node.label', { n: i, pos: t(`pos.${i}`) })));
  }

  // pad の中の座標（CSS ピクセル）での点の中心
  function nodeCenter(i, w) {
    const [col, row] = C.xy(i);
    return [((col * 2 + 1) * w) / 6, ((row * 2 + 1) * w) / 6];
  }

  function hitNode(x, y) {
    const w = pad.clientWidth;
    const r = w * 0.11;
    for (let i = 0; i < C.NODES; i++) {
      const [cx, cy] = nodeCenter(i, w);
      if ((cx - x) ** 2 + (cy - y) ** 2 <= r * r) return i;
    }
    return -1;
  }

  function localXY(e) {
    const rect = pad.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function bindPad() {
    pad.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      state.drawing = true;
      state.fresh = true;
      pad.setPointerCapture(e.pointerId);
      e.preventDefault();
      track(e);
    });
    pad.addEventListener('pointermove', (e) => {
      if (state.drawing) track(e);
    });
    const end = () => {
      if (!state.drawing) return;
      state.drawing = false;
      state.pointer = null;
      drawPad();
    };
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
  }

  // なぞっている位置の点を足す。新しく押したときは、最初の点に触れた時点でパターンを描き直す（Android と同じ）
  function track(e) {
    const [x, y] = localXY(e);
    state.pointer = [x, y];
    const n = hitNode(x, y);
    if (n >= 0) {
      if (state.fresh) {
        state.fresh = false;
        state.pattern = [];
        state.steps = [];
      }
      addNode(n);
    }
    drawPad();
  }

  function addNode(n) {
    const added = C.extend(state.pattern, n);
    if (!added.length) return;
    state.steps.push(added.length);
    changed(true);
  }

  function setPattern(pattern) {
    state.pattern = pattern.slice();
    state.steps = pattern.map(() => 1);
    changed(true);
  }

  // パッド・ボタン・文字のどれから変えても、入力欄の文字を合わせて全体を描き直す
  function changed(syncInput) {
    if (syncInput !== false) {
      $('patternInput').value = C.format(state.pattern);
      $('patternError').textContent = '';
    }
    render();
  }

  function drawPad() {
    const w = pad.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, w);
    const p = state.pattern;
    ctx.strokeStyle = cssVar('--pad-line');
    ctx.lineWidth = Math.max(4, w * 0.02);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (p.length) {
      ctx.beginPath();
      const [sx, sy] = nodeCenter(p[0], w);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < p.length; i++) ctx.lineTo(...nodeCenter(p[i], w));
      if (state.drawing && state.pointer) ctx.lineTo(...state.pointer);
      ctx.stroke();
    }
    nodeButtons.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(p.includes(i)));
      b.classList.toggle('start', p[0] === i);
    });
  }

  // ---- 形の特徴と人の選び方 ----
  function buildBias() {
    const max = Math.max(...C.START_SHARE);
    $('startMap').replaceChildren(...C.START_SHARE.map((share, i) => {
      const fill = el('span', { className: 'start-fill' });
      fill.style.height = `${(share / max) * 100}%`;
      const label = el('span', { className: 'start-label', text: t('share.value', { n: share }) });
      return el('div', { className: 'start-cell', 'data-node': String(i) }, [fill, label]);
    }));
    const lmax = Math.max(...Object.values(C.LENGTH_SHARE));
    $('lengthBars').replaceChildren(...Object.entries(C.LENGTH_SHARE).map(([len, share]) => {
      const fill = el('span', { className: 'length-fill' });
      fill.style.width = `${(share / lmax) * 100}%`;
      return el('li', { 'data-length': len }, [
        el('span', { text: t('length.row', { n: len }) }), el('span', { className: 'length-track' }, [fill]),
        el('span', { className: 'value', text: t('share.value', { n: share }) }),
      ]);
    }));
  }

  function renderShape(f) {
    const p = state.pattern;
    const has = p.length > 0;
    $('kNodes').textContent = has ? String(f.nodes) : '—';
    $('kLength').textContent = p.length > 1 ? f.length.toFixed(2) : '—';
    $('kIntersections').textContent = has ? t('unit.times', { n: f.intersections }) : '—';
    $('kOverlaps').textContent = has ? t('unit.lines', { n: f.overlaps }) : '—';
    $('kKnight').textContent = has ? t('unit.times', { n: f.knightMoves }) : '—';
    $('kStart').textContent = has ? t('start.value', { n: p[0], cls: t(`start.${f.start}`) }) : '—';
    for (const cell of $('startMap').children) cell.classList.toggle('current', has && Number(cell.dataset.node) === p[0]);
    for (const li of $('lengthBars').children) li.classList.toggle('current', Number(li.dataset.length) === p.length);
    $('sequence').textContent = has ? t('seq.value', { seq: p.join(' → '), n: p.length }) : t('seq.none');
  }

  // ---- 攻撃ごとのカード ----
  const para = (text, className = '') => el('p', className ? { className, text } : { text });
  const card = (key, paras) => el('article', { className: 'attack-card' }, [el('h3', { text: t(`card.${key}.title`) }), ...paras]);

  function renderAttacks(f) {
    const p = state.pattern;
    const status = $('attackStatus');
    const cards = $('attackCards');
    const ref = $('reference');
    if (C.validate(p)) {
      status.textContent = t(p.length ? 'status.short' : 'status.empty');
      cards.replaceChildren();
      ref.replaceChildren();
      return;
    }
    if (!state.statsReady) {
      status.textContent = t('status.computing');
      return;
    }
    status.textContent = '';
    const F = C.FACTS;
    const startShare = C.START_SHARE[p[0]];
    const lengths = Object.values(C.LENGTH_SHARE);
    const lenShare = C.LENGTH_SHARE[p.length];
    const worst = C.shortestFirstWorst(p.length);
    const smudge = C.smudgeCandidates(p);
    const ps = C.sunScore(f);
    const cls = t(`sun.${C.sunClass(ps)}`);
    const total = num(C.stats().total);
    cards.replaceChildren(
      card('guess', [
        para(t('card.guess.start', { node: p[0], share: startShare, rank: rankOf(C.START_SHARE, startShare) }), 'value'),
        para(t('card.guess.length', { n: p.length, share: lenShare, rank: rankOf(lengths, lenShare) }), 'value'),
        para(t('card.guess.rate', { day: C.attemptsWithin(86400), week: C.attemptsWithin(7 * 86400) })),
        para(t('card.guess.paper', { guesses: F.aviv2015.guesses, share: F.aviv2015.share3 }), 'paper'),
      ]),
      card('brute', [
        para(t('card.brute.count', { n: p.length, count: num(C.stats().byLength[p.length]), worst: num(worst) }), 'value'),
        para(t('card.brute.time', { worst: num(worst), time: duration(C.waitBeforeAttempt(worst)) })),
        para(t('card.brute.legacy', { total }), 'paper'),
      ]),
      card('shoulder', [
        para(t('card.shoulder.length', { n: p.length }), 'value'),
        para(t('card.shoulder.paper', { withLines: F.aviv2017.withLines, withoutLines: F.aviv2017.withoutLines, pin: F.aviv2017.pin6 }), 'paper'),
        para(t('card.shoulder.tip')),
      ]),
      card('smudge', [
        para(t('card.smudge.points', { points: num(smudge.points) }), 'value'),
        para(t('card.smudge.lines', { lines: num(smudge.lines) }), 'value'),
        para(t('card.smudge.paper', { partial: F.aviv2010.partial, full: F.aviv2010.full }), 'paper'),
      ]),
      card('thermal', [
        f.overlaps
          ? para(t('card.thermal.some', { o: f.overlaps, seconds: F.abdelrahman2017.seconds, rate: F.abdelrahman2017.withOverlap }), 'value')
          : para(t('card.thermal.none', { seconds: F.abdelrahman2017.seconds, rate: F.abdelrahman2017.noOverlap }), 'value'),
      ]),
      card('video', [
        para(t('card.video.score', { ps: ps.toFixed(2), cls }), 'value'),
        para(t('card.video.paper', { attempts: F.ye2017.attempts, within: F.ye2017.within, complex: F.ye2017.complexFirst, simple: F.ye2017.simpleFirst }),
          'paper'),
      ]),
    );
    ref.replaceChildren(
      el('h3', { text: t('ref.title') }),
      para(t('ref.line', { ps: ps.toFixed(2), total, pct: pct(C.sunPercentile(ps)) })),
      para(t('ref.caveat'), 'note'),
    );
  }

  function render() {
    const f = C.features(state.pattern);
    drawPad();
    renderShape(f);
    renderAttacks(f);
    renderCompare();
  }

  // 全パターンの数え上げは重いので、最初の描画のあとに1回だけ行う
  function ensureStats() {
    if (state.statsReady) return;
    setTimeout(() => {
      C.stats();
      state.statsReady = true;
      render();
      renderSaved();
      if (examplesBuilt) renderExamples();
      if (learnBuilt || tabs.current() === 'learn') renderLearn();
      renderChecklist();
    }, 30);
  }

  // ---- 文字での入力 ----
  function errorText(r) {
    if (r.error === 'char') return t('err.char');
    if (r.error === 'repeat') return t('err.repeat', { n: r.repeated });
    if (r.error === 'short') return t('err.short', { n: r.pattern.length });
    return '';
  }

  function bindInput() {
    const input = $('patternInput');
    const apply = () => {
      const r = C.parse(input.value);
      const err = $('patternError');
      err.textContent = errorText(r);
      if (r.error === 'char' || r.error === 'repeat') return render();
      state.pattern = r.error === 'empty' ? [] : r.pattern;
      state.steps = state.pattern.map(() => 1);
      render();
    };
    input.addEventListener('input', (e) => {
      if (!e.isComposing) apply();
    });
    input.addEventListener('compositionend', apply);
    $('btnUndo').addEventListener('click', () => {
      if (!state.steps.length) return;
      state.pattern.splice(-state.steps.pop());
      changed(true);
    });
    $('btnClear').addEventListener('click', () => {
      state.pattern = [];
      state.steps = [];
      changed(true);
    });
    $('showNumbers').addEventListener('change', (e) => pad.classList.toggle('show-numbers', e.target.checked));
  }

  // ---- パターン例 ----
  let examplesBuilt = false;

  function drawMini(cv, pattern) {
    const w = 96;
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr;
    cv.height = w * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, w);
    const at = (i) => nodeCenter(i, w);
    ctx.strokeStyle = cssVar('--pad-line');
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(...at(pattern[0]));
    for (let i = 1; i < pattern.length; i++) ctx.lineTo(...at(pattern[i]));
    ctx.stroke();
    for (let i = 0; i < C.NODES; i++) {
      const [x, y] = at(i);
      ctx.beginPath();
      ctx.arc(x, y, i === pattern[0] ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pattern.includes(i) ? cssVar('--pad-line') : cssVar('--pad-ring');
      ctx.fill();
    }
  }

  function exampleVars(ex, f, smudge) {
    return {
      start: C.START_SHARE[ex.pattern[0]], len: C.LENGTH_SHARE[ex.pattern.length], n: ex.pattern.length, points: num(smudge.points),
      lines: num(smudge.lines), count: num(C.stats().byLength[4]), share: C.START_SHARE[ex.pattern[0]], max: C.sunScore(f).toFixed(3),
    };
  }

  function renderExamples() {
    examplesBuilt = true;
    const grid = $('exampleGrid');
    grid.replaceChildren(...C.EXAMPLES.map((ex) => {
      const f = C.features(ex.pattern);
      const cv = el('canvas', { 'aria-hidden': 'true' });
      drawMini(cv, ex.pattern);
      const title = t(`ex.${ex.id}.title`);
      const button = el('button', { type: 'button', className: 'secondary', text: t('ex.check'), 'aria-label': t('ex.checkLabel', { title }) });
      button.addEventListener('click', () => {
        setPattern(ex.pattern);
        tabs.select('check');
        $('drawHeading').scrollIntoView({ block: 'start' });
        $('patternInput').focus({ preventScroll: true });
      });
      const body = [el('h3', { text: title }), el('p', { className: 'mono', text: C.format(ex.pattern) })];
      if (state.statsReady) {
        const smudge = C.smudgeCandidates(ex.pattern);
        const ps = C.sunScore(f);
        body.push(el('p', { text: t(`ex.${ex.id}.lesson`, exampleVars(ex, f, smudge)) }));
        body.push(el('p', { className: 'values', text: t('ex.values', {
          n: f.nodes, share: C.START_SHARE[ex.pattern[0]], lines: num(smudge.lines), o: f.overlaps, ps: ps.toFixed(2), cls: t(`sun.${C.sunClass(ps)}`),
        }) }));
      } else {
        body.push(el('p', { className: 'note', text: t('status.computing') }));
      }
      body.push(button);
      return el('article', { className: 'example-card' }, [cv, el('div', {}, body)]);
    }));
  }

  // ---- 座学 ----
  // Gatekeeper の待ち時間を、同じ待ちが続く回数ごとにまとめる（140回目以降は毎回24時間）
  function gatekeeperRows() {
    const rows = [];
    for (let c = 1; c < 140; c++) {
      const ms = C.gatekeeperTimeoutMs(c);
      const last = rows[rows.length - 1];
      if (last && last.ms === ms) last.to = c;
      else rows.push({ from: c, to: c, ms });
    }
    rows.push({ from: 140, to: null, ms: C.gatekeeperTimeoutMs(140) });
    return rows;
  }

  // className に 'numbers' を足すと、数字だけの表として狭い画面でも表のまま出す（右寄せ）
  function table(headers, rows, className = '') {
    const head = el('tr', {}, headers.map((h) => el('th', { scope: 'col', text: h })));
    const cell = (c, i) => (i === 0 ? el('th', { scope: 'row', text: c }) : el('td', { 'data-label': headers[i], text: c }));
    const body = rows.map((cells) => el('tr', {}, cells.map(cell)));
    const cls = className ? `data-table ${className}` : 'data-table';
    return el('div', { className: 'table-wrap' }, [el('table', { className: cls }, [el('thead', {}, [head]), el('tbody', {}, body)])]);
  }

  function section(titleKey, children, open = false) {
    const d = el('details', { className: 'learn-section' }, [el('summary', {}, [el('h3', { text: t(titleKey) })]), ...children]);
    d.open = open;
    return d;
  }

  const list = (keys, vars = {}) => el('ul', { className: 'learn-list' }, keys.map((k) => el('li', { text: t(k, vars[k] || {}) })));

  function renderLearn() {
    if (!state.statsReady) {
      $('learnBody').replaceChildren(el('p', { className: 'note', text: t('status.computing') }));
      return;
    }
    const F = C.FACTS;
    const s = C.stats();
    const total = num(s.total);
    const lengths = Object.keys(s.byLength).map(Number);
    const uniqueShare = pct([...s.byLines.values()].filter((c) => c === 1).reduce((a, c) => a + c, 0) / s.total);
    // 4×4 の数え上げ（初回は数十ミリ秒。2回目からは計算部が覚えている）
    const g3 = C.gridCounts(3);
    const g4 = C.gridCounts(4);
    const bits = (n) => Math.log2(n).toFixed(2);
    const A = F.aviv2015;
    const gk = gatekeeperRows().map((r) => [
      r.to === null ? t('learn.andAfter', { n: r.from }) : r.from === r.to ? t('learn.single', { n: r.from }) : t('learn.range', { from: r.from, to: r.to }),
      r.ms ? duration(r.ms / 1000) : t('learn.noWait'),
    ]);
    const sources = el('ol', { className: 'sources' }, Object.keys(C.SOURCES).map((k) => el('li', {}, [
      el('a', { href: C.SOURCE_URLS[k], target: '_blank', rel: 'noopener noreferrer', text: C.SOURCES[k] }),
    ])));
    $('learnBody').replaceChildren(
      section('learn.basics.title', [
        para(t('learn.basics.p1')), para(t('learn.basics.p2')), para(t('learn.basics.p3', { total })),
        table([t('learn.colLength'), t('learn.colCount'), t('learn.colWorst')],
          lengths.map((l) => [t('length.row', { n: l }), num(s.byLength[l]), num(C.shortestFirstWorst(l))])),
      ], true),
      section('learn.device.title', [
        para(t('learn.device.p1', { day: C.attemptsWithin(86400), week: C.attemptsWithin(7 * 86400), month: C.attemptsWithin(30 * 86400) })),
        table([t('learn.colFailures'), t('learn.colWait')], gk),
        para(t('learn.device.p2')), para(t('learn.device.p3', { total })),
      ]),
      section('learn.people.title', [
        para(t('learn.people.loge', { ...F.loge, patterns: num(F.loge.patterns) })),
        para(t('learn.people.uellenbeck', { ...F.uellenbeck, g10: F.uellenbeck.guesses10, g30: F.uellenbeck.guesses30 })),
      ]),
      section('learn.grid.title', [
        para(t('learn.grid.p1', { total4: num(g4.total), total3: num(g3.total), bits3: bits(g3.total), bits4: bits(g4.total) })),
        para(t('learn.grid.p2')),
        table([t('learn.colLength'), t('learn.colGrid3'), t('learn.colGrid4')], [
          ...Object.keys(g4.byLength).map(Number).map((l) => [t('length.row', { n: l }),
            l in g3.byLength ? num(g3.byLength[l]) : t('learn.gridNone'), num(g4.byLength[l])]),
          [t('learn.gridTotal'), num(g3.total), num(g4.total)],
        ], 'numbers'),
        para(t('learn.grid.p3', { ...A, many: num(A.many) })),
        para(t('learn.grid.p4', A)),
      ]),
      section('learn.attacks.title', [
        para(t('learn.attacks.smudge', { ...F.aviv2010, unique: uniqueShare })),
        para(t('learn.attacks.shoulder', { withLines: F.aviv2017.withLines, withoutLines: F.aviv2017.withoutLines, pin: F.aviv2017.pin6 })),
        para(t('learn.attacks.video', { within: F.ye2017.within, complex: F.ye2017.complexFirst, simple: F.ye2017.simpleFirst })),
        para(t('learn.attacks.thermal', F.abdelrahman2017)),
      ]),
      section('learn.users.title', [list(['learn.users.l1', 'learn.users.l2', 'learn.users.l3', 'learn.users.l4', 'learn.users.l5', 'learn.users.l6',
        'learn.users.l7'], {
        'learn.users.l3': { withLines: F.aviv2017.withLines, withoutLines: F.aviv2017.withoutLines }, 'learn.users.l4': { pin: F.aviv2017.pin6 },
      })]),
      section('learn.devs.title', [list(['learn.devs.l1', 'learn.devs.l2', 'learn.devs.l3', 'learn.devs.l4', 'learn.devs.l5'], {
        'learn.devs.l3': { total }, 'learn.devs.l4': F.song2015,
      })]),
      section('learn.sources.title', [sources]),
    );
    learnBuilt = true;
  }
  let learnBuilt = false;

  // ---- 2つを比べる ----
  const compareState = { b: [] };

  function compareValue(key, v) {
    if (key === 'startShare' || key === 'lengthShare') return t('share.value', { n: v });
    if (key === 'waitSeconds') return duration(v);
    if (key === 'ps') return v.toFixed(2);
    return num(v);
  }

  function renderCompare() {
    $('compareA').textContent = state.pattern.length ? C.format(state.pattern) : t('compare.savedNone');
    const body = $('compareTable').querySelector('tbody');
    const status = $('compareStatus');
    if (!state.statsReady) {
      status.textContent = t('status.computing');
      body.replaceChildren();
      return;
    }
    const rows = C.compare(state.pattern, compareState.b);
    if (!rows) {
      status.textContent = t(C.validate(state.pattern) ? 'compare.needA' : 'compare.needB');
      body.replaceChildren();
      $('compareTable').hidden = true;
      return;
    }
    $('compareTable').hidden = false;
    const count = { a: 0, b: 0, same: 0 };
    for (const r of rows) if (r.winner) count[r.winner]++;
    status.textContent = t('compare.summary', count);
    const head = [t('ui.colItem'), 'A', 'B', t('ui.colWinner')];
    body.replaceChildren(...rows.map((r) => el('tr', { className: r.winner === 'a' || r.winner === 'b' ? `win-${r.winner}` : '' }, [
      el('th', { scope: 'row', text: t(`compare.${r.key}`) }),
      el('td', { 'data-label': head[1], text: compareValue(r.key, r.a) }),
      el('td', { 'data-label': head[2], text: compareValue(r.key, r.b) }),
      el('td', { 'data-label': head[3], text: t(`compare.winner.${r.winner || 'none'}`) }),
    ])));
  }

  function setCompareB(pattern) {
    compareState.b = pattern.slice();
    $('compareB').value = C.format(pattern);
    $('compareError').textContent = '';
    renderCompare();
  }

  function renderCompareSaved() {
    const select = $('compareSaved');
    const list = loadSaved();
    select.replaceChildren(el('option', { value: '', text: t('compare.savedNone') }),
      ...list.map((item, i) => el('option', { value: String(i), text: `${item.name} (${C.format(item.seq)})` })));
  }

  function bindCompare() {
    const input = $('compareB');
    const apply = () => {
      const r = C.parse(input.value);
      $('compareError').textContent = errorText(r);
      compareState.b = r.error === 'char' || r.error === 'repeat' ? [] : r.pattern;
      renderCompare();
    };
    input.addEventListener('input', (e) => {
      if (!e.isComposing) apply();
    });
    input.addEventListener('compositionend', apply);
    $('btnCopyA').addEventListener('click', () => {
      setCompareB(state.pattern);
      input.focus();
    });
    $('compareSaved').addEventListener('change', (e) => {
      const item = loadSaved()[Number(e.target.value)];
      if (item) setCompareB(item.seq);
    });
  }

  // ---- 端末の設定のチェックリスト（保存しない） ----
  const CHECKS = ['lines', 'length', 'start', 'pin', 'wipe', 'os', 'real'];

  function buildChecklist() {
    $('checklist').replaceChildren(...CHECKS.map((id) => {
      const box = el('input', { type: 'checkbox', id: `check-${id}` });
      box.addEventListener('change', renderChecklistStatus);
      return el('li', {}, [el('label', { className: 'check', for: `check-${id}` }, [box, el('span', { id: `check-${id}-text` })])]);
    }));
  }

  function renderChecklist() {
    const F = C.FACTS;
    const count4 = state.statsReady ? num(C.stats().byLength[4]) : '…';
    const vars = {
      lines: { withLines: F.aviv2017.withLines, withoutLines: F.aviv2017.withoutLines }, length: { count4 }, start: F.loge, pin: { pin: F.aviv2017.pin6 },
      wipe: { full: F.aviv2010.full, seconds: F.abdelrahman2017.seconds },
    };
    for (const id of CHECKS) $(`check-${id}-text`).textContent = t(`check.${id}`, vars[id] || {});
    renderChecklistStatus();
  }

  function renderChecklistStatus() {
    const done = CHECKS.filter((id) => $(`check-${id}`).checked).length;
    $('checklistStatus').textContent = t('check.status', { done, total: CHECKS.length });
  }

  // ---- 保存（localStorage。名前と点の並びだけ） ----
  const SAVE_KEY = 'patternlock-security-trainer-saved';
  const OLD_KEY = 'plst_saved';
  const MAX_NAME = 50;

  // 保存した値は信用しない: 名前は文字列で50字まで、点の並びは有効なパターンだけ
  function clean(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((x) => x && typeof x === 'object' && Array.isArray(x.seq) && C.validate(x.seq) === null)
      .map((x) => ({ name: String(x.name == null ? '' : x.name).slice(0, MAX_NAME), seq: x.seq.slice() }));
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return clean(JSON.parse(raw));
      // 旧版（plst_saved）の保存を1回だけ引き継ぐ
      const old = localStorage.getItem(OLD_KEY);
      if (old) {
        const list = clean(JSON.parse(old));
        localStorage.setItem(SAVE_KEY, JSON.stringify(list));
        localStorage.removeItem(OLD_KEY);
        return list;
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  function storeSaved(list) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderSaved() {
    const list = loadSaved();
    renderCompareSaved();
    const body = $('savedTable').querySelector('tbody');
    $('savedEmpty').hidden = list.length > 0;
    $('savedTable').hidden = list.length === 0;
    $('btnClearSaved').hidden = list.length === 0;
    body.replaceChildren(...list.map((item, idx) => {
      const f = C.features(item.seq);
      const ps = C.sunScore(f);
      const load = el('button', { type: 'button', className: 'secondary', text: t('save.load'), 'aria-label': t('save.loadLabel', { name: item.name }) });
      load.addEventListener('click', () => {
        setPattern(item.seq);
        $('saveStatus').textContent = t('save.loaded', { name: item.name });
        $('drawHeading').scrollIntoView({ block: 'start' });
      });
      const del = el('button', { type: 'button', className: 'secondary', text: t('save.delete'), 'aria-label': t('save.deleteLabel', { name: item.name }) });
      del.addEventListener('click', () => {
        const now = loadSaved();
        now.splice(idx, 1);
        storeSaved(now);
        $('saveStatus').textContent = t('save.deleted', { name: item.name });
        renderSaved();
      });
      const lines = state.statsReady ? num(C.smudgeCandidates(item.seq).lines) : '…';
      return el('tr', {}, [
        el('th', { scope: 'row', text: item.name }),
        el('td', { 'data-label': t('ui.colPattern'), className: 'mono', text: C.format(item.seq) }),
        el('td', { 'data-label': t('ui.colNodes'), text: String(f.nodes) }),
        el('td', { 'data-label': t('ui.colLines'), text: lines }),
        el('td', { 'data-label': t('ui.colSun'), text: t('sun.value', { ps: ps.toFixed(2), cls: t(`sun.${C.sunClass(ps)}`) }) }),
        el('td', { 'data-label': t('ui.colActions') }, [el('span', { className: 'actions' }, [load, del])]),
      ]);
    }));
  }

  function bindSave() {
    $('btnSave').addEventListener('click', () => {
      const status = $('saveStatus');
      if (C.validate(state.pattern)) {
        status.textContent = t('save.short');
        return;
      }
      const list = loadSaved();
      let name = $('saveName').value.trim().slice(0, MAX_NAME);
      if (!name) {
        const used = list.map((x) => {
          const m = /(\d+)$/.exec(x.name);
          return m ? Number(m[1]) : 0;
        });
        name = t('save.defaultName', { n: Math.max(0, ...used) + 1 });
      }
      list.push({ name, seq: state.pattern.slice() });
      if (!storeSaved(list)) {
        status.textContent = t('save.failed');
        return;
      }
      $('saveName').value = '';
      status.textContent = t('save.saved', { name });
      renderSaved();
    });
    const dialog = $('confirmDialog');
    $('btnClearSaved').addEventListener('click', () => {
      dialog.showModal();
      $('confirmNo').focus();
    });
    $('confirmNo').addEventListener('click', () => dialog.close());
    $('confirmYes').addEventListener('click', () => {
      storeSaved([]);
      dialog.close();
      $('saveStatus').textContent = t('save.cleared');
      renderSaved();
    });
    dialog.addEventListener('close', () => ($('btnClearSaved').hidden ? $('saveName') : $('btnClearSaved')).focus());
  }

  // ---- ヘルプ（dialog）。? ボタンの話題だけを見せ、閉じたら押したボタンへフォーカスを戻す ----
  function initHelp() {
    const dialog = $('helpDialog');
    let opener = null;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.help-icon');
      if (!btn) return;
      for (const topic of dialog.querySelectorAll('.help-topic')) topic.hidden = topic.dataset.helpTopic !== btn.dataset.help;
      $('helpTitle').textContent = btn.getAttribute('aria-label');
      opener = btn;
      dialog.showModal();
      $('helpClose').focus();
    });
    $('helpClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (opener) opener.focus();
    });
  }

  // ---- 言語（日本語・英語） ----
  // 切り替えたら、静的な文言を差し替え、入力と状態はそのままで全体を描き直す
  function relabel() {
    globalThis.PatternTheme.refresh($('btnTheme'), t);
    labelNodes();
    buildBias();
    render();
    renderSaved();
    if (examplesBuilt) renderExamples();
    if (learnBuilt) renderLearn();
    renderChecklist();
    for (const [inputId, errId] of [['patternInput', 'patternError'], ['compareB', 'compareError']]) {
      const v = $(inputId).value;
      $(errId).textContent = v.trim() ? errorText(C.parse(v)) : '';
    }
    $('saveStatus').textContent = '';
  }

  function initLanguage() {
    const I18N = globalThis.PatternI18n;
    const nav = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    I18N.use(I18N.initialLanguage(location.search, I18N.readSaved(), nav), document);
    $('btnLang').addEventListener('click', () => {
      const next = getLanguage() === 'ja' ? 'en' : 'ja';
      I18N.use(next, document);
      I18N.save(next);
      relabel();
    });
  }

  // ---- タブ ----
  let tabs = null;
  function initTabs() {
    const TT = globalThis.PatternTabs;
    tabs = TT.init(document.querySelector('.tabs'), (name) => {
      if (name === 'examples') renderExamples();
      if (name === 'learn') renderLearn();
    });
    const first = TT.fromUrl(location.search, location.hash);
    if (first) tabs.select(first);
  }

  initLanguage();
  buildPad();
  bindPad();
  buildBias();
  bindInput();
  bindSave();
  bindCompare();
  buildChecklist();
  renderChecklist();
  initHelp();
  initTabs();
  globalThis.PatternTheme.init($('btnTheme'), t, () => {
    drawPad();
    if (examplesBuilt) renderExamples();
  });
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => drawPad()).observe(pad);
  render();
  renderSaved();
  ensureStats();
  document.documentElement.setAttribute('data-ready', 'true');
})();
