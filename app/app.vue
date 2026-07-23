<script setup lang="ts">
import FooterSection from '~/components/FooterSection.vue'
import TerminalApp from '~/components/TerminalApp.vue'
// The pre-paint theme script lives in index.html — it has to run before the
// bundle loads, so it cannot be injected from here.
</script>

<template>
  <div>
    <div class="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div class="w-full max-w-3xl">
        <TerminalApp />
      </div>
      <FooterSection />
    </div>
  </div>
</template>
