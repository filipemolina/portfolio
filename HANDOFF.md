# Handoff — Filipe Molina Portfolio (interactive terminal site)

> Written 2026-07-22 for the next agent continuing this work. Read this fully before touching code.

## What this project is

A personal portfolio site for Filipe Molina (senior software engineer, 10+ years, currently
unemployed) serving two goals equally: freelance client acquisition and full-time job
applications. Content comes from `/home/filipe/Documents/Curriculo/Resume_2026.docx` and
his GitHub project `github.com/filipemolina/stack-stitcher` (a Go TUI for Docker Compose).

Approved design direction: developer/terminal-inspired, dark, monospace, minimal humor.
The original approved plan is at
`/home/filipe/.claude/plans/i-m-a-software-developer-sunny-candy.md`, but note it describes
the **v1 scrolling-sections design, which has since been replaced** (see below).

## Where things live

- Project root: `/home/filipe/IdeaProjects/portfolio` (Vue 3 + Vite, git initialized,
  branch `main`)
- Dev server: `npm run dev`, served under `/portfolio/` (the site's `base`). A stray Nuxt
  dev server from an earlier session may still be alive on **port 3210** — harmless now that
  Nuxt is gone (no more global dev lock), but check `ps aux | grep -E 'nuxt|vite'` before
  assuming a port is free. The Playwright suite uses its own port, 3211.
- Résumé PDF served at `public/files/Resume_2026.pdf` (converted from the docx via
  headless libreoffice).

## Architecture (v2 — current)

The user rejected the v1 multi-section scrolling page ("header of the next section bleeding
at the bottom, weird navigation, scrolling doesn't feel right") and explicitly asked for:

> "Maybe the visitor can type commands on the terminal and that would make the terminal
> resize and show the content of the selected page. Make the resizing be animated smoothly
> but in a contemporary fashion. The terminal should show tips for the commands, make it be
> similar to commands on a real linux terminal."

So the entire site is now **one interactive terminal component**:

- `app/components/TerminalApp.vue` — the core. Holds the command log, input line with
  ghost-text autosuggestion (fish-style), Tab completion, ↑/↓ history, clickable pill
  buttons (accessibility fallback for non-technical visitors/recruiters), and renders the
  view components into the log.
- `app/data/commands.ts` — command registry (`about`, `experience`, `skills`, `projects`,
  `contact`, `resume`, `help`, `clear`, plus realistic aliases like `cat about.md`,
  `cd experience`, `whoami`, `ls`), `resolveCommand()`, `suggest()`, `completions()`.
- `app/composables/useAutoHeightTransition.ts` — FLIP-style smooth height animation for
  the panel (420ms, `cubic-bezier(0.16, 1, 0.3, 1)`, respects `prefers-reduced-motion`).
- `app/components/{About,Experience,Skills,Projects,Contact,Help}View.vue` — content views
  rendered inside the log. `ContactView.vue` is now plain links; the Web3Forms contact form
  was removed.
- `app/components/TerminalWindow.vue` — chrome (traffic lights, title bar, focus glow).
- `app/main.ts` — Vite entry: mounts `app.vue` on `#app` and imports the two stylesheets.
- `app/app.vue` — centers TerminalApp + `FooterSection.vue` on the page.
- `index.html` — Vite's entry document. Holds the title/meta/OG tags and the inline
  pre-paint theme script. **That script must stay ahead of the stylesheet and the app
  bundle** or the saved theme flashes on load; a test asserts this.
- Old `*Section.vue` components and `SectionHeading.vue` were **deleted**; their content
  was ported into the View components.

Styling: Tailwind v3 through the classic PostCSS pipeline (`postcss.config.js`), custom
`term-*` color tokens in `tailwind.config.ts`, small helpers in `app/assets/css/main.css`.
`tailwind.config.ts`'s `content` array is load-bearing — empty it and v3 emits no utilities
at all, leaving the site unstyled.

There are no auto-imports. Vue APIs, composables, and components are all imported
explicitly; that is deliberate, not an oversight to "fix" with `unplugin-auto-import`.

## Verification state

- Typecheck: **clean** (`npm run typecheck`, i.e. `vue-tsc --noEmit`).
- Playwright suite: **118/118 green** at 1440x900 and 390x844, against both the dev server
  and the production build. It is committed now (`tests/e2e/`, `npm run test:e2e`) — the
  earlier ad-hoc scratchpad scripts are gone and no longer needed. See README for how to run
  it and how to treat the screenshot baselines.
- Production build: **clean** (`npm run build` → `dist/`, assets under `/portfolio/`).

## Bugs already found and fixed (don't re-break these)

1. **v1 invisible name**: CSS typing animation to implicit `auto` width left the hero name
   at width 0. The typing keyframe approach was removed entirely.
2. **`clear` not shrinking the panel**: `scrollHeight` returns the element's own explicit
   inline height when that exceeds content height, so the shrink measured stale. Fix (in
   `useAutoHeightTransition.ts`): temporarily set `height: 'auto'` before reading
   `scrollHeight`, then restore. Keep that measurement dance intact.
3. **vue-tsc / typescript**: `typescript@^7` breaks `vue-tsc@3.3.8`
   (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Pinned `typescript@^5.9.3` — don't upgrade blindly.
4. **Headless screenshot quirks**: artificially tall viewports break `vh`-based sizing —
   test at real viewport heights (~900px). The suite's screenshot comparisons inject
   `tests/e2e/screenshot.css` to hide dev-only overlays.
5. **Playwright + hydration/mount races**: the prompt exists in the markup before the app
   has mounted, and keystrokes sent in that window are dropped. `tests/e2e/helpers.ts`'
   `ready()` waits for the prompt to be *focused* (which only happens in `onMounted`).
   Don't replace that with a bare visibility check.

## Outstanding decisions / tasks (blocked on the user)

- **Stack Stitcher screenshot** — `ProjectsView.vue` currently shows an illustrative TUI
  mockup; a real screenshot/GIF of the app would be better. (A recent separate session
  worked on stack-stitcher itself at `/home/filipe/Documents/projects/tui` and mentioned
  recordings — a real capture may now be easy to get.)
- **Phone number** — deliberately omitted from the site (flagged in the plan as a
  recommendation, user never overrode). Confirm before ever adding it.
- Lighthouse pass and a look on a real phone (from the original plan's Verification
  section) — still not done.
- Optional follow-up cleanups, deliberately kept out of the Vite migration: bumping Tailwind
  v3 → v4 (which would swap PostCSS for `@tailwindcss/vite`), and dropping the vestigial
  `class="dark"` / `darkMode: 'class'` pair — no `dark:` variants are used anywhere.

## Working style notes for this user

- Filipe is a senior engineer — communicate concisely and technically, give pushback where
  warranted; he explicitly asked for feedback and pushback during the interview phase.
- He wants to see and approve things locally before deployment steps.
- Minimal humor in site content; credibility first.
