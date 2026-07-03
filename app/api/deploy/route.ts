import { NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const publicCheck: Record<string, unknown> = {}
  const adminCheck: Record<string, unknown> = {}

  try {
    const { data, error, count } = await createServerClient()
      .from('bakers')
      .select('username', { count: 'exact' })
      .eq('is_active', true)
      .limit(5)
    publicCheck.count = count
    publicCheck.sample = data?.map(b => b.username)
    publicCheck.error = error?.message ?? null
  } catch (e) {
    publicCheck.error = e instanceof Error ? e.message : String(e)
  }

  try {
    const { count, error } = await createAdminClient()
      .from('bakers')
      .select('id', { count: 'exact', head: true })
    adminCheck.count = count
    adminCheck.error = error?.message ?? null
  } catch (e) {
    adminCheck.error = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    status: publicCheck.error ? 'error' : 'ok',
    env,
    publicRead: publicCheck,
    adminRead: adminCheck,
  })
}
