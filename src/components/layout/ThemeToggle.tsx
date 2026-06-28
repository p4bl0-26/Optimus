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
    <div
      id="theme-toggle"
      className={cn(
        'relative flex items-center gap-2.5 rounded-lg',
        'border border-[var(--color-border)]',
        'bg-[var(--color-bg-elevated)]',
        'text-[var(--color-text-secondary)]',
        'transition-all duration-200 cursor-default opacity-80',
        collapsed ? 'h-9 w-9 justify-center flex-shrink-0' : 'h-9 w-full px-3 flex-shrink-0',
        className
      )}
      aria-label="Theme: OPTIMUS Dark (Default)"
      title="Theme: OPTIMUS Dark (Default)"
    >
      <span className="flex-shrink-0">
        <Moon size={15} strokeWidth={1.5} className="text-[var(--color-accent-primary)]" />
      </span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-[11px] font-medium tracking-wide truncate"
          >
            OPTIMUS Dark (Default)
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
