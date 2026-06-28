'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Pause, Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JUDGE_TARGETS } from '@/constants/judgeTargets';
import { computeSpotlight, SpotlightState } from '@/lib/demo/spotlightEngine';
import {
  recordTourStart,
  recordStepView,
  recordFeatureSkipped,
  recordTourCompletion,
  recordAutoPlayUsage,
} from '@/lib/demo/judgeAnalytics';

// ─── Data ──────────────────────────────────────────────────
export interface TourStep {
  id: string;
  step: number;
  title: string;
  badges: string[];
  description: string;
  whyItMatters: string;
  technicalHighlights: string[];
  realWorldImpact: string;
  narrationText: string;
  estimatedSeconds: number;
  targetId: keyof typeof JUDGE_TARGETS | null;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'responsibilityMap',
    step: 1,
    title: 'Responsibility Matrix',
    badges: ['CORE', 'AI-POWERED'],
    description: 'A live graph visualization of all active obligations and their current risk bands.',
    whyItMatters: 'Flat lists hide relationships. A network map instantly reveals systemic overloads.',
    technicalHighlights: ['Live Risk Scoring (0-100)', 'Network Graph Rendering', 'Pulsing Critical Indicators'],
    realWorldImpact: 'Visual identification of critical tasks drops from minutes to milliseconds.',
    narrationText: 'This is the Responsibility Matrix. Instead of a flat to-do list, OPTIMUS visualizes your obligations as a living network. Items glowing red require immediate strategic management. Click any node to drill into its full intelligence profile.',
    estimatedSeconds: 30,
    targetId: 'responsibilityMap',
  },
  {
    id: 'executiveBriefing',
    step: 2,
    title: 'Executive Briefing',
    badges: ['CORE', 'AUTONOMOUS'],
    description: 'OPTIMUS continuously analyzes obligations and surfaces the highest-priority actions.',
    whyItMatters: 'Most users fail because they cannot identify what deserves attention first.',
    technicalHighlights: ['Risk Engine', 'Chief of Staff Engine', 'Future Outcome Simulation'],
    realWorldImpact: 'Users reduce decision fatigue and execute faster.',
    narrationText: 'Welcome to OPTIMUS. Your morning begins here. The Chief of Staff Engine deterministically synthesizes all your obligations into a concise executive briefing, identifying exactly what requires your attention today to prevent failure cascades.',
    estimatedSeconds: 30,
    targetId: 'executiveBriefing',
  },
  {
    id: 'askChief',
    step: 3,
    title: 'Ask Chief',
    badges: ['AI-POWERED'],
    description: 'Conversational intelligence layer with full system context injected into the prompt.',
    whyItMatters: 'Standard chatbots lack context. Chief knows your exact schedule and risks.',
    technicalHighlights: ['Gemini 2.5 Flash', 'Dynamic Context Injection', 'Action Execution via Chat'],
    realWorldImpact: 'Instant answers about your own life, acting as a true chief of staff.',
    narrationText: 'Ask Chief is not a standard chatbot. It is a conversational interface powered by Gemini, injected with the full context of your obligations, risk scores, and schedule. It answers as an executive, capable of executing commands on your behalf.',
    estimatedSeconds: 30,
    targetId: 'askChief',
  },
  {
    id: 'futureOutcomes',
    step: 4,
    title: 'Future Outcomes Engine',
    badges: ['CORE', 'NEW'],
    description: 'Simulates the probable outcomes of your current operational trajectory.',
    whyItMatters: 'Intervention is only possible if you can see the crash before it happens.',
    technicalHighlights: ['Predictive Intelligence', 'Success Probability Math', 'Rescue Plan Generation'],
    realWorldImpact: 'Transforms reactive scrambling into proactive strategic execution.',
    narrationText: 'The Future Outcomes Engine runs continuous simulations on your highest risk targets. It computes success probabilities for three distinct paths: Recommended, Current, and Danger, allowing you to alter your trajectory before a deadline is missed.',
    estimatedSeconds: 30,
    targetId: 'futureOutcomes',
  },
  {
    id: 'workAccelerator',
    step: 5,
    title: 'Work Accelerator',
    badges: ['AI-POWERED', 'NEW'],
    description: 'AI agents that draft emails, structure documents, and do the heavy lifting.',
    whyItMatters: 'Starting from a blank page is the highest barrier to execution.',
    technicalHighlights: ['Generative AI Integration', 'Contextual Drafting', 'One-Click Refinement'],
    realWorldImpact: 'Reduces time-to-first-draft by 90%, accelerating overall execution.',
    narrationText: 'To overcome the blank page syndrome, the Work Accelerator leverages AI to generate first drafts of emails, reports, or research summaries. It gets you 80 percent of the way there instantly, leaving only the final strategic review to you.',
    estimatedSeconds: 30,
    targetId: 'workAccelerator',
  },
  {
    id: 'scheduler',
    step: 6,
    title: 'Autonomous Scheduler',
    badges: ['AUTONOMOUS', 'AI-POWERED'],
    description: 'Automatically finds time blocks to execute obligations without manual calendar tetris.',
    whyItMatters: 'A task without a scheduled execution block is just a wish.',
    technicalHighlights: ['Calendar Integration', 'Conflict Resolution', 'Workload Density Analysis'],
    realWorldImpact: 'Zero time wasted deciding when to do the work. The plan is made for you.',
    narrationText: 'The Autonomous Scheduler eliminates calendar tetris. It analyzes your existing appointments, calculates your workload density, and automatically blocks out time for your most critical obligations. It ensures you have the time to succeed.',
    estimatedSeconds: 30,
    targetId: 'scheduler',
  },
  {
    id: 'reports',
    step: 7,
    title: 'Executive Reports',
    badges: ['CORE'],
    description: 'A deterministic summary of your week’s performance, wins, and misses.',
    whyItMatters: 'You cannot improve what you do not measure.',
    technicalHighlights: ['Historical Analytics', 'Trend Detection', 'Automated Synthesis'],
    realWorldImpact: 'Creates a tight feedback loop for continuous personal improvement.',
    narrationText: 'Finally, at the end of the week, OPTIMUS generates a comprehensive Executive Report. It analyzes your completed tasks, highlights your wins, identifies systemic misses, and provides actionable insights to improve your execution for the week ahead.',
    estimatedSeconds: 30,
    targetId: 'reports',
  },
  {
    id: 'accountability',
    step: 8,
    title: 'Accountability Layer',
    badges: ['CORE', 'NEW'],
    description: 'Dynamic Action Center that surfaces critical interventions before they become failures.',
    whyItMatters: 'Alerts are noise. Deterministic interventions are signal.',
    technicalHighlights: ['Intervention Engine', 'Conflict Resolution', 'One-Click Action'],
    realWorldImpact: 'Resolves schedule conflicts and overloads instantly without manual triage.',
    narrationText: 'The Accountability Layer acts as your Action Center. It does not just alert you to problems; it prepares deterministic interventions for schedule conflicts and overloads, ready for your one-click approval.',
    estimatedSeconds: 30,
    targetId: 'accountability',
  },
  {
    id: 'formAssistant',
    step: 9,
    title: 'Form Assistant',
    badges: ['AUTONOMOUS'],
    description: 'Automatically prepares tedious forms based on your stored memory and context.',
    whyItMatters: 'Administrative overhead drains executive energy.',
    technicalHighlights: ['Memory Engine Extraction', 'Smart Field Mapping', 'Human Approval Layer'],
    realWorldImpact: 'Eliminates repetitive data entry, preserving focus for high-leverage work.',
    narrationText: 'OPTIMUS automatically prepares administrative workflows, validates requirements, and gathers supporting evidence. Human operators no longer fill forms—they simply review and approve AI-generated work.',
    estimatedSeconds: 30,
    targetId: 'formAssistant',
  },
  {
    id: 'architecture',
    step: 10,
    title: 'Judge Architecture Overlay',
    badges: ['SYSTEM'],
    description: 'A structural visualization of OPTIMUS.',
    whyItMatters: 'Demonstrates the robust, multi-agent AI system beneath the UI.',
    technicalHighlights: ['Node.js Backend', 'Supabase Realtime', 'Gemini Multi-Agent Orchestration'],
    realWorldImpact: 'Showcases enterprise-grade engineering.',
    narrationText: 'What you have seen is not just a dashboard. It is an autonomous executive operating system powered by a multi-agent AI architecture. OPTIMUS executes. Humans supervise.',
    estimatedSeconds: 30,
    targetId: null, // this will trigger onOpenArchitecture
  }
];

