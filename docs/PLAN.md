# Plan — Dnevnik PWA (modular gamified life-tracker, v1)

## Context

The user exported a 7-screen React prototype from Claude Design (`Dnevnik` — playful/deadpan, Duolingo-energy, mobile-first, chunky-card aesthetic). **The prototype is visual reference, not the deliverable.** The real v1 is a client-only PWA with a modular architecture:

- **No backend in v1.** All state in IndexedDB via Dexie. ASP.NET Core cloud sync is scoped for v2.
- **Modular category system.** Each life category (routines, workout, education, tasks…) is a self-contained folder exporting a manifest. Adding a new category = copy `_template/`, register, done. Zero core changes.
- **Decoupled XP engine.** Modules call `xpEngine.award(stat, amount)`. Leveling curve, thresholds, and events centralized.
- **6 character stats:** `fitness`, `intellect`, `discipline`, `creativity`, `social`, `wellbeing`. Each module maps to one primary stat. Shown as a hex radar on the dashboard.

**Decisions locked with the user:**
- **v1 modules:** Routines, Workout, Education, Tasks (+ `_template/` starter).
- **Toolchain:** Vite + React 18 + `vite-plugin-pwa`.
- **Language:** Serbian Latin (srpski, latinica) — all UI copy, seed data, module names, and the deadpan witticisms from the prototype must be translated. English remains in code identifiers, comments, and module `id` slugs (`workout`, `routines`) so file paths/tokens stay ASCII.

The working directory `c:\Git\dnevnik\` is empty apart from `.claude/` — this is a greenfield project.

## Stack

| Concern | Choice |
|---|---|
| Bundler / dev server | Vite 5 |
| UI | React 18 (JSX, no TypeScript for v1 — keep velocity) |
| Routing | React Router 6 (HashRouter, so PWA works on `file://` and simple static hosts) |
| Storage | Dexie 4 (IndexedDB) |
| PWA | `vite-plugin-pwa` (Workbox under the hood — auto-generated service worker + manifest) |
| State | React Context over Dexie live queries (`dexie-react-hooks` → `useLiveQuery`). No Redux. |
| Fonts | Nunito + JetBrains Mono (self-hosted via `@fontsource/*` so offline works) |
| Styling | Plain CSS (adapted verbatim from prototype `styles.css`) + CSS variables |

## Directory layout

```
c:\Git\dnevnik\
├── index.html                      # Vite entry — <div id="root">, loads /src/main.jsx
├── package.json                    # deps + scripts (dev, build, preview)
├── vite.config.js                  # vite-plugin-pwa config: manifest, Workbox runtimeCaching
├── public/
│   └── icons/                      # PWA icons 192, 512, maskable
├── design-reference/               # copy of the prototype bundle for visual reference
│   └── (extracted dnevnik/project/ files, read-only during build)
└── src/
    ├── main.jsx                    # ReactDOM.createRoot, <RouterProvider>, <ModuleProvider>
    ├── App.jsx                     # shell: tabbar + <Outlet/>
    ├── styles.css                  # adapted from design-reference/styles.css (keep chunky-card system)
    ├── core/
    │   ├── db.js                   # Dexie schema (stats, completions, quests, achievements, settings)
    │   ├── xp-engine.js            # award(stat, amount), level curve, event emitter
    │   ├── stats.js                # the 6 stats, level curve helpers, xpForLevel()
    │   ├── module-registry.js      # imports every modules/*/manifest.js; exposes list()
    │   └── event-bus.js            # tiny pub/sub (used by xp-engine and achievements watcher)
    ├── ui/
    │   ├── icons.jsx               # adapted from prototype icons.jsx
    │   ├── primitives.jsx          # adapted from prototype ui.jsx (Pill, ChunkCard, XpBar, Check)
    │   ├── HexRadar.jsx            # 6-stat hex radar chart (SVG, derived from current stats)
    │   ├── StatusBar.jsx
    │   └── TabBar.jsx
    ├── screens/
    │   ├── Home.jsx                # XP hero + HexRadar + 4 module tiles + today's quests
    │   ├── CategoryDetail.jsx      # generic — reads :moduleId param, renders module's detail component
    │   ├── AddQuest.jsx            # quest creation flow (module picker + difficulty → XP preview)
    │   ├── Quests.jsx              # daily / weekly / epic grouped list
    │   ├── Stats.jsx               # profile + skill tree ranked by level
    │   ├── Achievements.jsx        # trophy room
    │   └── Recap.jsx               # weekly recap (derived from completion history)
    └── modules/
        ├── _template/              # copy me to add a new category
        │   ├── manifest.js         # {id, name, stat, color, icon, order, defaultQuests}
        │   ├── Detail.jsx          # category screen (quest list + heatmap + branch trophies)
        │   └── logic.js            # completion handlers — call xpEngine.award()
        ├── routines/               # stat: discipline
        ├── workout/                # stat: fitness
        ├── education/              # stat: intellect
        └── tasks/                  # stat: discipline  (tasks are discipline-flavored productivity)
```

