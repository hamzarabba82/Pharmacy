import { describe, it, expect } from 'vitest'
import { PAYMENT_METHODS, PAYMENT_OPTIONS } from '../../utils/constants'

describe('PAYMENT_METHODS', () => {
  it('يحتوي على طرق الدفع الثلاث', () => {
    expect(PAYMENT_METHODS.cash).toBe('نقدي')
    expect(PAYMENT_METHODS.card).toBe('بطاقة')
    expect(PAYMENT_METHODS.network).toBe('شبكة')
  })
})

describe('PAYMENT_OPTIONS', () => {
  it('يحتوي على 3 خيارات', () => {
    expect(PAYMENT_OPTIONS).toHaveLength(3)
  })

  it('كل خيار له value و label', () => {
    for (const opt of PAYMENT_OPTIONS) {
      expect(opt.value).toBeTruthy()
      expect(opt.label).toBeTruthy()
    }
  })
})