import client from './client'
import type { LoginResponse, User, FetchParams } from '../types'

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  const { data } = await client.post('/auth/login', credentials)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await client.get('/auth/me')
  return data
}

export async function getUsers(params?: FetchParams): Promise<{ data: User[]; total: number }> {
  const { data } = await client.get('/users', { params })
  return data
}

export async function createUser(user: Partial<User>): Promise<User> {
  const { data } = await client.post('/users', user)
  return data
}

export async function updateUser(id: number, user: Partial<User>): Promise<User> {
  const { data } = await client.put(`/users/${id}`, user)
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/users/${id}`)
}
