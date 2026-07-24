import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  // The site is served from https://filipemolina.github.io/portfolio/. This
  // replaces the NUXT_APP_BASE_URL env var the deploy workflow used to set, and
  // is what `import.meta.env.BASE_URL` reports at runtime.
  base: '/portfolio/',

  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
