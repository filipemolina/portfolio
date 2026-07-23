<script setup lang="ts">
const { current } = useTheme()

const logo = `  ______ __  __
 |  ____|  \\/  |
 | |__  | \\  / |
 |  __| | |\\/| |
 | |    | |  | |
 |_|    |_|  |_|`

interface Row {
  k: string
  v: string
  href?: string
}

const rows = computed<Row[]>(() => [
  { k: 'OS', v: 'Hannah Montana Linux v26.0', href: 'https://gitlab.com/DecaCagle/hannahmontanalinux26' },
  { k: 'Host', v: 'filipe@portfolio' },
  { k: 'Uptime', v: '10+ years in production' },
  { k: 'Shell', v: 'React / TypeScript' },
  { k: 'Packages', v: 'GraphQL · Nuxt · Node · Go · Laravel' },
  { k: 'Resolution', v: 'problems → solutions' },
  { k: 'Theme', v: current.value },
  { k: 'Status', v: 'open to freelance & full-time' },
])

const swatches = ['bg-term-danger', 'bg-term-warn', 'bg-term-accent', 'bg-term-accent-2', 'bg-term-fg', 'bg-term-muted', 'bg-term-border', 'bg-term-panel']
</script>

<template>
  <div class="flex flex-wrap items-start gap-x-8 gap-y-4 text-sm">
    <pre class="text-xs leading-tight text-term-accent">{{ logo }}</pre>
    <div>
      <p class="text-term-accent">filipe<span class="text-term-fg/80">@</span>portfolio</p>
      <p class="text-term-muted">-----------------</p>
      <p v-for="row in rows" :key="row.k">
        <span class="text-term-accent">{{ row.k }}</span><span class="text-term-muted">: </span><a
          v-if="row.href"
          :href="row.href"
          target="_blank"
          rel="noopener"
          class="text-term-fg/90 underline decoration-term-muted underline-offset-2 hover:text-term-accent"
        >{{ row.v }}</a><span v-else class="text-term-fg/90">{{ row.v }}</span>
      </p>
      <div class="mt-2 flex">
        <span v-for="s in swatches" :key="s" class="h-4 w-4" :class="s" />
      </div>
    </div>
  </div>
</template>
