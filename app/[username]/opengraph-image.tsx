import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase/server'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

let fontCache: ArrayBuffer | null = null
async function loadFont() {
  if (fontCache) return fontCache
  const res = await fetch(
    'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf'
  )
  if (!res.ok) throw new Error('font fetch failed')
  fontCache = await res.arrayBuffer()
  return fontCache
}

export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = createServerClient()
  const { data: baker } = await supabase
    .from('bakers')
    .select('display_name, city, is_verified')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  const name = baker?.display_name ?? 'مخبوز'
  const city = baker?.city ?? ''

  let fonts
  try {
    fonts = [{ name: 'Tajawal', data: await loadFont(), weight: 700 as const, style: 'normal' as const }]
  } catch {
    fonts = undefined
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2D5059 0%, #3D6B77 60%, #C4893D 160%)',
          fontFamily: 'Tajawal',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,.08)',
            border: '2px solid rgba(255,255,255,.15)',
            borderRadius: 32,
            padding: '60px 90px',
          }}
        >
          <div style={{ fontSize: 72, color: '#ffffff', fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
            {name}
          </div>
          {city && (
            <div style={{ fontSize: 34, color: '#F4F0D8', opacity: 0.85, marginBottom: 8 }}>
              {city} · السعودية
            </div>
          )}
          {baker?.is_verified && (
            <div
              style={{
                fontSize: 26,
                color: '#ffffff',
                background: '#C4893D',
                padding: '8px 28px',
                borderRadius: 100,
                marginTop: 14,
              }}
            >
              خباز موثّق
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 30,
            color: '#F4F0D8',
          }}
        >
          <div style={{ fontWeight: 700 }}>مخبوز</div>
          <div style={{ opacity: 0.6 }}>makhboz.net</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
