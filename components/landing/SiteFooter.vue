<script setup lang="ts">
const today = new Date().toISOString().slice(0, 10)

const groups = [
  { t: 'Product', l: ['Features', 'Live explorer', 'Status', 'Changelog'] },
  { t: 'Developers', l: ['Docs', 'OpenAPI spec', 'GraphQL schema', 'SDKs', 'GitHub'] },
  { t: 'Company', l: ['About', 'Blog', 'Careers', 'Contact'] },
  { t: 'Legal', l: ['License (FSL-1.1-ALv2)', 'Privacy', 'Terms', 'Security'] },
]
</script>

<template>
  <footer class="ftr">
    <div class="ftr__cols">
      <div>
        <Wordmark />
        <div class="ftr__tag">Indexer-as-a-Service for Nervos CKB.</div>
        <div class="ftr__status">
          <Badge variant="outline" size="sm" mono>
            <span class="pulse-dot ftr__status-dot" />All systems normal
          </Badge>
        </div>
      </div>
      <div v-for="g in groups" :key="g.t">
        <div class="micro" style="margin-bottom: 12px">{{ g.t }}</div>
        <div class="ftr__links">
          <a v-for="x in g.l" :key="x" href="#" class="ftr__link">{{ x }}</a>
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
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  gap: 40px;
}
.ftr__tag {
  margin-top: 12px;
  font-size: 12.5px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.55;
}
.ftr__status { margin-top: 18px; display: flex; align-items: center; gap: 10px; }
.ftr__status-dot {
  width: 6px; height: 6px; border-radius: 99px;
  background: var(--brand);
  display: inline-block; margin-right: 6px;
}
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
