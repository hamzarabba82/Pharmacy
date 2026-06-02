import type { Medicine, Category, Supplier, Customer, Batch, Sale, Purchase, DashboardStats } from '../types'

export const mockCategories: Category[] = [
  { id: 1, name: 'مسكنات', description: 'مسكنات الألم وخافضات الحرارة', is_active: true, created_at: '2026-01-15T10:00:00' },
  { id: 2, name: 'مضادات حيوية', description: 'مضادات البكتيريا والالتهابات', is_active: true, created_at: '2026-01-20T10:00:00' },
  { id: 3, name: 'فيتامينات', description: 'فيتامينات ومكملات غذائية', is_active: true, created_at: '2026-02-01T10:00:00' },
  { id: 4, name: 'أدوية ضغط', description: 'أدوية علاج ضغط الدم', is_active: true, created_at: '2026-02-10T10:00:00' },
  { id: 5, name: 'أدوية سكري', description: 'أدوية علاج السكري', is_active: false, created_at: '2026-03-05T10:00:00' },
  { id: 6, name: 'مستحضرات جلدية', description: 'كريمات ومراهم جلدية', is_active: true, created_at: '2026-03-15T10:00:00' },
]

export const mockSuppliers: Supplier[] = [
  { id: 1, name: 'شركة الأدوية السعودية', phone: '0115555555', email: 'info@spsa.com', contact_person: 'محمد العلي', is_active: true },
  { id: 2, name: 'مستودع الصحة الدوائي', phone: '0126666666', email: 'orders@healthdepot.com', contact_person: 'سامي الحربي', is_active: true },
  { id: 3, name: 'الرائد للأدوية', phone: '0137777777', email: 'sales@raed-pharma.com', contact_person: 'عبدالله الرشيد', is_active: true },
]

