# Comprehensive Tooling & Systems Analysis

> Audit of the portfolio's build, CI/CD, security, and operational tooling —
> with recommended additions for optimum performance and reliability.
> Last updated: 2026-07-20.

---

## Executive Summary

The project is a well-structured React + Firebase SPA with solid fundamentals
(code splitting, lazy loading, manual chunk strategy, Firestore security rules).
However, it lacked a CI quality gate, had 97 lint errors and 9 security
vulnerabilities blocking production, exposed GitHub tokens in git remotes, and
had no dependency-automation config. All critical issues are now resolved.
This document covers the full systems analysis and recommended additions.

---

## 1. Build System

### Current State

| Aspect | Tool | Status |
|--------|------|--------|
| Bundler | Vite 7.1.3 + Rollup | Healthy |
| Compiler | SWC (via @vitejs/plugin-react-swc) | Healthy |
| Minifier | Terser (drop_console, 2 passes) | Healthy |
| Target | ES2020 | Appropriate |
| Dev server | Vite (port 8080, CORS enabled) | Healthy |

### Analysis

**Strengths:**
- Manual chunk strategy (`vite.config.ts:34-111`) is well-reasoned: separate
  vendors for React, Router, Firebase, Radix, icons, Query, forms, utils
- Firebase single-chunk rule correctly prevents circular TDZ crashes
- Terser config removes console output in production
- Asset file naming separates JS/CSS/images into `assets/` subdirectories

**Weaknesses:**
- `firebase-vendor` chunk is **557 KB** — dominant bundle cost
- `chunkSizeWarningLimit: 600` masks the Firebase problem
- No source maps in production (`sourcemap: false`) — complicates debugging
- `base: "/"` — correct for custom domain but would break project-page deploys

### Recommendations

1. **Tree-shake Firebase imports** — audit which services are actually imported.
   If only `auth` + `firestore` + `analytics` are used, ensure no `storage`,
   `messaging`, or `app-check` imports leak in.

2. **Conditional source maps** — generate source maps in production but upload
   to Sentry (not deploy to Pages) for error traceability:
   ```ts
   sourcemap: mode === 'production' ? 'hidden' : true
   ```

3. **Bundle budget enforcement** — add a `vite-bundle-visualizer` CI step that
   fails if any chunk exceeds a threshold (e.g., `firebase-vendor > 600 KB`).

---

## 2. CI/CD Pipeline

### Current State (after fixes)

| Workflow | Trigger | Steps |
|----------|---------|-------|
| CI | push/PR → main, master | lint → type-check → build → upload artifact |
| Deploy | workflow_run (CI success, main only) | checkout → install → build → deploy to gh-pages |

### Analysis

**Strengths:**
- Deploy is now gated on CI success (prevents broken deploys)
- `workflow_run` trigger ensures CI completes before deploy fires
- Concurrency groups prevent parallel runs
- Build artifacts retained 7 days for debugging

**Weaknesses:**
- No branch protection rules (direct pushes to `main` still possible)
- No environment-level approval gate for production deploys
- No cache for `dist/` between CI and Deploy (Deploy re-builds)
- Deploy uses `peaceiris/actions-gh-pages@v4` (third-party) rather than the
  official `actions/deploy-pages@v4`

### Recommendations

1. **Branch protection** — enable via GitHub repo settings:
   - Require PR + CI checks before merge to `main`
   - Disallow force-push to `main`

2. **Switch to official Pages deployment** — replace
   `peaceiris/actions-gh-pages` with GitHub's native
   `actions/deploy-pages@v4` + `actions/configure-pages@v4`. This uses the
   Pages API (no branch pushing) and integrates with GitHub environment
   secrets.

3. **Cache the build artifact** — CI uploads `dist/` as an artifact; Deploy
   could download and reuse it instead of rebuilding:
   ```yaml
   - uses: actions/download-artifact@v4
     with: { name: dist-${{ github.event.workflow_run.head_sha }}, path: dist }
   ```

4. **Add a deployment environment** — create a `production` GitHub environment
   with required reviewers for the Deploy workflow.

---

## 3. Dependency Management

### Current State

| Aspect | Status |
|--------|--------|
| Lockfile | `package-lock.json` (npm, committed) |
| Audit | 0 vulnerabilities (was 9) |
| Dependabot | Weekly npm + github-actions (newly added) |
| Major-version control | Blocks react/firebase/vite majors |

### Analysis

**Strengths:**
- Dependabot groups Radix/ESLint/types to reduce PR noise
- Major version bumps of core frameworks are blocked for manual review
- `npm ci` used in CI (deterministic install from lockfile)

**Weaknesses:**
- 6 open Dependabot PRs need triage after CI merges
- No `renovate` alternative considered (Dependabot is sufficient here)
- No license compliance check

### Recommendations

1. **Triage open Dependabot PRs** — after this branch merges and CI runs on
   them, merge in priority order: #18 (critical) → #11 → #14 → #15 → #17 → #19.

2. **Add license checking** — `license-checker` or `license-checker-ci` to
   reject GPL/AGPL dependencies in CI.

