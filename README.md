![CI](https://github.com/Kasia-Sikora/shopping-list-manager/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/Kasia-Sikora/shopping-list-manager/graph/badge.svg)](https://codecov.io/gh/Kasia-Sikora/shopping-list-manager)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Kasia-Sikora_shopping-list-manager&metric=alert_status&token=d5da033dbcab87142b5ad5685f032efbd04492ab)](https://sonarcloud.io/summary/new_code?id=Kasia-Sikora_shopping-list-manager)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

# Shopping List Manager

An **offline-first** shopping list app with nested drag-and-drop items. The local database is the source of truth, so the app works instantly with no network — a background sync engine reconciles changes with the backend when connectivity returns.

**🔗 Live demo:** https://shopping-list-manager-seven.vercel.app
**⚙️ Backend repo:** [shopping-list-manager-api](https://github.com/Kasia-Sikora/shopping-list-manager-api)

<!-- TODO: add a screenshot of the app -->

---

## Features

- **Offline-first** — every read/write hits IndexedDB first; the app is fully usable with no connection
- **Background sync engine** — queues offline changes and uploads them with exponential-backoff retries when back online
- **Bidirectional sync** — pulls remote changes on load, pushes local changes via the queue
- **Conflict resolution** — Last-Write-Wins on timestamps, with a documented upgrade path (see [below](#conflict-resolution--known-trade-offs))
- **Nested drag-and-drop** — reorder and re-nest list items (tree structure with depth + parent references)
- **Optimistic updates** — the UI never waits on the network
- **Keyboard navigation** and **dark / light theme**

## Architecture

The core idea is an **inversion**: the local store is the source of truth, and the server is something the app *syncs toward* — not the other way around.

```
UI (React)
   │
Zustand (in-memory state)
   │
IndexedDB  ── source of truth, works offline ──┐
   │                                            │
Sync Queue ──► Sync Engine ──► Backend API ──► PostgreSQL
              (retry, status)   (Next.js)      (Supabase)
```

- **IndexedDB** (via `idb`) is structured in three stores: `lists` (data), `sync_queue` (pending changes), `metadata` (`lastSync`, etc.).
- **The sync engine** reads the queue, uploads each change, and retries failures with exponential backoff. Items are removed from the queue as they succeed (outbox model).
- **The backend** is a clean layered Next.js API (`route → service → queries`) over Postgres, kept intentionally thin so collaboration features (auth, realtime) can be added later without a rewrite.

## Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19 · TypeScript (strict) · Vite · Zustand · `idb` (IndexedDB) · @dnd-kit · Tailwind CSS |
| **Backend** | Next.js API · PostgreSQL (Supabase) · `pg` |
| **Testing** | Vitest · Testing Library · fake-indexeddb |
| **CI/CD** | GitHub Actions · Codecov · SonarCloud · Vercel |

## Testing & CI/CD

- **150+ automated tests** — IndexedDB integration (against `fake-indexeddb`), sync-engine logic (queue, retries, conflict resolution), and component/interaction tests.
- **CI pipeline** (GitHub Actions on every push + PR): lint → test + coverage → build. Coverage is reported to **Codecov**; code quality/security to **SonarCloud**.
- **CD:** merges to `main` auto-deploy to **Vercel**.

```bash
npm test            # run the suite (watch)
npx vitest run      # run once (CI mode)
npm run coverage    # with coverage report
```

## Getting started

**Prerequisites:** Node 22+, npm. (The backend needs a Postgres/Supabase connection string.)

```bash
git clone https://github.com/Kasia-Sikora/shopping-list-manager.git
cd shopping-list-manager
npm install
npm run dev         # http://localhost:5173
```

**Environment** — the frontend reads the API base URL from an env var (falls back to `localhost:3000/api`):

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
```

Run the [backend](https://github.com/Kasia-Sikora/shopping-list-manager-api) locally (or point at the deployed API) for full sync. The app works offline without a backend.

## Conflict resolution & known trade-offs

Sync uses **Last-Write-Wins (LWW)** on `updatedAt` — simple and correct for a single user. Its known limitation: it resolves conflicts by discarding the losing version *wholesale*, so two devices editing the same list concurrently can lose one side's changes.

This is a deliberate MVP choice with a sequenced upgrade path where **only the merge policy changes** (the transport and queue stay put):

1. **Item-level merge + tombstones** — merge items as a set; per-item LWW
2. **Operation-based sync** — send operations, not whole-list snapshots
3. **CRDTs** — provably order-independent, no lost data

## Roadmap

- [ ] Item-level merge (no-data-loss conflict resolution)
- [ ] Real-time collaboration (Supabase Auth + Realtime)
- [ ] Shop-aware lists (auto-sort items by store department)
- [ ] Mobile UI/UX pass + PWA install

## Author

**Kasia Sikora** 
[GitHub](https://github.com/Kasia-Sikora)
[LinkedIn](https://www.linkedin.com/in/katarzyna-sikora/)