export const mockMedicines: Medicine[] = [
  { id: 1, name: 'باراسيتامول 500mg', scientific_name: 'Paracetamol', barcode: '6281006840401', category_id: 1, category: mockCategories[0], supplier_id: 1, supplier: mockSuppliers[0], manufacturer: 'سامي للأدوية', purchase_price: 1.50, sale_price: 5.00, current_stock: 200, min_stock: 30, location: 'A-1', is_active: true },
  { id: 2, name: 'ايبوبروفين 400mg', scientific_name: 'Ibuprofen', barcode: '6281006840402', category_id: 1, category: mockCategories[0], supplier_id: 1, supplier: mockSuppliers[0], manufacturer: 'سامي للأدوية', purchase_price: 2.00, sale_price: 7.00, current_stock: 0, min_stock: 20, location: 'A-2', is_active: true, expiry_date: '2025-08-15' },
  { id: 3, name: 'أموكسيسيلين 500mg', scientific_name: 'Amoxicillin', barcode: '6281006840403', category_id: 2, category: mockCategories[1], supplier_id: 2, supplier: mockSuppliers[1], manufacturer: 'سبيماكو', purchase_price: 3.50, sale_price: 12.00, current_stock: 150, min_stock: 25, location: 'B-1', is_active: true },
  { id: 4, name: 'فيتامين C 1000mg', scientific_name: 'Vitamin C', barcode: '6281006840404', category_id: 3, category: mockCategories[2], supplier_id: 3, supplier: mockSuppliers[2], manufacturer: 'سولجار', purchase_price: 8.00, sale_price: 25.00, current_stock: 80, min_stock: 15, location: 'C-1', is_active: true },
  { id: 5, name: 'فيتامين D3 5000IU', scientific_name: 'Cholecalciferol', barcode: '6281006840405', category_id: 3, category: mockCategories[2], supplier_id: 3, supplier: mockSuppliers[2], manufacturer: 'نيتشر ميد', purchase_price: 12.00, sale_price: 35.00, current_stock: 5, min_stock: 10, location: 'C-2', is_active: true },
  { id: 6, name: 'أملوديبين 5mg', scientific_name: 'Amlodipine', barcode: '6281006840406', category_id: 4, category: mockCategories[3], supplier_id: 1, supplier: mockSuppliers[0], manufacturer: 'فايزر', purchase_price: 4.00, sale_price: 15.00, current_stock: 120, min_stock: 20, location: 'D-1', is_active: true },
  { id: 7, name: 'ميتفورمين 850mg', scientific_name: 'Metformin', barcode: '6281006840407', category_id: 5, category: mockCategories[4], supplier_id: 2, supplier: mockSuppliers[1], manufacturer: 'نوفو نورديسك', purchase_price: 3.00, sale_price: 10.00, current_stock: 90, min_stock: 15, location: 'E-1', is_active: true },
  { id: 8, name: 'بيتادين كريم', scientific_name: 'Povidone-Iodine', barcode: '6281006840408', category_id: 6, category: mockCategories[5], supplier_id: 2, supplier: mockSuppliers[1], manufacturer: 'مصر للصناعات الدوائية', purchase_price: 5.00, sale_price: 18.00, current_stock: 40, min_stock: 10, location: 'F-1', is_active: true },
  { id: 9, name: 'سيتريزين 10mg', scientific_name: 'Cetirizine', barcode: '6281006840409', category_id: 1, category: mockCategories[0], supplier_id: 3, supplier: mockSuppliers[2], manufacturer: 'جلاكسو', purchase_price: 1.50, sale_price: 6.00, current_stock: 60, min_stock: 20, location: 'A-3', is_active: true },
  { id: 10, name: 'أوميغا 3 1000mg', scientific_name: 'Omega-3', barcode: '6281006840410', category_id: 3, category: mockCategories[2], supplier_id: 3, supplier: mockSuppliers[2], manufacturer: 'نيتشر ميد', purchase_price: 20.00, sale_price: 55.00, current_stock: 3, min_stock: 10, location: 'C-3', is_active: true },
  { id: 11, name: 'بانادول إكسترا 500mg', scientific_name: 'Paracetamol Extra', barcode: '6281006840411', category_id: 1, category: mockCategories[0], supplier_id: 1, supplier: mockSuppliers[0], manufacturer: 'جلاكسو', purchase_price: 2.00, sale_price: 8.00, current_stock: 30, min_stock: 10, location: 'A-4', is_active: true, expiry_date: '2025-06-15', is_fully_expired: true },
  { id: 12, name: 'كلاريتين 10mg', scientific_name: 'Loratadine', barcode: '6281006840412', category_id: 1, category: mockCategories[0], supplier_id: 2, supplier: mockSuppliers[1], manufacturer: 'شيرينغ بلو', purchase_price: 3.00, sale_price: 14.00, current_stock: 40, min_stock: 10, location: 'A-5', is_active: true },
  { id: 13, name: 'بنادول نايت', scientific_name: 'Paracetamol Night', barcode: '6281006840413', category_id: 1, category: mockCategories[0], supplier_id: 1, supplier: mockSuppliers[0], manufacturer: 'جلاكسو', purchase_price: 2.50, sale_price: 9.00, current_stock: 20, min_stock: 10, location: 'A-6', is_active: true },
]

