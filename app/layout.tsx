import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مخبوز — اكتشف خبازين سودانيين قريبين منك',
  description: 'سوق المخبوزات السودانية — ابحث عن خبازين محليين وتواصل معهم مباشرةً',
  metadataBase: new URL('https://makhboz.net'),
  openGraph: {
    title: 'مخبوز',
    description: 'اكتشف خبازين سودانيين قريبين منك',
    locale: 'ar_SA',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2D5059',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <nav style={{
          background: 'var(--teal)',
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}>
          <a
            href="/"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--cream)',
              letterSpacing: '-.02em',
              textDecoration: 'none',
            }}
          >
            مخ<span style={{ color: 'var(--honey2)' }}>بوز</span>
          </a>
          <a
            href="/join"
            style={{
              background: 'var(--honey)',
              color: '#fff',
              fontSize: '.82rem',
              fontWeight: 700,
              padding: '.5rem 1.2rem',
              borderRadius: '100px',
              textDecoration: 'none',
            }}
          >
            انضم كخباز
          </a>
        </nav>
        <main>{children}</main>
        <footer style={{
          background: 'var(--ink)',
          padding: '1.6rem',
          textAlign: 'center',
          fontSize: '.8rem',
          color: 'rgba(245,240,216,.35)',
        }}>
          <strong style={{ color: 'rgba(245,240,216,.65)' }}>مخبوز</strong> © 2026 — المملكة العربية السعودية
        </footer>
      </body>
    </html>
  )
}
