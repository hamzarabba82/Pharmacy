import client from './client'
import type { Supplier, FetchParams } from '../types'

export async function getSuppliers(params?: FetchParams): Promise<{ data: Supplier[]; total: number }> {
  const { data } = await client.get('/suppliers', { params })
  return data
}

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  const { data } = await client.post('/suppliers', supplier)
  return data
}

export async function updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
  const { data } = await client.put(`/suppliers/${id}`, supplier)
  return data
}


