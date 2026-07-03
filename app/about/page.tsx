import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'عن مخبوز',
  description: 'منصة مجانية تربط الخبازين السودانيين في السعودية بالعملاء عبر واتساب بدون عمولات',
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '1.2rem', letterSpacing: '-.02em' }}>
        عن مخبوز
      </h1>

      <p style={{ fontSize: '1rem', color: 'rgba(28,43,49,.75)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        مخبوز منصة مجانية تجمع الخبازين السودانيين في المملكة العربية السعودية مع العملاء الباحثين عن مخبوزات سودانية أصيلة.
      </p>

      <div style={{
        background: 'var(--cream)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '1.4rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.8rem' }}>كيف يعمل مخبوز؟</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
          <li style={{ fontSize: '.92rem', color: 'rgba(28,43,49,.7)', lineHeight: 1.6 }}>
            🔍 تصفح الخبازين حسب مدينتك
          </li>
          <li style={{ fontSize: '.92rem', color: 'rgba(28,43,49,.7)', lineHeight: 1.6 }}>
            💬 تواصل مباشرة عبر واتساب — بدون وسيط وبدون عمولات
          </li>
          <li style={{ fontSize: '.92rem', color: 'rgba(28,43,49,.7)', lineHeight: 1.6 }}>
            🍞 اطلب مخبوزاتك المفضلة من خبازين موثوقين
          </li>
        </ul>
      </div>

      <div style={{
        background: 'var(--cream)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '1.4rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.8rem' }}>المدن المتوفرة</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'].map((city) => (
            <span key={city} style={{
              background: 'var(--teal)',
              color: 'var(--cream)',
              fontSize: '.8rem',
              fontWeight: 700,
              padding: '.35rem .85rem',
              borderRadius: '100px',
            }}>{city}</span>
          ))}
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--honey) 140%)',
        borderRadius: '16px',
        padding: '1.6rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>خباز سوداني؟ انضم مجاناً</h2>
        <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.8)', marginBottom: '1rem', lineHeight: 1.6 }}>
          التسجيل مجاني بالكامل — أنشئ ملفك وابدأ في استقبال الطلبات عبر واتساب
        </p>
        <a href="/join" style={{
          display: 'inline-block',
          background: 'var(--honey)',
          color: '#fff',
          fontSize: '.9rem',
          fontWeight: 800,
          padding: '.7rem 2rem',
          borderRadius: '100px',
          textDecoration: 'none',
        }}>انضم الآن</a>
      </div>
    </div>
  )
}
