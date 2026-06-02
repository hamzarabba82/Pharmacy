import { createSale as apiCreateSale, refundSale as apiRefundSale } from '../api/sales'
import { createPurchase as apiCreatePurchase } from '../api/purchases'
import type { SaleItem, PurchaseItem, Sale, Purchase } from '../types'

export async function createSale(
  data: Parameters<typeof apiCreateSale>[0],
  onDeductStock?: (items: SaleItem[]) => void,
): Promise<Sale> {
  const sale = await apiCreateSale(data)
  onDeductStock?.(sale.items ?? [])
  return sale
}

export async function refundSale(
  id: number,
  onRefundStock?: (items: SaleItem[]) => void,
): Promise<Sale> {
  const sale = await apiRefundSale(id)
  onRefundStock?.(sale.items ?? [])
  return sale
}

export async function createPurchase(
  data: Parameters<typeof apiCreatePurchase>[0],
  onAddStock?: (items: PurchaseItem[]) => void,
): Promise<Purchase> {
  const result = await apiCreatePurchase(data)
  onAddStock?.(result.items ?? [])
  return result
}
