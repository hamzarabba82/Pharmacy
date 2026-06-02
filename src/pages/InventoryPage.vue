<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '../api/categories'
import { useInventoryStore } from '../stores/inventory'
import BaseButton from '../components/ui/BaseButton.vue'
import FormSelect from '../components/ui/FormSelect.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'
import type { Medicine, Category, FetchParams } from '../types'
import { isMedicineExpired } from '../utils/batchAllocation'
import { Pencil, Trash2 } from '@lucide/vue'

const router = useRouter()
const store = useInventoryStore()
const categories = ref<Category[]>([])
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref<string | number>('')
const currentPage = ref(1)
const limit = 10

const totalPages = computed(() => Math.ceil((store.total || 0) / limit) || 1)
const isFiltered = computed(() => !!(searchQuery.value.trim() || selectedCategory.value))

const isExpired = (med: Medicine) => isMedicineExpired(med)

const expiryWarning = (med: Medicine) => {
  if (!med.expiry_date) return false
  const diff = new Date(med.expiry_date).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

async function load() {
  error.value = ''
  try {
    const params: FetchParams = { page: currentPage.value, limit }
    if (searchQuery.value.trim()) params.search = searchQuery.value
    if (selectedCategory.value) params.category_id = Number(selectedCategory.value)
    await store.fetchAll(params)
  } catch {
    error.value = 'فشل تحميل المخزون'
  }
}

onMounted(async () => {
  try {
    const result = await getCategories()
    categories.value = result.data
  } catch { categories.value = [] }
  await load()
})

function search() { currentPage.value = 1; load() }

const toast = useToast()
const dialog = useConfirm()

async function handleDelete(id: number) {
  const ok = await dialog.confirm('هل أنت متأكد من حذف هذا الدواء؟')
  if (!ok) return
  try { await store.remove(id); await load() }
  catch { toast.error('فشل الحذف') }
}
</script>

<template>
  <div class="inventory">
    <div class="page-header">
      <h1>المخزون</h1>
      <BaseButton label="+ إضافة دواء" @click="router.push('/inventory/add')" />
    </div>

    <div class="inventory__filters">
      <input v-model="searchQuery" type="text" placeholder="بحث..." class="inventory__search" @input="search">
      <FormSelect v-model="selectedCategory" :options="categories.map(c => ({ value: c.id, label: c.name }))" class="inventory__filter-select" />
      <BaseButton label="بحث" size="sm" variant="ghost" @click="search" />
    </div>

    <Skeleton v-if="store.loading" type="table" />

    <div v-else-if="error" class="inventory__error">
      <p>{{ error }}</p>
      <button class="inventory__retry-btn" @click="load">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!store.medicines?.length && isFiltered" class="inventory__empty">
      لا توجد نتائج للبحث
    </div>
    <div v-else-if="!store.medicines?.length" class="inventory__empty">
      لا توجد أدوية — أضف دواء جديداً
    </div>

    <div v-else class="inventory__table-wrapper">
      <table class="inventory__table">
        <thead>
          <tr>
            <th>الاسم</th><th>الباركود</th><th>الفئة</th><th>المخزون</th><th>الصلاحية</th><th>سعر البيع</th><th>سعر الشراء</th><th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="med in store.medicines" :key="med.id">
            <td class="inventory__name" @click="router.push(`/inventory/${med.id}/edit`)">
              {{ med.name }}
            </td>
            <td>{{ med.barcode }}</td>
            <td>{{ med.category?.name || '-' }}</td>
            <td>
              <span :class="{ 'inventory__stock--low': med.current_stock <= med.min_stock }">{{ med.current_stock }}</span>
            </td>
            <td>
              <span v-if="isExpired(med)" class="inventory__expired">منتهي</span>
              <span v-else-if="expiryWarning(med)" class="inventory__expiry-warning">{{ med.expiry_date }}</span>
              <span v-else>{{ med.expiry_date || '-' }}</span>
            </td>
            <td>{{ med.sale_price?.toFixed(2) }}</td>
            <td>{{ med.purchase_price?.toFixed(2) }}</td>
            <td>
              <div class="inventory__actions">
                <button class="inventory__action-btn" title="تعديل" @click="router.push(`/inventory/${med.id}/edit`)">
                  <Pencil :size="16" />
                </button>
                <button class="inventory__action-btn inventory__action-btn--delete" title="حذف" @click="handleDelete(med.id)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="inventory__pagination">
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

.inventory {
  &__filters { display: flex; gap: 0.75rem; align-items: flex-end; margin-bottom: 1rem; flex-wrap: wrap; }
  &__search { @include input-base; max-width: 250px; }
  &__filter-select { min-width: 160px; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
  &__empty { @include card; text-align: center; color: $gray-400; padding: 3rem; }
  &__table-wrapper { overflow-x: auto; }
  &__table { width: 100%; border-collapse: collapse; }
  &__table th { text-align: right; padding: 0.75rem; background: $gray-50; color: $gray-600; font-weight: 600; font-size: $font-size-sm; border-bottom: 2px solid $gray-200; }
  &__table td { padding: 0.75rem; border-bottom: 1px solid $gray-100; }
  &__name { font-weight: 600; cursor: pointer; &:hover { color: $primary-color; } }
  &__stock--low { color: $danger-color; font-weight: 700; }
  &__expired { color: white; background: $danger-color; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: $font-size-xs; }
  &__expiry-warning { color: $warning-color; font-weight: 600; }
  &__actions { display: flex; gap: 0.25rem; }
  &__action-btn { background: none; border: none; cursor: pointer; font-size: $font-size-base; padding: 0.25rem; border-radius: $border-radius-sm; &:hover { background: $gray-100; } }
  &__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; padding: 0.75rem; }
  &__pagination button { @include btn-base; background: $primary-color; color: white; &:disabled { opacity: 0.5; } }
  &__pagination span { font-weight: 600; color: $gray-600; }
}
</style>
