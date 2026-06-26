'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Shield, Target, Zap, AlertTriangle, Clock, ArrowRight, BrainCircuit, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import Link from 'next/link'
import { useSimulationEngine } from '@/hooks/useSimulationEngine'
import { runDiscoveryAction, runClassroomDiscoveryAction, runCalendarDiscoveryAction } from '@/app/actions/discovery'
import { SystemHealthPanel } from '@/components/dashboard/SystemHealthPanel'


// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent = 'default',
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'default' | 'critical' | 'monitor' | 'safe'
}) {
  const accentColor = {
    default: 'var(--color-text-primary)',
    critical: 'var(--color-risk-critical)',
    monitor: 'var(--color-risk-monitor)',
    safe: 'var(--color-risk-safe)',
  }[accent]

  return (
    <div className="intel-card p-4 transition-all duration-500">
      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1.5 flex justify-between">
        {label}
        <span className="opacity-50">#</span>
      </p>
      <motion.p
        key={value}
        initial={{ opacity: 0.5, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold font-orbitron"
        style={{ color: accentColor, fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
      >
        {value}
      </motion.p>
      {sub && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>
      )}
    </div>
  )
}

// ─── Live Network Node Component ──────────────────────────────
function NetworkNode({ x, y, label, risk, delay, id }: { x: string; y: string; label: string; risk: string; delay: number; id: string }) {
  const colorMap: Record<string, string> = {
    Safe: 'var(--color-risk-safe)',
    Monitor: 'var(--color-risk-monitor)',
    'High Risk': 'var(--color-risk-high)',
    Critical: 'var(--color-risk-critical)',
  }
  const color = colorMap[risk] || 'var(--color-text-primary)'

  return (
    <Link href={`/obligations/${id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay, type: 'spring' }}
        className="absolute flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        style={{ left: x, top: y }}
      >
        <div 
          className="relative flex items-center justify-center w-8 h-8 rounded-full border z-10 transition-colors duration-1000"
          style={{ background: `${color}15`, borderColor: `${color}40` }}
        >
          <span className="w-2 h-2 rounded-full transition-colors duration-1000" style={{ background: color }} />
          {risk === 'Critical' && (
            <span className="absolute w-full h-full rounded-full animate-ping" style={{ border: `1px solid ${color}` }} />
          )}
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-2 py-1 rounded text-[10px] font-medium text-[var(--color-text-secondary)] whitespace-nowrap shadow-sm">
          {label}
        </div>
      </motion.div>
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function CommandCenterPage() {
  const { obligations, riskProfiles, interventions, events, briefing, agentStates, loading, error, isGmailConnected, gmailAccountEmail, isClassroomConnected, isCalendarConnected, executiveSummary, morningBriefing, eveningBriefing, highestRiskTarget, recommendedFocus, strategicRecommendations, overloadedDays } = useSimulationEngine()

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
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="intel-card h-24 animate-pulse bg-[var(--color-bg-elevated)]"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="intel-card h-64 animate-pulse bg-[var(--color-bg-elevated)]"></div>
          <div className="intel-card h-64 animate-pulse bg-[var(--color-bg-elevated)]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 intel-card h-[380px] animate-pulse bg-[var(--color-bg-elevated)]"></div>
          <div className="lg:col-span-1 intel-card h-[380px] animate-pulse bg-[var(--color-bg-elevated)]"></div>
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

  const highRiskCount = combinedData.filter(d => d.risk_band === 'Critical' || d.risk_band === 'High Risk').length
  const safeCount = combinedData.filter(d => d.risk_band === 'Safe' || d.risk_band === 'Monitor').length

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <PageContainer id="command-center-page">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1 font-orbitron">
            Good morning, Himank
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-2 mb-4">
            <BotIcon /> OPTIMUS AI Chief of Staff is monitoring your obligations.
          </p>
          <div className="flex items-center gap-3">
            {isGmailConnected ? (
              <button 
                disabled
                title={gmailAccountEmail ? `Connected to ${gmailAccountEmail}` : undefined}
                className="px-3 py-1.5 rounded bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] text-xs font-bold text-[var(--color-risk-safe)] flex items-center gap-1 opacity-100"
              >
                Gmail Connected ✓
              </button>
            ) : (
              <a href="/api/integrations/gmail/connect" className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors">
                Connect Gmail
              </a>
            )}
            {isClassroomConnected ? (
              <button
                disabled
                className="px-3 py-1.5 rounded bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] text-xs font-bold text-[var(--color-risk-safe)] flex items-center gap-1 opacity-100"
              >
                Classroom Connected ✓
              </button>
            ) : (
              <a
                href="/api/integrations/classroom/connect"
                className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors"
              >
                Connect Classroom
              </a>
            )}
            {isCalendarConnected ? (
              <button
                disabled
                className="px-3 py-1.5 rounded bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] text-xs font-bold text-[var(--color-risk-safe)] flex items-center gap-1 opacity-100"
              >
                Calendar Connected ✓
              </button>
            ) : (
              <a
                href="/api/integrations/calendar/connect"
                className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors"
              >
                Connect Calendar
              </a>
            )}
            <button 
              onClick={async (e) => {
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Scanning Inbox...';
                btn.disabled = true;
                const res = await runDiscoveryAction();
                if (res.success) {
                  const count = res.newObligations ?? 0;
                  btn.innerHTML = count > 0 ? `Found ${count} New` : 'Inbox Clean';
                } else {
                  btn.innerHTML = 'Error!';
                }
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                }, 3000);
              }} 
              className="px-3 py-1.5 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Zap size={12} /> Run Discovery Sweep
            </button>
            <button
              onClick={async (e) => {
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Scanning Courses...';
                btn.disabled = true;
                const res = await runClassroomDiscoveryAction();
                if (res.success) {
                  const count = res.newObligations ?? 0;
                  btn.innerHTML = count > 0 ? `Found ${count} New` : 'Courses Clean';
                } else {
                  btn.innerHTML = 'Error!';
                }
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                }, 3000);
              }}
              className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] text-xs font-bold hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)] transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Zap size={12} /> Run Classroom Sweep
            </button>
            <button
              onClick={async (e) => {
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Scanning Calendar...';
                btn.disabled = true;
                const res = await runCalendarDiscoveryAction();
                if (res.success) {
                  const count = res.newObligations ?? 0;
                  btn.innerHTML = count > 0 ? `Found ${count} New` : 'Calendar Clean';
                } else {
                  btn.innerHTML = 'Error!';
                }
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                }, 3000);
              }}
              className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] text-xs font-bold hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)] transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Zap size={12} /> Run Calendar Sweep
            </button>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mb-2">Agent Status</p>
          <div className="flex flex-col items-end gap-1.5">
            {Object.entries(agentStates).map(([agent, state]) => (
              <div key={agent} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-wider">{agent}</span>
                <span className="text-[9px] font-bold tracking-widest text-[var(--color-text-primary)] uppercase w-[60px] text-right">
                  {state as string}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${state !== 'IDLE' ? 'bg-[var(--color-risk-safe)] animate-pulse' : 'bg-[var(--color-text-muted)]'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── EXECUTIVE BRIEFING HERO ──────────────────────────── */}
      <SectionContainer spacing="lg">
        <div className="intel-card border-t-4 border-t-[var(--color-accent-primary)] bg-[var(--color-bg-surface)] p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Briefing & Warnings */}
            <div className="col-span-1 lg:col-span-2 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Morning Briefing</h3>
                <div className="p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-line leading-relaxed">
                    {morningBriefing || executiveSummary || 'Systems nominal. No critical intelligence generated.'}
                  </p>
                </div>
              </div>

              {overloadedDays && overloadedDays.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-risk-critical)] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> Overloaded Day Warning
                  </h3>
                  <div className="p-3 bg-[var(--color-risk-critical-bg)] border border-[var(--color-risk-critical)]/30 rounded-lg">
                    <p className="text-sm font-medium text-[var(--color-risk-critical)]">
                      {overloadedDays.join(', ')} exceed safe workload thresholds. Rescheduling advised.
                    </p>
                  </div>
                </div>
              )}

              {strategicRecommendations && strategicRecommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Strategic Recommendations</h3>
                  <div className="space-y-2">
                    {strategicRecommendations.map(rec => (
                      <div key={rec.priority} className="flex gap-3 p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-[var(--color-accent-primary)]">{rec.priority}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{rec.recommendation}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Focus & Targets */}
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-[var(--color-risk-high)] uppercase tracking-wider mb-2">Highest Risk Target</h3>
                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] h-full">
                  <p className="text-lg font-bold text-[var(--color-risk-high)] mb-2 font-orbitron">
                    {highestRiskTarget}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Requires immediate strategic management to prevent failure cascades.
                  </p>
                </div>
              </div>

              {recommendedFocus && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Target size={12} /> Today&apos;s Focus
                  </h3>
                  <div className="p-4 bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                      <span className="text-[10px] font-mono font-bold text-[var(--color-accent-primary)] opacity-80">
                        CONF: {recommendedFocus.confidence}%
                      </span>
                    </div>
                    <p className="text-md font-bold text-[var(--color-text-primary)] mb-2 pr-12">
                      {recommendedFocus.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                      <span className="font-semibold text-[var(--color-accent-primary)]">Reason: </span>
                      {recommendedFocus.reason}
                    </p>
                    <Link
                      href="/focus"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent-secondary)] transition-colors w-full justify-center"
                    >
                      <Target size={14} /> Focus Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* ─── HERO NETWORK & OUTCOMES ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Obligation Network */}
        <SectionContainer title="Responsibility Map" className="lg:col-span-2" spacing="none">
          <div className="relative w-full h-[380px] intel-card flex items-center justify-center overflow-hidden bg-gradient-to-b from-transparent to-[var(--color-bg-secondary)]/30">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-matrix-grid) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: 'spring' }}
              className="relative z-20 flex flex-col items-center justify-center"
            >
              <div className="absolute w-64 h-64 rounded-full border border-[var(--color-accent-primary)]/10 animate-ping-slow" style={{ animationDuration: '4s' }} />
              <div className="absolute w-40 h-40 rounded-full border border-[var(--color-accent-primary)]/20" />
              
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/40 shadow-[var(--shadow-glow)] backdrop-blur-md">
                <Shield size={28} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-risk-critical)] animate-pulse" />
              </div>
              <p className="mt-4 text-xs font-bold font-orbitron text-[var(--color-text-primary)] tracking-widest">USER CORE</p>
            </motion.div>

            {/* Dynamic Nodes from Combined Data */}
            {combinedData.slice(0, 6).map((d, i) => {
              const positions = [
                {x: '15%', y: '20%'}, {x: '70%', y: '15%'}, {x: '80%', y: '55%'}, 
                {x: '10%', y: '65%'}, {x: '30%', y: '80%'}, {x: '65%', y: '85%'}
              ]
              const pos = positions[i % positions.length]
              return <NetworkNode key={d.obligation_id} id={d.obligation_id} x={pos.x} y={pos.y} label={d.obligation?.title || 'Unknown'} risk={d.risk_band} delay={0} />
            })}

            {/* Connection Lines (Simulated SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.3 }}>
              <g stroke="var(--color-border-focus)" strokeWidth="1" fill="none" className="opacity-40">
                <path d="M 50% 50% L 15% 20%" strokeDasharray="4 4" className="animate-pulse" />
                <path d="M 50% 50% L 70% 15%" />
                <path d="M 50% 50% L 80% 55%" />
                <path d="M 50% 50% L 10% 65%" />
                <path d="M 50% 50% L 30% 80%" />
              </g>
            </svg>
          </div>
        </SectionContainer>

        {/* Future Outcomes (Linked to highest risk target) */}
        <SectionContainer title="Future Outcomes Engine" className="lg:col-span-1" spacing="none">
          <div className="intel-card p-5 h-[380px] flex flex-col">
            <p className="text-[11px] text-[var(--color-text-muted)] mb-4 flex items-center justify-between">
              <span>Targeting: <span className="font-bold text-[var(--color-text-primary)]">{highestRiskTarget && highestRiskTarget !== 'None' ? highestRiskTarget : 'Network'}</span></span>
              {agentStates.Future === 'ANALYZING' && <span className="animate-pulse text-[var(--color-accent-primary)]">Simulating...</span>}
            </p>
            
            <div className="space-y-4 flex-1">
              {/* Displaying simple default outcomes if none stored in jsonb, else map jsonb */}
              {combinedData[0]?.future_outcomes?.outcomes?.length > 0 ? combinedData[0].future_outcomes.outcomes.map((outcome: {type: string, successProbability: number, projectedResult: string}, i: number) => {
                const outColor = outcome.type === 'Recommended' ? 'var(--color-risk-safe)' : 
                                outcome.type === 'Current' ? 'var(--color-risk-monitor)' : 'var(--color-risk-critical)'
                const bgStyle = outcome.type === 'Recommended' ? { backgroundColor: 'var(--color-risk-safe-bg)', borderColor: 'var(--color-risk-safe-border)' } : {}
                
                return (
                  <div key={i} className="p-3 rounded-lg border border-[var(--color-border)] transition-all duration-500" style={{...bgStyle}}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: outColor }}>
                        {outcome.type === 'Recommended' && <Target size={12} />}
                        {outcome.type === 'Current' && <Activity size={12} />}
                        {outcome.type === 'Danger' && <AlertTriangle size={12} />}
                        {outcome.type} Path
                      </p>
                      <motion.p 
                        key={outcome.successProbability}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="text-lg font-bold font-orbitron" 
                        style={{ color: outColor }}
                      >
                        {outcome.successProbability}%
                      </motion.p>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{outcome.projectedResult}</p>
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

      {/* ─── INSIGHTS & ACTIONS ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Dynamic Event Stream */}
        <SectionContainer title="Live System Events">
          <div className="intel-card p-0 overflow-hidden h-[300px] flex flex-col bg-[var(--color-bg-primary)]">
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

        {/* System Health + Action Center Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* System Health */}
          <div className="lg:col-span-1">
            <SystemHealthPanel
              isGmailConnected={isGmailConnected}
              isClassroomConnected={isClassroomConnected}
              isCalendarConnected={isCalendarConnected}
            />
          </div>

          {/* Dynamic Action Center */}
          <div className="lg:col-span-2">
          <SectionContainer title="Action Center (Interventions)">
            <div className="intel-card p-0 overflow-hidden h-[300px] overflow-y-auto scrollbar-hide">
            <AnimatePresence>
              {interventions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center">
                    <Shield size={16} className="text-[var(--color-risk-safe)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">No Active Interventions</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                      OPTIMUS is monitoring all obligations. No conflicts or overloads detected.
                    </p>
                  </div>
                </div>
              )}
              {[...interventions].sort((a, b) => {
                const severityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
                return (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
              }).map((intervention) => {
                const colorMap: Record<string, string> = {
                  low: 'var(--color-risk-safe)',
                  medium: 'var(--color-risk-monitor)',
                  high: 'var(--color-risk-high)',
                  critical: 'var(--color-risk-critical)',
                }
                const color = colorMap[intervention.severity] || 'var(--color-text-primary)'
                
                return (
                <motion.div 
                  key={intervention.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
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
                      <div 
                        className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 transition-colors duration-500"
                        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                      >
                        {intervention.severity}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )})}
            </AnimatePresence>
            </div>
          </SectionContainer>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

function BotIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent-primary)]"><rect width="18" height="14" x="3" y="8" rx="2"/><path d="M12 5a3 3 0 1 0-3 3"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
}
