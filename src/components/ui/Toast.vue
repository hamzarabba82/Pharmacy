<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.toast-container {
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;
  pointer-events: none;
}

.toast {
  padding: 0.75rem 1.5rem; border-radius: $border-radius-sm;
  font-size: $font-size-sm; font-weight: 500; white-space: nowrap;
  box-shadow: $shadow-md; pointer-events: auto;

  &--success { background: $success-color; color: white; }
  &--error { background: $danger-color; color: white; }
  &--info { background: $primary-color; color: white; }
}

.toast-enter-active, .toast-leave-active { transition: all $transition-slow; }
.toast-enter-from { opacity: 0; transform: translateY(1rem); }
.toast-leave-to { opacity: 0; transform: translateY(-0.5rem); }
</style>
