<script setup lang="ts">
import { NETWORKS, type NetworkId } from '~/utils/data'

const props = defineProps<{ pageTitle: string; network: NetworkId }>()
const net = computed(() => NETWORKS.find((n) => n.id === props.network)!)
</script>

<template>
  <div class="tb nav-blur">
    <div class="tb__left">
      <span class="tb__title">{{ pageTitle }}</span>
      <span class="micro tb__net">· {{ net.label }}</span>
    </div>
    <div class="tb__right">
      <Input placeholder="Search keys, blocks, hashes…" :style="{ width: '320px' }">
        <template #leftIcon><Icon name="search" :size="13" /></template>
        <template #rightSlot>
          <span class="mono tb__kbd">⌘K</span>
        </template>
      </Input>
      <Button variant="default" size="md">
        <template #leftIcon><Icon name="book" :size="14" /></template>
        Docs
      </Button>
    </div>
  </div>
</template>

<style scoped>
.tb {
  border-bottom: 1px solid var(--border-subtle);
  padding: 14px 36px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: var(--bg);
  position: sticky; top: 0;
  z-index: 10;
}
.tb__left { display: flex; align-items: center; gap: 14px; }
.tb__title { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
.tb__net { color: var(--text-dim); }
.tb__right { display: flex; align-items: center; gap: 10px; }
.tb__kbd {
  font-size: 11px; padding: 1px 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-dim);
}
</style>
