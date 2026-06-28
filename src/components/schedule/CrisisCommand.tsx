import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { StrategicRecommendation } from '@/types';
import { cn } from '@/lib/utils';

interface CrisisCommandProps {
  isActive: boolean;
  recommendations: StrategicRecommendation[];
  confidence: number;
}

export function CrisisCommand({ isActive, recommendations, confidence }: CrisisCommandProps) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'border-2 border-[var(--color-risk-critical)]',
        'bg-[var(--color-bg-elevated)] p-6 rounded-lg mb-8 relative overflow-hidden',
        'intel-card'
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-risk-critical)] animate-pulse" />
      
      <div className="flex items-center gap-3 mb-4 text-[var(--color-risk-critical)]">
        <ShieldAlert className="w-8 h-8" />
        <h2 className="font-orbitron font-bold text-xl tracking-widest uppercase">
          CRISIS MODE ACTIVE
        </h2>
      </div>

      <div className="mb-4">
        <h3 className="text-[10px] font-orbitron text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
          PRIMARY OBJECTIVES
        </h3>
        <ul className="space-y-3">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <li key={idx} className="flex gap-3 text-sm font-medium">
              <span className="text-[var(--color-risk-critical)]">
                {idx + 1}.
              </span>
              <span className="text-[var(--color-text-primary)]">
                {rec.recommendation}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[10px] font-orbitron tracking-widest text-[var(--color-text-muted)] uppercase">
          <span>CHIEF CONFIDENCE</span>
          <span className="text-[var(--color-accent-primary)] font-bold text-sm">
            {confidence}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
