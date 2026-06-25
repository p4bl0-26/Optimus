'use client'

// ============================================================
// OPTIMUS — PageContainer
// Consistent horizontal padding and max-width for all pages
// ============================================================

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  id?: string
  /**
   * Whether to constrain max width (true for most pages).
   * Set to false for full-bleed layouts like the network view.
   */
  constrained?: boolean
}

export function PageContainer({
  children,
  className,
  id,
  constrained = false,
}: PageContainerProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex-1 overflow-y-auto',
        'px-4 md:px-6 py-5',
        constrained && 'max-w-[1400px] mx-auto w-full',
        className
      )}
    >
      {children}
    </div>
  )
}
