// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css', '~/assets/css/eastereggs.css'],

  app: {
    head: {
      title: 'Filipe Molina — Senior Software Engineer',
      htmlAttrs: { lang: 'en', class: 'dark' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' },
      ],
      meta: [
        {
          name: 'description',
          content:
            'Filipe Molina — Senior Software Engineer (Frontend / Full-Stack). 10+ years building React, TypeScript & GraphQL applications. Available for freelance contracts and full-time roles.',
        },
        { property: 'og:title', content: 'Filipe Molina — Senior Software Engineer' },
        {
          property: 'og:description',
          content:
            'Senior Software Engineer, Frontend / Full-Stack. 10+ years across SaaS, edtech, and high-traffic consumer platforms. Available for freelance contracts and full-time roles.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'theme-color', content: '#0a0e12' },
      ],
    },
  },
})
