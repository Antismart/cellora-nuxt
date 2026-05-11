<script setup lang="ts">
withDefaults(
  defineProps<{ w?: string | number; h?: string | number }>(),
  { w: '100%', h: 14 },
)
const dim = (v: string | number) => (typeof v === 'number' ? `${v}px` : v)
</script>

<template>
  <div class="skeleton" :style="{ width: dim(w), height: dim(h) }" />
</template>
