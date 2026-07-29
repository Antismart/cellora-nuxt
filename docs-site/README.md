# Cellora docs site

Mintlify documentation for Cellora — a hosted indexer for Nervos CKB.

## Preview locally

Install the Mintlify CLI and run the dev server from this directory:

```bash
npm i -g mint
mint dev
```

Or without a global install:

```bash
npx mint dev
```

The site is served at `http://localhost:3000`. The CLI reads `docs.json` in this folder and hot-reloads `.mdx` pages as you edit them.

## Deploy

Deployment is handled by the Mintlify GitHub app. Install it and point it at this `docs-site/` folder; every push to the connected branch publishes the docs automatically.

## Configuration

- `docs.json` — current Mintlify config: site name, colors, navigation, private-alpha banner, and the Dashboard navbar link. Older Mintlify projects use `mint.json` with a different schema; if your CLI still expects that, rename and convert.
- Pages live as `.mdx` files at the paths referenced in `docs.json` navigation (`introduction.mdx`, `rest/*.mdx`, `graphql/*.mdx`, and the guides).

## Content sources

Content is migrated from the Cellora dashboard docs page (`pages/docs/index.vue`) and verified against the backend `docs/api.md` and `docs/openapi.json`. Every claim maps to a shipped feature. Cellora is in private alpha and licensed under FSL-1.1-ALv2.