// ─── Component ────────────────────────────────────────────────
interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArchitecture: () => void;
  onTourComplete: () => void;
}

export function DemoTour({ isOpen, onClose, onOpenArchitecture, onTourComplete }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightState>({ activeTarget: null, bounds: null, arrowPosition: null });
  const [autoPlay, setAutoPlay] = useState(false);
  const [aiNarration, setAiNarration] = useState(false);
  const [stepStartTime, setStepStartTime] = useState(() => Date.now());
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  const estimatedTimeRemaining = Math.ceil(
    TOUR_STEPS.slice(currentStep).reduce((acc, s) => acc + s.estimatedSeconds, 0) / 60
  );

  useEffect(() => {
    if (isOpen) {
      console.log("[JUDGE] TOUR INITIALIZED");
      recordTourStart();
      const t = setTimeout(() => setStepStartTime(Date.now()), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const updateSpotlight = async () => {
      // Clear previous transform
      if (spotlight.activeTarget) {
        const prevEl = document.querySelector(spotlight.activeTarget) as HTMLElement;
        if (prevEl) prevEl.style.transform = '';
      }

      if (step.id === 'architecture') {
        onOpenArchitecture();
        setSpotlight({ activeTarget: null, bounds: null, arrowPosition: null });
        return;
      }

      if (step.targetId && JUDGE_TARGETS[step.targetId]) {
        const selector = JUDGE_TARGETS[step.targetId];
        const el = document.querySelector(selector) as HTMLElement;
        
        if (el) {
          // 1. Scroll it strictly into center
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          
          // Wait for scroll to potentially settle
          await new Promise(r => setTimeout(r, 400));
          if (!isMounted) return;

          // 2. Apply scale
          el.style.transition = 'all 600ms cubic-bezier(0.22,1,0.36,1)';
          el.style.transform = 'scale(1.03)';
          
          const state = computeSpotlight(selector, 12);
          setSpotlight(state);
        } else {
          console.warn(`[Spotlight Engine] Target not found for selector: ${selector}. Skipping step gracefully.`);
          recordFeatureSkipped(step.id);
          setSpotlight({ activeTarget: null, bounds: null, arrowPosition: null });
        }
      } else {
        setSpotlight({ activeTarget: null, bounds: null, arrowPosition: null });
      }
    };

    requestAnimationFrame(() => {
      updateSpotlight();
    });

    window.addEventListener('resize', updateSpotlight);
    
    return () => {
      isMounted = false;
      if (spotlight.activeTarget) {
        const prevEl = document.querySelector(spotlight.activeTarget) as HTMLElement;
        if (prevEl) prevEl.style.transform = '';
      }
      window.removeEventListener('resize', updateSpotlight);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]); // Do not include spotlight.activeTarget here to avoid infinite loops

  const handleComplete = useCallback(() => {
    recordTourCompletion();
    onTourComplete();
  }, [onTourComplete]);

  const handleNext = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    recordStepView(step.id, timeSpent);
    
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(s => s + 1);
      setStepStartTime(Date.now());
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  }, [isLast, handleComplete, step.id, stepStartTime, isTransitioning]);

  useEffect(() => {
    if (!isOpen || !autoPlay) return;
    const timer = setInterval(() => {
      handleNext();
    }, 18000);
    return () => clearInterval(timer);
  }, [isOpen, autoPlay, handleNext]);

  const handlePrev = useCallback(() => {
    if (!isFirst && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep(s => s - 1);
      setStepStartTime(Date.now());
      setTimeout(() => setIsTransitioning(false), 700);
    }
  }, [isFirst, isTransitioning]);

  const handleSkip = useCallback(() => {
    if (isTransitioning) return;
    recordFeatureSkipped(step.id);
    handleNext();
  }, [step.id, handleNext, isTransitioning]);

  useEffect(() => {
    if (!isOpen) return;

    const handleSkipTo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.step === 'number') {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentStep(customEvent.detail.step);
        setStepStartTime(Date.now());
        setTimeout(() => setIsTransitioning(false), 700);
      }
    };
    window.addEventListener('judge-skip-to', handleSkipTo);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === ' ') {
        e.preventDefault();
        setAutoPlay(prev => {
          if (!prev) recordAutoPlayUsage();
          return !prev;
        });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isLast) handleComplete();
        else handleNext();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('judge-skip-to', handleSkipTo);
    };
  }, [isOpen, currentStep, handleNext, handlePrev, isLast, handleComplete, onClose, isTransitioning]);

  if (!isOpen) return null;

  return (
    <>
      {/* ─── SPOTLIGHT OVERLAYS ────────────────────────────────────────────── */}
      <div 
        className="fixed inset-0 z-[100] pointer-events-auto"
        style={{
          backgroundColor: 'rgba(0,0,0,0.90)',
          backdropFilter: 'blur(8px)',
          transition: 'all 600ms cubic-bezier(0.22,1,0.36,1)',
          clipPath: spotlight.bounds ? `polygon(
            0% 0%, 0% 100%, 
            ${spotlight.bounds.left}px 100%, 
            ${spotlight.bounds.left}px ${spotlight.bounds.top}px, 
            ${spotlight.bounds.right}px ${spotlight.bounds.top}px, 
            ${spotlight.bounds.right}px ${spotlight.bounds.bottom}px, 
            ${spotlight.bounds.left}px ${spotlight.bounds.bottom}px, 
            ${spotlight.bounds.left}px 100%, 
            100% 100%, 100% 0%
          )` : 'none'
        }}
      />

      {/* Target Highlight Effect */}
      <AnimatePresence>
        {spotlight.bounds && (
          <motion.div
            key="target-highlight"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              top: spotlight.bounds.top,
              left: spotlight.bounds.left,
              width: spotlight.bounds.width,
              height: spotlight.bounds.height,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[90] pointer-events-none rounded-xl"
            style={{
              boxShadow: '0 0 0 2px rgba(118,192,67,0.8), 0 0 32px rgba(118,192,67,0.35), 0 0 96px rgba(118,192,67,0.15)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── TOUR CARD ────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none px-4 lg:px-8">
        <motion.div
          key={`tour-step-${currentStep}`}
          layout
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'pointer-events-auto w-full max-w-2xl flex flex-col max-h-[90vh]',
            'bg-[var(--color-bg-base)] border border-[var(--color-border)]',
            'rounded-2xl shadow-2xl overflow-hidden relative'
          )}
          role="dialog"
          aria-labelledby="tour-step-title"
          aria-describedby="tour-step-desc"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-[var(--color-bg-elevated)] w-full">
            <motion.div
              className="h-full bg-[var(--color-accent-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--color-accent-primary)] font-orbitron tracking-widest uppercase">
                  STEP {step.step} / {TOUR_STEPS.length}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  Est. ~{estimatedTimeRemaining}m remaining
                </span>
              </div>
              <h2 id="tour-step-title" className="text-2xl font-bold font-orbitron text-[var(--color-text-primary)] uppercase tracking-wide">
                {step.title}
              </h2>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                aria-label="Close tour"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-wrap gap-2 mb-6">
              {step.badges.map(b => (
                <span key={b} className="px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-primary)] tracking-widest uppercase">
                  {b}
                </span>
              ))}
            </div>

            {/* AI Narration Mode */}
            <AnimatePresence>
              {aiNarration && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-lg bg-[var(--color-bg-secondary)] border-l-2 border-[var(--color-accent-primary)]"
                >
                  <p className="text-xs font-bold text-[var(--color-accent-primary)] mb-2 uppercase tracking-widest font-orbitron">
                    AI NARRATION
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
                    &quot;{step.narrationText}&quot;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-orbitron">Description</p>
                <p id="tour-step-desc" className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-orbitron">Why This Matters</p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {step.whyItMatters}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-orbitron">Technical Highlights</p>
                <ul className="space-y-2">
                  {step.technicalHighlights.map(th => (
                    <li key={th} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <CheckCircle size={14} className="text-[var(--color-accent-primary)]" />
                      {th}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-orbitron">Real-World Impact</p>
                <div className="p-3 bg-[var(--color-accent-glow)] rounded border border-[var(--color-accent-primary)]/20">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {step.realWorldImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Nav */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[var(--color-border)] gap-4 bg-[var(--color-bg-surface)]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={isTransitioning}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all w-full sm:w-auto font-orbitron tracking-widest",
                  autoPlay ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  isTransitioning && "opacity-50 cursor-not-allowed"
                )}
              >
                {autoPlay ? <Pause size={14} /> : <Play size={14} />}
                {autoPlay ? 'AUTO PLAYING' : 'AUTO PLAY DEMO'}
              </button>

              <button
                onClick={() => setAiNarration(!aiNarration)}
                disabled={isTransitioning}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded text-xs font-bold transition-all w-full sm:w-auto font-orbitron tracking-widest",
                  aiNarration ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  isTransitioning && "opacity-50 cursor-not-allowed"
                )}
              >
                ENABLE AI NARRATION
              </button>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
              <button
                onClick={handlePrev}
                disabled={isFirst || isTransitioning}
                className="flex items-center justify-center w-10 h-10 rounded bg-[var(--color-bg-elevated)] disabled:opacity-50 hover:bg-[var(--color-border)] transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleSkip}
                disabled={isTransitioning}
                className="px-4 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] uppercase tracking-wider font-orbitron disabled:opacity-50"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className={cn(
                  'flex items-center gap-2 h-10 px-6 rounded text-xs font-bold uppercase tracking-wider transition-all font-orbitron disabled:opacity-50',
                  isLast
                    ? 'bg-[var(--color-risk-safe)] text-white hover:opacity-90 shadow-[0_0_15px_rgba(118,192,67,0.3)]'
                    : 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                )}
              >
                {isLast ? (
                  <><CheckCircle size={14} /> Finish</>
                ) : (
                  <>Next <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
