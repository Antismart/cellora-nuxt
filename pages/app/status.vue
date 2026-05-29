<script setup lang="ts">
import { fmtNum, relTime } from '~/utils/format'
import { NETWORKS, TIP_BASE, statusByNetwork as initialStatusByNetwork } from '~/utils/data'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()
const tip = useLiveTip()
const { data: statusData } = useFetch('/admin/metrics/status')

const statusByNetwork = computed(() => {
  const merged = { ...initialStatusByNetwork }
  if (statusData.value) {
    merged['mainnet'] = {
      ...merged['mainnet'],
      snapshot_age_seconds: statusData.value.snapshot_age_seconds,
      nodes: statusData.value.nodes,
    }
  }
  return merged
})

const tipFor = (id: 'mainnet' | 'testnet') => {
  if (id === network.value) return tip.value
  return {
    indexer_tip: TIP_BASE - (id === 'testnet' ? 12 : 0),
    node_tip: TIP_BASE + 3 - (id === 'testnet' ? 12 : 0),
    lag_blocks: id === 'testnet' ? 1 : 3,
    snapshot_age_seconds: 4,
    is_stale: false,
  }
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

    <Card v-for="n in NETWORKS" :key="n.id" :padded="false">
      <div class="st__net-head">
        <div class="st__net-head-left">
          <span class="pulse-dot st__net-dot" :style="{ background: n.accent }" />
          <span class="st__net-name">{{ n.label }}</span>
          <Badge variant="outline" size="sm" mono>{{ statusByNetwork[n.id].region }}</Badge>
        </div>
        <span class="mono st__net-url">https://api.cellora.dev/v1/{{ n.id }}</span>
      </div>

      <div class="st__net-stats">
        <StatCell label="indexer_tip" :value="fmtNum(tipFor(n.id).indexer_tip)" />
        <StatCell label="node_tip" :value="fmtNum(tipFor(n.id).node_tip)" />
        <StatCell label="lag_blocks" :value="String(tipFor(n.id).lag_blocks)" accent="var(--brand-strong)" :sub="`~${tipFor(n.id).lag_blocks * 8}s`" />
        <StatCell label="snapshot_age" :value="`${statusByNetwork[n.id].snapshot_age_seconds}s`" sub="rolling" />
      </div>

      <div class="st__net-body">
        <div>
          <div class="micro" style="margin-bottom: 12px">nodes · {{ statusByNetwork[n.id].nodes.length }}</div>
          <div class="st__nodes">
            <div v-for="node in statusByNetwork[n.id].nodes" :key="node.id" class="st__node">
              <span class="pulse-dot st__node-dot" :style="{ background: node.ok ? 'var(--brand)' : 'var(--red)' }" />
              <span class="mono st__node-id">{{ node.id }}</span>
              <Badge variant="outline" size="sm">{{ node.role }}</Badge>
              <span style="flex: 1" />
              <span class="mono st__node-lag">lag {{ node.lag }}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="micro" style="margin-bottom: 12px">recent reorg</div>
          <div class="st__reorg">
            <div class="st__reorg-head">
              <Badge variant="amber" size="sm">depth {{ statusByNetwork[n.id].last_reorg.depth }}</Badge>
              <span class="mono st__reorg-ts">{{ relTime(statusByNetwork[n.id].last_reorg.ts) }}</span>
            </div>
            <div class="st__reorg-text">
              Reorg detected at block <span class="mono" style="color: var(--text)">#{{ fmtNum(statusByNetwork[n.id].last_reorg.block) }}</span>.
              Cellora rolled back <span class="mono">{{ statusByNetwork[n.id].last_reorg.depth }}</span> block{{ statusByNetwork[n.id].last_reorg.depth > 1 ? 's' : '' }} transactionally.
              Reads were blocked for &lt;1s.
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <CardHeader title="Uptime, last 30 days" subtitle="Per-network availability — measured from the API gateway" />
      <UptimeBars />
    </Card>
  </div>
</template>

<style scoped>
.st { display: flex; flex-direction: column; gap: 20px; }
.st__banner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  background: var(--brand-tint-2);
  border: 1px solid oklch(36% 0.10 150);
  border-radius: 10px;
}
.st__banner-left { display: flex; align-items: center; gap: 12px; }
.st__banner-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--brand-tint);
  display: grid; place-items: center;
  color: var(--brand);
}
.st__banner-title { font-size: 14px; font-weight: 600; color: var(--brand-strong); }
.st__banner-sub { font-size: 12.5px; color: var(--text-muted); }
.st__net-head {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; justify-content: space-between;
}
.st__net-head-left { display: flex; align-items: center; gap: 10px; }
.st__net-dot { width: 8px; height: 8px; border-radius: 99px; }
.st__net-name { font-size: 14px; font-weight: 600; }
.st__net-url { font-size: 12px; color: var(--text-dim); }
.st__net-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border-subtle);
}
.st__net-body { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.st__nodes { display: flex; flex-direction: column; gap: 6px; }
.st__node {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.st__node-dot { width: 7px; height: 7px; border-radius: 99px; }
.st__node-id { font-size: 12px; color: var(--text); }
.st__node-lag { font-size: 12px; color: var(--text-dim); }
.st__reorg {
  padding: 14px;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.st__reorg-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.st__reorg-ts { font-size: 11.5px; color: var(--text-dim); }
.st__reorg-text { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
</style>
