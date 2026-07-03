import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import WhatsAppButton from '@/components/WhatsAppButton'
import ReviewSection from '@/components/ReviewSection'

export const revalidate = 0

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('bakers').select('display_name, city, bio').eq('username', username).single()
  if (!data) return { title: 'مخبوز' }
  const description = data.bio ?? `خباز سوداني في ${data.city}`
  return {
    title: `${data.display_name} — مخبوز`,
    description,
    openGraph: {
      title: `${data.display_name} — مخبوز`,
      description,
      siteName: 'مخبوز',
      locale: 'ar_SA',
      type: 'profile',
    },
  }
}

export default async function BakerPage({ params }: Props) {
  const { username } = await params
  const supabase = createServerClient()

  const { data: baker } = await supabase
    .from('bakers').select('*').eq('username', username).eq('is_active', true).single()
  if (!baker) notFound()

  const { data: products } = await supabase
    .from('products').select('*').eq('baker_id', baker.id).eq('is_available', true).order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('baker_id', baker.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(30)

  await supabase
    .from('click_events')
    .insert({ baker_id: baker.id, event_type: 'profile_view' })
    .then(() => {}, () => {})

  const waText = encodeURIComponent(`مرحباً، رأيت ملفك على مخبوز وأريد الطلب 🍞`)
  const whatsappLink = baker.whatsapp_number
    ? `https://wa.me/${baker.whatsapp_number.replace(/\D/g, '')}?text=${waText}`
    : null

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

      {/* Cover + Avatar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal2) 60%, var(--honey) 140%)',
        borderRadius: '24px',
        height: '130px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '3rem',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,.05) 0deg 3deg, transparent 3deg 45deg)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          right: '1.4rem',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'var(--cream)',
          border: '3px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.1rem',
          boxShadow: '0 6px 20px rgba(30,50,58,.18)',
          overflow: 'hidden',
        }}>
          {baker.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={baker.avatar_url} alt={baker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👩‍🍳'
          }
        </div>
      </div>

      {/* Name + location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-.02em' }}>
          {baker.display_name}
        </h1>
        {baker.is_verified && (
          <span style={{
            fontSize: '.65rem', fontWeight: 700, background: 'var(--honey)',
            color: '#fff', padding: '.18rem .55rem', borderRadius: '100px',
          }}>موثّق ✓</span>
        )}
        {baker.available_today_date === new Date().toISOString().slice(0, 10) && (
          <span style={{
            fontSize: '.65rem', fontWeight: 700, background: 'rgba(196,137,61,.12)',
            color: 'var(--honey)', padding: '.18rem .55rem', borderRadius: '100px',
            border: '1px solid rgba(196,137,61,.3)',
          }}>🔥 متوفر اليوم</span>
        )}
      </div>
      <p style={{ fontSize: '.85rem', color: 'var(--mist)', marginBottom: '.85rem', fontWeight: 500 }}>
        📍 {baker.city}
      </p>
      {baker.bio && (
        <p style={{ fontSize: '.92rem', color: 'rgba(28,43,49,.65)', lineHeight: 1.68, marginBottom: '1.2rem' }}>
          {baker.bio}
        </p>
      )}

      {/* WhatsApp CTA */}
      {whatsappLink && <WhatsAppButton bakerId={baker.id} href={whatsappLink} />}

      {/* Products */}
      {products && products.length > 0 && (
        <>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)',
            letterSpacing: '-.01em', marginBottom: '.85rem',
            paddingTop: '1rem', borderTop: '1px solid var(--border)',
          }}>المنتجات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
            {products.map((p) => (
              <div key={p.id} style={{
                background: 'var(--cream)', borderRadius: '14px',
                padding: '.9rem 1rem', border: '1.5px solid var(--border)',
              }}>
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name}
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '.6rem' }} />
                )}
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)', marginBottom: '.15rem' }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: '.75rem', color: 'var(--mist)', marginBottom: '.55rem', lineHeight: 1.4 }}>{p.description}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: 'var(--honey)', fontSize: '.95rem' }}>{p.price} ﷼</span>
                  {p.weight_grams && (
                    <span style={{ fontSize: '.7rem', color: 'rgba(122,158,166,.7)' }}>{p.weight_grams} جرام</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ReviewSection bakerId={baker.id} reviews={reviews ?? []} />
    </div>
  )
}
