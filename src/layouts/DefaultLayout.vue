<script setup lang="ts">
import Sidebar from '../components/sections/Sidebar.vue'
import Toast from '../components/ui/Toast.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="layout__content">
      <slot />
    </main>
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.layout {
  min-height: 100vh; display: flex;

  &__content {
    margin-right: $sidebar-width; flex: 1;
    padding: 1.5rem; min-height: 100vh;
  }
}
</style>
