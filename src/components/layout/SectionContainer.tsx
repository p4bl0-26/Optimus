'use client'

// ============================================================
// OPTIMUS — SectionContainer
// Vertical spacing between page sections with optional label
// ============================================================

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionContainerProps {
  children: ReactNode
  className?: string
  id?: string
  /** Optional section header */
  title?: string
  /** Optional subtitle/description */
  description?: string
  /** Optional right-side action slot */
  action?: ReactNode
  /** Spacing size variant */
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const SPACING_MAP = {
  none: '',
  sm: 'mb-4',
  md: 'mb-6',
  lg: 'mb-8',
} as const

export function SectionContainer({
  children,
  className,
  id,
  title,
  description,
  action,
  spacing = 'md',
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(SPACING_MAP[spacing], className)}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-3 gap-2">
          <div>
            {title && (
              <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
