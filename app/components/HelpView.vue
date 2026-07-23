<script setup lang="ts">
import { commands } from '~/data/commands'

const helpCommands = commands.filter((c) => c.inHelp)
</script>

<template>
  <div class="space-y-1.5 text-sm">
    <p class="mb-2 text-term-muted">Available commands:</p>
    <div v-for="cmd in helpCommands" :key="cmd.id" class="flex flex-wrap gap-x-3">
      <span class="w-32 shrink-0 text-term-accent">{{ cmd.hint }}</span>
      <span class="text-term-fg/80">{{ cmd.description }}</span>
    </div>
    <p class="mt-3 text-xs text-term-muted">
      Tab to autocomplete · ↑/↓ for history · click any command below the prompt to run it.
    </p>
  </div>
</template>