export const mockBatches: (Batch & { medicine_id: number })[] = [
  { id: 1, medicine_id: 1, batch_number: 'PCM-2026-A', quantity: 150, initial_quantity: 200, purchase_price: 1.50, expiry_date: '2026-12-31' },
  { id: 2, medicine_id: 1, batch_number: 'PCM-2026-B', quantity: 50, initial_quantity: 50, purchase_price: 1.60, expiry_date: '2027-06-30' },
  { id: 3, medicine_id: 2, batch_number: 'IBU-2025-A', quantity: 8, initial_quantity: 100, purchase_price: 2.00, expiry_date: '2025-08-15' },
  { id: 4, medicine_id: 3, batch_number: 'AMX-2026-A', quantity: 150, initial_quantity: 200, purchase_price: 3.50, expiry_date: '2026-10-31' },
  { id: 5, medicine_id: 4, batch_number: 'VTC-2027-A', quantity: 80, initial_quantity: 100, purchase_price: 8.00, expiry_date: '2027-03-15' },
  { id: 6, medicine_id: 5, batch_number: 'VTD-2026-A', quantity: 5, initial_quantity: 30, purchase_price: 12.00, expiry_date: '2026-11-30' },
  { id: 7, medicine_id: 6, batch_number: 'AML-2027-A', quantity: 120, initial_quantity: 150, purchase_price: 4.00, expiry_date: '2027-08-31' },
  { id: 8, medicine_id: 7, batch_number: 'MET-2026-A', quantity: 90, initial_quantity: 120, purchase_price: 3.00, expiry_date: '2026-09-30' },
  { id: 9, medicine_id: 8, batch_number: 'BTD-2026-A', quantity: 40, initial_quantity: 50, purchase_price: 5.00, expiry_date: '2026-07-31' },
  { id: 10, medicine_id: 9, batch_number: 'CTZ-2026-A', quantity: 60, initial_quantity: 80, purchase_price: 1.50, expiry_date: '2026-05-31' },
  { id: 11, medicine_id: 10, batch_number: 'OM3-2025-A', quantity: 3, initial_quantity: 20, purchase_price: 20.00, expiry_date: '2025-12-31' },
  { id: 12, medicine_id: 12, batch_number: 'LRT-2025-A', quantity: 25, initial_quantity: 50, purchase_price: 3.00, expiry_date: '2025-03-15' },
  { id: 13, medicine_id: 12, batch_number: 'LRT-2025-B', quantity: 15, initial_quantity: 30, purchase_price: 3.00, expiry_date: '2025-07-20' },
  { id: 14, medicine_id: 12, batch_number: 'LRT-2027-A', quantity: 0, initial_quantity: 40, purchase_price: 3.20, expiry_date: '2027-04-30' },
  { id: 15, medicine_id: 13, batch_number: 'PN-2024-A', quantity: 20, initial_quantity: 50, purchase_price: 2.50, expiry_date: '2024-11-30' },
]

export const mockCustomers: Customer[] = [
  { id: 1, name: 'محمد علي', phone: '0551111111', email: 'mohd@example.com', address: 'الرياض، حي النخيل', total_purchases: 1250.00, is_active: true },
  { id: 2, name: 'سارة أحمد', phone: '0552222222', email: 'sara@example.com', address: 'جدة، حي الشاطئ', total_purchases: 540.00, is_active: true },
  { id: 3, name: 'فهد العتيبي', phone: '0553333333', address: 'الدمام، حي الزهور', total_purchases: 1890.00, is_active: true },
]

export const mockInvoices: Sale[] = [
  { id: 1, invoice_number: 'INV-20260501-001', user_id: 2, customer_id: 1, customer: mockCustomers[0], total_amount: 50.00, discount: 0, net_amount: 50.00, payment_method: 'cash', status: 'completed', created_at: '2026-05-01T10:30:00', items: [
    { id: 1, sale_id: 1, medicine_id: 1, batch_id: 1, quantity: 5, unit_price: 5.00, total_price: 25.00, medicine: mockMedicines[0] },
    { id: 2, sale_id: 1, medicine_id: 4, batch_id: 5, quantity: 1, unit_price: 25.00, total_price: 25.00, medicine: mockMedicines[3] },
  ]},
  { id: 2, invoice_number: 'INV-20260502-001', user_id: 2, customer_id: 2, customer: mockCustomers[1], total_amount: 108.00, discount: 8.00, net_amount: 100.00, payment_method: 'card', status: 'completed', created_at: '2026-05-02T14:15:00', items: [
    { id: 3, sale_id: 2, medicine_id: 3, batch_id: 4, quantity: 3, unit_price: 12.00, total_price: 36.00, medicine: mockMedicines[2] },
    { id: 4, sale_id: 2, medicine_id: 6, batch_id: 7, quantity: 2, unit_price: 15.00, total_price: 30.00, medicine: mockMedicines[5] },
    { id: 5, sale_id: 2, medicine_id: 9, batch_id: 10, quantity: 7, unit_price: 6.00, total_price: 42.00, medicine: mockMedicines[8] },
  ]},
  { id: 3, invoice_number: 'INV-20260503-001', user_id: 3, customer_id: 3, customer: mockCustomers[2], total_amount: 35.00, discount: 0, net_amount: 35.00, payment_method: 'cash', status: 'completed', created_at: '2026-05-03T09:45:00', items: [
    { id: 6, sale_id: 3, medicine_id: 5, batch_id: 6, quantity: 1, unit_price: 35.00, total_price: 35.00, medicine: mockMedicines[4] },
  ]},
  { id: 4, invoice_number: 'INV-20260504-001', user_id: 1, total_amount: 22.00, discount: 0, net_amount: 22.00, payment_method: 'network', status: 'refunded', created_at: '2026-05-04T16:20:00', items: [
    { id: 7, sale_id: 4, medicine_id: 1, batch_id: 1, quantity: 2, unit_price: 5.00, total_price: 10.00, medicine: mockMedicines[0] },
    { id: 8, sale_id: 4, medicine_id: 8, batch_id: 9, quantity: 1, unit_price: 12.00, total_price: 12.00, medicine: mockMedicines[7] },
  ]},
]

