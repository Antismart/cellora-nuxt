<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number
    placeholder?: string
    mono?: boolean
    readonly?: boolean
  }>(),
  { modelValue: '', mono: false, readonly: false },
)
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <label class="input">
    <span v-if="$slots.leftIcon" class="input__icon"><slot name="leftIcon" /></span>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="{ 'input__field--mono': mono }"
      class="input__field"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <slot name="rightSlot" />
  </label>
</template>

<style scoped>
.input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  padding: 0 10px;
  height: 34px;
  transition: border-color 100ms;
}
.input:focus-within { border-color: var(--border-strong); }
.input__icon { color: var(--text-dim); display: inline-flex; }
.input__field {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13.5px;
  height: 100%;
  min-width: 0;
}
.input__field--mono { font-family: var(--font-mono); }
</style>
