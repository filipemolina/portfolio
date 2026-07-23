# Portfolio — Filipe Molina

Personal portfolio site. Vue 3 + Vite + TypeScript + Tailwind CSS, single-page,
terminal/dev-inspired dark theme.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173/portfolio/
```

The dev server serves under `/portfolio/` because that is the site's `base` (see below); the
root URL redirects there.

## Content

- `app/data/experience.ts` — work history (edit here when a new role/detail is added)
- `app/data/skills.ts` — grouped skills
- `app/data/projects.ts` — projects (add the future Svelte project here when it exists)
- `public/files/Resume_2026.pdf` — the downloadable résumé; regenerate this if the source
  `.docx` changes

## Tests

A Playwright suite covers every command's output, the input interactions, theme switching
(including the no-flash-on-reload guarantee), the easter eggs, and screenshot baselines at
1440x900 and 390x844.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # against the dev server
E2E_TARGET=preview npm run test:e2e   # against the production build (run npm run build first)

# against an already-deployed site — how to verify a Pages deploy
E2E_BASE_URL=https://filipemolina.github.io/portfolio/ npm run test:e2e
```

Screenshot baselines live in `tests/e2e/visual.spec.ts-snapshots/` and **are** committed.
They are machine-specific (Chromium build + font rendering), so this suite is not wired into
CI — doing that would need a containerized run. Update baselines with
`npx playwright test tests/e2e/visual.spec.ts --update-snapshots`, and only for changes you
have actually looked at.

## Deployment

Deployed to GitHub Pages at https://filipemolina.github.io/portfolio/ via
`.github/workflows/deploy-pages.yml`, which runs on every push to `main`:

1. `npm run build` — typechecks, then builds to `dist/`. `base: '/portfolio/'` in
   `vite.config.ts` makes assets resolve under the project-pages subpath.
2. Uploads `dist` as a Pages artifact and deploys it.

`public/.nojekyll` disables Jekyll processing. Vite's output directory (`assets/`) is not
underscore-prefixed so Jekyll would not skip it, but the file is zero-cost insurance and is
kept.

```bash
npm run build     # typecheck + production build to dist/ (what CI runs)
npm run preview   # serve dist/ locally
npm run typecheck # vue-tsc only
```
