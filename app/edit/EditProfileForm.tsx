'use client'

import { useState } from 'react'

type Baker = {
  id: string
  display_name: string
  username: string
  city: string
  bio: string | null
  whatsapp_number: string
}

type Product = {
  id: string
  name: string
  price: number
  weight_grams: number | null
  category: string
  is_available: boolean
  _delete?: boolean
}

type NewProduct = Omit<Product, 'id'> & { id?: undefined }

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة']
const categories = ['كسرة', 'عيش', 'بسبوسة', 'دكوة', 'قرقوش', 'أخرى']

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

export default function EditProfileForm({
  baker,
  products: initialProducts,
  token,
}: {
  baker: Baker
  products: Product[]
  token: string
}) {
  const [displayName, setDisplayName] = useState(baker.display_name)
  const [city, setCity] = useState(baker.city)
  const [bio, setBio] = useState(baker.bio || '')
  const [whatsapp, setWhatsapp] = useState(baker.whatsapp_number)
  const [products, setProducts] = useState<(Product | NewProduct)[]>(initialProducts)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [keyCounter, setKeyCounter] = useState(0)

  function addProduct() {
    setProducts([...products, { name: '', price: 0, weight_grams: null, category: 'أخرى', is_available: true }])
    setKeyCounter(c => c + 1)
  }

  function updateProduct(index: number, field: string, value: unknown) {
    setProducts(products.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  function deleteProduct(index: number) {
    const p = products[index]
    if ('id' in p && p.id) {
      setProducts(products.map((pr, i) => i === index ? { ...pr, _delete: true } : pr))
    } else {
      setProducts(products.filter((_, i) => i !== index))
    }
  }

  async function handleSave() {
    if (!displayName.trim() || !whatsapp.trim()) {
      setMessage({ text: 'الاسم ورقم الواتساب مطلوبان', ok: false })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/baker/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          baker: { display_name: displayName, city, bio, whatsapp_number: whatsapp },
          products: products.map(p => ({
            ...('id' in p && p.id ? { id: p.id } : {}),
            name: p.name,
            price: p.price,
            weight_grams: p.weight_grams,
            category: p.category,
            is_available: p.is_available,
            _delete: (p as Product)._delete || false,
          })),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setMessage({ text: 'تم الحفظ بنجاح!', ok: true })
        // Remove deleted products from state
        setProducts(products.filter(p => !(p as Product)._delete))
      } else {
        setMessage({ text: data.error || 'حدث خطأ', ok: false })
      }
    } catch {
      setMessage({ text: 'حدث خطأ في الاتصال', ok: false })
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Baker fields */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        border: '1.5px solid var(--border)',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(28,43,49,.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)', margin: 0 }}>المعلومات الأساسية</h2>

        <div>
          <label style={labelStyle}>الاسم *</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>المدينة *</label>
          <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>نبذة عنك</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        </div>

        <div>
          <label style={labelStyle}>رقم واتساب *</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
            style={{ ...inputStyle, direction: 'ltr' }} />
        </div>
      </div>

      {/* Products */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        border: '1.5px solid var(--border)',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(28,43,49,.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)', margin: 0 }}>المنتجات</h2>

        {products.map((p, i) => {
          if ((p as Product)._delete) return null
          return (
            <div key={'id' in p && p.id ? p.id : `new-${i}-${keyCounter}`} style={{
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '.8rem',
              background: 'var(--cream)',
            }}>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 55%' }}>
                  <label style={labelStyle}>اسم المنتج</label>
                  <input value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 40%' }}>
                  <label style={labelStyle}>الصنف</label>
                  <select value={p.category} onChange={e => updateProduct(i, 'category', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 45%' }}>
                  <label style={labelStyle}>السعر (ريال)</label>
                  <input type="number" value={p.price} onChange={e => updateProduct(i, 'price', Number(e.target.value))}
                    style={{ ...inputStyle, direction: 'ltr' }} />
                </div>
                <div style={{ flex: '1 1 45%' }}>
                  <label style={labelStyle}>الوزن (جرام)</label>
                  <input type="number" value={p.weight_grams || ''} onChange={e => updateProduct(i, 'weight_grams', e.target.value ? Number(e.target.value) : null)}
                    style={{ ...inputStyle, direction: 'ltr' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: 'var(--ink)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={p.is_available} onChange={e => updateProduct(i, 'is_available', e.target.checked)} />
                  متوفر
                </label>
                <button type="button" onClick={() => deleteProduct(i)} style={{
                  background: 'none', border: 'none', color: '#c44', fontSize: '.82rem',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  حذف
                </button>
              </div>
            </div>
          )
        })}

        <button type="button" onClick={addProduct} style={{
          background: 'none',
          border: '2px dashed var(--border)',
          borderRadius: '14px',
          padding: '.85rem',
          fontSize: '.9rem',
          fontWeight: 700,
          color: 'var(--teal)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          + أضف منتج
        </button>
      </div>

      {/* Save */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: message.ok ? 'rgba(45,80,89,.08)' : 'rgba(200,60,60,.08)',
          color: message.ok ? 'var(--teal)' : '#c44',
          fontSize: '.9rem',
          fontWeight: 700,
          textAlign: 'center',
        }}>
          {message.text}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} style={{
        background: 'var(--teal)',
        color: 'var(--cream)',
        border: 'none',
        borderRadius: '14px',
        padding: '1rem',
        fontSize: '1rem',
        fontWeight: 800,
        fontFamily: 'inherit',
        cursor: saving ? 'wait' : 'pointer',
        letterSpacing: '.01em',
        boxShadow: '0 6px 20px rgba(45,80,89,.25)',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
      </button>
    </div>
  )
}
