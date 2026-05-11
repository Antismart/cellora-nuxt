<script setup lang="ts">
defineProps<{ label: string; hint?: string }>()
</script>

<template>
  <div class="field">
    <div class="field__head">
      <span class="field__label">{{ label }}</span>
      <span v-if="hint" class="field__hint">{{ hint }}</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.field__head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 6px;
}
.field__label { font-size: 12.5px; font-weight: 500; color: var(--text); }
.field__hint { font-size: 11.5px; color: var(--text-dim); }
</style>
