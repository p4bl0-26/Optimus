'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Play, ShieldAlert, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isJudgeMode, exitJudgeSession } from '@/lib/demo/judgeSession';
import { supabase } from '@/lib/db/supabase';

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [judgeMode, setJudgeMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("optimus_auth");
    localStorage.removeItem("optimus_judge");
    localStorage.removeItem("optimus_judge_mode");
    sessionStorage.clear();
    
    window.history.replaceState({}, "", "/");
    router.replace('/');
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
          {(user?.user_metadata?.optimus_display_name || user?.user_metadata?.name || user?.user_metadata?.full_name)?.[0]?.toUpperCase() || 'O'}
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)] hidden lg:block">
          {user?.user_metadata?.optimus_display_name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Operator'}
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
            className="absolute overflow-hidden flex flex-col w-[320px]"
            style={{
              top: 'calc(100% + 16px)',
              right: '12px',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 9999,
              background: 'rgba(9,9,9,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(118,192,67,0.15)',
              borderRadius: '18px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(118,192,67,0.10)',
            }}
          >
            <div style={{ paddingTop: '24px', paddingBottom: '20px', paddingInline: '24px' }}>
              <div style={{ marginBottom: '24px' }} className="border-b border-[var(--color-border)] pb-6 flex flex-col items-center">
                <p className="text-sm font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase text-center w-full truncate px-2">
                  {user?.user_metadata?.optimus_display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Operator'}
                </p>
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase text-center mt-4">
                  AI Chief of Staff Operator
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {judgeMode && (
                  <button
                    onClick={handleToggleJudgeMode}
                    className="w-full flex items-center justify-center gap-3 text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-[rgba(118,192,67,0.10)] text-[var(--color-text-primary)] group"
                    style={{
                      height: '48px',
                      paddingInline: '20px',
                      borderRadius: '12px',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 0 24px rgba(118,192,67,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <ShieldAlert size={14} className="text-[var(--color-risk-critical)]" />
                    Exit Judge Mode
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical)] group"
                  style={{
                    height: '48px',
                    paddingInline: '20px',
                    borderRadius: '12px',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(255,68,68,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
