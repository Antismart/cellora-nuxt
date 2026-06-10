<script setup lang="ts">
import { fmtCompact, fmtNum, relTime } from '~/utils/format'
import { tiers } from '~/utils/data'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()

const range = ref<'24h' | '7d' | '30d'>('24h')
const surface = ref<'all' | 'rest' | 'graphql'>('all')
const keyFilter = ref<string>('all')

const { data: usageData } = useFetch('/admin/metrics/usage', { query: { network }, default: () => [] })
const data = computed(() => usageData.value)
const total = computed(() => data.value.reduce((s, p) => s + p.rest + p.graphql, 0))
const ceiling = computed(() => tiers.pro.rest_burst * 60)

const rangeTabs = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

const { data: keysRes } = useFetch<{keys: any[]}>('/admin/keys', { query: { network }, default: () => ({keys: []}) })
const keyOptions = computed(() => [
  { value: 'all', label: 'All keys' },
  ...(keysRes.value?.keys || []).map((k) => ({ value: k.id, label: k.label ?? 'unlabeled' })),
])

// These are now wired to the backend
const { data: summaryData } = useFetch('/admin/metrics/summary', { query: { network }, default: () => ({ rest_p95_ms: 0, graphql_p95_ms: 0, rate_limit_rate: 0, rate_limit_count: 0 }) })
const summary = computed(() => summaryData.value)

const { data: breakdownDataRef } = useFetch('/admin/metrics/endpoints', { query: { network }, default: () => [] })
const breakdownData = computed(() => breakdownDataRef.value)

const { data: rateLimitEventsRef } = useFetch('/admin/metrics/rate-limits', { query: { network }, default: () => [] })
const rateLimitEvents = computed(() => rateLimitEventsRef.value)

const surfaceOptions = [
  { value: 'all', label: 'REST + GraphQL' },
  { value: 'rest', label: 'REST only' },
  { value: 'graphql', label: 'GraphQL only' },
]

const legendItems = [
  { label: 'REST', color: 'oklch(72% 0.16 150)' },
  { label: 'GraphQL', color: 'oklch(72% 0.13 240)' },
  { label: 'Tier ceiling', color: 'var(--amber)', dashed: true },
]

const maxRequests = computed(() => breakdownData.value.length ? breakdownData.value[0].requests : 1)
</script>

<template>
  <div class="up">
    <div class="up__filters">
      <div class="up__filters-left">
        <Tabs v-model="range" :items="rangeTabs as any" />
        <Select v-model="keyFilter" :options="keyOptions" />
        <Select v-model="surface" :options="surfaceOptions as any" />
      </div>
      <div class="up__updated mono">
        <Icon name="clock" :size="12" /> Updated 14s ago
      </div>
    </div>

    <div class="up__tiles">
      <Stat label="Total requests" :value="fmtCompact(total)" :sub="`${range} window`" icon-name="activity" />
      <Stat label="REST p95" :value="`${Math.round(summary.rest_p95_ms)} ms`" sub="ceiling 200 ms" icon-name="zap" />
      <Stat label="GraphQL p95" :value="`${Math.round(summary.graphql_p95_ms)} ms`" sub="ceiling 300 ms" icon-name="zap" />
      <Stat label="429 rate" :value="`${summary.rate_limit_rate.toFixed(2)}%`" :accent="summary.rate_limit_rate > 1 ? 'var(--amber)' : 'var(--text)'" :sub="`${summary.rate_limit_count} events in 24h`" icon-name="alert" />
    </div>

    <Card>
      <CardHeader title="Requests over time" :subtitle="`${range} · stacked by surface`">
        <template #right><ChartLegend :items="legendItems" /></template>
      </CardHeader>
      <UsageChart :data="data" :ceiling="ceiling" :surface="surface" />
    </Card>

    <div class="up__cards">
      <Card>
        <CardHeader title="Top endpoints" subtitle="By request volume in the selected window" />
        <table class="up__top">
          <tbody>
            <tr v-for="(e, i) in breakdownData" :key="e.endpoint" class="row" :style="{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }">
              <td class="up__rank">{{ String(i + 1).padStart(2, '0') }}</td>
              <td class="up__endpoint">
                <span class="mono" style="font-size: 12.5px; color: var(--text)">{{ e.endpoint }}</span>
              </td>
              <td class="up__bar-cell">
                <div class="up__bar"><div class="up__bar-fill" :style="{ width: `${(e.requests / maxRequests) * 100}%` }" /></div>
              </td>
              <td class="up__count">{{ fmtNum(e.requests) }}</td>
              <td class="up__p95">p95 {{ e.p95_ms }}ms</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title="Recent 429s" subtitle="Tune your client backoff using Retry-After" />
        <EmptyState
          v-if="rateLimitEvents.length === 0"
          title="Zero rate-limit events"
          body="Either you're under-using your tier or your backoff is solid. Either way, nice."
        >
          <template #icon><Icon name="checkCircle" :size="20" /></template>
        </EmptyState>
        <div v-else class="up__429s">
          <div v-for="(e, i) in rateLimitEvents" :key="i" class="up__429-row" :style="{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }">
            <Badge variant="amber" size="sm" mono>429</Badge>
            <div class="up__429-mid">
              <div class="mono up__429-endpoint">{{ e.endpoint }}</div>
              <div class="mono up__429-meta">{{ e.key }} · {{ e.surface }} · {{ relTime(e.ts) }}</div>
            </div>
            <span class="mono up__429-retry">retry {{ e.retry_after }}s</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.up { display: flex; flex-direction: column; gap: 20px; }
.up__filters { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.up__filters-left { display: flex; gap: 10px; align-items: center; }
.up__updated {
  display: flex; align-items: center; gap: 10px;
  color: var(--text-dim); font-size: 12px;
}
.up__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.up__cards { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
.up__top { width: 100%; border-collapse: collapse; }
.up__rank { padding: 10px 0; width: 24px; color: var(--text-faint); font-family: var(--font-mono); font-size: 11px; }
.up__endpoint { padding: 10px 8px; }
.up__bar-cell { padding: 10px 8px; width: 30%; }
.up__bar { height: 6px; background: var(--bg-elev); border-radius: 99px; overflow: hidden; }
.up__bar-fill { height: 100%; background: var(--net-accent); }
.up__count {
  padding: 10px 8px; text-align: right;
  font-family: var(--font-mono); font-size: 12.5px;
  color: var(--text-muted); width: 90px;
}
.up__p95 {
  padding: 10px 0 10px 8px; text-align: right;
  font-family: var(--font-mono); font-size: 12px;
  color: var(--text-dim); width: 64px;
}
.up__429s { display: flex; flex-direction: column; gap: 0; }
.up__429-row {
  display: grid; grid-template-columns: auto 1fr auto;
  gap: 10px; padding: 11px 0;
}
.up__429-mid { min-width: 0; }
.up__429-endpoint {
  font-size: 12.5px; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.up__429-meta { font-size: 11.5px; color: var(--text-dim); }
.up__429-retry { font-size: 12px; color: var(--amber); }
</style>
