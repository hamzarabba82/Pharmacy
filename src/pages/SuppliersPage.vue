<script setup lang="ts">
import { useSuppliersStore } from '../stores/suppliers'
import Skeleton from '../components/ui/Skeleton.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'
import { useListPage } from '../composables/useListPage'
import { Pencil, Trash2 } from '@lucide/vue'

const store = useSuppliersStore()
const { searchQuery, currentPage, error, limit, totalPages, isFiltered, load, search } = useListPage({
  fetch: params => store.fetchAll(params),
  errorMessage: 'فشل تحميل الموردين',
  getTotal: () => store.total,
})

const toast = useToast()
const dialog = useConfirm()

async function handleDelete(id: number) {
  const ok = await dialog.confirm('هل أنت متأكد من حذف هذا المورد؟')
  if (!ok) return
  try { await store.remove(id); await load() }
  catch { toast.error('فشل الحذف') }
}
</script>

<template>
  <div class="suppliers">
    <div class="page-header">
      <h1>الموردون</h1>
      <BaseButton label="+ إضافة مورد" @click="$router.push('/suppliers/add')" />
    </div>

    <div class="suppliers__filters">
      <input v-model="searchQuery" type="text" placeholder="بحث..." class="suppliers__search" @input="search">
    </div>

    <Skeleton v-if="store.loading" type="table" />

    <div v-else-if="error" class="suppliers__error">
      <p>{{ error }}</p>
      <button class="suppliers__retry-btn" @click="load">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!store.items?.length && isFiltered" class="suppliers__empty">
      لا توجد نتائج للبحث
    </div>
    <div v-else-if="!store.items?.length" class="suppliers__empty">
      لا توجد موردين
    </div>

    <div v-else class="suppliers__table-wrapper">
      <table class="suppliers__table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>جهة الاتصال</th><th /></tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in store.items" :key="s.id">
            <td>{{ (currentPage - 1) * limit + i + 1 }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.phone || '—' }}</td>
            <td>{{ s.email || '—' }}</td>
            <td>{{ s.contact_person || '—' }}</td>
            <td>
              <div class="suppliers__actions">
                <button class="suppliers__action-btn" title="تعديل" @click="$router.push(`/suppliers/${s.id}/edit`)">
                  <Pencil :size="16" />
                </button>
                <button class="suppliers__action-btn suppliers__action-btn--delete" title="حذف" @click="handleDelete(s.id)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="suppliers__pagination">
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

.suppliers {
  &__filters { margin-bottom: 1rem; }
  &__search { @include input-base; max-width: 250px; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
  &__actions { display: flex; gap: 0.25rem; }
  &__action-btn { background: none; border: none; cursor: pointer; font-size: $font-size-base; padding: 0.25rem; border-radius: $border-radius-sm; &:hover { background: $gray-100; } }
  &__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; }
  &__pagination button { @include btn-base; background: $primary-color; color: white; &:disabled { opacity: 0.5; } }
  &__pagination span { font-weight: 600; color: $gray-600; }
}
</style>
