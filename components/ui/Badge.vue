<script setup lang="ts">
type Variant = 'neutral' | 'brand' | 'amber' | 'red' | 'blue' | 'testnet' | 'outline'
type DotMode = boolean | 'pulse'

withDefaults(
  defineProps<{
    variant?: Variant
    dot?: DotMode
    mono?: boolean
    size?: 'sm' | 'md'
  }>(),
  { variant: 'neutral', dot: false, mono: false, size: 'md' },
)
</script>

<template>
  <span :class="['badge', `badge--${variant}`, `badge--${size}`, { 'badge--mono': mono }]">
    <span v-if="dot" class="badge__dot" :class="{ 'pulse-dot': dot === 'pulse' }" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid;
  font-family: var(--font-sans);
}
.badge--mono { font-family: var(--font-mono); letter-spacing: -0.02em; }
.badge--sm { font-size: 10.5px; padding: 1px 6px; height: 18px; }
.badge--md { font-size: 11px; padding: 2px 8px; height: 20px; }
.badge--neutral { background: var(--surface-2); color: var(--text-muted); border-color: var(--border); }
.badge--brand { background: var(--brand-tint); color: var(--brand-strong); border-color: oklch(40% 0.10 150); }
.badge--amber { background: var(--amber-tint); color: var(--amber); border-color: oklch(48% 0.10 75); }
.badge--red { background: var(--red-tint); color: oklch(82% 0.14 25); border-color: oklch(48% 0.14 25); }
.badge--blue { background: var(--blue-tint); color: oklch(82% 0.10 240); border-color: oklch(48% 0.10 240); }
.badge--testnet { background: var(--testnet-tint); color: oklch(86% 0.10 75); border-color: oklch(48% 0.12 75); }
.badge--outline { background: transparent; color: var(--text-muted); border-color: var(--border); }
.badge__dot {
  width: 6px; height: 6px; border-radius: 99px;
  background: currentColor; display: inline-block;
}
</style>
