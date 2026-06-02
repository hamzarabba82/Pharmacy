export type Permission = 'view' | 'create' | 'edit' | 'delete'

export interface ResourcePermissions {
  inventory: Permission[]
  purchases: Permission[]
  suppliers: Permission[]
  customers: Permission[]
  sales: Permission[]
  pos: Permission[]
  reports: Permission[]
  users: Permission[]
  settings: Permission[]
  dashboard: Permission[]
}

export type ResourceKey = keyof ResourcePermissions

const ALL: Permission[] = ['view', 'create', 'edit', 'delete']

export const ROLE_PERMISSIONS: Record<string, ResourcePermissions> = {
  admin: {
    inventory: ALL,
    purchases: ALL,
    suppliers: ALL,
    customers: ALL,
    sales: ALL,
    pos: ['view', 'create'],
    reports: ['view'],
    users: ALL,
    settings: ['view', 'edit'],
    dashboard: ['view'],
  },
  pharmacist: {
    inventory: ['view', 'create', 'edit'],
    purchases: ['view', 'create', 'edit'],
    suppliers: ['view', 'create', 'edit'],
    customers: ['view', 'create', 'edit'],
    sales: ['view'],
    pos: ['view', 'create'],
    reports: ['view'],
    users: [],
    settings: [],
    dashboard: ['view'],
  },
  cashier: {
    inventory: ['view'],
    purchases: [],
    suppliers: [],
    customers: ['view', 'create'],
    sales: ['view', 'create'],
    pos: ['view', 'create'],
    reports: [],
    users: [],
    settings: [],
    dashboard: ['view'],
  },
}

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

function base64ToUtf8(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

export function encodeToken(user: { id: number; role: string; name: string; email: string }): string {
  return 'mock-' + utf8ToBase64(JSON.stringify({ id: user.id, role: user.role, name: user.name, email: user.email }))
}

export function decodeToken(token: string): { id: number; role: string; name: string; email: string } | null {
  try {
    const raw = token.replace('mock-', '')
    return JSON.parse(base64ToUtf8(raw))
  } catch {
    return null
  }
}
