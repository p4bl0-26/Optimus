'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Loader2, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'chief'
  text: string
  timestamp: Date
}

interface AskChiefDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Quick Actions ────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'What should I do first?', icon: '⚡' },
  { label: "What's my biggest risk?", icon: '🎯' },
  { label: 'What can I postpone?', icon: '📅' },
  { label: 'Summarize tomorrow.', icon: '🌅' },
  { label: 'Give me strategic recommendations.', icon: '🧠' },
]

// ─── Message Bubble ───────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center mt-0.5">
          <Bot size={13} className="text-[var(--color-accent-primary)]" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] px-3 py-2.5 rounded-xl text-xs leading-relaxed',
          isUser
            ? 'bg-[var(--color-accent-primary)]/15 border border-[var(--color-accent-primary)]/30 text-[var(--color-text-primary)]'
            : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
        )}
      >
        {/* Render text preserving bold markdown **text** */}
        {msg.text.split('\n').map((line, i) => {
          const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          return (
            <p
              key={i}
              className={i > 0 ? 'mt-1.5' : ''}
              dangerouslySetInnerHTML={{ __html: rendered || '&nbsp;' }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Drawer ──────────────────────────────────────────────
export function AskChiefDrawer({ isOpen, onClose }: AskChiefDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Keyboard: close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return
    setError(null)

    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Build history for Gemini (exclude last user msg — it's passed as `message`)
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))

      const res = await fetch('/api/chief/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      const data = await res.json()

      if (!res.ok || data.error || data.success === false) {
        throw new Error(data.error || data.message || 'Unknown error')
      }

      const chiefMsg: ChatMessage = { role: 'chief', text: data.response, timestamp: new Date() }
      setMessages(prev => [...prev, chiefMsg])
    } catch (err: any) {
      setError(err.message || 'Chief is temporarily unavailable.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="chief-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="chief-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 h-full z-50',
              'w-full sm:w-[420px] lg:w-[460px]',
              'flex flex-col',
              'bg-[var(--color-bg-base)] border-l border-[var(--color-border)]',
              'shadow-2xl'
            )}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center">
                    <Bot size={16} className="text-[var(--color-accent-primary)]" />
                  </div>
                  {/* Live pulse */}
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-accent-primary)] border-2 border-[var(--color-bg-base)] animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}>
                    CHIEF OF STAFF
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase">
                    Intelligence Layer · Active
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
                  'hover:bg-[var(--color-bg-elevated)] border border-transparent',
                  'hover:border-[var(--color-border)] transition-all duration-150'
                )}
                aria-label="Close Chief drawer"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {/* Welcome state */}
              {!hasMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="text-center pt-6 pb-2">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/20 flex items-center justify-center mx-auto mb-4">
                      <Zap size={24} className="text-[var(--color-accent-primary)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Chief is Online</p>
                    <p className="text-xs text-[var(--color-text-muted)] max-w-[260px] mx-auto leading-relaxed">
                      Ask me anything about your obligations, risks, or strategic priorities. I have full operational context.
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold px-1">
                      Quick Commands
                    </p>
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.label)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl',
                          'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
                          'text-left text-xs text-[var(--color-text-secondary)]',
                          'hover:text-[var(--color-text-primary)]',
                          'hover:border-[var(--color-accent-primary)]/40',
                          'hover:bg-[var(--color-accent-glow)]',
                          'transition-all duration-150 group'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base leading-none">{action.icon}</span>
                          <span>{action.label}</span>
                        </div>
                        <ChevronRight size={12} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Conversation */}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center">
                    <Bot size={13} className="text-[var(--color-accent-primary)]" />
                  </div>
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Loader2 size={10} className="animate-spin text-[var(--color-accent-primary)]" />
                      <span className="text-[10px] text-[var(--color-accent-primary)] font-mono uppercase tracking-wider">Analyzing Operational Context</span>
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="h-2 w-full bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                      <div className="h-2 w-[80%] bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                      <div className="h-2 w-[90%] bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[var(--color-text-muted)] text-center py-2 px-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
                >
                  ⚠ {error}
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* ── Input ── */}
            <div className="flex-shrink-0 border-t border-[var(--color-border)] p-4">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  id="ask-chief-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Chief anything…"
                  disabled={isLoading}
                  className={cn(
                    'flex-1 resize-none min-h-[36px] max-h-[120px] px-3 py-2',
                    'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]',
                    'text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
                    'focus:outline-none focus:border-[var(--color-accent-primary)]/50',
                    'focus:bg-[var(--color-bg-card)] transition-all duration-150',
                    'disabled:opacity-60'
                  )}
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <button
                  id="ask-chief-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    'bg-[var(--color-accent-primary)] text-white',
                    'hover:opacity-90 transition-all duration-150',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] mt-2 text-center">
                Enter to send · Shift+Enter for new line · Esc to close
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
