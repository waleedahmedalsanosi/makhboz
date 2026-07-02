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
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن خباز..."
        className="flex-1 border border-[#34565F]/30 rounded-2xl px-4 py-2.5 text-[#22333B] focus:outline-none focus:ring-2 focus:ring-[#34565F]/30"
      />
      <button
        type="submit"
        className="bg-[#34565F] text-[#F4EFD1] px-5 py-2.5 rounded-2xl hover:opacity-90 transition"
      >
        بحث
      </button>
    </form>
  )
}
