<script setup lang="ts">
import { seedRand } from '~/utils/format'

const r = seedRand(7)
const days = Array.from({ length: 90 }, () => {
  const v = r()
  return v < 0.02 ? 'deg' : v < 0.05 ? 'warn' : 'ok'
}) as Array<'ok' | 'warn' | 'deg'>

const colorFor = (d: 'ok' | 'warn' | 'deg') =>
  d === 'ok' ? 'var(--brand)' : d === 'warn' ? 'var(--amber)' : 'var(--red)'
</script>

<template>
  <div>
    <div class="ub__row">
      <div
        v-for="(d, i) in days" :key="i"
        :title="`Day ${i + 1}`"
        class="ub__bar"
        :style="{ background: colorFor(d), opacity: d === 'ok' ? 0.85 : 1 }"
      />
    </div>
    <div class="ub__legend">
      <span class="mono ub__legend-edge">90 days ago</span>
      <span class="mono ub__legend-pct">99.94% uptime</span>
      <span class="mono ub__legend-edge">today</span>
    </div>
  </div>
</template>

<style scoped>
.ub__row { display: flex; gap: 2px; align-items: stretch; }
.ub__bar { flex: 1; height: 28px; border-radius: 2px; }
.ub__legend { display: flex; justify-content: space-between; margin-top: 8px; }
.ub__legend-edge { font-size: 11px; color: var(--text-dim); }
.ub__legend-pct { font-size: 11.5px; color: var(--brand); }
</style>
