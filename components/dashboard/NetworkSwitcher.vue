<script setup lang="ts">
import { NETWORKS, type NetworkId } from '~/utils/data'

defineProps<{ modelValue: NetworkId }>()
defineEmits<{ 'update:modelValue': [v: NetworkId] }>()
</script>

<template>
  <div class="ns">
    <button
      v-for="n in NETWORKS" :key="n.id"
      class="btn-reset ns__btn"
      :class="{ 'ns__btn--active': n.id === modelValue }"
      @click="$emit('update:modelValue', n.id)"
    >
      <span class="ns__dot" :class="{ 'pulse-dot': n.id === modelValue }" :style="{ background: n.accent }" />
      {{ n.label }}
    </button>
  </div>
</template>

<style scoped>
.ns {
  display: flex;
  padding: 3px;
  gap: 2px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.ns__btn {
  flex: 1;
  padding: 6px 8px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  border-radius: 5px;
  font-size: 12px; font-weight: 500;
}
.ns__btn--active {
  background: var(--surface-2);
  border-color: var(--border);
  color: var(--text);
}
.ns__dot { width: 7px; height: 7px; border-radius: 99px; }
</style>
