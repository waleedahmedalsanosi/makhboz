import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const { bakerId, field, value, secret } = await req.json()

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!['is_active', 'is_verified'].includes(field)) {
    return NextResponse.json({ error: 'invalid field' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('bakers')
    .update({ [field]: value })
    .eq('id', bakerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
