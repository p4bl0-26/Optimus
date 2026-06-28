'use client'

// ============================================================
// OPTIMUS — TopBar
// Phase 8: Judge Mode — Demo Tour + Reset Demo added
// Ask Chief wired to Chief of Staff Intelligence Layer
// ============================================================

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Menu, Bot, Play, Crosshair, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PAGE_META } from '@/constants/navigation'
import type { AppRoute } from '@/constants/navigation'
import { AskChiefDrawer } from '@/components/intelligence/AskChiefDrawer'
import { JudgeExperience } from '@/components/demo/JudgeExperience'
import { DemoResetButton } from '@/components/demo/DemoResetButton'
import { AccountDropdown } from './AccountDropdown'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'

interface TopBarProps {
  onMobileMenuToggle?: () => void
  className?: string
}

export function TopBar({ onMobileMenuToggle, className }: TopBarProps) {
  const pathname = usePathname()
  const meta = PAGE_META[pathname as AppRoute] ?? { title: pathname === '/focus' ? 'Focus Mode' : 'OPTIMUS', description: '' }
  const [isChiefOpen, setIsChiefOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const isFocusMode = pathname === '/focus'

  return (
    <>
      <header
        id="topbar"
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between',
          'py-8 px-4 md:px-6',
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
                className="text-[44px] tracking-wider font-semibold text-[var(--color-text-primary)] truncate"
                style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
              >
                {meta.title}
              </h1>
              <span className="status-dot w-1.5 h-1.5 opacity-60" />
            </div>
            <p className="text-[13px] text-[var(--color-text-muted)] truncate hidden sm:block opacity-[0.65]">
              {meta.description}
            </p>
          </motion.div>
        </div>

        {/* Right: Demo Controls + Ask Chief + Notifications + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">

          <button
            id="start-demo-btn"
            onClick={() => window.dispatchEvent(new Event('start-judge-tour'))}
            className="btn-base btn-primary hidden md:flex"
            title="Start guided demo tour"
          >
            <Play size={14} className="fill-current" />
            <span>START DEMO</span>
          </button>

          {/* WEEKLY REPORT button */}
          <Link
            href="/reports"
            id="weekly-report-btn"
            className="btn-base btn-secondary hidden sm:flex tracking-wider"
            title="View Weekly Executive Report"
          >
            <BarChart3 size={14} strokeWidth={2} />
            <span>WEEKLY REPORT</span>
          </Link>

          {/* FOCUS MODE button */}
          <Link
            href="/focus"
            id="enter-focus-mode-btn"
            className="btn-base btn-secondary hidden sm:flex tracking-wider"
            title="Enter distraction-free execution mode"
          >
            <Crosshair size={14} strokeWidth={2} />
            <span>FOCUS MODE</span>
          </Link>

          {/* Reset Demo */}
          <DemoResetButton />

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />

          {/* Ask Chief — wired to Chief of Staff Intelligence Layer */}
          {!isFocusMode && (
            <button
              id="ask-chief-btn"
              onClick={() => setIsChiefOpen(true)}
              className="btn-base btn-secondary hidden sm:flex"
              title="Open Chief of Staff Intelligence Layer"
            >
              <Bot size={14} strokeWidth={1.5} />
              <span>Ask Chief</span>
            </button>
          )}

          {/* Notifications */}
          {!isFocusMode && (
            <button
              id="notifications-btn"
              onClick={() => setIsNotificationsOpen(true)}
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
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />

          {/* User avatar / Account Dropdown */}
          <AccountDropdown />
        </div>
      </header>

      {/* Ask Chief Drawer — Chief of Staff Intelligence Layer */}
      <AskChiefDrawer isOpen={isChiefOpen} onClose={() => setIsChiefOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Judge Experience Orchestrator */}
      <JudgeExperience />
    </>
  )
}
