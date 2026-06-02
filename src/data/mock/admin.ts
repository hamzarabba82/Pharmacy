import { DEFAULT_USERS } from '../mockUsers'
import { getMockStats } from '../mockData'
import { parseRequestData, requireAccess, okResponse, createdResponse } from './helpers'
import type { User, Medicine } from '../../types'
import type { MockState } from './state'

function computePurchaseCost(items: { medicine_id: number; quantity: number }[], medicines: Medicine[]): number {
  return items.reduce((sum, item) => {
    const med = medicines.find((m) => m.id === item.medicine_id)
    return sum + (med ? med.purchase_price * item.quantity : 0)
  }, 0)
}

export function handleAdmin(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}

  if (url === '/dashboard/stats' && method === 'get') {
    if (!requireAccess('dashboard', 'view', config)) return true
    config.adapter = async () => okResponse(getMockStats(), config)
    return true
  }

  if (url === '/users' && method === 'get') {
    if (!requireAccess('users', 'view', config)) return true
    const users = DEFAULT_USERS.map(({ password: _, ...u }) => u)
    config.adapter = async () => okResponse({ data: users, total: users.length }, config)
    return true
  }

  if (url === '/users' && method === 'post') {
    if (!requireAccess('users', 'create', config)) return true
    const data = parseRequestData(config.data)
    const newUser: User & { password: string } = {
      id: DEFAULT_USERS.length + 1,
      name: String(data.name || ''),
      email: String(data.email || ''),
      role: (data.role as User['role']) || 'cashier',
      phone: String(data.phone || ''),
      password: 'default',
      is_active: true,
    }
    DEFAULT_USERS.push(newUser)
    const { password: _, ...u } = newUser
    config.adapter = async () => createdResponse(u, config)
    return true
  }

  const userMatch = url?.match(/^\/users\/(\d+)$/)
  if (userMatch && method === 'put') {
    if (!requireAccess('users', 'edit', config)) return true
    const id = Number(userMatch[1])
    const data = parseRequestData(config.data)
    const idx = DEFAULT_USERS.findIndex((u) => u.id === id)
    if (idx >= 0) {
      const existing = DEFAULT_USERS[idx]
      DEFAULT_USERS[idx] = {
        ...existing,
        name: data.name !== undefined ? String(data.name) : existing.name,
        email: data.email !== undefined ? String(data.email) : existing.email,
        role: data.role !== undefined ? (data.role as User['role']) : existing.role,
        phone: data.phone !== undefined ? String(data.phone) : existing.phone,
        password: data.password !== undefined ? String(data.password) : existing.password,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active,
      }
    }
    config.adapter = async () => okResponse(DEFAULT_USERS[idx], config)
    return true
  }

  if (userMatch && method === 'delete') {
    if (!requireAccess('users', 'delete', config)) return true
    const id = Number(userMatch[1])
    const idx = DEFAULT_USERS.findIndex((u) => u.id === id)
    if (idx >= 0) DEFAULT_USERS.splice(idx, 1)
    config.adapter = async () => okResponse({}, config)
    return true
  }

  if (url === '/settings' && method === 'get') {
    if (!requireAccess('settings', 'view', config)) return true
    config.adapter = async () => okResponse(state.settings, config)
    return true
  }

  if (url === '/settings' && method === 'put') {
    if (!requireAccess('settings', 'edit', config)) return true
    const data = parseRequestData(config.data) as Record<string, string>
    state.settings = { ...state.settings, ...data }
    config.adapter = async () => okResponse({}, config)
    return true
  }

  if (url?.startsWith('/reports/') && method === 'get') {
    if (!requireAccess('reports', 'view', config)) return true
    const today = new Date()
    const from = params.from || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const to = params.to || today.toISOString().split('T')[0]

    if (url.includes('sales')) {
      const filtered = state.invoices.filter((s) => s.status === 'completed' && s.created_at >= from && s.created_at <= to)
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
      const filteredSales = state.invoices.filter(
        (s) => s.status === 'completed' && s.created_at >= from && s.created_at <= to,
      )
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
