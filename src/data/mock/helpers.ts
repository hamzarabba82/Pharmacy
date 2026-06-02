import { decodeToken, ROLE_PERMISSIONS } from '../../config/permissions'
import type { ResourceKey } from '../../config/permissions'

export function getTokenUser(): { id: number; role: string; name: string; email: string } | null {
  const token = sessionStorage.getItem('token')
  return token ? decodeToken(token) : null
}

export function parseRequestData(data: unknown): Record<string, unknown> {
  if (!data) return {}
  if (typeof data === 'string') {
    try { return JSON.parse(data) } catch { return {} }
  }
  return data as Record<string, unknown>
}

export function badRequestResponse(message: string, config?: any) {
  return { data: { message }, status: 400, statusText: 'Bad Request', headers: {}, config: config || {} }
}

export function forbidResponse(config?: any) {
  return { data: { message: 'ليس لديك صلاحية للوصول' }, status: 403, statusText: 'Forbidden', headers: {}, config: config || {} }
}

export function notFoundResponse(config?: any) {
  return { data: { message: 'غير موجود' }, status: 404, statusText: 'Not Found', headers: {}, config: config || {} }
}

export function okResponse(data: unknown, config?: any, extra?: Record<string, unknown>) {
  return { data, status: 200, statusText: 'OK', headers: {}, config: config || {}, ...extra }
}

export function createdResponse(data: unknown, config?: any) {
  return { data, status: 201, statusText: 'Created', headers: {}, config: config || {} }
}

export function checkAccess(resource: ResourceKey, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
  const user = getTokenUser()
  if (!user) return false
  const perms = ROLE_PERMISSIONS[user.role]
  return perms?.[resource]?.includes(action) ?? false
}

export function requireAccess(resource: ResourceKey, action: 'view' | 'create' | 'edit' | 'delete', config: any): boolean {
  if (!checkAccess(resource, action)) {
    config.adapter = async () => forbidResponse(config)
    return false
  }
  return true
}
