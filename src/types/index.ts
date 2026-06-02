export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'pharmacist' | 'cashier'
  phone?: string
  is_active: boolean
}

export interface Category {
  id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  contact_person?: string
  is_active?: boolean
}

export interface Medicine {
  id: number
  name: string
  scientific_name?: string
  barcode: string
  category_id: number
  category?: Category
  supplier_id?: number
  supplier?: Supplier
  manufacturer?: string
  purchase_price: number
  sale_price: number
  current_stock: number
  min_stock: number
  location?: string
  is_active?: boolean
  expiry_date?: string
  is_fully_expired?: boolean
}

export interface Batch {
  id: number
  medicine_id: number
  batch_number: string
  quantity: number
  initial_quantity: number
  purchase_price: number
  expiry_date: string
}

export interface Customer {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  total_purchases?: number
  is_active?: boolean
}

export interface Sale {
  id: number
  invoice_number: string
  user_id: number
  customer_id?: number
  customer?: Customer
  total_amount: number
  discount: number
  net_amount: number
  payment_method: 'cash' | 'card' | 'network'
  status: 'completed' | 'refunded'
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: number
  sale_id: number
  medicine_id: number
  batch_id: number
  quantity: number
  unit_price: number
  total_price: number
  medicine?: Medicine
}

export interface Purchase {
  id: number
  supplier_invoice_number?: string
  supplier_id: number
  supplier?: Supplier
  user_id: number
  total_amount: number
  notes?: string
  status: 'draft' | 'completed'
  created_at: string
  items?: PurchaseItem[]
}

export interface PurchaseItem {
  id: number
  purchase_id: number
  medicine_id: number
  medicine?: Medicine
  quantity: number
  unit_price: number
  total_price: number
  batch_number?: string
  expiry_date?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface LoginResponse {
  token: string
  user: User
}

export interface DashboardStats {
  total_medicines: number
  today_sales_count: number
  today_sales_amount: number
  low_stock_count: number
  daily_sales: { date: string; amount: number }[]
  alerts: AlertItem[]
}

export interface AlertItem {
  type: 'low_stock' | 'expiring'
  medicine_id: number
  medicine_name: string
  message: string
}

export interface FetchParams {
  search?: string
  page?: number
  limit?: number
  from?: string
  to?: string
  category_id?: number
  [key: string]: unknown
}

export interface ReportParams {
  from?: string
  to?: string
  type?: string
}
