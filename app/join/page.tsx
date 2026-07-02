export default function JoinPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#34565F] mb-2 text-center">انضم كخباز</h1>
      <p className="text-center text-[#22333B]/60 mb-8">أنشئ ملفك واعرض منتجاتك للمشترين في السعودية</p>

      <form
        action="/api/bakers/register"
        method="POST"
        className="bg-white rounded-3xl shadow-sm border border-[#34565F]/10 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#22333B] mb-1">الاسم الكامل *</label>
          <input
            name="display_name"
            required
            className="w-full border border-[#34565F]/20 rounded-xl px-4 py-2.5 text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#34565F]/30"
            placeholder="مثال: فاطمة أحمد"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#22333B] mb-1">اسم المستخدم (رابط ملفك) *</label>
          <div className="flex items-center border border-[#34565F]/20 rounded-xl overflow-hidden">
            <span className="px-3 py-2.5 bg-[#F4EFD1] text-[#22333B]/50 text-sm border-l border-[#34565F]/20">makhboz.net/</span>
            <input
              name="username"
              required
              pattern="[a-z0-9_-]+"
              className="flex-1 px-3 py-2.5 text-[#22333B] focus:outline-none"
              placeholder="fatima_ahmad"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#22333B] mb-1">رقم واتساب *</label>
          <input
            name="whatsapp_number"
            required
            type="tel"
            className="w-full border border-[#34565F]/20 rounded-xl px-4 py-2.5 text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#34565F]/30"
            placeholder="+966 5X XXX XXXX"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#22333B] mb-1">المدينة *</label>
          <select
            name="city"
            required
            className="w-full border border-[#34565F]/20 rounded-xl px-4 py-2.5 text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#34565F]/30 bg-white"
          >
            <option value="">اختر مدينتك</option>
            <option>الرياض</option>
            <option>جدة</option>
            <option>الدمام</option>
            <option>مكة المكرمة</option>
            <option>المدينة المنورة</option>
            <option>أخرى</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#22333B] mb-1">نبذة عنك</label>
          <textarea
            name="bio"
            rows={3}
            className="w-full border border-[#34565F]/20 rounded-xl px-4 py-2.5 text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#34565F]/30 resize-none"
            placeholder="أخبر المشترين عن مخبوزاتك وخبرتك..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#34565F] text-[#F4EFD1] py-3 rounded-2xl font-semibold text-lg hover:opacity-90 transition"
        >
          أنشئ ملفي
        </button>
      </form>
    </div>
  )
}
