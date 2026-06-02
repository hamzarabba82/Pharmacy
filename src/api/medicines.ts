import client from './client'
import type { Medicine, Batch, PaginatedResponse, FetchParams } from '../types'

export async function getMedicines(params?: FetchParams, signal?: AbortSignal): Promise<PaginatedResponse<Medicine>> {
  const { data } = await client.get('/medicines', { params, signal })
  return data
}

export async function getMedicine(id: number): Promise<Medicine> {
  const { data } = await client.get(`/medicines/${id}`)
  return data
}

export async function createMedicine(medicine: Partial<Medicine>): Promise<Medicine> {
  const { data } = await client.post('/medicines', medicine)
  return data
}

export async function updateMedicine(id: number, medicine: Partial<Medicine>): Promise<Medicine> {
  const { data } = await client.put(`/medicines/${id}`, medicine)
  return data
}

export async function getBatches(medicineId: number): Promise<Batch[]> {
  const { data } = await client.get(`/medicines/${medicineId}/batches`)
  return data
}
