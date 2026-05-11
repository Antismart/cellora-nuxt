<script setup lang="ts">
import { fmtNum } from '~/utils/format'

type Point = { label: string; rest: number; graphql: number }

const props = defineProps<{ data: Point[] }>()

const W = 600
const H = 100

const stacked = computed(() => props.data.map((d) => d.rest + d.graphql))
const restOnly = computed(() => props.data.map((d) => d.rest))
const max = computed(() => Math.max(...stacked.value) * 1.08)

const buildAreaPath = (vals: number[], w: number, h: number, maxV: number) => {
  const n = vals.length
  if (n < 2) return ''
  const xs = vals.map((_, i) => (i / (n - 1)) * w)
  const ys = vals.map((v) => h - (v / maxV) * h)
  let p = `M${xs[0]},${h} L${xs[0]},${ys[0]}`
  for (let i = 1; i < n; i++) p += ` L${xs[i]},${ys[i]}`
  p += ` L${xs[n - 1]},${h} Z`
  return p
}
const buildLinePath = (vals: number[], w: number, h: number, maxV: number) => {
  const n = vals.length
  const xs = vals.map((_, i) => (i / (n - 1)) * w)
  const ys = vals.map((v) => h - (v / maxV) * h)
  return xs.map((x, i) => (i === 0 ? `M${x},${ys[i]}` : `L${x},${ys[i]}`)).join(' ')
}

const stackedArea = computed(() => buildAreaPath(stacked.value, W, H, max.value))
const stackedLine = computed(() => buildLinePath(stacked.value, W, H, max.value))
const restArea = computed(() => buildAreaPath(restOnly.value, W, H, max.value))
const restLine = computed(() => buildLinePath(restOnly.value, W, H, max.value))

const hover = ref<number | null>(null)

const onMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * props.data.length
  hover.value = Math.max(0, Math.min(props.data.length - 1, Math.round(x)))
}

const hoverPos = computed(() => {
  if (hover.value == null) return 0
  return (hover.value / (props.data.length - 1)) * W
})
const tooltipLeftPct = computed(() => {
  if (hover.value == null) return '0%'
  return `${(hover.value / (props.data.length - 1)) * 100}%`
})
const tooltipTransform = computed(() => {
  if (hover.value == null) return 'translateX(0)'
  return hover.value < props.data.length / 2 ? 'translateX(8px)' : 'translateX(calc(-100% - 8px))'
})
</script>

<template>
  <div class="sc" @mouseleave="hover = null" @mousemove="onMove">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="sc__svg">
      <defs>
        <linearGradient id="sg-rest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--brand)" stop-opacity="0.5" />
          <stop offset="100%" stop-color="var(--brand)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="sg-gql" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="oklch(72% 0.13 240)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="oklch(72% 0.13 240)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="stackedArea" fill="url(#sg-gql)" />
      <path :d="stackedLine" stroke="oklch(72% 0.13 240)" stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke" />
      <path :d="restArea" fill="url(#sg-rest)" />
      <path :d="restLine" stroke="var(--brand)" stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke" />
      <line
        v-if="hover != null"
        :x1="hoverPos" :x2="hoverPos" y1="0" :y2="H"
        stroke="var(--text-dim)" stroke-width="1" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"
      />
    </svg>
    <div v-if="hover != null && data[hover]" class="sc__tip" :style="{ left: tooltipLeftPct, transform: tooltipTransform }">
      <div class="sc__tip-label">{{ data[hover].label }}</div>
      <div style="color: var(--brand)">rest {{ fmtNum(data[hover].rest) }}</div>
      <div style="color: oklch(72% 0.13 240)">graphql {{ fmtNum(data[hover].graphql) }}</div>
    </div>
  </div>
</template>

<style scoped>
.sc { position: relative; height: 110px; }
.sc__svg { width: 100%; height: 100%; display: block; }
.sc__tip {
  position: absolute; top: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: var(--shadow-pop);
  font-size: 11.5px;
  font-family: var(--font-mono);
  white-space: nowrap;
  pointer-events: none;
}
.sc__tip-label { color: var(--text-dim); margin-bottom: 2px; }
</style>
