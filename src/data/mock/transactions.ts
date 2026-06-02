import { parseRequestData, requireAccess, okResponse, createdResponse, notFoundResponse, badRequestResponse } from './helpers'
import type { MockState } from './state'
import type { Sale, SaleItem, Purchase, PurchaseItem } from '../../types'

function validateSaleItems(rawItems: { medicine_id: number; quantity: number; unit_price: number; batch_id: number }[], state: MockState): string | null {
  for (const item of rawItems) {
    const medicine = state.medicines.find((m) => m.id === item.medicine_id)
    if (!medicine) return `الدواء (ID: ${item.medicine_id}) غير موجود`
    if (medicine.is_active === false) return `الدواء "${medicine.name}" غير متوفر`
    if (item.quantity <= 0) return 'الكمية يجب أن تكون 1 على الأقل'
    if (medicine.current_stock < item.quantity) return `الكمية المطلوبة للدواء "${medicine.name}" غير متوفرة (المتبقي: ${medicine.current_stock})`
    if (item.unit_price <= 0) return `سعر البيع للدواء "${medicine.name}" يجب أن يكون أكبر من صفر`
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (medicine.is_fully_expired || (medicine.expiry_date && new Date(medicine.expiry_date) < today)) {
      return `الدواء "${medicine.name}" منتهي الصلاحية — لا يمكن بيعه`
    }
    const batch = state.batches.find((b) => b.id === item.batch_id && b.medicine_id === item.medicine_id)
    if (!batch) return `الدفعة (ID: ${item.batch_id}) غير موجودة للدواء "${medicine.name}"`
    if (batch.quantity < item.quantity) return `الكمية غير متوفرة في الدفعة (المتبقي في الدفعة: ${batch.quantity})`
    if (new Date(batch.expiry_date) < today) return `الدفعة "${batch.batch_number}" منتهية الصلاحية — لا يمكن البيع منها`
  }
  return null
}

