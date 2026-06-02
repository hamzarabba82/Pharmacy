import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createSale, refundSale, createPurchase } from '../../services/orchestrator'

vi.mock('../../api/sales', () => ({
  createSale: vi.fn(),
  refundSale: vi.fn(),
}))

vi.mock('../../api/purchases', () => ({
  createPurchase: vi.fn(),
}))

describe('orchestrator', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('createSale يستدعي API و callback', async () => {
    const { createSale: apiCreateSale } = await import('../../api/sales')
    const items = [{ medicine_id: 1, quantity: 5, unit_price: 10, batch_id: 1 }]
    const mockSale = { id: 1, items }
    vi.mocked(apiCreateSale).mockResolvedValue(mockSale as any)

    const onDeduct = vi.fn()
    const result = await createSale({ items, payment_method: 'cash' }, onDeduct)

    expect(result).toEqual(mockSale)
    expect(apiCreateSale).toHaveBeenCalledOnce()
    expect(onDeduct).toHaveBeenCalledWith(items)
  })

  it('refundSale يستدعي API و callback', async () => {
    const { refundSale: apiRefundSale } = await import('../../api/sales')
    const items = [{ medicine_id: 1, quantity: 5, unit_price: 10, batch_id: 1 }]
    const mockSale = { id: 1, status: 'refunded', items }
    vi.mocked(apiRefundSale).mockResolvedValue(mockSale as any)

    const onRefund = vi.fn()
    const result = await refundSale(1, onRefund)

    expect(result).toEqual(mockSale)
    expect(apiRefundSale).toHaveBeenCalledWith(1)
    expect(onRefund).toHaveBeenCalledWith(items)
  })

  it('createPurchase يستدعي API و callback', async () => {
    const { createPurchase: apiCreatePurchase } = await import('../../api/purchases')
    const items = [{ medicine_id: 1, quantity: 100, unit_price: 5, batch_number: 'B1', expiry_date: '2027-01-01' }]
    const mockPurchase = { id: 1, items }
    vi.mocked(apiCreatePurchase).mockResolvedValue(mockPurchase as any)

    const onAdd = vi.fn()
    const result = await createPurchase({ supplier_id: 1, items }, onAdd)

    expect(result).toEqual(mockPurchase)
    expect(apiCreatePurchase).toHaveBeenCalledOnce()
    expect(onAdd).toHaveBeenCalledWith(items)
  })
})
