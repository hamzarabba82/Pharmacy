import { mockMedicines, mockBatches, mockCategories, mockSuppliers, mockCustomers, mockInvoices, mockPurchases } from '../mockData'
import type { Medicine, Batch, Category, Supplier, Customer, Sale, Purchase } from '../../types'

export interface MockState {
  medicines: Medicine[]
  batches: Batch[]
  categories: Category[]
  suppliers: Supplier[]
  customers: Customer[]
  invoices: Sale[]
  purchases: Purchase[]
  nextId: { medicine: number; purchase: number; sale: number; batch: number }
  settings: Record<string, string>
}

export function createMockState(): MockState {
  return {
    medicines: [...mockMedicines],
    batches: [...mockBatches],
    categories: [...mockCategories],
    suppliers: [...mockSuppliers],
    customers: [...mockCustomers],
    invoices: [...mockInvoices],
    purchases: [...mockPurchases],
    nextId: { medicine: 100, purchase: 100, sale: 100, batch: 100 },
    settings: {
      pharmacy_name: 'فارمانا',
      currency: 'ر.س',
      tax_rate: '15',
      default_min_stock: '10',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '0112345678',
    },
  }
}
