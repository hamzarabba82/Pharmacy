<script setup lang="ts">
import { useUsersStore } from '../stores/users'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'
import type { User } from '../types'
import { useListPage } from '../composables/useListPage'
import { Pencil, Trash2 } from '@lucide/vue'

const store = useUsersStore()
const { searchQuery, currentPage, error, limit, totalPages, isFiltered, load, search } = useListPage({
  fetch: params => store.fetchAll(params),
  errorMessage: 'فشل تحميل المستخدمين',
  getTotal: () => store.total,
})

function roleLabel(role: string) {
  const labels: Record<string, string> = { admin: 'مدير', pharmacist: 'صيدلي', cashier: 'كاشير' }
  return labels[role] || role
}

function roleVariant(role: string) {
  const variants: Record<string, 'info' | 'success' | 'gray'> = { admin: 'info', pharmacist: 'success', cashier: 'gray' }
  return variants[role] || 'gray'
}

const toast = useToast()
const dialog = useConfirm()

async function handleDelete(id: number) {
  const ok = await dialog.confirm('هل أنت متأكد من حذف هذا المستخدم؟')
  if (!ok) return
  try { await store.remove(id); await load() }
  catch { toast.error('فشل الحذف') }
}

async function toggleStatus(user: User) {
  try {
    await store.update(user.id, { is_active: !user.is_active })
    user.is_active = !user.is_active
  } catch { toast.error('فشل تغيير الحالة') }
}
</script>

<template>
  <div class="users">
    <div class="page-header">
      <h1>المستخدمون</h1>
      <BaseButton label="+ إضافة مستخدم" @click="$router.push('/users/add')" />
    </div>

    <div class="users__filters">
      <input v-model="searchQuery" type="text" placeholder="بحث..." class="users__search" @input="search">
    </div>

    <Skeleton v-if="store.loading" type="table" />

    <div v-else-if="error" class="users__error">
      <p>{{ error }}</p>
      <button class="users__retry-btn" @click="load">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!store.users?.length && isFiltered" class="users__empty">
      لا توجد نتائج للبحث
    </div>
    <div v-else-if="!store.users?.length" class="users__empty">
      لا توجد مستخدمين
    </div>

    <div v-else class="users__table-wrapper">
      <table class="users__table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>البريد</th><th>الصلاحية</th><th>الحالة</th><th /></tr>
        </thead>
        <tbody>
          <tr v-for="(u, i) in store.users" :key="u.id">
            <td>{{ (currentPage - 1) * limit + i + 1 }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <Badge :variant="roleVariant(u.role)">
                {{ roleLabel(u.role) }}
              </Badge>
            </td>
            <td>
              <button class="users__status-btn" :class="u.is_active ? 'users__status-btn--active' : 'users__status-btn--inactive'" @click="toggleStatus(u)">
                {{ u.is_active ? 'نشط' : 'غير نشط' }}
              </button>
            </td>
            <td>
              <div class="users__actions">
                <button class="users__action-btn" title="تعديل" @click="$router.push(`/users/${u.id}/edit`)">
                  <Pencil :size="16" />
                </button>
                <button class="users__action-btn users__action-btn--delete" title="حذف" @click="handleDelete(u.id)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="users__pagination">
        <button :disabled="currentPage <= 1" @click="currentPage--; load()">
          « السابق
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="currentPage++; load()">
          التالي »
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.users {
  &__filters { margin-bottom: 1rem; }
  &__search { @include input-base; max-width: 250px; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
  &__actions { display: flex; gap: 0.25rem; }
  &__action-btn { background: none; border: none; cursor: pointer; font-size: $font-size-base; padding: 0.25rem; border-radius: $border-radius-sm; &:hover { background: $gray-100; } }
  &__status-btn {
    padding: 0.25rem 0.5rem; border-radius: 999px; border: none; cursor: pointer;
    font-size: $font-size-xs; font-weight: 600;
    &--active { background: #dcfce7; color: $success-color; }
    &--inactive { background: #fce4ec; color: $danger-color; }
  }
  &__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; }
  &__pagination button { @include btn-base; background: $primary-color; color: white; &:disabled { opacity: 0.5; } }
  &__pagination span { font-weight: 600; color: $gray-600; }
}
</style>
