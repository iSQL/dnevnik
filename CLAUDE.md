# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gamified daily-life diary PWA. Serbian (latinica) UI — keep all user-facing strings in Serbian latinica. Mobile-first, no backend, offline-first: everything lives in IndexedDB via Dexie. React 18 + Vite 5, plain JSX (no TypeScript in v1).

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Serve dist/ with active service worker (for PWA testing)
```

No test runner, linter, or formatter is configured. Do not add one unless asked.

## Architecture

### Six stats drive everything

All progression funnels into six fixed stats defined in [src/core/stats.js](src/core/stats.js): `fitness`, `intellect`, `discipline`, `creativity`, `social`, `wellbeing`. These IDs are load-bearing — DB rows, manifests, and UI all key off them. Do not rename or add stats without updating the Dexie seed, radar component, and every module manifest.

Level curve: `xpForLevel(n) = 100 * n * (n + 1)`. Difficulty → XP mapping (`easy`/`medium`/`hard`/`epic` → 10/25/60/150) is also in stats.js.

### XP engine is the only write path for progression

Modules never touch `db.stats` or `db.completions` directly. They call:

```js
await xpEngine.award(stat, amount, { source, questId, meta })
```

[src/core/xp-engine.js](src/core/xp-engine.js) does this inside a single Dexie `rw` transaction: bump `stats[stat].xp`, insert a `completions` row, recompute level, emit `xp-gained` (always) and `level-up` (if level changed) on the bus. Bypassing this path breaks the achievements watcher and the recap/heatmap queries.

### Event bus wires XP → achievements → toast

[src/core/event-bus.js](src/core/event-bus.js) is a tiny pub/sub. [src/core/achievements.js](src/core/achievements.js) subscribes on boot (see `startAchievementsWatcher` called from [src/main.jsx](src/main.jsx)) and unlocks trophies from a static catalog. The Toast UI also subscribes to bus events. New cross-cutting side-effects should hook the bus rather than being called inline from the engine.

### Modules auto-register via glob

[src/core/module-registry.js](src/core/module-registry.js) uses `import.meta.glob('../modules/*/manifest.js', { eager: true })` plus a lazy glob for `Detail.jsx`. Folders prefixed `_` (`_template/`, `_shared/`) are skipped by ID check. To add a life category: copy `src/modules/_template/`, rename folder + `id` to match, set `stat` to one of the six, set `icon` to a key in [src/ui/icons.jsx](src/ui/icons.jsx) (add one if missing), reload dev server. No core edits.

Manifest shape (see [src/modules/_template/manifest.js](src/modules/_template/manifest.js)): `id`, `name`, `stat`, `icon`, `color`, `soft`, `order`, `flavor`, `defaultQuests[]`. `defaultQuests` are seeded into `db.quests` exactly once per module via `db.settings.seededModules` tracking in [src/core/db.js](src/core/db.js:20-38) — adding quests to a manifest after first run will not backfill; users already have the old set.

### Dexie schema

Five tables, version 1 only (see [src/core/db.js](src/core/db.js)):
- `stats` — one row per stat ID, seeded on first launch
- `quests` — user-owned task definitions (`moduleId`, `schedule`, `difficulty`, `active`)
- `completions` — append-only log of every XP award; powers radar, heatmap, recap
- `achievements` — unlocked trophies with timestamps
- `settings` — key/value (currently used for seed tracking)

Bumping the schema requires `db.version(2).stores(...).upgrade(...)` — don't mutate v1 in place.

### Routing

[src/App.jsx](src/App.jsx) has 7 screens under a `HashRouter` (set in [src/main.jsx](src/main.jsx)). HashRouter is deliberate — the app must run from `file://` and as an installed PWA. Do not switch to `BrowserRouter`.

Category detail (`/c/:moduleId`) renders the module's `Detail.jsx` lazily. Most modules reuse [src/modules/_shared/ModuleDetail.jsx](src/modules/_shared/ModuleDetail.jsx) as the common detail component — build new ones on top of it unless the category genuinely needs a custom layout.

### Live queries everywhere

UI reads from Dexie via `dexie-react-hooks` `useLiveQuery`. Prefer this over manual `useEffect` + `db.table.toArray()` so screens react to XP awards without extra plumbing.

### Styling

One global [src/styles.css](src/styles.css) with CSS custom properties (`--fire`, `--violet`, `--coin`, `--mint`, `--pink`, `--lavender`, plus soft/cream neutrals). Components reference those vars rather than literal hex. The visual language is "Duolingo-energy chunky-card"; pixel reference images live in [design-reference/](design-reference/) and are never imported at runtime.

### PWA

`vite-plugin-pwa` with `registerType: 'autoUpdate'` in [vite.config.js](vite.config.js). Workbox caches shell + assets; app is fully functional offline because there is no network dependency. `display: standalone`, `lang: sr-Latn`. Icons in [public/icons/](public/icons/) are placeholders to be replaced before real deploy.

## Conventions

- UI copy is Serbian latinica. Code identifiers, comments, and commit messages are English.
- Keep new deps minimal — v1 explicitly avoids TypeScript, i18n, and a test framework.
- `window.xpEngine` is exposed in dev for console poking; don't rely on it from app code.
