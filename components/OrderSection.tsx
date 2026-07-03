'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  weight_grams: number | null
  image_url: string | null
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  padding: '.7rem .95rem',
  fontSize: '.92rem',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
}

export default function OrderSection({ bakerId, products }: { bakerId: string; products: Product[] }) {
  const router = useRouter()
  const [qty, setQty] = useState<Record<string, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cart = Object.entries(qty).filter(([, q]) => q > 0)
  const total = cart.reduce((sum, [id, q]) => {
    const p = products.find(pr => pr.id === id)
    return sum + (p ? p.price * q : 0)
  }, 0)
  const itemCount = cart.reduce((s, [, q]) => s + q, 0)

  function setProductQty(id: string, value: number) {
    setQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(50, value)) }))
  }

  async function submit() {
    if (busy) return
    if (!name.trim() || !phone.trim()) {
      setError('الاسم ورقم الجوال مطلوبان')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bakerId,
          customerName: name,
          customerPhone: phone,
          note,
          cart: cart.map(([product_id, q]) => ({ product_id, qty: q })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ — حاول مرة أخرى')
        setBusy(false)
        return
      }
      router.push(`/order/${data.orderId}?t=${data.viewToken}`)
    } catch {
      setError('حدث خطأ في الاتصال — حاول مرة أخرى')
      setBusy(false)
    }
  }

  return (
    <>
      <h2 style={{
        fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)',
        letterSpacing: '-.01em', marginBottom: '.85rem',
        paddingTop: '1rem', borderTop: '1px solid var(--border)',
      }}>المنتجات</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem', marginBottom: itemCount > 0 ? '5.5rem' : '1rem' }}>
        {products.map((p) => {
          const q = qty[p.id] ?? 0
          return (
            <div key={p.id} style={{
              background: 'var(--cream)', borderRadius: '14px',
              padding: '.9rem 1rem', border: `1.5px solid ${q > 0 ? 'var(--honey)' : 'var(--border)'}`,
              display: 'flex', flexDirection: 'column',
            }}>
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '.6rem' }} />
              )}
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)', marginBottom: '.15rem' }}>{p.name}</div>
              {p.description && (
                <div style={{ fontSize: '.75rem', color: 'var(--mist)', marginBottom: '.55rem', lineHeight: 1.4 }}>{p.description}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', marginBottom: '.6rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--honey)', fontSize: '.95rem' }}>{p.price} ﷼</span>
                {p.weight_grams && (
                  <span style={{ fontSize: '.7rem', color: 'rgba(122,158,166,.7)' }}>{p.weight_grams} جرام</span>
                )}
              </div>
              {q === 0 ? (
                <button onClick={() => setProductQty(p.id, 1)} style={{
                  border: 'none', background: 'var(--teal)', color: 'var(--cream)',
                  borderRadius: '10px', padding: '.5rem', fontWeight: 800, fontSize: '.82rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>+ أطلب</button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '10px', border: '1.5px solid var(--border)' }}>
                  <button onClick={() => setProductQty(p.id, q - 1)} style={{
                    border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 800,
                    padding: '.35rem .8rem', cursor: 'pointer', color: 'var(--teal)', fontFamily: 'inherit',
                  }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{q}</span>
                  <button onClick={() => setProductQty(p.id, q + 1)} style={{
                    border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 800,
                    padding: '.35rem .8rem', cursor: 'pointer', color: 'var(--teal)', fontFamily: 'inherit',
                  }}>+</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* شريط السلة الثابت */}
      {itemCount > 0 && !showForm && (
        <div style={{
          position: 'fixed', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0,
          background: '#fff', borderTop: '1.5px solid var(--border)',
          boxShadow: '0 -8px 30px rgba(28,43,49,.1)', padding: '.9rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', zIndex: 50,
        }}>
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--mist)' }}>{itemCount} صنف</div>
            <div style={{ fontWeight: 900, color: 'var(--ink)', fontSize: '1.05rem' }}>{Math.round(total * 100) / 100} ﷼</div>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            border: 'none', background: 'var(--honey)', color: '#fff',
            borderRadius: '100px', padding: '.8rem 2rem', fontWeight: 800, fontSize: '.95rem',
            cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(196,137,61,.35)',
          }}>أكمل الطلب ←</button>
        </div>
      )}

      {/* نموذج الطلب */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(28,43,49,.45)', zIndex: 60,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget && !busy) setShowForm(false) }}>
          <div style={{
            background: '#fff', borderRadius: '24px 24px 0 0', padding: '1.5rem 1.25rem 2rem',
            width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)' }}>تأكيد الطلب</h3>
              <button onClick={() => !busy && setShowForm(false)} style={{
                border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mist)', fontFamily: 'inherit',
              }}>✕</button>
            </div>

            <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '.8rem 1rem', fontSize: '.82rem', color: 'var(--ink)' }}>
              {cart.map(([id, q]) => {
                const p = products.find(pr => pr.id === id)!
                return <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                  <span>{q}× {p.name}</span><span style={{ fontWeight: 700 }}>{Math.round(p.price * q * 100) / 100} ﷼</span>
                </div>
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '.4rem', marginTop: '.3rem', borderTop: '1px solid var(--border)', fontWeight: 800 }}>
                <span>الإجمالي</span><span style={{ color: 'var(--honey)' }}>{Math.round(total * 100) / 100} ﷼</span>
              </div>
            </div>

            <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك *" maxLength={60} style={inputStyle} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم جوالك * (05xxxxxxxx)" type="tel"
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة (اختياري): توصيل، استلام، وقت..." rows={2} maxLength={300}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />

            {error && (
              <p style={{ color: '#c44', fontSize: '.82rem', fontWeight: 700, textAlign: 'center' }}>{error}</p>
            )}

            <button onClick={submit} disabled={busy} style={{
              border: 'none', background: 'var(--teal)', color: 'var(--cream)',
              borderRadius: '14px', padding: '.95rem', fontWeight: 800, fontSize: '1rem',
              cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: busy ? .7 : 1,
              boxShadow: '0 6px 20px rgba(45,80,89,.25)',
            }}>
              {busy ? 'جاري إرسال الطلب...' : 'أرسل الطلب'}
            </button>
            <p style={{ fontSize: '.7rem', color: 'var(--mist)', textAlign: 'center' }}>
              بعد الإرسال سنجهز لك رسالة واتساب للخبازة لإتمام الاتفاق على التسليم والدفع
            </p>
          </div>
        </div>
      )}
    </>
  )
}
