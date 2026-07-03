import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { bakerId, customerName, rating, comment } = await req.json()

    const name = (customerName || '').trim().slice(0, 60)
    const r = Number(rating)
    if (!bakerId || !name || !Number.isInteger(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: baker } = await supabase
      .from('bakers').select('id').eq('id', bakerId).eq('is_active', true).single()
    if (!baker) {
      return NextResponse.json({ error: 'الخباز غير موجود' }, { status: 404 })
    }

    const { error } = await supabase.from('reviews').insert({
      baker_id: bakerId,
      customer_name: name,
      rating: r,
      comment: (comment || '').trim().slice(0, 500) || null,
      is_approved: false,
    })
    if (error) {
      return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }
}
