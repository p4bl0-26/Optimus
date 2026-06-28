'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RotateCcw, RefreshCw, LogOut, ChevronRight, LayoutTemplate } from 'lucide-react';
import { resetJudgeData, exitJudgeSession } from '@/lib/demo/judgeSession';
import { TOUR_STEPS } from './DemoTour';

interface JudgeQuickActionsProps {
  onRestartTour: () => void;
  onSkipToFeature: (stepIndex: number) => void;
  onViewArchitecture: () => void;
}

export function JudgeQuickActions({ onRestartTour, onSkipToFeature, onViewArchitecture }: JudgeQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSkipMenu, setShowSkipMenu] = useState(false);

  const handleResetDemo = async () => {
    await resetJudgeData();
    onRestartTour();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 bg-[var(--color-bg-base)] border border-[var(--color-border)] p-2 rounded-xl shadow-2xl flex flex-col w-56 overflow-hidden"
          >
            <div className="px-3 py-2 text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase border-b border-[var(--color-border)] mb-1">
              Judge Control Panel
            </div>

            <button
              onClick={() => { onRestartTour(); setIsOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors text-left"
            >
              <RotateCcw size={14} className="text-[var(--color-accent-primary)]" />
              Restart Tour
            </button>

            <button
              onClick={handleResetDemo}
              className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors text-left"
            >
              <RefreshCw size={14} className="text-[var(--color-risk-monitor)]" />
              Reset Demo Data
            </button>

            <button
              onClick={() => setShowSkipMenu(!showSkipMenu)}
              className="flex items-center justify-between px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                Skip to Feature
              </div>
            </button>

            {/* Skip Menu Sub-list */}
            <AnimatePresence>
              {showSkipMenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[var(--color-bg-secondary)] rounded mx-1 mt-1 border border-[var(--color-border)]"
                >
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {TOUR_STEPS.map((step, idx) => (
                      <button
                        key={step.id}
                        onClick={() => {
                          onSkipToFeature(idx);
                          setIsOpen(false);
                          setShowSkipMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)] transition-colors truncate"
                      >
                        {step.step}. {step.title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => { onViewArchitecture(); setIsOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors text-left"
            >
              <LayoutTemplate size={14} className="text-[var(--color-risk-safe)]" />
              View Architecture
            </button>

            <div className="my-1 border-t border-[var(--color-border)]"></div>

            <button
              onClick={exitJudgeSession}
              className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-risk-critical)] hover:bg-[var(--color-risk-critical-bg)] rounded-lg transition-colors text-left"
            >
              <LogOut size={14} />
              Exit Judge Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] shadow-[0_0_24px_rgba(118,192,67,0.2)] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Toggle Judge Menu"
      >
        <Settings2 size={20} />
      </button>
    </div>
  );
}
