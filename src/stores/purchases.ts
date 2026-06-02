import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPurchases, getPurchase, completePurchase } from '../api/purchases'
import type { Purchase, FetchParams } from '../types'

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref<Purchase[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getPurchases(params)
      purchases.value = res.data
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل المشتريات'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    return await getPurchase(id)
  }

  async function complete(id: number) {
    return await completePurchase(id)
  }

  return { purchases, loading, total, error, fetchAll, fetchOne, complete }
})
