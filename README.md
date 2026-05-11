# cellora-nuxt

Nuxt 3 + Vue 3 implementation of Cellora — Indexer-as-a-Service for Nervos CKB.

## Running

```bash
npm install
npm run dev
```

Then open http://localhost:3000/.

## Stack

- Nuxt 3 (SSR + file-based routing)
- Vue 3 `<script setup>` + Composition API
- TypeScript
- No external UI library — primitives and design tokens are in-repo

## Structure

- `pages/` — file-routed pages (`index`, `sign-in`, `app/*`)
- `layouts/dashboard.vue` — sidebar + topbar shell for authed routes
- `components/ui/` — Button, Card, Badge, Modal, Tabs, etc.
- `components/landing/` — landing-page sections (Hero, Features, Pricing…)
- `components/landing/diagrams/` — three SVG illustrations for value props
- `components/dashboard/` — NetworkSwitcher, UserMenu, charts, key modals
- `components/icons/Icon.vue` — name-based icon registry
- `composables/` — `useLiveTip`, `useNetwork`, `useAuth` (SSR-safe state)
- `middleware/auth.ts` — gates `/app/*` routes
- `utils/` — formatters, mock data, syntax highlighter
- `assets/css/main.css` — design tokens, utility classes, animations
