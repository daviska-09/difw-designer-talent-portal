'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'dark'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-8 py-3 text-sm tracking-[3px] uppercase font-display transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-white text-black hover:bg-[#e0e0e0]',
    outline: 'bg-transparent border border-white text-white hover:bg-white hover:text-black',
    ghost: 'bg-transparent text-white hover:text-[#ccc]',
    dark: 'bg-black text-white hover:bg-[#222]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="opacity-60">Loading...</span> : children}
    </button>
  )
}
