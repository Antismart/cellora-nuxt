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
  background-image: linear-gradient(45deg, transparent 50%, var(--text-dim) 50%),
                    linear-gradient(135deg, var(--text-dim) 50%, transparent 50%);
  background-position: calc(100% - 14px) 14px, calc(100% - 9px) 14px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  cursor: pointer;
}
</style>
