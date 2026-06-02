<script setup lang="ts">
interface Props {
  label?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'danger' | 'ghost' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}
withDefaults(defineProps<Props>(), {
  label: '', disabled: false, loading: false, variant: 'primary', size: 'md',
})
const emit = defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    class="base-btn"
    :class="[`base-btn--${variant}`, `base-btn--${size}`, { 'base-btn--loading': loading }]"
    :disabled="disabled || loading"
    @click="emit('click')"
  >
    <span v-if="loading" class="base-btn__spinner" /><slot>{{ label }}</slot>
  </button>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.base-btn {
  padding: 0.5rem 1.25rem; border: none; border-radius: $border-radius;
  cursor: pointer; font-size: $font-size-base; transition: opacity 0.2s;
  display: inline-flex; align-items: center; gap: 0.5rem;

  &--sm { padding: 0.375rem 0.75rem; font-size: $font-size-sm; }
  &--lg { padding: 0.75rem 1.5rem; font-size: $font-size-lg; }
  &--primary { background: $primary-color; color: white; &:hover:not(:disabled) { background: $primary-dark; } }
  &--success { background: $success-color; color: white; }
  &--danger { background: $danger-color; color: white; }
  &--warning { background: $warning-color; color: white; }
  &--ghost { background: transparent; border: 1px solid $primary-color; color: $primary-color; }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &--loading { opacity: 0.7; cursor: not-allowed; }

  &__spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid white; border-top-color: transparent;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
