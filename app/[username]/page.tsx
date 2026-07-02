import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 300

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('bakers')
    .select('display_name, city, bio')
    .eq('username', username)
    .single()
  if (!data) return { title: 'مخبوز' }
  return {
    title: `${data.display_name} — مخبوز`,
    description: data.bio ?? `خباز سوداني في ${data.city}`,
  }
}

export default async function BakerPage({ params }: Props) {
  const { username } = await params
  const supabase = createServerClient()

  const { data: baker } = await supabase
    .from('bakers')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (!baker) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('baker_id', baker.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  const whatsappLink = baker.whatsapp_number
    ? `https://wa.me/${baker.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، رأيت ملفك على مخبوز وأريد الطلب 🥐`)}`
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Baker header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#34565F]/10 flex-shrink-0">
          {baker.avatar_url ? (
            <Image src={baker.avatar_url} alt={baker.display_name} fill className="object-cover" />
          ) : (
            <span className="flex items-center justify-center h-full text-3xl">👩‍🍳</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#22333B]">{baker.display_name}</h1>
            {baker.is_verified && (
              <span className="text-[#C4893D] text-lg" title="موثق">✓</span>
            )}
          </div>
          <p className="text-[#34565F] text-sm">{baker.city}</p>
          {baker.bio && <p className="text-[#22333B]/70 mt-1 text-sm">{baker.bio}</p>}
        </div>
      </div>

      {/* WhatsApp CTA */}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-[#25D366] text-white py-3 rounded-2xl font-semibold text-lg mb-8 hover:opacity-90 transition"
        >
          تواصل عبر واتساب 💬
        </a>
      )}

      {/* Products */}
      <h2 className="text-xl font-bold text-[#22333B] mb-4">المنتجات</h2>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#34565F]/10">
              {p.image_url && (
                <div className="relative h-40 w-full">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-[#22333B]">{p.name}</h3>
                {p.description && <p className="text-sm text-[#22333B]/60 mt-1">{p.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#C4893D] font-bold">{p.price} ريال</span>
                  {p.weight_grams && (
                    <span className="text-xs text-[#22333B]/40">{p.weight_grams} جرام</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#22333B]/40 text-center py-10">لا توجد منتجات بعد</p>
      )}
    </div>
  )
}
