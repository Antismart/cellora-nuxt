<script setup lang="ts">
import { markRaw } from 'vue'
import SkipInfraDiagram from './diagrams/SkipInfraDiagram.vue'
import ReorgDiagram from './diagrams/ReorgDiagram.vue'
import RestGqlDiagram from './diagrams/RestGqlDiagram.vue'

// markRaw — don't make the component definitions reactive (saves work, avoids warnings).
const items = [
  {
    title: 'Skip the infrastructure',
    body: 'No ckb-indexer to operate, no Postgres to tune, no snapshot pipeline to babysit. Three components you no longer run.',
    diagram: markRaw(SkipInfraDiagram),
  },
  {
    title: 'Reorg-safe by design',
    body: 'Reads stay consistent across chain reorgs. Parent hashes are walked and rollbacks are transactional, so you never read a partially-rewritten chain.',
    diagram: markRaw(ReorgDiagram),
  },
  {
    title: 'Query over REST or GraphQL',
    body: 'Two surfaces over the same indexed data. Shared API keys, per-key rate limits, and identical reorg semantics on both.',
    diagram: markRaw(RestGqlDiagram),
  },
]
</script>

<template>
  <section class="vp">
    <div class="vp__inner">
      <SectionHead
        eyebrow="Why Cellora"
        title="Index CKB without running the stack"
        subtitle="The work you skip and the correctness you'd otherwise build by hand."
      />
      <div class="vp__grid">
        <div v-for="it in items" :key="it.title" class="vp__card">
          <div class="vp__diagram">
            <component :is="it.diagram" />
          </div>
          <div class="vp__body">
            <div class="vp__title">{{ it.title }}</div>
            <div class="vp__text">{{ it.body }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vp { padding: 80px 24px; border-top: 1px solid var(--border-subtle); }
.vp__inner { max-width: 1240px; margin: 0 auto; }
.vp__grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.vp__card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.vp__diagram {
  aspect-ratio: 16 / 9;
  background: var(--bg-elev);
  border-bottom: 1px solid var(--border-subtle);
  position: relative; overflow: hidden;
}
.vp__body { padding: 22px; }
.vp__title {
  font-size: 16px; font-weight: 600;
  letter-spacing: -0.01em; margin-bottom: 6px;
}
.vp__text { font-size: 13.5px; color: var(--text-muted); line-height: 1.55; }
</style>
