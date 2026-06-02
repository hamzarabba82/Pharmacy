<template>
  <div class="auth-layout">
    <div class="auth-layout__card">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.auth-layout {
  min-height: 100vh; background: $gray-100;
  @include flex-center;

  &__card {
    background: $white; border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
    padding: 2.5rem; width: 100%; max-width: 400px;
  }
}
</style>
