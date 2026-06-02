import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getSuppliers, createSupplier, updateSupplier } from '../../api/suppliers'

describe('suppliers API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getSuppliers يرسل GET إلى /suppliers', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getSuppliers()
    expect(client.get).toHaveBeenCalledWith('/suppliers', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('createSupplier يرسل POST إلى /suppliers', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, name: 'مورد' } })
    const result = await createSupplier({ name: 'مورد' })
    expect(client.post).toHaveBeenCalledWith('/suppliers', { name: 'مورد' })
    expect(result).toEqual({ id: 1, name: 'مورد' })
  })

  it('updateSupplier يرسل PUT إلى /suppliers/:id', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: { id: 1, name: 'محدث' } })
    const result = await updateSupplier(1, { name: 'محدث' })
    expect(client.put).toHaveBeenCalledWith('/suppliers/1', { name: 'محدث' })
    expect(result).toEqual({ id: 1, name: 'محدث' })
  })
})
