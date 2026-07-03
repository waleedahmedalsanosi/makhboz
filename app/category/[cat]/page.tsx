import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import BakerCard from '@/components/BakerCard'

export const revalidate = 0

const CATEGORIES: Record<string, string> = {
  'كسرة': 'الكسرة السودانية الأصيلة — خبز رقيق مخمّر يُقدَّم مع الملاح',
  'عيش': 'العيش السوداني (قراصة) — خبز بلدي طازج من الفرن المنزلي',
  'بسبوسة': 'البسبوسة السودانية — حلا شرقي غني بالقطر على الطريقة السودانية',
  'دكوة': 'الدكوة السودانية — زبدة الفول السوداني البلدية الأصلية',
  'قرقوش': 'القرقوش السوداني — بقسماط مقرمش على أصوله',
}

type Props = { params: Promise<{ cat: string }> }

export async function generateMetadata({ params }: Props) {
  const { cat: raw } = await params
  const cat = decodeURIComponent(raw)
  if (!(cat in CATEGORIES)) return { title: 'مخبوز' }
  const title = `${cat} سودانية طازجة — مخبوز`
  const description = `${CATEGORIES[cat]}. اطلب من خبازين سودانيين منزليين في السعودية مباشرةً عبر واتساب.`
  return {
    title,
    description,
    alternates: { canonical: `https://makhboz.net/category/${encodeURIComponent(cat)}` },
    openGraph: { title, description, siteName: 'مخبوز', locale: 'ar_SA', type: 'website' },
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ cat }))
}

export default async function CategoryPage({ params }: Props) {
  const { cat: raw } = await params
  const cat = decodeURIComponent(raw)
  if (!(cat in CATEGORIES)) notFound()

  const supabase = createServerClient()

  const { data: productRows } = await supabase
    .from('products')
    .select('baker_id')
    .eq('category', cat)
    .eq('is_available', true)
  const ids = [...new Set(productRows?.map(p => p.baker_id) ?? [])]

  const { data: bakers } = ids.length
    ? await supabase
        .from('bakers')
        .select('id, username, display_name, city, bio, avatar_url, is_verified')
        .eq('is_active', true)
        .in('id', ids)
        .order('created_at', { ascending: false })
        .limit(48)
    : { data: [] }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <nav style={{ fontSize: '.78rem', color: 'var(--mist)', marginBottom: '1.5rem' }}>
        <a href="/" style={{ color: 'var(--teal)', textDecoration: 'none' }}>الرئيسية</a>
        {' ← '}
        <span>{cat}</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-.02em', marginBottom: '.5rem' }}>
        {cat} سودانية طازجة
      </h1>
      <p style={{ color: 'var(--mist)', fontSize: '.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
        {CATEGORIES[cat]}. اطلب مباشرةً من الخباز عبر واتساب.
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
          <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>لا يوجد خبازون يقدمون {cat} حالياً — هل تخبز {cat}؟</p>
          <a href="/join" style={{
            display: 'inline-block', background: 'var(--honey)', color: '#fff',
            padding: '.8rem 2rem', borderRadius: '100px', fontWeight: 800,
            fontSize: '.92rem', textDecoration: 'none',
          }}>أنشئ ملفك مجاناً</a>
        </div>
      )}

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '.82rem', color: 'var(--mist)', marginBottom: '.7rem', fontWeight: 700 }}>أصناف أخرى:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {Object.keys(CATEGORIES).filter(c => c !== cat).map(c => (
            <a key={c} href={`/category/${encodeURIComponent(c)}`} style={{
              padding: '.4rem 1rem', borderRadius: '100px', fontSize: '.8rem', fontWeight: 600,
              border: '1.5px solid rgba(196,137,61,.35)', color: 'var(--honey)', background: '#fff',
              textDecoration: 'none',
            }}>{c}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
