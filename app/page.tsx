import { createServerClient } from '@/lib/supabase/server'
import BakerCard from '@/components/BakerCard'
import HeroSearch from '@/components/HeroSearch'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; q?: string }>
}) {
  const { city, q } = await searchParams
  const supabase = createServerClient()

  let query = supabase
    .from('bakers')
    .select('id, username, display_name, city, bio, avatar_url, is_verified')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(48)

  if (city) query = query.eq('city', city)
  if (q) query = query.ilike('display_name', `%${q}%`)

  const { data: bakers } = await query

  const CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة']

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#34565F] mb-3">
          اكتشف خبازين سودانيين قريبين منك
        </h1>
        <p className="text-[#22333B]/70 text-lg mb-6">
          مخبوزات سودانية أصيلة — تواصل مع الخباز مباشرةً
        </p>
        <HeroSearch defaultCity={city} defaultQ={q} />
      </section>

      {/* City filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <a
          href="/"
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            !city
              ? 'bg-[#34565F] text-[#F4EFD1] border-[#34565F]'
              : 'border-[#34565F]/30 text-[#34565F] hover:border-[#34565F]'
          }`}
        >
          الكل
        </a>
        {CITIES.map((c) => (
          <a
            key={c}
            href={`/?city=${encodeURIComponent(c)}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              city === c
                ? 'bg-[#34565F] text-[#F4EFD1] border-[#34565F]'
                : 'border-[#34565F]/30 text-[#34565F] hover:border-[#34565F]'
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {/* Baker grid */}
      {bakers && bakers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {bakers.map((baker) => (
            <BakerCard key={baker.id} baker={baker} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[#22333B]/40">
          <p className="text-5xl mb-4">🥐</p>
          <p className="text-lg">لا يوجد خبازون في هذه المنطقة بعد</p>
        </div>
      )}
    </div>
  )
}
