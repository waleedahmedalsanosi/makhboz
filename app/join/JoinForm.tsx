'use client'

import { useRef, useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  padding: '.75rem 1rem',
  fontSize: '.95rem',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.82rem',
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: '.4rem',
}

export default function JoinForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otpCode, setOtpCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const form = formRef.current!
    const phone = (form.elements.namedItem('whatsapp_number') as HTMLInputElement).value

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()

      if (data.enabled === false) {
        form.submit()
        return
      }
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        setBusy(false)
        return
      }
      setStep('otp')
      setBusy(false)
    } catch {
      form.submit()
    }
  }

  async function handleVerify() {
    setError(null)
    setBusy(true)
    const form = formRef.current!
    const phone = (form.elements.namedItem('whatsapp_number') as HTMLInputElement).value

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'رمز خاطئ')
        setBusy(false)
        return
      }
      form.submit()
    } catch {
      setError('حدث خطأ في الاتصال')
      setBusy(false)
    }
  }

  return (
    <form
      ref={formRef}
      action="/api/bakers/register"
      method="POST"
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: '24px',
        border: '1.5px solid var(--border)',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(28,43,49,.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
      }}
    >
      <div style={{ display: step === 'otp' ? 'none' : 'contents' }}>
        <div>
          <label style={labelStyle}>الاسم الكامل *</label>
          <input name="display_name" required placeholder="مثال: فاطمة أحمد" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>رابط ملفك *</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <span style={{ padding: '.75rem 1rem', background: 'var(--cream)', color: 'rgba(28,43,49,.4)', fontSize: '.85rem', borderLeft: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>
              makhboz.net/
            </span>
            <input name="username" required pattern="[a-z0-9_-]+" placeholder="fatima_ahmad"
              style={{ flex: 1, border: 'none', padding: '.75rem 1rem', fontSize: '.95rem', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none', direction: 'ltr' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>رقم واتساب *</label>
          <input name="whatsapp_number" required type="tel" placeholder="+966 5X XXX XXXX"
            style={{ ...inputStyle, direction: 'ltr' }} />
        </div>

        <div>
          <label style={labelStyle}>المدينة *</label>
          <select name="city" required style={{ ...inputStyle, cursor: 'pointer' }} defaultValue="">
            <option value="" disabled>اختر مدينتك</option>
            <option>الرياض</option>
            <option>جدة</option>
            <option>الدمام</option>
            <option>مكة المكرمة</option>
            <option>المدينة المنورة</option>
            <option>أخرى</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>نبذة عنك</label>
          <textarea name="bio" rows={3} placeholder="أخبر المشترين عن مخبوزاتك وخبرتك..."
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        </div>
      </div>

      {step === 'otp' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '.9rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '.4rem' }}>
            أدخل رمز التحقق
          </p>
          <p style={{ fontSize: '.8rem', color: 'var(--mist)', marginBottom: '1rem' }}>
            أرسلنا رمزاً من 6 أرقام إلى واتسابك
          </p>
          <input
            value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="······"
            style={{
              ...inputStyle,
              direction: 'ltr',
              textAlign: 'center',
              fontSize: '1.4rem',
              letterSpacing: '.4em',
              fontWeight: 800,
              maxWidth: '220px',
              margin: '0 auto',
            }}
          />
          <button
            type="button"
            onClick={() => setStep('form')}
            style={{ background: 'none', border: 'none', color: 'var(--mist)', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '.8rem', display: 'block', marginInline: 'auto' }}
          >
            ← تعديل البيانات
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '.8rem',
          borderRadius: '12px',
          background: 'rgba(200,60,60,.08)',
          color: '#c44',
          fontSize: '.85rem',
          fontWeight: 700,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {step === 'form' ? (
        <button
          type="submit"
          disabled={busy}
          style={{
            background: 'var(--teal)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: '14px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 800,
            fontFamily: 'inherit',
            cursor: busy ? 'wait' : 'pointer',
            letterSpacing: '.01em',
            boxShadow: '0 6px 20px rgba(45,80,89,.25)',
            marginTop: '.3rem',
            opacity: busy ? .7 : 1,
          }}
        >
          {busy ? 'لحظة...' : 'أنشئ ملفي ←'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleVerify}
          disabled={busy || otpCode.length !== 6}
          style={{
            background: 'var(--honey)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 800,
            fontFamily: 'inherit',
            cursor: busy || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
            letterSpacing: '.01em',
            boxShadow: '0 6px 20px rgba(196,137,61,.3)',
            opacity: busy || otpCode.length !== 6 ? .6 : 1,
          }}
        >
          {busy ? 'جاري التحقق...' : 'تأكيد وإنشاء الملف'}
        </button>
      )}
    </form>
  )
}
