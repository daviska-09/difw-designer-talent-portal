'use client'

import { useState } from 'react'
import { PostExpandedModal } from '@/components/announcements/PostExpandedModal'
import type { Post } from '@/lib/types'

const PER_PAGE = 10

interface AnnouncementsFeedProps {
  initialPosts: Post[]
  initialTotal: number
}

function stripLinks(text: string): string {
  return text.replace(/\[(.+?)\]\(https?:\/\/[^\s)]+\)/g, '$1')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function FeaturedPost({ post, onClick }: { post: Post; onClick: () => void }) {
  const plain = stripLinks(post.body_text)
  const preview = plain.length > 220 ? plain.slice(0, 220).trimEnd() + '…' : plain

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-white hover:bg-[#050505] transition-colors group flex flex-col md:flex-row min-h-[360px] mb-12"
    >
      {/* Image — left 50% on desktop, top on mobile */}
      <div className="w-full md:w-1/2 flex-shrink-0 bg-[#111] overflow-hidden aspect-video md:aspect-auto">
        {post.feature_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.feature_photo_url}
            alt=""
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : null}
      </div>

      {/* Text — right 50% on desktop, below on mobile */}
      <div className="flex-1 p-8 flex flex-col justify-center">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-3">
          {formatDate(post.published_at)}
        </p>
        <h2 className="font-display text-3xl tracking-[3px] uppercase text-white mb-4 leading-tight">
          {post.headline}
        </h2>
        <p className="text-white/80 text-sm leading-relaxed mb-6">{preview}</p>
        <span className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white underline underline-offset-2">
          Read More
        </span>
      </div>
    </button>
  )
}

function PostListItem({ post, onClick }: { post: Post; onClick: () => void }) {
  const plain = stripLinks(post.body_text)
  const preview = plain.length > 120 ? plain.slice(0, 120).trimEnd() + '…' : plain

  return (
    <button
      onClick={onClick}
      className="w-full text-left border-b border-[#1a1a1a] hover:bg-[#050505] transition-colors group flex flex-col md:flex-row gap-6 py-6"
    >
      {/* Text — left 70% on desktop, below on mobile */}
      <div className="flex-1 order-last md:order-first">
        <p className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white mb-2">
          {formatDate(post.published_at)}
        </p>
        <h3 className="font-display text-xl tracking-[3px] uppercase text-white mb-2 leading-tight">
          {post.headline}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">{preview}</p>
      </div>

      {/* Thumbnail — right 30% on desktop, top on mobile */}
      {post.feature_photo_url && (
        <div className="w-full md:w-[30%] h-40 md:h-32 flex-shrink-0 bg-[#111] overflow-hidden order-first md:order-last">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.feature_photo_url}
            alt=""
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        </div>
      )}
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
  const featured = page === 1 ? posts[0] ?? null : null
  const feedPosts = page === 1 ? posts.slice(1) : posts

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
        <>
          {featured && (
            <FeaturedPost post={featured} onClick={() => setSelectedPost(featured)} />
          )}

          {feedPosts.length > 0 && (
            <div className="border-t border-[#1a1a1a]">
              {feedPosts.map((post) => (
                <PostListItem key={post.id} post={post} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )}
        </>
      )}

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
