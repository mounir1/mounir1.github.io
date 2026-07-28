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
npm run type-check   # TypeScript validation (tsc --noEmit)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run preview      # Preview production build locally
npm run clean        # Remove dist/ and Vite cache
npm run analyze      # Bundle size analysis
```

**Always run before committing:** `npm run lint && npm run type-check && npm run build`

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
| `master` | Backup mirror of `main` | Force-synced to `main` after deploys |
| `gh-pages` | Built site output | Auto-managed by Deploy workflow |

- **Never commit directly to `main`.** Create a feature branch, open a PR.
- PRs must pass CI (lint + type-check + build) before merge.
- `master` is a safety net only — do not develop on it.

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

## Code Conventions

- **Path alias:** `@/` maps to `src/`
- **No comments** unless explaining non-obvious logic (the codebase follows this)
- **Type safety:** Prefer `unknown` over `any` for error handling and external
  data. The `no-explicit-any` rule is currently a **warning** (not error) due to
  Firebase dynamic data — see ROADMAP for schema-typing plan.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`)
- **Line endings:** Git will normalize to LF; files use CRLF on Windows checkout

## Environment Variables

Config in `.env.production` (committed — Firebase keys are public in a SPA):

```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID,
VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID
```

## Known Technical Debt

See [ROADMAP.md](./ROADMAP.md) for the full issue-handling plan and priorities.
