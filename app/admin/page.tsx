import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminActions from './AdminActions'

export const revalidate = 0

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; filter?: string }>
}) {
  const { secret, filter } = await searchParams

  if (secret !== process.env.ADMIN_SECRET) {
    redirect('/')
  }

  const supabase = createAdminClient()

  let query = supabase
    .from('bakers')
    .select('id, username, display_name, city, whatsapp_number, is_active, is_verified, created_at')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('is_active', false)
  if (filter === 'active') query = query.eq('is_active', true)

  const { data: bakers } = await query

  const total = bakers?.length ?? 0
  const active = bakers?.filter(b => b.is_active).length ?? 0
  const pending = bakers?.filter(b => !b.is_active).length ?? 0

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '.3rem' }}>
        لوحة الإدارة
      </h1>
      <p style={{ color: 'var(--mist)', fontSize: '.85rem', marginBottom: '2rem' }}>مخبوز — إدارة الخبازين</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'إجمالي', value: total, color: 'var(--teal)' },
          { label: 'نشط', value: active, color: '#16a34a' },
          { label: 'انتظار', value: pending, color: 'var(--honey)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            padding: '1.2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--mist)', marginTop: '.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'الكل', value: '' },
          { label: 'انتظار التفعيل', value: 'pending' },
          { label: 'نشط', value: 'active' },
        ].map(({ label, value }) => (
          <a
            key={value}
            href={`/admin?secret=${secret}${value ? `&filter=${value}` : ''}`}
            style={{
              padding: '.4rem 1rem',
              borderRadius: '100px',
              fontSize: '.8rem',
              fontWeight: 600,
              border: `1.5px solid ${filter === value || (!filter && !value) ? 'var(--teal)' : 'var(--border)'}`,
              color: filter === value || (!filter && !value) ? 'var(--cream)' : 'var(--teal)',
              background: filter === value || (!filter && !value) ? 'var(--teal)' : '#fff',
              textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {bakers && bakers.length > 0 ? bakers.map((baker) => (
          <div key={baker.id} style={{
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: baker.is_active ? '#16a34a' : '#f59e0b',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '.95rem' }}>
                {baker.display_name}
                {baker.is_verified && <span style={{ marginRight: '.4rem', color: 'var(--honey)', fontSize: '.75rem' }}>موثّق ✓</span>}
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--mist)', marginTop: '.15rem' }}>
                @{baker.username} · {baker.city} · {baker.whatsapp_number}
              </div>
              <div style={{ fontSize: '.72rem', color: 'rgba(28,43,49,.3)', marginTop: '.1rem' }}>
                {new Date(baker.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
            <AdminActions
              bakerId={baker.id}
              isActive={baker.is_active}
              isVerified={baker.is_verified}
              secret={secret!}
            />
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--mist)' }}>لا يوجد خبازون</div>
        )}
      </div>
    </div>
  )
}
