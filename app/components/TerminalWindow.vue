<script setup lang="ts">
defineProps<{
  title?: string
  focused?: boolean
}>()
</script>

<template>
  <div
    data-terminal-panel
    class="rounded-lg border bg-term-panel shadow-2xl shadow-black/40 transition-colors"
    :class="focused ? 'border-term-accent/60' : 'border-term-border'"
  >
    <div data-titlebar class="flex items-center gap-2 border-b border-term-border px-4 py-2.5">
      <span data-light class="h-3 w-3 rounded-full bg-term-danger/70" />
      <span data-light class="h-3 w-3 rounded-full bg-term-warn/70" />
      <span data-light class="h-3 w-3 rounded-full bg-term-accent/70" />
      <span v-if="title" data-title class="ml-2 truncate text-xs text-term-muted">{{ title }}</span>
    </div>
    <div class="p-5 text-sm leading-relaxed sm:p-6">
      <slot />
    </div>
  </div>
</template>
