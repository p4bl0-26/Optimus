'use client';

import StartupAnimation from './StartupAnimation';
import { useSplash } from '@/contexts/SplashContext';
import { JudgeEntryModal } from '@/components/auth/JudgeEntryModal';
import { useState, useEffect } from 'react';
import { startJudgeSession, isJudgeMode, resetJudgeData } from '@/lib/demo/judgeSession';
import { supabase } from '@/lib/db/supabase';
import { Loader2 } from 'lucide-react';

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const { showSplash, setShowSplash } = useSplash();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'judge') {
        startJudgeSession('url');
        const t = setTimeout(() => {
          setShowAuthGate(false);
          setAuthLoading(false);
        }, 0);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const checkAuth = async () => {
    if (typeof window === 'undefined') return;
    
    // Check real session first
    const { data: { session } } = await supabase.auth.getSession();
    const hasAuthToken = !!localStorage.getItem("optimus_auth");

    if (session || hasAuthToken) {
      setShowAuthGate(false);
      setAuthLoading(false);
      return;
    }

    // Then check Judge Mode
    const hasJudge = !!localStorage.getItem("optimus_judge");
    const isJudgeUrl = new URLSearchParams(window.location.search).get("mode") === "judge";
    
    if (hasJudge || isJudgeUrl) {
      setShowAuthGate(false);
      setAuthLoading(false);
      return;
    }

    // Otherwise show Auth Gate
    setShowAuthGate(true);
    setAuthLoading(false);
  };

  useEffect(() => {
    if (!showSplash) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkAuth();
    }
  }, [showSplash]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setShowAuthGate(false);
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCompleteSplash = () => {
    setShowSplash(false);
    // checkAuth is triggered by useEffect on showSplash change
  };

  const handleEnterJudgeMode = async () => {
    await resetJudgeData();
    localStorage.setItem("optimus_judge", "true");
    setShowAuthGate(false);
    // Let DemoTour know it should start automatically
    setTimeout(() => {
      window.dispatchEvent(new Event('start-judge-tour'));
    }, 500);
  };

  return (
    <>
      {showSplash && <StartupAnimation onComplete={handleCompleteSplash} />}
      {!showSplash && authLoading && !showAuthGate && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[var(--color-accent-primary)]" size={32} />
          <p className="text-xs font-bold font-orbitron tracking-widest text-[var(--color-text-secondary)] uppercase">
            AUTHENTICATING OPERATOR...
          </p>
        </div>
      )}
      {!showSplash && showAuthGate && !authLoading && (
        <JudgeEntryModal onEnterJudgeMode={handleEnterJudgeMode} />
      )}
      {!showSplash && !showAuthGate && !authLoading && children}
    </>
  );
}
