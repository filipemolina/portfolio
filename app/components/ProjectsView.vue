<script setup lang="ts">
import { projects } from '~/data/projects'
</script>

<template>
  <div class="grid gap-5">
    <article
      v-for="project in projects"
      :key="project.name"
      class="grid gap-4 rounded-lg border border-term-border bg-term-bg/50 p-4 sm:grid-cols-5 sm:p-5"
    >
      <!-- Illustrative TUI mockup (not a literal screenshot) -->
      <div class="sm:col-span-2">
        <div class="overflow-hidden rounded-md border border-term-border bg-term-bg font-mono text-[11px] leading-relaxed">
          <div class="border-b border-term-border px-3 py-1.5 text-term-muted">stack-stitcher</div>
          <div class="space-y-1 p-3">
            <p class="text-term-accent-2">/ web<span class="caret">▊</span></p>
            <p><span class="text-term-accent">●</span> web <span class="ml-2 text-term-muted">running · :3000</span></p>
            <p><span class="text-term-accent">●</span> worker <span class="ml-2 text-term-muted">running</span></p>
            <p><span class="text-term-muted">○</span> redis <span class="ml-2 text-term-muted">stopped</span></p>
            <p class="mt-2 text-term-muted">↑↓ navigate · ↵ select · / search</p>
          </div>
        </div>
      </div>

      <div class="sm:col-span-3">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 class="text-sm font-semibold text-term-fg sm:text-base">{{ project.name }}</h3>
          <span class="text-xs text-term-muted">{{ project.tagline }}</span>
        </div>

        <p class="mt-3 text-sm leading-relaxed text-term-fg/85">{{ project.description }}</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in project.tags"
            :key="tag"
            class="rounded border border-term-border bg-term-bg px-2 py-0.5 text-[11px] text-term-fg/80"
          >
            {{ tag }}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <a
            :href="project.github"
            target="_blank"
            rel="noopener"
            class="font-semibold text-term-accent hover:underline"
          >
            View on GitHub →
          </a>
          <span class="text-term-muted">{{ project.license }} license</span>
          <span class="text-term-muted">·</span>
          <span class="text-term-muted">{{ project.status }}</span>
        </div>
      </div>
    </article>

    <a
      href="https://github.com/filipemolina"
      target="_blank"
      rel="noopener"
      class="rounded-lg border border-dashed border-term-border p-5 text-center text-sm text-term-muted transition hover:border-term-accent hover:text-term-accent"
    >
      More in progress — check github.com/filipemolina for what's next.
    </a>
  </div>
</template>
