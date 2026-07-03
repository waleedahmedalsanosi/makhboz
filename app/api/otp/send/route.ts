import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { otpEnabled, normalizePhone, sendWhatsAppMessage } from '@/lib/otp'

export async function POST(req: NextRequest) {
  if (!otpEnabled()) {
    return NextResponse.json({ enabled: false })
  }

  const { phone: rawPhone } = await req.json()
  const phone = normalizePhone(rawPhone || '')
  if (phone.length < 11) {
    return NextResponse.json({ error: 'رقم غير صالح' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { count } = await supabase
    .from('otp_codes')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد ساعة' }, { status: 429 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))

  const { error } = await supabase.from('otp_codes').insert({
    phone,
    code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
  if (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }

  try {
    await sendWhatsAppMessage(phone, `رمز التحقق لمنصة مخبوز: ${code}\nصالح لمدة 10 دقائق.`)
  } catch {
    return NextResponse.json({ error: 'تعذر إرسال الرمز — تأكد من الرقم' }, { status: 502 })
  }

  return NextResponse.json({ enabled: true, sent: true })
}
