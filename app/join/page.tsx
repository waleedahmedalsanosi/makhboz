import JoinForm from './JoinForm'

export const metadata = { title: 'انضم كخباز — مخبوز' }

export default function JoinPage() {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(196,137,61,.12)',
          color: 'var(--honey)',
          fontSize: '.75rem', fontWeight: 700,
          letterSpacing: '.1em', padding: '.35rem .9rem',
          borderRadius: '100px', marginBottom: '1rem',
        }}>للخبازين</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', letterSpacing: '-.02em', marginBottom: '.5rem' }}>
          انضم كخباز
        </h1>
        <p style={{ color: 'rgba(28,43,49,.5)', fontSize: '.95rem' }}>
          أنشئ ملفك وابدأ تستقبل طلبات
        </p>
      </div>

      <JoinForm />

      <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.78rem', color: 'rgba(28,43,49,.35)' }}>
        مجاني تماماً — لا عمولات، لا رسوم
      </p>
    </div>
  )
}
