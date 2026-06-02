import { parseRequestData, requireAccess, okResponse, createdResponse, notFoundResponse } from './helpers'
import type { MockState } from './state'
import type { Supplier, Customer } from '../../types'

function crudHandlers(key: 'suppliers' | 'customers', state: MockState) {
  const resource = key === 'suppliers' ? 'suppliers' : 'customers'

  function list(config: any) {
    if (!requireAccess(resource, 'view', config)) return true
    const params = config.params || {}
    let result = [...state[key]]
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter((item) =>
        item.name.toLowerCase().includes(q) || (item as Customer).phone?.toLowerCase().includes(q)
      )
    }
    const total = result.length
    config.adapter = async () => okResponse({ data: result, total }, config)
    return true
  }

  function getOne(config: any, id: number) {
    if (!requireAccess(resource, 'view', config)) return true
    const item = state[key].find((item) => item.id === id)
    if (!item) {
      config.adapter = async () => notFoundResponse(config)
      return true
    }
    if (key === 'customers') {
      const customer = item as Customer
      const completedInvoices = state.invoices.filter((s) => s.customer_id === id && s.status === 'completed')
      const totalPurchases = completedInvoices.reduce((sum, s) => sum + s.net_amount, 0)
      config.adapter = async () => okResponse({ ...customer, total_purchases: totalPurchases }, config)
    } else {
      config.adapter = async () => okResponse(item, config)
    }
    return true
  }

  function purchases(config: any, id: number) {
    if (!requireAccess(resource, 'view', config)) return true
    const params = config.params || {}
    let result = state.invoices.filter((s) => s.customer_id === id)
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const total = result.length
    const limit = params.limit || 50
    const page = params.page || 1
    result = result.slice((page - 1) * limit, page * limit)
    config.adapter = async () => okResponse({ data: result, total, page, limit }, config)
    return true
  }

  function post(config: any) {
    if (!requireAccess(resource, 'create', config)) return true
    const data = parseRequestData(config.data)
    const newItem: Supplier | Customer = {
      id: state[key].length + 1,
      name: String(data.name || ''),
      phone: data.phone !== undefined ? String(data.phone) : undefined,
      email: data.email !== undefined ? String(data.email) : undefined,
      address: data.address !== undefined ? String(data.address) : undefined,
      ...(key === 'customers' ? { total_purchases: 0 } : {}),
      ...(key === 'suppliers' ? { contact_person: data.contact_person !== undefined ? String(data.contact_person) : undefined } : {}),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : undefined,
    }
    state[key].push(newItem)
    config.adapter = async () => createdResponse(newItem, config)
    return true
  }

  function put(config: any, id: number) {
    if (!requireAccess(resource, 'edit', config)) return true
    const data = parseRequestData(config.data)
    const idx = state[key].findIndex((item) => item.id === id)
    if (idx >= 0) {
      const existing = state[key][idx]
      state[key][idx] = {
        ...existing,
        name: data.name !== undefined ? String(data.name) : existing.name,
        phone: data.phone !== undefined ? String(data.phone) : existing.phone,
        email: data.email !== undefined ? String(data.email) : existing.email,
        address: data.address !== undefined ? String(data.address) : existing.address,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active,
      }
    }
    config.adapter = async () => okResponse(state[key][idx], config)
    return true
  }

  function del(config: any, id: number) {
    if (!requireAccess(resource, 'delete', config)) return true
    const idx = state[key].findIndex((item) => item.id === id)
    if (idx >= 0) state[key].splice(idx, 1)
    config.adapter = async () => okResponse({}, config)
    return true
  }

  return { list, getOne, purchases, post, put, delete: del }
}

export function handleParties(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

  for (const key of ['suppliers', 'customers'] as const) {
    const handlers = crudHandlers(key, state)

    const purchasesMatch = url?.match(new RegExp(`^\\/${key}\\/(\\d+)\\/purchases$`))
    if (purchasesMatch && method === 'get') return handlers.purchases(config, Number(purchasesMatch[1]))

    if (url === `/${key}` && method === 'get') return handlers.list(config)
    if (url === `/${key}` && method === 'post') return handlers.post(config)

    const match = url?.match(new RegExp(`^\\/${key}\\/(\\d+)$`))
    if (match && method === 'get') return handlers.getOne(config, Number(match[1]))
    if (match && method === 'put') return handlers.put(config, Number(match[1]))
    if (match && method === 'delete') return handlers.delete(config, Number(match[1]))
  }

  return false
}
