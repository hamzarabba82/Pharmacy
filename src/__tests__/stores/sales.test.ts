import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSalesStore } from '../../stores/sales'

vi.mock('../../api/sales', () => ({
  getSales: vi.fn(),
  getSale: vi.fn(),
}))

describe('useSalesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بمصفوفة فارغة', () => {
    const store = useSalesStore()
    expect(store.sales).toEqual([])
    expect(store.total).toBe(0)
    expect(store.loading).toBe(false)
  })
})
