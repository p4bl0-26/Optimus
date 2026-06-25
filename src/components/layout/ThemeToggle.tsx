'use client'

// ============================================================
// OPTIMUS — ThemeToggle
// Moon/Sun toggle with smooth Framer Motion animation
// ============================================================

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  collapsed?: boolean
  className?: string
}

export function ThemeToggle({ collapsed = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
          collapsed ? 'w-9' : 'w-full',
          className
        )}
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative flex items-center gap-2.5 rounded-lg',
        'border border-[var(--color-border)]',
        'bg-[var(--color-bg-elevated)]',
        'text-[var(--color-text-secondary)]',
        'hover:text-[var(--color-text-primary)]',
        'hover:border-[var(--color-accent-primary)]',
        'hover:bg-[var(--color-accent-glow)]',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
        collapsed ? 'h-9 w-9 justify-center' : 'h-9 w-full px-3',
        className
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          {isDark ? (
            <Moon size={15} strokeWidth={1.5} className="text-[var(--color-accent-primary)]" />
          ) : (
            <Sun size={15} strokeWidth={1.5} className="text-[var(--color-accent-primary)]" />
          )}
        </motion.span>
      </AnimatePresence>

      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs font-medium tracking-wide"
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </motion.span>
      )}
    </motion.button>
  )
}
