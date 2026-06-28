'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Play, ShieldAlert, ChevronDown } from 'lucide-react';
import { isJudgeMode, exitJudgeSession } from '@/lib/demo/judgeSession';

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [judgeMode, setJudgeMode] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setJudgeMode(isJudgeMode()), 0);
    const handleModeChange = () => setJudgeMode(isJudgeMode());
    window.addEventListener('judge-mode-changed', handleModeChange);
    return () => {
      clearTimeout(t);
      window.removeEventListener('judge-mode-changed', handleModeChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleJudgeMode = () => {
    if (judgeMode) {
      exitJudgeSession();
    } else {
      window.dispatchEvent(new Event('start-judge-tour'));
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("optimus_auth");
    localStorage.removeItem("optimus_judge");
    sessionStorage.clear();
    
    // Clear any ?mode=judge from URL without reloading immediately
    window.history.replaceState({}, "", window.location.pathname);
    
    // Hard redirect to root which will trigger the Auth Gate due to missing localStorage
    window.location.replace('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="user-avatar-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-all duration-150 p-1 pl-2 pr-2"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-accent-tertiary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-inverse)] border border-[var(--color-accent-primary)]/30">
          H
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)] hidden lg:block">
          Himank
        </span>
        <ChevronDown size={12} className="text-[var(--color-text-muted)] hidden lg:block" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bg-[var(--color-bg-base)] overflow-hidden"
            style={{
              top: 'calc(100% + 12px)',
              width: '280px',
              borderRadius: '16px',
              zIndex: 9999,
              boxShadow: '0 24px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(118,192,67,.15)',
            }}
          >
            <div className="p-5">
            <div className="pb-4 mb-2 border-b border-[var(--color-border)]">
              <p className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
                Himank Garg
              </p>
              <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider mt-1 uppercase">
                AI Chief of Staff Operator
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              <button
                onClick={handleToggleJudgeMode}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
              >
                {judgeMode ? (
                  <>
                    <ShieldAlert size={14} className="text-[var(--color-risk-critical)]" />
                    Exit Judge Mode
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-[var(--color-accent-primary)]" />
                    Enter Judge Mode
                  </>
                )}
              </button>

              <div className="h-px bg-[var(--color-border)] my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors hover:bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical)]"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
