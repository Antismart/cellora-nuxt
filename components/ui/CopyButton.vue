<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    size?: number
    plain?: boolean
  }>(),
  { label: 'Copy', size: 14, plain: false },
)

const done = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

const onClick = (e: MouseEvent) => {
  e.stopPropagation()
  if (import.meta.client) {
    navigator.clipboard?.writeText(props.value).catch(() => {})
  }
  done.value = true
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (done.value = false), 1200)
}

onBeforeUnmount(() => { if (resetTimer) clearTimeout(resetTimer) })
</script>

<template>
  <button
    class="btn-reset copy"
    :class="{ 'copy--done': done, 'copy--plain': plain }"
    :aria-label="done ? 'Copied' : `Copy ${label}`"
    @click="onClick"
  >
    <Icon :name="done ? 'check' : 'copy'" :size="size" />
    <span v-if="!plain" class="micro copy__label">{{ done ? 'Copied' : label }}</span>
  </button>
</template>

<style scoped>
.copy {
  display: inline-flex; align-items: center; gap: 4px;
  color: var(--text-dim);
  padding: 2px 4px; border-radius: 4px;
  transition: color 120ms;
}
.copy--plain { padding: 0; }
.copy--done { color: var(--brand); }
.copy__label { font-size: 11px; }
</style>
