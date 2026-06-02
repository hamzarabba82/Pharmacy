import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import client from '../../api/client'
import { login, getMe, getUsers, createUser, updateUser, deleteUser } from '../../api/auth'

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login يرسل POST إلى /auth/login', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { token: 'xyz', user: { id: 1 } } })
    const result = await login({ email: 'a@b.com', password: '123' })
    expect(client.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '123' })
    expect(result).toEqual({ token: 'xyz', user: { id: 1 } })
  })

  it('getMe يرسل GET إلى /auth/me', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 1, name: 'Admin' } })
    const result = await getMe()
    expect(client.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual({ id: 1, name: 'Admin' })
  })

  it('getUsers يرسل GET إلى /users', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { data: [], total: 0 } })
    const result = await getUsers()
    expect(client.get).toHaveBeenCalledWith('/users', expect.objectContaining({}))
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('createUser يرسل POST إلى /users', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: 1, name: 'User' } })
    const result = await createUser({ name: 'User' })
    expect(client.post).toHaveBeenCalledWith('/users', { name: 'User' })
    expect(result).toEqual({ id: 1, name: 'User' })
  })

  it('updateUser يرسل PUT إلى /users/:id', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: { id: 1, name: 'Updated' } })
    const result = await updateUser(1, { name: 'Updated' })
    expect(client.put).toHaveBeenCalledWith('/users/1', { name: 'Updated' })
    expect(result).toEqual({ id: 1, name: 'Updated' })
  })

  it('deleteUser يرسل DELETE إلى /users/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({})
    await deleteUser(1)
    expect(client.delete).toHaveBeenCalledWith('/users/1')
  })
})
