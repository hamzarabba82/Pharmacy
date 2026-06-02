import { describe, it, expect } from 'vitest'
import { updateStockOnSale, updateStockOnRefund, validateStock } from '../../services/inventory.service'
import { ValidationError } from '../../types/errors'
import type { Medicine, SaleItem } from '../../types'

function mockMed(id: number, stock: number, price = 10): Medicine {
  return { id, name: 'test', barcode: 'X', category_id: 1, purchase_price: 5, sale_price: price, current_stock: stock, min_stock: 1 } as Medicine
}

function mockSaleItem(medicineId: number, quantity: number): SaleItem {
  return { medicine_id: medicineId, quantity, unit_price: 10, total_price: quantity * 10 } as SaleItem
}

describe('updateStockOnSale', () => {
  it('يخصم الكمية من المخزون', () => {
    const meds = [mockMed(1, 50), mockMed(2, 30)]
    const items = [mockSaleItem(1, 5), mockSaleItem(2, 10)]
    const result = updateStockOnSale(meds, items)
    expect(result.find(m => m.id === 1)!.current_stock).toBe(45)
    expect(result.find(m => m.id === 2)!.current_stock).toBe(20)
  })

  it('لا يخفض أقل من 0', () => {
    const meds = [mockMed(1, 3)]
    const items = [mockSaleItem(1, 10)]
    const result = updateStockOnSale(meds, items)
    expect(result[0].current_stock).toBe(0)
  })
})

describe('updateStockOnRefund', () => {
  it('يعيد الكمية إلى المخزون', () => {
    const meds = [mockMed(1, 10)]
    const items = [mockSaleItem(1, 5)]
    const result = updateStockOnRefund(meds, items)
    expect(result[0].current_stock).toBe(15)
  })
})

describe('validateStock', () => {
  it('يقبل الكمية الصالحة', () => {
    expect(validateStock(mockMed(1, 50, 10), 5)).toBe(true)
  })

  it('يرفض الكمية = 0', () => {
    expect(() => validateStock(mockMed(1, 50), 0)).toThrow(ValidationError)
  })

  it('يرفض الكمية الأكبر من المتوفر', () => {
    expect(() => validateStock(mockMed(1, 5), 10)).toThrow(ValidationError)
  })

  it('يرفض سعر البيع = 0', () => {
    expect(() => validateStock(mockMed(1, 50, 0), 1)).toThrow(ValidationError)
  })

  it('يقبل availableStock المخصص', () => {
    expect(validateStock(mockMed(1, 50, 10), 5, 10)).toBe(true)
  })

  it('يرفض بناءً على availableStock المخصص (أقل من current_stock)', () => {
    expect(() => validateStock(mockMed(1, 50), 30, 20)).toThrow(ValidationError)
  })
})