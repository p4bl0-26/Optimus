'use client';

/**
 * OPTIMUS — Work Accelerator Component
 * Phase 10.8
 *
 * Military command-center aesthetic. intel-card. Orbitron. Framer Motion.
 * Renders acceleration package results inline — no navigation.
 *
 * SAFETY: No automatic submissions. Every action requires human approval.
 */

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, FileText, BookOpen, Search, ClipboardList,
  CheckCircle2, AlertTriangle, Clock, Target,
  ChevronDown, ChevronUp, Copy, Printer,
} from 'lucide-react';
import { WorkAccelerationPackage, FormDraft } from '@/types';
import { generateAccelerationPackageAction, generateFormDraftAction } from '@/app/actions/workAccelerator';

// ─── Types ────────────────────────────────────────────────────
type ActivePanel =
  | 'summary'
  | 'blueprint'
  | 'draft'
  | 'research'
  | 'form'
  | null;

interface Props {
  obligationId: string;
  obligationType?: string;
  obligationTitle?: string;
}

// ─── Helpers ──────────────────────────────────────────────────
function ConfidencePill({ value }: { value: number }) {
  const color =
    value >= 85 ? 'var(--color-risk-safe)' :
    value >= 60 ? 'var(--color-risk-monitor)' :
    'var(--color-risk-critical)';
  return (
    <span
      className="font-orbitron text-xs font-bold px-2 py-0.5 border"
      style={{ color, borderColor: color, backgroundColor: `${color}15` }}
    >
      {value}%
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
      {children}
    </p>
  );
}

