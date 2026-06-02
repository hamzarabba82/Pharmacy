import { DEFAULT_USERS } from '../../mockUsers'
import { parseRequestData, requireAccess, okResponse, createdResponse } from '../helpers'
import type { User } from '../../../types'
import type { MockState } from '../state'

export function handleUsers(config: any, _state: MockState): boolean {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

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

  return false
}
