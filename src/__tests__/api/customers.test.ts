import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getCustomers, createCustomer, updateCustomer } from '../../api/customers'

describe('customers API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCustomers يرسل GET إلى /customers', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getCustomers()
    expect(client.get).toHaveBeenCalledWith('/customers', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('createCustomer يرسل POST إلى /customers', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, name: 'عميل' } })
    const result = await createCustomer({ name: 'عميل' })
    expect(client.post).toHaveBeenCalledWith('/customers', { name: 'عميل' })
    expect(result).toEqual({ id: 1, name: 'عميل' })
  })

  it('updateCustomer يرسل PUT إلى /customers/:id', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: { id: 1, name: 'محدث' } })
    const result = await updateCustomer(1, { name: 'محدث' })
    expect(client.put).toHaveBeenCalledWith('/customers/1', { name: 'محدث' })
    expect(result).toEqual({ id: 1, name: 'محدث' })
  })
})
