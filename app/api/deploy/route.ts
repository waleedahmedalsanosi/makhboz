import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasUrl || !hasServiceKey) {
    return NextResponse.json({
      status: 'error',
      env: { hasUrl, hasServiceKey, hasAnonKey },
      message: 'Missing Supabase env vars',
    })
  }

  try {
    const supabase = createServerClient()
    const { data, error, count } = await supabase
      .from('bakers')
      .select('id, username, is_active', { count: 'exact' })
      .eq('is_active', true)
      .limit(5)

    return NextResponse.json({
      status: 'ok',
      env: { hasUrl, hasServiceKey, hasAnonKey },
      bakers: { count, sample: data?.map(b => b.username), error: error?.message },
    })
  } catch (e) {
    return NextResponse.json({
      status: 'error',
      env: { hasUrl, hasServiceKey, hasAnonKey },
      message: e instanceof Error ? e.message : String(e),
    })
  }
}
