<script setup lang="ts">
import { fmtCompact, relTime, seedRand, hex } from '~/utils/format'
import { type ApiKey, type NetworkId } from '~/utils/data'
import { apiFetch, ApiError } from '~/composables/useApiFetch'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const network = useNetwork()


const keys = ref<ApiKey[]>([])
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const createOpen = ref(false)
const revealKey = ref<(ApiKey & { full: string }) | null>(null)
const revokeTarget = ref<ApiKey | null>(null)
const filter = ref<'all' | 'mainnet' | 'testnet'>(network.value)
watch(network, (v) => { filter.value = v })

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

const fetchKeys = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const res = await apiFetch<{ keys: any[] }>('/admin/keys')
    keys.value = res.keys.map((k) => ({
      id: k.id,
      label: k.label ?? 'unlabeled',
      prefix: k.prefix,
      tier: k.tier,
      network: 'mainnet', // Backend keys are implicitly single-network for now
      created: k.created_at,
      last_used: k.last_used_at,
      status: k.status,
      request_24h: 0,
    }))
  } catch (e) {
    const err = e as ApiError
    errorMsg.value = err.message ?? 'Failed to load API keys'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchKeys()
})

const onCreate = async (label: string, tier: 'free' | 'starter' | 'pro', net: NetworkId) => {
  errorMsg.value = null
  try {
    const res = await apiFetch<{ key: any; secret: string }>('/admin/keys', {
      method: 'POST',
      body: { label, tier },
    })
    const newKey: ApiKey = {
      id: res.key.id,
      label: res.key.label ?? 'unlabeled',
      prefix: res.key.prefix,
      tier: res.key.tier,
      network: net, // Visual tag based on user network selection
      created: res.key.created_at,
      last_used: res.key.last_used_at,
      status: res.key.status,
      request_24h: 0,
    }
    keys.value = [newKey, ...keys.value]
    createOpen.value = false
    revealKey.value = { ...newKey, full: res.secret }
  } catch (e) {
    const err = e as ApiError
    errorMsg.value = err.message ?? 'Failed to generate API key'
  }
}

const onRevoke = async (id: string) => {
  errorMsg.value = null
  try {
    await apiFetch(`/admin/keys/${id}`, {
      method: 'DELETE',
    })
    keys.value = keys.value.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    revokeTarget.value = null
  } catch (e) {
    const err = e as ApiError
    errorMsg.value = err.message ?? 'Failed to revoke API key'
  }
}

const onRotate = async (id: string) => {
  const key = keys.value.find((k) => k.id === id)
  if (!key) return

  errorMsg.value = null
  try {
    const res = await apiFetch<{ key: any; secret: string }>(`/admin/keys/${id}/rotate`, {
      method: 'POST',
    })
    const updatedKey: ApiKey = {
      id: res.key.id,
      label: res.key.label ?? 'unlabeled',
      prefix: res.key.prefix,
      tier: res.key.tier,
      network: key.network,
      created: res.key.created_at,
      last_used: res.key.last_used_at,
      status: res.key.status,
      request_24h: key.request_24h,
    }
    keys.value = keys.value.map((k) => (k.id === id ? updatedKey : k))
    revealKey.value = { ...updatedKey, full: res.secret }
  } catch (e) {
    const err = e as ApiError
    errorMsg.value = err.message ?? 'Failed to rotate API key'
  }
}

const tierVariant = (t: string) => (t === 'pro' ? 'brand' : t === 'starter' ? 'blue' : 'neutral')
</script>

<template>
  <div class="kp">
    <div v-if="errorMsg" class="kp__error fade-in">
      <Icon name="alert" :size="14" style="color: var(--red); flex: 0 0 14px; margin-top: 2px" />
      <div style="flex: 1">{{ errorMsg }}</div>
      <button class="btn-reset kp__error-close" @click="errorMsg = null">
        <Icon name="x" :size="12" />
      </button>
    </div>

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

    <Card v-if="loading" :padded="false">
      <table class="kp__table">
        <thead>
          <tr>
            <th v-for="h in ['Label', 'Prefix', 'Tier', 'Network', 'Created', 'Last used', '24h req', 'Status', '']" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 3" :key="i" class="row net-bar">
            <td class="kp__cell"><Skeleton w="120" h="14" /></td>
            <td class="kp__cell"><Skeleton w="100" h="14" /></td>
            <td class="kp__cell"><Skeleton w="50" h="16" /></td>
            <td class="kp__cell"><Skeleton w="70" h="16" /></td>
            <td class="kp__cell"><Skeleton w="80" h="14" /></td>
            <td class="kp__cell"><Skeleton w="80" h="14" /></td>
            <td class="kp__cell"><Skeleton w="40" h="14" /></td>
            <td class="kp__cell"><Skeleton w="60" h="16" /></td>
            <td class="kp__cell kp__actions"><Skeleton w="120" h="24" /></td>
          </tr>
        </tbody>
      </table>
    </Card>

    <EmptyState
      v-else-if="filtered.length === 0"
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
.kp__error {
  display: flex; gap: 10px;
  padding: 12px 14px;
  background: var(--red-tint);
  border: 1px solid var(--red);
  border-radius: var(--radius-2);
  color: var(--text);
  font-size: 13px;
  align-items: center;
}
.kp__error-close {
  margin-left: auto;
  color: var(--text-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
</style>
