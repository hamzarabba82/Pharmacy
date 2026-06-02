import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getSales, getSale, createSale, refundSale } from '../../api/sales'

describe('sales API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getSales يرسل GET إلى /sales', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getSales()
    expect(client.get).toHaveBeenCalledWith('/sales', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('getSale يرسل GET إلى /sales/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 1 } })
    const result = await getSale(1)
    expect(client.get).toHaveBeenCalledWith('/sales/1')
    expect(result).toEqual({ id: 1 })
  })

  it('createSale يرسل POST إلى /sales', async () => {
    const sale = { items: [{ medicine_id: 1, quantity: 2, unit_price: 50, batch_id: 1 }], payment_method: 'cash' as const }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, ...sale } })
    const result = await createSale(sale)
    expect(client.post).toHaveBeenCalledWith('/sales', sale)
    expect(result).toEqual({ id: 1, ...sale })
  })

  it('refundSale يرسل POST إلى /sales/:id/refund', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, status: 'refunded' } })
    const result = await refundSale(1)
    expect(client.post).toHaveBeenCalledWith('/sales/1/refund')
    expect(result).toEqual({ id: 1, status: 'refunded' })
  })
})
