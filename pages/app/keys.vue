<script setup lang="ts">
import { fmtCompact, relTime, seedRand, hex } from '~/utils/format'
import { apiKeysSeed, type ApiKey, type NetworkId } from '~/utils/data'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()

const keys = ref<ApiKey[]>([...apiKeysSeed])
const createOpen = ref(false)
const revealKey = ref<(ApiKey & { full: string }) | null>(null)
const revokeTarget = ref<ApiKey | null>(null)
const filter = ref<'all' | 'mainnet' | 'testnet'>('all')

const filtered = computed(() =>
  keys.value.filter((k) => {
    if (filter.value === 'all') return true
    return k.network === filter.value
  }),
)

const tabs = computed(() => [
  { value: 'all', label: 'All', count: keys.value.length },
  { value: 'mainnet', label: 'Mainnet', count: keys.value.filter((k) => k.network === 'mainnet').length },
  { value: 'testnet', label: 'Testnet', count: keys.value.filter((k) => k.network === 'testnet').length },
])

const onCreate = (label: string, tier: 'free' | 'starter' | 'pro', net: NetworkId) => {
  const r = seedRand((Date.now() % 1000) + 1)
  const prefix = 'cell_' + hex(r, 6).slice(2)
  const tail = hex(r, 32).slice(2)
  const full = prefix + '_' + tail
  const newKey: ApiKey = {
    id: 'k_' + Math.random().toString(36).slice(2, 6),
    label, tier, network: net,
    prefix, created: new Date().toISOString(),
    last_used: null, status: 'active', request_24h: 0,
  }
  keys.value = [newKey, ...keys.value]
  createOpen.value = false
  revealKey.value = { ...newKey, full }
}

const onRevoke = (id: string) => {
  keys.value = keys.value.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
  revokeTarget.value = null
}
const onRotate = (id: string) => {
  keys.value = keys.value.map((k) => (k.id === id ? { ...k, status: 'rotated' as const } : k))
}

const tierVariant = (t: string) => (t === 'pro' ? 'brand' : t === 'starter' ? 'blue' : 'neutral')
</script>

<template>
  <div class="kp">
    <div class="kp__head">
      <div class="kp__head-left">
        <Tabs v-model="filter" :items="tabs as any" />
        <Input placeholder="Search by label or prefix…" :style="{ width: '280px' }">
          <template #leftIcon><Icon name="search" :size="13" /></template>
        </Input>
      </div>
      <Button variant="primary" @click="createOpen = true">
        <template #leftIcon><Icon name="plus" :size="14" /></template>
        Create API key
      </Button>
    </div>

    <EmptyState
      v-if="filtered.length === 0"
      title="No API keys here"
      body="Create your first key to start hitting the indexer. Keys are reveal-once and Argon2id-hashed at rest — keep them safe."
    >
      <template #icon><Icon name="key" :size="20" /></template>
      <template #actions>
        <Button variant="primary" @click="createOpen = true">
          <template #leftIcon><Icon name="plus" :size="14" /></template>
          Create your first key
        </Button>
      </template>
    </EmptyState>

    <Card v-else :padded="false">
      <table class="kp__table">
        <thead>
          <tr>
            <th v-for="h in ['Label', 'Prefix', 'Tier', 'Network', 'Created', 'Last used', '24h req', 'Status', '']" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in filtered" :key="k.id" class="row" :class="k.network === 'mainnet' ? 'net-bar' : 'net-bar-test'">
            <td class="kp__cell"><div class="kp__label">{{ k.label }}</div></td>
            <td class="kp__cell">
              <span class="mono kp__prefix">
                {{ k.prefix }}…<CopyButton :value="`${k.prefix}…`" plain :size="11" />
              </span>
            </td>
            <td class="kp__cell">
              <Badge :variant="tierVariant(k.tier) as any" mono size="sm">{{ k.tier }}</Badge>
            </td>
            <td class="kp__cell">
              <Badge :variant="k.network === 'mainnet' ? 'brand' : 'testnet'" mono size="sm" dot>
                {{ k.network }}
              </Badge>
            </td>
            <td class="kp__cell mono kp__muted">{{ new Date(k.created).toISOString().slice(0, 10) }}</td>
            <td class="kp__cell mono kp__muted">{{ k.last_used ? relTime(k.last_used) : 'never' }}</td>
            <td class="kp__cell mono kp__text">{{ fmtCompact(k.request_24h) }}</td>
            <td class="kp__cell">
              <Badge v-if="k.status === 'active'" variant="brand" size="sm" dot="pulse">active</Badge>
              <Badge v-else-if="k.status === 'rotated'" variant="amber" size="sm">rotated</Badge>
              <Badge v-else variant="red" size="sm">revoked</Badge>
            </td>
            <td class="kp__cell kp__actions">
              <div class="kp__actions-inner">
                <Button variant="ghost" size="sm" :disabled="k.status !== 'active'" @click="onRotate(k.id)">
                  <template #leftIcon><Icon name="refreshCw" :size="12" /></template>
                  Rotate
                </Button>
                <Button variant="ghost" size="sm" :disabled="k.status === 'revoked'" @click="revokeTarget = k">
                  <template #leftIcon><Icon name="trash" :size="12" /></template>
                  Revoke
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <div class="kp__info">
      <Icon name="info" :size="14" style="color: var(--brand); flex: 0 0 14px; margin-top: 2px" />
      <div>
        Keys are <span class="mono" style="color: var(--text)">Argon2id</span>-hashed at rest. Cellora cannot recover a lost key — only the prefix is visible after creation. If you lose one, rotate it.
      </div>
    </div>

    <CreateKeyModal
      :open="createOpen"
      :default-network="network"
      @close="createOpen = false"
      @create="onCreate"
    />
    <RevealKeyModal :data="revealKey" @close="revealKey = null" />
    <Modal
      :open="!!revokeTarget"
      title="Revoke this key?"
      :subtitle="revokeTarget ? `${revokeTarget.label} · ${revokeTarget.prefix}…` : ''"
      @close="revokeTarget = null"
    >
      <p style="margin: 0; color: var(--text-muted); font-size: 13.5px; line-height: 1.5">
        Any client using this key will start receiving <span class="mono">401 unauthorized</span> within ~30 seconds. This cannot be undone — you'll need to issue a new one.
      </p>
      <template #footer>
        <Button variant="ghost" @click="revokeTarget = null">Cancel</Button>
        <Button variant="dangerSolid" @click="revokeTarget && onRevoke(revokeTarget.id)">
          <template #leftIcon><Icon name="trash" :size="13" /></template>
          Revoke key
        </Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.kp { display: flex; flex-direction: column; gap: 20px; }
.kp__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.kp__head-left { display: flex; align-items: center; gap: 10px; }
.kp__table { width: 100%; border-collapse: collapse; }
.kp__table th {
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-dim);
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
  font-family: var(--font-mono);
}
.kp__cell { padding: 14px 14px; border-bottom: 1px solid var(--border-subtle); }
.kp__label { font-size: 13.5px; font-weight: 500; }
.kp__prefix {
  font-size: 12.5px; color: var(--text-muted);
  display: inline-flex; align-items: center; gap: 6px;
}
.kp__muted { font-size: 12.5px; color: var(--text-muted); }
.kp__text { font-size: 12.5px; color: var(--text); }
.kp__actions { padding: 10px 14px; text-align: right; }
.kp__actions-inner { display: inline-flex; gap: 4px; }
.kp__info {
  display: flex; gap: 10px;
  padding: 12px 14px;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2);
  color: var(--text-muted);
  font-size: 12.5px;
}
</style>
