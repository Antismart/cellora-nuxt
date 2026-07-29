<script setup lang="ts">
const today = new Date().toISOString().slice(0, 10)

// Only in-page anchors that actually resolve on this landing page.
const groups = [
  {
    t: 'On this page',
    l: [
      { label: 'Features', href: '#features' },
      { label: 'Live explorer', href: '#explorer' },
    ],
  },
]
</script>

<template>
  <footer class="ftr">
    <div class="ftr__cols">
      <div>
        <Wordmark />
        <div class="ftr__tag">Indexer-as-a-Service for Nervos CKB.</div>
        <div class="ftr__status">
          <Badge variant="brand" size="sm" dot="pulse">Private alpha · Wk 5/7</Badge>
        </div>
      </div>
      <div v-for="g in groups" :key="g.t">
        <div class="micro" style="margin-bottom: 12px">{{ g.t }}</div>
        <div class="ftr__links">
          <a v-for="x in g.l" :key="x.label" :href="x.href" class="ftr__link">{{ x.label }}</a>
        </div>
      </div>
    </div>
    <div class="hairline ftr__bottom">
      <span>© 2026 Cellora</span>
      <span class="mono">v0.5.2 · {{ today }}</span>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  padding: 40px 24px 60px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elev);
}
.ftr__cols {
  max-width: 1240px; margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}
.ftr__tag {
  margin-top: 12px;
  font-size: 12.5px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.55;
}
.ftr__status { margin-top: 18px; display: flex; align-items: center; gap: 10px; }
.ftr__links { display: flex; flex-direction: column; gap: 8px; }
.ftr__link { font-size: 13px; color: var(--text-muted); }
.ftr__bottom {
  margin-top: 40px;
  padding-top: 18px;
  max-width: 1240px;
  margin-left: auto; margin-right: auto;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: var(--text-dim);
}
</style>
