<script setup lang="ts">
defineEmits<{ signIn: [] }>()
</script>

<template>
  <section class="cta">
    <div class="grid-bg cta__bg" />
    <div class="cta__inner">
      <h2 class="cta__title">Create an API key.</h2>
      <p class="cta__lede">
        Sign in with GitHub, then create your first key on the dashboard. Query CKB over REST and GraphQL on mainnet and testnet. Free while we're in alpha.
      </p>
      <div class="cta__buttons">
        <Button variant="primary" size="lg" @click="$emit('signIn')">
          <template #leftIcon><Icon name="github" :size="15" /></template>
          Sign in with GitHub
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 100px 24px;
  border-top: 1px solid var(--border-subtle);
  position: relative;
  overflow: hidden;
}
.cta__bg {
  position: absolute; inset: 0; opacity: 0.4;
}
.cta__inner {
  max-width: 720px; margin: 0 auto;
  text-align: center; position: relative;
}
.cta__title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 600; letter-spacing: -0.03em;
  line-height: 1.05; margin: 0;
}
.cta__lede {
  margin-top: 18px;
  font-size: 16px; color: var(--text-muted); line-height: 1.5;
}
.cta__buttons {
  margin-top: 28px;
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
</style>
