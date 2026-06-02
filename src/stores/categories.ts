import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import type { Category, FetchParams } from '../types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getCategories(params)
      categories.value = res.data
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل التصنيفات'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function add(data: Partial<Category>) {
    return await createCategory(data)
  }

  async function edit(id: number, data: Partial<Category>) {
    return await updateCategory(id, data)
  }

  async function remove(id: number) {
    await deleteCategory(id)
  }

  function $reset() {
    categories.value = []
    total.value = 0
    loading.value = false
  }

  return { categories, loading, total, error, fetchAll, add, edit, remove, $reset }
})
