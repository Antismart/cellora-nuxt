<script setup lang="ts">
import { fmtCompact, fmtNum } from '~/utils/format'

type Point = { label: string; rest: number; graphql: number }

const props = defineProps<{
  data: Point[]
  ceiling?: number
  surface: 'all' | 'rest' | 'graphql'
}>()

const W = 900, H = 260
const padL = 44, padR = 12, padT = 16, padB = 26
const cw = W - padL - padR
const ch = H - padT - padB

const showRest = computed(() => props.surface === 'all' || props.surface === 'rest')
const showGql = computed(() => props.surface === 'all' || props.surface === 'graphql')

const stacked = computed(() =>
  props.data.map((d) => (showRest.value ? d.rest : 0) + (showGql.value ? d.graphql : 0)),
)
const max = computed(() => Math.max(...stacked.value, props.ceiling || 0) * 1.08)

const yTicks = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map((p) => ({ y: padT + ch - p * ch, v: p * max.value })),
)

const restVals = computed(() => props.data.map((d) => (showRest.value ? d.rest : 0)))
const stackedVals = computed(() => props.data.map((d, i) => restVals.value[i] + (showGql.value ? d.graphql : 0)))

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

const restAreaPath = computed(() => buildAreaPath(restVals.value, cw, ch, max.value))
const restLinePath = computed(() => buildLinePath(restVals.value, cw, ch, max.value))
const stackedAreaPath = computed(() => buildAreaPath(stackedVals.value, cw, ch, max.value))
const stackedLinePath = computed(() => buildLinePath(stackedVals.value, cw, ch, max.value))

const ceilingY = computed(() => (props.ceiling ? ch - (props.ceiling / max.value) * ch : 0))

const hover = ref<number | null>(null)
const onMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const xRel = (e.clientX - rect.left - padL * (rect.width / W)) / (cw * (rect.width / W))
  hover.value = Math.max(0, Math.min(props.data.length - 1, Math.round(xRel * (props.data.length - 1))))
}

const xTickStride = computed(() => Math.ceil(props.data.length / 8))
const hoverX = computed(() => (hover.value == null ? 0 : padL + (hover.value / (props.data.length - 1)) * cw))
const tooltipLeft = computed(() => {
  if (hover.value == null) return '0%'
  return `calc(${padL}px + ${(hover.value / (props.data.length - 1)) * 100}% * ${cw / W})`
})
const tooltipTransform = computed(() => {
  if (hover.value == null) return 'translateX(0)'
  return hover.value < props.data.length / 2 ? 'translateX(12px)' : 'translateX(calc(-100% - 12px))'
})
</script>

<template>
  <div class="uc" @mouseleave="hover = null" @mousemove="onMove">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="uc__svg">
      <template v-for="(t, i) in yTicks" :key="i">
        <line :x1="padL" :y1="t.y" :x2="W - padR" :y2="t.y" stroke="var(--border-subtle)" :stroke-dasharray="i === 0 ? '' : '2 3'" />
        <text :x="padL - 8" :y="t.y + 3" text-anchor="end" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10.5">{{ fmtCompact(Math.round(t.v)) }}</text>
      </template>
      <template v-for="(d, i) in data" :key="`x-${i}`">
        <text v-if="i % xTickStride === 0" :x="padL + (i / (data.length - 1)) * cw" :y="H - padB + 16"
              text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10.5">{{ d.label }}</text>
      </template>
      <g :transform="`translate(${padL},${padT})`">
        <template v-if="showGql">
          <path :d="stackedAreaPath" fill="oklch(72% 0.13 240)" fill-opacity="0.14" />
          <path :d="stackedLinePath" stroke="oklch(72% 0.13 240)" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke" />
        </template>
        <template v-if="showRest">
          <path :d="restAreaPath" fill="var(--brand)" fill-opacity="0.14" />
          <path :d="restLinePath" stroke="var(--brand)" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke" />
        </template>
        <template v-if="ceiling">
          <line x1="0" :x2="cw" :y1="ceilingY" :y2="ceilingY"
                stroke="var(--amber)" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
          <text :x="cw - 4" :y="ceilingY - 4" text-anchor="end" fill="var(--amber)" font-family="var(--font-mono)" font-size="10">tier ceiling</text>
        </template>
      </g>
      <line v-if="hover != null" :x1="hoverX" :x2="hoverX" :y1="padT" :y2="padT + ch"
            stroke="var(--text-dim)" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" />
    </svg>
    <div v-if="hover != null && data[hover]" class="uc__tip" :style="{ left: tooltipLeft, transform: tooltipTransform }">
      <div class="uc__tip-label">{{ data[hover].label }}</div>
      <div v-if="showRest" style="color: var(--brand)">rest {{ fmtNum(data[hover].rest) }}</div>
      <div v-if="showGql" style="color: oklch(72% 0.13 240)">graphql {{ fmtNum(data[hover].graphql) }}</div>
    </div>
  </div>
</template>

<style scoped>
.uc { position: relative; height: 260px; }
.uc__svg { width: 100%; height: 100%; display: block; }
.uc__tip {
  position: absolute; top: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: var(--shadow-pop);
  font-size: 11.5px;
  font-family: var(--font-mono);
  white-space: nowrap;
  pointer-events: none;
}
.uc__tip-label { color: var(--text-dim); margin-bottom: 4px; }
</style>
