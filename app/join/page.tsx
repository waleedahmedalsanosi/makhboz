export default function JoinPage() {
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
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(196,137,61,.12)',
          color: 'var(--honey)',
          fontSize: '.75rem', fontWeight: 700,
          letterSpacing: '.1em', padding: '.35rem .9rem',
          borderRadius: '100px', marginBottom: '1rem',
        }}>للخبازين</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', letterSpacing: '-.02em', marginBottom: '.5rem' }}>
          انضم كخباز
        </h1>
        <p style={{ color: 'rgba(28,43,49,.5)', fontSize: '.95rem' }}>
          أنشئ ملفك وابدأ تستقبل طلبات
        </p>
      </div>

      <form
        action="/api/bakers/register"
        method="POST"
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
        <div>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
            الاسم الكامل *
          </label>
          <input name="display_name" required placeholder="مثال: فاطمة أحمد" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
            رابط ملفك *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <span style={{ padding: '.75rem 1rem', background: 'var(--cream)', color: 'rgba(28,43,49,.4)', fontSize: '.85rem', borderLeft: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>
              makhboz.net/
            </span>
            <input name="username" required pattern="[a-z0-9_-]+" placeholder="fatima_ahmad"
              style={{ flex: 1, border: 'none', padding: '.75rem 1rem', fontSize: '.95rem', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none', direction: 'ltr' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
            رقم واتساب *
          </label>
          <input name="whatsapp_number" required type="tel" placeholder="+966 5X XXX XXXX"
            style={{ ...inputStyle, direction: 'ltr' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
            المدينة *
          </label>
          <select name="city" required style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">اختر مدينتك</option>
            <option>الرياض</option>
            <option>جدة</option>
            <option>الدمام</option>
            <option>مكة المكرمة</option>
            <option>المدينة المنورة</option>
            <option>أخرى</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
            نبذة عنك
          </label>
          <textarea name="bio" rows={3} placeholder="أخبر المشترين عن مخبوزاتك وخبرتك..."
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        </div>

        <button
          type="submit"
          style={{
            background: 'var(--teal)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: '14px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 800,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: '.01em',
            boxShadow: '0 6px 20px rgba(45,80,89,.25)',
            marginTop: '.3rem',
          }}
        >
          أنشئ ملفي ←
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.78rem', color: 'rgba(28,43,49,.35)' }}>
        مجاني تماماً — لا عمولات، لا رسوم
      </p>
    </div>
  )
}
