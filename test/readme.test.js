import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, core } from './load.js';

const C = core();
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const readme = read('README.md');
const research = read('SECURITY_RESEARCH.md');
const num = (n) => n.toLocaleString('en-US');
const JA = '　-〿぀-ヿ㐀-鿿＀-￯';

// 見出し（##）の本文を取り出す
function section(text, heading) {
  const start = text.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, heading);
  const rest = text.slice(start + heading.length + 5);
  const end = rest.search(/\n## /);
  return end < 0 ? rest : rest.slice(0, end);
}
// 表の行（見出し行と区切り行を除く）をセルの配列にする
function rows(text, firstHeader) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.startsWith(`| ${firstHeader} |`));
  assert.ok(i >= 0, firstHeader);
  const out = [];
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) out.push(lines[k].split('|').slice(1, -1).map((c) => c.trim()));
  return out;
}

test('YAML メタデータの構造と値（id・slug・repo_url・demo_url・hub は変えない、リストはブロック形式）', () => {
  const yaml = readme.match(/^<!--\n---\n([\s\S]*?)\n---\n-->/);
  assert.ok(yaml);
  const keys = [...yaml[1].matchAll(/^([a-z_]+):/gm)].map((m) => m[1]);
  assert.deepEqual(keys, ['id', 'slug', 'title', 'subtitle_ja', 'subtitle_en', 'description_ja', 'description_en', 'category_ja', 'category_en',
    'difficulty', 'tags', 'repo_url', 'demo_url', 'hub']);
  assert.match(yaml[1], /^id: day064$/m);
  assert.match(yaml[1], /^slug: patternlock-security-trainer$/m);
  assert.match(yaml[1], /^repo_url: "https:\/\/github\.com\/ipusiron\/patternlock-security-trainer"$/m);
  assert.match(yaml[1], /^demo_url: "https:\/\/ipusiron\.github\.io\/patternlock-security-trainer\/"$/m);
  assert.match(yaml[1], /^hub: true$/m);
  for (const k of ['category_ja', 'category_en', 'tags']) assert.match(yaml[1], new RegExp(`^${k}:\\n  - `, 'm'), k);
  assert.doesNotMatch(yaml[1], /\[.*\]/, 'フロー形式のリストを使わない');
});

