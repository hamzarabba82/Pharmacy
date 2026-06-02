import { parseRequestData, requireAccess, okResponse, createdResponse } from './helpers'
import type { MockState } from './state'
import type { Category } from '../../types'

export function handleCategories(config: any, state: MockState): boolean {
  const url = String(config.url || '')
  const method = (String(config.method || 'get')).toLowerCase()
  const params = (config.params || {}) as Record<string, unknown>

  if (url === '/categories' && method === 'get') {
    if (!requireAccess('inventory', 'view', config)) return true
    let result = [...state.categories]
    if (params.search) {
      const q = String(params.search).toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q))
    }
    const limit = Number(params.limit) || 10
    const page = Number(params.page) || 1
    const total = result.length
    result = result.slice((page - 1) * limit, page * limit)
    config.adapter = async () => okResponse({ data: result, total, page, limit }, config)
    return true
  }

  if (url === '/categories' && method === 'post') {
    if (!requireAccess('inventory', 'create', config)) return true
    const data = parseRequestData(config.data)
    const ids = state.categories.map(c => c.id)
    const newId = ids.length ? Math.max(...ids) + 1 : 1
    const newCat: Category = {
      id: newId,
      name: String(data.name || ''),
      description: String(data.description || ''),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      created_at: new Date().toISOString(),
    }
    state.categories.push(newCat)
    config.adapter = async () => createdResponse(newCat, config)
    return true
  }

  const match = url.match(/^\/categories\/(\d+)$/)
  if (match && method === 'put') {
    if (!requireAccess('inventory', 'edit', config)) return true
    const id = Number(match[1])
    const data = parseRequestData(config.data)
    const idx = state.categories.findIndex(c => c.id === id)
    if (idx >= 0) {
      const existing = state.categories[idx]
      state.categories[idx] = {
        ...existing,
        name: data.name !== undefined ? String(data.name) : existing.name,
        description: data.description !== undefined ? String(data.description) : existing.description,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active,
      }
    }
    config.adapter = async () => okResponse(state.categories[idx], config)
    return true
  }

  if (match && method === 'delete') {
    if (!requireAccess('inventory', 'delete', config)) return true
    const id = Number(match[1])
    const idx = state.categories.findIndex(c => c.id === id)
    if (idx >= 0) state.categories.splice(idx, 1)
    config.adapter = async () => okResponse({}, config)
    return true
  }

  return false
}
