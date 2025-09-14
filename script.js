/* PatternLock Security Trainer
 * Do NOT enter your real unlock pattern.
 * Android-like rules: 3x3 grid, no repeated nodes, auto-include middle node if skipped.
 *
 * Security measures:
 * - No network communication
 * - No automatic data storage
 * - Client-side only processing
 */

'use strict';

const pad = document.getElementById('pad');
const ctx = pad.getContext('2d');
const heat = document.getElementById('heat');
const htx = heat.getContext('2d');
const radarChart = document.getElementById('radarChart');
const radarCtx = radarChart.getContext('2d');

const showIdxEl = document.getElementById('showIdx');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');

const kLen = document.getElementById('kLen');
const kTurns = document.getElementById('kTurns');
const kXings = document.getElementById('kXings');
const kAngVar = document.getElementById('kAngVar');
const kStart = document.getElementById('kStart');
const kSym = document.getElementById('kSym');
const patternText = document.getElementById('patternText');

const scoreBar = document.getElementById('scoreBar');
const scoreVal = document.getElementById('scoreVal');
const scoreWord = document.getElementById('scoreWord');

const speedSel = document.getElementById('speedSel');
const guessTries = document.getElementById('guessTries');
const eta = document.getElementById('eta');

const wLen = document.getElementById('wLen');
const wTurn = document.getElementById('wTurn');
const wX = document.getElementById('wX');
const wAng = document.getElementById('wAng');
const wStart = document.getElementById('wStart');
const wSym = document.getElementById('wSym');
const weightEls = [wLen, wTurn, wX, wAng, wStart, wSym];
const wLenV = document.getElementById('wLenV');
const wTurnV = document.getElementById('wTurnV');
const wXV = document.getElementById('wXV');
const wAngV = document.getElementById('wAngV');
const wStartV = document.getElementById('wStartV');
const wSymV = document.getElementById('wSymV');
const resetWeights = document.getElementById('resetWeights');

const saveName = document.getElementById('saveName');
const saveBtn = document.getElementById('saveBtn');
const savedList = document.getElementById('savedList');
const clearAllBtn = document.getElementById('clearAllBtn');

// ---- Grid geometry ----
const GRID = 3;
const nodes = Array.from({ length: 9 }, (_, i) => ({
  idx: i,
  col: i % GRID,
  row: Math.floor(i / GRID),
}));

function nodeCenter(idx) {
  const margin = 40;
  const cell = (pad.width - margin * 2) / (GRID - 1);
  const col = idx % GRID;
  const row = Math.floor(idx / GRID);
  return [margin + col * cell, margin + row * cell];
}

// Pairs that require a middle node (Android rule)
const middleMap = new Map();
// Straight lines
middleMap.set(key(0,2), 1); middleMap.set(key(2,0), 1);
middleMap.set(key(3,5), 4); middleMap.set(key(5,3), 4);
middleMap.set(key(6,8), 7); middleMap.set(key(8,6), 7);
middleMap.set(key(0,6), 3); middleMap.set(key(6,0), 3);
middleMap.set(key(1,7), 4); middleMap.set(key(7,1), 4);
middleMap.set(key(2,8), 5); middleMap.set(key(8,2), 5);
// Diagonals
middleMap.set(key(0,8), 4); middleMap.set(key(8,0), 4);
middleMap.set(key(2,6), 4); middleMap.set(key(6,2), 4);

function key(a,b){ return `${a}-${b}`; }

// ---- Input handling ----
let pattern = [];       // array of node indices in order
let drawing = false;

function nearestNode(x, y) {
  // Returns nearest node idx if within radius
  let best = -1, bestD = Infinity;
  nodes.forEach(n => {
    const [cx, cy] = nodeCenter(n.idx);
    const d2 = (cx - x) ** 2 + (cy - y) ** 2;
    if (d2 < bestD) { bestD = d2; best = n.idx; }
  });
  const r = 28 ** 2; // hit radius^2
  return bestD <= r ? best : -1;
}

