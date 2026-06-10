<script setup lang="ts">
import { fmtNum } from '~/utils/format'

defineEmits<{ signIn: [] }>()

const scrolled = ref(false)
const tip = useLiveTip()

if (import.meta.client) {
  const onScroll = () => (scrolled.value = window.scrollY > 8)
  onMounted(() => window.addEventListener('scroll', onScroll))
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
}
</script>

<template>
  <header class="nav-blur nav" :class="{ 'nav--scrolled': scrolled }">
    <div class="nav__inner">
      <div class="nav__brand">
        <Wordmark />
        <Badge variant="brand" size="sm" dot="pulse">Private alpha · Wk 5/7</Badge>
      </div>
      <nav class="nav__links">
        <a href="#features">Features</a>
        <a href="#explorer">Live</a>
        <a href="#docs" class="nav__link-icon">Docs <Icon name="arrowUpRight" :size="12" /></a>
        <a href="#github" class="nav__link-icon"><Icon name="github" :size="14" /> GitHub</a>
      </nav>
      <div class="nav__cta">
        <span class="mono micro nav__tip">
          <span class="pulse-dot nav__tip-dot" />
          tip {{ fmtNum(tip.indexer_tip) }}
        </span>
        <Button variant="primary" size="sm" @click="$emit('signIn')">
          <template #leftIcon><Icon name="github" :size="14" /></template>
          Sign in with GitHub
        </Button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid transparent;
  transition: border-color 200ms;
}
.nav--scrolled { border-bottom-color: var(--border-subtle); }
.nav__inner {
  max-width: 1240px; margin: 0 auto;
  padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.nav__brand { display: flex; align-items: center; gap: 24px; }
.nav__links { display: flex; align-items: center; gap: 20px; color: var(--text-muted); font-size: 13.5px; }
.nav__links a:hover { color: var(--text); }
.nav__link-icon { display: inline-flex; align-items: center; gap: 6px; }
.nav__cta { display: flex; align-items: center; gap: 10px; }
.nav__tip {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-dim);
}
.nav__tip-dot {
  width: 6px; height: 6px; border-radius: 99px;
  background: var(--brand);
}
</style>
