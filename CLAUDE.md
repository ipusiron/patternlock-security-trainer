# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PatternLock Security Trainer is a browser-based educational tool for analyzing the security strength of Android-style 3×3 pattern locks. It runs entirely in the browser without any network communication (enforced via CSP: `connect-src 'none'`).

## Architecture

This is a vanilla JavaScript application with no build process:
- **index.html**: UI structure with privacy-focused CSP headers
- **script.js**: Core logic for pattern drawing, feature extraction, scoring, and localStorage management
- **style.css**: Responsive styling with CSS Grid and dark mode support

Key architectural decisions:
- No external dependencies or frameworks - pure HTML/CSS/JavaScript
- Canvas-based pattern drawing with touch/mouse support
- localStorage for optional pattern saving (user-initiated only)
- Educational heuristic scoring model with adjustable weights

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
- 3×3 grid with nodes indexed 0-8
- No repeated nodes allowed
- Auto-insertion of middle nodes when skipping (e.g., 0→2 becomes 0→1→2)
- Minimum 4 nodes required for valid pattern

### Security Scoring Model
The scoring uses a weighted heuristic model (`calculateScore()` in script.js):
- Length factor: More nodes = higher security
- Turns/angles: Non-linear paths score higher
- Intersections: Complex overlapping paths add points
- Start bias: Corner/edge starts are predictable (penalty)
- Symmetry: Symmetric patterns are memorable but predictable (penalty)

### Canvas Coordinate System
- Pattern pad: 360×360px canvas with 40px margins
- Node centers calculated via `nodeCenter()` function
- Hit detection radius: 28px around each node
- Heatmap: Separate 180×180px canvas for visualization