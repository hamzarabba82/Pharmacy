import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCustomers, getCustomer, getCustomerPurchases, createCustomer, updateCustomer } from '../api/customers'
import type { Customer, Sale, FetchParams } from '../types'

export const useCustomersStore = defineStore('customers', () => {
  const items = ref<Customer[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')
  const activeCustomer = ref<Customer | null>(null)
  const purchases = ref<Sale[]>([])
  const purchasesLoading = ref(false)
  const purchasesTotal = ref(0)

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getCustomers(params)
      items.value = res.data.filter(cust => cust.is_active !== false)
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل العملاء'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    activeCustomer.value = await getCustomer(id)
  }

  async function fetchPurchases(id: number, params?: FetchParams) {
    purchasesLoading.value = true
    error.value = ''
    try {
      const res = await getCustomerPurchases(id, params)
      purchases.value = res.data
      purchasesTotal.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل مشتريات العميل'
      throw err
    } finally {
      purchasesLoading.value = false
    }
  }

  async function add(data: Partial<Customer>) {
    return await createCustomer({ ...data, is_active: true })
  }

  async function update(id: number, data: Partial<Customer>) {
    return await updateCustomer(id, data)
  }

  async function remove(id: number) {
    await updateCustomer(id, { is_active: false })
  }

  return { items, loading, total, error, activeCustomer, purchases, purchasesLoading, purchasesTotal, fetchAll, fetchById, fetchPurchases, add, update, remove }
})
