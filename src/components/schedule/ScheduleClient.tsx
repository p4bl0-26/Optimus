'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Printer, RefreshCw, Target } from 'lucide-react';
import { WeeklySchedule, StrategicRecommendation } from '@/types';
import { CrisisModeAlert } from './CrisisModeAlert';
import { CrisisCommand } from './CrisisCommand';
import { cn } from '@/lib/utils';

interface ScheduleClientProps {
  schedule: WeeklySchedule;
  recommendations: StrategicRecommendation[];
}

export function ScheduleClient({ schedule, recommendations }: ScheduleClientProps) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isCrisisMode = schedule.criticalWarnings.some(w => w.includes('CRISIS MODE'));

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // Refresh the current route to re-run server-side orchestration
    router.refresh();
    setTimeout(() => setIsRegenerating(false), 800);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFocusMode = () => {
    router.push('/focus');
  };

  // Group blocks by day
  const groupedBlocks = schedule.blocks.reduce((acc, block) => {
    const day = new Date(block.startTime).toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(block);
    return acc;
  }, {} as Record<string, typeof schedule.blocks>);

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-orbitron font-bold text-2xl tracking-widest text-[var(--color-text-primary)] uppercase">
            Execution Schedule
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Generated at {new Date(schedule.generatedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)]',
              'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
              'transition-all text-xs font-bold tracking-wider font-orbitron uppercase',
              isRegenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
            Regenerate
          </button>
          
          <button
            onClick={handlePrint}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)]',
              'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
              'transition-all text-xs font-bold tracking-wider font-orbitron uppercase'
            )}
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </button>
          
          <button
            onClick={handleFocusMode}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-accent-primary)]/50',
              'bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]',
              'hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-text-inverse)]',
              'transition-all text-xs font-bold tracking-wider font-orbitron uppercase shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            )}
          >
            <Target className="w-4 h-4" />
            Enter Focus Mode
          </button>
        </div>
      </div>

      {/* Print Header (Only in Print) */}
      <div className="hidden print:block mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="font-orbitron font-bold text-3xl tracking-widest text-black uppercase">
          OPTIMUS EXECUTION SCHEDULE
        </h1>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Generated: {new Date(schedule.generatedAt).toLocaleString()}</span>
          <span>Chief Confidence: {schedule.confidence}%</span>
        </div>
      </div>

      <CrisisModeAlert warnings={schedule.criticalWarnings} />
      
      <CrisisCommand 
        isActive={isCrisisMode} 
        recommendations={recommendations} 
        confidence={schedule.confidence} 
      />

      <div className="space-y-8 print:space-y-6">
        <h2 className="font-orbitron font-bold text-lg tracking-widest text-[var(--color-text-primary)] uppercase border-b border-[var(--color-border)] pb-2 print:text-black">
          WEEKLY EXECUTION PLAN
        </h2>

        {Object.entries(groupedBlocks).map(([day, blocks]) => (
          <div key={day} className="space-y-4 break-inside-avoid">
            <h3 className="font-orbitron font-bold text-sm text-[var(--color-accent-primary)] uppercase">
              {day}
            </h3>
            
            <div className="space-y-3">
              {blocks.map((block) => {
                const startTime = new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                const endTime = new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                
                const isCritical = block.riskBand === 'Critical';
                const isHigh = block.riskBand === 'High Risk';

                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'p-4 rounded-lg border intel-card relative overflow-hidden',
                      isCritical 
                        ? 'border-[var(--color-risk-critical)]/50 bg-[var(--color-risk-critical-bg)]'
                        : isHigh 
                        ? 'border-[var(--color-risk-high)]/50 bg-[var(--color-risk-high-bg)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
                      'print:border-gray-400 print:bg-white print:text-black'
                    )}
                  >
                    {isCritical && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-risk-critical)]" />
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs font-bold text-[var(--color-text-muted)] print:text-gray-600">
                            {startTime}–{endTime}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] print:border-gray-300">
                            {block.source.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-orbitron font-bold text-base text-[var(--color-text-primary)] uppercase print:text-black">
                          {block.title}
                        </h4>
                      </div>
                      
                      {block.riskBand !== 'Safe' && (
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border",
                          isCritical ? "border-[var(--color-risk-critical)] text-[var(--color-risk-critical)]" : "border-[var(--color-risk-high)] text-[var(--color-risk-high)]"
                        )}>
                          {block.riskBand}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 print:border-gray-200">
                      <p className="text-xs text-[var(--color-text-secondary)] font-medium print:text-gray-700">
                        <span className="text-[10px] font-orbitron uppercase text-[var(--color-text-muted)] tracking-wider mr-2 print:text-gray-500">
                          Reason:
                        </span>
                        {block.reason}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
