import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CrisisModeAlert({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border border-[var(--color-risk-critical)]/50',
        'bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical)]',
        'p-4 rounded-lg flex items-start gap-4 mb-6 shadow-[0_0_15px_rgba(255,59,48,0.15)]'
      )}
    >
      <AlertOctagon className="w-6 h-6 flex-shrink-0 animate-pulse mt-0.5" />
      <div>
        <h3 className="font-orbitron font-bold text-sm tracking-widest uppercase mb-2">
          CRISIS MODE ACTIVATED
        </h3>
        <ul className="space-y-1 text-sm font-medium">
          {warnings.map((w, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="opacity-70">[{idx + 1}]</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
