'use client';

/**
 * OPTIMUS — Autonomous Form Assistant Panel
 * Phase 10.10
 *
 * Standalone panel for form detection, auto-fill, validation and approval.
 * Full command-center aesthetic: intel-card · hard borders · Orbitron · Framer Motion.
 *
 * SAFETY: No automatic submissions. Every output requires human approval.
 * OPTIMUS MUST NEVER click Submit, accept Terms, or trigger external actions.
 * THE FINAL ACTION ALWAYS BELONGS TO THE USER.
 */

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, AlertTriangle, Eye, Edit3,
  Printer, Copy, ChevronDown, ChevronUp, Zap, RefreshCw,
} from 'lucide-react';
import { FormDraft } from '@/types';
import { generateFormDraftAction } from '@/app/actions/workAccelerator';

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<FormDraft['status'], { label: string; color: string; icon: React.ElementType }> = {
  READY:               { label: 'READY FOR APPROVAL', color: 'var(--color-risk-safe)',     icon: CheckCircle2 },
  MISSING_INFORMATION: { label: 'MISSING INFORMATION', color: 'var(--color-risk-high)',    icon: AlertTriangle },
  REQUIRES_APPROVAL:   { label: 'REQUIRES APPROVAL',   color: 'var(--color-risk-monitor)', icon: Eye },
};

// ─── Helpers ──────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">
      {children}
    </p>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border)]">
      <motion.div
        className="h-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ onPrepare, isPending }: { onPrepare: () => void; isPending: boolean }) {
  return (
    <div className="p-6 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center">
        <ClipboardList size={22} className="text-[var(--color-text-muted)]" />
      </div>
      <div>
        <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">Form Detection Ready</p>
        <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed max-w-xs">
          OPTIMUS will auto-detect the form type, pull your profile from memory, and pre-fill all available fields.
        </p>
      </div>
      <button
        id="form-assistant-prepare-btn"
        onClick={onPrepare}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-text-inverse)] transition-all duration-150 disabled:opacity-40"
      >
        <ClipboardList size={12} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'DETECTING FORM...' : '[ PREPARE FORM ]'}
      </button>
    </div>
  );
}

