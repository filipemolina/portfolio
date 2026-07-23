# Portfolio — Filipe Molina

Personal portfolio site. Nuxt 4 + TypeScript + Tailwind CSS, single-page, terminal/dev-inspired dark theme.

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
```

## Content

- `app/data/experience.ts` — work history (edit here when a new role/detail is added)
- `app/data/skills.ts` — grouped skills
- `app/data/projects.ts` — projects (add the future Svelte project here when it exists)
- `public/files/Resume_2026.pdf` — the downloadable résumé; regenerate this if the source
  `.docx` changes

## Deployment

Deployed to GitHub Pages at https://filipemolina.github.io/portfolio/ via
`.github/workflows/deploy-pages.yml`, which runs on every push to `main`:

1. `npm run generate` (static export) with `NUXT_APP_BASE_URL=/portfolio/` so assets resolve
   under the project-pages subpath.
2. Uploads `.output/public` as a Pages artifact and deploys it.

`public/.nojekyll` disables Jekyll processing so GitHub Pages serves the `_nuxt/` asset
directory (Jekyll ignores underscore-prefixed paths by default).

```bash
npm run generate  # static export (what CI runs)
npm run build     # production build (Node server output)
npm run preview   # preview production build locally
```
