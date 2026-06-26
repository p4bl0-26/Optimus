'use client';

import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Bot, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  'Risk Matrix',
  'Future Outcomes',
  'Rescue Plan',
  'Historical Memory',
  'Strategic Recommendations'
];

export default function Loading() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length ? prev + 1 : prev));
    }, 400); // Fast deterministic progress
    return () => clearInterval(interval);
  }, []);

  return (
    <PageContainer id="obligation-loading">
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mb-6">
          <Bot size={28} className="text-[var(--color-accent-primary)] animate-pulse" />
        </div>
        
        <h2 className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] mb-8 uppercase">
          Analyzing Obligation...
        </h2>

        <div className="w-full space-y-3">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]"
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-[var(--color-risk-safe)]" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-[var(--color-accent-primary)] border-t-transparent animate-spin' : 'border-[var(--color-border)]'}`} />
                )}
                <span className={`text-xs font-medium ${isCompleted ? 'text-[var(--color-text-primary)]' : isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                  {step}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </PageContainer>
  );
}
