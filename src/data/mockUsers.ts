import type { User } from '../types'

export const DEFAULT_USERS: (User & { password: string })[] = [
  {
    id: 1,
    name: 'أحمد المدير',
    email: 'admin@pharm.com',
    password: 'admin123',
    role: 'admin',
    phone: '0555555555',
    is_active: true,
  },
  {
    id: 2,
    name: 'خالد الصيدلي',
    email: 'pharm@pharm.com',
    password: 'pharm123',
    role: 'pharmacist',
    phone: '0566666666',
    is_active: true,
  },
  {
    id: 3,
    name: 'فيصل الكاشير',
    email: 'cashier@pharm.com',
    password: 'cashier123',
    role: 'cashier',
    phone: '0577777777',
    is_active: true,
  },
]

export function findMockUser(email: string, password: string): User | null {
  const found = DEFAULT_USERS.find(
    (u) => u.email === email && u.password === password && u.is_active,
  )
  if (!found) return null
  const { password: _, ...user } = found
  return user
}
