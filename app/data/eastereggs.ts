// Hidden commands for devs who type what they'd type in a real shell.
// Deliberately absent from help and tab completion — discovery is the point.

export type EggResult =
  | { type: 'text'; text: string }
  | { type: 'ascii'; text: string }
  | { type: 'neofetch' }
  | { type: 'vim' }
  | { type: 'destruct' }
  | { type: 'ssh'; os: 'xp' | 'mac' }
  | { type: 'ssh-error'; host: string }
  | { type: 'exit' }

const HIDDEN_LS = `drwxr-xr-x  filipe  .
drwxr-xr-x  filipe  ..
-rw-------  filipe  .env
drwxr-xr-x  filipe  .git
drwx------  filipe  .ssh
-rw-r--r--  filipe  about.md
drwxr-xr-x  filipe  experience/
-rw-r--r--  filipe  skills.json
drwxr-xr-x  filipe  projects/
-rwxr-xr-x  filipe  contact.sh
-rw-r--r--  filipe  resume.pdf`

const GIT_STATUS = `HEAD detached at 3f2a91c
interactive rebase in progress; onto 8c1d2ea
Last command done (14 of 37):
   pick 9a1f3e8 fix: fix the fix that fixed the hotfix
You are currently rebasing.

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   src/legacy/jquery-1.4.2.min.js
        both modified:   package-lock.json
        both modified:   yarn.lock
        both deleted:    .env.production

Changes not staged for commit:
        modified:   everything, basically (147 files)

Untracked files:
        node_modules.bak/
        final_v2_FINAL_this-one/
        untitled folder/
        deploy_friday_5pm.sh

(fix conflicts and then run "git rebase --continue")
(or honestly? maybe just re-clone.)`

const GIT_LOG = `3f2a91c (HEAD) feat: integrate LLM providers into production SaaS
8c1d2ea feat: joined Knak Inc. as Senior Frontend Engineer
5b9e04d refactor: monolith → microservices at PowerSchool
2d7c6aa feat: joined PowerSchool as Senior React Developer
9a1f3e8 feat: introduced GraphQL at Skip the Dishes
4e0b21c feat: joined Skip the Dishes as Senior React Developer
1a2b3c4 chore: initial commit — hello, web`

const MAN_PAGE = `FILIPE(1)                    User Commands                    FILIPE(1)

NAME
       filipe - senior software engineer

SYNOPSIS
       filipe [--frontend] [--fullstack] [--freelance] [--full-time]

DESCRIPTION
       Ships React & TypeScript applications at scale. 10+ years of
       production experience across SaaS, edtech, and high-traffic
       consumer platforms.

BUGS
       Allocates a disproportionate share of memory to Magic: The
       Gathering. Reported upstream; maintainer closed as WONTFIX.

SEE ALSO
       about(1), experience(1), contact(1)`

const FORTUNES = [
  'There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
  '"It works on my machine." — ancient proverb',
  'Weeks of coding can save you hours of planning.',
  'A good commit message explains why. A great one apologizes.',
  '99 little bugs in the code, 99 little bugs — take one down, patch it around, 127 little bugs in the code.',
  'Documentation is a love letter to your future self.',
  'The fastest code is the code that never runs.',
  'Real programmers count from 0.',
]

function cowsay(msg: string): string {
  const m = msg || 'hire filipe'
  return [
    ` ${'_'.repeat(m.length + 2)}`,
    `< ${m} >`,
    ` ${'-'.repeat(m.length + 2)}`,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ].join('\n')
}

function sshHost(target: string): 'xp' | 'mac' | null {
  const host = target.toLowerCase()
  if (/(^|@)(xp|win|windows|winxp|windows-xp)/.test(host)) return 'xp'
  if (/(^|@)(mac|macos|osx|macintosh)/.test(host)) return 'mac'
  return null
}

