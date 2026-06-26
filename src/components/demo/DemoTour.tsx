'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Play, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Tour Steps ───────────────────────────────────────────────
export const TOUR_STEPS = [
  {
    id: 'welcome',
    step: 1,
    title: 'Welcome to OPTIMUS',
    subtitle: 'AI Chief of Staff',
    description: 'OPTIMUS is an autonomous intelligence system that discovers your obligations, assesses operational risk, and delivers executive briefings — so you never miss what matters.',
    highlight: null,
    icon: '🛡️',
    position: 'center',
  },
  {
    id: 'discovery',
    step: 2,
    title: 'Discovery Agents',
    subtitle: 'Gmail · Classroom · Calendar',
    description: 'Autonomous agents scan your Gmail inbox, Google Classroom assignments, and Google Calendar events. Every obligation is discovered, classified, and tracked — without manual input.',
    highlight: '#topbar',
    icon: '🔍',
    position: 'bottom-center',
    ctaText: 'See the discovery buttons in the dashboard header',
  },
  {
    id: 'risk',
    step: 3,
    title: 'Risk Intelligence',
    subtitle: 'Live Risk Scoring 0-100',
    description: 'Every obligation receives a real-time risk score based on deadline proximity, workload density, conflict patterns, and historical memory. Bands: Safe → Monitor → High Risk → Critical.',
    highlight: null,
    icon: '🎯',
    position: 'center',
    ctaText: 'Click any node in the Responsibility Map to view its full risk profile',
  },
  {
    id: 'briefings',
    step: 4,
    title: 'Executive Briefings',
    subtitle: 'Morning & Evening Intelligence',
    description: 'The Chief of Staff Engine synthesizes all data into structured morning and evening briefings. Strategic recommendations are generated deterministically from actual risk scores — never hallucinated.',
    highlight: null,
    icon: '📋',
    position: 'center',
    ctaText: 'View the Executive Briefing section on the dashboard',
  },
  {
    id: 'askchief',
    step: 5,
    title: 'Ask Chief',
    subtitle: 'Conversational Intelligence Layer',
    description: 'Ask Chief is powered by Gemini with full operational context injected as the system prompt. Ask anything about your obligations, risks, or strategic priorities. Chief responds as an executive, not a chatbot.',
    highlight: '#ask-chief-btn',
    icon: '🤖',
    position: 'bottom-right',
    ctaText: 'Click "Ask Chief" in the top bar to open the command center',
  },
  {
    id: 'recommendations',
    step: 6,
    title: 'Strategic Recommendations',
    subtitle: 'Prioritized Action Orders',
    description: 'Three ranked strategic recommendations are computed from risk scores, overloaded day detection, critical interventions, and memory patterns. Each includes confidence percentage and reasoning.',
    highlight: null,
    icon: '🧠',
    position: 'center',
  },
  {
    id: 'map',
    step: 7,
    title: 'Responsibility Map',
    subtitle: 'Live Obligation Network',
    description: 'The Responsibility Map visualizes all obligations as nodes, color-coded by risk band. Critical items pulse in real-time. Click any node to drill into its full intelligence profile.',
    highlight: null,
    icon: '🗺️',
    position: 'center',
    ctaText: 'Nodes with red pulses require immediate attention',
  },
  {
    id: 'outcomes',
    step: 8,
    title: 'Future Outcomes',
    subtitle: 'Predictive Intelligence',
    description: 'For every obligation, OPTIMUS computes three outcome paths: Recommended, Current, and Danger — each with a success probability. The Rescue Plan details exactly what to do today, tomorrow, and before deadline.',
    highlight: null,
    icon: '🔮',
    position: 'center',
  },
]

// ─── Component ────────────────────────────────────────────────
interface DemoTourProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoTour({ isOpen, onClose }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1
  const isFirst = currentStep === 0

  // Reset to step 0 when opened — intentional; isOpen is external control prop
  useEffect(() => {
    // Deferred reset via microtask to avoid synchronous setState in effect lint
    if (isOpen) {
      const t = setTimeout(() => setCurrentStep(0), 0)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (!isLast) setCurrentStep(s => s + 1)
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!isFirst) setCurrentStep(s => s - 1)
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, isFirst, isLast, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Tour Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <motion.div
              key={`tour-step-${currentStep}`}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={cn(
                'pointer-events-auto w-full max-w-lg',
                'bg-[var(--color-bg-base)] border border-[var(--color-border)]',
                'rounded-2xl shadow-2xl overflow-hidden'
              )}
            >
              {/* Progress Bar */}
              <div className="h-0.5 bg-[var(--color-bg-elevated)] w-full">
                <motion.div
                  className="h-full bg-[var(--color-accent-primary)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase">
                    Step {step.step} of {TOUR_STEPS.length}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
                  <span className="text-[10px] text-[var(--color-accent-primary)] font-bold uppercase tracking-widest">
                    Demo Tour
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                  aria-label="Close tour"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0 mt-1">{step.icon}</div>
                  <div>
                    <p className="text-[10px] text-[var(--color-accent-primary)] font-bold uppercase tracking-widest mb-1">
                      {step.subtitle}
                    </p>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>
                      {step.title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                    {step.ctaText && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/20">
                        <p className="text-xs text-[var(--color-accent-primary)] font-medium">
                          💡 {step.ctaText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Dots */}
              <div className="flex items-center justify-center gap-1.5 pb-4">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      i === currentStep
                        ? 'w-4 h-1.5 bg-[var(--color-accent-primary)]'
                        : i < currentStep
                        ? 'w-1.5 h-1.5 bg-[var(--color-accent-primary)]/50'
                        : 'w-1.5 h-1.5 bg-[var(--color-border)]'
                    )}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Footer Nav */}
              <div className="flex items-center justify-between px-5 pb-5 gap-3">
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  disabled={isFirst}
                  className={cn(
                    'flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium',
                    'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
                    'hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]',
                    'transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft size={13} /> Back
                </button>

                <button
                  onClick={() => {
                    if (isLast) onClose()
                    else setCurrentStep(s => s + 1)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 h-9 px-5 rounded-lg text-xs font-bold',
                    isLast
                      ? 'bg-[var(--color-risk-safe)] text-white hover:opacity-90'
                      : 'bg-[var(--color-accent-primary)] text-white hover:opacity-90',
                    'transition-all duration-150'
                  )}
                >
                  {isLast ? (
                    <><CheckCircle size={13} /> Launch OPTIMUS</>
                  ) : (
                    <>Next <ChevronRight size={13} /></>
                  )}
                </button>
              </div>

              {/* Keyboard hint */}
              <div className="px-5 pb-4 -mt-2">
                <p className="text-[9px] text-center text-[var(--color-text-muted)]">
                  Arrow keys to navigate · Esc to close
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
