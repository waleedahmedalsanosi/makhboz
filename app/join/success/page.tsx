export default function JoinSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-6">🥐</p>
      <h1 className="text-3xl font-bold text-[#34565F] mb-3">طلبك وصل!</h1>
      <p className="text-[#22333B]/70 mb-8">
        سنراجع ملفك ونفعّله خلال 24 ساعة. ستتواصل معك الإدارة عبر واتساب.
      </p>
      <a
        href="/"
        className="inline-block bg-[#34565F] text-[#F4EFD1] px-8 py-3 rounded-2xl font-semibold hover:opacity-90 transition"
      >
        تصفح الخبازين
      </a>
    </div>
  )
}