3. **Pin Actions to SHAs** — Dependabot updates action *versions*, but for
   supply-chain security, pin all `uses:` to commit SHAs (with a comment for
   the version):
   ```yaml
   uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
   ```

---

## 4. Security

### Current State

| Aspect | Status |
|--------|--------|
| Firestore rules | Public-read, owner-write, contact public-create |
| Auth | Firebase (Google OAuth + Email/Password) |
| Env vars | `.env.production` committed (Firebase keys are public in SPA) |
| Tokens in git remotes | **Fixed** (stripped; was exposed) |
| npm audit | 0 vulnerabilities |
| Secret scanning | None |

### Critical Finding: Exposed GitHub PATs

Two Personal Access Tokens were embedded in local git remote URLs:
- `origin`: `ghp_l4Jt...If1` (full value redacted — ROTATE THIS TOKEN)
- `github-token`: `ghp_wU5F...yHb` (full value redacted — ROTATE THIS TOKEN)

**Remediation applied:** Tokens stripped from all remote URLs. Auth now via
SSH keys + Git Credential Manager.

**Action required by owner — revoke both tokens NOW:**

1. Go to https://github.com/settings/tokens
2. Find and delete both tokens (they have `repo` + `workflow` scopes)
3. If any automation relied on them, create a new fine-grained PAT with
   minimal scope, store it as a GitHub repository secret
   (`Settings → Secrets and variables → Actions`), never in git config
4. Run `git credential reject` to clear any cached credentials:
   ```bash
   printf "protocol=https\nhost=github.com\n" | git credential reject
   ```

**Historical leak note:** `docs/PERFORMANCE_MONITORING.md` (deleted in current
tree but present in git history at commit `b02028df`) contained a placeholder
`GITHUB_TOKEN=ghp_...`. The actual token value was a placeholder string, but
audit the full history if concerned:
```bash
git log --all -p -S "ghp_" -- docs/
```

### Recommendations

1. **Enable GitHub secret scanning** — `Settings → Code security → Secret
   scanning` (free for public repos). Alerts on any token patterns committed.

2. **Enable push protection** — blocks commits containing known secret patterns
   before they reach the repo.

3. **Replace Firestore email-based owner check** — `firestore.rules:16` uses
   `request.auth.token.email == "mounir.webdev@gmail.com"`. If that email is
   compromised, an attacker gains write access. Replace with a Firebase Auth
   UID check:
   ```
   request.auth.uid == "your_actual_uid"
   ```

4. **Add App Check** — Firebase App Check protects Firestore from unauthorized
   clients. `@firebase/app-check` is already in `optimizeDeps.exclude` — wire
   it up with reCAPTCHA Enterprise or DeviceCheck.

---

## 5. Code Quality & Linting

### Current State

| Tool | Config | Status |
|------|--------|--------|
| ESLint | `eslint.config.js` (flat config, TS-eslint) | 0 errors, 97 warnings |
| TypeScript | `tsconfig.app.json` (strict) | Clean |
| Prettier | None | — |
| Husky | `.husky/_/` exists, no active hooks | Inactive |

### Analysis

**Strengths:**
- Flat ESLint config (ESLint 9 modern format)
- `react-hooks` recommended rules enabled
- TypeScript strict mode
- `no-unused-vars` configured

**Weaknesses:**
- 97 `no-explicit-any` warnings (Firebase dynamic data untyped)
- No Prettier (formatting inconsistent: tabs in `tailwind.config.ts`, spaces elsewhere)
- No pre-commit hooks
- No import sorting enforcement

### Recommendations

1. **Add Prettier** — install `prettier` + `eslint-config-prettier`, add
   `.prettierrc`:
   ```json
   { "semi": true, "singleQuote": false, "printWidth": 100, "tabWidth": 2 }
   ```

2. **Activate Husky pre-commit** — add `.husky/pre-commit`:
   ```bash
   npx lint-staged
   ```
   Add to `package.json`:
   ```json
   "lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }
   ```

3. **Add `eslint-plugin-import`** — enforce import ordering and ban
   circular dependencies.

4. **Type the Firestore layer** — the 97 `any` warnings are tracked in
   ROADMAP P1. Define Zod schemas → infer types → replace `any`.

---

## 6. Testing

### Current State

| Layer | Status |
|-------|--------|
| Unit tests | **None** |
| Integration tests | **None** |
| E2E tests | **None** |
| Type tests | `tsc --noEmit` (clean) |

### Analysis

This is the **largest gap** in the project. There is zero test coverage. The
admin CRUD operations, form validation, and Firestore data flows are entirely
untested.

### Recommendations

1. **Vitest for unit tests** — install `vitest` + `@testing-library/react` +
   `@testing-library/jest-dom`. Vite-native, zero config. Start with:
   - Utility functions (`lib/utils.ts`, `database-uploader.ts` validation)
   - Hooks (`useProjects`, `useSkills`) with mocked Firestore
   - Form validation schemas (Zod)