function addNodeToPattern(nextIdx) {
  if (nextIdx < 0) return;
  if (pattern.length === 0) {
    pattern.push(nextIdx);
    redraw();
    evaluate();
    return;
  }
  const last = pattern[pattern.length - 1];
  if (last === nextIdx) return;
  if (pattern.includes(nextIdx)) return; // no repeats

  const mid = middleMap.get(key(last, nextIdx));
  if (mid != null && !pattern.includes(mid)) {
    pattern.push(mid);
  }
  if (!pattern.includes(nextIdx)) {
    pattern.push(nextIdx);
  }
  redraw();
  evaluate();
}

function onPointerStart(e) {
  drawing = true;
  const pos = getXY(e);
  addNodeToPattern(nearestNode(pos.x, pos.y));
}
function onPointerMove(e) {
  if (!drawing) return;
  const pos = getXY(e);
  addNodeToPattern(nearestNode(pos.x, pos.y));
}
function onPointerEnd() {
  drawing = false;
}

function getXY(e) {
  const rect = pad.getBoundingClientRect();
  const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  const scaleX = pad.width / rect.width;
  const scaleY = pad.height / rect.height;
  return { x: px * scaleX, y: py * scaleY };
}

pad.addEventListener('pointerdown', onPointerStart);
pad.addEventListener('pointermove', onPointerMove);
pad.addEventListener('pointerup', onPointerEnd);
pad.addEventListener('pointerleave', onPointerEnd);
pad.addEventListener('touchstart', e => { onPointerStart(e); e.preventDefault(); }, { passive: false });
pad.addEventListener('touchmove', e => { onPointerMove(e); e.preventDefault(); }, { passive: false });
pad.addEventListener('touchend', e => { onPointerEnd(e); e.preventDefault(); }, { passive: false });

undoBtn.addEventListener('click', () => {
  pattern.pop();
  redraw(); evaluate();
});
clearBtn.addEventListener('click', () => {
  pattern = [];
  redraw(); evaluate();
});

showIdxEl.addEventListener('change', redraw);

