# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PatternLock Security Trainer is a static web tool for Android-style 3×3 unlock patterns. Instead of a single strength score, it shows how a drawn pattern fares against each attack (guessing on the device, brute force, shoulder surfing, smudge, thermal, video), using an exact count of all 389,112 valid patterns and values from published research (each with its source). Input never leaves the browser.

Part of the "100 Security Tools with Generative AI" project (Day064).

## Architecture

All scripts are plain (non-module) scripts so that the page works from `file://`. Each script puts one object on `globalThis`.

- **index.html**: header (theme button), notice, three tabs (`role="tablist"`): "調べる" `#panel-check` (pad with 9 node buttons over a canvas, text input, shape features, start/length bias, attack cards, saved patterns), "パターン例" `#panel-examples`, "座学" `#panel-learn` (rendered by script). Help and confirm `<dialog>`s. Meta CSP without `'unsafe-inline'`; no inline scripts, handlers or style attributes. Static text carries `data-i18n` / `data-i18n-attr`
- **js/pattern-core.js** (`PatternCore`): pure logic, no DOM. Android rules (`extend` auto-adds an unvisited skipped node, `validate`, `parse` with NFKC), `features` (nodes, Euclidean length, intersections and overlaps per Golla et al. 2019: crossings and touches count as intersections, retraced unit segments as overlaps; knight moves; start class), `sunScore` (S × log2(L + I + O), range 6.340–46.807), `sunClass` (Ye et al.: < 19 simple, > 33 complex), `stats()` (enumerates all 389,112 patterns once: counts by length, smudge maps by node set and by undirected unit segments, sorted PS), `shortestFirstWorst`, `smudgeCandidates`, `sunPercentile`, `gatekeeperTimeoutMs` (AOSP `ComputeRetryTimeout`), `legacyTimeoutMs`, `waitBeforeAttempt`, `attemptsWithin`, `START_SHARE` / `LENGTH_SHARE` (Løge 2015), `FACTS`, `SOURCES`, `SOURCE_URLS`, `EXAMPLES`
- **js/messages.js** (`PatternMessages`): all strings (Japanese). `t(key, vars)` fills `{name}`
- **js/tabs.js** (`PatternTabs`): WAI-ARIA tabs (click, Left/Right, Home/End), `#tab=` or `?tab=`
- **js/theme-init.js / theme.js** (`PatternTheme`): theme applied before paint; follows the OS setting, toggle saved as `patternlock-security-trainer-theme`
- **script.js**: UI only. Drawing with pointer events on the pad (pointer capture; a new press starts a new pattern, like Android); keyboard clicks (`detail === 0`) append nodes. Undo removes a whole step including auto-added nodes. The full enumeration runs once after first paint (`ensureStats`). Saved patterns store only name (≤ 50 chars) and sequence under `patternlock-security-trainer-saved`; `plst_saved` from the old version is migrated once. Uses `textContent` only
- **style.css**: color tokens on `:root`, dark overrides in both `:root[data-theme="dark"]` and `prefers-color-scheme` (identical)

## Development Commands

- `npm test` — node:test, no dependencies, Node 22+. Runs in GitHub Actions on push and pull requests. Tests load the plain scripts with `vm.runInThisContext` (`test/load.js`)
- Open `index.html` directly, or serve with `python -m http.server 8000`

## Testing

- `test/core.test.js`: rules, parsing, counts (1,624 … 140,704; 389,112), Golla examples for intersections and overlaps, PS range, smudge candidate counts, Gatekeeper schedule, literature values. Known answers come from separate reference code and the papers, not from the implementation
- `test/html.test.js`, `test/messages.test.js`, `test/contrast.test.js`, `test/format.test.js`, `test/tabs.test.js`: CSP and markup, dictionary keys and numbers in strings, contrast (text 4.5:1, UI parts 3:1) in light and dark, line length and LF, tabs
- `test/readme.test.js`: README structure and YAML, tables recomputed from the core, directory tree, images; SECURITY_RESEARCH.md numbers

## Key Implementation Notes

- Never use `innerHTML`; no inline styles or handlers (CSP)
- Do not add a single combined score: attacks reward opposite properties (complex shapes resist shoulder surfing but were easier for the video attack)
- Every number shown must come from the enumeration or from `FACTS` with a source in `SOURCES`
- Keep the README YAML structure unchanged; README numbers are checked by `readme.test.js`
- Japanese text does not put half-width spaces between Japanese and alphanumeric characters
