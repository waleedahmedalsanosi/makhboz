import { createServerClient } from '@/lib/supabase/server'
import BakerCard from '@/components/BakerCard'
import HeroSearch from '@/components/HeroSearch'

export const revalidate = 60

const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة']

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; q?: string }>
}) {
  const { city, q } = await searchParams
  const supabase = createServerClient()

  let query = supabase
    .from('bakers')
    .select('id, username, display_name, city, bio, avatar_url, is_verified')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(48)

  if (city) query = query.eq('city', city)
  if (q) query = query.ilike('display_name', `%${q}%`)

  const { data: bakers } = await query

  const { count } = await supabase
    .from('bakers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'var(--teal)',
        padding: '4rem 1.5rem 5.5rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'radial-gradient(circle at 15% 50%, rgba(196,137,61,.18) 0%, transparent 55%)',
            'radial-gradient(circle at 85% 20%, rgba(61,107,119,.4) 0%, transparent 50%)',
            'repeating-conic-gradient(rgba(244,240,216,.04) 0deg 3deg, transparent 3deg 45deg)',
          ].join(','),
          backgroundSize: 'cover, cover, 60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.4rem',
            background: 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.15)',
            color: 'rgba(245,240,216,.8)',
            fontSize: '.75rem',
            fontWeight: 600,
            letterSpacing: '.1em',
            padding: '.35rem .9rem',
            borderRadius: '100px',
            marginBottom: '1.4rem',
          }}>
            <span style={{ color: 'var(--honey2)', fontSize: '.5rem' }}>●</span>
            المملكة العربية السعودية
          </span>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 6vw, 3.6rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '-.02em',
            marginBottom: '.9rem',
          }}>
            اكتشف خبازين سودانيين<br />
            <span style={{ color: 'var(--honey2)' }}>قريبين منك</span>
          </h1>

          <p style={{ color: 'rgba(245,240,216,.6)', fontSize: '1rem', marginBottom: '2.4rem' }}>
            مخبوزات أصيلة — تواصل مع الخباز مباشرةً عبر واتساب
          </p>

          <HeroSearch defaultCity={city} defaultQ={q} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ color: 'rgba(245,240,216,.55)', fontSize: '.82rem' }}>
              <strong style={{ display: 'block', color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>
                {count ?? 0}+
              </strong>
              خباز
            </div>
            <div style={{ color: 'rgba(245,240,216,.55)', fontSize: '.82rem' }}>
              <strong style={{ display: 'block', color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>5</strong>
              مدن
            </div>
            <div style={{ color: 'rgba(245,240,216,.55)', fontSize: '.82rem' }}>
              <strong style={{ display: 'block', color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>مجاني</strong>
              للتواصل
            </div>
          </div>
        </div>
      </section>

      {/* wave */}
      <div style={{
        display: 'block',
        width: '100%',
        height: '52px',
        background: 'var(--cream)',
        clipPath: 'ellipse(55% 100% at 50% 100%)',
        marginTop: '-1px',
        backgroundColor: 'var(--cream)',
      }} />

      {/* CITY PILLS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', padding: '1.2rem 1.5rem .2rem' }}>
        <a
          href="/"
          style={{
            padding: '.45rem 1.1rem',
            borderRadius: '100px',
            fontSize: '.82rem',
            fontWeight: 600,
            border: `1.5px solid ${!city ? 'var(--teal)' : 'var(--border)'}`,
            color: !city ? 'var(--cream)' : 'var(--teal)',
            background: !city ? 'var(--teal)' : '#fff',
            textDecoration: 'none',
            boxShadow: !city ? '0 4px 12px rgba(45,80,89,.25)' : '0 1px 3px rgba(0,0,0,.04)',
          }}
        >
          الكل
        </a>
        {CITIES.map((c) => (
          <a
            key={c}
            href={`/?city=${encodeURIComponent(c)}`}
            style={{
              padding: '.45rem 1.1rem',
              borderRadius: '100px',
              fontSize: '.82rem',
              fontWeight: 600,
              border: `1.5px solid ${city === c ? 'var(--teal)' : 'var(--border)'}`,
              color: city === c ? 'var(--cream)' : 'var(--teal)',
              background: city === c ? 'var(--teal)' : '#fff',
              textDecoration: 'none',
              boxShadow: city === c ? '0 4px 12px rgba(45,80,89,.25)' : '0 1px 3px rgba(0,0,0,.04)',
            }}
          >
            {c}
          </a>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div style={{
        maxWidth: '980px',
        margin: '2rem auto 1rem',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em' }}>الخبازون</h2>
      </div>

      {/* BAKER GRID */}
      {bakers && bakers.length > 0 ? (
        <div style={{
          maxWidth: '980px',
          margin: '0 auto',
          padding: '0 1.5rem 3.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1rem',
        }}>
          {bakers.map((baker) => (
            <BakerCard key={baker.id} baker={baker} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 1.5rem', color: 'rgba(28,43,49,.35)' }}>
          <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍞</p>
          <p style={{ fontSize: '1.05rem' }}>لا يوجد خبازون في هذه المنطقة بعد</p>
        </div>
      )}

      {/* JOIN CTA */}
      <section style={{
        background: 'var(--teal)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'radial-gradient(circle at 80% 50%, rgba(196,137,61,.2) 0%, transparent 60%)',
            'repeating-conic-gradient(rgba(255,255,255,.035) 0deg 3deg, transparent 3deg 45deg)',
          ].join(','),
          backgroundSize: 'cover, 60px 60px',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(196,137,61,.2)',
            color: 'var(--honey2)',
            fontSize: '.75rem',
            fontWeight: 700,
            letterSpacing: '.1em',
            padding: '.35rem .9rem',
            borderRadius: '100px',
            marginBottom: '1.2rem',
          }}>للخبازين</span>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-.025em',
            marginBottom: '.7rem',
            lineHeight: 1.2,
          }}>أنت خباز سوداني؟<br />الناس تبحث عنك</h2>
          <p style={{ color: 'rgba(245,240,216,.55)', fontSize: '.95rem', marginBottom: '2rem' }}>
            أنشئ ملفك مجاناً في دقيقتين
          </p>
          <a
            href="/join"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.6rem',
              background: 'var(--honey)',
              color: '#fff',
              padding: '.95rem 2.4rem',
              borderRadius: '100px',
              fontWeight: 800,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '.01em',
              boxShadow: '0 8px 28px rgba(196,137,61,.4)',
            }}
          >
            أنشئ ملفي الآن ←
          </a>
          <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'rgba(245,240,216,.3)' }}>
            مجاني تماماً — لا عمولات، لا رسوم
          </p>
        </div>
      </section>
    </>
  )
}
