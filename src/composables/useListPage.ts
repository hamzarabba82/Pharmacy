import { ref, computed, onMounted } from 'vue'
import type { FetchParams } from '../types'

interface ListPageOptions {
  pageSize?: number
  fetch: (params: FetchParams) => Promise<void>
  errorMessage?: string
  getTotal: () => number
}

export function useListPage(options: ListPageOptions) {
  const searchQuery = ref('')
  const currentPage = ref(1)
  const error = ref('')
  const limit = options.pageSize || 10

  const totalPages = computed(() => Math.ceil((options.getTotal() || 0) / limit) || 1)
  const isFiltered = computed(() => !!searchQuery.value.trim())

  async function load() {
    error.value = ''
    try {
      const params: FetchParams = { page: currentPage.value, limit }
      if (searchQuery.value.trim()) params.search = searchQuery.value
      await options.fetch(params)
    } catch {
      error.value = options.errorMessage || 'فشل التحميل'
    }
  }

  function search() {
    currentPage.value = 1
    load()
  }

  onMounted(load)

  return {
    searchQuery,
    currentPage,
    error,
    limit,
    totalPages,
    isFiltered,
    load,
    search,
  }
}