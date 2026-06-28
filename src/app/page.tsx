'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Shield, Brain, Zap, Clock, Calendar, CheckCircle2, AlertTriangle, Target, Activity, ArrowRight, Crosshair, Map, Briefcase, GraduationCap, BrainCircuit, Sunrise, Sun, Sunset, Moon, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSimulationEngine } from '@/hooks/useSimulationEngine'
import { runDiscoveryAction, runClassroomDiscoveryAction, runCalendarDiscoveryAction } from '@/app/actions/discovery'
import { SystemHealthPanel } from '@/components/dashboard/SystemHealthPanel'
import { ResolveConflictButton } from '@/components/intelligence/ResolveConflictButton'
import { ResponsibilityMap } from '@/components/dashboard/ResponsibilityMap'
import { getDynamicGreeting, getGreetingPeriod, formatLocalTime, formatLocalDate } from '@/lib/utils/greeting'
import { isJudgeMode } from '@/lib/demo/judgeSession'
import { supabase } from '@/lib/db/supabase'


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

// (NetworkNode is removed, implemented in ResponsibilityMap)

// ─── Greeting Icon ────────────────────────────────────────────
function GreetingIcon({ period, className }: { period: string; className?: string }) {
  const props = { size: 28, strokeWidth: 1.5, className };
  if (period === 'morning') return <Sunrise {...props} />;
  if (period === 'afternoon') return <Sun {...props} />;
  if (period === 'evening') return <Sunset {...props} />;
  return <Moon {...props} />;
}

