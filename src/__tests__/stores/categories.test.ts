import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCategoriesStore } from '../../stores/categories'

vi.mock('../../api/categories', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

describe('useCategoriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بحالة فارغة', () => {
    const store = useCategoriesStore()
    expect(store.categories).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('$reset يعيد الحالة للصفر', () => {
    const store = useCategoriesStore()
    store.categories = [{ id: 1, name: 'مسكنات' }] as any
    store.total = 1
    store.$reset()
    expect(store.categories).toEqual([])
    expect(store.total).toBe(0)
  })
})