'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Activity, Shield, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationEngine } from '@/hooks/useSimulationEngine'
import { SystemHealthPanel } from '@/components/dashboard/SystemHealthPanel'

export default function SystemStatusPage() {
  const { events, agentStates, isGmailConnected, isClassroomConnected, isCalendarConnected } = useSimulationEngine()

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <PageContainer id="system-status-page">
      <div className="mb-8">
        <h1 className="text-[clamp(24px,3vw,36px)] font-bold text-[var(--color-text-primary)] font-orbitron uppercase tracking-wide leading-none flex items-center gap-3 mb-2">
          <Activity className="text-[var(--color-accent-primary)]" size={32} />
          System Status
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
          Live event stream and health monitoring for all OPTIMUS systems
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        
        {/* SYSTEM HEALTH & CONNECTED SOURCES */}
        <SectionContainer title="System Health & Connected Sources" spacing="none">
          <SystemHealthPanel
            isGmailConnected={isGmailConnected}
            isClassroomConnected={isClassroomConnected}
            isCalendarConnected={isCalendarConnected}
          />
        </SectionContainer>
        
        {/* ACTIVE ENGINES */}
        <SectionContainer title="Active Engines" spacing="none">
          <div className="intel-card p-4 space-y-3">
            {Object.entries(agentStates).map(([agent, state]) => (
              <div key={agent} className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-[12px] font-mono text-[var(--color-text-primary)]">{agent}</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: state !== 'IDLE' ? 'var(--color-risk-safe)' : 'var(--color-text-muted)' }} />
                  <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase text-right">
                    {state as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>

        {/* LIVE SYSTEM EVENTS */}
        <SectionContainer title="Live System Events" spacing="none">
          <div className="intel-card p-0 overflow-hidden h-[600px] flex flex-col bg-[var(--color-bg-primary)]">
            <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-2 bg-[var(--color-bg-secondary)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-primary)]"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Autonomous Event Stream</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              <AnimatePresence initial={false}>
                {events.map((evt) => {
                  const color = evt.type === 'system' ? 'var(--color-text-muted)' :
                                evt.type === 'alert' ? 'var(--color-risk-critical)' :
                                evt.type === 'success' ? 'var(--color-risk-safe)' : 'var(--color-accent-primary)'
                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 border-l-2 pl-3"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="text-[9px] font-mono text-[var(--color-text-muted)] flex-shrink-0 mt-0.5">
                        {formatTime(evt.timestamp)}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)]">
                        <span className="font-semibold" style={{ color }}>[{evt.type.toUpperCase()}]</span> {evt.message}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </SectionContainer>

      </div>
    </PageContainer>
  )
}
