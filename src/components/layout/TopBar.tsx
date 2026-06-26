'use client'

// ============================================================
// OPTIMUS — TopBar
// Page title, AI greeting, notifications, user avatar
// Matches reference: "Good evening, [Name] 🌿" pattern
// ============================================================

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAGE_META } from '@/constants/navigation'
import type { AppRoute } from '@/constants/navigation'

interface TopBarProps {
  onMobileMenuToggle?: () => void
  className?: string
}

export function TopBar({ onMobileMenuToggle, className }: TopBarProps) {
  const pathname = usePathname()
  const meta = PAGE_META[pathname as AppRoute] ?? PAGE_META['/']
  const [showToast, setShowToast] = useState(false)

  return (
    <header
      id="topbar"
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between',
        'h-16 px-4 md:px-6',
        'bg-[var(--topbar-bg)] border-b border-[var(--topbar-border)]',
        'backdrop-blur-[var(--topbar-backdrop)]',
        'flex-shrink-0',
        className
      )}
    >
      {/* Left: Mobile menu + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          className={cn(
            'md:hidden flex items-center justify-center w-9 h-9 rounded-lg',
            'text-[var(--color-text-secondary)]',
            'hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-bg-elevated)]',
            'border border-[var(--color-border)]',
            'transition-all duration-150'
          )}
          aria-label="Toggle navigation menu"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>

        {/* Page title area */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <h1
              className="text-sm font-semibold text-[var(--color-text-primary)] truncate"
              style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
            >
              {meta.title}
            </h1>
            <span className="status-dot w-1.5 h-1.5 opacity-60" />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] truncate hidden sm:block">
            {meta.description}
          </p>
        </motion.div>
      </div>

      {/* Right: Ask Chief + Notifications + Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Ask Chief */}
        <button
          id="ask-chief-btn"
          onClick={() => {
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
          }}
          className={cn(
            'hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg',
            'border border-[var(--color-border)]',
            'bg-[var(--color-bg-elevated)]',
            'text-[var(--color-text-secondary)] text-xs font-medium',
            'hover:text-[var(--color-text-primary)]',
            'hover:border-[var(--color-accent-primary)]/40',
            'hover:bg-[var(--color-accent-glow)]',
            'transition-all duration-150'
          )}
          title="Ask Chief"
        >
          <Bot size={13} strokeWidth={1.5} />
          <span>Ask Chief</span>
        </button>

        {/* Notifications — placeholder */}
        <button
          id="notifications-btn"
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-lg',
            'border border-[var(--color-border)]',
            'bg-[var(--color-bg-elevated)]',
            'text-[var(--color-text-secondary)]',
            'hover:text-[var(--color-text-primary)]',
            'hover:border-[var(--color-accent-primary)]/40',
            'hover:bg-[var(--color-accent-glow)]',
            'transition-all duration-150'
          )}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={15} strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />

        {/* User avatar — placeholder */}
        <button
          id="user-avatar-btn"
          className={cn(
            'flex items-center gap-2 rounded-lg',
            'hover:bg-[var(--color-bg-elevated)]',
            'transition-all duration-150 p-1'
          )}
          aria-label="User profile"
        >
          <div
            className={cn(
              'w-7 h-7 rounded-full',
              'bg-gradient-to-br from-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)]',
              'flex items-center justify-center',
              'text-[10px] font-bold text-[var(--color-text-inverse)]',
              'border border-[var(--color-accent-primary)]/30'
            )}
          >
            H
          </div>
          <span className="text-xs font-medium text-[var(--color-text-secondary)] hidden lg:block">
            Himank
          </span>
        </button>
      </div>

      {/* Polished Toast for Ask Chief */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-16 right-4 sm:right-6',
              'px-4 py-3 rounded-lg shadow-lg',
              'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
              'flex items-center gap-3 z-50'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center border border-[var(--color-accent-primary)]/20">
              <Bot size={14} className="text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Ask Chief
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Chief Assistant will arrive in Phase 8.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
