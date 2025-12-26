junky.github.io
===============

Personal GitHub Pages site built with [Eleventy](https://www.11ty.dev/).

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

```bash
npm install
```

## Development

Run a local development server with hot reload:

```bash
npm run serve
```

The site will be available at `http://localhost:8080`.

## Build

Generate the static HTML files:

```bash
npm run build
```

This compiles templates from `src/` into HTML files in the root directory.

## Project Structure

```
src/
├── _includes/
│   ├── base.njk              # Base HTML layout
│   ├── nav-main.njk          # Main navigation
│   └── nav-url-translation.njk  # URL translation section nav
├── _data/
│   └── site.json             # Site metadata
├── *.njk                     # Page templates
└── url-translation/
    └── *.njk                 # URL translation section templates
```

## Editing Navigation

- Main nav: `src/_includes/nav-main.njk`
- URL translation nav: `src/_includes/nav-url-translation.njk`

Changes to navigation files automatically apply to all pages using that nav.
