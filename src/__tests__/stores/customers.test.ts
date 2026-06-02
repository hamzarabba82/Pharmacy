import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomersStore } from '../../stores/customers'

vi.mock('../../api/customers', () => ({
  getCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}))

describe('useCustomersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بحالة فارغة', () => {
    const store = useCustomersStore()
    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
  })

  it('fetchAll يستبعد العملاء غير النشطين', async () => {
    const { getCustomers } = await import('../../api/customers')
    vi.mocked(getCustomers).mockResolvedValue({
      data: [
        { id: 1, name: 'نشط', is_active: true },
        { id: 2, name: 'غير نشط', is_active: false },
      ],
      total: 2,
    } as any)

    const store = useCustomersStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(1)
    expect(store.total).toBe(2) // res.total, not filtered length
  })
})