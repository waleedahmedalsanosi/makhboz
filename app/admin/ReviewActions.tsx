'use client'

import { useState } from 'react'

export default function ReviewActions({ reviewId, secret }: { reviewId: string; secret: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')

  async function act(action: 'approve' | 'delete') {
    setState('busy')
    const res = await fetch('/api/admin/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action, secret }),
    })
    setState(res.ok ? 'done' : 'idle')
  }

  if (state === 'done') {
    return <span style={{ fontSize: '.75rem', color: 'var(--mist)' }}>تم ✓</span>
  }

  return (
    <div style={{ display: 'flex', gap: '.5rem' }}>
      <button onClick={() => act('approve')} disabled={state === 'busy'} style={{
        padding: '.35rem .85rem', borderRadius: '8px', fontSize: '.75rem', fontWeight: 700,
        border: 'none', cursor: 'pointer', color: '#fff', background: '#16a34a',
        opacity: state === 'busy' ? .6 : 1, fontFamily: 'inherit',
      }}>نشر</button>
      <button onClick={() => act('delete')} disabled={state === 'busy'} style={{
        padding: '.35rem .85rem', borderRadius: '8px', fontSize: '.75rem', fontWeight: 700,
        border: 'none', cursor: 'pointer', color: '#fff', background: '#dc2626',
        opacity: state === 'busy' ? .6 : 1, fontFamily: 'inherit',
      }}>حذف</button>
    </div>
  )
}
