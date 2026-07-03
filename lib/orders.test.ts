import { describe, it, expect } from 'vitest'
import {
  validateSaudiPhone,
  computeOrder,
  generateOrderCode,
  isRateLimited,
  buildOrderWhatsAppText,
  type Product,
} from './orders'

const products: Product[] = [
  { id: 'p1', name: 'كسرة', price: 15, is_available: true },
  { id: 'p2', name: 'بسبوسة', price: 35.5, is_available: true },
  { id: 'p3', name: 'دكوة', price: 40, is_available: false },
]

describe('validateSaudiPhone', () => {
  it('accepts 05xxxxxxxx and normalizes to 9665xxxxxxxx', () => {
    expect(validateSaudiPhone('0501234567')).toBe('966501234567')
  })
  it('accepts +966 5X XXX XXXX with spaces', () => {
    expect(validateSaudiPhone('+966 50 123 4567')).toBe('966501234567')
  })
  it('accepts 9665xxxxxxxx directly', () => {
    expect(validateSaudiPhone('966501234567')).toBe('966501234567')
  })
  it('rejects non-Saudi numbers', () => {
    expect(validateSaudiPhone('12025550123')).toBeNull()
  })
  it('rejects too-short input and empty', () => {
    expect(validateSaudiPhone('05012')).toBeNull()
    expect(validateSaudiPhone('')).toBeNull()
  })
})

describe('computeOrder', () => {
  it('computes items and total from DB prices only', () => {
    const result = computeOrder(products, [
      { product_id: 'p1', qty: 2 },
      { product_id: 'p2', qty: 1 },
    ])
    expect(result).toEqual({
      items: [
        { product_id: 'p1', name: 'كسرة', price: 15, qty: 2 },
        { product_id: 'p2', name: 'بسبوسة', price: 35.5, qty: 1 },
      ],
      total: 65.5,
    })
  })
  it('rejects unavailable products', () => {
    const result = computeOrder(products, [{ product_id: 'p3', qty: 1 }])
    expect(result).toHaveProperty('error')
  })
  it('rejects unknown product ids (deleted mid-cart)', () => {
    const result = computeOrder(products, [{ product_id: 'ghost', qty: 1 }])
    expect(result).toHaveProperty('error')
  })
  it('ignores any client-supplied price fields', () => {
    const cart = [{ product_id: 'p1', qty: 1, price: 0.01, total: 0.01 }] as never
    const result = computeOrder(products, cart)
    expect(result).toEqual({
      items: [{ product_id: 'p1', name: 'كسرة', price: 15, qty: 1 }],
      total: 15,
    })
  })
  it('rejects empty cart, zero/negative/fractional/huge qty', () => {
    expect(computeOrder(products, [])).toHaveProperty('error')
    expect(computeOrder(products, [{ product_id: 'p1', qty: 0 }])).toHaveProperty('error')
    expect(computeOrder(products, [{ product_id: 'p1', qty: -2 }])).toHaveProperty('error')
    expect(computeOrder(products, [{ product_id: 'p1', qty: 1.5 }])).toHaveProperty('error')
    expect(computeOrder(products, [{ product_id: 'p1', qty: 51 }])).toHaveProperty('error')
  })
})

describe('generateOrderCode', () => {
  it('matches MB-XXXX with unambiguous charset', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderCode()).toMatch(/^MB-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/)
    }
  })
})

describe('isRateLimited', () => {
  it('allows under both limits', () => {
    expect(isRateLimited(4, 9)).toBeNull()
  })
  it('blocks at 5 orders per phone per hour', () => {
    expect(isRateLimited(5, 0)).toBeTruthy()
  })
  it('blocks at 10 orders per IP per hour', () => {
    expect(isRateLimited(0, 10)).toBeTruthy()
  })
})

describe('buildOrderWhatsAppText', () => {
  const order = {
    order_code: 'MB-4F7K',
    items: [{ product_id: 'p1', name: 'كسرة', price: 15, qty: 2 }],
    total: 30,
    customer_name: 'أحمد',
    note: 'توصيل مساءً',
    id: 'abc-123',
    view_token: 'tok-456',
  }
  it('follows the design template with ﷼ and order link', () => {
    const text = buildOrderWhatsAppText(order)
    expect(text).toContain('#MB-4F7K')
    expect(text).toContain('2× كسرة — 15 ﷼')
    expect(text).toContain('الإجمالي: 30 ﷼')
    expect(text).toContain('الاسم: أحمد')
    expect(text).toContain('ملاحظة: توصيل مساءً')
    expect(text).toContain('https://makhboz.net/order/abc-123?t=tok-456')
  })
  it('omits the note line when empty', () => {
    const text = buildOrderWhatsAppText({ ...order, note: '  ' })
    expect(text).not.toContain('ملاحظة')
  })
})
