import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { buildOrderWhatsAppText, type OrderItem } from '@/lib/orders'

export const revalidate = 0

export const metadata = { title: 'طلبك — مخبوز', robots: { index: false } }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params
  const { t } = await searchParams
  if (!t) notFound()

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_code, customer_name, items, total, note, view_token, created_at, bakers(display_name, whatsapp_number, username)')
    .eq('id', id)
    .eq('view_token', t)
    .single()

  if (!order) notFound()

  const baker = order.bakers as unknown as { display_name: string; whatsapp_number: string; username: string }
  const items = order.items as OrderItem[]

  const waText = buildOrderWhatsAppText({
    order_code: order.order_code,
    items,
    total: order.total,
    customer_name: order.customer_name,
    note: order.note,
    id: order.id,
    view_token: order.view_token,
  })
  const waLink = `https://wa.me/${baker.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.25rem 4rem', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem', marginBottom: '.8rem' }}>🧾</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--teal)', marginBottom: '.3rem' }}>
        طلبك جاهز للإرسال
      </h1>
      <p style={{ color: 'var(--mist)', fontSize: '.85rem', marginBottom: '1.6rem' }}>
        رقم الطلب: <strong style={{ color: 'var(--ink)', direction: 'ltr', display: 'inline-block' }}>#{order.order_code}</strong>
      </p>

      <div style={{
        background: 'rgba(196,137,61,.08)',
        border: '1.5px solid rgba(196,137,61,.3)',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '1.4rem',
        fontSize: '.85rem',
        fontWeight: 700,
        color: 'var(--honey)',
        lineHeight: 1.6,
      }}>
        ⚠️ طلبك لا يصل للخبازة إلا بإرسال رسالة الواتساب — اضغط الزر الأخضر بالأسفل
      </div>

      <div style={{
        background: '#fff', border: '1.5px solid var(--border)', borderRadius: '16px',
        padding: '1.2rem', textAlign: 'right', marginBottom: '1.4rem',
      }}>
        <div style={{ fontSize: '.8rem', color: 'var(--mist)', marginBottom: '.6rem' }}>
          الطلب من: <strong style={{ color: 'var(--ink)' }}>{baker.display_name}</strong>
        </div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: 'var(--ink)', marginBottom: '.3rem' }}>
            <span>{item.qty}× {item.name}</span>
            <span style={{ fontWeight: 700 }}>{Math.round(item.price * item.qty * 100) / 100} ﷼</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontWeight: 900,
          paddingTop: '.6rem', marginTop: '.4rem', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--ink)' }}>الإجمالي</span>
          <span style={{ color: 'var(--honey)' }}>{order.total} ﷼</span>
        </div>
        {order.note && (
          <p style={{ fontSize: '.78rem', color: 'var(--mist)', marginTop: '.6rem' }}>ملاحظة: {order.note}</p>
        )}
      </div>

      <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
        background: '#25D366', color: '#fff', padding: '1rem', borderRadius: '14px',
        fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(37,211,102,.35)', marginBottom: '1rem',
      }}>
        💬 أرسل الطلب للخبازة عبر واتساب
      </a>

      <a href={`/${baker.username}`} style={{ fontSize: '.82rem', color: 'var(--mist)', textDecoration: 'none' }}>
        ← الرجوع لملف {baker.display_name}
      </a>
    </div>
  )
}
