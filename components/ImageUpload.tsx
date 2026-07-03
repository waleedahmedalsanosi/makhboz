'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  bucket: 'avatars' | 'products'
  token: string
  currentUrl?: string
  onUploaded: (url: string) => void
}

export default function ImageUpload({ bucket, token, currentUrl, onUploaded }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!uploading) inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    formData.append('token', token)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'فشل الرفع')
        setPreview(currentUrl || null)
      } else {
        setPreview(data.url)
        setProgress(100)
        onUploaded(data.url)
      }
    } catch {
      setError('حدث خطأ في الاتصال')
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isAvatar = bucket === 'avatars'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        onClick={handleClick}
        style={{
          width: isAvatar ? '96px' : '120px',
          height: isAvatar ? '96px' : '120px',
          borderRadius: isAvatar ? '50%' : '12px',
          border: '2px dashed var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          backgroundColor: 'var(--mist)',
          position: 'relative',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="صورة"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '28px', color: 'var(--teal)', opacity: 0.6 }}>+</span>
        )}
        {uploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <span style={{ fontSize: '12px', color: 'var(--ink)', opacity: 0.6 }}>
        {uploading ? 'جارٍ الرفع...' : 'اضغط لاختيار صورة'}
      </span>

      {error && (
        <span style={{ fontSize: '12px', color: '#c0392b' }}>{error}</span>
      )}

      {progress === 100 && !uploading && !error && (
        <span style={{ fontSize: '12px', color: 'var(--teal)' }}>تم الرفع بنجاح</span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
