<script setup lang="ts">
type Item = {
  value: string
  label: string
  iconName?: string
  count?: number
}

withDefaults(
  defineProps<{
    modelValue: string
    items: Item[]
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="it in items" :key="it.value"
      role="tab" :aria-selected="it.value === modelValue"
      class="btn-reset tab"
      :class="[
        `tab--${size}`,
        { 'tab--active': it.value === modelValue },
      ]"
      @click="$emit('update:modelValue', it.value)"
    >
      <Icon v-if="it.iconName" :name="it.iconName as any" :size="12" />
      {{ it.label }}
      <span v-if="it.count != null" class="mono tab__count">{{ it.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
}
.tab {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border-radius: 5px;
  border: 1px solid transparent;
  display: inline-flex; align-items: center; gap: 6px;
}
.tab--sm { padding: 4px 10px; }
.tab--md { padding: 6px 12px; }
.tab--active {
  color: var(--text);
  background: var(--surface-2);
  border-color: var(--border);
}
.tab__count { font-size: 11px; color: var(--text-dim); }
</style>