export const mockPurchases: Purchase[] = [
  { id: 1, supplier_invoice_number: 'SPL-2026-001', supplier_id: 1, supplier: mockSuppliers[0], user_id: 1, total_amount: 700.00, notes: 'توريد شهري', status: 'completed', created_at: '2026-04-28T10:00:00', items: [
    { id: 1, purchase_id: 1, medicine_id: 1, medicine: mockMedicines[0], quantity: 200, unit_price: 1.50, total_price: 300.00, batch_number: 'PCM-2026-A', expiry_date: '2026-12-31' },
    { id: 2, purchase_id: 1, medicine_id: 6, medicine: mockMedicines[5], quantity: 150, unit_price: 4.00, total_price: 600.00, batch_number: 'AML-2027-A', expiry_date: '2027-08-31' },
  ]},
  { id: 2, supplier_invoice_number: 'SPL-2026-002', supplier_id: 2, supplier: mockSuppliers[1], user_id: 1, total_amount: 1950.00, notes: '', status: 'draft', created_at: '2026-05-10T11:30:00', items: [
    { id: 3, purchase_id: 2, medicine_id: 3, medicine: mockMedicines[2], quantity: 300, unit_price: 3.50, total_price: 1050.00, batch_number: '', expiry_date: '' },
    { id: 4, purchase_id: 2, medicine_id: 7, medicine: mockMedicines[6], quantity: 200, unit_price: 3.00, total_price: 600.00, batch_number: '', expiry_date: '' },
    { id: 5, purchase_id: 2, medicine_id: 8, medicine: mockMedicines[7], quantity: 50, unit_price: 5.00, total_price: 250.00, batch_number: '', expiry_date: '' },
  ]},
]

export function getMockStats(): DashboardStats {
  const todaySales = mockInvoices.filter((s) => {
    const d = new Date(s.created_at).toDateString()
    return d === new Date().toDateString() && s.status === 'completed'
  })
  const lowStock = mockMedicines.filter((m) => m.current_stock <= m.min_stock)
  const expiring = mockBatches.filter((b) => {
    const expiry = new Date(b.expiry_date)
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0
  })

  return {
    total_medicines: mockMedicines.length,
    today_sales_count: todaySales.length,
    today_sales_amount: todaySales.reduce((s, i) => s + i.net_amount, 0),
    low_stock_count: lowStock.length,
    daily_sales: mockInvoices.filter(s => s.status === 'completed').map(s => ({
      date: s.created_at.split('T')[0],
      amount: s.net_amount,
    })),
    alerts: [
      ...lowStock.map((m) => ({
        type: 'low_stock' as const,
        medicine_id: m.id,
        medicine_name: m.name,
        message: `${m.name}: الكمية المتبقية ${m.current_stock} (الحد الأدنى: ${m.min_stock})`,
      })),
      ...expiring.map((b) => {
        const med = mockMedicines.find(m => m.id === b.medicine_id)
        return {
          type: 'expiring' as const,
          medicine_id: b.medicine_id,
          medicine_name: med?.name || '',
          message: `${med?.name}: تنتهي في ${b.expiry_date}`,
        }
      }),
    ],
  }
}
