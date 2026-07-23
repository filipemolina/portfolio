<script setup lang="ts">
import { experience } from '~/data/experience'
</script>

<template>
  <ol class="ml-1.5 space-y-8 border-l border-term-border pl-6">
    <li v-for="entry in experience" :key="entry.company" class="relative">
      <span class="absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full border-2 border-term-accent bg-term-bg" />

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 class="text-sm font-semibold text-term-fg sm:text-base">
          {{ entry.title }}
          <span class="font-normal text-term-muted">— {{ entry.company }}</span>
        </h3>
        <span class="text-xs text-term-muted">{{ entry.period }}</span>
      </div>
      <p class="mt-0.5 text-xs text-term-muted">{{ entry.location }}</p>

      <ul class="mt-3 space-y-1.5 text-sm text-term-fg/85">
        <li v-for="(bullet, i) in entry.bullets" :key="i" class="flex gap-2">
          <span class="mt-0.5 shrink-0 text-term-accent">›</span>
          <span>{{ bullet }}</span>
        </li>
      </ul>
    </li>
  </ol>
</template>
