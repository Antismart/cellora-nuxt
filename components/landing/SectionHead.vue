<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; subtitle?: string }>()
</script>

<template>
  <div class="sh">
    <div class="sh__left">
      <div class="micro sh__eyebrow">{{ eyebrow }}</div>
      <h2 class="sh__title">{{ title }}</h2>
      <p v-if="subtitle" class="sh__subtitle">{{ subtitle }}</p>
    </div>
    <slot name="right" />
  </div>
</template>

<style scoped>
.sh { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.sh__left { max-width: 640px; }
.sh__eyebrow { color: var(--brand); margin-bottom: 10px; }
.sh__title {
  font-size: clamp(28px, 3.4vw, 38px);
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.1;
}
.sh__subtitle {
  margin-top: 12px;
  font-size: 15.5px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 540px;
}
</style>
