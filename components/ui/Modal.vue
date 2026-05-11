<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    subtitle?: string
    width?: number | string
  }>(),
  { width: 520 },
)

const emit = defineEmits<{ close: [] }>()

const onBackdropClick = () => emit('close')
const widthStyle = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop fade-in" role="dialog" aria-modal="true" @click="onBackdropClick">
      <div class="modal" :style="{ width: widthStyle }" @click.stop>
        <div class="modal__head">
          <div>
            <div class="modal__title">{{ title }}</div>
            <div v-if="subtitle" class="modal__subtitle">{{ subtitle }}</div>
          </div>
          <button class="btn-reset modal__close" aria-label="Close" @click="emit('close')">
            <Icon name="x" :size="16" />
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 80;
  background: oklch(0% 0 0 / 0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal {
  max-width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-4);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
}
.modal__head {
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.modal__title { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.modal__subtitle { font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }
.modal__close { color: var(--text-dim); padding: 4px; border-radius: 6px; }
.modal__body { padding: 22px; }
.modal__footer {
  padding: 14px 22px;
  border-top: 1px solid var(--border-subtle);
  display: flex; justify-content: flex-end; gap: 8px;
  background: var(--bg-elev);
}
</style>
