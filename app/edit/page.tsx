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
  const countEvents = (type: string, since?: string) => {
    let q = supabase
      .from('click_events')
      .select('id', { count: 'exact', head: true })
      .eq('baker_id', baker.id)
      .eq('event_type', type)
    if (since) q = q.gte('created_at', since)
    return q
  }
  const [{ count: views }, { count: clicks }, { count: viewsWeek }, { count: clicksWeek }, { data: orders }] = await Promise.all([
    countEvents('profile_view'),
    countEvents('whatsapp_click'),
    countEvents('profile_view', weekAgo),
    countEvents('whatsapp_click', weekAgo),
    supabase
      .from('orders')
      .select('id, order_code, customer_name, customer_phone, items, total, note, created_at')
      .eq('baker_id', baker.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

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
            { icon: '👁', label: 'مشاهدات ملفك', total: views ?? 0, week: viewsWeek ?? 0, color: 'var(--teal)' },
            { icon: '💬', label: 'نقرات واتساب', total: clicks ?? 0, week: clicksWeek ?? 0, color: '#25D366' },
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

      {baker.is_active && orders && orders.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            🧾 الطلبات الواردة ({orders.length})
          </h2>
          <p style={{ fontSize: '.72rem', color: 'var(--mist)', marginBottom: '.75rem', lineHeight: 1.6 }}>
            هذه نسخة مسجلة من الطلبات — التأكيد والاتفاق يتم في واتساب. افتحي هذه الصفحة يومياً حتى لا يفوتك طلب.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {orders.map((o) => (
              <div key={o.id} style={{
                background: '#fff', border: '1.5px solid var(--border)', borderRadius: '14px',
                padding: '.9rem 1.1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '.85rem', color: 'var(--ink)', direction: 'ltr' }}>#{o.order_code}</span>
                  <span style={{ fontSize: '.7rem', color: 'rgba(28,43,49,.35)' }}>
                    {new Date(o.created_at).toLocaleDateString('ar-SA')} {new Date(o.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--ink)', marginBottom: '.3rem' }}>
                  {(o.items as { qty: number; name: string }[]).map(i => `${i.qty}× ${i.name}`).join('، ')}
                  {' — '}
                  <strong style={{ color: 'var(--honey)' }}>{o.total} ﷼</strong>
                </div>
                {o.note && <div style={{ fontSize: '.75rem', color: 'var(--mist)', marginBottom: '.3rem' }}>ملاحظة: {o.note}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.78rem', color: 'var(--mist)' }}>{o.customer_name}</span>
                  <a
                    href={`https://wa.me/${o.customer_phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '.72rem', fontWeight: 700, color: '#25D366', textDecoration: 'none',
                      background: 'rgba(37,211,102,.08)', padding: '.28rem .7rem', borderRadius: '100px',
                    }}
                  >💬 تواصلي مع العميل</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EditProfileForm baker={baker} products={products || []} token={token} />
    </div>
  )
}
