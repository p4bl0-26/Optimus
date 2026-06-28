'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/db/supabase'
import { User } from 'lucide-react'

interface DisplayNameModalProps {
  onComplete: () => void
}

export function DisplayNameModal({ onComplete }: DisplayNameModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [defaultName, setDefaultName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      const metadata = session.user.user_metadata
      
      if (metadata?.optimus_display_name) {
        // Already set
        setLoading(false)
        onComplete()
        return
      }

      // Needs setup
      const fullName = metadata?.full_name || metadata?.name || ''
      const firstName = fullName.split(' ')[0] || 'Operator'
      
      setDefaultName(firstName)
      setDisplayName(firstName)
      setIsOpen(true)
      setLoading(false)
    }

    checkUser()
  }, [onComplete])

  const handleSave = async (nameToSave: string) => {
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
      
      // Dispatch event to update other components that might be listening
      window.dispatchEvent(new Event('optimus-display-name-updated'))
      
      setIsOpen(false)
      setTimeout(onComplete, 300)
    } catch (err) {
      setError('Failed to save display name. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading || !isOpen) return null

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
          className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center">
              <User size={32} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
                Identity Setup
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                How should OPTIMUS address you?
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-xs font-bold font-mono tracking-widest text-[var(--color-text-secondary)] uppercase block">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Chief Himank, Modak, Operator..."
                disabled={submitting}
                className="w-full h-12 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-4 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all"
                autoFocus
              />
              {error && (
                <p className="text-xs text-[var(--color-risk-critical)] font-medium mt-1">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => handleSave(displayName)}
                disabled={submitting || !displayName.trim()}
                className="w-full h-12 rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-[11px] font-bold tracking-widest uppercase hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'SAVING...' : 'CONTINUE'}
              </button>
              
              {defaultName && (
                <button
                  onClick={() => handleSave(defaultName)}
                  disabled={submitting}
                  className="w-full h-12 rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] text-[11px] font-bold tracking-widest uppercase hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center"
                >
                  USE GOOGLE NAME ({defaultName.toUpperCase()})
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