// ─── Form Review Panel ────────────────────────────────────────
function FormReviewPanel({ draft, onClose }: { draft: FormDraft; onClose: () => void }) {
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>(draft.fields);
  const [approved, setApproved] = useState(false);

  const completedNow = Object.values(fields).filter(v => v.trim() !== '').length;
  const totalFields = draft.totalFields;
  const missingNow = Object.keys(fields).filter(k => !fields[k] || fields[k].trim() === '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="intel-card overflow-hidden border-none shadow-[var(--shadow-hover)] bg-[var(--color-bg-secondary)]"
    >
      {/* Header */}
      <div className="p-4 bg-[var(--color-accent-glow)] border-b border-[var(--color-accent-primary)]/30 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-accent-primary)] mb-0.5">
            FORM ASSISTANT — {draft.formType.replace(/_/g, ' ').toUpperCase()}
          </p>
          {approved ? (
            <p className="text-xs font-semibold text-[var(--color-risk-safe)] flex items-center gap-1">
              <CheckCircle2 size={12} /> APPROVED FOR MANUAL SUBMISSION
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Awaiting your review & approval</p>
          )}
        </div>
        <ConfidencePill value={Math.round((completedNow / totalFields) * 100)} />
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Fields Completed</SectionLabel>
          <span className="font-orbitron text-sm font-bold text-[var(--color-text-primary)]">
            {completedNow} / {totalFields}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border)]">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(completedNow / totalFields) * 100}%`,
              backgroundColor: completedNow === totalFields
                ? 'var(--color-risk-safe)'
                : 'var(--color-accent-primary)',
            }}
          />
        </div>
        {missingNow.length > 0 && (
          <div className="mt-3 space-y-1">
            <SectionLabel>Missing Fields</SectionLabel>
            {missingNow.map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-[var(--color-risk-high)]">
                <AlertTriangle size={10} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="p-4 max-h-[360px] overflow-y-auto space-y-3 bg-[var(--color-bg-elevated)]">
        <SectionLabel>Pre-filled Application Fields</SectionLabel>
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-text-muted)]">
              {key}
            </label>
            {editMode ? (
              <input
                type="text"
                value={value}
                onChange={e => setFields(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full text-xs px-3 py-2 bg-[var(--color-bg-base)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors"
                placeholder={`Enter ${key}`}
              />
            ) : (
              <div
                className={`text-xs px-3 py-2 border ${
                  value
                    ? 'text-[var(--color-text-primary)] border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]'
                    : 'text-[var(--color-risk-high)] border-[var(--color-risk-high)]/30 bg-[var(--color-risk-critical-bg)] italic'
                }`}
              >
                {value || `⚠ Missing — enter ${key}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] flex flex-wrap gap-2">
        {!approved && (
          <button
            id="form-approve-btn"
            onClick={() => setApproved(true)}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider border border-[var(--color-risk-safe)] text-[var(--color-risk-safe)] bg-transparent hover:bg-[var(--color-risk-safe)] hover:text-[var(--color-text-inverse)] transition-all duration-150 flex items-center gap-1.5"
          >
            <CheckCircle2 size={12} /> APPROVE
          </button>
        )}
        <button
          id="form-edit-btn"
          onClick={() => setEditMode(e => !e)}
          className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150"
        >
          {editMode ? '[ SAVE EDITS ]' : '[ EDIT ]'}
        </button>
        <button
          id="form-submit-manually-btn"
          onClick={() => window.print()}
          className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)] transition-all duration-150 flex items-center gap-1.5"
        >
          <Printer size={11} /> SUBMIT MANUALLY
        </button>
        <button
          id="form-close-btn"
          onClick={onClose}
          className="ml-auto px-3 py-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          CLOSE
        </button>
      </div>

      {approved && (
        <div className="px-4 pb-4 pt-0 bg-[var(--color-bg-base)]">
          <div className="p-3 border border-[var(--color-risk-safe)]/40 bg-[var(--color-risk-safe)]/5 text-xs text-[var(--color-risk-safe)]">
            ✓ Application approved. Submit manually using your institution&apos;s platform.
            OPTIMUS has not sent anything automatically.
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Acceleration Result Panel ────────────────────────────────
function AccelerationPanel({
  pkg,
  activeSection,
  setActiveSection,
}: {
  pkg: WorkAccelerationPackage;
  activeSection: string | null;
  setActiveSection: (s: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyDraft = () => {
    if (pkg.firstDraft) {
      navigator.clipboard.writeText(pkg.firstDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const durationHrs = Math.round((pkg.estimatedDuration / 60) * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="intel-card overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
    >
      {/* Header Stats */}
      <div className="p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] grid grid-cols-3 gap-4">
        <div>
          <SectionLabel>Estimated Duration</SectionLabel>
          <p className="font-orbitron text-base font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--color-accent-primary)]" />
            {durationHrs}h
          </p>
        </div>
        <div>
          <SectionLabel>Success Probability</SectionLabel>
          <ConfidencePill value={pkg.successProbability} />
        </div>
        <div>
          <SectionLabel>Generated</SectionLabel>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {new Date(pkg.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <SectionLabel>Executive Summary</SectionLabel>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
          {pkg.executiveSummary}
        </p>
      </div>

      {/* Blueprint */}
      <div className="border-b border-[var(--color-border-subtle)]">
        <button
          id="accelerator-blueprint-toggle"
          onClick={() => setActiveSection(activeSection === 'bp' ? null : 'bp')}
          className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] flex items-center gap-2">
            <ClipboardList size={13} className="text-[var(--color-accent-primary)]" />
            Submission Blueprint
          </span>
          {activeSection === 'bp' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <AnimatePresence>
          {activeSection === 'bp' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5">
                {pkg.blueprint.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)]"
                  >
                    <span className="font-orbitron text-[9px] text-[var(--color-accent-primary)] mt-0.5 flex-shrink-0 font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Research Plan */}
      <div className="border-b border-[var(--color-border-subtle)]">
        <button
          id="accelerator-research-toggle"
          onClick={() => setActiveSection(activeSection === 'research' ? null : 'research')}
          className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] flex items-center gap-2">
            <Search size={13} className="text-[var(--color-accent-primary)]" />
            Research Plan
          </span>
          {activeSection === 'research' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <AnimatePresence>
          {activeSection === 'research' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <SectionLabel>Research Topics</SectionLabel>
                  <div className="space-y-1.5">
                    {pkg.researchTopics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-primary)]">
                        <span className="text-[var(--color-accent-primary)] mt-0.5">□</span>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <SectionLabel>References Needed</SectionLabel>
                  <div className="space-y-1.5">
                    {pkg.referencesNeeded.map((ref, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] italic">
                        <BookOpen size={10} className="mt-0.5 flex-shrink-0 text-[var(--color-text-muted)]" />
                        {ref}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* First Draft */}
      {pkg.firstDraft && (
        <div className="border-b border-[var(--color-border-subtle)]">
          <button
            id="accelerator-draft-toggle"
            onClick={() => setActiveSection(activeSection === 'draft' ? null : 'draft')}
            className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] flex items-center gap-2">
              <FileText size={13} className="text-[var(--color-accent-primary)]" />
              First Draft
              <span className="px-1.5 py-0.5 text-[8px] bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 font-bold">
                AI GENERATED
              </span>
            </span>
            {activeSection === 'draft' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <AnimatePresence>
            {activeSection === 'draft' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto font-mono">
                    {pkg.firstDraft}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      id="accelerator-copy-draft-btn"
                      onClick={copyDraft}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150 flex items-center gap-1.5"
                    >
                      <Copy size={10} />
                      {copied ? 'COPIED' : 'COPY DRAFT'}
                    </button>
                    <button
                      id="accelerator-print-draft-btn"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150 flex items-center gap-1.5"
                    >
                      <Printer size={10} /> PRINT
                    </button>
                  </div>
                  <p className="mt-2 text-[9px] text-[var(--color-text-muted)] italic">
                    ⚠ Draft generated by OPTIMUS — human review required before submission.
                    OPTIMUS has not submitted anything automatically.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export function WorkAccelerator({ obligationId, obligationType, obligationTitle }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [pkg, setPkg] = useState<WorkAccelerationPackage | null>(null);
  const [form, setForm] = useState<FormDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const type = obligationType?.toLowerCase() ?? '';
  const showFormButton =
    type.includes('hackathon') ||
    type.includes('registration') ||
    type.includes('event') ||
    type.includes('internship') ||
    type.includes('club') ||
    type.includes('scholarship') ||
    obligationTitle?.toLowerCase().includes('hackathon') ||
    obligationTitle?.toLowerCase().includes('registration') ||
    obligationTitle?.toLowerCase().includes('apply');

  const handleAccelerate = (action: ActivePanel, generateDraft: boolean) => {
    setError(null);
    setActivePanel(action);
    setLoadingAction(action);
    setForm(null);

    startTransition(async () => {
      const result = await generateAccelerationPackageAction(obligationId, generateDraft);
      setLoadingAction(null);
      if (result.success) {
        setPkg(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  const handleForm = () => {
    setError(null);
    setActivePanel('form');
    setLoadingAction('form');
    setPkg(null);

    startTransition(async () => {
      const result = await generateFormDraftAction(obligationId);
      setLoadingAction(null);
      if (result.success) {
        setForm(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  const btnBase =
    'flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

  const btnActive = (panel: ActivePanel) =>
    activePanel === panel && (pkg || form)
      ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-glow)]'
      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="intel-card p-5 bg-[var(--color-bg-secondary)] border-l-2 border-l-[var(--color-accent-primary)] border-t-0 border-r-0 border-b-0 shadow-[var(--shadow-hover)]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)] mb-1 flex items-center gap-1.5">
          <Zap size={11} /> AI Work Accelerator
        </p>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
          OPTIMUS generates execution-ready outputs. You review, edit, and submit.
          <span className="block mt-1 text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
            No automatic submissions · Human approval mandatory
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="accelerator-btn-summary"
          className={`${btnBase} ${btnActive('summary')}`}
          disabled={isPending}
          onClick={() => handleAccelerate('summary', false)}
        >
          {loadingAction === 'summary' ? (
            <span className="animate-pulse">GENERATING...</span>
          ) : (
            <><Target size={12} /> GENERATE SUMMARY</>
          )}
        </button>

        <button
          id="accelerator-btn-blueprint"
          className={`${btnBase} ${btnActive('blueprint')}`}
          disabled={isPending}
          onClick={() => handleAccelerate('blueprint', false)}
        >
          {loadingAction === 'blueprint' ? (
            <span className="animate-pulse">GENERATING...</span>
          ) : (
            <><ClipboardList size={12} /> GENERATE BLUEPRINT</>
          )}
        </button>

        <button
          id="accelerator-btn-draft"
          className={`${btnBase} ${btnActive('draft')}`}
          disabled={isPending}
          onClick={() => handleAccelerate('draft', true)}
        >
          {loadingAction === 'draft' ? (
            <span className="animate-pulse">GENERATING...</span>
          ) : (
            <><FileText size={12} /> GENERATE FIRST DRAFT</>
          )}
        </button>

        <button
          id="accelerator-btn-research"
          className={`${btnBase} ${btnActive('research')}`}
          disabled={isPending}
          onClick={() => handleAccelerate('research', false)}
        >
          {loadingAction === 'research' ? (
            <span className="animate-pulse">GENERATING...</span>
          ) : (
            <><Search size={12} /> GENERATE RESEARCH PLAN</>
          )}
        </button>

        {showFormButton && (
          <button
            id="accelerator-btn-form"
            className={`${btnBase} ${btnActive('form')} col-span-2`}
            disabled={isPending}
            onClick={handleForm}
          >
            {loadingAction === 'form' ? (
              <span className="animate-pulse">PREPARING FORM...</span>
            ) : (
            <><ClipboardList size={12} /> PREPARE FORM — AUTO-FILL APPLICATION</>
            )}
          </button>
        )}
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="intel-card p-4 border-[var(--color-accent-primary)]/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse [animation-delay:0.4s]" />
              <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-orbitron">
                OPTIMUS is generating your package...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="intel-card p-4 bg-[var(--color-risk-critical-bg)] flex items-start gap-2 border-none"
          >
            <AlertTriangle size={14} className="text-[var(--color-risk-critical)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--color-risk-critical)]">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {pkg && !isPending && (
          <AccelerationPanel
            key="pkg"
            pkg={pkg}
            activeSection={expandedSection}
            setActiveSection={setExpandedSection}
          />
        )}
        {form && !isPending && (
          <FormReviewPanel
            key="form"
            draft={form}
            onClose={() => { setForm(null); setActivePanel(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
