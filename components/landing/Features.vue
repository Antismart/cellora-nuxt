<script setup lang="ts">
const items = [
  { iconName: 'layers', title: 'Cursor pagination', detail: 'Stable, ordered cursors that survive reorgs. No offset traps.', hint: '?cursor=eyJibG9ja19udW1iZXIiOjE0ODIzMzI…' },
  { iconName: 'shield', title: 'Well-known script tagging', detail: 'lock_kind / type_kind on every cell. SECP256K1, anyone-can-pay, sUDT, xUDT, RGB++…', hint: 'lock_kind: "secp256k1_blake160"' },
  { iconName: 'activity', title: 'Tip-lag stats', detail: 'Every response carries x-indexer-tip and x-indexer-tip-stale headers.', hint: 'x-indexer-tip-stale: false' },
  { iconName: 'box', title: 'Transaction proofs passthrough', detail: 'Forward CKB MMR-style inclusion proofs without re-implementing the verifier.', hint: 'GET /v1/transactions/{hash}/proof' },
  { iconName: 'server', title: 'Prometheus metrics', detail: 'p50/p95/p99 by endpoint, key, surface. Drop into your Grafana, alert on lag.', hint: 'cellora_request_duration_seconds_bucket' },
  { iconName: 'code', title: 'OpenAPI 3.1 spec', detail: 'Codegen clients from the spec; Swagger UI lives in the dashboard.', hint: 'GET /v1/openapi.json' },
]
</script>

<template>
  <section id="features" class="ft">
    <div class="ft__inner">
      <SectionHead
        eyebrow="On every response"
        title="What the API gives you"
        subtitle="Cursors, script tags, tip-lag headers, inclusion proofs, and metrics — on the response, not bolted on later."
      />
      <div class="ft__grid">
        <div v-for="it in items" :key="it.title" class="ft__cell">
          <div class="ft__icon">
            <Icon :name="it.iconName as any" :size="18" />
          </div>
          <div class="ft__title">{{ it.title }}</div>
          <div class="ft__detail">{{ it.detail }}</div>
          <div class="ft__hint-wrap">
            <span class="mono ft__hint">{{ it.hint }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ft { padding: 80px 24px; border-top: 1px solid var(--border-subtle); }
.ft__inner { max-width: 1240px; margin: 0 auto; }
.ft__grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  overflow: hidden;
}
.ft__cell {
  background: var(--bg);
  padding: 24px;
  display: flex; flex-direction: column; gap: 10px;
  min-height: 180px;
}
.ft__icon {
  width: 32px; height: 32px; border-radius: 7px;
  background: var(--brand-tint-2);
  border: 1px solid oklch(36% 0.08 150);
  display: grid; place-items: center; color: var(--brand);
}
.ft__title {
  font-size: 15px; font-weight: 600;
  margin-top: 4px;
  letter-spacing: -0.01em;
}
.ft__detail { font-size: 13px; color: var(--text-muted); line-height: 1.55; }
.ft__hint-wrap { margin-top: auto; padding-top: 10px; }
.ft__hint { font-size: 11.5px; color: var(--text-dim); letter-spacing: -0.02em; }
</style>
