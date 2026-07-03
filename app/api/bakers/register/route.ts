import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { otpEnabled, normalizePhone } from '@/lib/otp'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const display_name = formData.get('display_name') as string
  const username = ((formData.get('username') as string) || '').toLowerCase().trim()
  const whatsapp_number = formData.get('whatsapp_number') as string
  const city = formData.get('city') as string
  const bio = formData.get('bio') as string | null

  if (!display_name || !username || !whatsapp_number || !city) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: 'اسم المستخدم يحتوي على أحرف غير مسموح بها' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (otpEnabled()) {
    const phone = normalizePhone(whatsapp_number)
    const { data: otpRow } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', phone)
      .eq('verified', true)
      .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle()
    if (!otpRow) {
      return NextResponse.json({ error: 'يجب تأكيد رقم الواتساب أولاً' }, { status: 403 })
    }
  }

  const { data, error } = await supabase.from('bakers').insert({
    display_name,
    username,
    whatsapp_number,
    city,
    bio: bio || null,
    is_active: false,
    is_verified: false,
  }).select('edit_token').single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'اسم المستخدم مأخوذ، جرب اسماً آخر' }, { status: 409 })
    }
    return NextResponse.json({ error: 'حدث خطأ، حاول مرة أخرى' }, { status: 500 })
  }

  const webhook = process.env.NOTIFY_WEBHOOK
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'baker_registered',
        baker: { display_name, username, whatsapp_number, city, bio: bio || null },
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  const successUrl = new URL('/join/success', req.url)
  if (data?.edit_token) {
    successUrl.searchParams.set('edit_token', data.edit_token)
  }
  return NextResponse.redirect(successUrl)
}
