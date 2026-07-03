import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

function inspectKey(key: string | undefined) {
  if (!key) return { present: false }
  const info: Record<string, unknown> = {
    present: true,
    length: key.length,
    hasWhitespace: /\s/.test(key),
    looksLikeJWT: key.split('.').length === 3,
    startsWithSb: key.startsWith('sb_'),
  }
  if (info.looksLikeJWT) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
      info.role = payload.role
      info.projectRef = payload.ref
      info.expired = payload.exp ? payload.exp * 1000 < Date.now() : null
    } catch {
      info.payloadDecodable = false
    }
  }
  return info
}

export async function GET(req: NextRequest) {
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
    adminCheck.error = error ? JSON.stringify(error) : null
  } catch (e) {
    adminCheck.error = e instanceof Error ? e.message : String(e)
  }

  const body: Record<string, unknown> = {
    status: publicCheck.error ? 'error' : 'ok',
    env,
    publicRead: publicCheck,
    adminRead: adminCheck,
  }

  const secret = req.nextUrl.searchParams.get('secret')
  if (secret && secret === process.env.ADMIN_SECRET) {
    body.serviceKeyInfo = inspectKey(process.env.SUPABASE_SERVICE_ROLE_KEY)
    body.adminSecretInfo = { length: process.env.ADMIN_SECRET?.length ?? 0 }
  }

  return NextResponse.json(body)
}
