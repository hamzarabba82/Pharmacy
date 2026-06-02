import { parseRequestData, requireAccess, okResponse, createdResponse, notFoundResponse } from './helpers'
import type { MockState } from './state'
import type { Medicine } from '../../types'

export function handleInventory(config: any, state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}

  if (url === '/medicines' && method === 'get') {
    if (!requireAccess('inventory', 'view', config)) return true
    let result = [...state.medicines]
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.barcode?.includes(q))
    }
    if (params.category_id) result = result.filter((m) => m.category_id === Number(params.category_id))
    const limit = params.limit || 50
    const page = params.page || 1
    const total = result.length
    result = result.slice((page - 1) * limit, page * limit)
    config.adapter = async () => okResponse({ data: result, total, page, limit }, config)
    return true
  }

  const singleMatch = url?.match(/^\/medicines\/(\d+)$/)
  if (singleMatch && method === 'get') {
    if (!requireAccess('inventory', 'view', config)) return true
    const id = Number(singleMatch[1])
    const med = state.medicines.find((m) => m.id === id)
    config.adapter = async () => med ? okResponse(med, config) : notFoundResponse(config)
    return true
  }

  if (singleMatch && method === 'put') {
    if (!requireAccess('inventory', 'edit', config)) return true
    const id = Number(singleMatch[1])
    const data = parseRequestData(config.data)
    const idx = state.medicines.findIndex((m) => m.id === id)
    if (idx >= 0) { state.medicines[idx] = { ...state.medicines[idx], ...data } as Medicine }
    config.adapter = async () => okResponse(state.medicines[idx], config)
    return true
  }

  if (singleMatch && method === 'delete') {
    if (!requireAccess('inventory', 'delete', config)) return true
    const id = Number(singleMatch[1])
    state.medicines = state.medicines.filter((m) => m.id !== id)
    config.adapter = async () => okResponse({}, config)
    return true
  }

  if (url === '/medicines' && method === 'post') {
    if (!requireAccess('inventory', 'create', config)) return true
    const data = parseRequestData(config.data)
    const newMed: Medicine = { id: state.nextId.medicine++, ...data } as unknown as Medicine
    newMed.current_stock = (data.current_stock as number) || 0
    newMed.min_stock = (data.min_stock as number) || 10
    state.medicines.push(newMed)
    config.adapter = async () => createdResponse(newMed, config)
    return true
  }

  const batchesMatch = url?.match(/^\/medicines\/(\d+)\/batches$/)
  if (batchesMatch && method === 'get') {
    if (!requireAccess('inventory', 'view', config)) return true
    const id = Number(batchesMatch[1])
    const result = state.batches.filter((b) => b.medicine_id === id)
    config.adapter = async () => okResponse(result, config)
    return true
  }

  return false
}
