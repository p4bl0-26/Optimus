'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, LayoutTemplate, RotateCcw, User, RefreshCw, ExternalLink, Video, ArrowRight } from 'lucide-react';
import { resetJudgeData, exitJudgeSession } from '@/lib/demo/judgeSession';
import { recordJudgeExitReason } from '@/lib/demo/judgeAnalytics';

interface TourEndScreenProps {
  isOpen: boolean;
  onExploreFreely: () => void;
  onRestartDemo: () => void;
  onViewArchitecture: () => void;
}

export function TourEndScreen({ isOpen, onExploreFreely, onRestartDemo, onViewArchitecture }: TourEndScreenProps) {
  if (!isOpen) return null;

  const features = [
    'Executive Briefings',
    'Responsibility Maps',
    'Future Outcomes',
    'Ask Chief',
    'Focus Mode',
    'Autonomous Scheduling',
    'AI Work Accelerator',
    'Autonomous Form Assistant',
    'Weekly Executive Reports'
  ];

  const handleLogin = () => {
    recordJudgeExitReason('login');
    exitJudgeSession();
  };

  const handleResetData = async () => {
    await resetJudgeData();
    onRestartDemo();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] bg-[var(--color-bg-primary)] flex flex-col items-center p-6 overflow-y-auto custom-scrollbar"
      >
        <div className="w-full max-w-4xl mt-12 mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent-primary)] flex items-center justify-center mb-6 shadow-[0_0_32px_rgba(118,192,67,0.2)]">
            <Shield size={32} className="text-[var(--color-accent-primary)]" />
          </div>
          
          <div className="w-full border-t border-[var(--color-border)] mb-6 max-w-lg" />
          <h1 className="text-3xl md:text-5xl font-bold font-orbitron text-[var(--color-text-primary)] mb-2 tracking-widest uppercase">
            OPTIMUS
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium tracking-widest uppercase mb-6">
            Your Autonomous AI Chief of Staff
          </p>
          <div className="w-full border-t border-[var(--color-border)] max-w-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
          {/* Left: Features Checklist */}
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-6">
              Features Demonstrated:
            </h2>
            <div className="space-y-4 mb-8">
              {features.map((f, i) => (
                <motion.div 
                  key={f}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={18} className="text-[var(--color-accent-primary)] flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{f}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-glow)] p-6 rounded-lg text-center">
              <p className="text-lg font-bold font-orbitron text-[var(--color-accent-primary)] tracking-widest uppercase leading-relaxed">
                OPTIMUS DOES NOT MANAGE TASKS.
                <br/>
                IT MANAGES EXECUTION.
              </p>
            </div>
          </div>

          {/* Right: Primary Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onExploreFreely}
              className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] transition-all rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <ArrowRight size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]" />
                <span className="font-bold text-sm tracking-widest uppercase text-[var(--color-text-primary)]">[ EXPLORE FREELY ]</span>
              </div>
            </button>

            <button
              onClick={onViewArchitecture}
              className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] transition-all rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <LayoutTemplate size={18} className="text-[var(--color-accent-primary)]" />
                <span className="font-bold text-sm tracking-widest uppercase text-[var(--color-text-primary)]">[ VIEW ARCHITECTURE ]</span>
              </div>
            </button>

            <button
              onClick={onRestartDemo}
              className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] transition-all rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]" />
                <span className="font-bold text-sm tracking-widest uppercase text-[var(--color-text-primary)]">[ RESTART DEMO ]</span>
              </div>
            </button>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-between p-4 mt-4 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-90 transition-all rounded-lg group shadow-xl"
            >
              <div className="flex items-center gap-3">
                <User size={18} />
                <span className="font-bold text-sm tracking-widest uppercase">[ LOGIN TO PERSONAL WORKSPACE ]</span>
              </div>
            </button>

            {/* Judge Control Panel */}
            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-4 text-center">
                Judge Control Panel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleResetData}
                  className="flex items-center justify-center gap-2 p-2 border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                >
                  <RefreshCw size={12} />
                  [ RESET DATA ]
                </button>
                <a
                  href="https://github.com/hmnkh/optimus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2 border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                >
                  <ExternalLink size={12} />
                  [ OPEN GITHUB ]
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 p-2 border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all"
                >
                  <Video size={12} />
                  [ WATCH DEMO ]
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