## Core contracts

### Module manifest (`modules/<id>/manifest.js`)

```js
export default {
  id: 'workout',               // unique, matches folder name
  name: 'Workout',
  stat: 'fitness',             // one of the 6
  color: 'var(--fire)',        // tile + accent color (use tokens from styles.css)
  icon: 'Dumbbell',            // key into ui/icons.jsx
  order: 20,                   // home-grid sort
  defaultQuests: [             // seeded on first launch
    { name: 'Do 20 pushups', difficulty: 'easy' },
    { name: '30-min run',    difficulty: 'medium' },
  ],
  Detail: () => import('./Detail.jsx'),  // lazy-loaded detail screen
};
```

`core/module-registry.js` uses `import.meta.glob('../modules/*/manifest.js', { eager: true })` to auto-register every module. Adding a category truly is "copy `_template/`, done" — no core edit needed.

### XP engine (`core/xp-engine.js`)

```js
xpEngine.award(stat, amount, { source, meta })
  → tx: stats table update { xp += amount }, completions table append
  → recompute level from curve → if changed, emit 'level-up' { stat, level }
  → always emit 'xp-gained' { stat, amount, source }
```

Level curve: `xpForLevel(n) = 100 * n * (n + 1)` (classic Duolingo-ish quadratic — cheap early, compounding later). Centralized in `core/stats.js`.

Difficulty → XP: easy 10, medium 25, hard 60, epic 150. Single table in `core/stats.js`.

### Dexie schema (`core/db.js`)

```
stats:        &id, xp, level            // 6 seeded rows
quests:       ++id, moduleId, name, difficulty, schedule, active
completions:  ++id, questId, stat, amount, timestamp
achievements: &id, unlockedAt
settings:     &key, value               // theme, onboarding flags
```

Live queries via `dexie-react-hooks` → components auto-rerender when data changes. No global store.

### Events (`core/event-bus.js`)

Tiny `on/off/emit`. Consumers: achievements watcher (listens for `xp-gained` / `level-up` and unlocks trophies) + home screen toast on level-up.

## Screens (visual source-of-truth = prototype)

Each screen below corresponds to a file under `design-reference/project/` — read that JSX for exact layout, copy, colors, spacing. Don't copy the design-canvas wrapper or the artboard framing; those are prototyping chrome. Wire each screen to real Dexie data.

