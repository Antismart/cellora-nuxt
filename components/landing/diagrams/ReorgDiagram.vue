<script setup lang="ts">
const main = [0, 1, 2, 3, 4, 5]
const fork = [0, 1]
</script>

<template>
  <svg viewBox="0 0 320 180" style="width: 100%; height: 100%">
    <template v-for="i in main" :key="i">
      <rect
        :x="20 + i * 42" y="76" width="28" height="28" rx="3"
        :fill="i === 5 ? 'var(--brand-tint)' : 'var(--surface-2)'"
        :stroke="i === 5 ? 'var(--brand)' : 'var(--border-strong)'" stroke-width="1"
      />
      <text :x="34 + i * 42" y="94" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--text-muted)">{{ 14823412 + i }}</text>
      <line v-if="i < 5" :x1="20 + i * 42 + 28" y1="90" :x2="20 + (i + 1) * 42" y2="90" stroke="var(--border-strong)" stroke-width="1" />
    </template>
    <g v-for="i in fork" :key="`fork-${i}`" opacity="0.6">
      <rect :x="20 + 4 * 42 + i * 42" y="124" width="28" height="28" rx="3" fill="var(--bg-elev)" stroke="oklch(50% 0.10 25)" stroke-dasharray="3 3" stroke-width="1" />
      <text :x="34 + 4 * 42 + i * 42" y="142" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="oklch(70% 0.13 25)">{{ 14823416 + i }}'</text>
    </g>
    <line :x1="20 + 4 * 42" y1="104" :x2="20 + 4 * 42 + 4" y2="124" stroke="oklch(50% 0.10 25)" stroke-dasharray="3 3" />
    <text x="160" y="32" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="var(--text-muted)">canonical</text>
    <text x="240" y="172" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="oklch(70% 0.13 25)">orphaned · rolled back</text>
    <text x="20" y="32" font-family="var(--font-mono)" font-size="9" fill="var(--brand)">parent_hash → walked</text>
  </svg>
</template>
