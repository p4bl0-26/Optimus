'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Target, Clock, ArrowRight, Play, CheckCircle2, Bot } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FocusModeClientProps {
  obligations: any[]
  riskProfiles: any[]
  recommendedFocus: any
}

export function FocusModeClient({ obligations, riskProfiles, recommendedFocus }: FocusModeClientProps) {
  const router = useRouter()
  
  // States
  const [isExecuting, setIsExecuting] = useState(false)
  const [timerDuration, setTimerDuration] = useState<number>(25 * 60)
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60)
  const [showEscModal, setShowEscModal] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Mission Selection Logic
  const primaryMission = useMemo(() => {
    const pending = obligations.filter(o => o.status === 'pending')
    if (pending.length === 0) return null

    const withRisk = pending.map(ob => {
      const profile = riskProfiles.find(rp => rp.obligation_id === ob.id)
      return {
        obligation: ob,
        profile,
        riskScore: profile?.risk_score || 0,
        riskBand: profile?.risk_band || 'Safe',
      }
    })

    const bandWeight: Record<string, number> = { 'Critical': 4, 'High Risk': 3, 'Monitor': 2, 'Safe': 1 }
    
    withRisk.sort((a, b) => {
      // 1. Risk Band
      const bandA = bandWeight[a.riskBand] || 1
      const bandB = bandWeight[b.riskBand] || 1
      if (bandA !== bandB) return bandB - bandA
      
      // 2. Recommended Focus
      const isARec = recommendedFocus?.title === a.obligation.title ? 1 : 0
      const isBRec = recommendedFocus?.title === b.obligation.title ? 1 : 0
      if (isARec !== isBRec) return isBRec - isARec

      // 3. Earliest due date
      const dateA = a.obligation.due_date ? new Date(a.obligation.due_date).getTime() : Infinity
      const dateB = b.obligation.due_date ? new Date(b.obligation.due_date).getTime() : Infinity
      return dateA - dateB
    })

    return withRisk[0]
  }, [obligations, riskProfiles, recommendedFocus])

  const otherMissions = useMemo(() => {
    if (!primaryMission) return []
    return obligations.filter(o => o.id !== primaryMission.obligation.id && o.status === 'pending')
  }, [obligations, primaryMission])

  // Timer logic
  useEffect(() => {
    if (isExecuting && !isComplete && !showEscModal) {
      if (timeLeft <= 0) {
        const timeout = setTimeout(() => {
          setIsComplete(true)
          setIsExecuting(false)
        }, 0)
        return () => clearTimeout(timeout)
      }
      const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [isExecuting, timeLeft, isComplete, showEscModal])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExecuting && !isComplete) {
        setShowEscModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExecuting, isComplete])

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Early return for empty state
  if (!primaryMission) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Shield size={32} className="text-[var(--color-risk-safe)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] font-orbitron tracking-widest mb-2">NO ACTIVE MISSIONS</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            OPTIMUS detects no critical operational priorities.
            <br />
            Use this window for:
          </p>
        </div>
        <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 mb-4">
          <li className="flex items-center gap-2"><Target size={14} className="text-[var(--color-accent-primary)]"/> Recovery</li>
          <li className="flex items-center gap-2"><Target size={14} className="text-[var(--color-accent-primary)]"/> Planning</li>
          <li className="flex items-center gap-2"><Target size={14} className="text-[var(--color-accent-primary)]"/> Strategic preparation</li>
        </ul>
        <Link 
          href="/"
          className="px-6 py-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors font-bold text-xs uppercase tracking-wider"
        >
          [ RETURN TO COMMAND CENTER ]
        </Link>
      </div>
    )
  }

  const { obligation, profile, riskScore, riskBand } = primaryMission
  
  // Extracting data for UI
  const expectedDuration = profile?.future_outcomes?.outcomes?.[0]?.expectedDuration || '2h 30m' // fallback if not generated
  const successProb = profile?.future_outcomes?.outcomes?.find((o: any) => o.type === 'Recommended')?.successProbability || 92
  
  // Chief Directive
  let chiefDirective = ''
  if (recommendedFocus?.title === obligation.title) {
    chiefDirective = recommendedFocus.reason
  } else {
    chiefDirective = `Finish ${obligation.title} before beginning other work.\nSwitching contexts now increases operational risk.`
  }

  // Rescue Plan rendering
  const rescuePlan = profile?.missing_work ? (
    typeof profile.missing_work === 'string' ? JSON.parse(profile.missing_work) : profile.missing_work
  ) : null

  // UI Components
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center shadow-[var(--shadow-glow)]">
          <CheckCircle2 size={32} className="text-[var(--color-risk-safe)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] font-orbitron tracking-widest">MISSION WINDOW COMPLETE</h2>
        
        <div className="intel-card w-full p-6 bg-[var(--color-bg-secondary)] border-[var(--color-accent-primary)]/30 text-left">
          <p className="text-xs font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-2">Chief Recommendation:</p>
          <p className="text-sm text-[var(--color-text-primary)] font-medium mb-4">Take a 10-minute recovery break.</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-4">You may:</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { setIsComplete(false); setIsExecuting(true); setTimeLeft(25 * 60); setTimerDuration(25 * 60) }}
              className="w-full py-3 rounded bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)] transition-colors"
            >
              [ CONTINUE 25 MIN ]
            </button>
            <p className="text-center text-xs text-[var(--color-text-muted)] font-mono">OR</p>
            <Link 
              href="/"
              className="w-full py-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-xs uppercase tracking-wider hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors text-center"
            >
              [ RETURN TO COMMAND CENTER ]
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isExecuting) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-6 font-mono text-center">
          MISSION BRIEFING
        </h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="intel-card border-t-4 p-8 mb-6 relative overflow-hidden"
          style={{ borderTopColor: 'var(--color-risk-critical)' }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,0,0,0.05)_0%,transparent_50%)] pointer-events-none" />

          <p className="text-[10px] font-bold text-[var(--color-risk-critical)] uppercase tracking-wider mb-2">PRIMARY OBJECTIVE</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] font-orbitron mb-8">{obligation.title}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">SOURCE</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] capitalize">{obligation.source}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">THREAT LEVEL</p>
              <p className="text-sm font-bold text-[var(--color-risk-critical)] uppercase">{riskBand}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">EXPECTED DURATION</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">{expectedDuration}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">SUCCESS PROBABILITY</p>
              <p className="text-sm font-bold text-[var(--color-risk-safe)]">{successProb}%</p>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg mb-8">
            <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Bot size={12} /> CHIEF DIRECTIVE
            </p>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
              {chiefDirective}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {[25, 50, 90].map(min => (
                <button
                  key={min}
                  onClick={() => { setTimerDuration(min * 60); setTimeLeft(min * 60) }}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded border text-xs font-bold uppercase transition-colors ${
                    timerDuration === min * 60 
                    ? 'bg-[var(--color-accent-primary)]/20 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                    : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/50'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsExecuting(true)}
              className="w-full sm:flex-1 py-3 px-6 rounded bg-[var(--color-risk-critical)] text-[var(--color-bg-primary)] font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-risk-critical-hover)] transition-colors flex items-center justify-center gap-2"
            >
              [ BEGIN MISSION ] <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {otherMissions.length > 0 && (
          <div className="p-4 border border-[var(--color-risk-high)]/30 bg-[var(--color-risk-high)]/5 rounded-lg flex items-start gap-3">
            <AlertTriangle size={16} className="text-[var(--color-risk-high)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[var(--color-risk-high)] uppercase tracking-wider mb-1">WARNING</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Switching to <span className="font-semibold text-[var(--color-text-primary)]">{otherMissions[0].title}</span> before completing <span className="font-semibold text-[var(--color-text-primary)]">{obligation.title}</span> increases operational risk.<br/>
                OPTIMUS recommends maintaining mission continuity.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Execution State
  return (
    <>
      <div className="max-w-4xl mx-auto py-4 h-full flex flex-col">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-risk-critical)] animate-pulse" />
            <h1 className="text-sm font-bold text-[var(--color-risk-critical)] uppercase tracking-widest font-mono">MISSION ACTIVE</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">MISSION RISK</p>
              <p className="text-lg font-bold font-orbitron text-[var(--color-risk-critical)]">{Math.round(riskScore)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Main Focus Area */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] font-orbitron mb-4 leading-tight">{obligation.title}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Source: <span className="capitalize text-[var(--color-text-primary)] font-medium">{obligation.source}</span></p>
            </div>

            {/* Huge Timer */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div 
                key={timeLeft}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="font-orbitron text-[120px] md:text-[180px] font-bold text-[var(--color-text-primary)] leading-none tracking-tighter"
                style={{ textShadow: '0 0 40px rgba(0, 112, 243, 0.2)' }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              
              {/* Progress bar */}
              <div className="w-full max-w-md h-1 bg-[var(--color-bg-elevated)] mt-8 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-accent-primary)] transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Plan & Directive */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Chief Directive */}
            <div className="intel-card border-l-4 border-l-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 p-5">
              <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bot size={12} /> CHIEF DIRECTIVE
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed mb-4 whitespace-pre-line">
                {chiefDirective}
              </p>
              <div className="flex items-center justify-between border-t border-[var(--color-accent-primary)]/20 pt-3">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Confidence:</span>
                <span className="text-xs font-bold text-[var(--color-accent-primary)] font-orbitron">{successProb}%</span>
              </div>
            </div>

            {/* Execution Plan */}
            <div className="intel-card p-5 h-full max-h-[400px] flex flex-col">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target size={12} /> TODAY&apos;S EXECUTION PLAN
              </p>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {rescuePlan?.steps ? (
                  rescuePlan.steps.map((step: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] z-10" />
                      {idx !== rescuePlan.steps.length - 1 && (
                        <div className="absolute left-1.5 top-4 w-px h-full bg-[var(--color-border)] z-0" />
                      )}
                      <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase mb-1">STEP {idx + 1}</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{step.action}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{step.expected_outcome}</p>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-[var(--color-accent-primary)] bg-[var(--color-bg-primary)]" />
                    <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase mb-1">STEP 1</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Execute primary objectives for {obligation.title}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ESC Modal */}
      <AnimatePresence>
        {showEscModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="intel-card max-w-sm w-full p-6 bg-[var(--color-bg-primary)] shadow-2xl border-[var(--color-risk-critical)]/50 text-center"
            >
              <AlertTriangle size={32} className="text-[var(--color-risk-critical)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-orbitron mb-2 uppercase tracking-wider">LEAVE FOCUS MODE?</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Switching contexts before completing your mission may increase operational risk.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowEscModal(false)}
                  className="w-full py-3 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--color-accent-secondary)] transition-colors"
                >
                  [ STAY IN MISSION ]
                </button>
                <Link 
                  href="/"
                  className="w-full py-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-xs uppercase tracking-wider hover:border-[var(--color-risk-critical)] hover:text-[var(--color-risk-critical)] transition-colors"
                >
                  [ RETURN TO COMMAND CENTER ]
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
