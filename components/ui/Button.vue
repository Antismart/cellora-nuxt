<script setup lang="ts">
type Variant = 'primary' | 'default' | 'ghost' | 'outline' | 'danger' | 'dangerSolid' | 'link'
type Size = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'default', size: 'md', loading: false, disabled: false },
)

defineEmits<{ click: [e: MouseEvent] }>()
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spin btn__spinner" />
    <slot v-else name="leftIcon" />
    <slot />
    <slot name="rightIcon" />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  font-family: var(--font-sans);
  border-radius: var(--radius-2);
  transition: background 100ms, border-color 100ms, color 100ms, transform 80ms, filter 100ms;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:not(:disabled):hover { filter: brightness(1.08); }
.btn--sm { height: 28px; padding: 0 10px; font-size: 12.5px; }
.btn--md { height: 34px; padding: 0 12px; font-size: 13.5px; }
.btn--lg { height: 42px; padding: 0 18px; font-size: 14px; }
.btn--primary { background: var(--brand); color: oklch(16% 0.03 150); border: 1px solid oklch(80% 0.18 150); }
.btn--default { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
.btn--ghost { background: transparent; color: var(--text-muted); border: 1px solid transparent; }
.btn--outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn--danger { background: transparent; color: var(--red); border: 1px solid oklch(40% 0.10 25); }
.btn--dangerSolid { background: oklch(35% 0.14 25); color: oklch(95% 0.04 25); border: 1px solid oklch(45% 0.18 25); }
.btn--link {
  background: transparent; color: var(--brand); border: 0;
  padding: 0; height: auto;
}
.btn__spinner {
  display: inline-block; width: 12px; height: 12px;
  border-radius: 50%; border: 1.5px solid currentColor; border-top-color: transparent;
}
</style>
