<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import AboutView from '~/components/AboutView.vue'
import ContactView from '~/components/ContactView.vue'
import ExperienceView from '~/components/ExperienceView.vue'
import HelpView from '~/components/HelpView.vue'
import NeofetchView from '~/components/NeofetchView.vue'
import ProjectsView from '~/components/ProjectsView.vue'
import SkillsView from '~/components/SkillsView.vue'
import TerminalWindow from '~/components/TerminalWindow.vue'
import { useAutoHeightTransition } from '~/composables/useAutoHeightTransition'
import { useEasterEggs } from '~/composables/useEasterEggs'
import { useTheme } from '~/composables/useTheme'
import { commands, themes, resolveCommand, suggest, completions, commonPrefix, directoryListing, type ThemeName } from '~/data/commands'
import type { Screen, ScreenKind } from '~/types/terminal'

const screen = ref<Screen>({ kind: 'home' })
const input = ref('')
const commandHistory = ref<string[]>([])
const historyIndex = ref<number | null>(null)
const isFocused = ref(false)
const tabHint = ref('')

const inputRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)

function maxBodyHeight() {
  if (typeof window === 'undefined') return 480
  const body = bodyRef.value
  const panel = body?.closest('[data-terminal-panel]')
  if (!body || !panel) return Math.max(320, Math.round(window.innerHeight * 0.6))
  const panelRect = panel.getBoundingClientRect()
  const bodyRect = body.getBoundingClientRect()
  // Panel chrome above/below the content area — stable while the body resizes.
  const chrome = (bodyRect.top - panelRect.top) + (panelRect.bottom - bodyRect.bottom)
  // Page padding + footer, so the whole panel (pills included) stays in view.
  const reserved = 190
  return Math.max(240, window.innerHeight - chrome - reserved)
}

const { animate } = useAutoHeightTransition(bodyRef, maxBodyHeight)
const theme = useTheme()

function focusInput() {
  inputRef.value?.focus()
}

async function show(next: Screen) {
  tabHint.value = ''
  await animate(() => {
    screen.value = next
  })
  if (bodyRef.value) bodyRef.value.scrollTop = 0
}

// Hidden-command suite (vim trap, ssh reskins, rm -rf, quips…) — fully
// self-contained; see useEasterEggs.ts for the seam and how to remove it.
const eggs = useEasterEggs({ show, screen, history: commandHistory })

const promptLabel = computed(() => eggs.prompt.value ?? '$')
const windowTitle = computed(() => eggs.title.value ?? 'filipe@portfolio: ~')

const suggestion = computed(() => (eggs.captures.value ? null : suggest(input.value)))

// Caret index for the custom block cursor (the native caret is hidden).
const caretPos = ref(0)

function syncCaret() {
  nextTick(() => {
    caretPos.value = inputRef.value?.selectionStart ?? input.value.length
  })
}

watch(input, () => {
  tabHint.value = ''
  syncCaret()
})

async function runRaw(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return

  if (await eggs.intercept(raw)) return

  if (trimmed.toLowerCase() === 'ls') {
    await show({ command: raw, kind: 'list', text: directoryListing })
    return
  }

  const resolved = resolveCommand(trimmed)

  if (!resolved || resolved.unknownArg) {
    if (await eggs.tryRun(raw)) return
    if (resolved?.unknownArg) {
      await show({ command: raw, kind: 'error', text: `cd: no such section: ${resolved.unknownArg}` })
    } else {
      await show({
        command: raw,
        kind: 'error',
        text: `command not found: ${trimmed} — type 'help' to see available commands`,
      })
    }
    return
  }

  const cmd = resolved.command!

  if (cmd.action === 'clear') {
    await show({ kind: 'home' })
    return
  }

  if (cmd.action === 'download') {
    await show({ command: raw, kind: 'info', text: 'opening resume.pdf in a new tab…' })
    window.open(import.meta.env.BASE_URL + 'files/Resume_2026.pdf', '_blank', 'noopener')
    return
  }

  if (cmd.action === 'theme') {
    const arg = resolved.arg
    if (!arg) {
      await show({
        command: raw,
        kind: 'list',
        text: `available themes: ${themes.join('   ')}\ncurrent: ${theme.current.value}\nusage: theme <name>`,
      })
    } else if ((themes as readonly string[]).includes(arg)) {
      theme.apply(arg as ThemeName)
      await show({ command: raw, kind: 'info', text: `theme set to ${arg}` })
    } else {
      await show({
        command: raw,
        kind: 'error',
        text: `theme: no such theme: ${arg} — available: ${themes.join(', ')}`,
      })
    }
    return
  }

  // whoami/home content lives in the persistent block, so going "home" is a reset.
  if (cmd.view === 'home') {
    await show({ kind: 'home' })
    return
  }

  await show({ command: raw, kind: cmd.view as ScreenKind })
}

