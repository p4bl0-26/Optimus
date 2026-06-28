'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, User } from 'lucide-react';
import { startJudgeSession, isJudgeMode } from '@/lib/demo/judgeSession';

interface JudgeEntryModalProps {
  onLogin: () => void;
  onEnterJudgeMode: () => void;
}

export function JudgeEntryModal({ onLogin, onEnterJudgeMode }: JudgeEntryModalProps) {
  const [show, setShow] = useState(false);

  // Example: Show after a short delay (post splash animation)
  useEffect(() => {
    // If they are already in judge mode via URL, don't show the modal here
    // In actual implementation, page.tsx or layout.tsx will handle the URL param and skip this modal
    if (!isJudgeMode()) {
      const timer = setTimeout(() => setShow(true), 2000); // 2 seconds delay to allow splash
      return () => clearTimeout(timer);
    }
  }, []);

  // Trap focus & disable escape
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judge-entry-title"
      >
        <div className="w-full max-w-2xl text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/30 flex items-center justify-center">
              <Shield size={32} className="text-[var(--color-accent-primary)]" />
            </div>
          </div>
          <h1 id="judge-entry-title" className="text-3xl md:text-5xl font-bold font-orbitron text-[var(--color-text-primary)] mb-4 tracking-widest uppercase">
            WELCOME TO OPTIMUS
          </h1>
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] font-medium tracking-widest uppercase">
            Your Autonomous AI Chief of Staff
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Login Option */}
          <button
            onClick={onLogin}
            className="intel-card group p-8 text-left bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] transition-all duration-300 flex flex-col items-start h-full"
            aria-label="Login to personal workspace"
          >
            <div className="w-10 h-10 rounded bg-[var(--color-bg-elevated)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-text-primary)] group-hover:text-[var(--color-bg-primary)] transition-colors">
              <User size={18} />
            </div>
            <h2 className="text-xl font-bold font-orbitron text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">
              [ LOGIN ]
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-grow leading-relaxed">
              Continue to your personal workspace.
              <br /><br />
              Authentication providers are determined by deployment configuration.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
              PROCEED <ArrowRight size={14} />
            </div>
          </button>

          {/* Judge Mode Option */}
          <button
            onClick={() => {
              startJudgeSession('manual');
              onEnterJudgeMode();
            }}
            className="intel-card group p-8 text-left bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/40 hover:border-[var(--color-accent-primary)] hover:shadow-[0_0_48px_rgba(118,192,67,0.15)] transition-all duration-300 flex flex-col items-start h-full"
            aria-label="Enter Judge Mode"
          >
            <div className="w-10 h-10 rounded bg-[var(--color-accent-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent-primary)] group-hover:text-[var(--color-bg-primary)] text-[var(--color-accent-primary)] transition-colors">
              <Shield size={18} />
            </div>
            <h2 className="text-xl font-bold font-orbitron text-[var(--color-accent-primary)] mb-3 uppercase tracking-wider">
              [ ENTER JUDGE MODE ]
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-grow leading-relaxed">
              Explore OPTIMUS in a guided, read-only environment.
              <br /><br />
              No account required. No persistence.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-primary)] group-hover:scale-105 transition-transform">
              LAUNCH IMMERSIVE TOUR <ArrowRight size={14} />
            </div>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
