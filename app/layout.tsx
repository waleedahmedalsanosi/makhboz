import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مخبوز — اكتشف خبازين سودانيين قريبين منك',
  description: 'سوق المخبوزات السودانية — ابحث عن خبازين محليين واطلب مباشرةً',
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
  themeColor: '#34565F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <nav className="sticky top-0 z-50 bg-[#34565F] text-[#F4EFD1] px-4 py-3 flex items-center justify-between shadow-sm">
          <a href="/" className="font-bold text-xl font-serif">مخبوز</a>
          <a
            href="/join"
            className="text-sm bg-[#C4893D] text-white px-4 py-1.5 rounded-full hover:opacity-90 transition"
          >
            انضم كخباز
          </a>
        </nav>
        <main>{children}</main>
        <footer className="mt-16 bg-[#22333B] text-[#F4EFD1]/60 text-center py-6 text-sm">
          مخبوز © {new Date().getFullYear()} — المملكة العربية السعودية
        </footer>
      </body>
    </html>
  )
}
