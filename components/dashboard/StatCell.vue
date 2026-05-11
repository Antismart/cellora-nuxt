<script setup lang="ts">
defineProps<{ label: string; value: string; sub?: string; accent?: string }>()
</script>

<template>
  <div class="sc-cell">
    <div class="micro sc-cell__label">{{ label }}</div>
    <div class="mono sc-cell__value" :style="{ color: accent || 'var(--text)' }">{{ value }}</div>
    <div v-if="sub" class="mono sc-cell__sub">{{ sub }}</div>
  </div>
</template>

<style scoped>
.sc-cell {
  padding: 18px;
  border-right: 1px solid var(--border-subtle);
}
.sc-cell__label { margin-bottom: 8px; }
.sc-cell__value {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.sc-cell__sub { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
</style>
