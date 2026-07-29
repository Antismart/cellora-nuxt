<script setup lang="ts">
import { fmtNum } from '~/utils/format'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()
const tip = useLiveTip()
const { displayUser: user } = useAuth()

const { data: usageData } = useFetch('/admin/metrics/usage', { query: { network }, default: () => [] })
const { data: activityData } = useFetch('/admin/metrics/activity', { query: { network }, default: () => [] })
const { data: statusData } = useFetch('/admin/metrics/status', { query: { network } })
const { data: summaryData } = useFetch('/admin/metrics/summary', { query: { network }, default: () => ({ rest_p95_ms: 0, graphql_p95_ms: 0, error_rate: 0, vs_yesterday_percent: 0 }) })
const { data: keysRes } = useFetch<{keys: any[]}>('/admin/keys', { query: { network }, default: () => ({keys: []}) })

const activeKeysCount = computed(() => keysRes.value?.keys?.filter(k => k.status === 'active').length || 0)
const summary = computed(() => summaryData.value)

const usage = computed(() => usageData.value)
const totalReq = computed(() => usage.value.reduce((s, p) => s + p.rest + p.graphql, 0))
const restTotal = computed(() => usage.value.reduce((s, p) => s + p.rest, 0))
const gqlTotal = computed(() => usage.value.reduce((s, p) => s + p.graphql, 0))
const stats = computed(() => statusData.value || { snapshot_age_seconds: 0 })
</script>

<template>
  <div class="ov">
    <div class="ov__welcome">
      <div class="lattice ov__welcome-bg" />
      <div class="ov__welcome-text">
        <div class="micro" style="margin-bottom: 8px">welcome back</div>
        <div class="ov__hey">
          <ClientOnly>
            Hey, <span class="mono" style="color: var(--brand-strong)">@{{ user.handle }}</span>.
            <template #fallback>
              Hey, <span class="mono" style="color: var(--brand-strong)">@guest</span>.
            </template>
          </ClientOnly>
        </div>
        <div class="ov__welcome-blurb">
          You're indexing <span class="mono" style="color: var(--text)">{{ fmtNum(totalReq) }}</span> requests in the last 24h across
          <span class="mono" style="color: var(--text)">{{ activeKeysCount }}</span> active keys. Indexer's healthy, lag is
          <span class="mono" :style="{ color: 'var(--net-accent)' }">{{ tip.lag_blocks }} blocks</span>.
        </div>
      </div>
      <div class="ov__welcome-cta">
        <Button variant="primary" @click="navigateTo('/app/keys')">
          <template #leftIcon><Icon name="plus" :size="14" /></template>
          Create API key
        </Button>
        <Button variant="outline" @click="navigateTo('/app/explorer')">
          <template #leftIcon><Icon name="terminal" :size="14" /></template>
          Open API explorer
        </Button>
      </div>
    </div>

    <div>
      <div class="ov__row-head">
        <div style="font-size: 14px; font-weight: 600">Indexer status</div>
        <button class="btn-reset ov__row-link" @click="navigateTo('/app/status')">
          See details <Icon name="chevronRight" :size="12" />
        </button>
      </div>
      <div class="ov__tiles">
        <Stat label="indexer_tip" :value="fmtNum(tip.indexer_tip)" sub="block height" icon-name="cube" />
        <Stat label="node_tip" :value="fmtNum(tip.node_tip)" sub="ckb-node-01 (primary)" icon-name="server" />
        <Stat label="lag_blocks" :value="String(tip.lag_blocks)" accent="var(--brand-strong)" :sub="`~${tip.lag_blocks * 8}s behind tip`" icon-name="activity" />
        <Stat label="is_stale" :value="tip.is_stale ? 'true' : 'false'" :accent="tip.is_stale ? 'var(--amber)' : 'var(--brand-strong)'" :sub="`snapshot ${stats.snapshot_age_seconds}s old`" icon-name="clock" />
      </div>
    </div>

    <div class="ov__cards">
      <Card>
        <CardHeader title="Recent activity" subtitle="Last 10 requests across all keys">
          <template #right>
            <Badge variant="outline" size="sm" mono>
              <span class="pulse-dot ov__live-dot" />live
            </Badge>
          </template>
        </CardHeader>
        <table class="ov__act">
          <tbody>
            <tr v-for="(r, i) in activityData" :key="i" class="row" :style="{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }">
              <td class="ov__act-method-cell">
                <Badge :variant="r.method === 'POST' ? 'brand' : 'neutral'" mono size="sm">{{ r.method }}</Badge>
              </td>
              <td class="ov__act-path mono">{{ r.path }}</td>
              <td class="ov__act-key mono">{{ r.key }}</td>
              <td class="ov__act-status mono" :style="{ color: r.status >= 400 ? 'var(--amber)' : 'var(--text-muted)' }">{{ r.status }}</td>
              <td class="ov__act-ms mono">{{ r.ms }}ms</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title="Requests, last 24h" subtitle="REST + GraphQL combined">
          <template #right>
            <button class="btn-reset ov__open-usage" @click="navigateTo('/app/usage')">Open Usage →</button>
          </template>
        </CardHeader>
        <div class="ov__total-row">
          <span class="mono ov__total">{{ fmtNum(totalReq) }}</span>
          <Badge :variant="summary.vs_yesterday_percent >= 0 ? 'brand' : 'amber'" size="sm" mono>
            {{ summary.vs_yesterday_percent >= 0 ? '+' : '' }}{{ summary.vs_yesterday_percent.toFixed(1) }}% vs yesterday
          </Badge>
        </div>
        <SparkChart :data="usage" />
        <div class="ov__metric-row">
          <div>
            <div class="micro">REST</div>
            <div class="mono ov__metric-val">{{ fmtNum(restTotal) }}</div>
          </div>
          <div>
            <div class="micro">GraphQL</div>
            <div class="mono ov__metric-val">{{ fmtNum(gqlTotal) }}</div>
          </div>
          <div>
            <div class="micro">p95</div>
            <div class="mono ov__metric-val">{{ Math.round(summary.rest_p95_ms) }}ms</div>
          </div>
          <div>
            <div class="micro">4xx + 5xx</div>
            <div class="mono ov__metric-val" :style="{ color: summary.error_rate > 1 ? 'var(--amber)' : 'var(--text)' }">
              {{ summary.error_rate.toFixed(2) }}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.ov { display: flex; flex-direction: column; gap: 24px; }
