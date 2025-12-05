# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PatternLock Security Trainer is a browser-based educational tool for analyzing the security strength of Android-style 3×3 pattern locks. It runs entirely in the browser without any network communication (enforced via CSP: `connect-src 'none'`).

## Architecture

This is a vanilla JavaScript application with no build process:
- **index.html**: UI structure with privacy-focused CSP headers, 3-tab layout (強度検査/パターン例/座学)
- **script.js**: Core logic for pattern drawing, feature extraction, scoring, and localStorage management
- **style.css**: Responsive styling with CSS Grid and dark/light mode support via CSS variables

Key architectural decisions:
- No external dependencies or frameworks - pure HTML/CSS/JavaScript
- Canvas-based pattern drawing with touch/mouse support (Pointer Events API)
- localStorage for optional pattern saving (user-initiated only)
- Educational heuristic scoring model with adjustable weights
- Theme system using `[data-theme="light"]` attribute on `<body>`

## Development Commands

```bash
# No build required - open directly in browser
python -m http.server 8000  # or any local server
# Then navigate to http://localhost:8000

# For GitHub Pages deployment (already configured)
# Just push to main branch - served from root via .nojekyll
```

## Key Implementation Details

### Pattern Rules (Android-compliant)
- 3×3 grid with nodes indexed 0-8 (left-to-right, top-to-bottom)
- No repeated nodes allowed
- Auto-insertion of middle nodes when skipping (e.g., 0→2 becomes 0→1→2) - see `middleMap`
- Minimum 4 nodes required for valid pattern

### Security Scoring Model
The scoring uses a weighted heuristic model (`computeScore()` in script.js):
- Length factor: More nodes = higher security (max 25 bonus points)
- Turns/angles: Non-linear paths score higher (max 20 points)
- Intersections: Complex overlapping paths add points (max 20 points)
- Angle variance: Diverse directions increase complexity (max 15 points)
- Start bias: Corner/edge starts are predictable (penalty up to -10)
- Symmetry: Symmetric patterns are memorable but predictable (penalty up to -10)

### Canvas Coordinate System
- Pattern pad: 360×360px canvas with 40px margins
- Node centers calculated via `nodeCenter()` function
- Hit detection radius: 28px around each node
- Radar chart: 280×280px canvas for feature visualization
- Heatmap: 180×180px canvas for node usage visualization

### Theming
CSS variables defined in `:root` (dark) and `[data-theme="light"]`:
- `--bg`, `--panel`, `--text`, `--muted`, `--accent`, `--ok`, `--warn`, `--bad`
- Theme toggle persisted to localStorage under key `theme`
- `getThemeColors()` provides canvas-specific color values

### Data Persistence
- localStorage key `plst_saved` stores saved patterns
- Data sanitized before storage (max 50 char names, valid node indices only)

## Additional Resources

- **SECURITY_RESEARCH.md**: Deep-dive into pattern lock vulnerabilities, attack vectors, and defense techniques for security researchers