<script setup lang="ts">
import { hl } from '~/utils/format'

type Data = {
  full: string
  label: string
  network: string
  tier: string
} | null

const props = defineProps<{ data: Data }>()
const emit = defineEmits<{ close: [] }>()

const confirmed = ref(false)

watch(() => props.data, (v) => {
  if (v) confirmed.value = false
})

const example = computed(() =>
  props.data
    ? `curl https://cellora-nuxt.vercel.app/v1/blocks/latest \\
  -H "Authorization: Bearer ${props.data.full}"`
    : ''
)
const exampleHtml = computed(() => hl.bash(example.value))

const tryClose = () => {
  if (confirmed.value) emit('close')
}
</script>

<template>
  <Modal
    :open="!!data"
    title="Your new API key"
    subtitle="This is the only time you'll see the full key. Copy it somewhere safe."
    :width="620"
    @close="tryClose"
  >
    <div v-if="data" class="rk">
      <div class="rk__key">
        <div class="micro" style="margin-bottom: 8px">{{ data.label }} · {{ data.network }} · {{ data.tier }}</div>
        <div class="rk__key-row">
          <code class="rk__code">{{ data.full }}</code>
          <CopyButton :value="data.full" label="Copy key" />
        </div>
      </div>
      <div class="rk__warn">
        <Icon name="alert" :size="14" style="color: var(--amber); flex: 0 0 14px; margin-top: 2px" />
        <div class="rk__warn-text">
          We won't be able to show this key again. If you lose it, you'll need to rotate it from the keys table.
        </div>
      </div>
      <div>
        <div class="micro" style="margin-bottom: 8px">Use it</div>
        <CodeBlock language="bash" filename="example.sh" :html="exampleHtml" :copy-value="example" />
      </div>
      <label class="rk__check">
        <input v-model="confirmed" type="checkbox" class="rk__checkbox" />
        I've saved this key in a safe place.
      </label>
    </div>
    <template #footer>
      <span class="rk__foot-note">
        <Icon name="lock" :size="12" /> Stored as Argon2id hash. Lost = reissue.
      </span>
      <Button variant="primary" :disabled="!confirmed" @click="emit('close')">I've saved this</Button>
    </template>
  </Modal>
</template>

<style scoped>
.rk { display: flex; flex-direction: column; gap: 16px; }
.rk__key {
  background: var(--bg-elev);
  border: 1px solid var(--brand-dim);
  border-radius: 8px;
  padding: 14px;
}
.rk__key-row { display: flex; align-items: center; gap: 8px; }
.rk__code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 13.5px;
  color: var(--brand-strong);
  word-break: break-all;
  line-height: 1.5;
}
.rk__warn {
  display: flex; gap: 10px;
  padding: 12px;
  background: var(--amber-tint);
  border: 1px solid oklch(48% 0.10 75);
  border-radius: 8px;
}
.rk__warn-text { font-size: 12.5px; color: oklch(85% 0.10 75); line-height: 1.5; }
.rk__check {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--text-muted);
  cursor: pointer;
}
.rk__checkbox { width: 16px; height: 16px; accent-color: oklch(72% 0.16 150); }
.rk__foot-note {
  flex: 1;
  font-size: 12px;
  color: var(--text-dim);
  display: flex; align-items: center; gap: 6px;
}
</style>
