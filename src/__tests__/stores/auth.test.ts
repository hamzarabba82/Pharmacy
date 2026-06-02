import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'


vi.mock('../../services/navigation.service', () => ({
  navigate: vi.fn(),
  setOnUnauthorized: vi.fn(),
  triggerUnauthorized: vi.fn(),
}))

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('يبدأ بدون token', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.token).toBeNull()
  })

  it('isAuthenticated = false عندما token = null', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })
})