import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, load, core } from './load.js';

const C = core();
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const num = (n) => n.toLocaleString('en-US');
const JA = '　-〿぀-ヿ㐀-鿿＀-￯';
const JAPANESE = new RegExp(`[${JA}]`);
const oneDecimal = (x) => String(Number(x.toFixed(1)));

// 言語ごとの書き方（見出し・表の見出し・値の書き方）。数値は計算部から計算し直す
const DOCS = {
  ja: {
    file: 'README.md', research: 'SECURITY_RESEARCH.md', switcher: '[English](README.en.md) · 日本語',
    researchSwitcher: '[English](SECURITY_RESEARCH.en.md) · 日本語',
    day: '**Day064 - 生成AIで作るセキュリティツール100**', h1: '# PatternLock Security Trainer - パターンロック強度測定ツール', images: /^assets\/screenshot\d*\.png$/,
    heads: ['🌐 デモページ', '📸 スクリーンショット', '✨ 機能', '📖 使い方', '🔬 技術的な説明', '📚 研究の値', '🎯 ユースケース', '🔗 関連ツール', '🔒 セキュリティとプライバシー',
      '⚠️ 注意と限界', '🧪 テスト', '📁 ディレクトリー構造', '💻 動作環境', '📄 ライセンス', '🛠️ このツールについて'],
    about: '「生成AIで作るセキュリティツール100」',
    length: (l) => `${l}点`, lengthHead: '長さ', total: '合計', bits: (b) => `約2の${b}乗`, waitHead: '失敗の回数', peopleHead: '出典', attackHead: '攻撃', exampleHead: '例',
    dur: (sec) => (sec < 60 ? `${Math.round(sec)}秒` : sec < 3600 ? `${oneDecimal(sec / 60)}分` : `${oneDecimal(sec / 3600)}時間`),
    noWait: '待ちなし', single: (n) => `${n}回目`, range: (a, b) => `${a}〜${b}回目`, after: (n) => `${n}回目以降`,
    rate: (d, w, m) => `1日に${d}回、1週間に${w}回、30日で${m}回`,
    people: (F) => [['Løge 2015', `${F.loge.respondents}人・${num(F.loge.patterns)}個`], ['Uellenbeckら、2013', '実際のパターン（105人）']],
    lengths: (L) => Object.entries(L).map(([l, s]) => `${l}点${s}%`).join('・'),
    facts: (F) => [`上位100個のパターンで全体の${F.loge.top100}%`, `約${F.uellenbeck.guesses10}%が10回で、約${F.uellenbeck.guesses30}%が30回`,
      `${F.aviv2015.guesses}回で3×3の${F.aviv2015.share3}%、4×4の${F.aviv2015.share4}%が、${num(F.aviv2015.many)}回で3×3の${F.aviv2015.many3}%、4×4の${F.aviv2015.many4}%`],
    attacks: ['汚れ', '覗き見', '動画', '熱'],
    titles: ['左上から4点', 'L字', 'Z字', '9点の蛇行', '引き直しのある形', '桂馬飛びの4点', '中央から始める', '最も複雑な形の1つ'],
    ps: (ps, cls) => `${ps}（${{ simple: '単純', median: '中間', complex: '複雑' }[cls]}）`,
    example40: (n) => `0-1-2-5-8は${n}通り`, perm: (a, b) => `${a}通りが${b}通りに減る`, median: (n) => `中央値は${n}通り`,
  },
  en: {
    file: 'README.en.md', research: 'SECURITY_RESEARCH.en.md', switcher: 'English · [日本語](README.md)',
    researchSwitcher: 'English · [日本語](SECURITY_RESEARCH.md)',
    day: '**Day064 - 100 Security Tools with Generative AI**', h1: '# PatternLock Security Trainer - Android Pattern Lock Security Analyzer',
    images: /^assets\/en\/screenshot\d*\.png$/,
    heads: ['🌐 Demo', '📸 Screenshots', '✨ Features', '📖 Usage', '🔬 Technical notes', '📚 Research values', '🎯 Use cases', '🔗 Related tools',
      '🔒 Security and privacy', '⚠️ Notes and limitations', '🧪 Tests', '📁 Directory structure', '💻 Environment', '📄 License', '🛠️ About this tool'],
    about: '"100 Security Tools with Generative AI"',
    length: (l) => `${l} dots`, lengthHead: 'Length', total: 'Total', bits: (b) => `2^${b}`,
    waitHead: 'Failures', peopleHead: 'Source', attackHead: 'Attack', exampleHead: 'Example',
    dur: (sec) => (sec < 60 ? `${Math.round(sec)} s` : sec < 3600 ? `${oneDecimal(sec / 60)} min` : `${oneDecimal(sec / 3600)} h`),
    noWait: 'No wait', single: (n) => `${n}`, range: (a, b) => `${a}–${b}`, after: (n) => `${n} and later`,
    rate: (d, w, m) => `${d} tries per day, ${w} per week and ${m} in 30 days`,
    people: (F) => [['Løge 2015', `${F.loge.respondents} people, ${num(F.loge.patterns)} patterns`], ['Uellenbeck et al., 2013', 'Real patterns (105 people)']],
    lengths: (L) => Object.entries(L).map(([l, s]) => `${l} dots ${s}%`).join(', '),
    facts: (F) => [`The 100 most common patterns made up ${F.loge.top100}%`,
      `about ${F.uellenbeck.guesses10}% of the patterns made with security in mind within 10 guesses and about ${F.uellenbeck.guesses30}% within 30`,
      `${F.aviv2015.guesses} guesses found ${F.aviv2015.share3}% of 3×3 and ${F.aviv2015.share4}% of 4×4`,
      `${num(F.aviv2015.many)} guesses found ${F.aviv2015.many3}% and ${F.aviv2015.many4}%`],
    attacks: ['Smudge', 'Shoulder surfing', 'Video', 'Thermal'],
    titles: ['Four dots from the top left', 'L shape', 'Z shape', 'Nine-dot snake', 'Retraced line', 'Four dots with knight moves', 'Starting from the center',
      'One of the most complex shapes'],
    ps: (ps, cls) => `${ps} (${cls === 'median' ? 'medium' : cls})`,
    example40: (n) => `${n} for 0-1-2-5-8`, perm: (a, b) => `${a} permutations of the nine dots down to ${b}`,
    median: (n) => `median number of candidates is ${n}`,
  },
};
for (const d of Object.values(DOCS)) {
  d.text = read(d.file);
  d.researchText = read(d.research);
}

