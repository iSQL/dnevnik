# Dnevnik

Gejmifikovani dnevnik za svakodnevno napredovanje. Mobile-first PWA, srpski (latinica).

Svaka obavljena obaveza daje XP jednoj od šest veština — **Kondicija**, **Intelekt**, **Disciplina**, **Kreativnost**, **Društvenost**, **Blagostanje** — koje se prikazuju kao heksagonalni radar na početnom ekranu.

Lokalno-first: sve ostaje u IndexedDB-u (Dexie), radi offline čim se prvi put učita. Opcioni mali sync server ([server/](server/)) dodaje društvene fiče — kod za prijatelje, slanje zadataka, izazovi po granama — bez slanja sirovih podataka, samo nedeljnog rezimea.

## Stack

**Klijent (PWA)**
- **Vite 5** + **React 18** (JSX, bez TypeScripta za v1)
- **Dexie 4** (IndexedDB) + `dexie-react-hooks` live queries
- **React Router 6** (HashRouter — radi iz `file://`)
- **vite-plugin-pwa** (Workbox service worker, offline-first)
- **@fontsource/nunito** + **@fontsource/jetbrains-mono** (offline fontovi)

**Server (opciono, samo za društvene fiče)**
- **Node 20** + **Hono** + `@hono/node-server`
- **PostgreSQL 17** (`postgres` driver, raw SQL, mini migration runner)
- **Docker** + Coolify za deploy

## Pokretanje

**Klijent**

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # produkcijski build u dist/
npm run preview   # preview produkcijskog builda + aktivan service worker
```

Pri prvom pokretanju Dexie inicijalizuje šest veština i seed-uje podrazumevane zadatke iz svakog modula. Stanje ostaje u IndexedDB-u između sesija — otvori DevTools → Application → IndexedDB → `dnevnik` da pogledaš.

**Server** (opciono — samo ako hoćeš multiplayer)

```bash
cd server
cp .env.example .env          # popuni DATABASE_URL
# jednom kao postgres superuser, primeni provision.sql (vidi komentar u fajlu)
npm install
npm run migrate               # primeni sql/*.sql
npm run dev                   # http://localhost:8787 (ili PORT iz .env)
```

Klijent gađa server preko `VITE_API_URL` env vara (default: `http://localhost:13337`). Bez servera, sve fiče vezane za prijatelje su sakrivene — app radi punih funkcionalnosti lokalno.

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
├── main.jsx                    Bootstrap, HashRouter, seed + sync starter
├── App.jsx                     Ruter (8 ekrana) + Toast
├── styles.css                  Duolingo-energy chunky-card sistem
├── core/
│   ├── db.js                   Dexie šema + seed
│   ├── xp-engine.js            award(stat, amount)
│   ├── stats.js                6 veština, kriva nivoa, težine
│   ├── event-bus.js            Mini pub/sub
│   ├── module-registry.js      Auto-discovery modula
│   ├── achievements.js         Katalog + watcher
│   ├── backup.js               Izvoz / uvoz lokalnog profila u JSON
│   ├── api.js                  Fetch wrapper sa bearer auth-om (svi serverski endpointi)
│   ├── identity.js             userId / authSecret / friendCode u settings
│   └── sync.js                 Builder nedeljnog rezimea + push hook (initial + hourly + on-focus)
├── ui/
│   ├── icons.jsx               Chunky SVG ikone (Tab*, Ico*, IcoSend)
│   ├── primitives.jsx          Pill, XPBar, Check, ChunkCard
│   ├── HexRadar.jsx            6-osni SVG radar
│   ├── TabBar.jsx, Toast.jsx
│   ├── SendQuestModal.jsx      Bottom-sheet za slanje zadatka prijatelju
│   ├── CreateChallengeModal.jsx Bottom-sheet za pokretanje izazova
│   └── FriendsCards.jsx        Profil + inbox + izazovi + lista prijatelja (renderuje se u Osvrtu)
├── screens/                    Home, Quests, CategoryDetail, AddQuest, Stats, Achievements, Recap
└── modules/                    Moduli u v1 + _template/ + _shared/ModuleDetail.jsx

server/
├── src/
│   ├── index.js                Hono app — svi endpointi
│   ├── auth.js                 Bearer middleware (auth_secret → user)
│   ├── db.js                   Postgres connection pool
│   ├── codes.js                Friend code generator + UUID validator
│   └── migrate.js              Mini SQL-file migration runner
├── sql/                        001_init.sql, 002_auth_secret.sql, …
├── provision.sql               Jednokratno: kreira DB + app user (superuser)
├── Dockerfile                  Multi-stage Node 20 alpine
├── .dockerignore, .env.example
└── package.json
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
| `/recap` | Osvrt na nedelju (XP po granama, istaknuto) **+ profil, prijatelji, predlozi, izazovi** |
| `/friends` | Stari ulaz — redirect na `/recap` (multiplayer je integrisan u Osvrt) |

