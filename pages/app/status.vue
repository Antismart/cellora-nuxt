<script setup lang="ts">
import { fmtNum, relTime } from '~/utils/format'
import { NETWORKS } from '~/utils/data'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()
const tip = useLiveTip()
const { data: statusData } = useFetch('/admin/metrics/status', { query: { network } })

const tipFor = (id: 'mainnet' | 'testnet') => {
  if (id === network.value) return tip.value
  return {
    indexer_tip: 0,
    node_tip: 0,
    lag_blocks: 0,
    snapshot_age_seconds: 0,
    is_stale: false,
  }
}

const activeNet = computed(() => NETWORKS.find((n) => n.id === network.value))

const getStatus = (id: string) => {
  if (statusData.value && statusData.value.network === id) {
    return statusData.value
  }
  return { snapshot_age_seconds: 0, nodes: [] }
}
</script>

<template>
  <div class="st">
    <div class="st__banner">
      <div class="st__banner-left">
        <span class="st__banner-icon"><Icon name="checkCircle" :size="16" /></span>
        <div>
          <div class="st__banner-title">All systems operational</div>
          <div class="mono st__banner-sub">last incident · 2026-04-29 · resolved in 8 minutes</div>
        </div>
      </div>
      <Badge variant="brand" mono dot="pulse">live</Badge>
    </div>

    <Card v-if="activeNet" :padded="false">
      <div class="st__net-head">
        <div class="st__net-head-left">
          <span class="pulse-dot st__net-dot" :style="{ background: activeNet.accent }" />
          <span class="st__net-name">{{ activeNet.label }}</span>
          <Badge variant="outline" size="sm" mono>us-east-1</Badge>
        </div>
        <span class="mono st__net-url">https://api.cellora.dev/v1/{{ activeNet.id }}</span>
      </div>

      <div class="st__net-stats">
        <StatCell label="indexer_tip" :value="fmtNum(tipFor(activeNet.id).indexer_tip)" />
        <StatCell label="node_tip" :value="fmtNum(tipFor(activeNet.id).node_tip)" />
        <StatCell label="lag_blocks" :value="String(tipFor(activeNet.id).lag_blocks)" accent="var(--brand-strong)" :sub="`~${tipFor(activeNet.id).lag_blocks * 8}s`" />
        <StatCell label="snapshot_age" :value="`${getStatus(activeNet.id).snapshot_age_seconds}s`" sub="rolling" />
      </div>

      <div class="st__net-body">
        <div>
          <div class="micro" style="margin-bottom: 12px">nodes · {{ getStatus(activeNet.id).nodes.length }}</div>
          <div class="st__nodes" v-if="getStatus(activeNet.id).nodes.length > 0">
            <div v-for="node in getStatus(activeNet.id).nodes" :key="node.name" class="st__node">
              <span class="pulse-dot st__node-dot" :style="{ background: node.sync_status === 'synced' ? 'var(--brand)' : 'var(--amber)' }" />
              <span class="mono st__node-id">{{ node.name }}</span>
              <Badge variant="outline" size="sm">{{ node.sync_status }}</Badge>
              <span style="flex: 1" />
              <span class="mono st__node-lag">lag 0</span>
            </div>
          </div>
          <div v-else class="st__empty-nodes">
            No nodes configured
          </div>
        </div>
        <div>
          <div class="micro" style="margin-bottom: 12px">recent reorg</div>
          <div class="st__reorg">
            <div class="st__reorg-text">
              No recent reorgs detected on this network.
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <div class="st__foot">
        <div class="st__foot-title">Need custom SLAs or dedicated nodes?</div>
        <div class="st__foot-body">Pro and Enterprise users can provision dedicated read-replicas directly via the Cellora API. Replicas are physically isolated from the shared token-bucket limits.</div>
        <Button variant="outline">Contact sales</Button>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.st { display: flex; flex-direction: column; gap: 20px; }
.st__banner {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2);
  padding: 16px 20px;
}
.st__banner-left { display: flex; align-items: center; gap: 14px; }
.st__banner-icon { color: var(--brand); display: flex; align-items: center; justify-content: center; }
.st__banner-title { font-size: 14.5px; font-weight: 500; margin-bottom: 2px; }
.st__banner-sub { font-size: 12.5px; color: var(--text-muted); }
.st__net-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
}
.st__net-head-left { display: flex; align-items: center; gap: 10px; }
.st__net-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); }
.st__net-name { font-size: 14px; font-weight: 500; }
.st__net-url { font-size: 12.5px; color: var(--text-muted); }
.st__net-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border-subtle);
}
.st__net-body {
  display: grid; grid-template-columns: 320px 1fr; gap: 32px;
  padding: 20px;
}
.st__nodes { display: flex; flex-direction: column; gap: 8px; }
.st__node {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2);
}
.st__empty-nodes { font-size: 13px; color: var(--text-muted); }
.st__node-dot { width: 6px; height: 6px; border-radius: 50%; }
.st__node-id { font-size: 12.5px; font-weight: 500; }
.st__node-lag { font-size: 12px; color: var(--text-muted); }
.st__reorg {
  padding: 14px 16px;
  background: var(--bg-base);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-2);
}
.st__reorg-text { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-top: 8px; }
.st__foot { padding: 4px 0; }
.st__foot-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.st__foot-body { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; max-width: 600px; }
</style>
