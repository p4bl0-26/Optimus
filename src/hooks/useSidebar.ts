'use client'

// ============================================================
// OPTIMUS — useSidebar Hook
// Manages sidebar collapsed/expanded and mobile open state
// ============================================================

import { useState, useCallback, useEffect } from 'react'
import { SIDEBAR } from '@/constants/design'

const STORAGE_KEY = 'optimus-sidebar-collapsed'

interface UseSidebarReturn {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

export function useSidebar(): UseSidebarReturn {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Restore persisted sidebar state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCollapsed(JSON.parse(stored))
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= SIDEBAR.mobileBreakpoint) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }, [])

  const collapse = useCallback(() => {
    setIsCollapsed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Ignore
    }
  }, [])

  const expand = useCallback(() => {
    setIsCollapsed(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'false')
    } catch {
      // Ignore
    }
  }, [])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  return {
    isCollapsed,
    isMobileOpen,
    toggle,
    collapse,
    expand,
    toggleMobile,
    closeMobile,
  }
}
