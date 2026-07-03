import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import EditProfileForm from './EditProfileForm'

export const revalidate = 0

type Props = { searchParams: Promise<{ token?: string }> }

export default async function EditPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) redirect('/')

  const supabase = createAdminClient()

  const { data: baker } = await supabase
    .from('bakers')
    .select('*')
    .eq('edit_token', token)
    .single()

  if (!baker) redirect('/')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('baker_id', baker.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--teal)', letterSpacing: '-.02em', marginBottom: '.4rem' }}>
          تعديل ملفك
        </h1>
        <p style={{ color: 'rgba(28,43,49,.5)', fontSize: '.9rem' }}>
          {baker.display_name} — @{baker.username}
        </p>
      </div>
      <EditProfileForm baker={baker} products={products || []} token={token} />
    </div>
  )
}
