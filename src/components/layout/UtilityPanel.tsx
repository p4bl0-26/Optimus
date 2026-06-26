'use client'

// ============================================================
// OPTIMUS — UtilityPanel (Phase 1.5 System Status)
// Shows active system status, agents, and live timestamps
// ============================================================

import { motion } from 'framer-motion'
import { X, Activity, Server, Cpu, Database, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface UtilityPanelProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

function StatusRow({ label, icon: Icon, delay }: { label: string; icon: React.ElementType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between py-2.5 border-b border-[var(--color-border-subtle)] last:border-0"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-[var(--color-text-muted)]" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-bold tracking-wider text-[var(--color-accent-primary)] uppercase">
          Active
        </span>
        <span className="status-dot w-1.5 h-1.5" />
      </div>
    </motion.div>
  )
}

export function UtilityPanel({
  isOpen = true,
  onClose,
  className,
}: UtilityPanelProps) {
  // Live relative timestamp simulation
  const [lastScan, setLastScan] = useState('just now')

  useEffect(() => {
    const timer = setInterval(() => {
      setLastScan('1 min ago')
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.aside
      id="utility-panel"
      animate={{ width: isOpen ? 340 : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'hidden xl:flex flex-col h-full flex-shrink-0 overflow-hidden',
        'bg-[var(--utility-panel-bg)] border-l border-[var(--utility-panel-border)]',
        className
      )}
      role="complementary"
      aria-label="Intelligence panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[var(--color-accent-primary)] animate-pulse" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[var(--color-text-primary)] tracking-wide">
            System Status
          </span>
        </div>
        {onClose && (
          <button
            id="utility-panel-close"
            onClick={onClose}
            className={cn(
              'w-7 h-7 rounded flex items-center justify-center',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]',
              'transition-all duration-150'
            )}
            aria-label="Close intelligence panel"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Status */}
        <div className="intel-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                System Health
              </p>
              <p className="text-sm font-bold text-[var(--color-risk-safe)] flex items-center gap-2">
                Operational
                <span className="w-2 h-2 rounded-full bg-[var(--color-risk-safe)] animate-ping-slow" />
              </p>
            </div>
            <Server size={20} className="text-[var(--color-accent-primary)] opacity-50" strokeWidth={1.5} />
          </div>
          
          <div className="bg-[var(--color-bg-primary)] rounded p-2.5 flex items-center justify-between border border-[var(--color-border-subtle)]">
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Last Scan</span>
            <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">{lastScan}</span>
          </div>
        </div>

        {/* Intelligence Engines */}
        <div className="intel-card p-4">
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
            Active Engines
          </p>
          <div className="space-y-1">
            <StatusRow label="Discovery Agent" icon={Eye} delay={0.1} />
            <StatusRow label="Risk Engine" icon={Activity} delay={0.2} />
            <StatusRow label="Briefing Engine" icon={Database} delay={0.3} />
            <StatusRow label="Future Outcome Engine" icon={Cpu} delay={0.4} />
          </div>
        </div>

        {/* Live Event Log (Aesthetic) */}
        <div className="intel-card p-4">
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-3 flex items-center justify-between">
            Live Stream
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
          </p>
          <div className="space-y-3 font-mono text-[9px] text-[var(--color-text-muted)]">
            <p className="flex gap-2">
              <span className="text-[var(--color-accent-primary)] opacity-70">12:24:01</span>
              <span>[RISK] Recalculating system baseline... OK</span>
            </p>
            <p className="flex gap-2">
              <span className="text-[var(--color-accent-primary)] opacity-70">12:23:45</span>
              <span>[SYNC] Gmail calendar sync completed</span>
            </p>
            <p className="flex gap-2">
              <span className="text-[var(--color-accent-primary)] opacity-70">12:22:10</span>
              <span>[DISCOVERY] 18 active obligations tracked</span>
            </p>
            <p className="flex gap-2">
              <span className="text-[var(--color-accent-primary)] opacity-70">12:20:00</span>
              <span>[CORE] AI Chief of Staff initialized</span>
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