export function handleTransactions(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}

  if (url === '/sales' && method === 'get') {
    if (!requireAccess('sales', 'view', config)) return true
    let result = [...state.invoices]
    if (params.from) result = result.filter((s) => s.created_at >= params.from)
    if (params.to) result = result.filter((s) => s.created_at <= params.to)
    const total = result.length
    config.adapter = async () => okResponse({ data: result, total, page: 1, limit: 50 }, config)
    return true
  }

  const saleMatch = url?.match(/^\/sales\/(\d+)$/)
  if (saleMatch && method === 'get') {
    if (!requireAccess('sales', 'view', config)) return true
    const id = Number(saleMatch[1])
    const sale = state.invoices.find((s) => s.id === id)
    config.adapter = async () => (sale ? okResponse(sale, config) : notFoundResponse(config))
    return true
  }

  if (url === '/sales' && method === 'post') {
    if (!requireAccess('sales', 'create', config)) return true
    const data = parseRequestData(config.data)
    const rawItems = ((data.items as unknown) || []) as { medicine_id: number; quantity: number; unit_price: number; batch_id: number }[]
    const validationError = validateSaleItems(rawItems, state)
    if (validationError) {
      config.adapter = async () => badRequestResponse(validationError, config)
      return true
    }
    const computedItems: SaleItem[] = rawItems.map((item, idx) => ({
      id: idx + 1,
      sale_id: state.nextId.sale,
      medicine_id: item.medicine_id,
      batch_id: item.batch_id || 0,
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      total_price: (item.unit_price || 0) * (item.quantity || 0),
      medicine: state.medicines.find((m) => m.id === item.medicine_id),
    }))
    const computedTotal = computedItems.reduce((sum, item) => sum + item.total_price, 0)
    const computedDiscount = Number(data.discount) || 0
    const customerId = data.customer_id ? Number(data.customer_id) : undefined
    const customer = customerId ? (state.customers.find((c) => c.id === customerId) as typeof state.customers[0] | undefined) : undefined
    const newSale: Sale = {
      id: state.nextId.sale++,
      invoice_number: `INV-${Date.now()}`,
      user_id: 1,
      ...(customerId ? { customer_id: customerId } : {}),
      ...(customer ? { customer } : {}),
      total_amount: computedTotal,
      discount: computedDiscount,
      net_amount: computedTotal - computedDiscount,
      payment_method: (String(data.payment_method) || 'cash') as 'cash' | 'card' | 'network',
      status: 'completed',
      created_at: new Date().toISOString(),
      items: computedItems,
    }
    state.invoices.unshift(newSale)

    // Deduct stock from mock state
    computedItems.forEach((item) => {
      const med = state.medicines.find((m) => m.id === item.medicine_id)
      if (med) med.current_stock = Math.max(0, med.current_stock - item.quantity)
      const batch = state.batches.find((b) => b.id === item.batch_id && b.medicine_id === item.medicine_id)
      if (batch) batch.quantity = Math.max(0, batch.quantity - item.quantity)
    })

    config.adapter = async () => createdResponse(newSale, config)
    return true
  }

  const refundMatch = url?.match(/^\/sales\/(\d+)\/refund$/)
  if (refundMatch && method === 'post') {
    if (!requireAccess('sales', 'edit', config)) return true
    const id = Number(refundMatch[1])
    const sale = state.invoices.find((s) => s.id === id)
    if (!sale) {
      config.adapter = async () => notFoundResponse(config)
      return true
    }
    sale.status = 'refunded'

    // Restore stock on refund
    sale.items?.forEach((item) => {
      const med = state.medicines.find((m) => m.id === item.medicine_id)
      if (med) med.current_stock += item.quantity
      const batch = state.batches.find((b) => b.id === item.batch_id && b.medicine_id === item.medicine_id)
      if (batch) batch.quantity += item.quantity
    })
    config.adapter = async () => okResponse(sale, config)
    return true
  }

  if (url === '/purchases' && method === 'get') {
    if (!requireAccess('purchases', 'view', config)) return true
    config.adapter = async () =>
      okResponse({ data: state.purchases, total: state.purchases.length, page: 1, limit: 50 }, config)
    return true
  }

  const purchaseMatch = url?.match(/^\/purchases\/(\d+)$/)
  if (purchaseMatch && method === 'get') {
    if (!requireAccess('purchases', 'view', config)) return true
    const id = Number(purchaseMatch[1])
    const p = state.purchases.find((p) => p.id === id)
    config.adapter = async () => (p ? okResponse(p, config) : notFoundResponse(config))
    return true
  }

  if (url === '/purchases' && method === 'post') {
    if (!requireAccess('purchases', 'create', config)) return true
    const data = parseRequestData(config.data)
    const rawItems = (data.items as unknown as Record<string, unknown>[]) || []
    const status = (data.status as string) === 'draft' ? 'draft' : 'completed'
    const items: PurchaseItem[] = rawItems.map((item, idx) => ({
      id: idx + 1,
      purchase_id: state.nextId.purchase,
      medicine_id: Number(item.medicine_id),
      medicine: state.medicines.find((m) => m.id === Number(item.medicine_id)),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.quantity) * Number(item.unit_price),
      batch_number: String(item.batch_number || ''),
      expiry_date: String(item.expiry_date || ''),
    }))
    const supplierId = Number(data.supplier_id)
    const newPurchase: Purchase = {
      id: state.nextId.purchase++,
      supplier_invoice_number: String(data.supplier_invoice_number || ''),
      supplier_id: supplierId,
      supplier: state.suppliers.find((s) => s.id === supplierId),
      user_id: 1,
      total_amount: items.reduce((s, i) => s + i.total_price, 0),
      notes: String(data.notes || ''),
      status,
      created_at: new Date().toISOString(),
      items,
    }
    state.purchases.unshift(newPurchase)

    // Update stock only if completed
    if (status === 'completed') {
      items.forEach((item) => {
        const med = state.medicines.find((m) => m.id === item.medicine_id)
        if (med) med.current_stock += item.quantity
      })
    }

    config.adapter = async () => createdResponse(newPurchase, config)
    return true
  }

  const completeMatch = url?.match(/^\/purchases\/(\d+)\/complete$/)
  if (completeMatch && method === 'post') {
    if (!requireAccess('purchases', 'edit', config)) return true
    const id = Number(completeMatch[1])
    const purchase = state.purchases.find((p) => p.id === id)
    if (!purchase) {
      config.adapter = async () => notFoundResponse(config)
      return true
    }
    purchase.status = 'completed'
    purchase.items?.forEach((item) => {
      const med = state.medicines.find((m) => m.id === item.medicine_id)
      if (med) med.current_stock += item.quantity
    })
    config.adapter = async () => okResponse(purchase, config)
    return true
  }

  return false
}