function section(text, heading) {
  const start = text.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, heading);
  const rest = text.slice(start + heading.length + 5);
  const end = rest.search(/\n## /);
  return end < 0 ? rest : rest.slice(0, end);
}
function rows(text, firstHeader) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.startsWith(`| ${firstHeader} |`));
  assert.ok(i >= 0, firstHeader);
  const out = [];
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) out.push(lines[k].split('|').slice(1, -1).map((c) => c.trim()));
  return out;
}

test('YAML メタデータの構造と値（README.md だけ。id・slug・repo_url・demo_url・hub は変えない、リストはブロック形式）', () => {
  const yaml = DOCS.ja.text.match(/^<!--\n---\n([\s\S]*?)\n---\n-->/);
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
  assert.doesNotMatch(DOCS.en.text, /^<!--\n---/, 'YAML は README.md だけに置く');
});

test('日英とも、シリーズ標準の構成（見出しの対応・バッジ5種・切り替えのリンク・定型文）', () => {
  for (const d of Object.values(DOCS)) {
    assert.deepEqual([...d.text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), d.heads, d.file);
    assert.equal((d.text.match(/img\.shields\.io/g) || []).length, 5, d.file);
    assert.ok(d.text.split('\n').includes(d.switcher), d.file);
    assert.ok(d.text.split('\n').includes(d.day), d.file);
    assert.ok(d.text.split('\n').includes(d.h1), d.file);
    const about = section(d.text, d.heads[d.heads.length - 1]);
    assert.ok(about.includes(d.about), d.file);
    assert.match(about, /https:\/\/akademeia\.info\/\?page_id=42163/);
    assert.ok(d.researchText.split('\n').includes(d.researchSwitcher), d.research);
    // 小見出し（###）の数も日英でそろえる
    assert.equal((d.text.match(/^### /gm) || []).length, (DOCS.ja.text.match(/^### /gm) || []).length, d.file);
  }
});

test('長さ別の数の表は、計算部の数え上げと同じ（日英）', () => {
  const s = C.stats();
  for (const d of Object.values(DOCS)) {
    const got = rows(section(d.text, d.heads[4]), d.lengthHead);
    assert.deepEqual(got, [4, 5, 6, 7, 8, 9].map((l) => [d.length(l), num(s.byLength[l]), num(C.shortestFirstWorst(l))]), d.file);
  }
  let perm = 0;
  for (let k = 4; k <= 9; k++) {
    let p = 1;
    for (let i = 0; i < k; i++) p *= 9 - i;
    perm += p;
  }
  for (const d of Object.values(DOCS)) assert.ok(d.text.includes(d.perm(num(perm), num(s.total))), d.file);
});

test('4×4に広げた長さ別の数の表と2のべき乗は、計算部の gridCounts と同じ（日英）', () => {
  const g3 = C.gridCounts(3);
  const g4 = C.gridCounts(4);
  for (const d of Object.values(DOCS)) {
    const body = section(d.text, d.heads[4]);
    const want = Object.keys(g4.byLength).map(Number).map((l) => [d.length(l), l in g3.byLength ? num(g3.byLength[l]) : '—', num(g4.byLength[l])]);
    want.push([d.total, num(g3.total), num(g4.total)]);
    assert.deepEqual(rows(body, `${d.lengthHead} | 3×3`), want, d.file);
    for (const n of [g3.total, g4.total]) assert.ok(body.includes(d.bits(Math.log2(n).toFixed(2))), `${d.file}: ${n}`);
  }
});

test('関連ツールの節は、画面（座学のタブ）のリンクと同じ順・同じ URL で、説明は辞書と同じ（日英）', () => {
  const html = read('index.html');
  const { MESSAGES } = load('js/messages.js').PatternMessages;
  const re = /<a href="(https:\/\/ipusiron\.github\.io\/[a-z0-9-]+\/)" target="_blank" rel="noopener noreferrer">(Day(\d{3}) [^<]+)<\/a>/g;
  const links = [...html.matchAll(re)].map((m) => ({ url: m[1], title: m[2], day: m[3] }));
  assert.equal(links.length, 7);
  for (const [lang, d] of Object.entries(DOCS)) {
    const body = section(d.text, d.heads[7]);
    const items = body.split('\n').filter((l) => l.startsWith('- '));
    assert.deepEqual(items, links.map((k) => `- [${k.title}](${k.url}): ${MESSAGES[lang][`ui.relatedDay${k.day}`]}`), d.file);
  }
});

test('待ち時間の表は、Gatekeeper の ComputeRetryTimeout と同じ。1日・1週間・30日に試せる回数（日英）', () => {
  const groups = [];
  for (let c = 1; c < 140; c++) {
    const ms = C.gatekeeperTimeoutMs(c);
    const last = groups[groups.length - 1];
    if (last && last.ms === ms) last.to = c;
    else groups.push({ from: c, to: c, ms });
  }
  for (const d of Object.values(DOCS)) {
    const want = [...groups.map((r) => [r.from === r.to ? d.single(r.from) : d.range(r.from, r.to), r.ms ? d.dur(r.ms / 1000) : d.noWait]),
      [d.after(140), d.dur(C.gatekeeperTimeoutMs(140) / 1000)]];
    assert.deepEqual(rows(section(d.text, d.heads[4]), d.waitHead), want, d.file);
    const claim = d.rate(C.attemptsWithin(86400), C.attemptsWithin(7 * 86400), C.attemptsWithin(30 * 86400));
    assert.ok(d.text.includes(claim), `${d.file}: ${claim}`);
    assert.ok(d.researchText.includes(claim), `${d.research}: ${claim}`);
  }
});

test('研究の値の表と文は、計算部の FACTS と同じ（日英）', () => {
  const F = C.FACTS;
  for (const d of Object.values(DOCS)) {
    const body = section(d.text, d.heads[5]);
    const people = rows(body, d.peopleHead);
    const [loge, uell] = d.people(F);
    assert.deepEqual(people, [[...loge, `${F.loge.topLeft}%`, `${F.loge.corners}%`, `${F.loge.center}%`],
      [...uell, `${F.uellenbeck.topLeft}%`, `${F.uellenbeck.corners}%`, `${F.uellenbeck.center}%`]], d.file);
    assert.ok(body.includes(d.lengths(C.LENGTH_SHARE)), `${d.file}: lengths`);
    for (const f of d.facts(F)) assert.ok(body.includes(f), `${d.file}: ${f}`);
    const attacks = rows(body, d.attackHead);
    assert.deepEqual(attacks.map((r) => r[0]), d.attacks, d.file);
    const has = (cell, values) => values.every((v) => cell.includes(`${v}%`));
    assert.ok(has(attacks[0][1], [F.aviv2010.partial, F.aviv2010.full]), d.file);
    assert.ok(has(attacks[1][1], [F.aviv2017.withLines, F.aviv2017.withoutLines, F.aviv2017.pin6]), d.file);
    assert.ok(has(attacks[2][1], [F.ye2017.within, F.ye2017.complexFirst, F.ye2017.simpleFirst]), d.file);
    assert.ok(has(attacks[3][1], [F.abdelrahman2017.noOverlap, F.abdelrahman2017.withOverlap]), d.file);
  }
});

test('パターン例の表は、計算部の例と同じ値（日英）', () => {
  for (const d of Object.values(DOCS)) {
    const want = C.EXAMPLES.map((ex, i) => {
      const f = C.features(ex.pattern);
      const ps = C.sunScore(f);
      return [d.titles[i], C.format(ex.pattern), String(f.nodes), `${C.START_SHARE[ex.pattern[0]]}%`, num(C.smudgeCandidates(ex.pattern).lines),
        String(f.overlaps), d.ps(ps.toFixed(2), C.sunClass(ps))];
    });
    assert.deepEqual(rows(section(d.text, d.heads[5]), d.exampleHead), want, d.file);
  }
  for (const ex of C.EXAMPLES) assert.equal(C.validate(ex.pattern), null, ex.id);
});

test('本文の数字（汚れの候補・PS の範囲・例）は、計算部の値と同じ（日英の README と専門家向け資料）', () => {
  const s = C.stats();
  const lines = [...s.byLines.values()];
  const share = (k) => (Math.floor((lines.filter((c) => c <= k).reduce((a, c) => a + c, 0) / s.total) * 1000) / 10).toFixed(1);
  const range = (sep) => `${s.sorted[0].toFixed(3)}${sep}${s.sorted[s.sorted.length - 1].toFixed(3)}`;
  const pts = [...s.bySet.values()].flatMap((c) => Array(c).fill(c)).sort((a, b) => a - b);
  for (const d of Object.values(DOCS)) {
    for (const doc of [d.text, d.researchText]) {
      assert.ok(doc.includes(`${share(1)}%`) && doc.includes(`${share(2)}%`), '線の汚れ');
      assert.ok(doc.includes(range('〜')) || doc.includes(range('–')), 'PS の範囲');
    }
    assert.ok(d.text.includes(d.example40(C.smudgeCandidates([0, 1, 2, 5, 8]).points)), d.file);
    assert.ok(d.researchText.includes(d.median(num(pts[Math.floor((pts.length - 1) / 2)]))), d.research);
  }
});

test('4×4 の有効なパターンの数（専門家向け資料）は、同じ規則の別の数え上げ（長さごとに広げる）と計算部の両方で同じ', () => {
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
  assert.equal(C.gridCounts(4).total, total);
  const A = C.FACTS.aviv2015;
  for (const d of Object.values(DOCS)) {
    assert.ok(d.researchText.includes(num(total)), d.research);
    assert.ok(d.text.includes(num(total)), d.file);
    // 少ない回数では差が小さく、50,000回で差が出た（片方だけ書かない）
    for (const v of [A.share3, A.share4, A.many3, A.many4]) assert.ok(d.researchText.includes(`${v}%`), `${d.research}: ${v}`);
    assert.ok(d.researchText.includes(num(A.many)), d.research);
  }
});

test('専門家向け資料の参考文献は、計算部の出典と同じ12件のリンク（日英）', () => {
  for (const d of Object.values(DOCS)) {
    const urls = [...d.researchText.matchAll(/^\d+\. .+ (https:\/\/\S+)$/gm)].map((m) => m[1]);
    assert.equal(urls.length, 12, d.research);
    assert.deepEqual(new Set(urls), new Set(Object.values(C.SOURCE_URLS)), d.research);
  }
  for (const k of Object.keys(C.SOURCES)) assert.ok(C.SOURCE_URLS[k], k);
});

test('ディレクトリー構造は実際のファイルと同じで、全行に説明がある（日英）', () => {
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter((e) => !['.git', 'node_modules', '.claude'].includes(e.name))
    .flatMap((e) => (e.isDirectory() ? [e.name, ...walk(path.join(dir, e.name))] : [e.name]));
  const all = walk('.');
  for (const d of Object.values(DOCS)) {
    const block = section(d.text, d.heads.find((h) => h.startsWith('📁'))).match(/```\n([\s\S]*?)```/)[1];
    const lines = block.trim().split('\n').slice(1);
    for (const l of lines) assert.match(l, /# \S/, l);
    const listed = new Set(lines.map((l) => l.replace(/^[│├└─\s]+/, '').replace(/\s+#.*$/, '').replace(/\/$/, '')));
    for (const name of all) assert.ok(listed.has(name), `${d.file}: ツリーにない: ${name}`);
    for (const name of listed) assert.ok(all.includes(name), `${d.file}: 実在しない: ${name}`);
  }
});

test('スクリーンショットは日英7枚ずつ実在し、README から参照しているものだけが assets にある（各300KB以下）', () => {
  const refs = {};
  for (const [lang, d] of Object.entries(DOCS)) {
    refs[lang] = [...d.text.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map((m) => m[1]);
    assert.equal(refs[lang].length, 7, lang);
    for (const r of refs[lang]) {
      assert.match(r, d.images, r);
      assert.ok(fs.existsSync(path.join(ROOT, r)), r);
      assert.ok(fs.statSync(path.join(ROOT, r)).size <= 300 * 1024, r);
    }
  }
  const pngs = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.png')).map((f) => `${dir}/${f}`).sort();
  assert.deepEqual(pngs('assets'), [...refs.ja].sort());
  assert.deepEqual(pngs('assets/en'), [...refs.en].sort());
});

test('表記: 見出しと番号の形、強調は節ごとに2か所まで。日本語版は禁止語と英数字の前後の空白、英語版は日本語の文字なし', () => {
  const prose = (s) => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\]\([^)]+\)/g, ']')
    .replace(/https?:\/\/\S+/g, '');
  for (const d of Object.values(DOCS)) {
    for (const [name, doc] of [[d.file, d.text], [d.research, d.researchText]]) {
      assert.deepEqual(doc.split('\n').filter((l) => /^\d+\.\S/.test(l)), [], `${name}: 番号つきの箇条書きは「1. 」の形`);
      assert.deepEqual(doc.split('\n').filter((l) => /^#{1,6}[^# ]/.test(l)), [], `${name}: 見出しは「## 」の形`);
    }
    for (const part of d.text.split(/\n## /).slice(1)) {
      const body = part.replace(/```[\s\S]*?```/g, '');
      assert.ok((body.match(/\*\*/g) || []).length / 2 <= 2, `${d.file}: ${part.split('\n')[0]}`);
    }
  }
  for (const [name, doc] of [['README.md', DOCS.ja.text], ['SECURITY_RESEARCH.md', DOCS.ja.researchText]]) {
    const p = prose(doc);
    for (const w of ['分かる', '分から', '全て', '既に', '無い', 'インターフェース', '効く', '効き', '効か', '効け']) assert.ok(!p.includes(w), `${name}: ${w}`);
    const bad = p.split('\n').filter((l) => !l.startsWith('#')).filter((l) => new RegExp(`[${JA}] [A-Za-z0-9]|[A-Za-z0-9] [${JA}]`).test(l));
    assert.deepEqual(bad, [], name);
  }
  for (const [name, doc] of [['README.en.md', DOCS.en.text], ['SECURITY_RESEARCH.en.md', DOCS.en.researchText]]) {
    const bad = doc.split('\n').filter((l) => JAPANESE.test(l.replace('[日本語]', '')));
    assert.deepEqual(bad, [], name);
  }
});

test('ユースケースの「このツールならではの使い方」の数は計算部と同じ（日英）', () => {
  const [ja, en] = [DOCS.ja.text, DOCS.en.text];
  const week = 7 * 24 * 3600;
  assert.equal(C.attemptsWithin(week), 139);
  assert.equal(C.attemptsWithin(week, C.legacyTimeoutMs), 100805);
  assert.equal(C.gatekeeperTimeoutMs(140), 24 * 60 * 60 * 1000);
  assert.ok(ja.includes('1週間に試せるのは139回') && ja.includes('100,805回') && ja.includes('140回目で24時間'));
  assert.ok(en.includes('139 tries fit in a week') && en.includes('100,805 tries') && en.includes('24 hours at the 140th'));
  assert.deepEqual(C.smudgeCandidates([0, 1, 2, 5]), { points: 18, lines: 3 });
  assert.ok(ja.includes('同じ4点の集合では18通り') && ja.includes('線分の組まで同じものは3通り'));
  assert.ok(en.includes('number 18 for that same four-dot set') && en.includes('only 3 of them'));
  const perm = (n, k) => { let v = 1; for (let i = 0; i < k; i++) v *= n - i; return v; };
  let free = 0;
  for (let k = 4; k <= 9; k++) free += perm(9, k);
  assert.equal(free, 985824);
  assert.equal(C.gridCounts(3).total, 389112);
  assert.equal(C.gridCounts(4).total, 4350069823024);
  assert.ok(ja.includes('985,824通り') && ja.includes('389,112通りに減る') && ja.includes('4,350,069,823,024通り'));
  assert.ok(en.includes('985,824 permutations') && en.includes('to 389,112') && en.includes('4,350,069,823,024'));
});
