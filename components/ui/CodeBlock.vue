<script setup lang="ts">
withDefaults(
  defineProps<{
    html: string
    copyValue?: string
    language?: string
    filename?: string
  }>(),
  { language: 'bash' },
)
</script>

<template>
  <div class="cb">
    <div class="cb__head">
      <div class="cb__filename-row">
        <span class="cb__dot" />
        <span class="micro" style="color: var(--text-muted)">{{ filename || language }}</span>
      </div>
      <CopyButton :value="copyValue ?? html" />
    </div>
    <div class="cb__body">
      <pre class="cb__pre"><span v-html="html" /></pre>
    </div>
  </div>
</template>

<style scoped>
.cb {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.55;
  box-shadow: var(--shadow-card);
}
.cb__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface);
}
.cb__filename-row { display: flex; align-items: center; gap: 10px; }
.cb__dot { width: 10px; height: 10px; border-radius: 99px; background: oklch(35% 0.008 150); }
.cb__body { padding: 16px; overflow: hidden; }
.cb__pre { margin: 0; font-family: inherit; font-size: inherit; color: var(--text); }
</style>
