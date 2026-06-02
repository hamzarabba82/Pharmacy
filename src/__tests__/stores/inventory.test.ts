import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInventoryStore } from '../../stores/inventory'
import type { Medicine, SaleItem } from '../../types'

vi.mock('../../api/medicines', () => ({
  getMedicines: vi.fn(),
  createMedicine: vi.fn(),
  updateMedicine: vi.fn(),
}))

describe('useInventoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بمصفوفة فارغة', () => {
    const store = useInventoryStore()
    expect(store.medicines).toEqual([])
    expect(store.total).toBe(0)
  })

  it('deductStock يخصم الكمية', () => {
    const store = useInventoryStore()
    store.medicines = [
      { id: 1, current_stock: 50 } as Medicine,
      { id: 2, current_stock: 30 } as Medicine,
    ]
    store.deductStock([
      { medicine_id: 1, quantity: 10 } as SaleItem,
      { medicine_id: 2, quantity: 5 } as SaleItem,
    ])
    expect(store.medicines[0].current_stock).toBe(40)
    expect(store.medicines[1].current_stock).toBe(25)
  })

  it('refundStock يعيد الكمية', () => {
    const store = useInventoryStore()
    store.medicines = [{ id: 1, current_stock: 10 } as Medicine]
    store.refundStock([{ medicine_id: 1, quantity: 5 } as SaleItem])
    expect(store.medicines[0].current_stock).toBe(15)
  })
})