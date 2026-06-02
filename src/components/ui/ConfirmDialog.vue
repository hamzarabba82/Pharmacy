<script setup lang="ts">
import { useConfirm } from '../../composables/useConfirm'

const { state, resolveConfirm } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="state.show" class="confirm-overlay" @click.self="resolveConfirm(false)">
        <div class="confirm-dialog">
          <p class="confirm-dialog__message">
            {{ state.message }}
          </p>
          <div class="confirm-dialog__actions">
            <button class="confirm-dialog__btn confirm-dialog__btn--cancel" @click="resolveConfirm(false)">
              إلغاء
            </button>
            <button class="confirm-dialog__btn confirm-dialog__btn--confirm" @click="resolveConfirm(true)">
              تأكيد
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000; backdrop-filter: blur(2px);
}

.confirm-dialog {
  background: $white; border-radius: $border-radius-lg; padding: 1.5rem;
  min-width: 300px; box-shadow: $shadow-xl; text-align: center;

  &__message { font-size: $font-size-base; margin-bottom: 1.25rem; color: $gray-700; }

  &__actions { display: flex; gap: 0.75rem; justify-content: center; }

  &__btn {
    padding: 0.5rem 1.25rem; border-radius: $border-radius-sm; border: none;
    font-size: $font-size-sm; cursor: pointer; font-weight: 500;
    transition: opacity $transition-fast;

    &--cancel { background: $gray-200; color: $gray-700; &:hover { opacity: 0.8; } }
    &--confirm { background: $danger-color; color: white; &:hover { opacity: 0.9; } }
  }
}

.confirm-enter-active, .confirm-leave-active { transition: all $transition-base; }
.confirm-enter-from, .confirm-leave-to { opacity: 0; }
.confirm-enter-from .confirm-dialog { transform: scale(0.95); }
</style>
