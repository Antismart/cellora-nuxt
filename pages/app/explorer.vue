<script setup lang="ts">
import { fmtNum, hl } from '~/utils/format'
import { apiKeysSeed, sampleCell, sample_graphql, sample_graphql_response } from '~/utils/data'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()
const tip = useLiveTip()

const tab = ref<'rest' | 'graphql'>('rest')
const endpoint = ref('/v1/cells')
type Param = { key: string; value: string }
const params = ref<Param[]>([
  { key: 'lock_hash', value: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8' },
  { key: 'limit', value: '20' },
])
const activeKey = ref('k_01')
const running = ref(false)
const response = ref<any>(null)
const latency = ref(38)
const gqlQuery = ref(sample_graphql)

const restEndpoints = [
  '/v1/stats', '/v1/blocks/latest', '/v1/blocks/{number}',
  '/v1/cells', '/v1/cells/{tx_hash}/{output_index}',
  '/v1/transactions/{hash}', '/v1/scripts/well-known', '/v1/health',
]

const availableKeys = computed(() =>
  apiKeysSeed
    .filter((k) => k.network === network.value && k.status !== 'revoked')
    .map((k) => ({ value: k.id, label: `${k.label} · ${k.prefix}…` })),
)

const tabs = [
  { value: 'rest', label: 'REST · OpenAPI 3.1', iconName: 'globe' },
  { value: 'graphql', label: 'GraphQL · /graphql', iconName: 'hash' },
]

let timer: ReturnType<typeof setTimeout> | null = null
const run = () => {
  running.value = true
  response.value = null
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const ms = 30 + Math.floor(Math.random() * 80)
    latency.value = ms
    if (tab.value === 'rest') {
      response.value = {
        data: [sampleCell],
        next_cursor: 'eyJibG9ja19udW1iZXIiOjE0ODIzMzI4LC…',
        meta: { indexer_tip: tip.value.indexer_tip, node_tip: tip.value.node_tip },
      }
    } else {
      response.value = JSON.parse(sample_graphql_response)
    }
    running.value = false
  }, 220)
}

watch(tab, run, { immediate: true })
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

const responseHtml = computed(() => (response.value ? hl.json(JSON.stringify(response.value, null, 2)) : ''))
const responseRaw = computed(() => (response.value ? JSON.stringify(response.value, null, 2) : ''))

const authValue = computed(() => {
  const k = apiKeysSeed.find((x) => x.id === activeKey.value)
  return `Bearer ${k?.prefix}…`
})

const addParam = () => params.value.push({ key: '', value: '' })
const removeParam = (i: number) => params.value.splice(i, 1)
</script>

