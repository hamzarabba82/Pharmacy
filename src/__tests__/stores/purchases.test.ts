import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePurchasesStore } from '../../stores/purchases'

vi.mock('../../api/purchases', () => ({
  getPurchases: vi.fn(),
  getPurchase: vi.fn(),
  createPurchase: vi.fn(),
  completePurchase: vi.fn(),
}))

describe('usePurchasesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بحالة فارغة', () => {
    const store = usePurchasesStore()
    expect(store.purchases).toEqual([])
    expect(store.total).toBe(0)
  })
})
