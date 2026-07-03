'use client'

export default function WhatsAppButton({ bakerId, href }: { bakerId: string; href: string }) {
  function handleClick() {
    navigator.sendBeacon?.(
      '/api/track',
      new Blob([JSON.stringify({ bakerId, event: 'whatsapp_click' })], { type: 'application/json' })
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '.6rem', background: '#25D366', color: '#fff',
        padding: '.95rem', borderRadius: '14px', fontWeight: 800,
        fontSize: '1rem', textDecoration: 'none', letterSpacing: '.01em',
        boxShadow: '0 6px 20px rgba(37,211,102,.3)', marginBottom: '1.6rem',
      }}
    >
      💬 تواصل عبر واتساب
    </a>
  )
}