function submit() {
  if (!input.value.trim()) return
  commandHistory.value.push(input.value)
  historyIndex.value = null
  const toRun = input.value
  input.value = ''
  runRaw(toRun)
}

function onTab(e: KeyboardEvent) {
  e.preventDefault()
  if (eggs.captures.value) return
  const matches = completions(input.value)
  if (!matches.length) return
  if (matches.length === 1) {
    input.value = matches[0] ?? ''
    return
  }
  const prefix = commonPrefix(matches)
  if (prefix.length > input.value.trim().length) input.value = prefix
  nextTick(() => {
    tabHint.value = matches.join('   ')
  })
}

function onArrowUp(e: KeyboardEvent) {
  if (!commandHistory.value.length) return
  e.preventDefault()
  const idx = historyIndex.value === null ? commandHistory.value.length - 1 : Math.max(0, historyIndex.value - 1)
  historyIndex.value = idx
  input.value = commandHistory.value[idx] ?? ''
}

function onArrowDown(e: KeyboardEvent) {
  if (historyIndex.value === null) return
  e.preventDefault()
  const idx = historyIndex.value + 1
  if (idx >= commandHistory.value.length) {
    historyIndex.value = null
    input.value = ''
  } else {
    historyIndex.value = idx
    input.value = commandHistory.value[idx] ?? ''
  }
}

function onArrowRight(e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (suggestion.value && el.selectionStart === input.value.length) {
    e.preventDefault()
    input.value = suggestion.value
  }
}

// Pills run the registry's hint form (`cat about.md`, not `about`) so a click
// echoes the same command help teaches.
function pill(id: string, label: string) {
  return { id, label, run: commands.find((c) => c.id === id)?.hint ?? id }
}

const sectionPills = [
  pill('about', 'about'),
  pill('experience', 'experience'),
  pill('skills', 'skills'),
  pill('projects', 'projects'),
]

const ctaPills = [pill('contact', 'contact'), pill('resume', 'résumé ↓')]

const activeView = computed(() => screen.value.kind)

function runPill(command: string) {
  runRaw(command)
  focusInput()
}

onMounted(() => {
  theme.init()
  // Focus the prompt on load, but not on touch devices — popping the software
  // keyboard before the visitor has read anything is hostile on mobile.
  if (window.matchMedia('(pointer: fine)').matches) focusInput()
})
</script>

