'use client'

type Baker = {
  id: string
  username: string
  display_name: string
  city: string
  bio: string | null
  avatar_url: string | null
  is_verified: boolean
}

export default function BakerCard({ baker }: { baker: Baker }) {
  return (
    <a
      href={`/${baker.username}`}
      style={{
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = '0 20px 50px rgba(30,50,58,.13)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* Image area */}
      <div style={{
        height: '170px',
        background: 'linear-gradient(145deg, var(--teal2) 0%, var(--teal) 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
        overflow: 'hidden',
      }}>
        {baker.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={baker.avatar_url} alt={baker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>👩‍🍳</span>
        )}

        {/* shimmer overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'repeating-linear-gradient(60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 30px)',
            'repeating-linear-gradient(-60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 30px)',
          ].join(','),
          pointerEvents: 'none',
        }} />

        {baker.is_verified && (
          <span style={{
            position: 'absolute',
            top: '.7rem',
            left: '.7rem',
            background: 'var(--honey)',
            color: '#fff',
            fontSize: '.68rem',
            fontWeight: 700,
            padding: '.22rem .6rem',
            borderRadius: '100px',
            letterSpacing: '.04em',
          }}>موثّق ✓</span>
        )}

        <span style={{
          position: 'absolute',
          bottom: '.7rem',
          right: '.7rem',
          background: 'rgba(28,43,49,.55)',
          backdropFilter: 'blur(6px)',
          color: 'rgba(245,240,216,.9)',
          fontSize: '.72rem',
          fontWeight: 600,
          padding: '.25rem .65rem',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,.12)',
        }}>📍 {baker.city}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.1rem .2rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em', marginBottom: '.35rem' }}>
          {baker.display_name}
        </div>
        {baker.bio && (
          <p style={{
            fontSize: '.84rem',
            color: 'rgba(28,43,49,.55)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>{baker.bio}</p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '.8rem 1.1rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border)',
        marginTop: '.8rem',
      }}>
        <span style={{ fontSize: '.76rem', color: 'var(--mist)', fontWeight: 500 }}>عرض المنتجات</span>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.3rem',
          fontSize: '.76rem',
          color: '#25D366',
          fontWeight: 700,
          background: 'rgba(37,211,102,.08)',
          padding: '.28rem .7rem',
          borderRadius: '100px',
        }}>
          <span style={{ width: '6px', height: '6px', background: '#25D366', borderRadius: '50%', display: 'inline-block' }} />
          واتساب
        </span>
      </div>
    </a>
  )
}