2. **Playwright for E2E** — test critical user paths:
   - Public site loads all sections
   - Admin login (email + Google)
   - CRUD: create/edit/delete a project
   - Contact form submission
   - Lazy-loaded section error boundary

3. **CI integration** — add a `test` job to `ci.yml`:
   ```yaml
   - name: Test
     run: npm test -- --coverage
   ```

4. **Coverage threshold** — enforce 60% minimum initially, increase over time.

---

## 7. Monitoring & Observability

### Current State

| Aspect | Status |
|--------|--------|
| Error tracking | `console.error` only |
| Analytics | Google Analytics 4 (via `gtag`) |
| Performance | No RUM, no Lighthouse CI |
| Uptime | None |

### Recommendations

1. **Sentry** — `@sentry/react` with source maps. Free tier (5K events/month)
   sufficient for a portfolio. Wrap `<Sentry.ErrorBoundary>` around the router.

2. **Lighthouse CI** — add `@lhci/cli` to a weekly workflow:
   ```yaml
   - run: npx lhci autorun --upload.target=temporary-public-storage
   ```
   Tracks performance scores over time and alerts on regressions.

3. **Uptime monitoring** — UptimeRobot (free) or GitHub Action pinging
   `https://mounir1.github.io` every 5 minutes.

---

## 8. Performance

### Current State (from build output)

| Chunk | Size | Notes |
|-------|------|-------|
| `firebase-vendor` | 557 KB | Dominant; single-chunk required |
| `Admin` | 141 KB | Lazy-loaded, OK |
| `react-vendor` | 140 KB | Standard |
| `radix-vendor` | 89 KB | Many Radix primitives |
| `misc-vendor` | 37 KB | OK |
| `notifications-vendor` | 33 KB | Sonner |
| `query-vendor` | 25 KB | TanStack Query |

### Recommendations

1. **Radix tree-shaking audit** — 89 KB of Radix suggests unused primitives are
   bundled. Check if all 26 `@radix-ui/*` packages in `package.json` are
   actually imported; remove unused ones.

2. **Critical CSS inlining** — Vite already does CSS code splitting; verify
   the above-fold Hero CSS loads synchronously.

3. **Image optimization** — `profile.webp` is used (good). Ensure all SVGs are
   inlined or cached. Consider `vite-imagetools` for responsive variants.

4. **Preconnect hints** — add to `index.html`:
   ```html
   <link rel="preconnect" href="https://firestore.googleapis.com" />
   <link rel="preconnect" href="https://www.googletagmanager.com" />
   ```

---

## 9. Tooling Summary Matrix

| Category | Tool | Have | Need | Priority |
|----------|------|------|------|----------|
| Build | Vite + SWC + Terser | Yes | — | — |
| Lint | ESLint 9 (flat) | Yes | — | — |
| Format | Prettier | No | Yes | P2 |
| Type-check | tsc (strict) | Yes | — | — |
| Test (unit) | Vitest | No | Yes | P1 |
| Test (E2E) | Playwright | No | Yes | P2 |
| Pre-commit | Husky + lint-staged | Partial | Yes | P2 |
| CI | GitHub Actions | Yes | — | — |
| Deploy | GitHub Pages | Yes | Migrate to native | P2 |
| Deps | Dependabot | Yes | — | — |
| Security | Secret scanning | No | Yes | P1 |
| Security | App Check | No | Yes | P2 |
| Error tracking | Sentry | No | Yes | P2 |
| Performance | Lighthouse CI | No | Yes | P3 |
| Uptime | UptimeRobot | No | Yes | P3 |
| Bundle visualizer | vite-bundle-analyzer | Script exists | CI integration | P3 |
| License check | license-checker | No | Yes | P3 |

---

## 10. Operational Runbook

### When CI fails
1. Check the failed job (lint / type-check / build)
2. Run locally: `npm run lint && npm run type-check && npm run build`
3. Fix, commit, push — CI re-runs automatically

### When a deploy doesn't update
1. Check CI passed on `main` (Actions tab)
2. Check Deploy workflow ran (triggered by `workflow_run` on CI success)
3. Verify `gh-pages` branch tip matches expected commit
4. Check GitHub Pages settings → source = `gh-pages` branch / root

### When Dependabot opens a PR
1. Wait for CI to run on the PR
2. If CI green: review diff, merge
3. If CI red: Dependabot will auto-rebase on conflict; otherwise fix manually

### When tokens need rotation
1. Revoke at https://github.com/settings/tokens
2. Create new fine-grained PAT (minimal scope) if needed for automation
3. Store as GitHub repo secret, never in git config or `.env`

---

## Conclusion

The project's foundation is solid. The critical blockers (lint, security,
CI, tokens, branches) are now resolved. The highest-impact next steps are:

1. **Add tests** (Vitest + Playwright) — the zero-coverage state is the biggest
   risk for a production site with an admin dashboard
2. **Type the Firestore layer** — eliminates 97 warnings and enables runtime
   validation via Zod
3. **Enable branch protection** — prevents direct pushes to `main`
4. **Revoke the exposed tokens** — the only remaining manual security action
