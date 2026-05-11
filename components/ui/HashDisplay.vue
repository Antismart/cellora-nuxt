<script setup lang="ts">
import { truncMid } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
    prefix?: number
    suffix?: number
    full?: boolean
    color?: string
  }>(),
  { size: 12.5, prefix: 6, suffix: 4, full: false, color: 'var(--text-muted)' },
)

const display = computed(() => (props.full ? props.value : truncMid(props.value, props.prefix, props.suffix)))
</script>

<template>
  <span class="hd">
    <span class="mono hd__text" :style="{ fontSize: `${size}px`, color }">{{ display }}</span>
    <CopyButton :value="value" plain :size="11" />
  </span>
</template>

<style scoped>
.hd { display: inline-flex; align-items: center; gap: 6px; }
.hd__text { letter-spacing: -0.02em; }
</style>
