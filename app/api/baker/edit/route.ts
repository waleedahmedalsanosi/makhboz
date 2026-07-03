import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { token, baker: bakerFields, products } = body

  if (!token) {
    return NextResponse.json({ error: 'رمز غير صالح' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Find baker by edit_token
  const { data: baker } = await supabase
    .from('bakers')
    .select('id, username')
    .eq('edit_token', token)
    .single()

  if (!baker) {
    return NextResponse.json({ error: 'رمز غير صالح' }, { status: 404 })
  }

  // Update baker fields
  const { error: bakerError } = await supabase
    .from('bakers')
    .update({
      display_name: bakerFields.display_name,
      city: bakerFields.city,
      bio: bakerFields.bio || null,
      whatsapp_number: bakerFields.whatsapp_number,
    })
    .eq('id', baker.id)

  if (bakerError) {
    return NextResponse.json({ error: 'خطأ في تحديث البيانات' }, { status: 500 })
  }

  // Process products
  if (products && Array.isArray(products)) {
    for (const product of products) {
      if (product._delete && product.id) {
        // Delete
        await supabase.from('products').delete().eq('id', product.id).eq('baker_id', baker.id)
      } else if (product.id) {
        // Update existing
        await supabase.from('products').update({
          name: product.name,
          price: product.price,
          weight_grams: product.weight_grams,
          category: product.category,
          is_available: product.is_available,
        }).eq('id', product.id).eq('baker_id', baker.id)
      } else if (!product._delete) {
        // Insert new
        await supabase.from('products').insert({
          baker_id: baker.id,
          name: product.name,
          price: product.price,
          weight_grams: product.weight_grams,
          category: product.category,
          is_available: product.is_available,
        })
      }
    }
  }

  return NextResponse.json({ ok: true, username: baker.username })
}
