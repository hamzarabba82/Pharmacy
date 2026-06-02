import client from './client'
import type { DashboardStats } from '../types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await client.get('/dashboard/stats')
  return data
}
