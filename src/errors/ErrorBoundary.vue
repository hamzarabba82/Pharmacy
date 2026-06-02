<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})

function reset() {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <h2>حدث خطأ غير متوقع</h2>
    <p>{{ error.message }}</p>
    <button class="error-boundary__btn" @click="reset">
      إعادة المحاولة
    </button>
  </div>
  <slot v-else />
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.error-boundary {
  @include flex-center;
  flex-direction: column;
  min-height: 300px;
  color: $danger-color;
  text-align: center;
  gap: 1rem;

  &__btn {
    @include btn-base;
    background: $danger-color;
    color: white;
  }
}
</style>