.ov__welcome {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px; align-items: center;
  position: relative; overflow: hidden;
}
.ov__welcome-bg {
  position: absolute; inset: 0; opacity: 0.5;
}
.ov__welcome-text { position: relative; }
.ov__hey { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
.ov__welcome-blurb { margin-top: 8px; font-size: 14px; color: var(--text-muted); max-width: 540px; }
.ov__welcome-cta { display: flex; gap: 8px; position: relative; }
.ov__row-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ov__row-link { font-size: 12.5px; color: var(--net-accent); display: inline-flex; align-items: center; gap: 4px; }
.ov__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ov__cards { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
.ov__live-dot {
  display: inline-block; width: 5px; height: 5px; border-radius: 99px;
  background: var(--net-accent); margin-right: 5px;
}
.ov__act { width: 100%; border-collapse: collapse; margin-top: -4px; }
.ov__act-method-cell { padding: 9px 8px 9px 0; width: 60px; }
.ov__act-path { padding: 9px 0; font-size: 12.5px; color: var(--text); }
.ov__act-key { padding: 9px 8px; text-align: right; font-size: 11.5px; color: var(--text-dim); }
.ov__act-status { padding: 9px 8px; width: 60px; text-align: right; font-size: 11.5px; }
.ov__act-ms { padding: 9px 0 9px 8px; width: 50px; text-align: right; font-size: 11.5px; color: var(--text-dim); }
.ov__open-usage { font-size: 12px; color: var(--net-accent); }
.ov__total-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.ov__total { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
.ov__metric-row { margin-top: 14px; display: flex; justify-content: space-between; }
.ov__metric-row .micro { margin-bottom: 4px; }
.ov__metric-val { font-size: 14px; color: var(--text); }
</style>
