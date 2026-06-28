'use client';

/**
 * OPTIMUS — Adaptive Executive Summary Component
 * Phase 10.9 (Final Spec)
 *
 * Renders the adaptive intelligence panel that unlocks capabilities by risk tier.
 *
 * INFORM  → Summary only
 * PLAN    → + Blueprint + Research
 * EXECUTE → + Draft status + References + Rescue Plan + [PREPARE FORM] button
 * CRISIS  → Everything + Crisis banner + Form draft + Chief Commands
 *
 * Design: intel-card · hard borders · Orbitron · Framer Motion · Military hierarchy
 */

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Zap, Target, ChevronDown, ChevronUp,
  Clock, Brain, Activity, Crosshair, RefreshCw, FileText,
  Search, BookOpen, ClipboardList, CheckCircle2, Printer, Copy,
} from 'lucide-react';
import { ExecutiveSummaryPackage, ExecutiveSummaryRiskLevel, ExecutionState } from '@/types';
import { generateAdaptiveSummaryAction } from '@/app/actions/adaptiveSummarizer';
import { generateFormDraftAction } from '@/app/actions/workAccelerator';

// ─── Constants ────────────────────────────────────────────────
const TIER_CONFIG: Record<ExecutiveSummaryRiskLevel, {
  label: string;
  stateLabel: string;
  color: string;
  bgColor: string;
  Icon: React.ElementType;
  pulse: boolean;
}> = {
  NORMAL:   { label: 'NORMAL OPERATIONS',           stateLabel: 'INFORM',  color: 'var(--color-risk-safe)',     bgColor: 'var(--color-bg-secondary)', Icon: Shield,    pulse: false },
  MODERATE: { label: 'MODERATE RISK',                stateLabel: 'PLAN',    color: 'var(--color-risk-monitor)',  bgColor: 'var(--color-bg-secondary)', Icon: Activity,  pulse: false },
  HIGH:     { label: 'HIGH RISK — EXECUTE',          stateLabel: 'EXECUTE', color: 'var(--color-risk-high)',     bgColor: 'var(--color-bg-secondary)', Icon: AlertTriangle, pulse: true },
  CRITICAL: { label: 'CRISIS MODE ACTIVE',           stateLabel: 'CRISIS',  color: 'var(--color-risk-critical)', bgColor: 'var(--color-risk-critical-bg)', Icon: Crosshair, pulse: true },
};

const EXECUTION_STATE_COLORS: Record<ExecutionState, string> = {
  INFORM:  'var(--color-risk-safe)',
  PLAN:    'var(--color-risk-monitor)',
  EXECUTE: 'var(--color-risk-high)',
  CRISIS:  'var(--color-risk-critical)',
};

// ─── Helpers ──────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">{children}</p>;
}

function ConfidenceBadge({ value, color }: { value: number; color: string }) {
  return (
    <span className="font-orbitron text-xs font-bold px-2 py-0.5 border flex-shrink-0"
      style={{ color, borderColor: color, backgroundColor: `${color}15` }}>
      {value}%
    </span>
  );
}

function CapabilityRow({ text, color, level }: { text: string; color: string; level: ExecutiveSummaryRiskLevel }) {
  const isObj    = text.startsWith('OBJ_');
  const isCmd    = text.startsWith('CMD:');
  const isRescue = text.startsWith('RESCUE');
  const isConf   = text.startsWith('CHIEF_CONFIDENCE');

  const displayText = text
    .replace(/^OBJ_\d+: /, '')
    .replace(/^CMD: /, '')
    .replace(/^RESCUE — /, 'RESCUE — ')
    .replace(/^CHIEF_CONFIDENCE: /, 'Chief Confidence: ');

  const Icon = isObj ? Target : isCmd ? Zap : isRescue ? Clock : isConf ? Brain : Activity;
  const textColor = (isObj || isCmd) && level === 'CRITICAL'
    ? 'var(--color-risk-critical)'
    : 'var(--color-text-secondary)';

  return (
    <div className="flex items-start gap-2.5 py-2 px-3 border-b border-[var(--color-border-subtle)] last:border-0 text-xs">
      <Icon size={10} className="mt-0.5 flex-shrink-0" style={{ color }} />
      <span style={{ color: textColor }} className={isObj || isCmd ? 'font-semibold' : ''}>
        {displayText}
      </span>
    </div>
  );
}

