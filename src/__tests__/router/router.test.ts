import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '../../stores/auth'

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'Login', component: { template: '<div></div>' } },
      { path: '/dashboard', name: 'Dashboard', component: { template: '<div></div>' }, meta: { requiresAuth: true } },
      { path: '/public', name: 'Public', component: { template: '<div></div>' } },
      { path: '/inventory', name: 'Inventory', component: { template: '<div></div>' }, meta: { requiresAuth: true, roles: ['admin', 'pharmacist'] } },
      { path: '/users', name: 'Users', component: { template: '<div></div>' }, meta: { requiresAuth: true, roles: ['admin'] } },
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
  })

  return router
}

describe('حواجز التوجيه (router guards)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('يحوّل المستخدم المصادق من /login إلى /dashboard', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true, hasRole: vi.fn() } as any)
    const router = createTestRouter()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('يسمح للمستخدم غير المصادق بدخول /login', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false, hasRole: vi.fn() } as any)
    const router = createTestRouter()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('يحوّل المستخدم غير المصادق من /dashboard إلى /login', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false, hasRole: vi.fn() } as any)
    const router = createTestRouter()
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('يسمح للمستخدم المصادق بدخول /dashboard', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true, hasRole: vi.fn() } as any)
    const router = createTestRouter()
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('يحوّل المستخدم بغير الدور الصحيح من /users إلى /dashboard', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true, hasRole: vi.fn().mockReturnValue(false) } as any)
    const router = createTestRouter()
    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('يسمح للمستخدم بالدور الصحيح بدخول /users', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true, hasRole: vi.fn().mockReturnValue(true) } as any)
    const router = createTestRouter()
    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/users')
  })

  it('يسمح للمستخدم بأحد الأدوار المسموحة بدخول /inventory', async () => {
    const hasRole = vi.fn((r: string) => r === 'admin')
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true, hasRole } as any)
    const router = createTestRouter()
    await router.push('/inventory')
    expect(router.currentRoute.value.path).toBe('/inventory')
  })

  it('يسمح للمسؤول بدخول /users بينما يمنع الصيدلي', async () => {
    const adminAuth = { isAuthenticated: true, hasRole: vi.fn((r: string) => r === 'admin') }
    const pharmacistAuth = { isAuthenticated: true, hasRole: vi.fn((r: string) => r === 'pharmacist') }

    vi.mocked(useAuthStore).mockReturnValue(adminAuth as any)
    const router = createTestRouter()
    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/users')

    vi.mocked(useAuthStore).mockReturnValue(pharmacistAuth as any)
    const router2 = createTestRouter()
    await router2.push('/users')
    expect(router2.currentRoute.value.path).toBe('/dashboard')
  })
})