## PWA

- Auto-update service worker kešira shell + assets; app radi punih funkcionalnosti offline (sve je lokalno).
- Manifest: `display: standalone`, `lang: sr-Latn`, violet theme color.
- Install prompt se pojavljuje u Chromium browserima kad je app posećen nekoliko puta.
- Ikone u [public/icons/](public/icons/) su placeholder violet-on-cream "D" glyphs — zameni pravim artwork-om pre deploy-a.

## Multiplayer (opciono)

Server ne čuva nijedan sirov XP unos ili kompletiranje zadataka — samo to što klijent eksplicitno objavi. Identitet je lokalno generisan: `auth_secret` (UUID, privatni bearer) + `user_id` (UUID, javni) + `friend_code` (8 znakova, deljiv).

**Šta server vidi**
- `users` — handle, friend_code, last_seen
- `summaries` — jedan red po korisniku, JSON: nedeljni XP po grani, nivoi, poslednji trofeji, **i poslednjih 10 zadataka iz tekuće nedelje** (ime + moduleId + grana + amount + vreme). Klijent gura svaki sat + na fokus tab-a + ručno preko **Sinhronizuj** dugmeta na profilu.
- `friends` — simetrične veze
- `recommendations` — opaque quest payload + opciona poruka, status pending/accepted/declined
- `challenges` — par + grana + cilj + rok + status

**Šta server NE vidi**
- Pojedinačne kompletacije van tekuće nedelje
- Pojedinačne kompletacije starije od 10 najnovijih unutar nedelje
- Bilo koji podaci sa korisnika koji nemaju identitet kreiran (sekcija Prijatelji u Osvrtu)

> ⚠️ Imena tvojih zadataka ulaze u summary i vidi ih svaki tvoj prijatelj. Ako imaš zadatke sa intimnim/personalnim imenima, ne šalji ih ili nemoj postavljati profil. Per-quest privacy flag je v2 plan.

**Tok dodavanja prijatelja** — A unese B-jev `friend_code` u sekciji Prijatelji u Osvrtu, server kreira simetričnu vezu odmah. Bez friend request flow-a u v1; ko ne želi, ukloni vezu (DELETE simetrično briše obe strane).

**Tok predloga zadatka** — A pritisne paperplane ikonu na svom zadatku → bira prijatelja + opcionu poruku → klijent šalje quest payload (name, moduleId, difficulty, schedule). B vidi predlog u `Predlozi za tebe`. Prihvatanje insertuje novi red u lokalnu `db.quests`. Odbacivanje samo zatvara predlog.

**Tok izazova** — A izabere prijatelja → grana + cilj (XP) + rok → server čuva. Napredak se računa lokalno za sebe (iz `completions`), za protivnika iz njegovog poslednjeg pushed rezimea. Bez serverske arbitraže. Pošiljalac može otkazati pending; bilo koja strana može ukloniti odbijene ili istekle (sa proteklim deadline-om) izazove preko **Ukloni** dugmeta. Aktivni izazovi se ne mogu brisati.

**Sinhronizacija** — pored auto-pusha (sat + visibilitychange), profil u Osvrtu prikazuje "Poslednje: pre X" timestamp i ima **Sinhronizuj** dugme za ručni push. Korisno pre nego što pokažeš ekran prijatelju — guraš svoj svežiji rezime gore, prijatelj ga vidi kad tapne **Osveži** na svojoj listi.

**Endpointi**

```
POST   /me                       bootstrap / refresh handle (idempotent na auth_secret)
GET    /me                       identitet
POST   /sync                     push nedeljnog rezimea
GET    /me/summary               čitaj sopstveni rezime
POST   /friends                  { friend_code }
GET    /friends                  lista sa rezimeima joinovanim
DELETE /friends/:id              ukloni (simetrično)
POST   /recommend                { to, quest, note }
GET    /recommend/inbox          status filter (default: pending)
GET    /recommend/sent           istorija
POST   /recommend/:id/respond    { accept }
POST   /challenge                { to, stat, goal, deadline }
GET    /challenges               svi (poslati + primljeni)
POST   /challenge/:id/respond    { accept }
DELETE /challenge/:id            pošiljalac otkazuje pending; bilo ko briše declined ili expired
```

## Deploy na Coolify

Pretpostavlja se da već imaš Coolify instancu (mi koristimo na Hetzner VPS-u) i Postgres bazu (managed Coolify resource ili manuelno preko docker-compose-a — oba rade).

### 1. Push repo na git

Coolify pull-uje iz Github-a/Gitlab-a, pa server kod i Dockerfile moraju biti u remote-u.

### 2. Server (API)

**+ New Resource** → **Public Repository** (ili Private uz GitHub App):

