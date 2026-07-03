import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_CITIES = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة']
const VALID_CATEGORIES = ['كسرة', 'عيش', 'بسبوسة', 'دكوة', 'قرقوش', 'أخرى']

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { token, baker: bakerFields, products } = body

  if (!token) {
    return NextResponse.json({ error: 'رمز غير صالح' }, { status: 400 })
  }

  if (!bakerFields?.display_name?.trim() || !bakerFields?.whatsapp_number?.trim()) {
    return NextResponse.json({ error: 'الاسم ورقم الواتساب مطلوبان' }, { status: 400 })
  }

  if (bakerFields.city && !VALID_CITIES.includes(bakerFields.city)) {
    return NextResponse.json({ error: 'مدينة غير صالحة' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: baker } = await supabase
    .from('bakers')
    .select('id, username')
    .eq('edit_token', token)
    .single()

  if (!baker) {
    return NextResponse.json({ error: 'رمز غير صالح' }, { status: 404 })
  }

  const { error: bakerError } = await supabase
    .from('bakers')
    .update({
      display_name: bakerFields.display_name.trim(),
      city: bakerFields.city,
      bio: bakerFields.bio?.trim() || null,
      whatsapp_number: bakerFields.whatsapp_number.trim(),
    })
    .eq('id', baker.id)

  if (bakerError) {
    return NextResponse.json({ error: 'خطأ في تحديث البيانات' }, { status: 500 })
  }

  const errors: string[] = []

  if (products && Array.isArray(products)) {
    for (const product of products) {
      if (!product._delete && (!product.name?.trim() || product.price < 0)) continue

      if (product.category && !VALID_CATEGORIES.includes(product.category)) {
        product.category = 'أخرى'
      }

      let result
      if (product._delete && product.id) {
        result = await supabase.from('products').delete().eq('id', product.id).eq('baker_id', baker.id)
      } else if (product.id) {
        result = await supabase.from('products').update({
          name: product.name.trim(),
          price: Math.max(0, Number(product.price)),
          weight_grams: product.weight_grams ? Math.max(0, Number(product.weight_grams)) : null,
          category: product.category || 'أخرى',
          is_available: product.is_available,
        }).eq('id', product.id).eq('baker_id', baker.id)
      } else if (!product._delete) {
        result = await supabase.from('products').insert({
          baker_id: baker.id,
          name: product.name.trim(),
          price: Math.max(0, Number(product.price)),
          weight_grams: product.weight_grams ? Math.max(0, Number(product.weight_grams)) : null,
          category: product.category || 'أخرى',
          is_available: product.is_available,
        })
      }

      if (result?.error) {
        errors.push(`${product.name}: ${result.error.message}`)
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: true, username: baker.username, warnings: errors })
  }

  return NextResponse.json({ ok: true, username: baker.username })
}
