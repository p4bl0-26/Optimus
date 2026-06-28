'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { isJudgeMode } from '@/lib/demo/judgeSession';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [judgeMode, setJudgeMode] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setJudgeMode(isJudgeMode()), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  const mockNotifications = [
    { id: 1, type: 'success', title: 'Demo reset completed', time: 'Just now' },
    { id: 2, type: 'critical', title: 'Critical intervention generated', time: '2m ago' },
    { id: 3, type: 'monitor', title: 'Risk exposure increased', time: '1h ago' },
    { id: 4, type: 'info', title: 'Accountability escalation created', time: '3h ago' },
  ];

  const notifications = judgeMode ? [] : mockNotifications; // Or in demo mode we can show them, user said "Content examples: Demo reset completed..." and "Empty state: NO ACTIVE NOTIFICATIONS". Let's show mock data or empty state. 
  // Wait, user explicitly listed empty state and examples. Let's show the examples for visual polish, but since it's "Read-only" in Judge Mode, maybe we just show them and disable actions.

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[150] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--color-bg-base)] border-l border-[var(--color-border)] shadow-2xl z-[160] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center">
                  <Bell size={18} className="text-[var(--color-accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
                    System Alerts
                  </h2>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase mt-1">
                    {judgeMode ? 'Read-only Session' : 'Active Monitoring'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-bg-elevated)]">
                    <CheckCircle size={20} className="text-[var(--color-risk-safe)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--color-text-primary)] tracking-widest uppercase mb-1">
                      NO ACTIVE NOTIFICATIONS
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      OPTIMUS REPORTS STABLE OPERATIONS.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(n => {
                    const icons = {
                      success: <CheckCircle size={14} className="text-[var(--color-risk-safe)]" />,
                      critical: <ShieldAlert size={14} className="text-[var(--color-risk-critical)]" />,
                      monitor: <Bell size={14} className="text-[var(--color-risk-monitor)]" />,
                      info: <Info size={14} className="text-[var(--color-accent-primary)]" />
                    };
                    const borders = {
                      success: 'border-[var(--color-risk-safe)]/30 bg-[var(--color-risk-safe-bg)]',
                      critical: 'border-[var(--color-risk-critical)]/30 bg-[var(--color-risk-critical-bg)]',
                      monitor: 'border-[var(--color-risk-monitor)]/30 bg-[var(--color-risk-monitor)]/10',
                      info: 'border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-glow)]'
                    };
                    return (
                      <div key={n.id} className={`p-4 rounded-lg border ${borders[n.type as keyof typeof borders]} flex items-start gap-3`}>
                        <div className="mt-0.5">{icons[n.type as keyof typeof icons]}</div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                            {n.title}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-[var(--color-border)]">
                <button 
                  disabled={judgeMode}
                  className="w-full py-3 rounded-lg border border-[var(--color-border)] text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All Alerts
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
