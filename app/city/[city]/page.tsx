import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import BakerCard from '@/components/BakerCard'

export const revalidate = 0

const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة']

type Props = { params: Promise<{ city: string }> }

export async function generateMetadata({ params }: Props) {
  const { city: raw } = await params
  const city = decodeURIComponent(raw)
  if (!CITIES.includes(city)) return { title: 'مخبوز' }
  const title = `خبازون سودانيون في ${city} — مخبوز`
  const description = `اكتشف أفضل الخبازين السودانيين المنزليين في ${city}: كسرة، عيش، بسبوسة، دكوة والمزيد. تواصل مباشرةً عبر واتساب.`
  return {
    title,
    description,
    alternates: { canonical: `https://makhboz.net/city/${encodeURIComponent(city)}` },
    openGraph: { title, description, siteName: 'مخبوز', locale: 'ar_SA', type: 'website' },
  }
}

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city }))
}

export default async function CityPage({ params }: Props) {
  const { city: raw } = await params
  const city = decodeURIComponent(raw)
  if (!CITIES.includes(city)) notFound()

  const supabase = createServerClient()
  const { data: bakers } = await supabase
    .from('bakers')
    .select('id, username, display_name, city, bio, avatar_url, is_verified')
    .eq('is_active', true)
    .eq('city', city)
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <nav style={{ fontSize: '.78rem', color: 'var(--mist)', marginBottom: '1.5rem' }}>
        <a href="/" style={{ color: 'var(--teal)', textDecoration: 'none' }}>الرئيسية</a>
        {' ← '}
        <span>{city}</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-.02em', marginBottom: '.5rem' }}>
        خبازون سودانيون في {city}
      </h1>
      <p style={{ color: 'var(--mist)', fontSize: '.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
        مخبوزات سودانية أصيلة من منازل {city} — تواصل مع الخباز مباشرةً عبر واتساب، بدون وسيط وبدون عمولات.
      </p>

      {bakers && bakers.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1rem',
        }}>
          {bakers.map((baker) => <BakerCard key={baker.id} baker={baker} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'rgba(28,43,49,.35)' }}>
          <p style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🍞</p>
          <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>لا يوجد خبازون في {city} بعد — كن أول من ينضم!</p>
          <a href="/join" style={{
            display: 'inline-block', background: 'var(--honey)', color: '#fff',
            padding: '.8rem 2rem', borderRadius: '100px', fontWeight: 800,
            fontSize: '.92rem', textDecoration: 'none',
          }}>أنشئ ملفك مجاناً</a>
        </div>
      )}

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '.82rem', color: 'var(--mist)', marginBottom: '.7rem', fontWeight: 700 }}>مدن أخرى:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {CITIES.filter(c => c !== city).map(c => (
            <a key={c} href={`/city/${encodeURIComponent(c)}`} style={{
              padding: '.4rem 1rem', borderRadius: '100px', fontSize: '.8rem', fontWeight: 600,
              border: '1.5px solid var(--border)', color: 'var(--teal)', background: '#fff',
              textDecoration: 'none',
            }}>{c}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
