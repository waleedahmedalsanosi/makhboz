import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { otpEnabled, normalizePhone, sendWhatsAppMessage, activationMessage } from '@/lib/otp'

export async function PATCH(req: NextRequest) {
  const { bakerId, field, value, secret } = await req.json()

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!['is_active', 'is_verified'].includes(field)) {
    return NextResponse.json({ error: 'invalid field' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: baker, error } = await supabase
    .from('bakers')
    .update({ [field]: value })
    .eq('id', bakerId)
    .select('username, whatsapp_number, edit_token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let notified = false
  if (field === 'is_active' && value === true && baker && otpEnabled()) {
    try {
      await sendWhatsAppMessage(
        normalizePhone(baker.whatsapp_number),
        activationMessage(baker.username, baker.edit_token)
      )
      notified = true
    } catch {
      notified = false
    }
  }

  return NextResponse.json({ ok: true, notified })
}
