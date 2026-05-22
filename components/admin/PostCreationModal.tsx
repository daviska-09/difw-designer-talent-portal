'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { Post } from '@/lib/types'

interface PostCreationModalProps {
  post?: Post | null
  onClose: () => void
  onSaved: (post: Post) => void
}

export function PostCreationModal({ post, onClose, onSaved }: PostCreationModalProps) {
  const isEdit = !!post

  const [headline, setHeadline] = useState(post?.headline ?? '')
  const [bodyText, setBodyText] = useState(post?.body_text ?? '')
  const [hyperlink, setHyperlink] = useState(post?.hyperlink ?? '')
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  )
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(post?.feature_photo_url ?? null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (photoFile && photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoFile, photoPreview])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Photo must be JPG, PNG, or WebP')
      return
    }
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setRemovePhoto(false)
    setError(null)
  }

  function handleRemovePhoto() {
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
    setRemovePhoto(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(isPublished: boolean) {
    setError(null)

    if (!headline.trim()) {
      setError('Headline is required')
      return
    }
    if (bodyText.trim().length < 20) {
      setError('Body text must be at least 20 characters')
      return
    }
    if (hyperlink.trim() && !/^https?:\/\/.+/.test(hyperlink.trim())) {
      setError('Link must start with http:// or https://')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('headline', headline.trim())
      formData.append('body_text', bodyText.trim())
      formData.append('hyperlink', hyperlink.trim())
      formData.append(
        'published_at',
        publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString()
      )
      formData.append('is_published', String(isPublished))
      if (photoFile) formData.append('feature_photo', photoFile)
      if (removePhoto) formData.append('remove_photo', 'true')

      const url = isEdit ? `/api/posts/${post.id}` : '/api/posts'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, { method, body: formData })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong')
        return
      }

      onSaved(json.post)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-black border border-[#1a1a1a] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]">
          <h2 className="font-display text-2xl tracking-[3px] uppercase">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white transition-colors text-xs tracking-[2px] uppercase font-ui font-semibold"
          >
            Close
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-8 flex flex-col gap-8">
          {error && (
            <p className="text-[#CC0000] text-sm font-ui font-semibold tracking-[1px]">{error}</p>
          )}

          {/* Headline */}
          <div>
            <label className="block text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-3">
              Headline <span className="text-[#CC0000]">*</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, 120))}
              placeholder="Post headline..."
              className="input-base w-full"
            />
            <p className="text-xs text-[#444] mt-1 font-ui">{headline.length}/120</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-3">
              Body <span className="text-[#CC0000]">*</span>
            </label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Write your announcement..."
              rows={8}
              className="input-base w-full resize-none"
            />
            <p className="text-xs text-[#444] mt-1 font-ui">{bodyText.trim().length} characters (min 20)</p>
          </div>

          {/* Feature Photo */}
          <div>
            <label className="block text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-3">
              Feature Photo{' '}
              <span className="text-[#444] normal-case tracking-normal font-normal">
                (optional — JPG, PNG, WebP, max 5MB)
              </span>
            </label>
            {photoPreview ? (
              <div className="flex flex-col gap-3">
                <div className="w-full aspect-video bg-[#111] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Feature photo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] hover:text-white transition-colors"
                  >
                    Remove Photo
                  </button>
                  <label
                    htmlFor="post-photo-input"
                    className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    Replace
                  </label>
                </div>
                <input
                  ref={fileInputRef}
                  id="post-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  id="post-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="post-photo-input"
                  className="inline-flex items-center px-6 py-2 border border-[#333] text-[#888] hover:text-white hover:border-[#888] transition-colors cursor-pointer text-xs tracking-[2px] uppercase font-ui font-semibold"
                >
                  Choose Photo
                </label>
              </div>
            )}
          </div>

          {/* Hyperlink */}
          <div>
            <label className="block text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-3">
              Link{' '}
              <span className="text-[#444] normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={hyperlink}
              onChange={(e) => setHyperlink(e.target.value)}
              placeholder="https://example.com"
              className="input-base w-full"
            />
          </div>

          {/* Publish Date */}
          <div>
            <label className="block text-xs tracking-[2px] uppercase font-ui font-semibold text-[#888] mb-3">
              Publish Date{' '}
              <span className="text-[#444] normal-case tracking-normal font-normal">
                (defaults to now)
              </span>
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="input-base w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 px-8 py-6 border-t border-[#1a1a1a] flex-wrap">
          <Button onClick={() => handleSubmit(true)} loading={loading} variant="primary">
            {isEdit ? 'Save Changes' : 'Publish'}
          </Button>
          {!isEdit && (
            <Button onClick={() => handleSubmit(false)} loading={loading} variant="outline">
              Save as Draft
            </Button>
          )}
          <Button onClick={onClose} variant="ghost" disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
