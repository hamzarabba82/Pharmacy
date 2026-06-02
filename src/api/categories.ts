import client from './client'
import type { Category, FetchParams } from '../types'

export async function getCategories(params?: FetchParams): Promise<{ data: Category[]; total: number }> {
  const { data } = await client.get('/categories', { params })
  return data
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const { data: res } = await client.post('/categories', data)
  return res
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const { data: res } = await client.put(`/categories/${id}`, data)
  return res
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/categories/${id}`)
}
