'use client'

import { useEffect } from 'react'
import type { Post } from '@/lib/types'

interface PostExpandedModalProps {
  post: Post
  onClose: () => void
}

// Renders body text, parsing [text](url) into anchor tags and preserving line breaks
function PostBody({ text }: { text: string }) {
  const linkPattern = /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(text)) !== null) {
    // Text before the match — handle newlines
    if (match.index > lastIndex) {
      parts.push(...splitLines(text.slice(lastIndex, match.index), parts.length))
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-75 transition-opacity"
      >
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    parts.push(...splitLines(text.slice(lastIndex), parts.length + 1000))
  }

  return <>{parts}</>
}

function splitLines(text: string, keyOffset: number): React.ReactNode[] {
  return text.split('\n').flatMap((line, i) =>
    i === 0 ? [line] : [<br key={keyOffset + i} />, line]
  )
}

export function PostExpandedModal({ post, onClose }: PostExpandedModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
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
      <div className="bg-black border border-white w-full max-w-3xl my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-white transition-colors text-xs tracking-[2px] uppercase font-ui font-semibold z-10"
          aria-label="Close"
        >
          Close ✕
        </button>

        {/* Feature photo */}
        {post.feature_photo_url && (
          <div className="w-full aspect-video bg-[#111] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.feature_photo_url}
              alt={post.headline}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-8">
          {/* Date */}
          <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-4">
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

          {/* Body with inline link parsing */}
          <div className="text-white text-sm leading-relaxed mb-8">
            <PostBody text={post.body_text} />
          </div>

          {/* CTA Link */}
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
