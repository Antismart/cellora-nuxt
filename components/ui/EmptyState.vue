<script setup lang="ts">
defineProps<{ title: string; body: string }>()
</script>

<template>
  <div class="empty">
    <div v-if="$slots.icon" class="empty__icon">
      <slot name="icon" />
    </div>
    <div>
      <div class="empty__title">{{ title }}</div>
      <div class="empty__body">{{ body }}</div>
    </div>
    <div v-if="$slots.actions" class="empty__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 44px 24px; gap: 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-3);
  background: var(--bg-elev);
}
.empty__icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: var(--surface-2); border: 1px solid var(--border);
  display: grid; place-items: center; color: var(--text-muted);
}
.empty__title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.empty__body { font-size: 13px; color: var(--text-muted); max-width: 380px; }
.empty__actions { display: flex; gap: 8px; margin-top: 4px; }
</style>
