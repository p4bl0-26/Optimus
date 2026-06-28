'use client'

import { useState, useTransition } from 'react'
import { resolveConflictAction } from '@/app/actions/scheduling'
import { Calendar, CheckCircle2, Loader2 } from 'lucide-react'

interface ResolveConflictButtonProps {
  eventId: string
}

export function ResolveConflictButton({ eventId }: ResolveConflictButtonProps) {
  const [newTime, setNewTime] = useState('')
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleResolve = () => {
    if (!newTime) return
    startTransition(() => {
      resolveConflictAction(eventId, newTime).then((res) => {
        if (res.success) {
          setSuccess(true)
        } else {
          alert('Failed to resolve conflict: ' + res.error)
        }
      })
    })
  }

  if (success) {
    return (
      <div className="mt-3 p-3 rounded bg-[var(--color-risk-safe)]/10 border border-[var(--color-risk-safe)] flex items-center justify-center gap-2 text-[var(--color-risk-safe)]">
        <CheckCircle2 size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Conflict Resolved</span>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <input 
        type="datetime-local" 
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
        className="w-full p-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
      />
      <button
        onClick={handleResolve}
        disabled={isPending || !newTime}
        className="w-full py-2 px-4 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
        {isPending ? 'RESOLVING...' : 'RESOLVE'}
      </button>
    </div>
  )
}
