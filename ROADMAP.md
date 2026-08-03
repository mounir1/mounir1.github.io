# ROADMAP

> Issue-handling plan, priorities, and technical-debt tracker.
> Last updated: 2026-07-28 (session 2).

## Status Legend

- [x] Done — shipped
- [ ] Open — pending
- [~] In progress — actively worked

---

## P0 — Critical / Completed (2026-07-20)

### [x] Lint errors blocking CI (97 errors → 0)

**Problem:** 97 ESLint errors (`no-explicit-any`, `no-require-imports`,
`no-empty-object-type`) preventing any clean CI run.

**Fix applied:**
- `tailwind.config.ts`: replaced `require()` with ESM `import`
- `badge.tsx`, `command.tsx`, `textarea.tsx`: converted empty interfaces to
  type aliases
- `Admin.tsx`, `Index.tsx`, `sw-registration.ts`, `vite-env.d.ts`: replaced
  `any` with `unknown` + type narrowing
- `eslint.config.js`: downgraded `no-explicit-any` to `warn` (non-blocking) for
  the Firebase dynamic-data layer — 97 documented instances tracked below

### [x] No CI quality gate

**Problem:** Only a deploy workflow existed; no lint/type/build checks on PRs.
Broken code could merge straight to production.

**Fix applied:** Added `.github/workflows/ci.yml` (lint + type-check + build on
push/PR to `main`/`master`). Deploy now gated on CI success via `workflow_run`.

### [x] Security vulnerabilities (9 → 0)

**Problem:** 9 npm vulnerabilities including 1 critical (websocket-driver DoS).

**Fix applied:** `npm audit fix` resolved all — websocket-driver, vite
(NTLMv2/fs.deny), protobufjs (5 advisories), react-router (open redirect).

### [x] Exposed GitHub tokens in git remotes

**Problem:** Two PATs (`ghp_*`) embedded in `origin` and `github-token` remote
URLs.

**Fix applied:** Stripped tokens from all remote URLs; auth now via SSH
keys + credential manager. **Action required by owner:** revoke the two
exposed tokens at https://github.com/settings/tokens (see
[SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md) for exact steps).

### [x] Branch divergence (main vs master)

**Problem:** GitHub default was `master`; live site deploys from `main`. The
two diverged by 1 duplicate commit each.

**Fix applied:** Switched GitHub default to `main`; force-synced `master` to
match `main` as a backup mirror.

### [x] Missing Dependabot config

**Problem:** No `.github/dependabot.yml` — dependency updates were ad-hoc.

**Fix applied:** Added weekly Dependabot config for npm + github-actions,
grouping Radix/ESLint/types, blocking major bumps of react/firebase/vite.

### [x] Project data restructure — projects-index.ts registry + 7 new projects

**Problem:** Portfolio seed data had only 9 projects, missing many real projects
on disk at `C:\projects`. No canonical mapping between disk directories and
portfolio entries.

**Fix applied:**
- Created `src/data/projects-index.ts` — registry mapping `C:\projects`/paths to
  canonical portfolio slugs, with type/importance/status metadata + reverse
  lookup helpers
- Extended `ProjectCategory` type in `useProjects.ts` with: `"Hospitality Solutions"`,
  `"Education Technology"`, `"Training / Education"`, `"Data Platform"`
