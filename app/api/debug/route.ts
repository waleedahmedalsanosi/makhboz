import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()

  const { data: bakers, error } = await supabase
    .from('bakers')
    .select('id, username, display_name, city, is_active, is_verified')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ bakers, error, count: bakers?.length ?? 0 })
}
