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

Built to deploy on [Vercel](https://vercel.com) (free tier) with zero config — connect the repo
and it auto-detects Nuxt. Remember to set `NUXT_PUBLIC_WEB3FORMS_KEY` in the Vercel project's
environment variables so the contact form works in production.

```bash
npm run build     # production build
npm run preview   # preview production build locally
```
