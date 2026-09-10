# Mounir Abderrahmani — Portfolio & Admin CMS

> Data-driven personal portfolio with a Firebase-backed admin dashboard.
> Every project, metric, and link in this site is real and verified — see the
> strict [real-data policy](#real-data-policy) below.

[![Live Site](https://img.shields.io/badge/Live-mounir1.github.io-brightgreen?style=for-the-badge)](https://mounir1.github.io)
[![Deploy](https://github.com/mounir1/mounir1.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/mounir1/mounir1.github.io/actions/workflows/deploy.yml)
[![CI](https://github.com/mounir1/mounir1.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/mounir1/mounir1.github.io/actions/workflows/ci.yml)

## Overview

- **Live site**: <https://mounir1.github.io> (custom-routed via `CNAME`)
- **Admin dashboard**: <https://mounir1.github.io/admin> (requires Firebase auth)
- **Repository**: <https://github.com/mounir1/mounir1.github.io>
- **Resume PDF**: `/Mounir_Abderrahmani_Resume.pdf` — generated from the same
  verified data files by `scripts/generate_cv.py`

## Tech Stack

```
Frontend:   React 18 + TypeScript + Vite
UI:         shadcn/ui + Radix UI + Tailwind CSS
Backend:    Firebase (Auth + Firestore) with local-data fallback
Testing:    Vitest + Testing Library (see src/**/*.test.*)
Lint:       ESLint 9 flat config, react-hooks v7 compiler rules at "error"
Hooks:      husky + lint-staged pre-commit
Deploy:     GitHub Actions → GitHub Pages
```

## Architecture

### Data flow

All content (projects, skills, experience, links, testimonials, upcoming
items, settings) lives in Firestore collections. Each `use*` hook falls back
to verified defaults in `src/data/` / in-hook `DEFAULT_*` arrays when
Firebase is not configured (`isFirebaseEnabled === false`), so the site works
fully without credentials.

Key patterns:

- **Ensure-seeded upserts** — default fallback rows (stable ids like
  `d1…d12`) have no Firestore docs until first mutation; hooks materialise
  them with `setDoc` before editing and update via `setDoc(..., {merge:true})`,
  so "No document to update" can never throw.
- **Admin mode queries** — admin tabs call hooks with `adminMode = true`, which
  omits the `disabled == false` filter so hidden items stay visible and
  re-enablable.
- **Instant feature flags** — Settings switches auto-save immediately with
  toast feedback and rollback on failure.
- **Toast feedback** on every admin mutation across all tabs.

### Firestore collections

| Collection    | Managed by admin tab | Fallback source                |
|---------------|----------------------|--------------------------------|
| `projects`    | Projects             | `src/data/initial-projects.ts` |
| `skills`      | Skills               | `src/data/initial-skills.ts`   |
| `experience`  | Experience           | `src/data/initial-experience.ts` |
| `links`       | Links                | `DEFAULT_LINKS` in `useLinks.ts` |
| `testimonials`| Testimonials         | none (empty until added)       |
| `upcoming`    | Upcoming             | `DEFAULT_UPCOMING` in `useUpcoming.ts` |
| `settings`    | Settings             | `DEFAULT_SETTINGS` in `useSettings.ts` |
| `messages`    | Messages (read-only) | contact-form submissions       |

## Admin Dashboard

Access: navigate to `/admin`, or triple-click the signature in the footer.
Authentication: Firebase Auth (Google OAuth or email/password).

Tabs: **Overview** (stats), **Projects**, **Skills**, **Experience**,
**Links**, **Testimonials**, **Upcoming**, **Messages**, **Settings**
(feature flags, personal info, resume URL). Full CRUD with visibility /
featured toggles; changes reflect on the public site in real time.

## Development

```bash
git clone https://github.com/mounir1/mounir1.github.io.git
cd mounir1.github.io
npm install
npm run dev          # local dev server
```

Useful scripts:

```bash
npm run build        # production build (Vite)
npm run type-check   # tsc --build tsconfig.json
npm run lint         # ESLint
npm test             # vitest run
python3 scripts/generate_cv.py   # regenerate the resume PDF from data files
```

### Firebase configuration (optional)

Without credentials the site renders verified fallback data and the admin is
disabled. To enable live data, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...   # optional; enables Firebase Analytics
```

Firestore rules: public read, authenticated write (see repo history /
Firebase console for the deployed rules).

## Deployment

- **Platform**: GitHub Pages, deployed by `.github/workflows/deploy.yml` on
  push to `main`; CI (`ci.yml`) runs type-check, lint, and tests.
- **SPA routing on Pages**: `public/404.html` stores the requested path in
  `sessionStorage` (`spa_redirect`) and `index.html` restores it — deep links
  like `/admin` work despite Pages returning a 404 status.
- **SEO**: `sitemap.xml`, `robots.txt`, Open Graph / Twitter meta, structured
  data in `index.html`.

## Real-Data Policy

This repository enforces a strict accuracy rule: no fabricated metrics,
projects, testimonials, or dead links. Concretely:

- Every project URL in `src/data/initial-projects.ts` is curl-verified.
- Experience and skills entries are fact-checked against the actual
  repositories they reference.
- The resume PDF is generated from those same data files — not hand-edited.
- A data verifier script guards project data consistency.

See `ROADMAP.md` for the audit history and remaining tasks.

## Contact

**Mounir Abderrahmani** — Senior Full-Stack Developer

- Email: [mounir.webdev@gmail.com](mailto:mounir.webdev@gmail.com)
- GitHub: [github.com/mounir1](https://github.com/mounir1)
- LinkedIn: [linkedin.com/in/mounir1badi](https://linkedin.com/in/mounir1badi)
- Portfolio: [mounir1.github.io](https://mounir1.github.io)