export function resolveEgg(raw: string, ctx: { history: string[] }): EggResult | null {
  const input = raw.trim().replace(/\s+/g, ' ')
  const lower = input.toLowerCase()

  // rm before sudo, so `sudo rm -rf /` melts down instead of quipping.
  if (/^(sudo )?rm( |$)/.test(lower)) {
    const flags = lower.match(/ -[a-z-]+/g)?.join(' ') ?? ''
    if (/r/.test(flags) && /f/.test(flags)) return { type: 'destruct' }
    return { type: 'text', text: 'rm: cannot remove: Permission denied (this is a portfolio, not production)' }
  }

  if (lower === 'sudo make me a sandwich') return { type: 'text', text: 'okay.' }
  if (lower === 'make me a sandwich') return { type: 'text', text: 'what? make it yourself.' }
  if (/^sudo( |$)/.test(lower))
    return { type: 'text', text: 'filipe is not in the sudoers file. This incident will be reported.' }

  if (/^ls -[a-z]+$/.test(lower)) return { type: 'ascii', text: HIDDEN_LS }

  const catMatch = lower.match(/^cat (.+)$/)
  if (catMatch?.[1] && /^\.?(env|ssh|git|secrets?|password|id_rsa)/.test(catMatch[1].replace(/^\./, '.')))
    return { type: 'text', text: 'nice try.' }

  const gitMatch = lower.match(/^git(?: (.+))?$/)
  if (gitMatch) {
    const sub = gitMatch[1] ?? ''
    if (sub.startsWith('status')) return { type: 'ascii', text: GIT_STATUS }
    if (sub.startsWith('log')) return { type: 'ascii', text: GIT_LOG }
    if (sub.startsWith('blame'))
      return { type: 'text', text: 'blame assigned: Shai-Hulud. it crawled out of node_modules again. bless the Maker and His water.' }
    if (sub.startsWith('push')) return { type: 'text', text: 'Everything up-to-date. (as always)' }
    return { type: 'text', text: "git: try 'git status', 'git log' or 'git blame'" }
  }

  if (/^man( |$)/.test(lower)) return { type: 'ascii', text: MAN_PAGE }
  if (lower === 'pwd') return { type: 'text', text: '/home/filipe/portfolio' }

  const echoMatch = input.match(/^echo(?: (.*))?$/i)
  if (echoMatch) return { type: 'text', text: (echoMatch[1] ?? '').replace(/^["']|["']$/g, '') || ' ' }

  if (lower === 'history') {
    const list = ctx.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join('\n')
    return { type: 'ascii', text: list || 'history: empty (you just got here)' }
  }

  const cowMatch = input.match(/^cowsay(?: (.*))?$/i)
  if (cowMatch) return { type: 'ascii', text: cowsay((cowMatch[1] ?? '').replace(/^["']|["']$/g, '')) }

  if (lower === 'fortune') return { type: 'text', text: FORTUNES[Math.floor(Math.random() * FORTUNES.length)] ?? '' }
  if (lower === 'coffee' || lower === 'make coffee') return { type: 'text', text: '☕ brewing… done. productivity +20%.' }
  if (/^(hello|hi|hey)( |$)/.test(lower)) return { type: 'text', text: "hi. type 'help' to look around." }
  if (lower === '42') return { type: 'text', text: 'the answer to life, the universe, and everything. (you still need to type help)' }
  if (/^(reboot|restart|shutdown( -r)?( now)?)$/.test(lower))
    return { type: 'text', text: 'Have you tried turning it off and on again?' }
  if (lower.replace(/[\s-]/g, '') === '01189998819991197253')
    return { type: 'text', text: "Hello, I.T. … yes, that IS the new emergency number. Well done for remembering it." }

  if (/^(vim|vi|nvim|nano|emacs|ed)( |$)/.test(lower)) return { type: 'vim' }
  if (/^(neofetch|screenfetch|fastfetch)$/.test(lower)) return { type: 'neofetch' }

  const sshMatch = lower.match(/^ssh (.+)$/)
  if (sshMatch?.[1]) {
    const os = sshHost(sshMatch[1])
    return os ? { type: 'ssh', os } : { type: 'ssh-error', host: sshMatch[1] }
  }

  if (/^(exit|logout|quit)$/.test(lower)) return { type: 'exit' }

  return null
}
