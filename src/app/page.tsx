'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Shield, Target, Activity, AlertTriangle, BrainCircuit, Sunrise, Sun, Sunset, Moon, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSimulationEngine } from '@/hooks/useSimulationEngine'
import { SystemHealthPanel } from '@/components/dashboard/SystemHealthPanel'
import { ResolveConflictButton } from '@/components/intelligence/ResolveConflictButton'
import { ResponsibilityMap } from '@/components/dashboard/ResponsibilityMap'
import { getDynamicGreeting, getGreetingPeriod, formatLocalTime, formatLocalDate } from '@/lib/utils/greeting'
import { isJudgeMode } from '@/lib/demo/judgeSession'
import { supabase } from '@/lib/db/supabase'

function GreetingIcon({ period, className }: { period: string; className?: string }) {
  const props = { size: 28, strokeWidth: 1.5, className };
  if (period === 'morning') return <Sunrise {...props} />;
  if (period === 'afternoon') return <Sun {...props} />;
  if (period === 'evening') return <Sunset {...props} />;
  return <Moon {...props} />;
}

export default function CommandCenterPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [judgeActive, setJudgeActive] = useState(false);
  const [firstName, setFirstName] = useState<string>('OPERATOR');

  useEffect(() => {
    const checkName = (session: any) => {
      const metadata = session?.user?.user_metadata
      if (metadata?.optimus_display_name) {
        setFirstName(metadata.optimus_display_name.toUpperCase())
      } else if (metadata?.full_name) {
        setFirstName(metadata.full_name.split(' ')[0].toUpperCase())
      } else if (metadata?.name) {
        setFirstName(metadata.name.split(' ')[0].toUpperCase())
      } else {
        setFirstName('OPERATOR')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => checkName(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => checkName(session));

    const handleDisplayNameUpdate = () => {
      supabase.auth.getSession().then(({ data: { session } }) => checkName(session))
    }
    window.addEventListener('optimus-display-name-updated', handleDisplayNameUpdate)

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('optimus-display-name-updated', handleDisplayNameUpdate)
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setJudgeActive(isJudgeMode()), 0);
    const handleChange = () => setJudgeActive(isJudgeMode());
    window.addEventListener('judge-mode-changed', handleChange);
    return () => { clearTimeout(t); window.removeEventListener('judge-mode-changed', handleChange); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { obligations, riskProfiles, interventions, events, morningBriefing, executiveSummary, highestRiskTarget, agentStates, loading, error, isGmailConnected, isClassroomConnected, isCalendarConnected } = useSimulationEngine()

  const combinedData = useMemo(() => {
    if (!obligations.length || !riskProfiles.length) return []
    return riskProfiles.map(rp => ({
      ...rp,
      obligation: obligations.find(ob => ob.id === rp.obligation_id) || null
    })).sort((a, b) => b.risk_score - a.risk_score)
  }, [obligations, riskProfiles])

  if (loading) {
    return (
      <PageContainer id="command-center-loading">
        <div className="mb-6 animate-pulse">
          <div className="h-6 w-48 bg-[var(--color-bg-elevated)] rounded mb-2"></div>
          <div className="h-4 w-72 bg-[var(--color-bg-elevated)] rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="intel-card h-24 animate-pulse bg-[var(--color-bg-elevated)]"></div>)}
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer id="command-center-error">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertTriangle size={32} className="text-[var(--color-risk-critical)]" />
          <h2 className="text-lg font-bold text-[var(--color-risk-critical)]">Intelligence Core Offline</h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md text-center">{error}</p>
        </div>
      </PageContainer>
    )
  }

  const criticalCount = combinedData.filter(d => d.risk_band === 'Critical').length
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <PageContainer id="command-center-page">
      
      {/* ── Header: Animated Greeting ───────────────────────── */}
      <div className="mb-8 flex justify-between items-start gap-8">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`greeting-${currentTime.getHours()}-${currentTime.getMinutes()}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex items-center gap-4 mb-2"
            >
              <GreetingIcon period={getGreetingPeriod(currentTime)} className="text-[var(--color-accent-primary)] flex-shrink-0" />
              <h1 className="text-[clamp(24px,3vw,36px)] font-bold text-[var(--color-text-primary)] font-orbitron uppercase tracking-wide leading-none">
                {getDynamicGreeting(currentTime)}, {judgeActive ? 'JUDGE' : firstName}
              </h1>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`time-${currentTime.getMinutes()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-3 mb-5 font-inter"
            >
              <span>{formatLocalDate(currentTime)}</span>
              <span className="opacity-40">•</span>
              <span className="font-mono font-bold text-[var(--color-text-primary)]">{formatLocalTime(currentTime)}</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {judgeActive ? (
              <motion.div
                key="judge-status"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="inline-flex flex-col gap-1 px-5 py-3 rounded-xl border"
                style={{ background: 'rgba(255,152,0,0.08)', borderColor: 'rgba(255,152,0,0.35)' }}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-[#FF9800]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF9800]" style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>
                    Judge Demonstration Session
                  </span>
                </div>
                <p className="text-[10px] text-[#FF9800]/70 tracking-widest uppercase font-mono">
                  Read-Only • Seeded Dataset • All Features Explained Interactively
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="personal-status"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-6"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-mono">Chief of Staff Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-risk-safe)] animate-pulse" />
                    <span className="text-sm font-bold text-[var(--color-risk-safe)]" style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>Operational</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-mono">Active Commitments</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>{obligations.length}</span>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-mono">Critical Risk</span>
                  <span className="text-sm font-bold" style={{ color: criticalCount > 0 ? '#FF4444' : 'var(--color-risk-safe)', fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>{criticalCount}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* EXECUTIVE BRIEFING & HIGHEST RISK */}
          <div className="intel-card border-t-4 border-t-[var(--color-accent-primary)] bg-[var(--color-bg-surface)] p-7 relative overflow-hidden shadow-lg leading-relaxed">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-border)] pb-3">
              <BrainCircuit size={24} className="text-[var(--color-accent-primary)]" />
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] font-orbitron uppercase tracking-widest">
                Executive Briefing
              </h2>
              <div className="ml-auto flex gap-2">
                <span className="px-2 py-1 bg-[var(--color-bg-elevated)] rounded text-[10px] text-[var(--color-text-muted)] font-mono uppercase border border-[var(--color-border)]">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Morning Briefing</h3>
                <div id="executive-priority-panel" className="p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-line leading-relaxed">
                    {morningBriefing || executiveSummary || 'Systems nominal. No critical intelligence generated.'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--color-risk-high)] uppercase tracking-wider mb-3">Highest Risk Target</h3>
                <div className="p-5 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-[24px] font-bold text-[var(--color-risk-high)] mb-3 font-orbitron leading-tight">
                    {highestRiskTarget}
                  </p>
                  <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                    Requires immediate strategic management to prevent failure cascades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RESPONSIBILITY MATRIX */}
          <div id="responsibility-map">
            <ResponsibilityMap data={combinedData} />
          </div>

          {/* FUTURE OUTCOMES ENGINE */}
          <SectionContainer title="Future Outcomes Engine" spacing="none">
            <div className="intel-card p-6 h-[400px] flex flex-col">
              <p className="text-[13px] text-[var(--color-text-muted)] mb-6 flex items-center justify-between">
                <span>Targeting: <span className="font-bold text-[var(--color-text-primary)]">{highestRiskTarget && highestRiskTarget !== 'None' ? highestRiskTarget : 'Network'}</span></span>
                {agentStates.Future === 'ANALYZING' && <span className="animate-pulse text-[var(--color-accent-primary)]">Simulating...</span>}
              </p>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {combinedData[0]?.future_outcomes?.outcomes?.length > 0 ? combinedData[0].future_outcomes.outcomes.map((outcome: {type: string, successProbability: number, projectedResult: string}, i: number) => {
                  const outColor = outcome.type === 'Recommended' ? 'var(--color-risk-safe)' : 
                                  outcome.type === 'Current' ? 'var(--color-risk-monitor)' : 'var(--color-risk-critical)'
                  const bgStyle = outcome.type === 'Recommended' ? { backgroundColor: 'var(--color-risk-safe-bg)', borderColor: 'var(--color-risk-safe-border)' } : {}
                  
                  return (
                    <div key={i} id={i === 0 ? "future-simulator" : undefined} className="px-4 py-3 rounded-lg border border-[var(--color-border)] transition-all duration-500 flex flex-col justify-center" style={{...bgStyle}}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: outColor }}>
                          {outcome.type === 'Recommended' && <Target size={14} />}
                          {outcome.type === 'Current' && <Activity size={14} />}
                          {outcome.type === 'Danger' && <AlertTriangle size={14} />}
                          {outcome.type} Path
                        </p>
                        <motion.p 
                          key={outcome.successProbability}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          className="text-[20px] font-bold font-orbitron" 
                          style={{ color: outColor }}
                        >
                          {outcome.successProbability}%
                        </motion.p>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] opacity-80 truncate">{outcome.projectedResult}</p>
                    </div>
                  )
                }) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-6">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center">
                      <Shield size={16} className="text-[var(--color-risk-safe)]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">All Systems Stable</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] max-w-[180px] leading-relaxed">
                        OPTIMUS predicts no critical future risks. Operational state remains stable.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* ACTION CENTER */}
          <SectionContainer title="Action Center (Interventions)" spacing="none">
            <div id="accountability-layer" className="intel-card p-0 overflow-hidden h-[360px] overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {(() => {
                  const displayInterventions = (judgeActive && interventions.length === 0) 
                    ? [{
                        id: 'demo-int-mock',
                        obligation_id: 'demo-ob-mock',
                        type: 'Schedule Conflict Detected',
                        severity: 'critical',
                        message: 'CRITICAL: Client Strategy Meeting and Hackathon Submission both require full attention on the same day.',
                      }]
                    : interventions;

                  if (displayInterventions.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-8 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center">
                          <Shield size={16} className="text-[var(--color-risk-safe)]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">No Active Interventions</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                            OPTIMUS is monitoring all obligations. No conflicts detected.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return [...displayInterventions].sort((a, b) => {
                    const severityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
                    return (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
                  }).map((intervention, index) => {
                    const colorMap: Record<string, string> = {
                      low: 'var(--color-risk-safe)', medium: 'var(--color-risk-monitor)',
                      high: 'var(--color-risk-high)', critical: 'var(--color-risk-critical)',
                    }
                    const color = colorMap[intervention.severity] || 'var(--color-text-primary)'
                    
                    return (
                      <motion.div 
                        key={intervention.id} id={index === 0 ? "critical-intervention" : undefined}
                        layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        {intervention.type === 'Schedule Conflict Detected' ? (
                          <div className="flex flex-col p-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                                  <AlertTriangle size={14} className="text-[var(--color-text-muted)] transition-colors" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{intervention.type.toUpperCase()}</p>
                                  <p className="text-[11px] text-[var(--color-text-secondary)]">{intervention.message}</p>
                                </div>
                              </div>
                              <div className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 transition-colors duration-500" style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                                {intervention.severity}
                              </div>
                            </div>
                            <ResolveConflictButton eventId={intervention.obligation_id} />
                          </div>
                        ) : (
                          <Link href={`/obligations/${intervention.obligation_id}`}>
                            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors group cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                                  <AlertTriangle size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{intervention.type.toUpperCase()}</p>
                                  <p className="text-[11px] text-[var(--color-text-secondary)]">{intervention.message}</p>
                                </div>
                              </div>
                              <div className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 transition-colors duration-500" style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                                {intervention.severity}
                              </div>
                            </div>
                          </Link>
                        )}
                      </motion.div>
                    )
                  })
                })()}
              </AnimatePresence>
            </div>
          </SectionContainer>

          {/* SYSTEM HEALTH */}
          <SystemHealthPanel
            isGmailConnected={isGmailConnected}
            isClassroomConnected={isClassroomConnected}
            isCalendarConnected={isCalendarConnected}
          />

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

          {/* LIVE STREAM */}
          <SectionContainer title="Live System Events" spacing="none">
            <div className="intel-card p-0 overflow-hidden h-[400px] flex flex-col bg-[var(--color-bg-primary)]">
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
      </div>
    </PageContainer>
  )
}
