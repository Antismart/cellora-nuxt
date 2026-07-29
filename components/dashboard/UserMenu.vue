<script setup lang="ts">
defineProps<{
  user: { handle: string; email: string; plan: string; org: string }
}>()
defineEmits<{ signOut: [] }>()

const open = ref(false)

const initials = (h: string) => h.slice(0, 2).toUpperCase()
</script>

<template>
  <div class="um">
    <button class="btn-reset um__trigger" :class="{ 'um__trigger--open': open }" @click="open = !open">
      <div class="um__avatar">{{ initials(user.handle) }}</div>
      <div class="um__id">
        <div class="um__handle">{{ user.handle }}</div>
        <div class="um__sub">{{ user.plan }} · {{ user.org }}</div>
      </div>
      <Icon name="chevronDown" :size="13" style="color: var(--text-dim)" />
    </button>
    <div v-if="open" class="um__menu">
      <div class="um__head">
        <div class="um__email">{{ user.email }}</div>
        <div class="um__signed-via">Signed in via GitHub</div>
      </div>
      <NuxtLink to="/app/settings" class="btn-reset um__item">
        <Icon name="settings" :size="13" />Account settings
      </NuxtLink>

      <div class="um__divider" />
      <button class="btn-reset um__item um__item--danger" @click="$emit('signOut')">
        <Icon name="logout" :size="13" />Sign out
      </button>
    </div>
  </div>
</template>

<style scoped>
.um { position: relative; }
.um__trigger {
  width: 100%;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid transparent;
}
.um__trigger--open { background: var(--surface-2); border-color: var(--border); }
.um__avatar {
  width: 26px; height: 26px; border-radius: 99px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: grid; place-items: center;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 600;
}
.um__id { flex: 1; text-align: left; min-width: 0; }
.um__handle {
  font-size: 12.5px; color: var(--text); font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.um__sub { font-size: 10.5px; color: var(--text-dim); font-family: var(--font-mono); }
.um__menu {
  position: absolute; left: 0; right: 0; bottom: calc(100% + 6px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-pop);
  padding: 4px;
  z-index: 30;
}
.um__head {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 4px;
}
.um__email { font-size: 12px; color: var(--text); }
.um__signed-via { font-size: 11px; color: var(--text-dim); }
.um__item {
  display: flex; align-items: center; gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  color: var(--text-muted);
  font-size: 12.5px;
  text-align: left;
  background: transparent;
  border: 0;
}
.um__item--danger { color: var(--red); }
.um__divider { height: 1px; background: var(--border-subtle); margin: 4px 0; }
</style>
