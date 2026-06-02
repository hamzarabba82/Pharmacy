import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { getPurchases, getPurchase, createPurchase, completePurchase } from '../../api/purchases'

describe('purchases API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getPurchases يرسل GET إلى /purchases', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getPurchases()
    expect(client.get).toHaveBeenCalledWith('/purchases', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('getPurchase يرسل GET إلى /purchases/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 1 } })
    const result = await getPurchase(1)
    expect(client.get).toHaveBeenCalledWith('/purchases/1')
    expect(result).toEqual({ id: 1 })
  })

  it('createPurchase يرسل POST إلى /purchases', async () => {
    const purchase = { supplier_id: 1, items: [{ medicine_id: 1, quantity: 10, unit_price: 5 }] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, ...purchase } })
    const result = await createPurchase(purchase)
    expect(client.post).toHaveBeenCalledWith('/purchases', purchase)
    expect(result).toEqual({ id: 1, ...purchase })
  })

  it('completePurchase يرسل POST إلى /purchases/:id/complete', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, status: 'completed' } })
    const result = await completePurchase(1)
    expect(client.post).toHaveBeenCalledWith('/purchases/1/complete')
    expect(result).toEqual({ id: 1, status: 'completed' })
  })
})
