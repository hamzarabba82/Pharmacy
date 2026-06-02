import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { ResourceKey, Permission } from '../config/permissions'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    layout?: string
    roles?: string[]
    resource?: ResourceKey
    permission?: Permission
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../pages/DashboardPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'dashboard' },
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('../pages/InventoryPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/inventory/add',
      name: 'InventoryAdd',
      component: () => import('../pages/InventoryFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/inventory/:id/edit',
      name: 'InventoryEdit',
      component: () => import('../pages/InventoryFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/pos',
      name: 'POS',
      component: () => import('../pages/PosPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'pos', permission: 'create' },
    },
    {
      path: '/sales',
      name: 'Sales',
      component: () => import('../pages/SalesPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'sales' },
    },
    {
      path: '/sales/:id',
      name: 'SaleDetail',
      component: () => import('../pages/SaleDetailPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'sales' },
    },
    {
      path: '/purchases',
      name: 'Purchases',
      component: () => import('../pages/PurchasesPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/purchases/add',
      name: 'PurchasesAdd',
      component: () => import('../pages/PurchasesAddPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/purchases/:id',
      name: 'PurchaseDetail',
      component: () => import('../pages/PurchasesDetailPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/suppliers',
      name: 'Suppliers',
      component: () => import('../pages/SuppliersPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/suppliers/add',
      name: 'SupplierAdd',
      component: () => import('../pages/SupplierFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/suppliers/:id/edit',
      name: 'SupplierEdit',
      component: () => import('../pages/SupplierFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/customers',
      name: 'Customers',
      component: () => import('../pages/CustomersPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'customers' },
    },
    {
      path: '/customers/add',
      name: 'CustomerAdd',
      component: () => import('../pages/CustomerFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'customers', permission: 'create' },
    },
    {
      path: '/customers/:id/edit',
      name: 'CustomerEdit',
      component: () => import('../pages/CustomerFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'customers', permission: 'edit' },
    },
    {
      path: '/customers/:id',
      name: 'CustomerDetail',
      component: () => import('../pages/CustomerDetailPage.vue'),
      meta: { requiresAuth: true, layout: 'default', resource: 'customers' },
    },
    {
      path: '/reports',
      redirect: '/reports/sales',
    },
    {
      path: '/reports/:type?',
      name: 'Reports',
      component: () => import('../pages/ReportsPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../pages/UsersPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin'] },
    },
    {
      path: '/users/add',
      name: 'UserAdd',
      component: () => import('../pages/UserFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin'] },
    },
    {
      path: '/users/:id/edit',
      name: 'UserEdit',
      component: () => import('../pages/UserFormPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin'] },
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../pages/CategoriesPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin', 'pharmacist'] },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../pages/SettingsPage.vue'),
      meta: { requiresAuth: true, layout: 'default', roles: ['admin'] },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isAuthenticated) return '/dashboard'
    return
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  const roles = to.meta.roles
  if (roles && !roles.some((r) => auth.hasRole(r))) {
    return '/dashboard'
  }

  const resource = to.meta.resource
  if (resource && !auth.hasPermission(resource, to.meta.permission || 'view')) {
    return '/dashboard'
  }
})

export default router
