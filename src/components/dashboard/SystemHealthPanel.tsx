'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────
type ServiceStatus = 'checking' | 'online' | 'offline' | 'degraded'

interface ServiceHealth {
  name: string
  status: ServiceStatus
  latency?: number
  detail?: string
}

// ─── Quick client-side health checks ─────────────────────────
async function checkSupabase(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch('/api/health/supabase', { method: 'GET', cache: 'no-store' })
    const latency = Date.now() - start
    if (res.ok) return { name: 'Supabase', status: 'online', latency }
    return { name: 'Supabase', status: 'degraded', latency, detail: `HTTP ${res.status}` }
  } catch {
    return { name: 'Supabase', status: 'offline', detail: 'Connection refused' }
  }
}

async function checkGemini(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch('/api/health/gemini', { method: 'GET', cache: 'no-store' })
    const latency = Date.now() - start
    if (res.ok) return { name: 'Gemini AI', status: 'online', latency }
    return { name: 'Gemini AI', status: 'degraded', latency, detail: `HTTP ${res.status}` }
  } catch {
    return { name: 'Gemini AI', status: 'offline', detail: 'Connection refused' }
  }
}

// ─── Status Indicator ─────────────────────────────────────────
function StatusRow({ service, index }: { service: ServiceHealth, index: number }) {
  const isOnline = service.status === 'online'
  const isDegraded = service.status === 'degraded'
  const isOffline = service.status === 'offline'
  const isChecking = service.status === 'checking'

  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-3 border-b border-[var(--color-border-subtle)] last:border-0",
      index % 2 === 0 ? "bg-[var(--color-bg-secondary)]" : "bg-transparent",
      !isOnline && "opacity-60"
    )}>
      <span className="text-[13px] text-[var(--color-text-secondary)] font-medium">{service.name}</span>
      <div className="flex items-center gap-2">
        {service.latency && (
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{service.latency}ms</span>
        )}
        {isChecking && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
        {isOnline && <CheckCircle size={14} className="text-[var(--color-risk-safe)]" />}
        {isDegraded && <AlertTriangle size={14} className="text-[var(--color-risk-monitor)]" />}
        {isOffline && <AlertTriangle size={14} className="text-[var(--color-risk-critical)]" />}
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          isOnline && 'text-[var(--color-risk-safe)]',
          isDegraded && 'text-[var(--color-text-primary)]',
          isOffline && 'text-[var(--color-text-primary)]',
          isChecking && 'text-[var(--color-text-muted)]'
        )}>
          {isChecking ? '···' : service.status}
        </span>
      </div>
    </div>
  )
}

// ─── Integration Status (from props, passed from parent) ──────
interface SystemHealthPanelProps {
  isGmailConnected?: boolean
  isClassroomConnected?: boolean
  isCalendarConnected?: boolean
  lastSync?: string
}

export function SystemHealthPanel({
  isGmailConnected = false,
  isClassroomConnected = false,
  isCalendarConnected = false,
  lastSync,
}: SystemHealthPanelProps) {
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Gmail', status: isGmailConnected ? 'online' : 'offline' },
    { name: 'Classroom', status: isClassroomConnected ? 'online' : 'offline' },
    { name: 'Calendar', status: isCalendarConnected ? 'online' : 'offline' },
    { name: 'Gemini AI', status: 'checking' },
    { name: 'Supabase', status: 'checking' },
  ])
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function runChecks() {
    setIsRefreshing(true)
    setServices(prev => prev.map(s =>
      s.name === 'Gemini AI' || s.name === 'Supabase' ? { ...s, status: 'checking' } : s
    ))

    const [supabaseResult, geminiResult] = await Promise.all([checkSupabase(), checkGemini()])

    setServices([
      { name: 'Gmail', status: isGmailConnected ? 'online' : 'offline' },
      { name: 'Classroom', status: isClassroomConnected ? 'online' : 'offline' },
      { name: 'Calendar', status: isCalendarConnected ? 'online' : 'offline' },
      geminiResult,
      supabaseResult,
    ])
    setLastChecked(new Date())
    setIsRefreshing(false)
  }

  // Intentional: runChecks is async and performs network calls — deferred to avoid sync setState lint
  useEffect(() => {
    const t = setTimeout(() => { runChecks() }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGmailConnected, isClassroomConnected, isCalendarConnected])

  const allOnline = services.every(s => s.status === 'online')
  const anyOffline = services.some(s => s.status === 'offline')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="intel-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            allOnline ? 'bg-[var(--color-risk-safe)] animate-pulse' :
            anyOffline ? 'bg-[var(--color-risk-critical)]' :
            'bg-[var(--color-risk-monitor)] animate-pulse'
          )} />
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
            System Health
          </p>
        </div>
        <button
          onClick={runChecks}
          disabled={isRefreshing}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
          title="Refresh health status"
        >
          <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Service Rows */}
      <div className="space-y-0 rounded-lg overflow-hidden border border-[var(--color-border-subtle)]">
        {services.map((service, index) => (
          <StatusRow key={service.name} service={service} index={index} />
        ))}
      </div>

      {/* Last Sync */}
      {lastChecked && (
        <p className="text-[9px] text-[var(--color-text-muted)] mt-3">
          Last checked: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </motion.div>
  )
}
