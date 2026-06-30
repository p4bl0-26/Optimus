'use client'

// ============================================================
// OPTIMUS — TopBar
// Phase 8: Judge Mode — Demo Tour + Reset Demo added
// Ask Chief wired to Chief of Staff Intelligence Layer
// ============================================================

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Menu, Bot, Play, BarChart3 } from 'lucide-react'
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

  return (
    <>
      <header
        id="topbar"
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between',
          'py-8 px-4 md:px-6',
          'bg-[var(--topbar-bg)] border-b border-[var(--topbar-border)]',
          'backdrop-blur-[var(--topbar-backdrop)]',
          'flex-wrap',
          'flex-shrink-0',
          className
        )}
      >
        {/* Left: Mobile menu + Page Title + Action Controls */}
        <div className="flex items-center gap-6" style={{ flex: '1 1 auto', minWidth: '0' }}>
          <div className="flex items-center gap-3">
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
              className="flex flex-col"
              style={{ minWidth: '200px' }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <h1
                  className="font-bold text-[var(--color-text-primary)] uppercase"
                  style={{ 
                    fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)',
                    fontSize: 'clamp(24px, 3vw, 48px)',
                    letterSpacing: '0.08em',
                    lineHeight: '1.0'
                  }}
                >
                  {meta.title}
                </h1>
                <span className="status-dot w-2 h-2 opacity-60 flex-shrink-0" />
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] truncate hidden sm:block opacity-[0.65]">
                {meta.description}
              </p>
            </motion.div>
          </div>

          {/* LEFT COMMANDS (Start Demo, Weekly Report, Reset Demo) */}
          <div className="hidden lg:flex items-center gap-2 ml-4 border-l border-[var(--color-border)] pl-6">
            <button
              id="start-demo-btn"
              onClick={() => window.dispatchEvent(new Event('start-judge-tour'))}
              className="btn-base btn-primary"
              title="Start guided demo tour"
            >
              <Play size={14} className="fill-current" />
              <span>START DEMO</span>
            </button>

            <Link
              href="/reports"
              id="weekly-report-btn"
              className="btn-base btn-secondary tracking-wider"
              title="View Weekly Executive Report"
            >
              <BarChart3 size={14} strokeWidth={2} />
              <span>WEEKLY REPORT</span>
            </Link>

            <DemoResetButton />
          </div>
        </div>

        {/* Right: Ask Chief + Notifications */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          <button
            id="ask-chief"
            onClick={() => setIsChiefOpen(true)}
            className="btn-base btn-secondary hidden sm:flex"
            title="Open Chief of Staff Intelligence Layer"
          >
            <Bot size={14} strokeWidth={1.5} />
            <span>Ask Chief</span>
          </button>

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
