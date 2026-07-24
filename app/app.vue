<script setup lang="ts">
import FooterSection from '~/components/FooterSection.vue'
import TerminalApp from '~/components/TerminalApp.vue'
// The pre-paint theme script lives in index.html — it has to run before the
// bundle loads, so it cannot be injected from here.
</script>

<template>
  <div>
    <main class="w-full">
      <div class="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        <TerminalApp />
        <FooterSection />
      </div>
    </main>
  </div>
</template>
