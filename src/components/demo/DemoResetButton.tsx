'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, X, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resetDemoAction } from '@/app/actions/demo'

interface DemoResetButtonProps {
  onReset?: () => void
}

export function DemoResetButton({ onReset }: DemoResetButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleReset() {
    setState('loading')
    try {
      const result = await resetDemoAction()
      if (result.success) {
        setState('success')
        setMessage(`${result.message} (${result.duration}ms)`)
        onReset?.()
        setTimeout(() => {
          setShowModal(false)
          setState('idle')
        }, 2000)
      } else {
        setState('error')
        setMessage(result.message)
      }
    } catch (err: any) {
      setState('error')
      setMessage(err?.message || 'Reset failed.')
    }
  }

  return (
    <>
      <button
        id="demo-reset-btn"
        onClick={() => { setShowModal(true); setState('idle') }}
        className="btn-base btn-ghost hidden sm:inline-flex"
        title="Reset demo workspace"
      >
        <RotateCcw size={14} />
        <span>RESET DEMO</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="reset-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => state === 'idle' && setShowModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div
                key="reset-modal"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className={cn(
                  'w-full max-w-sm',
                  'bg-[var(--color-bg-base)] border border-[var(--color-border)]',
                  'rounded-2xl shadow-2xl overflow-hidden'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-[var(--color-text-muted)]" />
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">Reset Demo</span>
                  </div>
                  {state === 'idle' && (
                    <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                  {state === 'idle' && (
                    <>
                      <div className="flex items-start gap-3 mb-5">
                        <AlertTriangle size={18} className="text-[var(--color-risk-monitor)] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">
                            This will reset the demo workspace.
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                            All current obligations, risk profiles, and interventions will be cleared and replaced with a fresh demo scenario. The dashboard will refresh automatically.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowModal(false)}
                          className="flex-1 h-9 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          id="confirm-reset-btn"
                          onClick={handleReset}
                          className="flex-1 h-9 rounded-lg bg-[var(--color-accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Confirm Reset
                        </button>
                      </div>
                    </>
                  )}

                  {state === 'loading' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 size={24} className="animate-spin text-[var(--color-accent-primary)]" />
                      <p className="text-sm text-[var(--color-text-secondary)]">Restoring operational state…</p>
                    </div>
                  )}

                  {state === 'success' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-risk-safe-bg)] border border-[var(--color-risk-safe)] flex items-center justify-center">
                        <CheckCircle size={22} className="text-[var(--color-risk-safe)]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                          OPTIMUS operational state restored.
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">{message}</p>
                      </div>
                    </div>
                  )}

                  {state === 'error' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <AlertTriangle size={24} className="text-[var(--color-risk-critical)]" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Reset failed.</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{message}</p>
                      </div>
                      <button onClick={() => setState('idle')} className="h-8 px-4 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-all">
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
