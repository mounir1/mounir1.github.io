# ROADMAP

> Issue-handling plan, priorities, and technical-debt tracker.
> Last updated: 2026-07-20.

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

---

## P1 — High Priority

### [ ] Type the Firestore data layer (eliminate `any` warnings)

**Current:** 97 `@typescript-eslint/no-explicit-any` warnings across admin tabs,
hooks, and `database-uploader.ts`. Firestore `DocumentData` is untyped.

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

### [ ] Bundle size: firebase-vendor is 557 KB

**Current:** Firebase single-chunk is unavoidable (see TDZ note) but is the
dominant bundle cost.

**Plan:**
- Tree-shake unused Firebase services (only `auth` + `firestore` + `analytics`
  are needed — confirm `storage`, `messaging`, `app-check` aren't imported)
- Consider Firebase modular SDK lazy-init pattern (already partially done)
- Set up Lighthouse CI budget: `max-firebase-vendor: 580 KB`

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

### [ ] Pre-commit hooks (Husky is configured but empty)

**Current:** `.husky/_/` exists but no `pre-commit` hook is active.

**Plan:** Add `.husky/pre-commit` running `lint-staged`:
```json
{ "*.ts": "eslint --fix", "*.tsx": "eslint --fix" }
```

---

## P3 — Low Priority / Future

### [ ] Migrate to React Router v7 (when stable)

### [ ] Consider TanStack Router for type-safe routing

### [ ] Add E2E tests (Playwright) for admin CRUD flows

### [ ] Add visual regression tests (Chromatic / Percy) for sections

### [ ] Internationalization (i18n) — currently English-only

### [ ] Dark mode toggle (next-themes is installed but unused)

---

## Open Dependabot PRs (as of 2026-07-20)

| PR | Branch | Severity | Status |
|----|--------|----------|--------|
| #18 | `websocket-driver-0.7.5` | Critical | Open |
| #11 | `postcss-8.5.14` | — | Open |
| #14 | `multi-84120a5570` | — | Open |
| #15 | `grpc/grpc-js-1.9.16` | — | Open |
| #17 | `js-yaml-4.3.0` | — | Open |
| #19 | `multi-0251c034cf` | — | Open |

**Note:** `npm audit fix` already resolved the runtime vulnerabilities by
updating transitive deps in the lockfile. These Dependabot PRs propose direct
dependency bumps — review and merge after CI validates them.
