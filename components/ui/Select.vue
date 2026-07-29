<script setup lang="ts">
defineProps<{
  modelValue: string
  options: Array<{ value: string; label: string }>
}>()
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <select
    class="select"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
</template>

<style scoped>
.select {
  appearance: none;
  background: var(--bg-elev);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  padding: 0 28px 0 10px;
  height: 34px;
  font-size: 13.5px;
  font-family: var(--font-sans);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: calc(100% - 10px) center;
  background-size: 10px 6px;
  background-repeat: no-repeat;
  cursor: pointer;
}
</style>
