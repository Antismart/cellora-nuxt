<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="ch">
    <div>
      <div class="ch__title">{{ title }}</div>
      <div v-if="subtitle" class="ch__subtitle">{{ subtitle }}</div>
    </div>
    <slot name="right" />
  </div>
</template>

<style scoped>
.ch { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.ch__title { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
.ch__subtitle { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
</style>
