'use client'

import { useState } from 'react'

type Review = {
  id: string
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}

function Stars({ value, size = '.9rem' }: { value: number; size?: string }) {
  return (
    <span style={{ color: 'var(--honey)', fontSize: size, letterSpacing: '.1em', direction: 'ltr', display: 'inline-block' }}>
      {'★'.repeat(value)}<span style={{ opacity: .25 }}>{'★'.repeat(5 - value)}</span>
    </span>
  )
}

export default function ReviewSection({ bakerId, reviews }: { bakerId: string; reviews: Review[] }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  async function submit() {
    if (!name.trim() || rating < 1) {
      setError('الاسم والتقييم مطلوبان')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bakerId, customerName: name, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        setBusy(false)
        return
      }
      setDone(true)
    } catch {
      setError('حدث خطأ في الاتصال')
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '1.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>
          التقييمات
          {reviews.length > 0 && (
            <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--mist)', marginRight: '.5rem' }}>
              {avg} <Stars value={Math.round(avg)} size=".75rem" /> ({reviews.length})
            </span>
          )}
        </h2>
        {!showForm && !done && (
          <button onClick={() => setShowForm(true)} style={{
            background: 'none', border: '1.5px solid var(--border)', borderRadius: '100px',
            padding: '.35rem .9rem', fontSize: '.78rem', fontWeight: 700, color: 'var(--teal)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            + أضف تقييمك
          </button>
        )}
      </div>

      {done && (
        <div style={{
          padding: '.9rem', borderRadius: '12px', background: 'rgba(45,80,89,.08)',
          color: 'var(--teal)', fontSize: '.85rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem',
        }}>
          شكراً! تقييمك بانتظار المراجعة وسينشر قريباً.
        </div>
      )}

      {showForm && !done && (
        <div style={{
          background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: '16px',
          padding: '1.1rem', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.8rem',
        }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="اسمك"
            maxLength={60}
            style={{
              border: '1.5px solid var(--border)', borderRadius: '10px', padding: '.65rem .9rem',
              fontSize: '.88rem', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none', background: '#fff',
            }}
          />
          <div style={{ display: 'flex', gap: '.3rem', justifyContent: 'center', direction: 'ltr' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer',
                color: n <= rating ? 'var(--honey)' : 'rgba(28,43,49,.15)', padding: '.1rem',
              }}>★</button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="تجربتك مع هذا الخباز (اختياري)"
            rows={2}
            maxLength={500}
            style={{
              border: '1.5px solid var(--border)', borderRadius: '10px', padding: '.65rem .9rem',
              fontSize: '.88rem', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
              background: '#fff', resize: 'none', lineHeight: 1.6,
            }}
          />
          {error && <p style={{ color: '#c44', fontSize: '.8rem', fontWeight: 700, textAlign: 'center' }}>{error}</p>}
          <button onClick={submit} disabled={busy} style={{
            background: 'var(--teal)', color: 'var(--cream)', border: 'none', borderRadius: '10px',
            padding: '.7rem', fontSize: '.9rem', fontWeight: 800, fontFamily: 'inherit',
            cursor: busy ? 'wait' : 'pointer', opacity: busy ? .7 : 1,
          }}>
            {busy ? 'جاري الإرسال...' : 'أرسل التقييم'}
          </button>
        </div>
      )}

      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '.9rem 1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)' }}>{r.customer_name}</span>
                <Stars value={r.rating} />
              </div>
              {r.comment && (
                <p style={{ fontSize: '.82rem', color: 'rgba(28,43,49,.6)', lineHeight: 1.6 }}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : !showForm && !done && (
        <p style={{ fontSize: '.82rem', color: 'rgba(28,43,49,.35)', textAlign: 'center', padding: '.5rem 0 1rem' }}>
          لا توجد تقييمات بعد — كن أول من يقيّم
        </p>
      )}
    </div>
  )
}
