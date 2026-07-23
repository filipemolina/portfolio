<script setup lang="ts">
import { skills } from '~/data/skills'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div
      v-for="group in skills"
      :key="group.category"
      class="rounded-lg border border-term-border bg-term-bg/50 p-4"
    >
      <p class="mb-3 text-xs uppercase tracking-wider text-term-accent">{{ group.category }}</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in group.items"
          :key="item"
          class="rounded border border-term-border bg-term-panel px-2.5 py-1 text-xs text-term-fg/90"
        >
          {{ item }}
        </span>
      </div>
    </div>
  </div>
</template>
