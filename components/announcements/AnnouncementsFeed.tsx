'use client'

import { useState } from 'react'
import { PostExpandedModal } from '@/components/announcements/PostExpandedModal'
import type { Post } from '@/lib/types'

const PER_PAGE = 10

interface AnnouncementsFeedProps {
  initialPosts: Post[]
  initialTotal: number
}

// Strip [text](url) markdown to plain text for the preview card
function stripLinks(text: string): string {
  return text.replace(/\[(.+?)\]\(https?:\/\/[^\s)]+\)/g, '$1')
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const plain = stripLinks(post.body_text)
  const preview = plain.length > 150 ? plain.slice(0, 150).trimEnd() + '…' : plain

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-white hover:bg-[#050505] transition-colors group"
    >
      {/* Feature photo */}
      {post.feature_photo_url && (
        <div className="w-full aspect-video bg-[#111] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.feature_photo_url}
            alt={post.headline}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        </div>
      )}

      <div className="p-6">
        {/* Date */}
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-3">
          {new Date(post.published_at).toLocaleDateString('en-IE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {/* Headline */}
        <h2 className="font-display text-2xl tracking-[3px] uppercase text-white mb-3 leading-tight">
          {post.headline}
        </h2>

        {/* Preview */}
        <p className="text-white text-sm leading-relaxed">
          {preview}{' '}
          {plain.length > 150 && (
            <span className="underline underline-offset-2">Read More</span>
          )}
        </p>
      </div>
    </button>
  )
}

export function AnnouncementsFeed({ initialPosts, initialTotal }: AnnouncementsFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [loadingPage, setLoadingPage] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / PER_PAGE)

  async function loadPage(newPage: number) {
    setLoadingPage(true)
    setPageError(null)
    try {
      const res = await fetch(`/api/posts?page=${newPage}&perPage=${PER_PAGE}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPosts(json.posts)
      setTotal(json.total)
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setPageError('Failed to load announcements. Please try again.')
    } finally {
      setLoadingPage(false)
    }
  }

  if (posts.length === 0 && !loadingPage) {
    return (
      <div className="border-t border-white pt-16 text-center">
        <p className="font-display text-2xl tracking-[3px] uppercase text-white mb-4">
          Nothing Here Yet
        </p>
        <p className="text-white text-sm max-w-sm mx-auto">
          Announcements from the DIFW team will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      {pageError && (
        <p className="text-[#CC0000] text-sm font-ui font-semibold tracking-[1px] mb-6">
          {pageError}
        </p>
      )}

      {loadingPage ? (
        <div className="py-16 text-center text-white text-sm font-ui">Loading…</div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loadingPage && (
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-white">
          <span className="text-xs text-white font-ui tracking-[1px]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => loadPage(page - 1)}
              disabled={page === 1 || loadingPage}
              className="px-5 py-2 text-xs tracking-[2px] uppercase font-ui font-semibold border border-white text-white hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page === totalPages || loadingPage}
              className="px-5 py-2 text-xs tracking-[2px] uppercase font-ui font-semibold border border-white text-white hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedPost && (
        <PostExpandedModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  )
}
