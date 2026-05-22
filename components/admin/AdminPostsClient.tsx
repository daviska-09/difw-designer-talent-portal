'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PostCreationModal } from '@/components/admin/PostCreationModal'
import type { Post } from '@/lib/types'

const PER_PAGE = 10

interface AdminPostsClientProps {
  initialPosts: Post[]
  initialTotal: number
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9.8 1.8a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4L4.5 11.9l-2.5.6.6-2.5L9.8 1.8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 3.5h10M5.5 3.5V2.5h3v1M3 3.5l.5 8h7l.5-8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AdminPostsClient({ initialPosts, initialTotal }: AdminPostsClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadingPage, setLoadingPage] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const totalPages = Math.ceil(total / PER_PAGE)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function openNew() {
    setEditPost(null)
    setShowModal(true)
  }

  function openEdit(post: Post) {
    setEditPost(post)
    setShowModal(true)
  }

  function handleSaved(post: Post) {
    if (editPost) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)))
      showToast('Post updated.', 'success')
    } else {
      setPosts((prev) => [post, ...prev].slice(0, PER_PAGE))
      setTotal((t) => t + 1)
      showToast('Post published.', 'success')
    }
    setShowModal(false)
    setEditPost(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error ?? 'Failed to delete post.', 'error')
        return
      }
      setPosts((prev) => prev.filter((p) => p.id !== id))
      setTotal((t) => t - 1)
      showToast('Post deleted.', 'success')
    } catch {
      showToast('Network error.', 'error')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  async function loadPage(newPage: number) {
    setLoadingPage(true)
    try {
      const res = await fetch(`/api/posts?page=${newPage}&perPage=${PER_PAGE}&all=true`)
      const json = await res.json()
      setPosts(json.posts)
      setTotal(json.total)
      setPage(newPage)
    } catch {
      showToast('Failed to load page.', 'error')
    } finally {
      setLoadingPage(false)
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-4xl tracking-[3px] uppercase">Posts</h1>
          <Button onClick={openNew} variant="primary">
            New Post
          </Button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 px-6 py-3 text-sm font-ui font-semibold tracking-[1px] border ${
              toast.type === 'success'
                ? 'text-white bg-[#111] border-[#333]'
                : 'text-[#CC0000] bg-[#0a0000] border-[#CC0000]'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Posts list */}
        {posts.length === 0 && !loadingPage ? (
          <div className="border-t border-[#1a1a1a] pt-16 text-center">
            <p className="font-display text-2xl tracking-[3px] uppercase text-white mb-4">
              No Posts Yet
            </p>
            <p className="text-[#888] text-sm">
              Click &ldquo;New Post&rdquo; to create your first announcement.
            </p>
          </div>
        ) : (
          <>
            <div className="border border-[#1a1a1a]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_120px_80px] gap-0 border-b border-[#1a1a1a] px-6 py-3">
                {['Headline', 'Status', 'Published', ''].map((h) => (
                  <span
                    key={h}
                    className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {loadingPage ? (
                <div className="px-6 py-12 text-center text-[#888] text-sm font-ui">
                  Loading...
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="group grid grid-cols-[1fr_100px_120px_80px] items-center gap-0 px-6 py-4 border-b border-[#0d0d0d] hover:bg-[#050505] transition-colors"
                  >
                    {/* Headline */}
                    <button
                      onClick={() => openEdit(post)}
                      className="text-white text-sm font-medium text-left truncate pr-4 hover:text-[#ccc] transition-colors"
                    >
                      {post.headline}
                    </button>

                    {/* Status */}
                    <span
                      className={`text-xs tracking-[2px] uppercase font-ui font-semibold ${
                        post.is_published ? 'text-white' : 'text-[#555]'
                      }`}
                    >
                      {post.is_published ? 'Live' : 'Draft'}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-[#888] font-ui">
                      {new Date(post.published_at).toLocaleDateString('en-IE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    {/* Actions */}
                    {confirmDeleteId === post.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#888] font-ui">Delete?</span>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="text-xs tracking-[1px] uppercase font-ui font-semibold text-[#CC0000] hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          {deletingId === post.id ? '…' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs tracking-[1px] uppercase font-ui font-semibold text-[#888] hover:text-white transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => openEdit(post)}
                          className="text-[#888] hover:text-white transition-colors p-1"
                          title="Edit post"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(post.id)}
                          className="text-[#888] hover:text-[#CC0000] transition-colors p-1"
                          title="Delete post"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-[#888] font-ui">
                  Page {page} of {totalPages} &mdash; {total} posts total
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPage(page - 1)}
                    disabled={page === 1 || loadingPage}
                    className="px-4 py-2 text-xs tracking-[2px] uppercase font-ui font-semibold border border-[#333] text-[#888] hover:text-white hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadPage(page + 1)}
                    disabled={page === totalPages || loadingPage}
                    className="px-4 py-2 text-xs tracking-[2px] uppercase font-ui font-semibold border border-[#333] text-[#888] hover:text-white hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <PostCreationModal
          post={editPost}
          onClose={() => {
            setShowModal(false)
            setEditPost(null)
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
