import type { Ref } from 'vue'
import { resolveEgg, type EggResult } from '~/data/eastereggs'
import type { Screen } from '~/types/terminal'

/**
 * The entire easter-egg suite, isolated from the core terminal.
 *
 * The terminal only needs to:
 *   - call `intercept(raw)` first in runRaw — true means the eggs own the input
 *     right now (vim trap, or a blocking sequence like rm -rf / mid-flight);
 *   - call `tryRun(raw)` when a command didn't resolve — true means an egg ran;
 *   - hide suggestions/tab-completion while `captures` is true;
 *   - use `prompt`/`title` overrides when non-null (ssh xp/mac flavor).
 *
 * Related, self-contained pieces: `~/data/eastereggs.ts` (matching + content),
 * `NeofetchView.vue` (the `neofetch` screen kind), and
 * `assets/css/eastereggs.css` (glitch/shutdown/xp/mac styling, keyed on
 * data-attributes set here and on `.terminal-fall` hooks in the markup).
 * Deleting those four files (plus the calls listed above) removes every egg.
 */
export function useEasterEggs(host: {
  show: (next: Screen) => Promise<void>
  screen: Ref<Screen>
  history: Ref<string[]>
}) {
  const { show, screen, history } = host

  const mode = ref<'normal' | 'vim'>('normal')
  const vimAttempts = ref(0)
  const sshOs = ref<'xp' | 'mac' | null>(null)
  const busy = ref(false)
  let timers: ReturnType<typeof setTimeout>[] = []

  function timer(ms: number, fn: () => void) {
    timers.push(setTimeout(fn, ms))
  }

  const captures = computed(() => busy.value || mode.value !== 'normal')
  const prompt = computed(() => (sshOs.value === 'xp' ? 'C:\\>' : sshOs.value === 'mac' ? '%' : null))
  const title = computed(() =>
    sshOs.value === 'xp' ? 'Telnet - retro' : sshOs.value === 'mac' ? 'guest@retro — zsh' : null,
  )

  const VIM_SCREEN = `~
~
~
~                    VIM - Vi IMproved
~
~              you are now trapped in vim
~         a classic rite of passage, honestly
~
~
"~/portfolio.md" [readonly] 1L, 42B`

  async function handleVim(input: string) {
    const t = input.toLowerCase()
    if ([':q', ':q!', ':wq', ':wq!', ':x', ':qa', ':qa!'].includes(t)) {
      mode.value = 'normal'
      await show({ kind: 'info', text: 'E37: no write since last change — just kidding. welcome back to the shell.' })
      return
    }
    vimAttempts.value++
    const hint =
      vimAttempts.value === 1
        ? `E492: Not an editor command: ${input}   (psst: try :q!)`
        : vimAttempts.value === 2
          ? 'still in vim. the exit is :q!'
          : `${vimAttempts.value} attempts. legend says some visitors are still in here. type :q!`
    await show({ kind: 'ascii', text: `${VIM_SCREEN}\n${hint}` })
  }

  function selfDestruct(raw: string) {
    busy.value = true
    const lines = [
      'rm: descending into /home …',
      'rm: removing /usr/bin …',
      'rm: removing /etc …',
      'rm: removing /boot … wait.',
      'rm: cannot remove /portfolio: resource busy',
      'segmentation fault (core dumped)',
    ]
    void show({ command: raw, kind: 'ascii', text: lines[0] ?? '' })
    lines.slice(1).forEach((_, i) => {
      timer(300 * (i + 1), () => {
        screen.value = { ...screen.value, text: lines.slice(0, i + 2).join('\n') }
      })
    })
    timer(1900, () => {
      document.documentElement.dataset.broken = '1'
    })
    timer(2600, () => {
      screen.value = {
        kind: 'error',
        text: 'Kernel panic - not syncing: Attempted to kill init! exitcode=0x00007f00\nCPU: 0 PID: 1 Comm: portfolio Not tainted 6.1.0-portfolio\n---[ end Kernel panic ]---',
      }
    })
    timer(4600, () => {
      delete document.documentElement.dataset.broken
      busy.value = false
      void show({ kind: 'info', text: "system restored from backup. phew. (please don't do that again)" })
    })
  }

  async function sshConnect(raw: string, os: 'xp' | 'mac') {
    const banner =
      os === 'xp'
        ? `connecting to retro…\nxp@retro's password: ********\n\nMicrosoft Windows XP [Version 5.1.2600]\n(C) Copyright 1985-2001 Microsoft Corp.\n\ntype 'exit' to disconnect.`
        : `connecting to retro…\nmac@retro's password: ********\n\nWelcome to Darwin! (Mac OS X 10.4 Tiger)\n\ntype 'exit' to disconnect.`
    sshOs.value = os
    document.documentElement.dataset.os = os
    await show({ command: raw, kind: 'ascii', text: banner })
  }

  // `exit` outside an ssh session: print logout, cut to black, flicker back on.
  async function fakeShutdown(raw: string) {
    busy.value = true
    await show({ command: raw, kind: 'list', text: 'logout' })
    timer(500, () => {
      document.documentElement.dataset.off = '1'
    })
    timer(1500, () => {
      delete document.documentElement.dataset.off
      document.documentElement.dataset.flicker = '1'
      busy.value = false
      void show({ kind: 'error', text: "bash: you can't leave. you haven't clicked 'contact' yet." })
    })
    timer(2000, () => {
      delete document.documentElement.dataset.flicker
    })
  }

  async function handleEgg(raw: string, egg: EggResult) {
    switch (egg.type) {
      case 'text':
        await show({ command: raw, kind: 'list', text: egg.text })
        break
      case 'ascii':
        await show({ command: raw, kind: 'ascii', text: egg.text })
        break
      case 'neofetch':
        await show({ command: raw, kind: 'neofetch' })
        break
      case 'vim':
        mode.value = 'vim'
        vimAttempts.value = 0
        await show({ command: raw, kind: 'ascii', text: VIM_SCREEN })
        break
      case 'destruct':
        selfDestruct(raw)
        break
      case 'ssh':
        await sshConnect(raw, egg.os)
        break
      case 'ssh-error':
        await show({
          command: raw,
          kind: 'error',
          text: `ssh: Could not resolve hostname ${egg.host}: Name or service not known`,
        })
        break
      case 'exit':
        if (sshOs.value) {
          sshOs.value = null
          delete document.documentElement.dataset.os
          await show({ command: raw, kind: 'list', text: 'Connection to retro closed.' })
        } else {
          await fakeShutdown(raw)
        }
        break
    }
  }

  async function intercept(raw: string): Promise<boolean> {
    if (busy.value) return true
    if (mode.value === 'vim') {
      await handleVim(raw.trim())
      return true
    }
    return false
  }

  async function tryRun(raw: string): Promise<boolean> {
    const egg = resolveEgg(raw.trim(), { history: history.value })
    if (!egg) return false
    await handleEgg(raw, egg)
    return true
  }

  onUnmounted(() => {
    timers.forEach(clearTimeout)
    timers = []
    delete document.documentElement.dataset.broken
    delete document.documentElement.dataset.os
    delete document.documentElement.dataset.off
    delete document.documentElement.dataset.flicker
  })

  return { intercept, tryRun, captures, prompt, title }
}