// ---- Drawing ----
function redraw() {
  ctx.clearRect(0,0,pad.width,pad.height);

  const themeColors = getThemeColors();

  // grid dots
  for (let i=0;i<9;i++){
    const [x,y] = nodeCenter(i);
    ctx.fillStyle = themeColors.nodeOuter;
    ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = themeColors.heatmapStroke;
    ctx.lineWidth = 2; ctx.stroke();

    // inner dot
    ctx.fillStyle = themeColors.nodeInner;
    ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();

    if (showIdxEl.checked) {
      // Text with appropriate contrast - no background circle needed
      ctx.fillStyle = themeColors.nodeText;
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), x, y-8);
      ctx.textAlign = 'start'; // reset
    }
  }

  // lines
  if (pattern.length >= 2) {
    ctx.strokeStyle = themeColors.lineColor;
    ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath();
    const [sx, sy] = nodeCenter(pattern[0]);
    ctx.moveTo(sx, sy);
    for (let i=1;i<pattern.length;i++){
      const [x,y] = nodeCenter(pattern[i]);
      ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  // selected nodes highlight
  pattern.forEach(idx => {
    const [x,y] = nodeCenter(idx);
    ctx.fillStyle = '#3aa0ff';
    ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#99c6ff';
    ctx.lineWidth = 2; ctx.stroke();
  });
}

// ---- Analytics ----
function vec(a, b) {
  const [ax, ay] = nodeCenter(a);
  const [bx, by] = nodeCenter(b);
  return [bx-ax, by-ay];
}
function dot([ax,ay],[bx,by]){ return ax*bx + ay*by; }
function norm([ax,ay]){ return Math.hypot(ax,ay) || 1; }
function angleBetween(u, v) {
  const d = dot(u,v) / (norm(u)*norm(v));
  const c = Math.min(1, Math.max(-1, d));
  return Math.acos(c); // [0, π]
}
function isCorner(idx){ return [0,2,6,8].includes(idx); }
function isEdge(idx){ return [1,3,5,7].includes(idx); }
function isCenter(idx){ return idx===4; }

function countTurns(seq){
  if (seq.length < 3) return 0;
  let turns = 0;
  for (let i=0;i<seq.length-2;i++){
    const u = vec(seq[i], seq[i+1]);
    const v = vec(seq[i+1], seq[i+2]);
    const ang = angleBetween(u,v);
    if (ang > Math.PI/18) turns++; // >10°
  }
  return turns;
}

function angleVariance(seq){
  if (seq.length < 3) return 0;
  const angles = [];
  for (let i=0;i<seq.length-2;i++){
    const u = vec(seq[i], seq[i+1]);
    const v = vec(seq[i+1], seq[i+2]);
    angles.push(angleBetween(u,v));
  }
  const m = angles.reduce((a,b)=>a+b,0)/angles.length;
  const v = angles.reduce((s,a)=>s+(a-m)*(a-m),0)/angles.length;
  return v;
}

function intersects(a,b,c,d){
  // Generic segment intersection excluding shared endpoints
  const [a1x,a1y] = nodeCenter(a);
  const [a2x,a2y] = nodeCenter(b);
  const [b1x,b1y] = nodeCenter(c);
  const [b2x,b2y] = nodeCenter(d);

  function ccw(ax,ay,bx,by,cx,cy){ return (cy-ay)*(bx-ax) > (by-ay)*(cx-ax); }
  if (a===c||a===d||b===c||b===d) return false;

  const A = ccw(a1x,a1y,b1x,b1y,b2x,b2y);
  const B = ccw(a2x,a2y,b1x,b1y,b2x,b2y);
  const C = ccw(a1x,a1y,a2x,a2y,b1x,b1y);
  const D = ccw(a1x,a1y,a2x,a2y,b2x,b2y);
  return (A !== B) && (C !== D);
}

function countIntersections(seq){
  if (seq.length < 4) return 0;
  let count = 0;
  for (let i=0;i<seq.length-1;i++){
    for (let j=i+2;j<seq.length-1;j++){
      if (i===0 && j===seq.length-2) continue; // skip first-last adjacency
      const a = seq[i], b = seq[i+1], c = seq[j], d = seq[j+1];
      if (intersects(a,b,c,d)) count++;
    }
  }
  return count;
}

function symmetryScore(seq){
  // Reflection checks
  const mapH = new Map([[0,2],[1,1],[2,0],[3,5],[4,4],[5,3],[6,8],[7,7],[8,6]]);
  const mapV = new Map([[0,6],[1,7],[2,8],[3,3],[4,4],[5,5],[6,0],[7,1],[8,2]]);
  const mapD1= new Map([[0,0],[1,3],[2,6],[3,1],[4,4],[5,7],[6,2],[7,5],[8,8]]);
  const mapD2= new Map([[0,8],[1,5],[2,2],[3,7],[4,4],[5,1],[6,6],[7,3],[8,0]]);

  function reflEqual(map){
    const r = seq.map(i => map.get(i));
    return arraysEqual(seq, r) || arraysEqual(seq, r.slice().reverse());
  }
  return (reflEqual(mapH)||reflEqual(mapV)||reflEqual(mapD1)||reflEqual(mapD2)) ? -1 : 0;
}

function arraysEqual(a,b){
  if (a.length !== b.length) return false;
  for (let i=0;i<a.length;i++) if (a[i]!==b[i]) return false;
  return true;
}

function startClass(idx){
  if (isCenter(idx)) return '中央';
  if (isCorner(idx)) return '角';
  if (isEdge(idx)) return '辺';
  return 'unknown';
}

// ---- Scoring model ----
function computeScore(features, weights){
  // より寛容な正規化（より高いスコアが出やすく）
  const lenNorm = Math.max(0, Math.min(1, (features.length - 4) / 5));
  const turnNorm = Math.max(0, Math.min(1, features.turns / 6)); // 6ターンで満点に
  const xNorm = Math.max(0, Math.min(1, features.intersections / 3)); // 3交差で満点に
  const angNorm = Math.max(0, Math.min(1, features.angleVar / 2.0)); // より低い閾値
  const startPen = (features.start === '角') ? 1 : (features.start === '辺' ? 0.6 : 0);
  const symPen = (features.symmetry < 0) ? 1 : 0;

  const { wLen, wTurn, wX, wAng, wStart, wSym } = weights;

  // ベーススコアを30に設定（基本的な4点パターンでも30点）
  const baseScore = 30;
  const bonusPoints =
    (wLen * lenNorm * 25) +      // 長さボーナス: 最大25点
    (wTurn * turnNorm * 20) +    // ターンボーナス: 最大20点
    (wX * xNorm * 20) +          // 交差ボーナス: 最大20点
    (wAng * angNorm * 15);       // 角度多様性: 最大15点

  const penalties =
    (wStart * startPen * 10) +   // 開始点ペナルティ: 最大-10点
    (wSym * symPen * 10);        // 対称性ペナルティ: 最大-10点

  let finalScore = baseScore + bonusPoints - penalties;
  finalScore = Math.max(5, Math.min(100, Math.round(finalScore))); // 最低5点保証
  return finalScore;
}

function estimateTries(score){
  const minExp = 1, maxExp = 8;
  const exp = minExp + (score/100)*(maxExp - minExp);
  return Math.round(10 ** exp);
}
function fmtInt(n){ return n.toLocaleString('en-US'); }
function fmtETA(tries, perSec){
  const sec = tries / perSec;
  if (sec < 60) return `${sec.toFixed(1)}秒`;
  const m = Math.floor(sec/60);
  const s = Math.round(sec%60);
  if (m < 60) return `${m}分 ${s}秒`;
  const h = Math.floor(m/60); const mm = m%60;
  if (h < 48) return `${h}時間 ${mm}分`;
  const d = Math.floor(h/24);
  return `${d}日 ${h%24}時間`;
}

// ---- Radar Chart ----
function drawRadarChart(features) {
  const canvas = radarChart;
  const ctx = radarCtx;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 50; // ラベル用のマージンを増加

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get theme colors
  const themeColors = getThemeColors();

  // Check if pattern exists
  const hasPattern = features.length > 0;

  // Data points (normalized to 0-1)
  const data = [
    hasPattern ? Math.max(0, Math.min(1, (features.length - 4) / 5)) : 0, // Length
    hasPattern ? Math.max(0, Math.min(1, features.turns / 6)) : 0, // Turns
    hasPattern ? Math.max(0, Math.min(1, features.intersections / 3)) : 0, // Intersections
    hasPattern ? Math.max(0, Math.min(1, features.angleVar / 2)) : 0, // Angle Var
    hasPattern ? (features.start === '中央' ? 1 : (features.start === '辺' ? 0.6 : (features.start === '角' ? 0.3 : 0))) : 0, // Start
    hasPattern ? (features.symmetry >= 0 ? 0.2 : 0.8) : 0 // Symmetry
  ];

  const labels = ['長さ', 'ターン数', '交差数', '角度多様性', '開始点', '対称性'];
  const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];

  // Draw grid circles
  ctx.strokeStyle = themeColors.radarGrid;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw axes
  const angleStep = (Math.PI * 2) / data.length;
  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Draw labels between outermost and second ring
    const labelDistance = radius + (radius / 5) * 0.5; // 外周と4番目の円の中間
    const labelX = centerX + Math.cos(angle) * labelDistance;
    const labelY = centerY + Math.sin(angle) * labelDistance;

    ctx.fillStyle = colors[i];
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add background for better readability
    const textMetrics = ctx.measureText(labels[i]);
    const bgWidth = textMetrics.width + 4;
    const bgHeight = 12;

    ctx.fillStyle = themeColors.radarLabelBg;
    ctx.fillRect(labelX - bgWidth/2, labelY - bgHeight/2, bgWidth, bgHeight);

    ctx.fillStyle = themeColors.radarLabelText;
    ctx.fillText(labels[i], labelX, labelY);
  }

  // Draw data polygon only if pattern exists
  if (hasPattern && data.some(d => d > 0)) {
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const distance = data[i] * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Fill
    ctx.fillStyle = 'rgba(110, 168, 254, 0.2)';
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#6ea8fe';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const distance = data[i] * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ---- Heatmap ----
function drawHeat(seq){
  htx.clearRect(0,0,heat.width,heat.height);
  const counts = Array(9).fill(0);
  seq.forEach(i => counts[i]++);
  const max = Math.max(1, ...counts);
  for (let i=0;i<9;i++){
    const x = (i%3), y = Math.floor(i/3);
    const cw = heat.width/3, ch = heat.height/3;
    const alpha = counts[i]/max;
    htx.fillStyle = `rgba(52,199,89,${alpha*0.85})`;
    htx.fillRect(x*cw, y*ch, cw-2, ch-2);

    const themeColors = getThemeColors();
    htx.strokeStyle = themeColors.heatmapStroke;
    htx.lineWidth = 1;
    htx.strokeRect(x*cw+0.5, y*ch+0.5, cw-1, ch-1);
  }
}

// ---- Evaluate current pattern ----
function evaluate(){
  patternText.textContent = pattern.length ? `\u30b7\u30fc\u30b1\u30f3\u30b9: [ ${pattern.join(' → ')} ]` : '\u30b7\u30fc\u30b1\u30f3\u30b9: –';

  const features = {
    length: pattern.length,
    turns: countTurns(pattern),
    intersections: countIntersections(pattern),
    angleVar: angleVariance(pattern),
    start: pattern.length ? startClass(pattern[0]) : '–',
    symmetry: pattern.length ? symmetryScore(pattern) : 0,
  };

  kLen.textContent = features.length || '–';
  kTurns.textContent = features.turns || 0;
  kXings.textContent = features.intersections || 0;
  kAngVar.textContent = features.angleVar ? features.angleVar.toFixed(2) : '0.00';
  kStart.textContent = features.start;
  kSym.textContent = (features.symmetry < 0) ? 'High' : 'Low';

  const weights = {
    wLen: parseFloat(wLen.value),
    wTurn: parseFloat(wTurn.value),
    wX: parseFloat(wX.value),
    wAng: parseFloat(wAng.value),
    wStart: parseFloat(wStart.value),
    wSym: parseFloat(wSym.value),
  };
  const score = (features.length >= 4) ? computeScore(features, weights) : 0;
  scoreVal.textContent = String(score);

  let word = '非常に弱い', cls = 'score-weak';
  if (score >= 75) { word = '強い'; cls = 'score-strong'; }
  else if (score >= 50) { word = '普通'; cls = 'score-med'; }
  else if (score >= 25) { word = '弱い'; cls = 'score-weak'; }
  scoreWord.textContent = word;
  scoreWord.className = cls;

  const fill = scoreBar.querySelector('.fill');
  if (fill) fill.style.width = `${score}%`;

  if (features.length >= 4){
    const tries = estimateTries(score);
    guessTries.textContent = fmtInt(tries);
    const perSec = parseInt(speedSel.value, 10);
    eta.textContent = fmtETA(tries, perSec);
  } else {
    guessTries.textContent = '–';
    eta.textContent = '–';
  }

  drawRadarChart(features);
  drawHeat(pattern);
}

// reflect range values
function syncWeightLabels(){
  wLenV.textContent = wLen.value;
  wTurnV.textContent = wTurn.value;
  wXV.textContent = wX.value;
  wAngV.textContent = wAng.value;
  wStartV.textContent = wStart.value;
  wSymV.textContent = wSym.value;
}
weightEls.forEach(el => el.addEventListener('input', () => { syncWeightLabels(); evaluate(); }));
resetWeights.addEventListener('click', () => {
  wLen.value = 1.0; wTurn.value = 1.0; wX.value = 1.0; wAng.value = 1.0; wStart.value = -1.0; wSym.value = -1.0;
  syncWeightLabels(); evaluate();
});
speedSel.addEventListener('change', evaluate);

// ---- Save (localStorage only) ----
const LS_KEY = 'plst_saved';
function loadSaved(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveSaved(arr){
  try {
    // セキュリティ検証：保存するデータのサニタイゼーション
    const sanitizedArr = arr.map(item => ({
      name: String(item.name || '').slice(0, 50), // 最大50文字
      seq: Array.isArray(item.seq) ? item.seq.filter(n => Number.isInteger(n) && n >= 0 && n <= 8) : [],
      len: Number.isInteger(item.len) && item.len >= 4 && item.len <= 9 ? item.len : 0,
      score: Number.isFinite(item.score) && item.score >= 0 && item.score <= 100 ? item.score : 0
    })).filter(item => item.seq.length >= 4); // 有効なパターンのみ保存

    localStorage.setItem(LS_KEY, JSON.stringify(sanitizedArr));
  } catch (e) {
    console.warn('Failed to save pattern data:', e.message);
  }
}
function renderSaved(){
  const data = loadSaved();
  savedList.innerHTML = '';
  if (!data.length){
    const p = document.createElement('p');
    p.className = 'small'; p.textContent = '\u4fdd\u5b58\u3055\u308c\u305f\u30d1\u30bf\u30fc\u30f3\u306f\u3042\u308a\u307e\u305b\u3093';
    savedList.appendChild(p);
    return;
  }
  data.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'saved-item';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.name;
    const meta = document.createElement('div');
    meta.className = 'meta mono';
    meta.textContent = `\u9577\u3055=${item.len} \u30b9\u30b3\u30a2=${item.score}`;

    const btns = document.createElement('div');
    const loadB = document.createElement('button');
    loadB.className = 'btn btn-secondary';
    loadB.textContent = '読み込み';
    loadB.onclick = () => {
      pattern = item.seq.slice();
      redraw(); evaluate();
    };
    const delB = document.createElement('button');
    delB.className = 'btn btn-secondary';
    delB.textContent = '削除';
    delB.onclick = () => {
      const now = loadSaved();
      now.splice(idx,1);
      saveSaved(now);
      renderSaved();
    };
    btns.appendChild(loadB);
    btns.appendChild(delB);

    row.appendChild(title);
    row.appendChild(meta);
    row.appendChild(btns);
    savedList.appendChild(row);
  });
}

