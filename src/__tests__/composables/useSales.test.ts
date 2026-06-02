import { describe, it, expect } from 'vitest'
import { useSales } from '../../composables/useSales'
import type { Medicine, Batch } from '../../types'

const mockMedicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 1,
  name: 'باراسيتامول 500mg',
  barcode: '6281006840401',
  category_id: 1,
  purchase_price: 2.5,
  sale_price: 5.0,
  current_stock: 50,
  min_stock: 10,
  ...overrides,
})

const mockBatch = (overrides: Partial<Batch> = {}): Batch => ({
  id: 1,
  medicine_id: 1,
  batch_number: 'BATCH001',
  quantity: 10,
  initial_quantity: 10,
  purchase_price: 5,
  expiry_date: '2028-12-31',
  ...overrides,
})

describe('useSales', () => {
  it('addToCart — إضافة صنف جديد', () => {
    const { cart, addToCart, setBatchesForMedicine } = useSales()
    const med = mockMedicine()
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const result = addToCart(med, 2)
    if ('error' in result) {
      throw new Error(`Unexpected error: ${result.error}`)
    }
    expect(cart.value).toHaveLength(1)
    expect(cart.value[0].quantity).toBe(2)
    expect(cart.value[0].total_price).toBe(10)
  })

  it('addToCart — كمية أكبر من المتوفر ترجع خطأ', () => {
    const { cart, addToCart } = useSales()
    const med = mockMedicine({ current_stock: 5 })
    const result = addToCart(med, 10)
    if ('error' in result) {
      expect(result.error).toBe('الكمية المتوفرة: 5')
    } else {
      throw new Error('Expected error result')
    }
    expect(cart.value).toHaveLength(0)
  })

  it('addToCart — كمية = 0 ترجع خطأ', () => {
    const { cart, addToCart } = useSales()
    const med = mockMedicine()
    const result = addToCart(med, 0)
    if ('error' in result) {
      expect(result.error).toBe('الكمية يجب أن تكون 1 على الأقل')
    } else {
      throw new Error('Expected error result')
    }
    expect(cart.value).toHaveLength(0)
  })

  it('addToCart — كمية سالبة ترجع خطأ', () => {
    const { cart, addToCart } = useSales()
    const med = mockMedicine()
    const result = addToCart(med, -1)
    if ('error' in result) {
      expect(result.error).toBe('الكمية يجب أن تكون 1 على الأقل')
    } else {
      throw new Error('Expected error result')
    }
    expect(cart.value).toHaveLength(0)
  })

  it('addToCart — إضافة صنف مكرر يزيد الكمية', () => {
    const { cart, addToCart, setBatchesForMedicine } = useSales()
    const med = mockMedicine()
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const result1 = addToCart(med, 2)
    if ('error' in result1) {
      throw new Error(`Unexpected error on first add: ${result1.error}`)
    }
    const result2 = addToCart(med, 3)
    if ('error' in result2) {
      throw new Error(`Unexpected error on second add: ${result2.error}`)
    }
    expect(cart.value).toHaveLength(1)
    expect(cart.value[0].quantity).toBe(5)
    expect(cart.value[0].total_price).toBe(25)
  })

  it('updateQuantity — تعديل كمية موجود', () => {
    const { cart, addToCart, updateQuantity, setBatchesForMedicine } = useSales()
    const med = mockMedicine()
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 2)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    const cartItemId = cart.value[0].id
    const updateResult = updateQuantity(cartItemId, 5)
    if ('error' in updateResult) {
      throw new Error(`Unexpected error on update: ${updateResult.error}`)
    }
    expect(cart.value[0].quantity).toBe(5)
    expect(cart.value[0].total_price).toBe(25)
  })

  it('updateQuantity — كمية = 0 تحذف الصنف', () => {
    const { cart, addToCart, updateQuantity, setBatchesForMedicine } = useSales()
    const med = mockMedicine()
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 2)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    const cartItemId = cart.value[0].id
    const updateResult = updateQuantity(cartItemId, 0)
    if ('error' in updateResult) {
      throw new Error(`Unexpected error on update: ${updateResult.error}`)
    }
    expect(cart.value).toHaveLength(0)
  })

  it('removeFromCart — حذف صنف', () => {
    const { cart, addToCart, removeFromCart, setBatchesForMedicine } = useSales()
    const med1 = mockMedicine({ id: 1 })
    const med2 = mockMedicine({ id: 2, name: 'أموكسيسيلين', sale_price: 12 })
    setBatchesForMedicine(med1.id, [mockBatch({ quantity: med1.current_stock })])
    setBatchesForMedicine(med2.id, [mockBatch({ quantity: med2.current_stock })])
    const addResult1 = addToCart(med1, 2)
    if ('error' in addResult1) {
      throw new Error(`Unexpected error on add med1: ${addResult1.error}`)
    }
    const addResult2 = addToCart(med2, 1)
    if ('error' in addResult2) {
      throw new Error(`Unexpected error on add med2: ${addResult2.error}`)
    }
    // We need to remove the first cart item (med1). We can get its id from cart.value[0].id
    const cartItemId = cart.value[0].id
    removeFromCart(cartItemId)
    // removeFromCart returns void, so we just check cart
    expect(cart.value).toHaveLength(1)
    expect(cart.value[0].medicine.id).toBe(2)
  })

  it('subtotal — حساب الإجمالي', () => {
    const { addToCart, subtotal, setBatchesForMedicine } = useSales()
    const med1 = mockMedicine({ id: 1, sale_price: 5 })
    const med2 = mockMedicine({ id: 2, sale_price: 10 })
    setBatchesForMedicine(med1.id, [mockBatch({ quantity: med1.current_stock })])
    setBatchesForMedicine(med2.id, [mockBatch({ quantity: med2.current_stock })])
    const addResult1 = addToCart(med1, 2)
    if ('error' in addResult1) {
      throw new Error(`Unexpected error on add med1: ${addResult1.error}`)
    }
    const addResult2 = addToCart(med2, 3)
    if ('error' in addResult2) {
      throw new Error(`Unexpected error on add med2: ${addResult2.error}`)
    }
    expect(subtotal.value).toBe(40)
  })

  it('setDiscount — خصم صحيح', () => {
    const { addToCart, subtotal, setDiscount, total, setBatchesForMedicine } = useSales()
    const med = mockMedicine({ sale_price: 10 })
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 5)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    expect(subtotal.value).toBe(50)
    const discountResult = setDiscount(10)
    if ('error' in discountResult) {
      throw new Error(`Unexpected error on setDiscount: ${discountResult.error}`)
    }
    expect(total.value).toBe(40)
  })

  it('setDiscount — خصم ≥ الإجمالي يرجع خطأ', () => {
    const { addToCart, setDiscount, setBatchesForMedicine } = useSales()
    const med = mockMedicine({ sale_price: 10 })
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 5)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    const result = setDiscount(100)
    if ('error' in result) {
      expect(result.error).toBe('الخصم لا يمكن أن يساوي أو يتجاوز الإجمالي')
    } else {
      throw new Error('Expected error result')
    }
  })

  it('setDiscount — خصم سالب يرجع خطأ', () => {
    const { addToCart, setDiscount, setBatchesForMedicine } = useSales()
    const med = mockMedicine({ sale_price: 10 })
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 1)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    const result = setDiscount(-50)
    if ('error' in result) {
      expect(result.error).toBe('الخصم لا يمكن أن يكون سالباً')
    } else {
      throw new Error('Expected error result')
    }
  })

  it('clearCart — تفريغ السلة', () => {
    const { cart, addToCart, clearCart, total, setBatchesForMedicine } = useSales()
    const med = mockMedicine()
    setBatchesForMedicine(med.id, [mockBatch({ quantity: med.current_stock })])
    const addResult = addToCart(med, 2)
    if ('error' in addResult) {
      throw new Error(`Unexpected error on add: ${addResult.error}`)
    }
    clearCart()
    expect(cart.value).toHaveLength(0)
    expect(total.value).toBe(0)
  })

  it('itemCount — عدد الأصناف الكلي', () => {
    const { addToCart, itemCount, setBatchesForMedicine } = useSales()
    const med1 = mockMedicine({ id: 1 })
    const med2 = mockMedicine({ id: 2 })
    setBatchesForMedicine(med1.id, [mockBatch({ quantity: med1.current_stock })])
    setBatchesForMedicine(med2.id, [mockBatch({ quantity: med2.current_stock })])
    const addResult1 = addToCart(med1, 3)
    if ('error' in addResult1) {
      throw new Error(`Unexpected error on add med1: ${addResult1.error}`)
    }
    const addResult2 = addToCart(med2, 5)
    if ('error' in addResult2) {
      throw new Error(`Unexpected error on add med2: ${addResult2.error}`)
    }
    expect(itemCount.value).toBe(8)
  })
})
