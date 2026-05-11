// Single source of truth for the API origin. Default tracks the archived React scaffold
// (which used `VITE_API_BASE_URL=http://localhost:8080`). In dev the Nitro proxy below
// forwards same-origin /admin and /v1 requests there, so app code can use relative URLs.
const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: true,
  runtimeConfig: {
    public: { apiBaseUrl },
  },
  nitro: {
    // Dev-only: keep the session cookie same-origin by proxying to the Rust API.
    // Prod is expected to do this via a reverse proxy / ingress (see backend-handoff §2).
    devProxy: {
      '/admin': { target: apiBaseUrl, changeOrigin: true },
      '/v1': { target: apiBaseUrl, changeOrigin: true },
      '/graphql': { target: apiBaseUrl, changeOrigin: true },
    },
  },
  app: {
    head: {
      title: 'Cellora — Indexed CKB data, one API call away',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/icons', pathPrefix: false },
    { path: '~/components/landing', pathPrefix: false },
    { path: '~/components/landing/diagrams', pathPrefix: false },
    { path: '~/components/dashboard', pathPrefix: false },
  ],
  typescript: { strict: false },
})
