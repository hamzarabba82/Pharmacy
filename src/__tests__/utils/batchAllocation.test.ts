import { describe, it, expect } from 'vitest'
import { allocateQuantityFIFO, isMedicineExpired } from '../../utils/batchAllocation'

describe('allocateQuantityFIFO', () => {
  function freshBatches() {
    return [
      { id: 1, quantity: 10, expiry_date: '2027-12-31' },
      { id: 2, quantity: 20, expiry_date: '2028-06-30' },
      { id: 3, quantity: 5, expiry_date: '2027-06-30' },
    ]
  }

  it('يخصص الكمية من جميع الدفعات', () => {
    const result = allocateQuantityFIFO(freshBatches(), 15)
    expect(result).toHaveLength(2)
    expect(result[0].batch_id).toBe(3) // الأقرب انتهاءً أولاً
    expect(result[0].quantity).toBe(5)
    expect(result[1].batch_id).toBe(1)
    expect(result[1].quantity).toBe(10)
  })

  it('يرجع مصفوفة فارغة إذا كانت الكمية 0', () => {
    expect(allocateQuantityFIFO(freshBatches(), 0)).toEqual([])
  })

  it('يرمي خطأ إذا كانت الكمية غير متوفرة', () => {
    expect(() => allocateQuantityFIFO(freshBatches(), 100)).toThrow('الكمية المطلوبة')
  })

  it('يرتب حسب تاريخ الصلاحية الأقدم أولاً', () => {
    const result = allocateQuantityFIFO(freshBatches(), 5)
    expect(result[0].batch_id).toBe(3)
  })

  it('يتجاهل الدفعات منتهية الصلاحية', () => {
    const batches = [
      { id: 1, quantity: 10, expiry_date: '2020-01-01' },
      { id: 2, quantity: 10, expiry_date: '2028-06-30' },
    ]
    const result = allocateQuantityFIFO(batches, 5)
    expect(result).toHaveLength(1)
    expect(result[0].batch_id).toBe(2)
    expect(result[0].quantity).toBe(5)
  })
})

describe('isMedicineExpired', () => {
  it('يعود true إذا كان is_fully_expired = true', () => {
    expect(isMedicineExpired({ expiry_date: '2030-01-01', is_fully_expired: true })).toBe(true)
  })

  it('يعود true إذا كان تاريخ الصلاحية في الماضي', () => {
    expect(isMedicineExpired({ expiry_date: '2020-01-01' })).toBe(true)
  })

  it('يعود false إذا كان تاريخ الصلاحية في المستقبل', () => {
    expect(isMedicineExpired({ expiry_date: '2099-12-31' })).toBe(false)
  })

  it('يعود false إذا لم يكن هناك تاريخ صلاحية', () => {
    expect(isMedicineExpired({})).toBe(false)
  })
})