saveBtn.addEventListener('click', () => {
  if (pattern.length < 4) { alert('\u30d1\u30bf\u30fc\u30f3\u306f4\u70b9\u4ee5\u4e0a\u5fc5\u8981\u3067\u3059'); return; }
  let name = (saveName.value || '').trim();
  if (!name) {
    const data = loadSaved();
    const existingNumbers = data
      .map(item => {
        const match = item.name && item.name.match(/^パターン\s*(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : data.length + 1;
    name = `パターン ${nextNumber}`;
  }
  const features = {
    length: pattern.length,
    turns: countTurns(pattern),
    intersections: countIntersections(pattern),
    angleVar: angleVariance(pattern),
    start: pattern.length ? startClass(pattern[0]) : '–',
    symmetry: pattern.length ? symmetryScore(pattern) : 0,
  };
  const weights = {
    wLen: parseFloat(wLen.value),
    wTurn: parseFloat(wTurn.value),
    wX: parseFloat(wX.value),
    wAng: parseFloat(wAng.value),
    wStart: parseFloat(wStart.value),
    wSym: parseFloat(wSym.value),
  };
  const score = computeScore(features, weights);
  const data = loadSaved();
  data.push({ name, seq: pattern.slice(), len: pattern.length, score });
  saveSaved(data);
  saveName.value = '';
  renderSaved();
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('保存されたすべてのパターンを削除しますか？')) {
    localStorage.removeItem(LS_KEY);
    renderSaved();
  }
});

// ---- Init ----
function init(){
  // メータの塗りつぶし用レイヤーを生成
  if (!scoreBar.querySelector('.fill')){
    const fill = document.createElement('div');
    fill.className = 'fill';
    scoreBar.insertBefore(fill, scoreBar.firstChild);
  }

  syncWeightLabels();
  redraw();
  evaluate();
  renderSaved();
}

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    // Update active button
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide tab contents
    tabContents.forEach(content => {
      if (content.id === `${targetTab}-tab`) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });

    // If switching to examples tab, draw the example patterns
    if (targetTab === 'examples') {
      drawExamplePatterns();
    }
  });
});

