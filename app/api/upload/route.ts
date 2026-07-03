import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const token = formData.get('token') as string | null

    if (!file || !bucket || !token) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: file, bucket, token' },
        { status: 400 }
      )
    }

    if (bucket !== 'avatars' && bucket !== 'products') {
      return NextResponse.json(
        { error: 'bucket غير صالح' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز الحد الأقصى (5 ميغابايت)' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Validate token against bakers table
    const { data: baker, error: bakerError } = await supabase
      .from('bakers')
      .select('id')
      .eq('edit_token', token)
      .single()

    if (bakerError || !baker) {
      return NextResponse.json(
        { error: 'رمز التعديل غير صالح' },
        { status: 401 }
      )
    }

    // Build file path: {baker_id}/{timestamp}.{ext}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${baker.id}/${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'فشل رفع الملف: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
