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

- Project root: `/home/filipe/IdeaProjects/portfolio` (Nuxt 4, git initialized, branch `main`)
- Dev server: was already running on **port 3210** (a stray-but-healthy child process from
  earlier; `kill` on the wrapper PID didn't kill it). Check `ps aux | grep nuxt` before
  starting a new one — Nuxt will refuse with "Another dev server is already running" if it's
  still alive. Reuse it if so.
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
- `app/components/{Home,About,Experience,Skills,Projects,Contact,Help}View.vue` — content
  views rendered inside the log. `ContactView.vue` contains the Web3Forms form logic
  (key read from `runtimeConfig.public.web3formsKey`, form hidden if key unset).
- `app/components/TerminalWindow.vue` — chrome (traffic lights, title bar, focus glow).
- `app/app.vue` — centers TerminalApp + `FooterSection.vue` on the page.
- Old `*Section.vue` components and `SectionHeading.vue` were **deleted**; their content
  was ported into the View components.

Styling: Tailwind (`@nuxtjs/tailwindcss`), custom `term-*` color tokens in
`tailwind.config.ts`, small helpers in `app/assets/css/main.css`.

## Verification state

- Typecheck: **clean** (`npm run typecheck`, i.e. `nuxi typecheck`).
- Playwright-driven interaction tests (typing, tab-complete, unknown command, pill click,
  `clear`) passed at 1440x900 and 390x844 via `playwright-core` against
  `/usr/bin/google-chrome` (scripts/screenshots were in the session scratchpad, now gone —
  re-create if needed; no Chrome extension is connected, use playwright-core).
- Production build: **needs re-running** — it passed once, but *before* the final
  type-safety edits to `commands.ts` and `TerminalApp.vue`. Run `npm run build` to confirm.

## Bugs already found and fixed (don't re-break these)

1. **v1 invisible name**: CSS typing animation to implicit `auto` width left the hero name
   at width 0. The typing keyframe approach was removed entirely.
2. **`clear` not shrinking the panel**: `scrollHeight` returns the element's own explicit
   inline height when that exceeds content height, so the shrink measured stale. Fix (in
   `useAutoHeightTransition.ts`): temporarily set `height: 'auto'` before reading
   `scrollHeight`, then restore. Keep that measurement dance intact.
3. **vue-tsc / typescript**: `typescript@^7` breaks `vue-tsc@3.3.8`
   (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Pinned `typescript@^5.9.3` — don't upgrade blindly.
4. **Headless screenshot quirks**: full-page captures ghost-duplicate fixed elements (the
   Nuxt DevTools button — dev-only, harmless), and artificially tall viewports break
   `vh`-based sizing. Test with real ~900px viewports + `scrollIntoViewIfNeeded()`.

## Immediate next steps (in order)

1. `npm run build` in the project root; fix anything it surfaces.
2. **Report to the user.** They have NOT yet seen or approved the v2 terminal redesign —
   their last message was the redesign request itself. Tell them: the site is now a single
   interactive terminal; how to use it (type `help`, `about`, `experience`, …, or click the
   pills); that resize is smoothly animated; that it fixes their bleed-through/scrolling
   complaints; and that it's running locally (port 3210) for them to try. Then iterate on
   their feedback.

## Outstanding decisions / tasks (blocked on the user)

- **Web3Forms access key** — needed for the contact form to render in production. Setup
  documented in `README.md` / `.env.example` (`NUXT_PUBLIC_WEB3FORMS_KEY`).
- **Deployment** — plan says GitHub repo + Vercel free tier (`*.vercel.app` subdomain,
  custom domain deferred). Not started; wait for the user's go-ahead.
- **Stack Stitcher screenshot** — `ProjectsView.vue` currently shows an illustrative TUI
  mockup; a real screenshot/GIF of the app would be better. (A recent separate session
  worked on stack-stitcher itself at `/home/filipe/Documents/projects/tui` and mentioned
  recordings — a real capture may now be easy to get.)
- **Phone number** — deliberately omitted from the site (flagged in the plan as a
  recommendation, user never overrode). Confirm before ever adding it.
- After user approval: end-to-end contact form test on the deployed site, Lighthouse pass,
  view on a real phone (all in the plan's Verification section).

## Working style notes for this user

- Filipe is a senior engineer — communicate concisely and technically, give pushback where
  warranted; he explicitly asked for feedback and pushback during the interview phase.
- He wants to see and approve things locally before deployment steps.
- Minimal humor in site content; credibility first.
