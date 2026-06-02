import client from './client'
import type { Purchase, PaginatedResponse, FetchParams } from '../types'

export async function getPurchases(params?: FetchParams): Promise<PaginatedResponse<Purchase>> {
  const { data } = await client.get('/purchases', { params })
  return data
}

export async function getPurchase(id: number): Promise<Purchase> {
  const { data } = await client.get(`/purchases/${id}`)
  return data
}

export async function createPurchase(purchase: {
  supplier_id: number
  supplier_invoice_number?: string
  notes?: string
  status?: 'draft' | 'completed'
  items: { medicine_id: number; quantity: number; unit_price: number; batch_number?: string; expiry_date?: string }[]
}): Promise<Purchase> {
  const { data } = await client.post('/purchases', purchase)
  return data
}

export async function completePurchase(id: number): Promise<Purchase> {
  const { data } = await client.post(`/purchases/${id}/complete`)
  return data
}
