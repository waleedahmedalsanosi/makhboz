import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/otp'

export async function POST(req: NextRequest) {
  const { phone: rawPhone, code } = await req.json()
  const phone = normalizePhone(rawPhone || '')

  if (!phone || !/^\d{6}$/.test(code || '')) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('otp_codes')
    .select('id')
    .eq('phone', phone)
    .eq('code', code)
    .eq('verified', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!row) {
    return NextResponse.json({ error: 'رمز خاطئ أو منتهي' }, { status: 400 })
  }

  await supabase.from('otp_codes').update({ verified: true }).eq('id', row.id)

  return NextResponse.json({ ok: true })
}
