<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}
withDefaults(defineProps<Props>(), { size: 'md' })
</script>

<template>
  <span class="spinner" :class="`spinner--${size}`" />
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.spinner {
  display: inline-block; border: 3px solid $gray-200;
  border-top-color: $primary-color; border-radius: 50%; animation: spin 0.6s linear infinite;

  &--sm { width: 16px; height: 16px; border-width: 2px; }
  &--md { width: 24px; height: 24px; }
  &--lg { width: 36px; height: 36px; border-width: 4px; }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