test('シリーズ標準の構成（前半・後半の固定順、バッジ5種、プロジェクトの定型文）', () => {
  const heads = [...readme.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(heads, ['🌐 デモページ', '📸 スクリーンショット', '✨ 機能', '📖 使い方', '🔬 技術的な説明', '📚 研究の値', '🎯 ユースケース',
    '🔒 セキュリティとプライバシー', '⚠️ 注意と限界', '🧪 テスト', '📁 ディレクトリー構造', '💻 動作環境', '📄 ライセンス', '🛠️ このツールについて']);
  assert.equal((readme.match(/img\.shields\.io/g) || []).length, 5);
  assert.match(readme, /^\*\*Day064 - 生成AIで作るセキュリティツール100\*\*$/m);
  assert.match(readme, /^# PatternLock Security Trainer - パターンロック強度測定ツール$/m);
  const about = section(readme, '🛠️ このツールについて');
  assert.match(about, /「生成AIで作るセキュリティツール100」/);
  assert.match(about, /https:\/\/akademeia\.info\/\?page_id=42163/);
});

test('長さ別の数の表は、計算部の数え上げと同じ', () => {
  const s = C.stats();
  const got = rows(section(readme, '🔬 技術的な説明'), '長さ');
  const want = [4, 5, 6, 7, 8, 9].map((l) => [`${l}点`, num(s.byLength[l]), num(C.shortestFirstWorst(l))]);
  assert.deepEqual(got, want);
  // 9点の順列の合計（飛び越えの規則がない場合）
  let perm = 0;
  for (let k = 4; k <= 9; k++) {
    let p = 1;
    for (let i = 0; i < k; i++) p *= 9 - i;
    perm += p;
  }
  assert.ok(readme.includes(`${num(perm)}通りが${num(s.total)}通りに減る`));
});

// 秒を、画面と同じ単位で書く
const oneDecimal = (x) => String(Number(x.toFixed(1)));
function duration(sec) {
  if (sec < 60) return `${Math.round(sec)}秒`;
  if (sec < 3600) return `${oneDecimal(sec / 60)}分`;
  return `${oneDecimal(sec / 3600)}時間`;
}

test('待ち時間の表は、Gatekeeper の ComputeRetryTimeout と同じ。1日・1週間・30日に試せる回数', () => {
  const want = [];
  for (let c = 1; c < 140; c++) {
    const ms = C.gatekeeperTimeoutMs(c);
    const last = want[want.length - 1];
    if (last && last.ms === ms) last.to = c;
    else want.push({ from: c, to: c, ms });
  }
  const label = (r) => (r.from === r.to ? `${r.from}回目` : `${r.from}〜${r.to}回目`);
  const expect = [...want.map((r) => [label(r), r.ms ? duration(r.ms / 1000) : '待ちなし']), ['140回目以降', duration(C.gatekeeperTimeoutMs(140) / 1000)]];
  assert.deepEqual(rows(section(readme, '🔬 技術的な説明'), '失敗の回数'), expect);
  const claim = `1日に${C.attemptsWithin(86400)}回、1週間に${C.attemptsWithin(7 * 86400)}回、30日で${C.attemptsWithin(30 * 86400)}回`;
  assert.ok(readme.includes(claim), claim);
  assert.ok(research.includes(claim), claim);
});

test('研究の値の表と文は、計算部の FACTS と同じ', () => {
  const F = C.FACTS;
  const body = section(readme, '📚 研究の値');
  assert.deepEqual(rows(body, '出典'), [
    ['Løge 2015', `${F.loge.respondents}人・${num(F.loge.patterns)}個`, `${F.loge.topLeft}%`, `${F.loge.corners}%`, `${F.loge.center}%`],
    ['Uellenbeckら、2013', '実際のパターン（105人）', `${F.uellenbeck.topLeft}%`, `${F.uellenbeck.corners}%`, `${F.uellenbeck.center}%`],
  ]);
  const lengths = Object.entries(C.LENGTH_SHARE).map(([l, s]) => `${l}点${s}%`).join('・');
  assert.ok(body.includes(lengths), lengths);
  assert.ok(body.includes(`上位100個のパターンで全体の${F.loge.top100}%`));
  assert.ok(body.includes(`約${F.uellenbeck.guesses10}%が10回で、約${F.uellenbeck.guesses30}%が30回`));
  assert.ok(body.includes(`${F.aviv2015.guesses}回で3×3の${F.aviv2015.share3}%、4×4の${F.aviv2015.share4}%`));
  const attacks = rows(body, '攻撃');
  assert.deepEqual(attacks.map((r) => r[0]), ['汚れ', '覗き見', '動画', '熱']);
  assert.ok(attacks[0][1].includes(`${F.aviv2010.partial}%で一部が、${F.aviv2010.full}%で全部`));
  assert.ok(attacks[1][1].includes(`${F.aviv2017.withLines}%`) && attacks[1][1].includes(`${F.aviv2017.withoutLines}%`)
    && attacks[1][1].includes(`${F.aviv2017.pin6}%`));
  assert.ok(attacks[2][1].includes(`${F.ye2017.attempts}回以内に${F.ye2017.within}%超`) && attacks[2][1].includes(`${F.ye2017.complexFirst}%`)
    && attacks[2][1].includes(`${F.ye2017.simpleFirst}%`));
  assert.ok(attacks[3][1].includes(`${F.abdelrahman2017.seconds}秒以内`) && attacks[3][1].includes(`${F.abdelrahman2017.noOverlap}%`)
    && attacks[3][1].includes(`${F.abdelrahman2017.withOverlap}%`));
});

test('パターン例の表は、計算部の例と同じ値', () => {
  const cls = { simple: '単純', median: '中間', complex: '複雑' };
  const titles = ['左上から4点', 'L字', 'Z字', '9点の蛇行', '引き直しのある形', '桂馬飛びの4点', '中央から始める', '最も複雑な形の1つ'];
  const want = C.EXAMPLES.map((ex, i) => {
    const f = C.features(ex.pattern);
    const ps = C.sunScore(f);
    return [titles[i], C.format(ex.pattern), String(f.nodes), `${C.START_SHARE[ex.pattern[0]]}%`, num(C.smudgeCandidates(ex.pattern).lines), String(f.overlaps),
      `${ps.toFixed(2)}（${cls[C.sunClass(ps)]}）`];
  });
  assert.deepEqual(rows(section(readme, '📚 研究の値'), '例'), want);
  for (const ex of C.EXAMPLES) assert.equal(C.validate(ex.pattern), null, ex.id);
});

test('本文の数字（汚れの候補・PS の範囲・例）は、計算部の値と同じ', () => {
  const s = C.stats();
  const lines = [...s.byLines.values()];
  const share = (k) => (Math.floor((lines.filter((c) => c <= k).reduce((a, c) => a + c, 0) / s.total) * 1000) / 10).toFixed(1);
  for (const doc of [readme, research]) {
    assert.ok(doc.includes(`${share(1)}%`) && doc.includes(`${share(2)}%`), '線の汚れ');
    assert.ok(doc.includes(`${s.sorted[0].toFixed(3)}〜${s.sorted[s.sorted.length - 1].toFixed(3)}`), 'PS の範囲');
  }
  assert.ok(readme.includes(`0-1-2-5-8は${C.smudgeCandidates([0, 1, 2, 5, 8]).points}通り`));
  const pts = [...s.bySet.entries()].flatMap(([mask, c]) => Array(c).fill(c)).sort((a, b) => a - b);
  assert.ok(research.includes(`中央値は${num(pts[Math.floor((pts.length - 1) / 2)])}通り`));
});

test('4×4 の有効なパターンの数（SECURITY_RESEARCH.md）は、同じ規則の数え上げと同じ', () => {
  // 部分集合の動的計画法（4×4、飛び越える点は使っていなければならない）
  const n = 4;
  const N = n * n;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const pass = Array.from({ length: N }, (_, a) => Array.from({ length: N }, (_, b) => {
    const [ra, ca, rb, cb] = [Math.floor(a / n), a % n, Math.floor(b / n), b % n];
    const g = gcd(Math.abs(rb - ra), Math.abs(cb - ca));
    let m = 0;
    for (let k = 1; k < g; k++) m |= 1 << ((ra + ((rb - ra) / g) * k) * n + (ca + ((cb - ca) / g) * k));
    return m;
  }));
  let cur = new Map();
  for (let s = 0; s < N; s++) cur.set((1 << s) * 32 + s, 1);
  let total = 0;
  for (let len = 1; len <= N; len++) {
    if (len >= 4) for (const v of cur.values()) total += v;
    if (len === N) break;
    const next = new Map();
    for (const [k, v] of cur) {
      const mask = Math.floor(k / 32);
      const last = k % 32;
      for (let b = 0; b < N; b++) {
        if (mask & (1 << b) || (pass[last][b] & mask) !== pass[last][b]) continue;
        const nk = (mask | (1 << b)) * 32 + b;
        next.set(nk, (next.get(nk) || 0) + v);
      }
    }
    cur = next;
  }
  assert.equal(total, 4350069823024);
  assert.ok(research.includes(num(total)));
});

test('SECURITY_RESEARCH.md の参考文献は、計算部の出典と同じ12件のリンク', () => {
  const urls = [...research.matchAll(/^\d+\. .+ (https:\/\/\S+)$/gm)].map((m) => m[1]);
  assert.equal(urls.length, 12);
  assert.deepEqual(new Set(urls), new Set(Object.values(C.SOURCE_URLS)));
  for (const k of Object.keys(C.SOURCES)) assert.ok(C.SOURCE_URLS[k], k);
});

test('ディレクトリー構造は実際のファイルと同じで、全行に説明がある', () => {
  const block = section(readme, '📁 ディレクトリー構造').match(/```\n([\s\S]*?)```/)[1];
  const lines = block.trim().split('\n').slice(1);
  for (const l of lines) assert.match(l, /# \S/, l);
  const listed = new Set(lines.map((l) => l.replace(/^[│├└─\s]+/, '').replace(/\s+#.*$/, '').replace(/\/$/, '')));
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter((e) => !['.git', 'node_modules', '.claude'].includes(e.name))
    .flatMap((e) => (e.isDirectory() ? [e.name, ...walk(path.join(dir, e.name))] : [e.name]));
  const all = walk('.');
  for (const name of all) assert.ok(listed.has(name), `ツリーにない: ${name}`);
  for (const name of listed) assert.ok(all.includes(name), `実在しない: ${name}`);
});

test('スクリーンショットは実在し、README から参照しているものだけが assets にある（各300KB以下）', () => {
  const refs = [...readme.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map((m) => m[1]);
  assert.equal(refs.length, 4);
  for (const r of refs) {
    assert.ok(fs.existsSync(path.join(ROOT, r)), r);
    assert.ok(fs.statSync(path.join(ROOT, r)).size <= 300 * 1024, r);
  }
  const pngs = fs.readdirSync(path.join(ROOT, 'assets')).filter((f) => f.endsWith('.png')).map((f) => `assets/${f}`).sort();
  assert.deepEqual(pngs, [...refs].sort());
});

test('表記: 禁止語がない、日本語と英数字の間に半角スペースを入れない、強調は節ごとに2か所まで', () => {
  const prose = (s) => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\]\([^)]+\)/g, ']')
    .replace(/https?:\/\/\S+/g, '');
  for (const [name, doc] of [['README.md', readme], ['SECURITY_RESEARCH.md', research]]) {
    const p = prose(doc);
    for (const w of ['分かる', '分から', '全て', '既に', '無い', 'インターフェース', '効く', '効き', '効か', '効け']) assert.ok(!p.includes(w), `${name}: ${w}`);
    assert.deepEqual(doc.split('\n').filter((l) => /^\d+\.\S/.test(l)), [], `${name}: 番号つきの箇条書きは「1. 」の形`);
    assert.deepEqual(doc.split('\n').filter((l) => /^#{1,6}[^# ]/.test(l)), [], `${name}: 見出しは「## 」の形`);
    const bad = p.split('\n').filter((l) => !l.startsWith('#')).filter((l) => new RegExp(`[${JA}] [A-Za-z0-9]|[A-Za-z0-9] [${JA}]`).test(l));
    assert.deepEqual(bad, [], name);
  }
  for (const part of readme.split(/\n## /).slice(1)) {
    const body = part.replace(/```[\s\S]*?```/g, '');
    assert.ok((body.match(/\*\*/g) || []).length / 2 <= 2, part.split('\n')[0]);
  }
});