<template>
  <div class="ex">
    <div class="ex__head">
      <Tabs v-model="tab" :items="tabs as any" />
      <div class="ex__head-right">
        <span class="micro" style="color: var(--text-dim)">auth header</span>
        <Select v-model="activeKey" :options="availableKeys" />
        <Button variant="primary" size="md" :loading="running" @click="run">
          <template v-if="!running" #leftIcon><Icon name="zap" :size="13" /></template>
          {{ running ? 'Running…' : tab === 'rest' ? 'Send' : 'Run query' }}
        </Button>
      </div>
    </div>

    <div v-if="tab === 'rest'" class="ex__rest">
      <Card :padded="false" style="overflow: hidden">
        <div class="ex__list-head">
          <span class="micro">REST endpoints</span>
          <Badge variant="outline" size="sm" mono>3.1</Badge>
        </div>
        <div class="ex__list">
          <button
            v-for="e in restEndpoints" :key="e"
            class="btn-reset ex__list-item"
            :class="{ 'ex__list-item--active': e === endpoint }"
            @click="endpoint = e"
          >
            <span class="mono ex__list-method">GET</span>
            <span class="mono ex__list-path" :style="{ color: e === endpoint ? 'var(--text)' : 'var(--text-muted)' }">{{ e }}</span>
          </button>
        </div>
      </Card>

      <div class="ex__rest-main">
        <Card :padded="false">
          <div class="ex__req-head">
            <Badge variant="neutral" mono size="sm">GET</Badge>
            <span style="flex: 1">
              <span class="mono" style="font-size: 13px; color: var(--text-muted)">https://api.cellora.dev</span>
              <span class="mono" style="font-size: 13px; color: var(--text); font-weight: 500">{{ endpoint }}</span>
            </span>
          </div>
          <div class="ex__req-body">
            <div class="micro" style="margin-bottom: 8px">query parameters</div>
            <div class="ex__params">
              <div v-for="(p, i) in params" :key="i" class="ex__param-row">
                <Input v-model="p.key" mono />
                <Input v-model="p.value" mono />
                <Button variant="ghost" size="md" @click="removeParam(i)">
                  <Icon name="x" :size="13" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" style="align-self: flex-start" @click="addParam">
                <template #leftIcon><Icon name="plus" :size="12" /></template>
                Add parameter
              </Button>
            </div>
            <div class="micro" style="margin-top: 16px; margin-bottom: 8px">headers</div>
            <div class="ex__hdr-grid">
              <Input :model-value="'Authorization'" mono readonly />
              <Input :model-value="authValue" mono readonly />
            </div>
          </div>
        </Card>

        <Card :padded="false">
          <div class="ex__res-head">
            <div class="ex__res-meta">
              <Badge variant="brand" size="sm" dot>200 OK</Badge>
              <span class="mono ex__res-meta-text">{{ latency }}ms</span>
              <span class="mono ex__res-meta-text">x-indexer-tip {{ fmtNum(tip.indexer_tip) }}</span>
              <span class="mono ex__res-meta-text">x-ratelimit-remaining 2,994</span>
            </div>
            <CopyButton :value="responseRaw" />
          </div>
          <div class="ex__res-body">
            <Skeleton v-if="running" :h="140" />
            <pre v-else-if="response" class="fade-in ex__pre"><span v-html="responseHtml" /></pre>
          </div>
        </Card>
      </div>
    </div>

    <div v-else class="ex__gql">
      <Card :padded="false">
        <div class="ex__gql-head">
          <span class="micro">query · /graphql</span>
          <CopyButton :value="gqlQuery" />
        </div>
        <textarea v-model="gqlQuery" class="ex__gql-textarea" />
      </Card>
      <Card :padded="false">
        <div class="ex__res-head">
          <Badge variant="brand" size="sm" dot>200 OK</Badge>
          <span class="mono ex__res-meta-text">{{ latency }}ms</span>
          <span style="flex: 1" />
          <CopyButton :value="responseRaw" />
        </div>
        <div class="ex__res-body" style="min-height: 360px">
          <pre v-if="response" class="fade-in ex__pre"><span v-html="responseHtml" /></pre>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.ex { display: flex; flex-direction: column; gap: 16px; }
.ex__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ex__head-right { display: flex; align-items: center; gap: 10px; }
.ex__rest { display: grid; grid-template-columns: 260px 1fr; gap: 14px; align-items: stretch; }
.ex__list-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; justify-content: space-between;
}
.ex__list { padding: 6px; max-height: 520px; overflow: auto; }
.ex__list-item {
  width: 100%;
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-left: 1px solid transparent;
  border-radius: 5px;
  margin-bottom: 1px;
}
.ex__list-item--active {
  background: var(--surface-2);
  border-color: var(--border);
  border-left: 2px solid var(--brand);
  padding-left: 9px;
}
.ex__list-method { font-size: 9.5px; color: var(--text-dim); }
.ex__list-path { font-size: 12px; text-align: left; }

.ex__rest-main { display: flex; flex-direction: column; gap: 12px; }
.ex__req-head {
  padding: 10px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
}
.ex__req-body { padding: 14px; }
.ex__params { display: flex; flex-direction: column; gap: 8px; }
.ex__param-row { display: grid; grid-template-columns: 180px 1fr 30px; gap: 8px; }
.ex__hdr-grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px; }
.ex__res-head {
  padding: 10px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}
.ex__res-meta { display: flex; align-items: center; gap: 12px; }
.ex__res-meta-text { font-size: 12px; color: var(--text-dim); }
.ex__res-body {
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 12.5px; line-height: 1.6;
  min-height: 240px;
}
.ex__pre { margin: 0; color: var(--text); white-space: pre-wrap; }

.ex__gql { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ex__gql-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
  display: flex; align-items: center; justify-content: space-between;
}
.ex__gql-textarea {
  width: 100%; min-height: 360px;
  padding: 14px;
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 13px; line-height: 1.6;
  border: 0; outline: 0; resize: vertical;
}
</style>
