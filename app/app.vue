<script setup lang="ts">
// Apply a persisted theme before first paint to avoid a flash of the default.
useHead({
  script: [
    {
      innerHTML:
        `try{var t=localStorage.getItem('portfolio-theme');` +
        `if(t&&t!=='default')document.documentElement.dataset.theme=t}catch(e){}`,
    },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <div class="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div class="w-full max-w-3xl">
        <TerminalApp />
      </div>
      <FooterSection />
    </div>
  </div>
</template>
