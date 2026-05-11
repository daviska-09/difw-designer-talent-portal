'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
          {label}
        </label>
      )}
      <input ref={ref} className={`input-base ${className}`} {...props} />
      {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs tracking-[2px] uppercase font-ui font-semibold text-white">
          {label}
        </label>
      )}
      {hint && <p className="text-xs text-white mb-1">{hint}</p>}
      <textarea ref={ref} className={`input-base ${className}`} {...props} />
      {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
