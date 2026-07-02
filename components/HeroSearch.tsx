'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSearch({
  defaultCity,
  defaultQ,
}: {
  defaultCity?: string
  defaultQ?: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(defaultQ ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (defaultCity) params.set('city', defaultCity)
    if (q.trim()) params.set('q', q.trim())
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,.12)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,.2)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن خباز أو منتج..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            padding: '1rem 1.2rem',
            color: '#fff',
            fontSize: '.97rem',
            fontFamily: 'inherit',
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--honey)',
            border: 'none',
            color: '#fff',
            padding: '.8rem 1.5rem',
            fontSize: '.9rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            margin: '.35rem',
            borderRadius: '11px',
            whiteSpace: 'nowrap',
          }}
        >
          بحث
        </button>
      </div>
    </form>
  )
}
