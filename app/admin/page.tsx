import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminActions from './AdminActions'
import ReviewActions from './ReviewActions'

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
    .select('id, username, display_name, city, whatsapp_number, is_active, is_verified, created_at, edit_token')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('is_active', false)
  if (filter === 'active') query = query.eq('is_active', true)

  const { data: bakers } = await query

  const { data: eventStats } = await supabase.rpc('click_event_stats')
  const stats = new Map<string, { views: number; clicks: number }>()
  for (const row of (eventStats ?? []) as { baker_id: string; event_type: string; cnt: number }[]) {
    const s = stats.get(row.baker_id) ?? { views: 0, clicks: 0 }
    if (row.event_type === 'profile_view') s.views += Number(row.cnt)
    if (row.event_type === 'whatsapp_click') s.clicks += Number(row.cnt)
    stats.set(row.baker_id, s)
  }

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_code, baker_id, customer_name, total, created_at, bakers(display_name)')
    .order('created_at', { ascending: false })
    .limit(20)
  const orderCounts = new Map<string, number>()
  {
    const { data: allOrders } = await supabase.rpc('order_counts_per_baker')
    for (const row of (allOrders ?? []) as { baker_id: string; cnt: number }[]) {
      orderCounts.set(row.baker_id, Number(row.cnt))
    }
  }

  const { data: pendingReviews } = await supabase
    .from('reviews')
    .select('id, baker_id, customer_name, rating, comment, created_at, bakers(display_name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

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
                {' · '}
                👁 {stats.get(baker.id)?.views ?? 0} مشاهدة
                {' · '}
                💬 {stats.get(baker.id)?.clicks ?? 0} نقرة واتساب
                {' · '}
                🧾 {orderCounts.get(baker.id) ?? 0} طلب
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', alignItems: 'flex-end' }}>
              <AdminActions
                bakerId={baker.id}
                isActive={baker.is_active}
                isVerified={baker.is_verified}
                secret={secret!}
              />
              <a
                href={`https://wa.me/${baker.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `مبروك! 🎉 ملفك على مخبوز صار مباشر.\n\nرابط ملفك: https://makhboz.net/${baker.username}\nرابط تعديل ملفك (احفظه ولا تشاركه): https://makhboz.net/edit?token=${baker.edit_token}\n\nشارك رابط ملفك مع عملائك واستقبل الطلبات عبر واتساب مباشرة.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '.72rem', fontWeight: 700, color: '#25D366',
                  textDecoration: 'none', background: 'rgba(37,211,102,.08)',
                  padding: '.3rem .7rem', borderRadius: '100px',
                }}
              >
                💬 أرسل رسالة التفعيل
              </a>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--mist)' }}>لا يوجد خبازون</div>
        )}
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
            آخر الطلبات ({recentOrders.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {recentOrders.map((o) => (
              <div key={o.id} style={{
                background: '#fff',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                padding: '.8rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                fontSize: '.82rem',
              }}>
                <span style={{ fontWeight: 800, color: 'var(--ink)', direction: 'ltr' }}>#{o.order_code}</span>
                <span style={{ color: 'var(--mist)' }}>
                  {o.customer_name} ← {(o.bakers as unknown as { display_name: string })?.display_name ?? '—'}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--honey)' }}>{o.total} ﷼</span>
                <span style={{ fontSize: '.7rem', color: 'rgba(28,43,49,.35)' }}>
                  {new Date(o.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingReviews && pendingReviews.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
            تقييمات بانتظار المراجعة ({pendingReviews.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {pendingReviews.map((r) => (
              <div key={r.id} style={{
                background: '#fff',
                border: '1.5px solid rgba(196,137,61,.35)',
                borderRadius: '12px',
                padding: '1rem 1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '.9rem' }}>
                    {r.customer_name}
                    <span style={{ color: 'var(--honey)', marginRight: '.5rem', direction: 'ltr', display: 'inline-block' }}>
                      {'★'.repeat(r.rating)}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--mist)', marginTop: '.15rem' }}>
                    عن: {(r.bakers as unknown as { display_name: string })?.display_name ?? '—'}
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: '.82rem', color: 'rgba(28,43,49,.6)', marginTop: '.3rem', lineHeight: 1.5 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
                <ReviewActions reviewId={r.id} secret={secret!} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
