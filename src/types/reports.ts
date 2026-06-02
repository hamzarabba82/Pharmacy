export interface SalesReportSummary {
  total_sales: number
  invoice_count: number
  average_invoice: number
}

export interface SalesReportRow {
  date: string
  amount: number
  items_count: number
}

export interface SalesReportDTO {
  summary: SalesReportSummary
  columns: string[]
  rows: SalesReportRow[]
  total_sales_week?: { date: string; amount: number }[]
}

export interface InventoryReportSummary {
  low_stock_count: number
  total_medicines: number
}

export interface InventoryReportRow {
  name: string
  stock: number
  min_stock: number
  status: string
}

export interface InventoryReportDTO {
  summary: InventoryReportSummary
  columns: string[]
  rows: InventoryReportRow[]
}

export interface ProfitReportSummary {
  total_revenue: number
  total_cost: number
  net_profit: number
  profit_margin: number
}

export interface ProfitReportRow {
  date: string
  revenue: number
  cost: number
  profit: number
}

export interface ProfitReportDTO {
  summary: ProfitReportSummary
  columns: string[]
  rows: ProfitReportRow[]
}
