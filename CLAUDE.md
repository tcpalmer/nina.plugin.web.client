# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Browser client (React 17 class components, rsuite UI, recharts) for the NINA.Plugin.Web plugin. It displays NINA astrophotography session history (timeline of events, image table/viewer, autofocus and quality charts). The built bundle is shipped as `nina-web-client.zip` and served by the plugin; there is no backend in this repo.

## Commands

npm scripts; `package-lock.json` is committed. Node version is pinned in `.nvmrc`.

- `npm start` — runs `scripts/startDevServer.js` (cross-platform; Ctrl+C or any server exiting stops all three): starts `superstatic` (port 9001, serves `test/webroot` session JSON), the mock API `test/mockapi/server.js` (port 9002), and webpack dev server (port 9000). `superstatic` must be installed globally.
- `npm run build` — production build to `dist/` (also zips to `nina-web-client.zip` via ZipPlugin; the prod bundle uses `publicPath: '/dist/'`, so serve it under `/dist/`); `npm run build-staging` uses `config/webpack.stag.js`.
- `npm test` — jest (jsdom). Single test: `npx jest src/App.test.js -t "name"`. Note `src/App.test.js` is a placeholder that expects text that doesn't exist, so it fails.
- `npm run lint` / `npm run lint-fix` — eslint on `src` then prettier write. A husky pre-commit hook runs `eslint --fix` via lint-staged.
- `npm run release [-- --dry-run] [--draft] [--yes]` — `scripts/release.sh` (via `scripts/release.js`, which uses Git for Windows' bash on Windows; needs `gh`, `jq`, `zip`): builds, zips `dist/` as `dist-{VERSION}.zip`, and creates GitHub release `v{VERSION}` with that asset and the matching `CHANGELOG.md` section as notes. VERSION is `dist/webClientVersion.json`; it must be strictly newer than the latest release and any existing `v*` tag. A real release requires master, a clean tree, and HEAD pushed. Add the CHANGELOG entry and bump `src/webClientVersion.json` first.

## Architecture

- **Data flow is polling of static JSON.** `utilities/AppState.js` owns two `JSONLoader`s: `/sessions/sessions.json` (reloaded every 10s) and `/sessions/<sessionKey>/sessionHistory.json` for the selected session. `JSONLoader` re-fetches and compares ETags to decide whether data changed (fetch returns 200 even on cache hits, so a 304 is never seen); callbacks fire with `cacheUsed` so unchanged data doesn't trigger re-render. `App.js` holds the top-level state and wires these callbacks.
- **Session keys** are timestamps like `20220412-071409`; `utils.js` has helpers (`sessionKeyToISO`, date formatting — dates are displayed ISO by design).
- `App.js` → `Session.js` → views (`EventChart`, `QualityChart`, `AutofocusChart`, `ImageTable`, `ImageViewer`, `Target`, `Event`). `sessionUtils.js` holds the derivation logic for session history data.
- **Image API:** `utilities/Api1020.js` calls the plugin's REST API (`PUT /api/1020/image/create`) to generate stretched/scaled image previews using options from `SettingsManager`. "1020" is the API version.
- **Settings** persist in `localStorage` via `SettingsManager`; settings reset when the stored version differs from `src/webClientVersion.json`. Bump that file (and `CHANGELOG.md`) for releases.
- **Dev proxying:** webpack dev server proxies `/sessions` → 9001 and `/api` → 9002. Mock sessions live in `test/webroot/sessions/` (many untracked dirs there are local sample data); API mock routes are in `test/mockapi/server.js`.
- Logging uses `consola` (level Trace in `App.js`); user-facing messages go through the in-app `Console` component.
- Code style: private class fields (`#x`), arrow-function class properties for callbacks; styles in `src/index.scss` and `src/custom.less`.