// ─── Crisis Banner ────────────────────────────────────────────
function CrisisBanner({ directive }: { directive: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="p-4 border border-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-risk-critical)] animate-ping" />
        <p className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-risk-critical)] font-orbitron">
          ⚠ Chief Directive — Immediate Action Required
        </p>
      </div>
      <p className="text-xs text-[var(--color-risk-critical)] leading-relaxed font-medium">{directive}</p>
    </motion.div>
  );
}

// ─── High Directive ───────────────────────────────────────────
function HighDirective({ directive }: { directive: string }) {
  return (
    <div className="p-3 border border-[var(--color-risk-high)]/40 bg-[var(--color-risk-high)]/5 mx-4 my-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-risk-high)] mb-1 flex items-center gap-1.5">
        <Brain size={10} /> Chief Directive
      </p>
      <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">{directive}</p>
    </div>
  );
}

// ─── Inline Form Draft Panel ──────────────────────────────────
function InlineFormPanel({ obligationId }: { obligationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<any>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () => {
    startTransition(async () => {
      const res = await generateFormDraftAction(obligationId);
      if (res.success) {
        setForm(res.data);
        setEditFields(res.data.fields);
      }
    });
  };

  const copyAll = () => {
    const text = Object.entries(editFields).map(([k, v]) => `${k}: ${v || 'MISSING'}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!form) {
    return (
      <div className="p-4 bg-[var(--color-bg-base)] border border-[var(--color-risk-critical)]/20">
        <Label>Autonomous Form Assistant</Label>
        <button
          id="crisis-prepare-form-btn"
          onClick={load}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-risk-critical)]/50 text-[var(--color-risk-critical)] hover:bg-[var(--color-risk-critical)] hover:text-[var(--color-text-inverse)] transition-all duration-150 disabled:opacity-40"
        >
          <ClipboardList size={11} className={isPending ? 'animate-spin' : ''} />
          {isPending ? 'GENERATING FORM...' : 'PREPARE FORM — AUTO-FILL APPLICATION'}
        </button>
      </div>
    );
  }

  const filled = Object.values(editFields).filter(v => v.trim() !== '').length;
  const pct = Math.round((filled / form.totalFields) * 100);
  const missing = Object.keys(editFields).filter(k => !editFields[k]?.trim());

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="border border-[var(--color-risk-critical)]/30 overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[var(--color-risk-critical-bg)] border-b border-[var(--color-risk-critical)]/20 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-risk-critical)] font-orbitron">
            FORM ASSISTANT — {form.formType.replace(/_/g, ' ').toUpperCase()}
          </p>
          {approved && <p className="text-[10px] text-[var(--color-risk-safe)] mt-0.5 flex items-center gap-1"><CheckCircle2 size={10} /> Approved for manual submission</p>}
        </div>
        <ConfidenceBadge value={pct} color="var(--color-risk-critical)" />
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <div className="flex justify-between mb-1.5">
          <Label>Fields Completed</Label>
          <span className="font-orbitron text-xs font-bold text-[var(--color-text-primary)]">{filled} / {form.totalFields}</span>
        </div>
        <div className="w-full h-1 bg-[var(--color-bg-base)] border border-[var(--color-border)]">
          <div className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--color-risk-safe)' : 'var(--color-risk-critical)' }} />
        </div>
        {missing.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {missing.map(f => (
              <div key={f} className="flex items-center gap-1.5 text-[10px] text-[var(--color-risk-high)]">
                <AlertTriangle size={9} />□ {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="max-h-[280px] overflow-y-auto divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
        {Object.entries(editFields).map(([key, value]) => (
          <div key={key} className="px-4 py-2 flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] w-28 flex-shrink-0">{key}</span>
            {editMode ? (
              <input type="text" value={value}
                onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                className="flex-1 text-xs px-2 py-1 bg-[var(--color-bg-base)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]" />
            ) : (
              <span className={`flex-1 text-xs ${value ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-risk-high)] italic'}`}>
                {value || '⚠ Missing'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] flex flex-wrap gap-2">
        {!approved && (
          <button id="crisis-form-approve-btn" onClick={() => setApproved(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-risk-safe)] text-[var(--color-risk-safe)] hover:bg-[var(--color-risk-safe)] hover:text-[var(--color-text-inverse)] transition-all duration-150">
            <CheckCircle2 size={10} /> APPROVE
          </button>
        )}
        <button id="crisis-form-edit-btn" onClick={() => setEditMode(e => !e)}
          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all">
          {editMode ? '[ SAVE ]' : '[ EDIT ]'}
        </button>
        <button id="crisis-form-copy-btn" onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all">
          <Copy size={10} /> {copied ? 'COPIED' : 'COPY'}
        </button>
        <button id="crisis-form-print-btn" onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all">
          <Printer size={10} /> SUBMIT MANUALLY
        </button>
      </div>
      {approved && (
        <div className="px-4 pb-3 bg-[var(--color-bg-base)]">
          <p className="text-[9px] text-[var(--color-risk-safe)] border border-[var(--color-risk-safe)]/30 p-2 bg-[var(--color-risk-safe)]/5">
            ✓ Approved. Submit manually via your institution&apos;s platform. OPTIMUS has not sent anything automatically.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Prepare Form Button (HIGH level) ────────────────────────
function PrepareFormButton({ obligationId }: { obligationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<any>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [approved, setApproved] = useState(false);

  const load = () => {
    startTransition(async () => {
      const res = await generateFormDraftAction(obligationId);
      if (res.success) { setForm(res.data); setEditFields(res.data.fields); }
    });
  };

  if (!form) {
    return (
      <button id="high-prepare-form-btn" onClick={load} disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-risk-high)]/50 text-[var(--color-risk-high)] hover:bg-[var(--color-risk-high)] hover:text-[var(--color-text-inverse)] transition-all duration-150 w-full justify-center disabled:opacity-40">
        <ClipboardList size={11} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'PREPARING FORM...' : '[ PREPARE FORM ]'}
      </button>
    );
  }

  const filled = Object.values(editFields).filter(v => v.trim() !== '').length;
  const missing = Object.keys(editFields).filter(k => !editFields[k]?.trim());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Application Ready</p>
        <span className="text-xs font-orbitron font-bold text-[var(--color-risk-safe)]">{filled}/{form.totalFields} Fields</span>
      </div>
      {missing.length > 0 && missing.map(f => (
        <div key={f} className="text-[10px] text-[var(--color-risk-high)] flex items-center gap-1">□ {f}</div>
      ))}
      <div className="flex gap-2 flex-wrap">
        {!approved && <button id="high-form-approve-btn" onClick={() => setApproved(true)}
          className="px-3 py-1.5 text-[10px] font-bold uppercase border border-[var(--color-risk-safe)] text-[var(--color-risk-safe)] hover:bg-[var(--color-risk-safe)] hover:text-[var(--color-text-inverse)] transition-all">
          <CheckCircle2 size={10} className="inline mr-1" />APPROVE
        </button>}
        <button id="high-form-edit-btn" onClick={() => setEditMode(e => !e)}
          className="px-3 py-1.5 text-[10px] font-bold uppercase border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all">
          {editMode ? '[ SAVE ]' : '[ EDIT ]'}
        </button>
        <button id="high-form-submit-btn" onClick={() => window.print()}
          className="px-3 py-1.5 text-[10px] font-bold uppercase border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all">
          <Printer size={10} className="inline mr-1" />SUBMIT MANUALLY
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Content Renderer ────────────────────────────────────
function SummaryContent({ pkg, obligationId }: { pkg: ExecutiveSummaryPackage; obligationId: string }) {
  const tier = TIER_CONFIG[pkg.riskLevel];
  const stateColor = EXECUTION_STATE_COLORS[pkg.executionState];

  // Separate sentinel tokens from display capabilities
  const hasCrisisBanner   = pkg.enabledCapabilities.includes('CRISIS_BANNER');
  const hasPrepareForm    = pkg.enabledCapabilities.some(c => c === 'FORM_BUTTON: PREPARE_FORM');
  const hasFormStatus     = pkg.enabledCapabilities.some(c => c.startsWith('FORM:'));

  const displayCaps = pkg.enabledCapabilities.filter(c =>
    c !== 'CRISIS_BANNER' &&
    c !== 'FORM_BUTTON: PREPARE_FORM' &&
    !c.startsWith('CHIEF_CONFIDENCE:')
  );

  // Group capabilities by category for structured display
  const objectives  = displayCaps.filter(c => c.startsWith('OBJ_'));
  const commands    = displayCaps.filter(c => c.startsWith('CMD:'));
  const rescue      = displayCaps.filter(c => c.startsWith('RESCUE'));
  const info        = displayCaps.filter(c => !c.startsWith('OBJ_') && !c.startsWith('CMD:') && !c.startsWith('RESCUE') && !c.startsWith('FORM:') && !c.startsWith('ACCOUNTABILITY'));

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">

      {/* Crisis Banner */}
      {hasCrisisBanner && pkg.chiefDirective && <CrisisBanner directive={pkg.chiefDirective} />}

      {/* High Directive */}
      {pkg.riskLevel === 'HIGH' && pkg.chiefDirective && <HighDirective directive={pkg.chiefDirective} />}

      {/* Executive Summary */}
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <Label>Executive Summary</Label>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{pkg.executiveSummary}</p>
      </div>

      {/* Primary Objectives (CRITICAL) */}
      {objectives.length > 0 && (
        <div className="border-b border-[var(--color-border-subtle)]">
          <div className="px-4 py-2 bg-[var(--color-risk-critical-bg)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-risk-critical)] flex items-center gap-1.5">
              <Target size={10} /> Primary Objectives
            </p>
          </div>
          {objectives.map((cap, i) => <CapabilityRow key={i} text={cap} color={tier.color} level={pkg.riskLevel} />)}
        </div>
      )}

      {/* Intelligence Features */}
      {info.length > 0 && (
        <div className="border-b border-[var(--color-border-subtle)]">
          <div className="px-4 py-2 bg-[var(--color-bg-base)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Clock size={10} /> Intelligence Package
            </p>
          </div>
          {info.map((cap, i) => <CapabilityRow key={i} text={cap} color={tier.color} level={pkg.riskLevel} />)}
        </div>
      )}

      {/* Rescue Plan (HIGH + CRITICAL) */}
      {rescue.length > 0 && (
        <div className="border-b border-[var(--color-border-subtle)]">
          <div className="px-4 py-2 bg-[var(--color-bg-base)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-1.5">
              <FileText size={10} /> Rescue Plan
            </p>
          </div>
          {rescue.map((cap, i) => <CapabilityRow key={i} text={cap} color={tier.color} level={pkg.riskLevel} />)}
        </div>
      )}

      {/* Crisis Commands */}
      {commands.length > 0 && (
        <div className="border-b border-[var(--color-border-subtle)]">
          <div className="px-4 py-2 bg-[var(--color-risk-critical-bg)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-risk-critical)] flex items-center gap-1.5">
              <Zap size={10} /> Chief Commands
            </p>
          </div>
          {commands.map((cap, i) => <CapabilityRow key={i} text={cap} color={tier.color} level={pkg.riskLevel} />)}
        </div>
      )}

      {/* PREPARE FORM Button (HIGH level) */}
      {hasPrepareForm && !hasCrisisBanner && (
        <div className="p-4 border-b border-[var(--color-border-subtle)] space-y-2">
          <Label>Form Assistant</Label>
          <PrepareFormButton obligationId={obligationId} />
        </div>
      )}

      {/* Inline Form Draft (CRITICAL) */}
      {hasCrisisBanner && (
        <div className="p-4 border-b border-[var(--color-border-subtle)]">
          <Label>Autonomous Form Assistant</Label>
          <InlineFormPanel obligationId={obligationId} />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-[var(--color-bg-base)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
            Risk Level: <span className="font-bold" style={{ color: tier.color }}>{pkg.riskLevel}</span>
          </p>
          <div className="h-3 w-px bg-[var(--color-border)]" />
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: stateColor }}>
            MODE: {pkg.executionState}
          </p>
        </div>
        {(pkg.riskLevel === 'HIGH' || pkg.riskLevel === 'CRITICAL') && (
          <p className="text-[9px] text-[var(--color-text-muted)] italic">
            Scroll down → Work Accelerator for draft
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
interface Props {
  obligationId: string;
  initialRiskScore?: number;
}

export function AdaptiveExecutiveSummary({ obligationId, initialRiskScore = 0 }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pkg, setPkg] = useState<ExecutiveSummaryPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const predictedLevel: ExecutiveSummaryRiskLevel =
    initialRiskScore >= 85 ? 'CRITICAL' :
    initialRiskScore >= 70 ? 'HIGH' :
    initialRiskScore >= 40 ? 'MODERATE' :
    'NORMAL';

  const displayLevel = pkg?.riskLevel ?? predictedLevel;
  const tier = TIER_CONFIG[displayLevel];
  const TierIcon = tier.Icon;
  const stateLabel = pkg?.executionState ?? TIER_CONFIG[displayLevel].stateLabel;

  const generate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateAdaptiveSummaryAction(obligationId);
      if (result.success) { setPkg(result.data); setHasLoaded(true); setExpanded(true); }
      else setError(result.error);
    });
  };

  return (
    <div className="intel-card overflow-hidden">
      {/* ── Tier Header ── */}
      <div className="p-4 flex items-center justify-between border-b"
        style={{ borderColor: `${tier.color}25`, backgroundColor: tier.bgColor }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center border flex-shrink-0"
            style={{ borderColor: tier.color, backgroundColor: `${tier.color}15` }}>
            <TierIcon size={15} style={{ color: tier.color }} className={tier.pulse ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest font-orbitron" style={{ color: tier.color }}>
              {tier.label}
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5 font-bold uppercase tracking-wider">
              Mode: <span style={{ color: EXECUTION_STATE_COLORS[stateLabel as ExecutionState] ?? tier.color }}>{stateLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pkg && <ConfidenceBadge value={pkg.confidence} color={tier.color} />}
          <button id="adaptive-summary-generate-btn" onClick={generate} disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all duration-150 disabled:opacity-40">
            <RefreshCw size={10} className={isPending ? 'animate-spin' : ''} />
            {hasLoaded ? 'REFRESH' : 'GENERATE'}
          </button>
          {pkg && (
            <button id="adaptive-summary-expand-btn" onClick={() => setExpanded(e => !e)}
              className="p-1.5 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Loading ── */}
      <AnimatePresence>
        {isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 flex items-center gap-3">
            {[0, 0.15, 0.3].map((d, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse"
                style={{ animationDelay: `${d}s` }} />
            ))}
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-orbitron">
              OPTIMUS synthesizing intelligence...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 border-t border-[var(--color-risk-critical)]/30 bg-[var(--color-risk-critical-bg)] flex items-start gap-2">
            <AlertTriangle size={13} className="text-[var(--color-risk-critical)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-risk-critical)]">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <AnimatePresence>
        {pkg && expanded && !isPending && (
          <SummaryContent key="content" pkg={pkg} obligationId={obligationId} />
        )}
      </AnimatePresence>
    </div>
  );
}
