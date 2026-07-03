import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateSaudiPhone, computeOrder, generateOrderCode, isRateLimited } from '@/lib/orders'

export async function POST(req: NextRequest) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  const { bakerId, customerName, customerPhone, cart, note } = body

  const name = (customerName || '').trim().slice(0, 60)
  if (!bakerId || !name) {
    return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
  }

  const phone = validateSaudiPhone(customerPhone || '')
  if (!phone) {
    return NextResponse.json({ error: 'أدخل رقم جوال سعودي صحيح (05xxxxxxxx)' }, { status: 400 })
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null

  const supabase = createAdminClient()

  const { data: baker } = await supabase
    .from('bakers')
    .select('id, whatsapp_number, display_name')
    .eq('id', bakerId)
    .eq('is_active', true)
    .single()
  if (!baker) {
    return NextResponse.json({ error: 'الخباز غير موجود' }, { status: 404 })
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const [{ count: phoneCount }, { count: ipCount }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('customer_phone', phone).gte('created_at', hourAgo),
    ip
      ? supabase.from('orders').select('id', { count: 'exact', head: true })
          .eq('customer_ip', ip).gte('created_at', hourAgo)
      : Promise.resolve({ count: 0 }),
  ] as const)

  const limited = isRateLimited(phoneCount ?? 0, ipCount ?? 0)
  if (limited) {
    return NextResponse.json({ error: limited }, { status: 429 })
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, is_available')
    .eq('baker_id', bakerId)

  const computed = computeOrder(products ?? [], cart)
  if ('error' in computed) {
    return NextResponse.json({ error: computed.error }, { status: 400 })
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const order_code = generateOrderCode()
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_code,
        baker_id: bakerId,
        customer_name: name,
        customer_phone: phone,
        customer_ip: ip,
        items: computed.items,
        total: computed.total,
        note: (note || '').trim().slice(0, 300) || null,
      })
      .select('id, order_code, view_token, total')
      .single()

    if (!error && order) {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        orderCode: order.order_code,
        viewToken: order.view_token,
        total: order.total,
      })
    }
    if (error?.code !== '23505') {
      return NextResponse.json({ error: 'حدث خطأ — حاول مرة أخرى' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'حدث خطأ — حاول مرة أخرى' }, { status: 500 })
}
