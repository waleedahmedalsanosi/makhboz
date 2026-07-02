'use client'

import { useState } from 'react'

export default function AdminActions({
  bakerId,
  isActive,
  isVerified,
  secret,
}: {
  bakerId: string
  isActive: boolean
  isVerified: boolean
  secret: string
}) {
  const [active, setActive] = useState(isActive)
  const [verified, setVerified] = useState(isVerified)
  const [loading, setLoading] = useState(false)

  async function update(field: 'is_active' | 'is_verified', value: boolean) {
    setLoading(true)
    const res = await fetch('/api/admin/baker', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bakerId, field, value, secret }),
    })
    if (res.ok) {
      if (field === 'is_active') setActive(value)
      if (field === 'is_verified') setVerified(value)
    }
    setLoading(false)
  }

  const btn = (label: string, onClick: () => void, color: string, bg: string) => (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '.35rem .85rem',
        borderRadius: '8px',
        fontSize: '.75rem',
        fontWeight: 700,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        color,
        background: bg,
        opacity: loading ? .6 : 1,
        transition: 'opacity .15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
      {active
        ? btn('إيقاف', () => update('is_active', false), '#fff', '#dc2626')
        : btn('تفعيل', () => update('is_active', true), '#fff', '#16a34a')}
      {verified
        ? btn('إلغاء التوثيق', () => update('is_verified', false), 'var(--honey)', 'rgba(196,137,61,.12)')
        : btn('توثيق ✓', () => update('is_verified', true), '#fff', 'var(--honey)')}
    </div>
  )
}
