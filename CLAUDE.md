# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run serve        # Local dev server with hot reload (http://localhost:8080)
npm run build        # Generate static HTML to root directory
npx eslint src/      # Lint JavaScript
npx html-validate    # Validate HTML output
```

## Architecture

This is a **personal GitHub Pages static site** built with **Eleventy v3** (11ty). Nunjucks templates in `src/` compile to HTML files at the repository root (which GitHub Pages serves directly).

### Key Directories

- `src/` — Source templates (`.njk` files)
- `src/_includes/` — Layouts and partials (`base.njk`, navigation templates)
- `src/_data/site.json` — Global site metadata
- `src/url-translation/` — URL translation subsection with its own navigation
- `css/`, `images/`, `static/js/` — Static assets (served from root, not copied by Eleventy)

### Eleventy Config (`.eleventy.js`)

- Input: `src/`, Output: `.` (root)
- Template engines: Nunjucks for `.njk`, `.html`, and `.md` files
- No passthrough copy — static assets already live at root

### Templating Patterns

All pages use `base.njk` layout with front matter controlling behavior:

- `navType: main` — Main site navigation (7 items)
- `navType: url-translation` — URL translation subsection navigation (4 items)
- `includeJquery: true` — Optionally loads jQuery
- `extraStyles`, `headScripts`, `footerScripts` — Per-page resource injection
- `bodyPaddingTop` — Override default 75px top padding for fixed navbar

The base layout uses Bootstrap 5.3.3 via CDN. Pages load additional CDN libraries as needed (CryptoJS, marked.js, Odometer.js).

### ESLint Config

ES2020 target with browser globals. Key rules: `no-undef` (error), `no-unused-vars`/`semi`/`no-extra-semi` (warn).
