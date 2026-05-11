<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    sub?: string
    accent?: string
    mono?: boolean
    iconName?: string
  }>(),
  { mono: true },
)
</script>

<template>
  <div class="stat">
    <div class="stat__head">
      <div class="micro">{{ label }}</div>
      <span v-if="iconName" class="stat__icon">
        <Icon :name="iconName as any" :size="14" />
      </span>
    </div>
    <div class="stat__value" :class="{ 'mono': mono }" :style="{ color: accent || 'var(--text)' }">
      {{ value }}
    </div>
    <div v-if="sub" class="stat__sub">{{ sub }}</div>
  </div>
</template>

<style scoped>
.stat {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  padding: 16px;
  position: relative;
  overflow: hidden;
}
.stat__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.stat__icon { color: var(--text-dim); }
.stat__value {
  font-size: 26px; font-weight: 500;
  letter-spacing: -0.02em; line-height: 1.1;
}
.stat__sub { margin-top: 6px; font-size: 12px; color: var(--text-muted); }
</style>
