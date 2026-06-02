import type { Medicine, SaleItem, PurchaseItem } from '../types'
import { ValidationError } from '../types/errors'

export function updateStockOnSale(medicines: Medicine[], items: SaleItem[]): Medicine[] {
  const map = new Map(medicines.map((m) => [m.id, { ...m }]))
  for (const item of items) {
    const med = map.get(item.medicine_id)
    if (!med) continue
    med.current_stock = Math.max(0, med.current_stock - item.quantity)
  }
  return Array.from(map.values())
}

export function updateStockOnRefund(medicines: Medicine[], items: SaleItem[]): Medicine[] {
  const map = new Map(medicines.map((m) => [m.id, { ...m }]))
  for (const item of items) {
    const med = map.get(item.medicine_id)
    if (!med) continue
    med.current_stock += item.quantity
  }
  return Array.from(map.values())
}

export function updateStockOnPurchase(medicines: Medicine[], items: PurchaseItem[]): Medicine[] {
  const map = new Map(medicines.map((m) => [m.id, { ...m }]))
  for (const item of items) {
    const med = map.get(item.medicine_id)
    if (med) {
      med.current_stock += item.quantity
    }
  }
  return Array.from(map.values())
}

export function validateStock(medicine: Medicine, quantity: number, availableStock?: number): true | never {
  if (quantity <= 0) throw new ValidationError('الكمية يجب أن تكون 1 على الأقل')
  const stock = availableStock ?? medicine.current_stock
  if (quantity > stock) throw new ValidationError(`الكمية المتوفرة: ${Math.max(0, stock)}`)
  if (medicine.sale_price <= 0) throw new ValidationError('سعر البيع يجب أن يكون أكبر من صفر')
  return true
}
