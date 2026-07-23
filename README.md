# Portfolio — Filipe Molina

Personal portfolio site. Nuxt 4 + TypeScript + Tailwind CSS, single-page, terminal/dev-inspired dark theme.

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
```

## Contact form

The contact form on the site posts to [Web3Forms](https://web3forms.com) so no backend is
needed. To enable it:

1. Get a free access key at https://web3forms.com (just enter the destination email — instant,
   no approval wait).
2. Set it as an env var before building/running:
   ```bash
   NUXT_PUBLIC_WEB3FORMS_KEY=your-key-here npm run dev
   ```
   Or add it to a `.env` file (already gitignored):
   ```
   NUXT_PUBLIC_WEB3FORMS_KEY=your-key-here
   ```

Without a key set, the form simply doesn't render — the email/LinkedIn/GitHub links still work.

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
   under the project-pages subpath, and `NUXT_PUBLIC_WEB3FORMS_KEY` pulled from the
   `NUXT_PUBLIC_WEB3FORMS_KEY` repo secret so the contact form works in production.
2. Uploads `.output/public` as a Pages artifact and deploys it.

`public/.nojekyll` disables Jekyll processing so GitHub Pages serves the `_nuxt/` asset
directory (Jekyll ignores underscore-prefixed paths by default).

```bash
npm run generate  # static export (what CI runs)
npm run build     # production build (Node server output)
npm run preview   # preview production build locally
```