// ─── Main Page ────────────────────────────────────────────────
export default function CommandCenterPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [judgeActive, setJudgeActive] = useState(false);
  const [firstName, setFirstName] = useState<string>('OPERATOR');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.full_name) {
        const name = session.user.user_metadata.full_name.split(' ')[0];
        setFirstName(name.toUpperCase());
      } else if (session?.user?.user_metadata?.name) {
        const name = session.user.user_metadata.name.split(' ')[0];
        setFirstName(name.toUpperCase());
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user?.user_metadata?.full_name) {
        const name = session.user.user_metadata.full_name.split(' ')[0];
        setFirstName(name.toUpperCase());
      } else if (session?.user?.user_metadata?.name) {
        const name = session.user.user_metadata.name.split(' ')[0];
        setFirstName(name.toUpperCase());
      } else {
        setFirstName('OPERATOR');
      }
    });

    return () => {
      subscription.unsubscribe();
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
  const criticalCount = combinedData.filter(d => d.risk_band === 'Critical').length
  const safeCount = combinedData.filter(d => d.risk_band === 'Safe' || d.risk_band === 'Monitor').length

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <PageContainer id="command-center-page">
      {/* ── Header: Animated Greeting ───────────────────────── */}
      <div className="mb-8 flex justify-between items-start gap-8">
        <div className="flex-1 min-w-0">

          {/* Greeting line with smooth fade every minute */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`greeting-${currentTime.getHours()}-${currentTime.getMinutes()}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex items-center gap-4 mb-2"
            >
              <GreetingIcon
                period={getGreetingPeriod(currentTime)}
                className="text-[var(--color-accent-primary)] flex-shrink-0"
              />
              <h1
                className="text-[clamp(24px,3vw,36px)] font-bold text-[var(--color-text-primary)] font-orbitron uppercase tracking-wide leading-none"
              >
                {getDynamicGreeting(currentTime)}, {judgeActive ? 'JUDGE' : firstName}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Date & time line */}
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

          {/* Status block — personal vs judge */}
          <AnimatePresence mode="wait">
            {judgeActive ? (
              <motion.div
                key="judge-status"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="inline-flex flex-col gap-1 px-5 py-3 rounded-xl border"
                style={{
                  background: 'rgba(255,152,0,0.08)',
                  borderColor: 'rgba(255,152,0,0.35)',
                }}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-[#FF9800]" />
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF9800]"
                    style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
                  >
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
                    <span
                      className="text-sm font-bold text-[var(--color-risk-safe)]"
                      style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
                    >
                      Operational
                    </span>
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-mono">Active Commitments</span>
                  <span
                    className="text-sm font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
                  >
                    {obligations.length}
                  </span>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-mono">Critical Risk</span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: criticalCount > 0 ? '#FF4444' : 'var(--color-risk-safe)',
                      fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)',
                    }}
                  >
                    {criticalCount}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Integration buttons row */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
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

      {/* ─── RESPONSIBILITY MATRIX HERO ────────────────────────── */}
      <div id="responsibility-matrix" className="mb-8">
        <ResponsibilityMap data={combinedData} />
      </div>

      {/* ─── EXECUTIVE BRIEFING HERO ──────────────────────────── */}
      <div id="executive-briefing">
      <SectionContainer spacing="lg">
        <div className="intel-card border-t-4 border-t-[var(--color-accent-primary)] bg-[var(--color-bg-surface)] p-7 relative overflow-hidden shadow-lg leading-relaxed">
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
                  <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Strategic Recommendations</h3>
                  <div className="space-y-4">
                    {strategicRecommendations.map(rec => (
                      <div key={rec.priority} className="flex gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] items-start">
                        <div className="text-2xl font-bold font-orbitron text-[var(--color-text-muted)] opacity-50 w-8 flex-shrink-0 pt-1">
                          0{rec.priority}
                        </div>
                        <div>
                          <p className="text-base font-medium text-[var(--color-text-primary)] mb-1">{rec.recommendation}</p>
                          <p className="text-[13px] text-[var(--color-text-secondary)] opacity-70 leading-relaxed">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Focus & Targets */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[var(--color-risk-high)] uppercase tracking-wider mb-3">Highest Risk Target</h3>
                <div className="p-5 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] h-full">
                  <p className="text-[24px] font-bold text-[var(--color-risk-high)] mb-3 font-orbitron leading-tight">
                    {highestRiskTarget}
                  </p>
                  <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                    Requires immediate strategic management to prevent failure cascades.
                  </p>
                </div>
              </div>

              {recommendedFocus && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Target size={12} /> Today&apos;s Focus
                  </h3>
                  <div id="focus-mode" className="p-5 bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 rounded-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 rounded-full bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)]/40 text-[10px] font-mono font-bold text-[var(--color-accent-primary)]">
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
      </div>


      {/* ─── REMAINING INTELLIGENCE MODULES ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Future Outcomes (Linked to highest risk target) */}
        <div id="future-outcomes" className="xl:col-span-1">
        <SectionContainer title="Future Outcomes Engine" spacing="none">
          <div className="intel-card p-6 h-[480px] flex flex-col">
            <p className="text-[13px] text-[var(--color-text-muted)] mb-6 flex items-center justify-between">
              <span>Targeting: <span className="font-bold text-[var(--color-text-primary)]">{highestRiskTarget && highestRiskTarget !== 'None' ? highestRiskTarget : 'Network'}</span></span>
              {agentStates.Future === 'ANALYZING' && <span className="animate-pulse text-[var(--color-accent-primary)]">Simulating...</span>}
            </p>
            
            <div className="space-y-5 flex-1">
              {/* Displaying simple default outcomes if none stored in jsonb, else map jsonb */}
              {combinedData[0]?.future_outcomes?.outcomes?.length > 0 ? combinedData[0].future_outcomes.outcomes.map((outcome: {type: string, successProbability: number, projectedResult: string}, i: number) => {
                const outColor = outcome.type === 'Recommended' ? 'var(--color-risk-safe)' : 
                                outcome.type === 'Current' ? 'var(--color-risk-monitor)' : 'var(--color-risk-critical)'
                const bgStyle = outcome.type === 'Recommended' ? { backgroundColor: 'var(--color-risk-safe-bg)', borderColor: 'var(--color-risk-safe-border)' } : {}
                
                return (
                  <div key={i} className="px-4 py-0 h-14 rounded-lg border border-[var(--color-border)] transition-all duration-500 flex flex-col justify-center" style={{...bgStyle}}>
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
                        className="text-[24px] font-bold font-orbitron" 
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
      </div>
      {/* ─── INSIGHTS & ACTIONS ─────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Dynamic Event Stream */}
        <SectionContainer title="Live System Events">
          <div className="intel-card p-0 overflow-hidden h-[360px] flex flex-col bg-[var(--color-bg-primary)]">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <SectionContainer title="Action Center (Interventions)" spacing="none">
            <div id="accountability-layer" className="intel-card p-0 overflow-hidden h-[360px] overflow-y-auto scrollbar-hide">
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
                        <div 
                          className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 transition-colors duration-500"
                          style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                        >
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
                        <div 
                          className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 transition-colors duration-500"
                          style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                        >
                          {intervention.severity}
                        </div>
                      </div>
                    </Link>
                  )}
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
