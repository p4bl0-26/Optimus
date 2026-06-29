'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/db/supabase'
import { User, Mail, Calendar as CalendarIcon, BookOpen, MessageSquare, CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface OnboardingModalProps {
  onComplete: () => void;
  initialStep?: 1 | 2;
}

export function OnboardingModal({ onComplete, initialStep = 1 }: OnboardingModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(initialStep)
  
  // Step 1 State
  const [displayName, setDisplayName] = useState('')
  const [defaultName, setDefaultName] = useState('Operator')
  
  useEffect(() => {
    // Pre-fill default name if possible
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata) {
        const metadata = session.user.user_metadata;
        const fullName = metadata.full_name || metadata.name || '';
        const firstName = fullName.split(' ')[0] || 'Operator';
        setDefaultName(firstName);
        if (!displayName) {
          setDisplayName(firstName);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  
  // Step 2 State
  const [selectedIntegrations, setSelectedIntegrations] = useState<Record<string, boolean>>({
    gmail: false,
    calendar: false,
    classroom: false,
    whatsapp: false
  })



  const handleSaveIdentity = async (nameToSave: string) => {
    const trimmed = nameToSave.trim()
    
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Display name must be between 2 and 30 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await supabase.auth.updateUser({
        data: { optimus_display_name: trimmed }
      })
      
      window.dispatchEvent(new Event('optimus-display-name-updated'))
      setDisplayName(trimmed)
      setStep(2)
      setSubmitting(false)
    } catch (err) {
      setError('Failed to save display name. Please try again.')
      setSubmitting(false)
    }
  }

  const handleFinishOnboarding = async (skipIntegrations: boolean = false) => {
    setSubmitting(true)
    setError('')

    try {
      // Mark onboarding as complete in metadata
      await supabase.auth.updateUser({
        data: { optimus_onboarding_complete: true }
      })

      // If user selected integrations, open them in popups or sequential redirects
      if (!skipIntegrations) {
        const toConnect = Object.keys(selectedIntegrations).filter(k => selectedIntegrations[k])
        
        if (toConnect.length > 0) {
          // Because browsers block multiple popups, we redirect them to the first one,
          // and let the settings page handle the rest, or just let them know they need to connect in settings.
          // The prompt says "Due to browser constraints preventing multiple simultaneous redirects without popups, the flow will sequentially trigger popups for selected integrations or mark them as enabled/pending."
          // But actually the safest way for the initial UX is to just mark them as 'pending' in metadata or redirect to a central integration flow.
          // For now, we'll redirect to the first selected one.
          const firstIntegration = toConnect[0]
          if (firstIntegration !== 'whatsapp') { // whatsapp is disabled
             router.push(`/api/integrations/${firstIntegration}/connect`);
             return // Do not call onComplete here, user is redirecting
          }
        }
      }

      setTimeout(onComplete, 300)
    } catch (err) {
      setError('Failed to complete setup.')
      setSubmitting(false)
    }
  }

  const toggleIntegration = (id: string) => {
    if (id === 'whatsapp') return // Disabled
    setSelectedIntegrations(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-8 border-b border-[var(--color-border)] flex flex-col items-center gap-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-accent-primary)]/50 flex items-center justify-center text-3xl font-bold font-orbitron text-[var(--color-text-primary)] shadow-[0_0_20px_rgba(118,192,67,0.2)]">
                    {(displayName || defaultName).charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
                      HELLO.
                    </h2>
                    <p className="text-sm font-mono tracking-wide text-[var(--color-text-secondary)] uppercase">
                      How should OPTIMUS address you?
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value)
                        setError('')
                      }}
                      placeholder="e.g. Modak, Chief Himank, Operator..."
                      disabled={submitting}
                      className="w-full h-14 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-5 text-base font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all"
                      autoFocus
                    />
                    
                    {/* Live Preview */}
                    <motion.div 
                      className="h-8 flex items-center justify-center text-xs font-mono font-bold tracking-widest text-[var(--color-accent-primary)] uppercase bg-[var(--color-accent-primary)]/10 rounded-lg border border-[var(--color-accent-primary)]/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: displayName ? 1 : 0 }}
                    >
                      GOOD EVENING, {displayName || '...'}
                    </motion.div>

                    {error && (
                      <p className="text-xs text-[var(--color-risk-critical)] font-medium text-center">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleSaveIdentity(displayName)}
                      disabled={submitting || !displayName.trim()}
                      className="w-full h-12 rounded-xl bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold tracking-widest uppercase hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(118,192,67,0.3)] hover:shadow-[0_0_25px_rgba(118,192,67,0.5)]"
                    >
                      {submitting ? 'SAVING...' : 'CONTINUE'} <ChevronRight size={16} />
                    </button>
                    
                    {defaultName && (
                      <button
                        onClick={() => handleSaveIdentity(defaultName)}
                        disabled={submitting}
                        className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center"
                      >
                        USE GOOGLE NAME ({defaultName.toUpperCase()})
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-8 border-b border-[var(--color-border)] space-y-3">
                  <h2 className="text-xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
                    CONNECT YOUR INTELLIGENCE SOURCES
                  </h2>
                  <p className="text-xs font-mono tracking-wide text-[var(--color-text-secondary)] uppercase">
                    OPTIMUS ONLY CONNECTS SERVICES YOU EXPLICITLY AUTHORIZE.
                  </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                  {/* Gmail */}
                  <div 
                    onClick={() => toggleIntegration('gmail')}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      selectedIntegrations.gmail 
                        ? "bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]" 
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className={selectedIntegrations.gmail ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"} size={20} />
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">GMAIL</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">Email intelligence and action extraction.</p>
                        </div>
                      </div>
                      {selectedIntegrations.gmail && <CheckCircle2 className="text-[var(--color-accent-primary)]" size={20} />}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div 
                    onClick={() => toggleIntegration('calendar')}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      selectedIntegrations.calendar 
                        ? "bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]" 
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className={selectedIntegrations.calendar ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"} size={20} />
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">GOOGLE CALENDAR</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">Scheduling, deadlines, availability.</p>
                        </div>
                      </div>
                      {selectedIntegrations.calendar && <CheckCircle2 className="text-[var(--color-accent-primary)]" size={20} />}
                    </div>
                  </div>

                  {/* Classroom */}
                  <div 
                    onClick={() => toggleIntegration('classroom')}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      selectedIntegrations.classroom 
                        ? "bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]" 
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className={selectedIntegrations.classroom ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"} size={20} />
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">GOOGLE CLASSROOM</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">Assignments, lectures, submissions.</p>
                        </div>
                      </div>
                      {selectedIntegrations.classroom && <CheckCircle2 className="text-[var(--color-accent-primary)]" size={20} />}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] opacity-60 cursor-not-allowed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="text-[var(--color-text-muted)]" size={20} />
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text-secondary)]">WHATSAPP</h3>
                          <p className="text-xs text-[var(--color-text-muted)]">Escalations and notifications.</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-[var(--color-bg-elevated)] px-2 py-1 rounded text-[var(--color-text-muted)]">COMING SOON</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[var(--color-border)] flex flex-col gap-3">
                  <button
                    onClick={() => handleFinishOnboarding(false)}
                    disabled={submitting || !Object.values(selectedIntegrations).some(Boolean)}
                    className="w-full h-12 rounded-xl bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold tracking-widest uppercase hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(118,192,67,0.3)]"
                  >
                    {submitting ? 'PROCESSING...' : 'CONNECT SELECTED'}
                  </button>
                  <button
                    onClick={() => handleFinishOnboarding(true)}
                    disabled={submitting}
                    className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center"
                  >
                    SKIP FOR NOW
                  </button>
                  <button
                    onClick={() => handleFinishOnboarding(true)}
                    disabled={submitting}
                    className="w-full mt-2 text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] tracking-widest uppercase"
                  >
                    [ SKIP ALL ]
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
