<script setup lang="ts">
import { fmtNum, hl } from '~/utils/format'
import {
  sample_curl, sample_response, sample_graphql, sample_graphql_response,
} from '~/utils/data'

defineEmits<{ signIn: [] }>()

const snippet = ref<'rest' | 'graphql' | 'js'>('rest')
const tip = useLiveTip()
const docsUrl = useRuntimeConfig().public.docsUrl

function openDocs() {
  window.open(docsUrl, '_blank', 'noopener,noreferrer')
}

const jsCode = `const res = await fetch(
  "https://cellora-nuxt.vercel.app/v1/cells?" + new URLSearchParams({
    lock_hash: "0x9bd7e06f...3cce8",
    limit: "20",
  }),
  { headers: { Authorization: \`Bearer \${process.env.CELLORA_KEY}\` } },
);

const { data } = await res.json();
console.log(data[0].capacity_shannons);
// → 19900000000`

const tabs = [
  { value: 'rest', label: 'REST', iconName: 'globe' },
  { value: 'graphql', label: 'GraphQL', iconName: 'hash' },
  { value: 'js', label: 'TypeScript', iconName: 'code' },
]

const reqHtml = computed(() => {
  if (snippet.value === 'rest') return hl.bash(sample_curl)
  if (snippet.value === 'graphql') return hl.graphql(sample_graphql)
  return hl.bash(jsCode)
})
const reqRaw = computed(() => {
  if (snippet.value === 'rest') return sample_curl
  if (snippet.value === 'graphql') return sample_graphql
  return jsCode
})
const resHtml = computed(() => {
  if (snippet.value === 'rest') return hl.json(sample_response)
  if (snippet.value === 'graphql') return hl.json(sample_graphql_response)
  return hl.json('{ "ok": true }')
})
const promptLabel = computed(() => {
  if (snippet.value === 'graphql') return 'POST /graphql'
  if (snippet.value === 'js') return 'node example.ts'
  return 'request'
})
</script>

<template>
  <section class="hero">
    <div class="lattice lattice-fade hero__lattice" />
    <div class="hero__grid">
      <div>
        <div class="micro hero__eyebrow">
          <Icon name="cell" :size="11" /> Private alpha · access is invite-based
        </div>
        <h1 class="hero__title">
          Query Nervos CKB data<br />over REST and GraphQL.
        </h1>
        <p class="hero__lede">
          A hosted indexer for CKB. Get blocks, transactions, and cells through a
          clean API instead of running your own ckb-indexer, Postgres, and snapshot
          pipeline.
        </p>
        <div class="hero__ctas">
          <Button variant="primary" size="lg" @click="$emit('signIn')">
            <template #leftIcon><Icon name="github" :size="15" /></template>
            Request access
          </Button>
          <Button variant="outline" size="lg" @click="openDocs">
            Read the docs
            <template #rightIcon><Icon name="arrowUpRight" :size="14" /></template>
          </Button>
        </div>
      </div>

      <div class="hero__terminal-wrap">
        <div class="hero__tip-card">
          <span class="pulse-dot hero__tip-dot" />
          <span class="micro" style="color: var(--text-muted)">indexer_tip</span>
          <span class="mono hero__tip-num">{{ fmtNum(tip.indexer_tip) }}</span>
          <span class="hero__tip-sep" />
          <span class="micro" style="color: var(--text-muted)">lag</span>
          <span class="mono hero__tip-lag">{{ tip.lag_blocks }}</span>
        </div>

        <div class="hero__terminal">
          <div class="hero__term-head">
            <div class="hero__term-dots">
              <span /><span /><span />
            </div>
            <span class="micro hero__term-path">~ / cellora</span>
            <span style="flex: 1" />
            <Tabs v-model="snippet" :items="tabs" size="sm" />
          </div>
          <div class="hero__term-body">
            <div class="hero__prompt">$ {{ promptLabel }}</div>
            <pre class="hero__req"><span v-html="reqHtml" /></pre>
            <div class="hero__sep">
              <span />
              <span class="micro hero__sep-label">200 OK · 41ms · indexer_tip {{ fmtNum(tip.indexer_tip) }}</span>
              <span />
            </div>
            <pre class="hero__res"><span v-html="resHtml" /></pre>
          </div>
          <div class="hero__term-foot">
            <span class="micro" style="color: var(--text-dim)">X-RateLimit-Remaining</span>
            <span class="mono hero__rl">2,994 / 3,000</span>
            <span style="flex: 1" />
            <CopyButton :value="reqRaw" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { overflow: hidden; padding-bottom: 80px; }
.hero__lattice {
  position: absolute; inset: 0; opacity: 0.7;
  pointer-events: none;
}
.hero__grid {
  max-width: 1240px; margin: 0 auto;
  padding: 76px 24px 0;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 56px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero__eyebrow {
  margin-bottom: 18px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--bg-elev);
}
.hero__title {
  font-size: clamp(40px, 5.4vw, 68px);
  line-height: 1.02;
  letter-spacing: -0.035em;
  margin: 0;
  font-weight: 600;
  text-wrap: balance;
}
.hero__lede {
  margin-top: 22px;
  max-width: 540px;
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.5;
  text-wrap: pretty;
}
.hero__ctas { margin-top: 28px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.hero__terminal-wrap { position: relative; }
.hero__tip-card {
  position: absolute; top: -22px; right: 8px; z-index: 2;
  display: flex; align-items: center; gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 10px 5px 8px;
  box-shadow: var(--shadow-card);
}
.hero__tip-dot { width: 7px; height: 7px; border-radius: 99px; background: var(--brand); }
.hero__tip-num { font-size: 12.5px; color: var(--text); }
.hero__tip-sep { width: 1px; height: 12px; background: var(--border); }
.hero__tip-lag { font-size: 12.5px; color: var(--brand-strong); }

.hero__terminal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-4);
  overflow: hidden;
  box-shadow: var(--shadow-pop);
}
.hero__term-head {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elev);
}
.hero__term-dots { display: flex; gap: 6px; }
.hero__term-dots span {
  width: 10px; height: 10px; border-radius: 99px;
  background: oklch(36% 0.008 150);
}
.hero__term-path { margin-left: 6px; color: var(--text-muted); }
.hero__term-body {
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.62;
}
.hero__prompt { color: var(--text-faint); margin-bottom: 8px; }
.hero__req {
  margin: 0; color: var(--text);
  white-space: pre-wrap; word-break: break-word;
}
.hero__sep {
  display: flex; align-items: center; gap: 8px;
  margin: 16px 0 8px;
}
.hero__sep span:first-child, .hero__sep span:last-child { flex: 1; height: 1px; background: var(--border-subtle); }
.hero__sep-label { color: var(--text-faint); }
.hero__res {
  margin: 0; color: var(--text);
  max-height: 320px; overflow: auto;
}
.hero__term-foot {
  padding: 10px 12px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elev);
  display: flex; gap: 12px; align-items: center;
}
.hero__rl { font-size: 12px; color: var(--text); }
</style>
