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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: events } = await supabase
    .from('click_events')
    .select('event_type, created_at')
    .eq('baker_id', baker.id)

  const views = events?.filter(e => e.event_type === 'profile_view').length ?? 0
  const clicks = events?.filter(e => e.event_type === 'whatsapp_click').length ?? 0
  const viewsWeek = events?.filter(e => e.event_type === 'profile_view' && e.created_at >= weekAgo).length ?? 0
  const clicksWeek = events?.filter(e => e.event_type === 'whatsapp_click' && e.created_at >= weekAgo).length ?? 0

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

      {baker.is_active && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '👁', label: 'مشاهدات ملفك', total: views, week: viewsWeek, color: 'var(--teal)' },
            { icon: '💬', label: 'نقرات واتساب', total: clicks, week: clicksWeek, color: '#25D366' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '1rem 1.1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: s.color }}>
                {s.icon} {s.total}
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--mist)', marginTop: '.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '.68rem', color: 'rgba(28,43,49,.3)', marginTop: '.15rem' }}>
                {s.week} آخر 7 أيام
              </div>
            </div>
          ))}
        </div>
      )}

      <EditProfileForm baker={baker} products={products || []} token={token} />
    </div>
  )
}
