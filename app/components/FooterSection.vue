<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="terminal-fall mt-6 w-full max-w-3xl text-xs text-term-muted" style="--fall-delay: 0.3s">
    <p><span class="text-term-accent">$</span> echo "thanks for stopping by"</p>
    <p class="mt-1">thanks for stopping by</p>
    <p class="mt-4">© {{ year }} Filipe Molina · built with Vue &amp; Tailwind</p>
  </footer>
</template>
