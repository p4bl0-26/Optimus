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
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  Share2,
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
    localStorage.removeItem("optimus_judge_mode")
    sessionStorage.clear()
    
    window.history.replaceState({}, "", "/")
    router.replace('/')
  }

  // Force collapse logic
  const effectiveIsCollapsed = isCollapsed

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
        <Link
          href={judgeMode ? "/?mode=judge" : "/"}
          aria-label="Return to Command Center"
          title="Return to Command Center"
          className={cn(
            'group flex items-center border-b border-[var(--sidebar-border)]',
            'flex-shrink-0 h-24 cursor-pointer',
            effectiveIsCollapsed ? 'justify-center px-0' : 'px-6 gap-4'
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
                className="w-full h-full object-cover mix-blend-screen transition-transform duration-300 ease-in-out group-hover:scale-[1.03]" 
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
                  className="font-orbitron text-sm font-bold tracking-widest text-[var(--color-text-primary)] uppercase leading-none group-hover:text-[var(--color-accent-primary)] group-hover:drop-shadow-[0_0_8px_rgba(118,192,67,0.4)] transition-all duration-300"
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
        </Link>

        {/* ── Navigation Items ──────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 px-2">
          {NAV_ITEMS.map((item) => {
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

        {/* ── Unified Footer ──────────────────────── */}
        <div className={cn(
            "flex flex-col border-t border-[var(--sidebar-border)] transition-all duration-300 ease-in-out flex-shrink-0",
            effectiveIsCollapsed ? "p-4 items-center gap-4" : "p-6 gap-6"
          )}>
            {/* User Profile */}
            <div className={cn(
              "flex transition-all duration-300 ease-in-out w-full",
              effectiveIsCollapsed ? "justify-center" : "items-center gap-3"
            )}>
              {/* Avatar Container */}
              <div 
                className={cn(
                  "rounded-full bg-[var(--color-bg-elevated)] border border-[var(--sidebar-border)] flex items-center justify-center flex-shrink-0 text-lg font-orbitron font-bold text-[var(--color-text-primary)] uppercase transition-all duration-300 ease-in-out",
                  effectiveIsCollapsed ? "w-9 h-9 cursor-pointer hover:bg-[var(--color-bg-surface)]" : "w-10 h-10"
                )}
                onClick={effectiveIsCollapsed ? onToggle : undefined}
                title={effectiveIsCollapsed ? "Expand to view profile" : undefined}
              >
                {(user?.user_metadata?.optimus_display_name || user?.user_metadata?.full_name)?.charAt(0) || 'O'}
              </div>
              
              {/* User Info */}
              <AnimatePresence initial={false}>
                {!effectiveIsCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase truncate">
                      {user?.user_metadata?.optimus_display_name || user?.user_metadata?.full_name || 'Operator'}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase mt-1 truncate">
                      AI Chief of Staff Operator
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-safe)] animate-pulse" />
                      <span className="text-[10px] text-[var(--color-risk-safe)] font-mono uppercase tracking-wider">Operational</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons (Judge/Logout) */}
            <AnimatePresence initial={false}>
              {!effectiveIsCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex flex-col gap-2 overflow-hidden w-full"
                >
                  {judgeMode && (
                    <button
                      onClick={handleToggleJudgeMode}
                      className="w-full h-12 rounded-lg border border-[var(--sidebar-border)] bg-[var(--color-bg-elevated)] text-[11px] font-bold tracking-widest text-[var(--color-text-primary)] uppercase hover:-translate-y-[1px] hover:border-[var(--color-border-focus)] transition-all duration-300 ease-in-out flex items-center justify-center flex-shrink-0"
                    >
                      EXIT JUDGE MODE
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full h-12 rounded-lg border border-[var(--color-risk-critical)]/30 bg-[var(--color-risk-critical-bg)] text-[11px] font-bold tracking-widest text-[var(--color-risk-critical)] uppercase hover:-translate-y-[1px] hover:bg-[var(--color-risk-critical)] hover:text-[var(--color-text-inverse)] transition-all duration-300 ease-in-out flex items-center justify-center flex-shrink-0"
                  >
                    LOGOUT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse Button */}
            <div className={cn(
              "flex flex-col gap-4 transition-all duration-300 ease-in-out w-full",
              effectiveIsCollapsed ? "items-center" : ""
            )}>
              <button
                id="sidebar-collapse-btn"
                onClick={onToggle}
                className={cn(
                  'flex items-center rounded-lg border border-[var(--color-border)]',
                  'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
                  'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)]',
                  'transition-all duration-300 ease-in-out cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]',
                  effectiveIsCollapsed ? 'h-9 w-9 justify-center flex-shrink-0' : 'h-9 w-full px-3 gap-2.5 flex-shrink-0'
                )}
                aria-label={effectiveIsCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={effectiveIsCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {effectiveIsCollapsed ? (
                  <ChevronRight size={14} strokeWidth={1.5} />
                ) : (
                  <>
                    <ChevronLeft size={14} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="text-xs font-medium truncate">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
      </motion.aside>
    </>
  )
}
