<script setup lang="ts">
import { fmtNum, hl } from '~/utils/format'
import { sampleBlocks, sampleCell, sample_graphql_response } from '~/utils/data'

const endpoints = [
  { id: 'stats', method: 'GET', path: '/v1/stats', label: 'Indexer stats' },
  { id: 'blk', method: 'GET', path: '/v1/blocks/latest', label: 'Latest block' },
  { id: 'cells', method: 'GET', path: '/v1/cells', label: 'Cells by lock_hash' },
  { id: 'gql', method: 'POST', path: '/graphql', label: 'blocksLatest query' },
] as const

const active = ref<typeof endpoints[number]['id']>('stats')
const running = ref(false)
const response = ref<any>(null)
const latency = ref<number | null>(null)
const tip = useLiveTip()

const buildResponse = (id: typeof endpoints[number]['id']) => {
  if (id === 'stats') return {
    indexer_tip: tip.value.indexer_tip,
    node_tip: tip.value.node_tip,
    lag_blocks: tip.value.lag_blocks,
    snapshot_age_seconds: tip.value.snapshot_age_seconds,
    is_stale: false,
  }
  if (id === 'blk') {
    const b = sampleBlocks[0]
    return {
      number: tip.value.indexer_tip,
      hash: b.hash,
      parent_hash: b.parent_hash,
      timestamp_ms: Date.now(),
      epoch: b.epoch,
      transactions_count: b.transactions_count,
      proposals_count: b.proposals_count,
      uncles_count: b.uncles_count,
      nonce: b.nonce,
      indexed_at: new Date().toISOString(),
    }
  }
  if (id === 'cells') return {
    data: [sampleCell],
    next_cursor: 'eyJibG9ja19udW1iZXIiOjE0ODIzMzI4LCJ0eF9oYXNoIjoiMHhhMz…',
    meta: { indexer_tip: tip.value.indexer_tip, node_tip: tip.value.node_tip },
  }
  if (id === 'gql') return JSON.parse(sample_graphql_response)
  return {}
}

let runTimer: ReturnType<typeof setTimeout> | null = null
const run = () => {
  running.value = true
  response.value = null
  latency.value = null
  const ms = 90 + Math.floor(Math.random() * 80)
  if (runTimer) clearTimeout(runTimer)
  runTimer = setTimeout(() => {
    response.value = buildResponse(active.value)
    latency.value = ms
    running.value = false
  }, ms)
}

watch(active, run, { immediate: true })
onBeforeUnmount(() => { if (runTimer) clearTimeout(runTimer) })

const ep = computed(() => endpoints.find((e) => e.id === active.value)!)
const responseHtml = computed(() => response.value ? hl.json(JSON.stringify(response.value, null, 2)) : '')
</script>

<template>
  <section id="explorer" class="le">
    <div class="le__inner">
      <SectionHead
        eyebrow="Try a query"
        title="Query mainnet, no key required"
        subtitle="Send a request to a live indexer endpoint and read the response, headers and all."
      >
        <template #right>
          <div class="mono le__live">
            <span class="pulse-dot le__live-dot" />
            mainnet · indexer_tip {{ fmtNum(tip.indexer_tip) }}
          </div>
        </template>
      </SectionHead>

      <div class="le__grid">
        <div class="le__list">
          <div class="micro le__list-label">endpoints</div>
          <button
            v-for="e in endpoints" :key="e.id"
            class="btn-reset le__item"
            :class="{ 'le__item--active': e.id === active }"
            @click="active = e.id"
          >
            <div class="le__item-head">
              <span class="mono le__method" :style="{ color: e.method === 'POST' ? 'var(--brand)' : 'var(--text-muted)' }">{{ e.method }}</span>
              <span class="mono le__path" :style="{ color: e.id === active ? 'var(--text)' : 'var(--text-muted)' }">{{ e.path }}</span>
            </div>
            <span class="le__label">{{ e.label }}</span>
          </button>
        </div>

        <div class="le__panel">
          <div class="le__panel-head">
            <Badge :variant="ep.method === 'POST' ? 'brand' : 'neutral'" mono size="sm">{{ ep.method }}</Badge>
            <span class="mono le__panel-path">{{ ep.path }}</span>
            <Button variant="primary" size="sm" :loading="running" @click="run">
              <template v-if="!running" #leftIcon><Icon name="zap" :size="12" /></template>
              {{ running ? 'Running…' : 'Send' }}
            </Button>
          </div>
          <div class="le__panel-body">
            <div class="le__meta">
              <span class="micro" style="color: var(--text-dim)">response · 200 OK · {{ latency ?? '—' }} ms</span>
              <span class="micro" style="color: var(--text-dim)">x-indexer-tip {{ fmtNum(tip.indexer_tip) }}</span>
            </div>
            <div class="le__response">
              <div v-if="running" class="le__spinner-wrap">
                <span class="spin le__spinner" />
              </div>
              <pre v-else-if="response" class="fade-in le__pre"><span v-html="responseHtml" /></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.le { padding: 80px 24px; border-top: 1px solid var(--border-subtle); }
.le__inner { max-width: 1240px; margin: 0 auto; }
.le__live {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--text-dim); font-size: 12px;
}
.le__live-dot { width: 7px; height: 7px; border-radius: 99px; background: var(--brand); }
.le__grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
}
.le__list {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  padding: 8px;
}
.le__list-label { padding: 6px 10px; color: var(--text-dim); }
.le__item {
  width: 100%; text-align: left;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-left: 1px solid transparent;
  border-radius: 6px;
  margin-bottom: 2px;
  display: flex; flex-direction: column; gap: 3px;
}
.le__item--active {
  background: var(--surface-2);
  border-color: var(--border);
  border-left: 2px solid var(--brand);
  padding-left: 9px;
}
.le__item-head { display: flex; align-items: center; gap: 6px; }
.le__method { font-size: 10px; }
.le__path { font-size: 12px; }
.le__label { font-size: 11px; color: var(--text-dim); }
.le__panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.le__panel-head {
  display: flex; align-items: center; padding: 10px; gap: 10px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
}
.le__panel-path { font-size: 13px; flex: 1; color: var(--text); }
.le__panel-body {
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.55;
}
.le__meta { display: flex; justify-content: space-between; margin-bottom: 10px; }
.le__response { min-height: 240px; position: relative; }
.le__spinner-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-dim);
}
.le__spinner {
  display: inline-block; width: 14px; height: 14px; border-radius: 99px;
  border: 2px solid var(--text-dim); border-top-color: transparent;
}
.le__pre {
  margin: 0; color: var(--text);
  white-space: pre-wrap; word-break: break-word;
}
</style>