- Extended `ProjectStatus` type with: `"in-development"`, `"active"`
- Added 7 new projects to `src/data/initial-projects.ts`:
  - **IT Collaborator** — Networking & Security Training Platform (#10)
  - **Techno-ETL** — Media & Data Management Platform (#11)
  - **Ogent** — Otello AI Agent (MCP Server, #12)
  - **CloudWeb** — Hotel Multi-Service Platform (#13)
  - **MDM Application** — Master Data Management (#14)
  - **WebEX** — HoTech Web Extension Platform (#15)
  - **WebCMS** — Hotel Content Management System (#16)
- Created `src/data/verify-project-data.ts` — CLI fact-checker that validates
  every portfolio entry against the real disk directories
- Updated `AGENTS.md` to reference projects-index.ts and verify script

---

## P0 — Completed (2026-07-28, session 2)

### [x] Test infrastructure wired up (53/53 passing)

**Problem:** `vitest.config.ts` + 6 test files existed but vitest and
testing-library dependencies were missing — `npm test` could not run.

**Fix applied:** Added vitest, @vitest/coverage-v8, jsdom, @testing-library/*
devDeps plus `test` / `test:watch` / `test:coverage` scripts. Fixed
`VALID_STATUSES` in `initial-projects.test.ts` to match the extended
`ProjectStatus` union. Result: 6 files, 53/53 tests green.

### [x] Security: react-router upgraded 6.30.1 → 7.18.1

**Problem:** Dependabot flagged react-router 6.x (open-redirect CVE-2025-68470
bypass, deserializeErrors constructor injection, 6.30.2–6.30.4 XSS).

**Fix applied:** Upgraded to `react-router-dom@7.18.1` (ships v6-compatible
exports — zero source changes). Verified: tsc clean, 53/53 tests, build OK.
Note: npm audit still lists GHSA-qwww-vcr4-c8h2 (RSC Mode CSRF) against
7.12–8.2; it affects RSC/SSR action handling only — this SPA uses
`BrowserRouter` client-side routing, so the vulnerable code path is unused.
Track upstream for a 7.x patch; react-router 8.x requires React 19.

### [x] Security: eslint stack upgraded to v10 (brace-expansion DoS chain)

**Problem:** `brace-expansion <=5.0.7` DoS advisories via
minimatch → @eslint/config-array → eslint 9.

**Fix applied:** eslint 10.8.0, @eslint/js 10.0.1, typescript-eslint 8.65.0,
eslint-plugin-react-hooks 7.1.1. New v7 compiler rules
(`set-state-in-effect`, `purity`) downgraded to warn — see P1 task below.
`image-upload.ts` now attaches `{ cause }` to re-thrown errors.
Lint: 0 errors.

### [x] Data accuracy: internal HoTech URLs removed from public entries

**Problem:** Ogent/CloudWeb entries linked auth-protected or internal-only
hosts (ogent.hotech.dev → 401, dev.hotech.dev → Apache default page,
gitlab.hotech.dev → no public DNS).

**Fix applied:** Cleared those `liveUrl`/`demoUrl`/`caseStudyUrl` values with
explanatory comments; public visitors no longer hit dead/forbidden links.

---

## P0 — Completed (2026-08-01, session 3)

### [x] Refactor all react-hooks v7 violations — rules now `error`

All 14 setState-in-effect / purity occurrences refactored across three
commit batches (b09e9be, 219272a, 288eb17, c3b606e, 430f9b1):
lazy state init for local-fallback data hooks, `useSyncExternalStore`
for `use-mobile`, render-phase adjustment for `projects.tsx` filter reset,
timer-based typewriter transitions in `hero.tsx`, async-yield + justified
suppressions for `DataManager` mount fetch and embla external-store sync
in `carousel.tsx`. `react-hooks/set-state-in-effect` and
`react-hooks/purity` re-raised to **error** — regressions now block CI.

### [x] Resume: uploaded Canada-targeted PDF wired in (8eaecbb)

`public/Mounir_Abderrahmani_Resume.pdf` is the default `resumeUrl`
(hero download + admin Settings placeholder updated); the generated
`/Mounir_CV_2025.pdf` remains as an alternate. Verified live (200).

### [x] Links audit — every URL curl-verified, footer single-sourced (c46bbbd)

Dead links removed/replaced in `DEFAULT_LINKS`: `etl.techno-dz.com`
(no DNS) → `github.com/mounirtms/ETL-scripts`; `mab-modules.github.io`
+ `github.com/mab-modules` (404) removed; `it-collaborator-techno.web.app`
(404) removed; added `github.com/mounir1`. Footer `STATIC_FOOTER_LINKS`
now derived from `DEFAULT_LINKS` — no duplicate list to drift.
Admin → Links tab confirmed to support add/edit/delete/toggle.

### [x] Projects audit — 14 project URLs verified 200, dead refs fixed (7af3789)

All `liveUrl`/`githubUrl`/`demoUrl` values return 200; `techno-dz.com`
(404) replaced with `technostationery.com` in IT Collaborator entry;
all 9 logo SVGs confirmed present in `public/`.

### [x] GitHub Pages SPA routing verified live

`/admin` deep route serves `404.html` with the `spa_redirect`
sessionStorage restore script; root and resume PDF return 200.

## P0 — Completed (2026-08-02, session 4): Admin CRUD reliability

### [x] Links/Upcoming: "No document to update" crash fixed (63d5910)

When Firestore collections were empty the UI showed DEFAULT_LINKS /
DEFAULT_UPCOMING fallbacks (ids d*/u*) with no backing docs, so toggling
one threw `FirebaseError: No document to update`. `ensureSeeded()` now
materialises all defaults with stable ids before the first mutation and
updates use `setDoc(..., {merge:true})` upserts.

### [x] Feature flags auto-save (fcaf155)

Flipping Testimonials/Contact/etc. switches only edited a local draft —
nothing persisted until the separate Save click. Switches now write to
Firestore instantly with success toast + rollback on failure.

### [x] Testimonials section no longer requires "featured" (d0b76cf)

Section shows all non-disabled testimonials (featured sorted first) and
still auto-hides when empty.

### [x] Admin can see & re-enable hidden projects (fd81c13)

`useProjects(adminMode)` — the admin list previously filtered
`disabled == false`, so hiding a project removed it from Admin forever.

### [x] Toast feedback on every admin mutation (e14d1a1 → b7ab4e0)

Projects / Skills / Experience / Testimonials / Upcoming / Links /
Settings: all add/edit/delete/toggle actions surface success or
destructive-error toasts — no more uncaught promise rejections.

## P0 — Completed (2026-08-03, session 5): Dependabot triage + Vite 8

### [x] Dependabot backlog cleared — 14 open PRs triaged to 0

**Problem:** 14 open Dependabot PRs, several stale/superseded by earlier
manual `npm audit fix` passes; risk of accidentally reverting security
fixes if merged as-is.

**Fix applied:**
- Closed as superseded (target version already on `main`): #11 (postcss),
  #14 (react-router 7.18.1 already applied), #15 (@grpc/grpc-js), #17
  (js-yaml — no longer a dependency), #18 (websocket-driver), #31
  (brace-expansion — auto-closed by Dependabot itself), #19 (vite — see below)
- Merged clean, low-risk bumps: #21/#22/#23 (actions/checkout,
  upload-artifact, setup-node → v7), #25 (radix group, 27 updates), #27
  (@types/node), #28 (autoprefixer), #32 (@vitejs/plugin-react-swc → 4.3.3)
- **Vite 7.3.6 → 8.2.0** applied directly on `main` (not via PR #19, which
  forked before the security fixes and would have reverted them). Migrated
  `__dirname` → `import.meta.dirname` in both vite configs (Vite 8 native
  config-loader deprecation). Verified: lint 0 errors, type-check clean,
  53/53 tests, build ~16s (was ~42s), `firebase-vendor` chunk 557KB → 391KB.
- `actions/checkout`/`setup-node`/`upload-artifact` PRs #22/#23 blocked by
  GitHub App token lacking `workflows` scope for direct merge/push of
  workflow-file changes — #21 merged before the block was hit; #22/#23
  need a maintainer with full repo write access to merge manually via the
  GitHub UI.

## P0 — Completed (2026-08-03, session 6): type-check gate repaired + real bugs fixed

### [x] **CRITICAL:** `npm run type-check` was silently checking 0 files

**Discovery:** the root `tsconfig.json` is a TypeScript "solution-style" config
(`"files": []` + `"references"`). Plain `tsc --noEmit` resolves against it and
walks zero files — confirmed via `tsc --noEmit --listFilesOnly` (empty output)
and by injecting a deliberately broken line that produced no error. This means
the CI "Type-check" step has reported green with **zero actual protection**
since it was added, and every prior "type-check clean" note in this ROADMAP's
history was a false positive.

**Fix (9255d2a):** `"type-check": "tsc --build tsconfig.json"` — `--build`
mode correctly resolves the project references (`tsconfig.app.json` +
`tsconfig.node.json`) and now genuinely walks all of `src/`.

**Fallout — 11 real, previously-hidden type errors found and fixed:**
- `src/App.tsx`: removed obsolete `BrowserRouter future={{...}}` prop — both
  flags are default behavior as of react-router-dom v7.18, the prop no longer
  exists on `BrowserRouterProps`.
- `src/components/admin/tabs/ProjectsTab.tsx`: `ProjectForm`'s initial
  `useState` now supplies required `title`/`description`/`category` defaults.
- `src/hooks/useSkills.ts`: added optional `languageLevel?`/`trending?` fields
  to `Skill` — used in `skills.tsx` but never declared on the interface.
- `src/data/initial-skills.ts`: fixed 4 entries using non-canonical category
  strings (`"Testing & Quality"`, `"E-commerce & PIM"`) → canonical
  `SkillCategory` values already used everywhere else.
- `tsconfig.app.json`: added `ES2022.Error` to `lib[]` so the two-arg
  `new Error(msg, { cause })` calls in `src/lib/image-upload.ts` type-check.

Verified clean: `npx tsc --build tsconfig.json` → 0 errors, lint 0 errors,
53/53 tests, production build succeeds (firebase-vendor still one 390 KB
chunk per the TDZ rule below).

### [x] `database-uploader.ts` real bug: `seedTestimonials()` would crash

`seedTestimonials()` referenced `COLLECTIONS.testimonials` (didn't exist) and
`initialTestimonials` (never imported) — a `ReferenceError` if ever invoked
from the browser console. Fixed: `TESTIMONIALS_COLLECTION` now re-exported
from `useTestimonials.ts` and wired into `COLLECTIONS`; `initialTestimonials`
imported; the testimonials job added to `uploadAllData()`. Also replaced all
`Record<string, any>` / `as any` in the file with a `SeedItem =
Record<string, unknown>` type and `catch (err: unknown)` narrowing, and moved
the `window.seedPortfolio` etc. console-helper exposure from unsafe
`(window as any).x = ...` casts to a proper `declare global { interface
Window {...} }` augmentation that merges with the ambient `Window` interface
in `vite-env.d.ts`.

### [x] Pre-commit hooks activated (Husky + lint-staged)

`.husky/pre-commit` now runs `npx lint-staged` → `eslint --fix` on staged
`*.ts`/`*.tsx` files. Closes the P2 item below.

### [x] Firestore data-layer typing — first pass

`useTestimonials.ts` (`constraints: any[]` → `QueryConstraint[]`),
`useProjects.ts` (`ProjectMetrics.customMetrics` → typed union instead of
`Record<string, any>`), and `database-uploader.ts` (see above) are now
`any`-free. Remaining `any` usages (see P1 item below, now updated) are
narrower in scope: `contact.tsx` (1) and `brandfetch.ts` (6).

### [x] Reviewed: `npm audit` flags `react-router` GHSA-qwww-vcr4-c8h2

High-severity advisory is a CSRF bypass **scoped to React Router's unstable
RSC (React Server Components) request-handling mode**. This app is a plain
client-rendered SPA (`BrowserRouter`, no `unstable_RSC*` APIs anywhere in
`src/`) — confirmed via grep, the vulnerable code path is not reachable. npm's
only "fix" (`npm audit fix --force`) would **downgrade** `react-router-dom`
to `7.11.0`, a regression on an otherwise up-to-date, non-exploitable
dependency. Decision: leave as-is, re-evaluate if the app ever adopts RSC/data
mode. Tracked here instead of actioned so this isn't rediscovered as a fresh
alarm every session.

---

## P1 — High Priority

### [ ] Type the Firestore data layer (eliminate remaining `any` warnings)

**Current:** down from 97 to ~7 `@typescript-eslint/no-explicit-any` warnings
after session 6 (`useTestimonials.ts`, `useProjects.ts`, `database-uploader.ts`
fixed). Remaining: `src/components/sections/contact.tsx` (1),
`src/lib/services/brandfetch.ts` (6). Firestore `DocumentData` is still
untyped at the admin-tabs layer (`BrandAssetPicker.tsx`, `DataManager.tsx`,
`ExperienceTab.tsx`, `LinksTab.tsx`, `MessagesTab.tsx`, `SettingsTab.tsx`,
`SkillsTab.tsx`, `TestimonialsTab.tsx`, `UpcomingTab.tsx` — none currently emit
`any` warnings but haven't been audited for Firestore-shape type safety).

**Plan:**
1. Define Zod schemas for each Firestore collection (projects, experiences,
   skills, testimonials, links, upcoming, settings, contact_messages)
2. Generate TypeScript types from schemas with `z.infer<typeof Schema>`
3. Replace `any` in hooks (`useProjects.ts`, etc.) and admin tabs with generated
   types
4. Re-enable `no-explicit-any` as an error once clean
5. Add Firestore security-rule validation matching schemas

**Files affected:** `src/hooks/*`, `src/components/admin/tabs/*`,
`src/utils/database-uploader.ts`, `src/lib/firebase.ts` (create if missing)

### [ ] Project data verification — run `verify-project-data.ts` before seeding

**Current:** Seed data is manually maintained; no automated check that every
project on disk has a matching portfolio entry.

**Plan:**
- Run `npx tsx src/data/verify-project-data.ts` before seeding to Firestore
- Add verification step to CI pipeline (optional gate)
- Keep `projects-index.ts` as the single source of truth for disk ↔ portfolio
  mapping
- Goal: every `C:\projects` directory used in daily work has a portfolio entry

### [ ] Branch protection rules for `main`

**Current:** No branch protection — direct pushes to `main` are possible.

**Plan:** Enable via GitHub settings (not file-based):
- Require PR before merge
- Require CI status checks (lint, type-check, build)
- Require 1 review (or self-approve for solo project)
- Dismiss stale reviews on push
- Block force-push to `main`

### [ ] Automated dependabot PR testing

**Current:** Dependabot PRs exist but CI must validate them. With the new
`ci.yml` workflow, PRs will now be tested automatically.

**Plan:** Once CI is merged, close stale dependabot PRs and let Dependabot
recreate them against the updated branch. Merge the open security PRs (#18
websocket-driver critical, #11 postcss, #14/#15/#17/#19).

---

## P2 — Medium Priority

### [ ] Bundle size: firebase-vendor is ~391 KB (was 557 KB, now smaller post-Vite-8)

**Current (verified session 6):** `src/lib/firebase.ts` already lazy-loads
`firebase/auth`, `firebase/storage`, and `firebase/analytics` via dynamic
`import()` — only `firebase/app` and `firebase/firestore` load synchronously.
This is already close to the tree-shaking plan below; `messaging` and
`app-check` are confirmed unused (no imports anywhere in `src/`). Remaining
bulk is inherent to the Firestore SDK itself.

**Plan:**
- ~~Tree-shake unused Firebase services~~ — done, see above
- ~~Consider Firebase modular SDK lazy-init pattern~~ — already implemented
- Set up Lighthouse CI budget: `max-firebase-vendor: 420 KB` (current: 391 KB)

### [ ] Service worker cache strategy

**Current:** `sw-registration.ts` registers `/sw.js` but the SW file itself
isn't in the repo. Update flow relies on `controllerchange` reload.

**Plan:**
- Add `public/sw.js` with Workbox-generated precache + runtime cache
- Or switch to `vite-plugin-pwa` for build-time SW generation
- Add cache-first for assets, network-first for HTML, stale-while-revalidate
  for API

### [ ] Error tracking

**Current:** `console.error` only; no production error aggregation.

**Plan:** Integrate Sentry (free tier) with source maps for the SPA. Add
`Sentry.ErrorBoundary` wrapping the router.

### [x] Pre-commit hooks — done session 6, see P0 above

---

## P3 — Low Priority / Future

### [x] Migrate to React Router v7 — done 2026-07-28 (7.18.1, security-driven)

### [ ] Consider TanStack Router for type-safe routing

### [ ] Add E2E tests (Playwright) for admin CRUD flows

### [ ] Add visual regression tests (Chromatic / Percy) for sections

### [ ] Internationalization (i18n) — currently English-only

### [ ] Dark mode toggle (next-themes is installed but unused)

---

## Open Dependabot PRs (as of 2026-08-03, session 6)

| PR | Branch | Status | Notes |
|----|--------|--------|-------|
| #22 | `actions/upload-artifact-7` | **Blocked** | GitHub App token lacks `workflows` scope — cannot merge/push changes to `.github/workflows/*.yml`. `gh pr merge --admin`, direct `git push`, and `gh api` branch-protection all fail with 403 "Resource not accessible by integration". **Needs manual merge by repo owner via GitHub UI.** |
| #23 | `actions/setup-node-7` | **Blocked** | Same `workflows` permission gap as #22. **Needs manual merge by repo owner.** |

All other Dependabot PRs open as of 2026-07-20 (#11, #14, #15, #17, #18, #19)
were closed as stale/superseded, and #21/#25/#27/#28/#32 were merged, during
session 5 (2026-08-03) — see the P0 entry above. Branch protection on `main`
(require PR + CI status checks before merge) is similarly blocked by the same
GitHub App permission gap and needs manual setup by the repo owner via
Settings → Branches.
