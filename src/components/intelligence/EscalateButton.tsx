'use client'

import { useState, useTransition } from 'react'
import { escalateToPartnerAction } from '@/app/actions/escalation'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export function EscalateButton({ obligationId }: { obligationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleEscalate = () => {
    startTransition(() => {
      escalateToPartnerAction(obligationId, 'partner@example.com').then(() => {
        setSuccess(true)
      })
    })
  }

  if (success) {
    return (
      <div className="w-full py-3 px-4 rounded bg-[var(--color-risk-safe)]/10 border border-[var(--color-risk-safe)] flex items-center justify-center gap-2 text-[var(--color-risk-safe)]">
        <CheckCircle2 size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Escalation Sent</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleEscalate}
      disabled={isPending}
      className="w-full py-3 px-4 rounded bg-[var(--color-risk-critical)] text-[var(--color-bg-primary)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
    >
      <AlertTriangle size={16} />
      {isPending ? 'ESCALATING...' : 'ESCALATE TO PARTNER'}
    </button>
  )
}
