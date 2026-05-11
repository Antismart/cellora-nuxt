<script setup lang="ts">
withDefaults(
  defineProps<{ size?: number; brand?: string }>(),
  { size: 22, brand: 'var(--brand)' },
)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="11" height="26" rx="1.5" :stroke="brand" stroke-width="1.6" />
    <rect x="17" y="3" width="12" height="11" rx="1.5" :stroke="brand" stroke-width="1.6" />
    <rect x="17" y="17" width="12" height="12" rx="1.5" :fill="brand" />
  </svg>
</template>