// Draw example patterns on mini canvases - completely redesigned
function drawExamplePatterns() {
  const miniPads = document.querySelectorAll('.mini-pad');

  miniPads.forEach(canvas => {
    const patternStr = canvas.dataset.pattern;
    if (!patternStr) return;

    const pattern = patternStr.split(',').map(n => parseInt(n));
    const ctx = canvas.getContext('2d');

    // Canvas settings
    const width = 90;
    const height = 90;
    canvas.width = width;
    canvas.height = height;

    const margin = 15;
    const gridSize = width - margin * 2;
    const cellSize = gridSize / 2; // For 3x3 grid, we need 2 intervals

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get node position (0-8 to x,y coordinates)
    function getNodePosition(idx) {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      return {
        x: margin + col * cellSize,
        y: margin + row * cellSize
      };
    }

    // Apply Android pattern rules (middle node insertion)
    function expandPatternWithMiddleNodes(inputPattern) {
      if (inputPattern.length < 2) return inputPattern;

      const expanded = [inputPattern[0]];
      const used = new Set([inputPattern[0]]);

      for (let i = 1; i < inputPattern.length; i++) {
        const prev = inputPattern[i-1];
        const curr = inputPattern[i];

        // Calculate if there's a middle node that should be auto-inserted
        const prevPos = getNodePosition(prev);
        const currPos = getNodePosition(curr);

        // Find middle node if skipping across one
        const midCol = Math.round((prevPos.x + currPos.x) / 2);
        const midRow = Math.round((prevPos.y + currPos.y) / 2);

        // Convert back to index
        const midX = (midCol - margin) / cellSize;
        const midY = (midRow - margin) / cellSize;

        if (Number.isInteger(midX) && Number.isInteger(midY) &&
            midX >= 0 && midX <= 2 && midY >= 0 && midY <= 2) {
          const midIdx = midY * 3 + midX;
          if (midIdx !== prev && midIdx !== curr && !used.has(midIdx)) {
            expanded.push(midIdx);
            used.add(midIdx);
          }
        }

        expanded.push(curr);
        used.add(curr);
      }

      return expanded;
    }

    const expandedPattern = expandPatternWithMiddleNodes(pattern);

    // 1. Draw grid dots (all 9 positions)
    const themeColors = getThemeColors();
    for (let i = 0; i < 9; i++) {
      const pos = getNodePosition(i);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = themeColors.gridDot;
      ctx.fill();
      ctx.strokeStyle = themeColors.gridDotStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Draw pattern lines
    if (expandedPattern.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#6ea8fe';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const startPos = getNodePosition(expandedPattern[0]);
      ctx.moveTo(startPos.x, startPos.y);

      for (let i = 1; i < expandedPattern.length; i++) {
        const pos = getNodePosition(expandedPattern[i]);
        ctx.lineTo(pos.x, pos.y);
      }

      ctx.stroke();
    }

    // 3. Draw active nodes (pattern nodes)
    expandedPattern.forEach(nodeIdx => {
      const pos = getNodePosition(nodeIdx);

      // Outer circle (active node)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#6ea8fe';
      ctx.fill();

      // Inner circle (highlight)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#4d8fff';
      ctx.fill();

      // White border
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  });
}

// Theme-aware color helpers
function getThemeColors() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  return {
    gridDot: isLight ? '#adb5bd' : '#555670',
    gridDotStroke: isLight ? '#868e96' : '#777790',
    heatmapStroke: isLight ? '#ced4da' : '#2b3150',
    // Main canvas colors
    nodeOuter: isLight ? '#e9ecef' : '#0f1220',
    nodeInner: isLight ? '#0d6efd' : '#2b6df8',
    nodeText: isLight ? '#212529' : '#9fb3ff',
    lineColor: isLight ? '#0d6efd' : '#76a7ff',
    // Radar chart colors
    radarGrid: isLight ? '#ced4da' : '#2a2f45',
    radarLabelBg: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    radarLabelText: isLight ? '#495057' : '#ffffff',
  };
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    body.setAttribute('data-theme', 'light');
  }

  // Theme toggle event listener
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    if (newTheme === 'light') {
      body.setAttribute('data-theme', 'light');
    } else {
      body.removeAttribute('data-theme');
    }

    // Save theme preference
    localStorage.setItem('theme', newTheme);

    // Redraw canvases with new theme
    redraw(); // Main canvas
    evaluate();
    drawExamplePatterns();
  });
}

// Initialize theme first, then init UI
initThemeToggle();
init();
