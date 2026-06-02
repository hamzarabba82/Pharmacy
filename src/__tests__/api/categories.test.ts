import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories'

describe('categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCategories يرسل GET إلى /categories', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getCategories()
    expect(client.get).toHaveBeenCalledWith('/categories', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('createCategory يرسل POST إلى /categories', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, name: 'تصنيف' } })
    const result = await createCategory({ name: 'تصنيف' })
    expect(client.post).toHaveBeenCalledWith('/categories', { name: 'تصنيف' })
    expect(result).toEqual({ id: 1, name: 'تصنيف' })
  })

  it('updateCategory يرسل PUT إلى /categories/:id', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: { id: 1, name: 'محدث' } })
    const result = await updateCategory(1, { name: 'محدث' })
    expect(client.put).toHaveBeenCalledWith('/categories/1', { name: 'محدث' })
    expect(result).toEqual({ id: 1, name: 'محدث' })
  })

  it('deleteCategory يرسل DELETE إلى /categories/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({})
    await deleteCategory(1)
    expect(client.delete).toHaveBeenCalledWith('/categories/1')
  })
})
