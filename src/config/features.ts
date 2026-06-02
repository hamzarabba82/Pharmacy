import type { ResourceKey } from './permissions'

export interface FeatureDefinition {
  name: string
  label: string
  icon: string
  route: string
  resource?: ResourceKey
  roles?: string[]
  children?: { label: string; route: string }[]
}

export const features: FeatureDefinition[] = [
  { name: 'dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard', route: '/dashboard', resource: 'dashboard' },
  { name: 'inventory', label: 'المخزون', icon: 'Pill', route: '/inventory', resource: 'inventory', roles: ['admin', 'pharmacist'] },
  { name: 'categories', label: 'التصنيفات', icon: 'Tags', route: '/categories', resource: 'inventory', roles: ['admin', 'pharmacist'] },
  { name: 'purchases', label: 'المشتريات', icon: 'Package', route: '/purchases', resource: 'purchases', roles: ['admin', 'pharmacist'] },
  { name: 'suppliers', label: 'الموردون', icon: 'Factory', route: '/suppliers', resource: 'suppliers', roles: ['admin', 'pharmacist'] },
  {
    name: 'sales', label: 'المبيعات', icon: 'FileText', route: '/sales', resource: 'sales',
    children: [
      { label: 'نقطة البيع', route: '/pos' },
      { label: 'سجل المبيعات', route: '/sales' },
    ],
  },
  { name: 'customers', label: 'العملاء', icon: 'Users', route: '/customers', resource: 'customers' },
  { name: 'reports', label: 'التقارير', icon: 'TrendingUp', route: '/reports/sales', resource: 'reports', roles: ['admin', 'pharmacist'] },
  { name: 'users', label: 'المستخدمون', icon: 'User', route: '/users', resource: 'users', roles: ['admin'] },
  { name: 'settings', label: 'الإعدادات', icon: 'Settings', route: '/settings', resource: 'settings', roles: ['admin'] },
]
