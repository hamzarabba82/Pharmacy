import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '../../stores/users'

vi.mock('../../api/auth', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

describe('useUsersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('يبدأ بحالة فارغة', () => {
    const store = useUsersStore()
    expect(store.users).toEqual([])
    expect(store.total).toBe(0)
  })

  it('fetchAll يملأ users من API', async () => {
    const { getUsers } = await import('../../api/auth')
    vi.mocked(getUsers).mockResolvedValue({
      data: [{ id: 1, name: 'أحمد', role: 'admin' }],
      total: 1,
    } as any)

    const store = useUsersStore()
    await store.fetchAll()
    expect(store.users).toHaveLength(1)
    expect(store.total).toBe(1)
  })
})