import { requireAccess, okResponse } from '../helpers'
import type { Medicine } from '../../../types'
import type { MockState } from '../state'

function computePurchaseCost(items: { medicine_id: number; quantity: number }[], medicines: Medicine[]): number {
  return items.reduce((sum, item) => {
    const med = medicines.find((m) => m.id === item.medicine_id)
    return sum + (med ? med.purchase_price * item.quantity : 0)
  }, 0)
}

export function handleReports(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}

  if (url?.startsWith('/reports/') && method === 'get') {
    if (!requireAccess('reports', 'view', config)) return true
    const today = new Date()
    const from = params.from || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const to = params.to || today.toISOString().split('T')[0]

    if (url.includes('sales')) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1)
      const filtered = state.invoices.filter((s) => {
        if (s.status !== 'completed') return false
        const d = new Date(s.created_at)
        return d >= fromDate && d < toDate
      })
      const totalSales = filtered.reduce((s, i) => s + i.net_amount, 0)
      config.adapter = async () => okResponse({
        summary: {
          total_sales: totalSales,
          invoice_count: filtered.length,
          average_invoice: filtered.length ? totalSales / filtered.length : 0,
        },
        columns: ['التاريخ', 'المبلغ', 'عدد الأصناف'],
        rows: filtered.map((s) => ({
          'التاريخ': s.created_at.split('T')[0],
          'المبلغ': s.net_amount,
          'عدد الأصناف': s.items?.length || 0,
        })),
      }, config)
      return true
    }

    if (url.includes('inventory')) {
      const lowStock = state.medicines.filter((m) => m.current_stock <= m.min_stock)
      config.adapter = async () => okResponse({
        summary: { low_stock_count: lowStock.length, total_medicines: state.medicines.length },
        columns: ['الاسم', 'الكمية', 'الحد الأدنى', 'الحالة'],
        rows: lowStock.map((m) => ({ 'الاسم': m.name, 'الكمية': m.current_stock, 'الحد الأدنى': m.min_stock, 'الحالة': 'منخفض' })),
      }, config)
      return true
    }

    if (url.includes('profits')) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1)
      const filteredSales = state.invoices.filter((s) => {
        if (s.status !== 'completed') return false
        const d = new Date(s.created_at)
        return d >= fromDate && d < toDate
      })
      const totalRevenue = filteredSales.reduce((s, i) => s + i.net_amount, 0)
      const totalCost = filteredSales.reduce((s, i) => s + computePurchaseCost(i.items || [], state.medicines), 0)
      const profit = totalRevenue - totalCost
      const margin = totalRevenue ? (profit / totalRevenue * 100) : 0
      config.adapter = async () => okResponse({
        summary: {
          total_revenue: totalRevenue,
          total_cost: totalCost,
          net_profit: profit,
          profit_margin: margin,
        },
        columns: ['التاريخ', 'المبيعات', 'التكلفة', 'الربح'],
        rows: filteredSales.map((s) => {
          const cost = computePurchaseCost(s.items || [], state.medicines)
          return { 'التاريخ': s.created_at.split('T')[0], 'المبيعات': s.net_amount, 'التكلفة': cost, 'الربح': s.net_amount - cost }
        }),
      }, config)
      return true
    }
  }

  return false
}
