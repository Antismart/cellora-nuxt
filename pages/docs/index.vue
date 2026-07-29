<script setup lang="ts">
// The in-dashboard docs page is retired. Documentation now lives on an external
// site. Any direct hit or stale link to /docs bounces to the external docs URL.
// `external: true` makes this a full navigation (SSR-friendly) rather than an
// internal route change.
const docsUrl = useRuntimeConfig().public.docsUrl
await navigateTo(docsUrl, { external: true })
</script>

<template>
  <div />
</template>
