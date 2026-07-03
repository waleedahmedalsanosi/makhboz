import { normalizePhone } from '@/lib/otp'

export type Product = {
  id: string
  name: string
  price: number
  is_available: boolean
}

export type CartItem = { product_id: string; qty: number }

export type OrderItem = { product_id: string; name: string; price: number; qty: number }

// جوال سعودي بعد التطبيع: 9665xxxxxxxx
export function validateSaudiPhone(raw: string): string | null {
  const phone = normalizePhone(raw || '')
  return /^9665\d{8}$/.test(phone) ? phone : null
}

// يحسب الأصناف والإجمالي من أسعار قاعدة البيانات فقط — لا يثق بأي سعر من العميل
export function computeOrder(
  products: Product[],
  cart: CartItem[]
): { items: OrderItem[]; total: number } | { error: string } {
  if (!Array.isArray(cart) || cart.length === 0) {
    return { error: 'السلة فارغة' }
  }
  if (cart.length > 20) {
    return { error: 'عدد الأصناف كبير جداً' }
  }

  const byId = new Map(products.map(p => [p.id, p]))
  const items: OrderItem[] = []
  let total = 0

  for (const line of cart) {
    const qty = Number(line?.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return { error: 'كمية غير صالحة' }
    }
    const product = byId.get(line?.product_id)
    if (!product || !product.is_available) {
      return { error: 'أحد المنتجات لم يعد متاحاً — حدّث الصفحة وحاول مجدداً' }
    }
    items.push({ product_id: product.id, name: product.name, price: product.price, qty })
    total += product.price * qty
  }

  return { items, total: Math.round(total * 100) / 100 }
}

// كود قصير لا يكشف حجم الطلبات (قرار D10) — أحرف غير ملتبسة
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generateOrderCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return `MB-${code}`
}

export function isRateLimited(phoneCountLastHour: number, ipCountLastHour: number): string | null {
  if (phoneCountLastHour >= 5) return 'وصلت الحد الأقصى للطلبات بهذا الرقم — حاول بعد ساعة'
  if (ipCountLastHour >= 10) return 'طلبات كثيرة من هذا الجهاز — حاول بعد ساعة'
  return null
}

export function buildOrderWhatsAppText(order: {
  order_code: string
  items: OrderItem[]
  total: number
  customer_name: string
  note?: string | null
  id: string
  view_token: string
}): string {
  const lines = [
    `طلب جديد من مخبوز 🍞 — طلب رقم #${order.order_code}`,
    ...order.items.map(i => `${i.qty}× ${i.name} — ${i.price} ﷼`),
    `الإجمالي: ${order.total} ﷼`,
    `الاسم: ${order.customer_name}`,
  ]
  if (order.note?.trim()) lines.push(`ملاحظة: ${order.note.trim()}`)
  lines.push(`تفاصيل الطلب: https://makhboz.net/order/${order.id}?t=${order.view_token}`)
  return lines.join('\n')
}
