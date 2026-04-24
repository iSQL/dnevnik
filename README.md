# Dnevnik

Gejmifikovani dnevnik za svakodnevno napredovanje. Mobile-first PWA, srpski (latinica).

Svaka obavljena obaveza daje XP jednoj od šest veština — **Kondicija**, **Intelekt**, **Disciplina**, **Kreativnost**, **Društvenost**, **Blagostanje** — koje se prikazuju kao heksagonalni radar na početnom ekranu. Bez backenda; sve lokalno u IndexedDB-u (Dexie). Radi offline čim se prvi put učita.

## Stack

- **Vite 5** + **React 18** (JSX, bez TypeScripta za v1)
- **Dexie 4** (IndexedDB) + `dexie-react-hooks` live queries
- **React Router 6** (HashRouter — radi iz `file://`)
- **vite-plugin-pwa** (Workbox service worker, offline-first)
- **@fontsource/nunito** + **@fontsource/jetbrains-mono** (offline fontovi)

## Pokretanje

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # produkcijski build u dist/
npm run preview   # preview produkcijskog builda + aktivan service worker
```

Pri prvom pokretanju Dexie inicijalizuje šest veština i seed-uje podrazumevane zadatke iz svakog modula. Stanje ostaje u IndexedDB-u između sesija — otvori DevTools → Application → IndexedDB → `dnevnik` da pogledaš.

## Modularnost

Svaka životna kategorija je samostalan folder u [src/modules/](src/modules/) koji eksportuje manifest. Dodavanje nove kategorije = kopiraj [`_template/`](src/modules/_template/), popuni manifest, reloaduj dev server. Bez izmena u core-u.

```js
// src/modules/<id>/manifest.js
export default {
  id: 'reading',
  name: 'Čitanje',
  stat: 'intellect',             // jedna od šest veština
  icon: 'Reading',               // ključ iz src/ui/icons.jsx
  color: 'var(--sand)',
  soft: 'var(--cream-2)',
  order: 50,
  flavor: 'Stranice se same ne okreću',
  defaultQuests: [
    { name: 'Pročitaj 20 strana', difficulty: 'easy', schedule: 'daily' },
  ],
};
```

[src/core/module-registry.js](src/core/module-registry.js) koristi `import.meta.glob('../modules/*/manifest.js', { eager: true })` pa se svaki modul auto-registruje. Folderi sa prefiksom `_` (poput `_template/` i `_shared/`) se preskaču.

## XP engine

Moduli zovu jedinu funkciju:

```js
import { xpEngine } from './core/xp-engine.js';
await xpEngine.award('fitness', 50, { source: 'quest', questId });
```

Engine ([src/core/xp-engine.js](src/core/xp-engine.js)) unutar jedne Dexie transakcije:
1. uvećava `stats[stat].xp`,
2. dodaje red u `completions` (za radar, heatmapu, osvrt),
3. preračunava nivo iz krive `xpForLevel(n) = 100·n·(n+1)`,
4. emituje `xp-gained`, i `level-up` ako je nivo porastao.

Achievements watcher ([src/core/achievements.js](src/core/achievements.js)) sluša `xp-gained`/`level-up` i automatski otključava trofeje iz statičkog kataloga (9 za v1).

## Struktura

```
src/
├── main.jsx                    Bootstrap, HashRouter, seed-ovanje baze
├── App.jsx                     Ruter (7 ekrana) + Toast
├── styles.css                  Duolingo-energy chunky-card sistem
├── core/
│   ├── db.js                   Dexie šema + seed
│   ├── xp-engine.js            award(stat, amount)
│   ├── stats.js                6 veština, kriva nivoa, težine
│   ├── event-bus.js            Mini pub/sub
│   ├── module-registry.js      Auto-discovery modula
│   └── achievements.js         Katalog + watcher
├── ui/
│   ├── icons.jsx               Chunky SVG ikone
│   ├── primitives.jsx          Pill, XPBar, Check, ChunkCard
│   ├── HexRadar.jsx            6-osni SVG radar
│   ├── StatusBar.jsx, TabBar.jsx, Toast.jsx
├── screens/                    7 ekrana (Home, Quests, CategoryDetail, AddQuest, Stats, Achievements, Recap)
└── modules/                    4 modula u v1 + _template/ + _shared/ModuleDetail.jsx
```

## Ekrani

| Ruta | Ekran |
|---|---|
| `/` | Početna — radar + XP hero + današnji zadaci + tile-ovi modula |
| `/quests` | Lista zadataka grupisana dnevno/nedeljno/epski |
| `/c/:moduleId` | Detalj kategorije (lazy load manifest-ovog `Detail.jsx`) |
| `/add` | Novi zadatak (modul, težina, raspored) |
| `/stats` | Profil + radar + rangirane grane + lifetime statistika |
| `/achievements` | Trofejna soba sa filterima |
| `/recap` | Osvrt na nedelju (XP po granama, najaktivniji dan, istaknuto) |

## PWA

- Auto-update service worker kešira shell + assets; app radi punih funkcionalnosti offline (sve je lokalno).
- Manifest: `display: standalone`, `lang: sr-Latn`, violet theme color.
- Install prompt se pojavljuje u Chromium browserima kad je app posećen nekoliko puta.
- Ikone u [public/icons/](public/icons/) su placeholder violet-on-cream "D" glyphs — zameni pravim artwork-om pre deploy-a.

## Roadmap (v2)

- ASP.NET Core backend za cloud sync i multi-device auth.
- Push notifikacije za podsetnike o streak-u.
- Theme switcher (dark mode).
- `react-i18next` ako treba višejezičnost (za v1 je sve inline na srpskom).
- Testovi (Vitest) jednom kad se oblik stabilizuje.

## Licenca

[AGPL-3.0](LICENSE.md). Ako pokrećeš modifikovanu verziju kao servis, moraš da objaviš izmene.

## Design reference

Pixel-reference za vizuale dolazi iz Claude Design bundle-a u [design-reference/](design-reference/). Ne uvozi se u runtime — samo za čitanje tokom razvoja.
