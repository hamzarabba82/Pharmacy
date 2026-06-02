import client from './client'
import type { Sale, PaginatedResponse, FetchParams } from '../types'

export async function getSales(params?: FetchParams): Promise<PaginatedResponse<Sale>> {
  const { data } = await client.get('/sales', { params })
  return data
}

export async function getSale(id: number): Promise<Sale> {
  const { data } = await client.get(`/sales/${id}`)
  return data
}

export async function createSale(sale: {
  items: { medicine_id: number; quantity: number; unit_price: number; batch_id: number }[]
  discount?: number
  payment_method: 'cash' | 'card' | 'network'
  customer_id?: number
}): Promise<Sale> {
  const { data } = await client.post('/sales', sale)
  return data
}

export async function refundSale(id: number): Promise<Sale> {
  const { data } = await client.post(`/sales/${id}/refund`)
  return data
}