| Screen | Visual ref | Wiring |
|---|---|---|
| Home | `screens/home.jsx` | Replace 12-tile grid with 4-module grid from `moduleRegistry.list()`. Add `<HexRadar/>` above tiles fed by `db.stats`. |
| Quests | `screens/quests.jsx` | Group `db.quests` by `schedule` (daily/weekly/epic). Check-off → `xpEngine.award(quest.stat, xpForDifficulty(quest.difficulty))`. |
| Category detail | `screens/fitness.jsx` | Generic — route `/c/:moduleId` resolves manifest, lazy-loads `Detail.jsx`. Workout-specific layout lives in `modules/workout/Detail.jsx`. |
| Add quest | `screens/add-task.jsx` | Module picker sourced from registry. Difficulty tiers show XP preview from `xpForDifficulty`. Save → `db.quests.add()`. |
| Stats | `screens/stats.jsx` | Live-read `db.stats`, sort by level. |
| Trophy room | `screens/achievements.jsx` | Live-read `db.achievements`. Locked state for not-yet-unlocked. |
| Weekly recap | `screens/recap.jsx` | Aggregate `db.completions` for the last 7 days, group by stat, render bar chart + highlights. |

## PWA specifics

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`, `injectManifest` strategy not needed — use generated SW.
- **Offline-first**: `workbox.runtimeCaching` rule caches app shell + static assets. All data is local (Dexie), so app works fully offline out of the box.
- `manifest.webmanifest`: `name: "Dnevnik"`, `short_name: "Dnevnik"`, `display: "standalone"`, `background_color: "#FFF8EC"`, `theme_color: "#7C5CFF"`, orientation `portrait`, `lang: "sr-Latn"`, `dir: "ltr"`.
- `index.html` root: `<html lang="sr-Latn">`.
- Icons in `public/icons/` — placeholder violet-on-cream "D" glyph for v1; user can replace later.
- Viewport already mobile-first at 390×780 in the prototype; the PWA should be fluid (`max-width: 430px; margin: 0 auto;` container).

## Localization

Single-language for v1 — Serbian Latin, no i18n framework. All user-facing strings live inline in the JSX (no `en.json`/`sr.json` split — overkill for a one-locale app). If multi-language becomes a v2 requirement, refactor to `react-i18next` then.

Module manifest `name` uses Serbian labels (e.g. `name: 'Trening'`, `name: 'Rutine'`, `name: 'Učenje'`, `name: 'Zadaci'`). Stat display names also Serbian:

| Stat id (code) | UI label (sr-Latn) |
|---|---|
| `fitness` | Kondicija |
| `intellect` | Intelekt |
| `discipline` | Disciplina |
| `creativity` | Kreativnost |
| `social` | Društvenost |
| `wellbeing` | Blagostanje |

Seed quest examples (replace the prototype's English placeholders):
- Trening: "Uradi 20 sklekova", "Trčanje 30 minuta"
- Rutine: "Popij 2L vode", "Lezi u krevet pre 23h"
- Učenje: "Pročitaj 20 strana", "Reši 5 zadataka"
- Zadaci: "Isprazni inbox", "Plati račune"

Dates/numbers: use `toLocaleString('sr-Latn-RS')` where formatted output is shown to the user.

## Out of scope (explicitly, for v1)

- Cloud sync / auth / ASP.NET Core backend (v2).
- Push notifications.
- Theme switcher / dark mode (baked into stylesheet structure but not surfaced as a setting).
- Analytics.
- Tests — ship manual-test-driven; add Vitest once the shape stabilizes.

## Verification

1. `npm install && npm run dev` → app loads at `http://localhost:5173`, shows home with radar + 4 module tiles.
2. Open DevTools → Application → IndexedDB → `dnevnik` — 6 stats rows + seeded quests visible on first load.
3. Tap a quest checkbox → XP number + bar animate, stat level recomputes, radar redraws live (verify via `db.stats` in DevTools).
4. Trigger a level-up (award enough XP manually in DevTools console: `await xpEngine.award('fitness', 500)`) → level-up event fires, achievement unlock visible in Trophy Room.
5. Create a 5th module: `cp -r src/modules/_template src/modules/reading`, edit its manifest (stat: intellect), reload → new tile appears on home with zero core edits. Confirms the modular contract.
6. `npm run build && npm run preview` → build succeeds, service worker registered (Application → Service Workers in DevTools). Toggle "Offline" → app still loads and functions.
7. Lighthouse PWA audit → installable, offline-capable.
8. Install the PWA (Chrome install prompt) → launches in its own window as expected.
