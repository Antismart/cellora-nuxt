<script setup lang="ts">
type Variant = 'primary' | 'outline'

const tiers: Array<{
  key: string; name: string; price: string; priceSub: string;
  desc: string; rest: string; gql: string;
  cta: string; ctaVariant: Variant; featured?: boolean;
  features: string[];
}> = [
  {
    key: 'free', name: 'Free', price: '$0', priceSub: 'while in alpha',
    desc: 'Kick the tires. Build a prototype, run a hackathon.',
    rest: '30 / 1 rps', gql: '10 / 0.5 rps',
    cta: 'Sign in with GitHub', ctaVariant: 'outline',
    features: ['Mainnet + testnet', 'REST + GraphQL', 'Community Discord'],
  },
  {
    key: 'starter', name: 'Starter', price: 'TBD', priceSub: 'finalises with public beta',
    desc: 'A small DApp in production, a couple of API keys, modest traffic.',
    rest: '300 / 20 rps', gql: '100 / 10 rps',
    cta: 'Join the waitlist', ctaVariant: 'primary', featured: true,
    features: ['Up to 5 API keys', 'Per-key rate limits', 'Email support, 1 day'],
  },
  {
    key: 'pro', name: 'Pro', price: 'TBD', priceSub: 'finalises with public beta',
    desc: 'Indexer-class throughput. Production explorer, wallet, or backend.',
    rest: '3,000 / 200 rps', gql: '1,000 / 100 rps',
    cta: 'Talk to us', ctaVariant: 'outline',
    features: ['Unlimited API keys', '99.9% SLO target', 'Slack + on-call email'],
  },
]
</script>

<template>
  <section id="pricing" class="pr">
    <div class="pr__inner">
      <SectionHead
        eyebrow="Pricing"
        title="Pricing"
        subtitle="Currently in private alpha. Paid tier prices finalise with public beta; the free tier stays free."
      />
      <div class="pr__grid">
        <div
          v-for="t in tiers" :key="t.key"
          class="pr__card" :class="{ 'pr__card--featured': t.featured }"
        >
          <div v-if="t.featured" class="pr__featured-badge">
            <Badge variant="brand" size="sm">Most popular</Badge>
          </div>
          <div class="pr__name">{{ t.name }}</div>
          <div class="pr__price-row">
            <span class="pr__price">{{ t.price }}</span>
            <span class="micro pr__price-sub">{{ t.priceSub }}</span>
          </div>
          <div class="pr__desc">{{ t.desc }}</div>
          <div class="pr__limits">
            <div class="pr__limit-row">
              <span class="micro pr__limit-key">REST burst / refill</span>
              <span class="mono pr__limit-val">{{ t.rest }}</span>
            </div>
            <div class="pr__limit-row">
              <span class="micro pr__limit-key">GraphQL burst / refill</span>
              <span class="mono pr__limit-val">{{ t.gql }}</span>
            </div>
          </div>
          <div class="pr__features">
            <div v-for="f in t.features" :key="f" class="pr__feature">
              <Icon name="check" :size="14" :stroke="2" style="color: var(--brand)" /> {{ f }}
            </div>
          </div>
          <div class="pr__cta">
            <Button :variant="t.ctaVariant" size="md" :style="{ width: '100%' }">{{ t.cta }}</Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pr { padding: 80px 24px; border-top: 1px solid var(--border-subtle); }
.pr__inner { max-width: 1240px; margin: 0 auto; }
.pr__grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.pr__card {
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  padding: 24px;
  position: relative;
}
.pr__card--featured {
  background: var(--surface);
  border-color: oklch(40% 0.10 150);
  box-shadow: 0 0 0 1px var(--brand-tint), var(--shadow-card);
}
.pr__featured-badge { position: absolute; top: -10px; left: 24px; }
.pr__name {
  font-size: 14px; font-weight: 600;
  letter-spacing: 0.01em; text-transform: uppercase;
}
.pr__price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 14px; }
.pr__price {
  font-size: 36px; font-weight: 600;
  letter-spacing: -0.02em;
  font-family: var(--font-mono);
}
.pr__price-sub { color: var(--text-dim); }
.pr__desc {
  font-size: 13.5px; color: var(--text-muted);
  margin-top: 8px; line-height: 1.5; min-height: 38px;
}
.pr__limits {
  margin-top: 18px; padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}
.pr__limit-row { display: flex; justify-content: space-between; padding: 4px 0; }
.pr__limit-key { color: var(--text-dim); }
.pr__limit-val { font-size: 12.5px; color: var(--text); }
.pr__features {
  margin-top: 18px;
  display: flex; flex-direction: column; gap: 10px;
}
.pr__feature {
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px; color: var(--text-muted);
}
.pr__cta { margin-top: 22px; }
</style>
