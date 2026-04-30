# CLAUDE.md

This file provides guidance to CoStrict when working with code in this repository.

## Project Overview

This is the **costrict documentation site**, a Docusaurus 3 project hosting four separate documentation sets:

| Docs Set | Source Directory | Route Base | Sidebar Config |
|----------|------------------|------------|----------------|
| Plugin | `docs/` | `/plugin` | `sidebars.ts` |
| CLI | `docs-cli/` | `/cli` | `sidebars-cli.ts` |
| CSC | `docs-csc/` | `/csc` | `sidebars-csc.ts` |
| Private Deployment | `docs-deployment/` | `/plugin/deployment` | `sidebars-deployment.ts` |

The site supports Chinese (`zh`, default) and English (`en`) via Docusaurus i18n. Search is provided by `@easyops-cn/docusaurus-search-local` with Chinese (`zh`) + English (`en`) indexing.

## Common Commands

```bash
# Development
npm run start         # Start Chinese dev server (localhost:3000)
npm run start:en      # Start English dev server

# Production validation (required before PR)
npm run build         # Build to build/
npm run serve         # Serve build/ locally (test search, i18n switching)

# i18n maintenance
npm run write-translations    # Regenerate i18n translation files
npm run write-heading-ids     # Auto-assign heading anchors

# Type checking
npm run typecheck     # tsc --noEmit

# Hooks
npm run install-hooks # Install Git pre-push hook (checks docs/ for Chinese)

# Cleanup
npm run clear         # Clear Docusaurus cache and build output
```

**Note:** `npm run start` serves a single locale and does not build the search index. To test search or locale switching, use `npm run build && npm run serve`.

There are no unit tests or lint scripts. The quality gates are:
1. `npm run build` must succeed.
2. `npm run typecheck` must pass.
3. `docs/` must not contain Chinese characters (enforced by `scripts/pre-push` and CI).

## Architecture

### Multi-Plugin Docs Setup

The default Docusaurus `classic` preset mounts the Plugin docs at `/plugin`. Three additional `@docusaurus/plugin-content-docs` instances are registered manually in `docusaurus.config.ts` for CLI, CSC, and Deployment docs. Each plugin has its own `routeBasePath`, `path`, and `sidebarPath`.

**Redirects:** `@docusaurus/plugin-client-redirects` handles backward compatibility:
- `/` → `/plugin/guide/installation`
- `/FAQ` → `/plugin/FAQ`
- Any `/plugin/*` path also creates a redirect from `/*` (legacy paths without `/plugin` prefix).

### i18n Structure

- **Default locale:** `zh` (Chinese). The source files in `docs/`, `docs-cli/`, `docs-csc/`, and `docs-deployment/` are considered the **English** originals.
- **Chinese translations** live under `i18n/zh/`:
  - `i18n/zh/docusaurus-plugin-content-docs/current/` mirrors `docs/`
  - `i18n/zh/docusaurus-plugin-content-docs-cli/current/` mirrors `docs-cli/`
  - `i18n/zh/docusaurus-plugin-content-docs-csc/current/` mirrors `docs-csc/`
  - `i18n/zh/docusaurus-plugin-content-docs-deployment/current/` mirrors `docs-deployment/`
- `i18n/zh/code.json` and `docusaurus-theme-classic/` contain UI label translations.

When adding or renaming docs, the Chinese mirror directory must be kept in sync.

### Sidebar Configuration

Sidebars are **explicitly declared** in TypeScript, not auto-generated from the filesystem:
- `sidebars.ts` — Plugin docs navigation
- `sidebars-cli.ts` — CLI docs navigation
- `sidebars-csc.ts` — CSC docs navigation
- `sidebars-deployment.ts` — Deployment docs navigation

Adding a new doc requires registering it in the corresponding sidebar file. IDs are relative to the docs plugin root (e.g., `guide/installation` maps to `docs/guide/installation.md`).

## Documentation Conventions

### Frontmatter

Every `.md` file must include at minimum:

```yaml
---
sidebar_position: 3
---
```

`sidebar_position` controls ordering. The first `# H1` becomes the sidebar label.

### Grouped vs Flat Structure

- **Flat:** Single `.md` files placed directly in `docs/`.
- **Grouped:** Subdirectories with an `_category_.json` file defining `label` and `position`.

### Language Rules

- `docs/`, `docs-cli/`, `docs-csc/`, `docs-deployment/` must be **English only**.
- Chinese content belongs exclusively in the `i18n/zh/` mirror paths.
- A `pre-push` Git hook (and CI workflow `check-chinese-content.yml`) scans `docs/**` for Chinese characters and blocks the push if any are found.
- PR titles and commits are validated against Conventional Commits via `.github/semantic.yml`. Allowed types: `feat`, `fix`, `docs`, `refactor`, `chore`, `perf`, `ci`, `test`.

### Images and Static Assets

- Global static assets (logos, favicons) go in `static/img/` or `static/videos/`.
- Doc-local images go in an `img/` subdirectory next to the referencing `.md` file.
- Reference images with relative paths: `![alt](./img/screenshot.png)`.

## Custom Components

Custom React components live in `src/components/`. The only current custom component is:

- **`src/components/DownloadButton/index.tsx`** — A button that downloads a markdown file. It uses `raw-loader` to import `.md` content at runtime, strips frontmatter and React component tags, and triggers a browser download. Accepts `path` (required) and `filename` props.

Global styles and theme overrides are in `src/css/custom.css`.

## Build & Deployment

- **Docker:** Multi-stage `Dockerfile` (`builder` → `runner`). Uses `nginx:stable-alpine` to serve static files. `nginx.conf` contains SPA `try_files` fallbacks for `/plugin/` and `/cli/` routes, plus 301 redirects from legacy paths to `/plugin/`.
- **CI/CD:** GitHub Actions (`.github/workflows/build.yml`) triggers on version tags (`v*.*.*`), builds the Docker image, pushes to Docker Hub, and deploys via SSH.
- **Node version:** >= 18.0 (Docker build uses Node 20).

## Important Files

| File | Purpose |
|------|---------|
| `docusaurus.config.ts` | Site config, plugins, navbar, themes |
| `sidebars.ts` / `sidebars-cli.ts` / `sidebars-csc.ts` / `sidebars-deployment.ts` | Sidebar navigation definitions |
| `test-chinese-check.js` | Standalone script to detect Chinese characters in `docs/` |
| `scripts/pre-push` | Git hook enforcing the Chinese-content rule |
| `AGENTS.md` | Additional project-specific AI agent guidelines (read before large changes) |