// ─── Form Result Panel ────────────────────────────────────────
function FormResult({
  draft,
  onRefresh,
  isPending,
}: {
  draft: FormDraft;
  onRefresh: () => void;
  isPending: boolean;
}) {
  const [editMode, setEditMode]       = useState(false);
  const [fields, setFields]           = useState<Record<string, string>>(draft.fields);
  const [approved, setApproved]       = useState(false);
  const [showReview, setShowReview]   = useState(false);
  const [showFields, setShowFields]   = useState(true);
  const [copied, setCopied]           = useState(false);

  const filled = Object.values(fields).filter(v => v.trim() !== '').length;
  const total  = draft.totalFields;
  const pct    = Math.round((filled / total) * 100);
  const missing = Object.keys(fields).filter(k => !fields[k]?.trim());

  const statusCfg = STATUS_CONFIG[draft.status];
  const StatusIcon = statusCfg.icon;

  const copyAll = () => {
    const text = Object.entries(fields).map(([k, v]) => `${k}: ${v || 'MISSING'}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-0">
      {/* ── Result Header ── */}
      <div className="p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              {draft.formType.replace(/_/g, ' ').toUpperCase()}
            </p>
            <p className="text-sm font-bold text-[var(--color-text-primary)] font-orbitron">
              {draft.title.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
              style={{ color: statusCfg.color, borderColor: statusCfg.color, backgroundColor: `${statusCfg.color}15` }}
            >
              <StatusIcon size={9} /> {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label>Fields Completed</Label>
            <span className="font-orbitron text-sm font-bold text-[var(--color-text-primary)]">
              {filled} / {total}
            </span>
          </div>
          <ProgressBar pct={pct} color={statusCfg.color} />
          <div className="flex justify-between">
            <span className="text-[9px] text-[var(--color-text-muted)]">Confidence</span>
            <span className="text-[9px] font-bold font-orbitron" style={{ color: statusCfg.color }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Missing fields */}
        {missing.length > 0 && (
          <div className="mt-3 p-2 border border-[var(--color-risk-high)]/30 bg-[var(--color-risk-high)]/5 space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-risk-high)] flex items-center gap-1.5">
              <AlertTriangle size={9} /> Missing Information
            </p>
            {missing.map(f => (
              <p key={f} className="text-[10px] text-[var(--color-risk-high)] flex items-center gap-1.5 pl-1">
                □ {f}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Fields Section ── */}
      <div className="border-b border-[var(--color-border-subtle)]">
        <button
          id="form-assistant-toggle-fields"
          onClick={() => setShowFields(s => !s)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <ClipboardList size={10} /> Auto-filled Data
          </span>
          {showFields ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <AnimatePresence>
          {showFields && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
                {Object.entries(fields).map(([key, value]) => (
                  <div key={key} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] w-32 flex-shrink-0 leading-tight">
                      {key}
                    </span>
                    {editMode ? (
                      <input
                        type="text"
                        value={value}
                        onChange={e => setFields(p => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 text-xs px-2 py-1 bg-[var(--color-bg-base)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors"
                        placeholder={`Enter ${key}`}
                      />
                    ) : (
                      <span
                        className={`flex-1 text-xs font-medium ${
                          value
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-risk-high)] italic'
                        }`}
                      >
                        {value || `⚠ Missing`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Recommendations ── */}
      <div className="border-b border-[var(--color-border-subtle)]">
        <button
          id="form-assistant-toggle-review"
          onClick={() => setShowReview(s => !s)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Zap size={10} /> Recommendations
            <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 font-bold">
              {draft.recommendations.length}
            </span>
          </span>
          {showReview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5 pt-1">
                {draft.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <CheckCircle2 size={10} className="text-[var(--color-accent-primary)] mt-0.5 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Approval Banner ── */}
      {approved && (
        <div className="px-4 py-3 border-b border-[var(--color-risk-safe)]/30 bg-[var(--color-risk-safe)]/5">
          <p className="text-[10px] text-[var(--color-risk-safe)] font-bold flex items-center gap-1.5">
            <CheckCircle2 size={11} />
            Application approved. Submit manually via your institution&apos;s platform.
          </p>
          <p className="text-[9px] text-[var(--color-risk-safe)]/70 mt-0.5 pl-4">
            OPTIMUS has not sent anything automatically. The final action belongs to you.
          </p>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="p-4 bg-[var(--color-bg-base)] flex flex-wrap gap-2">
        {/* APPROVE */}
        {!approved && (
          <button
            id="form-assistant-approve-btn"
            onClick={() => setApproved(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-risk-safe)] text-[var(--color-risk-safe)] hover:bg-[var(--color-risk-safe)] hover:text-[var(--color-text-inverse)] transition-all duration-150"
          >
            <CheckCircle2 size={11} /> APPROVE
          </button>
        )}

        {/* REVIEW DATA */}
        <button
          id="form-assistant-review-btn"
          onClick={() => setShowReview(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150"
        >
          <Eye size={11} /> REVIEW DATA
        </button>

        {/* EDIT */}
        <button
          id="form-assistant-edit-btn"
          onClick={() => setEditMode(e => !e)}
          className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all duration-150 ${
            editMode
              ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
          }`}
        >
          <Edit3 size={11} /> {editMode ? 'SAVE EDITS' : 'EDIT'}
        </button>

        {/* COPY */}
        <button
          id="form-assistant-copy-btn"
          onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150"
        >
          <Copy size={11} /> {copied ? 'COPIED' : 'COPY ALL'}
        </button>

        {/* SUBMIT MANUALLY */}
        <button
          id="form-assistant-submit-btn"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150"
        >
          <Printer size={11} /> SUBMIT MANUALLY
        </button>

        {/* REFRESH */}
        <button
          id="form-assistant-refresh-btn"
          onClick={onRefresh}
          disabled={isPending}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150 disabled:opacity-40"
        >
          <RefreshCw size={11} className={isPending ? 'animate-spin' : ''} /> REFRESH
        </button>
      </div>

      {/* Safety footer */}
      <div className="px-4 pb-3 pt-0 bg-[var(--color-bg-base)]">
        <p className="text-[8px] text-[var(--color-text-muted)] italic leading-relaxed text-center border-t border-[var(--color-border-subtle)] pt-2">
          OPTIMUS DOES NOT SUBMIT AUTOMATICALLY · NO TERMS ACCEPTED · NO EXTERNAL ACTIONS · HUMAN APPROVAL MANDATORY
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
interface Props {
  obligationId: string;
}

export function FormAssistantPanel({ obligationId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft]             = useState<FormDraft | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const prepare = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateFormDraftAction(obligationId);
      if (result.success) setDraft(result.data);
      else setError(result.error);
    });
  };

  return (
    <div className="intel-card overflow-hidden">
      {/* ── Header ── */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-glow)] flex items-center justify-center flex-shrink-0">
            <ClipboardList size={15} className="text-[var(--color-accent-primary)]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)] font-orbitron">
              Autonomous Form Assistant
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
              Auto-detect · Auto-fill · Human approval required
            </p>
          </div>
        </div>
        {draft && (
          <span
            className="text-[9px] font-bold px-2 py-0.5 border font-orbitron"
            style={{
              color: STATUS_CONFIG[draft.status].color,
              borderColor: STATUS_CONFIG[draft.status].color,
              backgroundColor: `${STATUS_CONFIG[draft.status].color}15`,
            }}
          >
            {draft.confidence}%
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex items-center gap-3"
          >
            {[0, 0.15, 0.3].map((d, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-orbitron">
              Scanning memory and detecting form type...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-[var(--color-risk-critical)]/30 bg-[var(--color-risk-critical-bg)] flex items-start gap-2"
          >
            <AlertTriangle size={13} className="text-[var(--color-risk-critical)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-risk-critical)]">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!draft && !isPending && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState onPrepare={prepare} isPending={isPending} />
          </motion.div>
        )}
        {draft && !isPending && (
          <motion.div key="result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FormResult draft={draft} onRefresh={prepare} isPending={isPending} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
