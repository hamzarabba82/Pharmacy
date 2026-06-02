<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from './layouts/DefaultLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import ErrorBoundary from './errors/ErrorBoundary.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()

if (auth.isAuthenticated && !auth.user) {
  auth.fetchMe()
}

const layout = computed(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  if (route.meta.layout === 'default') return DefaultLayout
  return null
})
</script>

<template>
  <ErrorBoundary>
    <component :is="layout" v-if="layout">
      <router-view />
    </component>
    <router-view v-else />
  </ErrorBoundary>
</template>
