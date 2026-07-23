import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  // Required under the plain PostCSS pipeline. @nuxtjs/tailwindcss used to
  // inject these paths at build time; without them v3 emits zero utilities and
  // the site renders unstyled.
  content: ['./index.html', './app/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Values live as RGB-channel CSS variables in assets/css/main.css (see the
      // theme block there); <alpha-value> keeps Tailwind opacity modifiers working.
      colors: {
        'term-bg': 'rgb(var(--term-bg) / <alpha-value>)',
        'term-panel': 'rgb(var(--term-panel) / <alpha-value>)',
        'term-border': 'rgb(var(--term-border) / <alpha-value>)',
        'term-fg': 'rgb(var(--term-fg) / <alpha-value>)',
        'term-muted': 'rgb(var(--term-muted) / <alpha-value>)',
        'term-accent': 'rgb(var(--term-accent) / <alpha-value>)',
        'term-accent-2': 'rgb(var(--term-accent-2) / <alpha-value>)',
        'term-warn': 'rgb(var(--term-warn) / <alpha-value>)',
        'term-danger': 'rgb(var(--term-danger) / <alpha-value>)',
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
    },
  },
}
