<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import Skeleton from '../components/ui/Skeleton.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'
import type { Category, FetchParams } from '../types'

const store = useCategoriesStore()

const searchQuery = ref('')
const currentPage = ref(1)
const limit = 10
const error = ref('')
const loading = ref(false)

const editingId = ref<number | null>(null)
const editForm = ref({ name: '', is_active: true })

const showAddRow = ref(false)
const addForm = ref({ name: '', is_active: true })

const totalPages = computed(() => Math.ceil((store.total || 0) / limit) || 1)
const isFiltered = computed(() => !!searchQuery.value.trim())

async function load() {
  loading.value = true; error.value = ''
  try {
    const params: FetchParams = { page: currentPage.value, limit }
    if (searchQuery.value.trim()) params.search = searchQuery.value
    await store.fetchAll(params)
  } catch {
    error.value = 'فشل تحميل التصنيفات'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function search() { currentPage.value = 1; load() }

function startEdit(cat: Category) {
  editingId.value = cat.id
  editForm.value = { name: cat.name, is_active: cat.is_active }
  showAddRow.value = false
}

function cancelEdit() {
  editingId.value = null
}

const toast = useToast()
const dialog = useConfirm()

async function saveEdit(id: number) {
  if (!editForm.value.name.trim()) return
  try {
    await store.edit(id, editForm.value)
    editingId.value = null
    await load()
  } catch {
    toast.error('فشل التحديث')
  }
}

function startAdd() {
  showAddRow.value = true
  addForm.value = { name: '', is_active: true }
  editingId.value = null
}

function cancelAdd() {
  showAddRow.value = false
}

async function saveAdd() {
  if (!addForm.value.name.trim()) return
  try {
    await store.add({ name: addForm.value.name, is_active: addForm.value.is_active })
    showAddRow.value = false
    currentPage.value = 1
    await load()
  } catch {
    toast.error('فشل الإضافة')
  }
}

async function handleDelete(id: number) {
  const ok = await dialog.confirm('هل أنت متأكد من حذف هذا التصنيف؟')
  if (!ok) return
  try {
    await store.remove(id)
    await load()
  } catch {
    toast.error('فشل الحذف')
  }
}

</script>

<template>
  <div class="categories">
    <div class="page-header">
      <h1>التصنيفات</h1>
      <BaseButton label="+ إضافة تصنيف" @click="startAdd" />
    </div>

    <div class="categories__filters">
      <input v-model="searchQuery" type="text" placeholder="بحث..." class="categories__search" @input="search">
    </div>

    <Skeleton v-if="loading" type="table" />

    <div v-else-if="error" class="categories__error">
      <p>{{ error }}</p>
      <button class="categories__retry-btn" @click="load">
        إعادة المحاولة
      </button>
    </div>

    <div v-else-if="!store.categories?.length && isFiltered" class="categories__empty">
      لا توجد نتائج للبحث
    </div>
    <div v-else-if="!store.categories?.length" class="categories__empty">
      لا توجد تصنيفات
    </div>

    <div v-else class="categories__table-wrapper">
      <table class="categories__table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>الحالة</th><th>تاريخ الإضافة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          <tr v-if="showAddRow" class="categories__row--editing">
            <td>—</td>
            <td><BaseInput v-model="addForm.name" placeholder="اسم التصنيف" /></td>
            <td>
              <label class="categories__toggle">
                <input v-model="addForm.is_active" type="checkbox">
                <span>{{ addForm.is_active ? 'نشط' : 'غير نشط' }}</span>
              </label>
            </td>
            <td>{{ new Date().toLocaleDateString('ar-SA') }}</td>
            <td>
              <div class="categories__actions">
                <BaseButton label="حفظ" variant="success" size="sm" @click="saveAdd" />
                <BaseButton label="إلغاء" variant="ghost" size="sm" @click="cancelAdd" />
              </div>
            </td>
          </tr>

          <tr v-for="(cat, i) in store.categories" :key="cat.id" :class="{ 'categories__row--editing': editingId === cat.id }">
            <td>{{ (currentPage - 1) * limit + i + 1 }}</td>

            <td v-if="editingId !== cat.id">
              {{ cat.name }}
            </td>
            <td v-else>
              <BaseInput v-model="editForm.name" placeholder="اسم التصنيف" />
            </td>

            <td v-if="editingId !== cat.id">
              <Badge :variant="cat.is_active ? 'success' : 'danger'">
                {{ cat.is_active ? 'نشط' : 'غير نشط' }}
              </Badge>
            </td>
            <td v-else>
              <label class="categories__toggle">
                <input v-model="editForm.is_active" type="checkbox">
                <span>{{ editForm.is_active ? 'نشط' : 'غير نشط' }}</span>
              </label>
            </td>

            <td>{{ new Date(cat.created_at).toLocaleDateString('ar-SA') }}</td>

            <td>
              <div v-if="editingId !== cat.id" class="categories__actions">
                <BaseButton label="تعديل" variant="primary" size="sm" @click="startEdit(cat)" />
                <BaseButton label="حذف" variant="danger" size="sm" @click="handleDelete(cat.id)" />
              </div>
              <div v-else class="categories__actions">
                <BaseButton label="حفظ" variant="success" size="sm" @click="saveEdit(cat.id)" />
                <BaseButton label="إلغاء" variant="ghost" size="sm" @click="cancelEdit" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="categories__pagination">
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

.categories {
  &__filters { margin-bottom: 1rem; }
  &__search { @include input-base; max-width: 250px; }
  &__error { @include card; text-align: center; padding: 3rem; color: $danger-color; }
  &__retry-btn { @include btn-base; background: $primary-color; color: white; margin-top: 0.75rem; }
  &__table-wrapper { @include card; overflow-x: auto; }
  &__table { @include table-base; }
  &__empty { @include card; text-align: center; padding: 3rem; color: $gray-400; }
  &__actions { display: flex; gap: 0.375rem; align-items: center; }
  &__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; }
  &__pagination button { @include btn-base; background: $primary-color; color: white; &:disabled { opacity: 0.5; } }
  &__pagination span { font-weight: 600; color: $gray-600; }

  &__row--editing td { background: $gray-50; }

  &__toggle {
    display: inline-flex; align-items: center; gap: 0.375rem; cursor: pointer;
    font-size: $font-size-sm;
    input { width: 1rem; height: 1rem; cursor: pointer; }
  }
}
</style>
