import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

const DEPLOY_SECRET = process.env.DEPLOY_SECRET

export async function POST(req: NextRequest) {
  const { secret } = await req.json()

  if (!DEPLOY_SECRET || secret !== DEPLOY_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const output = execSync(
      'cd /var/www/makhboz-app && git pull origin claude/g-stack-method-check-nmoay7 && npm install --prefer-offline && npm run build && pm2 restart makhboz',
      { encoding: 'utf8', timeout: 120_000 }
    )
    return NextResponse.json({ ok: true, output })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
