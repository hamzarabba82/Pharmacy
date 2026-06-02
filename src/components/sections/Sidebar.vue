<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { features } from '../../config/features'
import ListIcon from '../../components/ui/ListIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const expandedMenus = ref<string[]>([])

const filteredItems = computed(() =>
  features.filter((item) => {
    if (item.roles && !item.roles.includes(auth.role)) return false
    if (item.resource) return auth.hasPermission(item.resource, 'view')
    return true
  })
)

function isActive(path: string) {
  if (path === '/sales') return route.path.startsWith('/sales') || route.path === '/pos'
  if (path === '/reports/sales') return route.path.startsWith('/reports')
  return route.path.startsWith(path)
}

function toggleExpand(label: string) {
  const idx = expandedMenus.value.indexOf(label)
  if (idx >= 0) expandedMenus.value.splice(idx, 1)
  else expandedMenus.value.push(label)
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <ListIcon name="Building2" :size="24" /> فارمانا
    </div>

    <nav class="sidebar__nav">
      <template v-for="item in filteredItems" :key="item.route">
        <div
          v-if="!item.children"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.route) }"
          @click="navigate(item.route)"
        >
          <span class="sidebar__icon"><ListIcon :name="item.icon" /></span>
          <span class="sidebar__label">{{ item.label }}</span>
        </div>

        <div v-else class="sidebar__group">
          <div
            class="sidebar__item"
            :class="{ 'sidebar__item--active': isActive(item.route), 'sidebar__item--expanded': expandedMenus.includes(item.label) }"
            @click="toggleExpand(item.label)"
          >
            <span class="sidebar__icon"><ListIcon :name="item.icon" /></span>
            <span class="sidebar__label">{{ item.label }}</span>
            <span class="sidebar__arrow"><ListIcon :name="expandedMenus.includes(item.label) ? 'ChevronUp' : 'ChevronDown'" :size="14" /></span>
          </div>
          <div v-if="expandedMenus.includes(item.label)" class="sidebar__sub">
            <div
              v-for="child in item.children"
              :key="child.route"
              class="sidebar__sub-item"
              :class="{ 'sidebar__sub-item--active': route.path === child.route }"
              @click="navigate(child.route)"
            >
              {{ child.label }}
            </div>
          </div>
        </div>
      </template>
    </nav>

    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__user-name">
          {{ auth.user?.name || 'مستخدم' }}
        </div>
        <div class="sidebar__user-role">
          {{ auth.user?.role }}
        </div>
      </div>
      <button class="sidebar__logout" aria-label="تسجيل خروج" @click="auth.logout()">
        تسجيل خروج
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.sidebar {
  width: $sidebar-width; min-height: 100vh; background: $gray-900; color: white;
  display: flex; flex-direction: column; position: fixed; right: 0; top: 0;
  z-index: 100;

  &__brand { padding: 1.25rem; font-size: $font-size-lg; font-weight: 700; text-align: center; border-bottom: 1px solid $gray-700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  &__nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }

  &__item {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; border-radius: $border-radius;
    cursor: pointer; transition: background $transition-fast, color $transition-fast; color: $gray-400;
    &:hover { background: $gray-700; color: white; }
    &--active { background: $primary-color; color: white; }
    &--expanded { background: $gray-800; }
  }

  &__icon { display: flex; align-items: center; }
  &__label { flex: 1; font-size: $font-size-sm; }
  &__arrow { display: flex; align-items: center; }

  &__sub { display: flex; flex-direction: column; gap: 0.125rem; margin-right: 2rem; overflow: hidden; }
  &__sub-item {
    padding: 0.5rem 0.75rem; border-radius: $border-radius-sm; cursor: pointer;
    font-size: $font-size-sm; color: $gray-400; transition: background $transition-fast;
    &:hover { background: $gray-700; color: white; }
    &--active { background: $primary-color; color: white; }
  }

  &__footer { padding: 1rem; border-top: 1px solid $gray-700; display: flex; flex-direction: column; gap: 0.5rem; }
  &__user-name { font-size: $font-size-sm; font-weight: 600; }
  &__user-role { font-size: $font-size-xs; color: $gray-400; text-transform: capitalize; }

  &__logout {
    padding: 0.5rem; background: transparent; border: 1px solid $gray-600;
    border-radius: $border-radius; color: $gray-400; cursor: pointer; font-size: $font-size-sm;
    transition: background $transition-fast, color $transition-fast;
    &:hover { background: $gray-700; color: white; }
  }
}
</style>
