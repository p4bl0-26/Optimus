'use client'

// ============================================================
// OPTIMUS — AppShell
// Three-column layout: Sidebar | MainContent | UtilityPanel
// This is the primary layout wrapper for all authenticated pages
// ============================================================

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { UtilityPanel } from './UtilityPanel'
import { useSidebar } from '@/hooks/useSidebar'

interface AppShellProps {
  children: ReactNode
  showUtilityPanel?: boolean
}

export function AppShell({ children, showUtilityPanel = true }: AppShellProps) {
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } = useSidebar()

  return (
    <div
      id="app-shell"
      className="relative flex h-dvh overflow-hidden bg-[var(--color-bg-primary)]"
    >
      {/* ── Subtle Matrix Background ──────────────────────── */}
      <div className="matrix-bg" aria-hidden="true" />

      {/* ── Sidebar ──────────────────────────────────────── */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={closeMobile}
      />

      {/* ── Main Column (TopBar + Content) ───────────────── */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 h-full relative z-10',
          'transition-all duration-250'
        )}
      >
        <TopBar onMobileMenuToggle={toggleMobile} />

        {/* ── Content Row (scrollable main + utility panel) ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scrollable main content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto relative"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>

          {/* Right intelligence panel */}
          {showUtilityPanel && <UtilityPanel />}
        </div>
      </div>
    </div>
  )
}
