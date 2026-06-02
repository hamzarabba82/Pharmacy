import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSales, getSale } from '../api/sales'
import type { Sale, FetchParams } from '../types'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getSales(params)
      sales.value = res.data
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل المبيعات'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    return await getSale(id)
  }

  return { sales, loading, total, error, fetchAll, fetchOne }
})
