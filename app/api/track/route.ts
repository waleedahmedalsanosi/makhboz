import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { bakerId, event } = await req.json()

    if (!bakerId || !['whatsapp_click', 'profile_view'].includes(event)) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    const supabase = createServerClient()
    await supabase.from('click_events').insert({ baker_id: bakerId, event_type: event })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
}
