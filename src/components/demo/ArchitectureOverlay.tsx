'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Database, BrainCircuit, Activity, CheckCircle, ShieldAlert, Cpu, Bot, Zap, AppWindow, Layers } from 'lucide-react';

interface ArchitectureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureOverlay({ isOpen, onClose }: ArchitectureOverlayProps) {
  if (!isOpen) return null;

  const flowSteps = [
    { label: 'Discovery Agents', icon: <Bot size={16} /> },
    { label: 'Unified Obligation Graph', icon: <Database size={16} /> },
    { label: 'Risk Engine', icon: <Activity size={16} /> },
    { label: 'Future Outcomes', icon: <Zap size={16} /> },
    { label: 'Chief Of Staff', icon: <BrainCircuit size={16} /> },
    { label: 'Autonomous Scheduler', icon: <AppWindow size={16} /> },
    { label: 'Focus Mode', icon: <Cpu size={16} /> },
    { label: 'AI Work Accelerator', icon: <Zap size={16} /> },
    { label: 'Autonomous Form Assistant', icon: <Server size={16} /> },
    { label: 'Human Approval Layer', icon: <ShieldAlert size={16} /> },
    { label: 'Execution', icon: <CheckCircle size={16} /> },
  ];

  const techStack = [
    'Next.js 16',
    'React 19',
    'Supabase',
    'Gemini 2.5 Flash',
    'Framer Motion',
    'TailwindCSS',
    'TypeScript'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex flex-col md:flex-row"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-white flex items-center justify-center transition-colors z-50"
          aria-label="Close Architecture View"
        >
          <X size={20} />
        </button>

        {/* System Flow */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center border-r border-[var(--color-border)]">
          <h2 className="text-2xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] mb-8 uppercase text-center flex items-center gap-3">
            <Layers className="text-[var(--color-accent-primary)]" />
            [ SYSTEM FLOW ]
          </h2>

          <div className="flex flex-col items-center w-full max-w-md">
            {/* Sources */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6">
              {['Gmail', 'Calendar', 'Classroom'].map(src => (
                <div key={src} className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-lg text-center font-bold text-xs text-[var(--color-text-secondary)] shadow-lg">
                  {src}
                </div>
              ))}
            </div>

            {/* Pipeline */}
            {flowSteps.map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center w-full">
                <div className="h-6 w-px bg-gradient-to-b from-[var(--color-border)] to-[var(--color-accent-primary)]/50 opacity-50" />
                <div className="my-1 text-[var(--color-accent-primary)]/50">↓</div>
                <div className="h-6 w-px bg-gradient-to-t from-[var(--color-border)] to-[var(--color-accent-primary)]/50 opacity-50" />
                
                <div className="w-full p-4 border border-[var(--color-accent-primary)]/30 bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(118,192,67,0.05)]">
                  <div className="text-[var(--color-accent-primary)]">
                    {step.icon}
                  </div>
                  <span className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="w-full md:w-80 p-8 md:p-12 bg-[var(--color-bg-base)] flex flex-col justify-center">
          <h2 className="text-xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] mb-8 uppercase">
            [ TECH STACK ]
          </h2>
          <div className="flex flex-col gap-3">
            {techStack.map(tech => (
              <div key={tech} className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded text-sm font-medium text-[var(--color-text-secondary)] shadow-sm">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
