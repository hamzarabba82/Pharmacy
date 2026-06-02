import client from './client'
import type { SalesReportDTO, InventoryReportDTO, ProfitReportDTO } from '../types/reports'
import type { ReportParams } from '../types'

export async function getSalesReport(params: ReportParams): Promise<SalesReportDTO> {
  return (await client.get('/reports/sales', { params })).data
}

export async function getInventoryReport(): Promise<InventoryReportDTO> {
  return (await client.get('/reports/inventory')).data
}

export async function getProfitReport(params: ReportParams): Promise<ProfitReportDTO> {
  return (await client.get('/reports/profits', { params })).data
}