<template>
  <TerminalWindow :title="windowTitle" :focused="isFocused">
    <div class="terminal-fall" @click="focusInput">
      <p class="text-term-muted"><span class="text-term-accent">$</span> whoami</p>
      <p class="mt-1 text-xl font-semibold text-term-fg text-glow sm:text-2xl">Filipe Molina</p>
      <p class="mt-1 text-term-fg/90">Senior Software Engineer — Frontend / Full-Stack</p>

      <p class="mt-4 text-term-muted"><span class="text-term-accent">$</span> cat mission.txt</p>
      <p class="mt-1 text-term-fg/90">
        10+ years shipping React &amp; TypeScript applications across SaaS, edtech, and high-traffic
        consumer platforms. Open to freelance contracts and full-time roles.
      </p>
    </div>

    <div
      ref="bodyRef"
      aria-live="polite"
      class="overflow-y-auto pr-1"
      :class="screen.kind === 'home' ? '' : 'mt-4'"
      @click="focusInput"
    >
      <p v-if="screen.command" class="mb-2 text-term-muted">
        <span class="text-term-accent">{{ promptLabel }}</span> {{ screen.command }}
      </p>
      <AboutView v-if="screen.kind === 'about'" />
      <ExperienceView v-else-if="screen.kind === 'experience'" />
      <SkillsView v-else-if="screen.kind === 'skills'" />
      <ProjectsView v-else-if="screen.kind === 'projects'" />
      <ContactView v-else-if="screen.kind === 'contact'" />
      <HelpView v-else-if="screen.kind === 'help'" />
      <NeofetchView v-else-if="screen.kind === 'neofetch'" />
      <pre v-else-if="screen.kind === 'ascii'" class="overflow-x-auto whitespace-pre text-xs leading-snug text-term-fg/85">{{ screen.text }}</pre>
      <p v-else-if="screen.kind === 'list'" class="whitespace-pre-wrap text-sm text-term-fg/80">{{ screen.text }}</p>
      <p v-else-if="screen.kind === 'error'" class="whitespace-pre-wrap text-sm text-term-danger">{{ screen.text }}</p>
      <p v-else-if="screen.kind === 'info'" class="text-sm text-term-accent">{{ screen.text }}</p>
    </div>

    <div class="terminal-fall mt-4 border-t border-term-border pt-3" style="--fall-delay: 0.1s">
      <div class="flex items-center gap-2">
        <span class="text-term-accent">{{ promptLabel }}</span>
        <div class="relative flex-1">
          <span class="pointer-events-none absolute inset-0 whitespace-pre text-term-fg/30" aria-hidden="true">
            <span class="invisible">{{ input }}</span>{{ suggestion ? suggestion.slice(input.length) : '' }}
          </span>
          <span class="pointer-events-none absolute inset-0 whitespace-pre" aria-hidden="true">
            <span class="invisible">{{ input.slice(0, caretPos) }}</span><span
              :key="caretPos"
              class="cursor-block"
              :class="isFocused ? 'cursor-block--blink' : 'cursor-block--idle'"
            >█</span>
          </span>
          <input
            ref="inputRef"
            v-model="input"
            type="text"
            spellcheck="false"
            autocomplete="off"
            aria-label="Terminal command input"
            class="w-full bg-transparent text-term-fg outline-none"
            style="caret-color: transparent"
            @keydown.enter="submit"
            @keydown.tab="onTab"
            @keydown.up="onArrowUp"
            @keydown.down="onArrowDown"
            @keydown.right="onArrowRight"
            @keyup="syncCaret"
            @click="syncCaret"
            @select="syncCaret"
            @focus="isFocused = true; syncCaret()"
            @blur="isFocused = false"
          >
        </div>
      </div>
      <p v-if="tabHint" class="mt-2 whitespace-pre-wrap text-xs text-term-fg/60">{{ tabHint }}</p>
    </div>

    <p class="terminal-fall mt-4 text-xs text-term-muted" style="--fall-delay: 0.2s">
      Type <span class="text-term-accent">help</span>, or click a command below, to explore.
    </p>

    <div class="terminal-fall mt-2 flex flex-wrap items-center gap-2 text-xs" style="--fall-delay: 0.25s">
      <button
        v-for="p in sectionPills"
        :key="p.id"
        type="button"
        class="rounded border px-2.5 py-1 transition"
        :class="activeView === p.id
          ? 'border-term-accent bg-term-accent/15 text-term-accent'
          : 'border-term-border text-term-fg/80 hover:border-term-accent hover:text-term-accent'"
        :aria-current="activeView === p.id ? 'page' : undefined"
        @click="runPill(p.run)"
      >
        {{ p.label }}
      </button>
      <div class="ml-auto flex gap-2">
        <button
          v-for="p in ctaPills"
          :key="p.id"
          type="button"
          class="rounded border border-term-accent bg-term-accent px-2.5 py-1 font-medium text-term-bg transition hover:bg-term-accent/90"
          :class="activeView === p.id ? 'ring-2 ring-term-accent/40' : ''"
          :aria-current="activeView === p.id ? 'page' : undefined"
          @click="runPill(p.run)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
  </TerminalWindow>
</template>
