<script setup lang="ts">
defineProps<{ items: Array<{ label: string; color: string; dashed?: boolean }> }>()
</script>

<template>
  <div class="lg">
    <span v-for="it in items" :key="it.label" class="lg__item">
      <span v-if="it.dashed" class="lg__dashed" :style="{ borderTopColor: it.color }" />
      <span v-else class="lg__chip" :style="{ background: it.color }" />
      {{ it.label }}
    </span>
  </div>
</template>

<style scoped>
.lg { display: inline-flex; gap: 14px; font-size: 12px; color: var(--text-muted); }
.lg__item { display: inline-flex; align-items: center; gap: 6px; }
.lg__chip { width: 10px; height: 10px; border-radius: 2px; }
.lg__dashed { width: 14px; border-top: 1.5px dashed; }
</style>
