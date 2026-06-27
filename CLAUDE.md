# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm start            # dev server at http://localhost:8080 with live reload
npm run build        # production build → _site/
```

## Stack

- **Static site generator:** Eleventy (11ty) v3 — config in `.eleventy.js`
- **Templating:** Nunjucks (`.njk`)
- **Math rendering:** KaTeX via `@traptitech/markdown-it-katex` (build-time rendering); KaTeX CSS loaded from CDN in `<head>`. The installed `katex` package version **must match** the CDN CSS version in `base.njk` (currently 0.16.11) — a mismatch produces stale class names (e.g. `.mathit` vs `.mathnormal`) and broken math layout
- **Search:** Lunr.js — index built at build time in `searchIndex` collection, queried client-side via `src/js/search.js`
- **Hosting:** GitHub Pages via `.github/workflows/deploy.yml` (deploys `_site/` on push to `main`)
- **Styling:** Hand-written CSS only (`src/css/style.css`) — no framework

**Do not add** React, Vue, Webpack, Vite, Tailwind, or any CSS framework. Interactivity uses vanilla JS + optional per-post CDN libraries (D3, p5.js, Pyodide).

## Architecture

```
src/
├── _includes/base.njk      # root HTML shell (nav, footer, KaTeX CSS)
├── _includes/post.njk      # blog post layout (extends base.njk)
├── _data/metadata.js       # site-wide data: name, email, institution, GitHub, baseUrl
├── posts/*.md              # blog posts — must have layout: post.njk, date, tags: [posts, ...]
├── index.njk               # home page: profile, papers array, recent posts
├── blog.njk                # post list at /blog/
├── tags/tag.njk            # paginated tag pages at /tags/<tag>/
├── tags.njk                # tag index at /tags/
├── search.njk              # search UI — injects window.__searchIndex at build time
├── css/style.css           # complete stylesheet (do not simplify)
├── js/search.js            # Lunr client-side search logic
├── js/sketches/            # reusable p5.js/D3 sketches
└── assets/                 # papers/, cv/, img/ (static pass-through)
```

**Eleventy collections defined in `.eleventy.js`:**
- `posts` — all `src/posts/*.md` files
- `tagList` — sorted unique tags (excluding "all" and "posts")
- `searchIndex` — post metadata + stripped text content for Lunr

**Custom filters:** `dateDisplay` (human-readable date), `md` (render Markdown string), `first(arr, n)` (slice helper).

## Content Authoring

**Blog posts** (`src/posts/*.md`) require this frontmatter:
```yaml
---
layout: post.njk
title: "Post Title"
date: 2025-01-15
summary: "One-sentence description for post lists and search."
tags: [posts, tag1, tag2]
---
```

**Math:** inline `$...$`, display `$$...$$`, aligned equations with `\begin{aligned}`. Avoid `\def`/`\newcommand` per post — declare global macros in `.eleventy.js`.

**Interactive demos:** Use `<div class="demo-container">` + inline `<script>` tags loading libraries from CDN. No bundler needed.

**Papers** are a Nunjucks array in `src/index.njk`. For many papers, migrate to `src/_data/papers.json`.

## GitHub Pages Deployment

If deploying to a project repo (not a user root repo `YOURUSERNAME.github.io`), set `pathPrefix` in `.eleventy.js` and add `ELEVENTY_PATH_PREFIX: /repo-name` env var to the build step in `.github/workflows/deploy.yml`. Enable Pages under Settings → Pages → Source: GitHub Actions.

## Owner TODOs

Placeholder content is marked with `TODO` comments. Key items:
- `src/_data/metadata.js` — name, institution, email, GitHub, baseUrl
- `src/assets/img/profile.jpg` — square profile photo ≥ 400×400 px
- `src/assets/cv/cv.pdf` — CV
- Papers array in `src/index.njk`
