# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Browser client (React 17 class components, rsuite UI, recharts) for the NINA.Plugin.Web plugin. It displays NINA astrophotography session history (timeline of events, image table/viewer, autofocus and quality charts). The built bundle is shipped as `nina-web-client.zip` and served by the plugin; there is no backend in this repo.

## Commands

Uses yarn scripts (a `yarn.lock` and `package-lock.json` both exist).

- `yarn start` — runs `startDevServer.sh`: starts `superstatic` (port 9001, serves `test/webroot` session JSON), `camouflage` (port 9002, mock API from `test/mockapi/config.yml`), and webpack dev server (port 9000). `superstatic` and `camouflage` must be installed globally.
- `yarn build` — production build to `dist/` (also zips to `nina-web-client.zip` via ZipPlugin); `yarn build-staging` uses `config/webpack.stag.js`.
- `yarn test` — jest (jsdom). Single test: `yarn jest src/App.test.js -t "name"`. Note `src/App.test.js` is a placeholder that expects text that doesn't exist, so it fails.
- `yarn lint` / `yarn lint-fix` — eslint on `src` then prettier write. A husky pre-commit hook runs `eslint --fix` via lint-staged.

## Architecture

- **Data flow is polling of static JSON.** `utilities/AppState.js` owns two `JSONLoader`s: `/sessions/sessions.json` (reloaded every 10s) and `/sessions/<sessionKey>/sessionHistory.json` for the selected session. `JSONLoader` re-fetches and compares ETags to decide whether data changed (fetch returns 200 even on cache hits, so a 304 is never seen); callbacks fire with `cacheUsed` so unchanged data doesn't trigger re-render. `App.js` holds the top-level state and wires these callbacks.
- **Session keys** are timestamps like `20220412-071409`; `utils.js` has helpers (`sessionKeyToISO`, date formatting — dates are displayed ISO by design).
- `App.js` → `Session.js` → views (`EventChart`, `QualityChart`, `AutofocusChart`, `ImageTable`, `ImageViewer`, `Target`, `Event`). `sessionUtils.js` holds the derivation logic for session history data.
- **Image API:** `utilities/Api1020.js` calls the plugin's REST API (`PUT /api/1020/image/create`) to generate stretched/scaled image previews using options from `SettingsManager`. "1020" is the API version.
- **Settings** persist in `localStorage` via `SettingsManager`; settings reset when the stored version differs from `src/webClientVersion.json`. Bump that file (and `CHANGELOG.md`) for releases.
- **Dev proxying:** webpack dev server proxies `/sessions` → 9001 and `/api` → 9002. Mock sessions live in `test/webroot/sessions/` (many untracked dirs there are local sample data); API mocks in `test/mockapi/mocks/api/1020/`.
- Logging uses `consola` (level Trace in `App.js`); user-facing messages go through the in-app `Console` component.
- Code style: private class fields (`#x`), arrow-function class properties for callbacks; styles in `src/index.scss` and `src/custom.less`.
