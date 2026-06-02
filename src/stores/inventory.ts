import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMedicines, createMedicine, updateMedicine } from '../api/medicines'
import { updateStockOnSale, updateStockOnRefund, updateStockOnPurchase } from '../services/inventory.service'
import type { Medicine, FetchParams, SaleItem, PurchaseItem } from '../types'

export const useInventoryStore = defineStore('inventory', () => {
  const medicines = ref<Medicine[]>([])
  const loading = ref(false)
  const total = ref(0)
  const error = ref('')

  async function fetchAll(params?: FetchParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getMedicines(params)
      medicines.value = res.data.filter(med => med.is_active !== false)
      total.value = res.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل تحميل المخزون'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function add(data: Partial<Medicine>) {
    const dataWithActive = { ...data, is_active: true }
    const result = await createMedicine(dataWithActive)
    await fetchAll()
    return result
  }

  async function update(id: number, data: Partial<Medicine>) {
    const result = await updateMedicine(id, data)
    await fetchAll()
    return result
  }

  async function remove(id: number) {
    await updateMedicine(id, { is_active: false })
    await fetchAll()
  }

  function deductStock(items: SaleItem[]) {
    medicines.value = updateStockOnSale(medicines.value, items)
  }

  function refundStock(items: SaleItem[]) {
    medicines.value = updateStockOnRefund(medicines.value, items)
  }

  function addPurchaseStock(items: PurchaseItem[]) {
    medicines.value = updateStockOnPurchase(medicines.value, items)
  }

  return { medicines, loading, total, error, fetchAll, add, update, remove, deductStock, refundStock, addPurchaseStock }
})
