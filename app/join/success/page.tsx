type Props = { searchParams: Promise<{ edit_token?: string }> }

export default async function JoinSuccessPage({ searchParams }: Props) {
  const { edit_token } = await searchParams
  const editLink = edit_token ? `/edit?token=${edit_token}` : null

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
      <p style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🥐</p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--teal)', marginBottom: '.75rem' }}>
        طلبك وصل!
      </h1>
      <p style={{ color: 'rgba(28,43,49,.6)', fontSize: '.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
        سنراجع ملفك ونفعّله خلال 24 ساعة. ستتواصل معك الإدارة عبر واتساب.
      </p>

      {editLink && (
        <div style={{
          background: 'rgba(196,137,61,.08)',
          border: '1.5px solid rgba(196,137,61,.2)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--honey)', marginBottom: '.5rem' }}>
            رابط تعديل ملفك (احفظه!)
          </p>
          <a href={editLink} style={{
            color: 'var(--teal)',
            fontSize: '.82rem',
            fontWeight: 600,
            wordBreak: 'break-all',
            direction: 'ltr',
            display: 'inline-block',
          }}>
            {typeof window !== 'undefined' ? window.location.origin : 'makhboz.net'}{editLink}
          </a>
        </div>
      )}

      <a
        href="/"
        style={{
          display: 'inline-block',
          background: 'var(--teal)',
          color: 'var(--cream)',
          padding: '.85rem 2rem',
          borderRadius: '14px',
          fontWeight: 700,
          fontSize: '.95rem',
          fontFamily: 'inherit',
          textDecoration: 'none',
        }}
      >
        تصفح الخبازين
      </a>
    </div>
  )
}
