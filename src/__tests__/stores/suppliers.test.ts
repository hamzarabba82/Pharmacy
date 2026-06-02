import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSuppliersStore } from '../../stores/suppliers'

vi.mock('../../api/suppliers', () => ({
  getSuppliers: vi.fn(),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
}))

describe('useSuppliersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بحالة فارغة', () => {
    const store = useSuppliersStore()
    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
  })

  it('fetchAll يستبعد الموردين غير النشطين', async () => {
    const { getSuppliers } = await import('../../api/suppliers')
    vi.mocked(getSuppliers).mockResolvedValue({
      data: [
        { id: 1, name: 'نشط', is_active: true },
        { id: 2, name: 'غير نشط', is_active: false },
      ],
      total: 2,
    } as any)

    const store = useSuppliersStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(1)
    expect(store.total).toBe(2) // res.total, not filtered length
  })
})