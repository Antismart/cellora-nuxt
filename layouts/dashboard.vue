<script setup lang="ts">
import { NETWORKS } from '~/utils/data'

const route = useRoute()
const network = useNetwork()
const { user, signedIn } = useAuth()

const navItems = [
  { id: 'overview', label: 'Overview', iconName: 'home' },
  { id: 'keys',     label: 'API Keys', iconName: 'key' },
  { id: 'usage',    label: 'Usage',    iconName: 'activity' },
  { id: 'explorer', label: 'API Explorer', iconName: 'terminal' },
  { id: 'status',   label: 'Status',   iconName: 'server' },
] as const

const currentSlug = computed(() => {
  const slug = String(route.params.slug || (route.path.split('/').pop() || 'overview'))
  return slug
})
const currentPage = computed(() => navItems.find((n) => n.id === currentSlug.value)?.id ?? 'overview')
const pageTitle = computed(() => navItems.find((n) => n.id === currentPage.value)?.label ?? 'Overview')
const activeNet = computed(() => NETWORKS.find((n) => n.id === network.value)!)

const signOut = () => {
  signedIn.value = false
  navigateTo('/')
}
</script>

<template>
  <div class="shell">
    <aside class="shell__side">
      <div class="shell__head">
        <NuxtLink to="/" class="shell__brand">
          <Wordmark :size="15" />
        </NuxtLink>
        <Badge variant="outline" size="sm" mono>v0.5.2</Badge>
      </div>

      <div class="shell__switcher">
        <NetworkSwitcher v-model="network" />
      </div>

      <nav class="shell__nav">
        <div class="micro shell__nav-section">workspace</div>
        <NuxtLink
          v-for="it in navItems" :key="it.id"
          :to="`/app/${it.id}`"
          class="btn-reset shell__navitem"
          :class="{ 'shell__navitem--active': currentPage === it.id }"
        >
          <span
            v-if="currentPage === it.id"
            class="shell__navitem-bar"
            :style="{ background: activeNet.accent }"
          />
          <Icon :name="it.iconName as any" :size="15" /> {{ it.label }}
        </NuxtLink>
        <div class="shell__spacer" />
        <div class="micro shell__nav-section">resources</div>
        <a href="#" class="btn-reset shell__navlink">
          <Icon name="book" :size="15" /> Docs
          <Icon name="arrowUpRight" :size="11" class="shell__navlink-tail" />
        </a>
        <a href="#" class="btn-reset shell__navlink">
          <Icon name="github" :size="15" /> GitHub
          <Icon name="arrowUpRight" :size="11" class="shell__navlink-tail" />
        </a>
      </nav>

      <div class="shell__foot">
        <UserMenu :user="user" @sign-out="signOut" />
      </div>
    </aside>

    <div class="shell__main">
      <TopBar :page-title="pageTitle" :network="network" />
      <main class="shell__content">
        <div class="shell__content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 232px 1fr;
  min-height: 100vh;
  background: var(--bg);
}
.shell__side {
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-elev);
  position: sticky; top: 0;
  height: 100vh;
  display: flex; flex-direction: column;
}
.shell__head {
  padding: 18px 18px 14px;
  display: flex; align-items: center; justify-content: space-between;
}
.shell__brand { display: inline-flex; }
.shell__switcher { padding: 8px 10px; }
.shell__nav {
  padding: 12px 8px;
  flex: 1;
  display: flex; flex-direction: column; gap: 2px;
}
.shell__nav-section { padding: 8px 10px 4px; color: var(--text-dim); }
.shell__navitem {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  border-radius: 6px;
  font-size: 13.5px;
  text-align: left;
  position: relative;
}
.shell__navitem--active {
  background: var(--surface-2);
  border-color: var(--border);
  color: var(--text);
}
.shell__navitem-bar {
  position: absolute;
  left: -8px; top: 8px; bottom: 8px;
  width: 2px;
  border-radius: 2px;
}
.shell__spacer { flex: 1; }
.shell__navlink {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  color: var(--text-muted);
  font-size: 13.5px;
  border-radius: 6px;
}
.shell__navlink-tail { margin-left: auto; color: var(--text-dim); }
.shell__foot { padding: 10px; border-top: 1px solid var(--border-subtle); }
.shell__main { display: flex; flex-direction: column; min-width: 0; }
.shell__content { flex: 1; padding: 28px 36px 60px; overflow: auto; }
.shell__content-inner { max-width: 1240px; margin: 0 auto; }
</style>
