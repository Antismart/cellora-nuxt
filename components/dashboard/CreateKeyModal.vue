<script setup lang="ts">
import { tiers, NETWORKS, type NetworkId } from '~/utils/data'

const props = defineProps<{
  open: boolean
  defaultNetwork: NetworkId
}>()

const emit = defineEmits<{
  close: []
  create: [label: string, tier: 'free' | 'starter' | 'pro', net: NetworkId]
}>()

const label = ref('')
const tier = ref<'free' | 'starter' | 'pro'>('free')
const net = ref<NetworkId>(props.defaultNetwork)

watch(() => props.open, (v) => {
  if (v) {
    label.value = ''
    tier.value = 'free'
    net.value = props.defaultNetwork
  }
})

const valid = computed(() => label.value.trim().length > 0)
</script>

<template>
  <Modal
    :open="open"
    title="Create API key"
    subtitle="Reveal-once. Save it before you close the next dialog."
    @close="emit('close')"
  >
    <div class="ck">
      <Field label="Label" hint="Human-readable, only you see this.">
        <Input v-model="label" placeholder="e.g. production-api" />
      </Field>
      <Field label="Tier" hint="Determines REST + GraphQL rate buckets.">
        <div class="ck__tiers">
          <button
            v-for="t in ['free', 'starter', 'pro'] as const" :key="t"
            class="btn-reset ck__tier" :class="{ 'ck__tier--sel': tier === t }"
            @click="tier = t"
          >
            <div class="ck__tier-name" :class="{ 'ck__tier-name--sel': tier === t }">{{ t }}</div>
            <div class="mono ck__tier-limits">
              {{ tiers[t].rest_burst }}/{{ tiers[t].rest_refill }}rps · {{ tiers[t].gql_burst }}/{{ tiers[t].gql_refill }}rps
            </div>
          </button>
        </div>
      </Field>
      <Field label="Network" hint="Keys are network-scoped.">
        <div class="ck__nets">
          <button
            v-for="n in NETWORKS" :key="n.id"
            class="btn-reset ck__net" :class="{ 'ck__net--sel': net === n.id }"
            @click="net = n.id"
          >
            <span class="ck__net-dot" :style="{ background: n.accent }" />
            <div>
              <div class="ck__net-name">{{ n.label }}</div>
              <div class="mono ck__net-url">api.cellora.dev/v1/{{ n.id }}</div>
            </div>
          </button>
        </div>
      </Field>
    </div>
    <template #footer>
      <Button variant="ghost" @click="emit('close')">Cancel</Button>
      <Button variant="primary" :disabled="!valid" @click="emit('create', label.trim(), tier, net)">
        <template #leftIcon><Icon name="key" :size="13" /></template>
        Generate key
      </Button>
    </template>
  </Modal>
</template>

<style scoped>
.ck { display: flex; flex-direction: column; gap: 16px; }
.ck__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ck__tier {
  padding: 10px 12px;
  text-align: left;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.ck__tier--sel { background: var(--brand-tint-2); border-color: var(--brand-dim); }
.ck__tier-name {
  font-size: 13px; font-weight: 600;
  color: var(--text);
  text-transform: capitalize;
}
.ck__tier-name--sel { color: var(--brand-strong); }
.ck__tier-limits { font-size: 11.5px; color: var(--text-dim); margin-top: 4px; }
.ck__nets { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ck__net {
  padding: 10px 12px;
  text-align: left;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex; align-items: center; gap: 10px;
}
.ck__net--sel { background: var(--brand-tint-2); border-color: var(--brand-dim); }
.ck__net-dot { width: 8px; height: 8px; border-radius: 99px; }
.ck__net-name { font-size: 13px; font-weight: 500; }
.ck__net-url { font-size: 11.5px; color: var(--text-dim); }
</style>
