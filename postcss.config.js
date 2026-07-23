// Tailwind v3 runs through the classic PostCSS pipeline; Vite picks this up
// automatically. (The dedicated @tailwindcss/vite plugin is v4-only.)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
