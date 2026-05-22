'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { Post } from '@/lib/types'

interface PostExpandedModalProps {
  post: Post
  onClose: () => void
}

export function PostExpandedModal({ post, onClose }: PostExpandedModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-black border border-[#1a1a1a] w-full max-w-3xl my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#888] hover:text-white transition-colors text-xs tracking-[2px] uppercase font-ui font-semibold z-10"
          aria-label="Close"
        >
          Close ✕
        </button>

        {/* Feature photo */}
        {post.feature_photo_url && (
          <div className="relative w-full aspect-video bg-[#111]">
            <Image
              src={post.feature_photo_url}
              alt={post.headline}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-8">
          {/* Date */}
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-[#555] mb-4">
            {new Date(post.published_at).toLocaleDateString('en-IE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl tracking-[3px] uppercase text-white mb-6 leading-tight">
            {post.headline}
          </h2>

          {/* Body — preserve line breaks */}
          <div className="text-white text-sm leading-relaxed whitespace-pre-wrap mb-8">
            {post.body_text}
          </div>

          {/* Link */}
          {post.hyperlink && (
            <a
              href={post.hyperlink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 border border-white text-white text-sm tracking-[3px] uppercase font-display hover:bg-white hover:text-black transition-colors"
            >
              Learn More
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
