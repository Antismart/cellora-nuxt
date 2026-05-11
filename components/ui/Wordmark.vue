<script setup lang="ts">
withDefaults(
  defineProps<{ size?: number; brand?: string }>(),
  { size: 18, brand: 'var(--brand)' },
)
</script>

<template>
  <span class="wm">
    <CellMark :size="size + 4" :brand="brand" />
    <span class="wm__text" :style="{ fontSize: `${size}px` }">Cellora</span>
  </span>
</template>

<style scoped>
.wm { display: inline-flex; align-items: center; gap: 8px; }
.wm__text {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text);
}
</style>
