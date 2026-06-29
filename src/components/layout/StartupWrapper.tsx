'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StartupAnimation from './StartupAnimation';
import { useSplash } from '@/contexts/SplashContext';
import { JudgeEntryModal } from '@/components/auth/JudgeEntryModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { startJudgeSession, resetJudgeData, JUDGE_KEY } from '@/lib/demo/judgeSession';
import { supabase } from '@/lib/db/supabase';
import { Loader2 } from 'lucide-react';

enum BootState {
  LOADING,
  AUTH_REQUIRED,
  DISPLAY_NAME_REQUIRED,
  ONBOARDING_REQUIRED,
  READY,
  FAILED
}

declare global {
  interface Window {
    __optimusJudgeInitialized?: boolean;
  }
}

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showSplash, setShowSplash } = useSplash();
  const [bootState, setBootState] = useState<BootState>(BootState.LOADING);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const initialized = useRef(false);

  // Failsafe logger for boot transitions
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[BOOT]", BootState[bootState]);
    }
  }, [bootState]);

  const bootstrap = async () => {
    try {
      if (typeof window === 'undefined') return;

      const hasJudge = !!localStorage.getItem(JUDGE_KEY) || !!localStorage.getItem("optimus_judge");
      const isJudgeUrl = new URLSearchParams(window.location.search).get("mode") === "judge";
      
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;

      console.group("OPTIMUS BOOT");
      console.log("session", !!session);
      console.log("judge", hasJudge);
      console.log("displayName", metadata?.optimus_display_name || null);
      console.log("onboardingComplete", metadata?.optimus_onboarding_complete || false);
      console.log("currentURL", window.location.href);
      console.groupEnd();

      if (hasJudge || isJudgeUrl) {
        if (isJudgeUrl) {
          startJudgeSession('url');
        }
        console.log("[JUDGE] START");
        setBootState(BootState.READY);
        setHasInitialized(true);
        setIsInitializing(false);
        return;
      }

      if (!session) {
        setBootState(BootState.AUTH_REQUIRED);
        setHasInitialized(true);
        setIsInitializing(false);
        return;
      }

      if (metadata?.optimus_onboarding_complete) {
        setBootState(BootState.READY);
        setHasInitialized(true);
        setIsInitializing(false);
        return;
      }

      if (metadata?.optimus_display_name) {
        setBootState(BootState.ONBOARDING_REQUIRED);
      } else {
        setBootState(BootState.DISPLAY_NAME_REQUIRED);
      }
      setHasInitialized(true);
      setIsInitializing(false);

    } catch (e) {
      console.error("[BOOT] Initialization failed", e);
      setBootState(BootState.FAILED);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!showSplash && !initialized.current) {
      initialized.current = true;
      bootstrap();

      // Initialization timeout fallback
      setTimeout(() => {
        setIsInitializing((prev) => {
          if (prev) {
            console.error("[BOOT] Initialization timed out");
            setBootState(BootState.FAILED);
            return false;
          }
          return prev;
        });
      }, 3000);
    }
  }, [showSplash]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const hasJudge = !!localStorage.getItem(JUDGE_KEY) || !!localStorage.getItem("optimus_judge");
      
      if (event === 'SIGNED_IN') {
        bootstrap();
      } else if (event === 'SIGNED_OUT') {
        if (!hasJudge) {
          setBootState(BootState.AUTH_REQUIRED);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCompleteSplash = () => {
    setShowSplash(false);
  };

  const [judgeInitializing, setJudgeInitializing] = useState(false);

  const handleEnterJudgeMode = async () => {
    if (window.__optimusJudgeInitialized) return;
    window.__optimusJudgeInitialized = true;
    
    setJudgeInitializing(true);
    console.log("[JUDGE] START");

    const timeout = new Promise(resolve => setTimeout(resolve, 2000));
    await Promise.race([resetJudgeData(), timeout]);
    
    console.log("[JUDGE] DATA SEEDED");
    localStorage.setItem(JUDGE_KEY, "true");
    setBootState(BootState.READY);
    setJudgeInitializing(false);

    setTimeout(() => {
      window.dispatchEvent(new Event('start-judge-tour'));
    }, 500);
  };

  const handleOnboardingComplete = () => {
    setBootState(BootState.READY);
    router.replace('/');
  };

  const handleResetSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      {showSplash && <StartupAnimation onComplete={handleCompleteSplash} />}
      
      {!showSplash && (isInitializing || bootState === BootState.LOADING) && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[var(--color-accent-primary)]" size={32} />
          <p className="text-xs font-bold font-orbitron tracking-widest text-[var(--color-text-secondary)] uppercase">
            AUTHENTICATING OPERATOR...
          </p>
        </div>
      )}
      
      {!showSplash && bootState === BootState.FAILED && !isInitializing && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4">
           <div className="intel-card max-w-lg w-full p-8 border border-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)]/20 shadow-[0_0_50px_rgba(255,68,68,0.1)] text-center">
            <h1 className="text-3xl font-bold font-orbitron text-[var(--color-risk-critical)] tracking-widest uppercase mb-4">
              SYSTEM INITIALIZATION FAILED
            </h1>
            <p className="text-sm font-mono text-[var(--color-text-primary)] mb-8 uppercase tracking-wide">
              Boot sequence timed out or encountered an error.
            </p>
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => router.replace('/')}
                className="w-full px-6 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors text-xs font-bold uppercase tracking-widest"
              >
                [ RETURN TO SPLASH ]
              </button>
              <button
                onClick={handleResetSession}
                className="w-full px-6 py-3 bg-[var(--color-risk-critical)] text-[var(--color-bg-primary)] hover:bg-[var(--color-risk-critical)]/90 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                [ RESET SESSION ]
              </button>
            </div>
          </div>
        </div>
      )}

      {!showSplash && bootState === BootState.AUTH_REQUIRED && !judgeInitializing && !isInitializing && (
        <JudgeEntryModal onEnterJudgeMode={handleEnterJudgeMode} />
      )}

      {judgeInitializing && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[var(--color-accent-primary)]" size={32} />
          <p className="text-xs font-bold font-orbitron tracking-widest text-[var(--color-text-secondary)] uppercase">
            INITIALIZING JUDGE ENVIRONMENT...
          </p>
        </div>
      )}

      {!showSplash && (bootState === BootState.DISPLAY_NAME_REQUIRED || bootState === BootState.ONBOARDING_REQUIRED) && !isInitializing && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          initialStep={bootState === BootState.ONBOARDING_REQUIRED ? 2 : 1} 
        />
      )}
      
      {!showSplash && bootState === BootState.READY && !isInitializing && children}
    </>
  );
}
