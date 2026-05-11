'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-[#1a1a1a]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]">
          {title && (
            <span className="font-display text-xl tracking-[3px] uppercase">{title}</span>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-white hover:text-[#ccc] text-xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  )
}
