# AGENTS.md

> Project guide for AI coding agents (and human contributors) working on this repository.

## Project Overview

Personal portfolio website for Mounir Abderrahmani — a production SPA built with
React 18 + TypeScript + Vite, backed by Firebase (Auth + Firestore) with an
admin dashboard for dynamic content management. Deployed to GitHub Pages via
GitHub Actions at [mounir1.github.io](https://mounir1.github.io).

## Essential Commands

```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build -> dist/
npm run type-check   # TypeScript validation (tsc --build tsconfig.json)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm test             # Vitest suite (jsdom + Testing Library), 162 tests
npm run test:coverage # Vitest with v8 coverage (lib/hooks/data)
npm run preview      # Preview production build locally
npm run clean        # Remove dist/ and Vite cache
npm run analyze      # Bundle size analysis
npm run finalize     # Release gate: required files + type-check + lint + tests
```

**Always run before committing:** `npm run lint && npm run type-check && npm test && npm run build`
(or `npm run finalize` for the first three).

## Pushing from this machine (port 22 is blocked)

`git fetch`/`git push` against `git@github.com:...` **hang indefinitely** on this
network: outbound SSH to port 22 never completes, and `core.sshCommand` is set
to a quiet `ssh` that suppresses the reason, so git only reports "Could not read
from remote repository". Two things are needed:

```bash
# 1. use GitHub's port-443 endpoint, 2. bypass the configured ssh command
export GIT_SSH_COMMAND='ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=8'
git push ssh://git@ssh.github.com:443/mounir1/mounir1.github.io.git <branch>
```

`ssh -T -p 443 git@ssh.github.com` is the quick reachability probe (it should
answer `Hi mounir1!`). Pushes are slow enough here to exceed a shell read
timeout, so run long ones detached and poll the log rather than blocking.

`gh` needs no SSH, but its **active account is `mabderrahmani-hotech`, not the
repo owner** — always scope PRs explicitly, or `gh` will 403:

```powershell
$env:GH_TOKEN = gh auth token -u mounir1
gh pr create --repo mounir1/mounir1.github.io --base main --head <branch> ...
```

## CI/CD Pipeline

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | push/PR to `main` or `master` | Lint + type-check + build quality gate |
| **Deploy** | `.github/workflows/deploy.yml` | `workflow_run` on CI success (main only) | Build + deploy to GitHub Pages (`gh-pages` branch) |

**Pipeline flow:** `push` → CI (lint+type+build) → [if `main` & CI green] → Deploy to Pages

Dependabot runs weekly (see `.github/dependabot.yml`) — groups Radix/ESLint/types, blocks major bumps of react/firebase/vite.

## Branch Strategy

| Branch | Role | Status |
|--------|------|--------|
| `main` | **Canonical default branch** | Active development, deploys to Pages |
| `master` | Backup snapshot of `main` | **Manual** force-sync — no automation |
| `gh-pages` | Built site output | Auto-managed by Deploy workflow |

- **Never commit directly to `main`.** Create a feature branch, open a PR.
- PRs must pass CI (lint + type-check + test + build) before merge.
- `master` is a safety net only — do not develop on it. **Nothing syncs it
  automatically**: there is no workflow keeping it current, so it silently goes
  stale after every merge. Re-sync explicitly with
  `git push --force ssh://git@ssh.github.com:443/mounir1/mounir1.github.io.git main:master`,
  after confirming its head is an ancestor of `main`
  (`git merge-base --is-ancestor <master-sha> main`) so nothing unique is lost.
  (This was documented as automatic but was not: `master` sat at the session-9
  commit `e5ffceaf` while `main` advanced four commits, until 2026-09-29.)

**Branch hygiene:** run `git fetch --prune` before creating branches, and delete
a feature branch once its PR merges (`gh pr merge --squash --delete-branch`).
Stale branches accumulate silently and make `git branch -vv` useless for triage.
Before deleting a branch that is not fully merged, check for unique work with
`git log --oneline main..<branch>`. If it holds anything worth keeping, preserve
it as an annotated tag first (`archive/<name>`) and push the tag — tags keep the
commits reachable, a deleted branch does not.

## Tech Stack

- **Framework:** React 18 + TypeScript 5.8 + Vite 7
- **UI:** shadcn/ui + Radix UI + Tailwind CSS 3
- **Backend:** Firebase (Auth + Firestore + Analytics)
- **State:** TanStack React Query (server state) + React hooks (local)
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod validation

## Architecture

```
src/
├── App.tsx                  # Root: QueryClientProvider + Router
├── main.tsx                 # Entry point
├── components/
│   ├── admin/               # Admin dashboard components
│   │   └── tabs/            # Admin tab panels (Projects, Skills, etc.)
│   ├── sections/            # Public site sections (Hero, Projects, Contact...)
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # React Query hooks (useProjects, useSkills, etc.)
├── lib/services/            # External API services (brandfetch)
├── pages/                   # Route-level pages (Index, Admin)
├── utils/                   # SW registration, DB uploader
└── data/                    # Seed data for Firestore collections
```

### Key Architectural Decisions

1. **Firebase single-chunk rule** — ALL `firebase/*` and `@firebase/*` packages
   are bundled into ONE chunk (`firebase-vendor`). Splitting them causes circular
   TDZ runtime crashes due to deep internal cross-references. See
   `vite.config.ts` manualChunks.

2. **Lazy-loaded sections** — Below-fold sections (Experience, Skills, Projects,
   etc.) use `React.lazy()` with per-section Error Boundaries for resilience.

3. **Firestore security** — All collections are public-read, owner-write.
   Owner is identified by email (`mounir.webdev@gmail.com`) in `firestore.rules`.
   Contact messages are public-create (form submissions), owner-read.

4. **Admin auth** — Firebase Auth (Google OAuth + Email/Password). Admin route
   is protected; access via `/admin`, signature triple-click, or footer button.

5. **Project data infrastructure** — Two-layer data model:
   - **`src/data/projects-index.ts`** — Registry mapping `C:\projects`/directories
     to canonical portfolio slugs (the single source of truth).
   - **`src/data/initial-projects.ts`** — Seed data with full project details
     (titles, descriptions, achievements, tech stack). Both layers must be kept
     in sync.
   - **`src/data/verify-project-data.ts`** — CLI fact-checker to validate that
     every portfolio entry matches a real directory on disk.
     Run with: `npx tsx src/data/verify-project-data.ts`
     (if `npx` is unavailable: `node node_modules/tsx/dist/cli.mjs src/data/verify-project-data.ts`)
   - **Publishing seed changes** — editing a seed file does NOT change live data
     until it is pushed: Admin → **Data Upload** → **Sync (update existing)**
     (console: `window.syncPortfolio()` / `window.syncCollection("projects")`).
     That rewrites docs whose title/name already exists **in place**, preserving
     Firestore ids and `createdAt`. *Seed All* only inserts missing rows;
     *Clear & Reseed* deletes and regenerates ids — recovery only.
   - **Canonical vocabularies** — `PROJECT_CATEGORIES` / `PROJECT_STATUSES` in
     `src/hooks/useProjects.ts` drive both the admin pickers and the public
     filter chips (which are derived from live data). Add a category there, not
     in the components.
   - **Binary assets** — `.gitattributes` marks PDFs/images as binary. The resume
     PDF generated by reportlab is ASCII85-only, so Git's text heuristic
     misclassified it; a CRLF conversion corrupts the xref table.
   - When adding a new project: (1) add entry to `projects-index.ts`, (2) add
     seed data to `initial-projects.ts`, (3) run verify script, (4) sync from the
     admin Data Upload tab.

6. **Index-free Firestore list queries** — All list hooks (`useProjects`,
   `useSkills`, `useExperience`, `useTestimonials`, `useLinks`, `useUpcoming`)
   read the whole collection with a bare `collection()` snapshot and
   filter/sort in the client. The
   composite indexes in `firestore.indexes.json` were declared but **never
   deployed** — server-side `where`+`orderBy` queries failed with "query
   requires an index", silently fell back to local seed data with phantom
   `local-*` ids, and admin writes against those ids no-oped or threw
   NOT_FOUND. Collections are ≤30 docs, so client-side sort is cheap and
   immune to missing-index regressions. Never reintroduce `orderBy()` in a
   list hook.

7. **Single Firestore write sanitiser** — EVERY `addDoc`/`updateDoc`/`setDoc`
   payload goes through `sanitizeDoc()` from `src/utils/firestore-write.ts`
   (deep-strips `undefined`, drops a top-level local `id`). Firestore rejects
   `undefined` values outright; optional form fields (e.g. Upcoming
   `category`) hit this on every save. `stripUndefined` is re-exported from
   `useSettings` for its unit tests. Admin tabs surface failures with
   destructive toasts instead of silent `return`s.
8. **Never precache HTML in `public/sw.js`** — Vite emits content-hashed chunk
   names and each deploy replaces the previous build, so a cached `index.html`
   points at files the next deploy deletes: the worker serves that document,
   the chunk request 404s, and the app cannot boot. Hard-refreshing does not
   help, because the worker answers before the network is consulted. Instead:
   cache-first only for `/assets/**` (safe *solely* because the name carries a
   content hash), network-first for navigations with `offline.html` as the
   fallback, and never `stale-while-revalidate` on a document. Bump
   `CACHE_VERSION` when the strategy changes so `activate` purges the old names
   — that is the only thing that repairs users who are already poisoned.
   `scripts/sw.test.ts` executes the real worker against injected globals;
   it fails 4 of 6 tests against the pre-fix version, so keep it that way.

9. **`/?sw=off` is the break-glass recovery path** — it unregisters every worker,
   deletes every cache and reloads, and runs in `main.tsx` *before* React mounts,
   because its whole purpose is the case where the app is too broken to render
   its own recovery UI. When a user reports a dead site that server-side checks
   say is healthy, this is the first thing to try. Because it must never throw,
   it checks for a callable `navigator.serviceWorker.getRegistrations` rather
   than `'serviceWorker' in navigator` — the latter is `true` for a
   defined-but-`undefined` property. See `src/utils/sw-registration.test.ts`.

10. **CV claims are guarded against seed-data drift** — `scripts/generate_cv.py`
    restates portfolio facts as Python literals instead of reading the seed data
    it is documented as generated from, and no build step runs Python.
    `scripts/generate-cv-claims.test.ts` asserts the headline numbers appear in
    both files, that the four unverifiable pre-verification metrics stay absent,
    and that the PDF is the exact file `useSettings.resumeUrl` links to.
    Regenerating the PDF (`python3 scripts/generate_cv.py`) is still manual and
    needs Python installed; the test makes forgetting it loud instead of silent.


## Code Conventions

- **Path alias:** `@/` maps to `src/`
- **No comments** unless explaining non-obvious logic (the codebase follows this)
- **Type safety:** Prefer `unknown` over `any` for error handling and external
  data. The `no-explicit-any` rule is currently a **warning** (not error) due to
  Firebase dynamic data — see ROADMAP for schema-typing plan.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`)
- **Line endings:** Git will normalize to LF; files use CRLF on Windows checkout
- **Tests:** Vitest + Testing Library, files sit next to the source as
  `*.test.ts(x)` (`vitest.config.ts`: jsdom, `src/test/setup.ts`). Mock
  `@/lib/firebase` and `firebase/firestore` with `vi.hoisted(...)` factories —
  see `useLinks.test.ts` (bare-collection assertions) and
  `database-uploader.test.ts` (admin sync engine) for the house style.
  `scripts/**` is included in the test glob for Node-side tooling.

## Environment Variables

Config in `.env.production` (committed — Firebase keys are public in a SPA):

```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID,
VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID
```

## Known Technical Debt

See [ROADMAP.md](./ROADMAP.md) for the full issue-handling plan and priorities.
