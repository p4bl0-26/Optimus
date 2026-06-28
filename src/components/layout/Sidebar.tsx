'use client'

// ============================================================
// OPTIMUS — Sidebar
// Left navigation rail with logo, nav items, AI status panel,
// and theme toggle. Supports collapsed icon-rail mode.
// Matches the Visual Reference Bible layout exactly.
// ============================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/db/supabase'
import { isJudgeMode, exitJudgeSession } from '@/lib/demo/judgeSession'
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
  Calendar,
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
  Calendar,
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
  const router = useRouter()
  const isFocusMode = pathname === '/focus'

  const [judgeMode, setJudgeMode] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setJudgeMode(isJudgeMode()), 0)
    const handleModeChange = () => setJudgeMode(isJudgeMode())
    window.addEventListener('judge-mode-changed', handleModeChange)
    return () => {
      clearTimeout(t)
      window.removeEventListener('judge-mode-changed', handleModeChange)
    }
  }, [])

  const handleToggleJudgeMode = () => {
    if (judgeMode) {
      exitJudgeSession()
    } else {
      window.dispatchEvent(new Event('start-judge-tour'))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("optimus_auth")
    localStorage.removeItem("optimus_judge")
    sessionStorage.clear()
    
    window.history.replaceState({}, "", "/")
    router.replace('/')
    
    setTimeout(() => {
      window.location.reload()
    }, 50)
  }

  // Force collapse in focus mode
  const effectiveIsCollapsed = isFocusMode ? true : isCollapsed

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
        animate={{ width: effectiveIsCollapsed ? 64 : 240 }}
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
            'flex-shrink-0 h-24', // increased height
            effectiveIsCollapsed ? 'justify-center px-0' : 'px-6 gap-4' // increased padding
          )}
        >
          {/* Shield Logo Mark */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'flex items-center justify-center rounded-lg overflow-hidden',
                'bg-transparent border border-[var(--color-accent-primary)]/30',
                effectiveIsCollapsed ? 'w-9 h-9' : 'w-8 h-8'
              )}
            >
              <Image 
                src="/optimus-logo.png" 
                alt="Optimus" 
                width={36}
                height={36}
                className="w-full h-full object-cover mix-blend-screen" 
              />
            </div>
            {/* Active pulse dot */}
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
          </div>

          {/* Wordmark */}
          <AnimatePresence initial={false}>
            {!effectiveIsCollapsed && (
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 px-2">
          {!isFocusMode && NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

            const domId = item.id === 'schedule' ? 'execution-schedule' :
                          item.id === 'actions' ? 'work-accelerator' :
                          item.id === 'briefings' ? 'form-assistant' :
                          item.id === 'reports' ? 'weekly-reports' :
                          `nav-${item.id}`;

            return (
              <Link
                key={item.id}
                id={domId}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'relative flex items-center rounded-lg',
                  'transition-all duration-150 group',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]',
                  effectiveIsCollapsed ? 'h-12 w-12 mx-auto justify-center' : 'h-12 px-4 gap-4',
                  isActive
                    ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] shadow-[var(--shadow-hover)] border border-transparent'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-transparent'
                )}
                title={effectiveIsCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent-primary)] rounded-l-md"
                  />
                )}

                {/* Icon */}
                <span className="flex-shrink-0">
                  <NavIcon name={item.icon} size={15} />
                </span>

                {/* Label + Badge */}
                <AnimatePresence initial={false}>
                  {!effectiveIsCollapsed && (
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

        {/* ── User Profile & Account Controls ──────────────────────── */}
        <AnimatePresence initial={false}>
          {!effectiveIsCollapsed && !isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-4 mb-2 flex flex-col gap-4 p-6 rounded-2xl border border-[rgba(118,192,67,0.15)] bg-[rgba(9,9,9,0.96)] backdrop-blur-[24px]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--sidebar-border)] pb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--sidebar-border)] flex items-center justify-center flex-shrink-0 text-lg font-orbitron font-bold text-[var(--color-text-primary)] uppercase">
                  {user?.user_metadata?.full_name?.charAt(0) || 'O'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase truncate">
                    {user?.user_metadata?.full_name || 'Operator'}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase mt-1">
                    AI Chief of Staff Operator
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-safe)] animate-pulse" />
                    <span className="text-[10px] text-[var(--color-risk-safe)] font-mono uppercase tracking-wider">Operational</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleToggleJudgeMode}
                  className="w-full h-12 rounded-lg border border-[var(--sidebar-border)] bg-[var(--color-bg-elevated)] text-[11px] font-bold tracking-widest text-[var(--color-text-primary)] uppercase hover:-translate-y-[1px] hover:border-[var(--color-border-focus)] transition-all flex items-center justify-center"
                >
                  {judgeMode ? 'EXIT JUDGE MODE' : 'ENTER JUDGE MODE'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-lg border border-[var(--color-risk-critical)]/30 bg-[var(--color-risk-critical-bg)] text-[11px] font-bold tracking-widest text-[var(--color-risk-critical)] uppercase hover:-translate-y-[1px] hover:bg-[var(--color-risk-critical)] hover:text-[var(--color-text-inverse)] transition-all flex items-center justify-center"
                >
                  LOGOUT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed User icon */}
        {effectiveIsCollapsed && !isFocusMode && (
          <div className="mx-auto mb-2 flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg border border-[var(--sidebar-border)] bg-[var(--color-bg-elevated)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-surface)] transition-colors" onClick={() => onToggle()}>
              <span className="text-sm font-bold text-[var(--color-text-primary)] font-orbitron">
                {user?.user_metadata?.full_name?.charAt(0) || 'O'}
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-safe)]" />
          </div>
        )}

        {/* ── Theme Toggle & Collapse Button ────────────────── */}
        <div
          className={cn(
            'border-t border-[var(--sidebar-border)] p-4 space-y-5 flex-shrink-0'
          )}
        >
          {!isFocusMode && <ThemeToggle collapsed={effectiveIsCollapsed} />}

          {/* Exit Focus Mode OR Collapse toggle */}
          {isFocusMode ? (
            <Link
              href="/"
              className={cn(
                'flex items-center rounded-lg border border-[var(--color-risk-critical)]/30',
                'bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical)]',
                'hover:bg-[var(--color-risk-critical)] hover:text-[var(--color-text-inverse)]',
                'transition-all duration-150 cursor-pointer justify-center h-9 w-9 mx-auto'
              )}
              title="Exit Focus Mode"
            >
              <Target size={14} strokeWidth={2} />
            </Link>
          ) : (
            <button
              id="sidebar-collapse-btn"
              onClick={onToggle}
              className={cn(
                'flex items-center rounded-lg border border-[var(--color-border)]',
                'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
                'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)]',
                'transition-all duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]',
                effectiveIsCollapsed ? 'h-9 w-9 mx-auto justify-center' : 'h-9 w-full px-3 gap-2.5'
              )}
              aria-label={effectiveIsCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={effectiveIsCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {effectiveIsCollapsed ? (
                <ChevronRight size={14} strokeWidth={1.5} />
              ) : (
                <>
                  <ChevronLeft size={14} strokeWidth={1.5} />
                  <span className="text-xs font-medium">Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
