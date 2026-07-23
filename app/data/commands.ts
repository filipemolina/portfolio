export type ViewKey = 'home' | 'about' | 'experience' | 'skills' | 'projects' | 'contact' | 'help'

export const themes = ['default', 'catppuccin', 'amber', 'light'] as const
export type ThemeName = (typeof themes)[number]

export interface CommandDef {
  id: string
  aliases: string[]
  hint: string
  description: string
  action: 'view' | 'download' | 'clear' | 'theme'
  view?: ViewKey
  // Listed in the help view. Everything else stays runnable but undocumented:
  // contact/resume have always-visible pills, whoami/clear are terminal reflexes.
  inHelp?: boolean
}

export const commands: CommandDef[] = [
  { id: 'home', aliases: ['home', 'whoami'], hint: 'whoami', description: 'Back to the start', action: 'view', view: 'home' },
  { id: 'about', aliases: ['about', 'cat about.md'], hint: 'cat about.md', description: 'Read the about note', action: 'view', view: 'about', inHelp: true },
  { id: 'experience', aliases: ['experience', 'cd experience', 'ls -la ./experience'], hint: 'cd experience', description: 'Browse work history', action: 'view', view: 'experience', inHelp: true },
  { id: 'skills', aliases: ['skills', 'cd skills', 'tree ./skills'], hint: 'tree ./skills', description: 'List technical skills', action: 'view', view: 'skills', inHelp: true },
  { id: 'projects', aliases: ['projects', 'cd projects', 'ls ./projects'], hint: 'ls ./projects', description: 'View projects', action: 'view', view: 'projects', inHelp: true },
  { id: 'contact', aliases: ['contact', 'cd contact', './contact --me'], hint: './contact --me', description: 'Get in touch', action: 'view', view: 'contact' },
  { id: 'resume', aliases: ['resume', 'cat resume.pdf'], hint: 'cat resume.pdf', description: 'Download résumé (PDF)', action: 'download' },
  { id: 'theme', aliases: ['theme'], hint: 'theme <name>', description: 'Switch color theme', action: 'theme', inHelp: true },
  { id: 'help', aliases: ['help', '--help', 'man'], hint: 'help', description: 'List available commands', action: 'view', view: 'help' },
  { id: 'clear', aliases: ['clear', 'cls'], hint: 'clear', description: 'Reset the terminal', action: 'clear' },
]

// Bare words listed first so short prefixes suggest the friendly form
// ('c' → 'contact'); the full alias list makes every runnable spelling
// completable ('ca' → 'cat about.md', 'cat resume.pdf').
const primaryWords = ['about', 'experience', 'skills', 'projects', 'contact', 'resume', 'help', 'theme', 'clear', 'whoami', 'ls']

const completionCandidates = Array.from(
  new Set([
    ...primaryWords,
    ...commands.flatMap((c) => c.aliases),
    ...themes.map((t) => `theme ${t}`),
  ]),
)

const fileMap: Record<string, string> = {
  'about.md': 'about',
  'resume.pdf': 'resume',
  'experience.log': 'experience',
  'skills.json': 'skills',
}

export interface ResolveResult {
  command?: CommandDef
  unknownArg?: string
  arg?: string
}

export function resolveCommand(raw: string): ResolveResult | null {
  const input = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!input) return null

  for (const cmd of commands) {
    if (cmd.aliases.some((a) => a.toLowerCase() === input)) return { command: cmd }
  }

  const themeMatch = input.match(/^theme\s+(.+)$/)
  if (themeMatch?.[1]) {
    const cmd = commands.find((c) => c.id === 'theme')
    return { command: cmd, arg: themeMatch[1] }
  }

  const cdMatch = input.match(/^cd\s+(.+)$/)
  if (cdMatch?.[1]) {
    const cdArg = cdMatch[1]
    const arg = cdArg.replace(/^\.?\/?/, '')
    const found = commands.find((c) => c.view === arg || c.id === arg)
    return found ? { command: found } : { unknownArg: cdArg }
  }

  const catMatch = input.match(/^cat\s+(.+)$/)
  if (catMatch?.[1]) {
    const catArg = catMatch[1]
    const id = fileMap[catArg]
    const found = commands.find((c) => c.id === id)
    return found ? { command: found } : { unknownArg: catArg }
  }

  return null
}

export function suggest(raw: string): string | null {
  const input = raw.trim().toLowerCase()
  if (!input) return null
  return completionCandidates.find((w) => w.startsWith(input) && w !== input) ?? null
}

export function completions(raw: string): string[] {
  const input = raw.trim().toLowerCase()
  if (!input) return primaryWords
  return completionCandidates.filter((w) => w.startsWith(input))
}

export function commonPrefix(words: string[]): string {
  let prefix = words[0] ?? ''
  for (const w of words.slice(1)) {
    while (prefix && !w.startsWith(prefix)) prefix = prefix.slice(0, -1)
  }
  return prefix
}

export const directoryListing = 'about.md   experience/   skills.json   projects/   contact.sh   resume.pdf'