| Polje | Vrednost |
|---|---|
| Repository | URL repo-a |
| Branch | `main` |
| Build Pack | **Dockerfile** |
| Base Directory | `/server` ← **kritično**, inače Coolify build-uje iz root-a i ne vidi Dockerfile |
| Port | `8787` |

**Networking sa Postgres-om** — Coolify-managed Postgres je već na `coolify` Docker mreži. Tvoj API kontejner posle deploy-a takođe će biti tu, pa može da resolve-uje Postgres po Coolify resource UUID-u kao hostname-u. Izvuci ga iz inspect-a:

```bash
docker inspect <postgres-container> --format '{{json .NetworkSettings.Networks.coolify.Aliases}}'
```

Hostname je nešto kao `yssskgs8o48cs08k0o48ss4s` (Coolify resource UUID). **Internal port** je uvek `5432` — ne onaj javni što si možda namestio (npr. `13337`).

**Env vars** u Coolify UI-u (samo vrednosti, **bez** `KEY=` prefiksa u value polju):

```
DATABASE_URL=postgres://dnevnik_app:STRONG_PASS@yssskgs8o48cs08k0o48ss4s:5432/dnevnik
ALLOWED_ORIGINS=https://dnevnik.tvojdomen.com
PORT=8787
```

> ⚠️ **Password gotchas**: izbegavaj URL-special karaktere (`@`, `:`, `/`, `?`, `#`, `%`, space). Ako su u password-u, URL-encode-uj (`@` → `%40`) ili — bolje — promeni na čistu alfanumeriku.
> ⚠️ Ne kucaj `DATABASE_URL=` u value polje. Coolify dodaje key automatski. Inače dobiješ `DATABASE_URL=DATABASE_URL=postgres://...` i parsiranje pukne.

**Deploy** → očekivani log:
```
dnevnik-server listening on http://localhost:8787
```

**Prva migracija** — jedanput posle prvog uspešnog boot-a, otvori Terminal tab u Coolify resource UI-u (ili `docker exec`):

```bash
npm run migrate:prod
# applying 001_init.sql
# applying 002_auth_secret.sql
# applied 2 migration(s)
```

Sledeći deploy-ovi neće ponovo primenjivati iste migracije (`_migrations` tabela ih prati).

**Domen** — Coolify daje `*.sslip.io` automatski uz Let's Encrypt SSL. Za vlastiti domen: A record na VPS IP → dodaj domain u Coolify resource → cert se sam podigne.

**Health check** (opciono, ali korisno) — Path `/health`, Port `8787`, Interval `30s`. Ako Postgres padne, ruta vraća non-200 i Coolify restartuje kontejner.

### 3. Client (PWA)

`VITE_API_URL` se peče u JS bundle pri build-u (Vite ne može da ga čita run-time-om), pa mora biti postavljen pre `npm run build`-a.

**+ New Resource** → **Public Repository**:

| Polje | Vrednost |
|---|---|
| Build Pack | **Static** (ili Nixpacks) |
| Build Command | `npm run build` |
| Publish Directory | `dist` |

**Build env var** (u Coolify UI-u, označi "Available during build" ako postoji checkbox):
```
VITE_API_URL=https://api.tvojdomen.com
```

**Alternativa** — commit-uj `.env.production` u repo root:
```env
VITE_API_URL=https://api.tvojdomen.com
```
Vite ga automatski koristi pri produkcijskom build-u. URL nije tajna (vidi se u JS bundle-u svejedno).

**Lokalni dev** ne menja se: `npm run dev` koristi default iz koda (`http://localhost:13337`), ignoriše `.env.production`.

### 4. Verifikacija

1. Otvori `https://api.tvojdomen.com/health` → očekuj `{"ok":true,"now":"..."}`.
2. Otvori PWA na produkcijskom URL-u → DevTools → Network → tapni **Sinhronizuj** na profilu → potvrdi da `/sync` request ide na produkcijski API, ne na `localhost:13337`.
3. Iz drugog browser/incognito prozora → kreiraj drugi profil → razmeni friend code-ove → testiraj kompletan tok (predlog + izazov).

## Roadmap

- Push notifikacije za podsetnike o streak-u, predlozima, izazovima.
- Theme switcher (dark mode).
- Federisani izvoz/uvoz na bazi snapshot-a (bez servera) za korisnike koji ne žele cloud.
- `react-i18next` ako treba višejezičnost (za v1 je sve inline na srpskom).
- Challenge progres izvan tekuće nedelje — trenutno se računa iz `weekXp`, što je dovoljno za izazove unutar jedne nedelje, ali ne pokriva višenedeljne.
- Testovi (Vitest) jednom kad se oblik stabilizuje.

## Licenca

[AGPL-3.0](LICENSE.md). Ako pokrećeš modifikovanu verziju kao servis, moraš da objaviš izmene.

## Design reference

Pixel-reference za vizuale dolazi iz Claude Design bundle-a u [design-reference/](design-reference/). Ne uvozi se u runtime — samo za čitanje tokom razvoja.
