'use client'

// ============================================================
// OPTIMUS — Sidebar
// Left navigation rail with logo, nav items, AI status panel,
// and theme toggle. Supports collapsed icon-rail mode.
// Matches the Visual Reference Bible layout exactly.
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Target,
  Zap,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bot,
  User,
  BookOpen,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { NAV_ITEMS } from '@/constants/navigation'

// ─── Icon Map ────────────────────────────────────────────────
const ICON_MAP = {
  LayoutDashboard,
  Target,
  Zap,
  FileText,
  Settings,
  BookOpen,
  BarChart3,
} as const

type IconName = keyof typeof ICON_MAP

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name as IconName] ?? LayoutDashboard
  return <Icon size={size} strokeWidth={1.5} />
}

// ─── Sidebar Props ────────────────────────────────────────────
interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

// ─── Sidebar Component ────────────────────────────────────────
export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="sidebar-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        id="sidebar"
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          // Base styles
          'relative z-40 flex flex-col h-full',
          'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
          'flex-shrink-0 overflow-hidden',
          // Mobile: fixed drawer
          'fixed top-0 left-0 md:relative md:top-auto md:left-auto',
          'md:translate-x-0 transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ minHeight: '100dvh' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Logo Area ────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center border-b border-[var(--sidebar-border)]',
            'flex-shrink-0 h-16',
            isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
          )}
        >
          {/* Shield Logo Mark */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'flex items-center justify-center rounded-lg',
                'bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30',
                isCollapsed ? 'w-9 h-9' : 'w-8 h-8'
              )}
            >
              <Shield
                size={isCollapsed ? 18 : 16}
                className="text-[var(--color-accent-primary)]"
                strokeWidth={1.5}
              />
            </div>
            {/* Active pulse dot */}
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
          </div>

          {/* Wordmark */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span
                  className="font-orbitron text-sm font-bold tracking-widest text-[var(--color-text-primary)] uppercase leading-none"
                  style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
                >
                  OPTIMUS
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] tracking-wider mt-0.5">
                  AI Chief of Staff
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation Items ──────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.id}
                id={`nav-${item.id}`}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'relative flex items-center rounded-lg',
                  'transition-all duration-150 group',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]',
                  isCollapsed ? 'h-9 w-9 mx-auto justify-center' : 'h-9 px-3 gap-3',
                  isActive
                    ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
                )}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-[var(--color-accent-primary)]"
                  />
                )}

                {/* Icon */}
                <span className="flex-shrink-0">
                  <NavIcon name={item.icon} size={15} />
                </span>

                {/* Label + Badge */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="text-[13px] font-medium truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'ml-2 flex-shrink-0 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                            isActive
                              ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                              : 'bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical)]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* ── AI Chief of Staff Status ──────────────────────── */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-2 mb-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3"
            >
              <p className="text-[9px] font-bold tracking-widest text-[var(--color-accent-primary)] uppercase mb-2">
                AI Chief of Staff
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[var(--color-text-primary)] truncate">OPTIMUS</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="status-dot w-1.5 h-1.5" />
                    <span className="text-[10px] text-[var(--color-text-muted)]">Always working for you</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed AI icon */}
        {isCollapsed && (
          <div className="mx-auto mb-2 flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center">
              <Bot size={15} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
            </div>
            <span className="status-dot" />
          </div>
        )}

        {/* ── Theme Toggle & Collapse Button ────────────────── */}
        <div
          className={cn(
            'border-t border-[var(--sidebar-border)] p-2 space-y-2 flex-shrink-0'
          )}
        >
          <ThemeToggle collapsed={isCollapsed} />

          {/* Collapse toggle */}
          <button
            id="sidebar-collapse-btn"
            onClick={onToggle}
            className={cn(
              'flex items-center rounded-lg border border-[var(--color-border)]',
              'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
              'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)]',
              'transition-all duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]',
              isCollapsed ? 'h-9 w-9 mx-auto justify-center' : 'h-9 w-full px-3 gap-2.5'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft size={14} strokeWidth={1.5} />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
