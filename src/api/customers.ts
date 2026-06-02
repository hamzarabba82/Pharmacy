import client from './client'
import type { Customer, FetchParams, PaginatedResponse, Sale } from '../types'

export async function getCustomers(params?: FetchParams, signal?: AbortSignal): Promise<PaginatedResponse<Customer>> {
  const { data } = await client.get('/customers', { params, signal })
  return data
}

export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await client.get(`/customers/${id}`)
  return data
}

export async function getCustomerPurchases(id: number, params?: FetchParams): Promise<PaginatedResponse<Sale>> {
  const { data } = await client.get(`/customers/${id}/purchases`, { params })
  return data
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  const { data } = await client.post('/customers', customer)
  return data
}

export async function updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
  const { data } = await client.put(`/customers/${id}`, customer)
  return data
}


