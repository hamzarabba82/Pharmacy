<script setup lang="ts">
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'gray'
}
withDefaults(defineProps<Props>(), { variant: 'gray' })
</script>

<template>
  <span class="badge" :class="`badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.badge {
  display: inline-block; padding: 0.125rem 0.5rem;
  border-radius: 999px; font-size: $font-size-xs; font-weight: 600;

  &--info { background: rgba($primary-color, 0.1); color: $primary-dark; }
  &--success { background: rgba($success-color, 0.1); color: $success-color; }
  &--warning { background: rgba($warning-color, 0.15); color: darken($warning-color, 15%); }
  &--danger { background: rgba($danger-color, 0.1); color: $danger-color; }
  &--gray { background: $gray-100; color: $gray-600; }
}
</style>
