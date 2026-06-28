'use client';

/**
 * OPTIMUS — Autonomous Form Assistant Panel
 * Demo Experience 3.1
 * AI executes. Humans supervise.
 */

import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, FileText, FileCheck2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormAssistantPanel({ obligationId }: { obligationId: string }) {
  return (
    <div className="intel-card flex flex-col h-full overflow-hidden border border-[var(--color-border)]" id="form-assistant">
      <div className="p-4 border-b border-[var(--color-border)] flex items-start justify-between bg-[var(--color-bg-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--color-accent-primary)]/10 flex items-center justify-center border border-[var(--color-accent-primary)]/30">
            <ClipboardList className="text-[var(--color-accent-primary)]" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-orbitron uppercase tracking-widest text-[var(--color-text-primary)]">
              Form Assistant
            </h2>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
              ID: {obligationId.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[var(--color-risk-safe)]/10 border border-[var(--color-risk-safe)]/30 rounded flex items-center gap-2">
          <CheckCircle2 size={12} className="text-[var(--color-risk-safe)]" />
          <span className="text-[10px] font-bold text-[var(--color-risk-safe)] uppercase tracking-widest font-orbitron">
            Ready for Executive Review
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg-base)] custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="text-center space-y-2 mb-8 border-b border-[var(--color-border-subtle)] pb-6">
            <h1 className="text-xl font-bold font-orbitron text-[var(--color-text-primary)] uppercase tracking-widest">
              Hackathon Travel Reimbursement Request
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest">
              Auto-prepared by OPTIMUS Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Applicant</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">Himank Garg</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Event</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">AMD Developer Hackathon 2026</span>
                </div>

                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Travel Date</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">29 June 2026</span>
                </div>

                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Departure</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">Jaipur Junction</span>
                </div>

                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Destination</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">New Delhi</span>
                </div>

                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Estimated Expense</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">₹1,850</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Purpose</p>
                <div className="p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded text-sm text-[var(--color-text-secondary)]">
                  Participation in AMD Developer Hackathon (ACT II)
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-[var(--color-accent-primary)]" />
                  <h3 className="text-xs font-bold font-orbitron text-[var(--color-accent-primary)] uppercase tracking-widest">
                    AI Validation Complete
                  </h3>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle2 size={14} className="text-[var(--color-risk-safe)] flex-shrink-0" />
                    <span>Mandatory fields verified</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle2 size={14} className="text-[var(--color-risk-safe)] flex-shrink-0" />
                    <span>Expense policy compliance confirmed</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle2 size={14} className="text-[var(--color-risk-safe)] flex-shrink-0" />
                    <span>Supporting documents validated</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Supporting Documents</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded">
                    <FileText size={14} className="text-[var(--color-text-secondary)]" />
                    <span className="text-xs text-[var(--color-text-primary)] flex-1">Train Ticket.pdf</span>
                    <CheckCircle2 size={12} className="text-[var(--color-risk-safe)]" />
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded">
                    <FileText size={14} className="text-[var(--color-text-secondary)]" />
                    <span className="text-xs text-[var(--color-text-primary)] flex-1">Event Registration.pdf</span>
                    <CheckCircle2 size={12} className="text-[var(--color-risk-safe)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-end gap-4">
        <button className="px-6 py-2.5 text-xs font-bold font-orbitron tracking-widest uppercase border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors rounded shadow-sm">
          [ Request Changes ]
        </button>
        <button className="px-6 py-2.5 text-xs font-bold font-orbitron tracking-widest uppercase border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors rounded shadow-sm">
          [ Review ]
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold font-orbitron tracking-widest uppercase bg-[var(--color-risk-safe)] text-white hover:opacity-90 transition-opacity rounded shadow-[0_0_15px_rgba(118,192,67,0.3)]">
          <FileCheck2 size={16} />
          [ Approve & Submit ]
        </button>
      </div>
    </div>
  );
}
