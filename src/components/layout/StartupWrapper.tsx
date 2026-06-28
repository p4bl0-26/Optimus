'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StartupAnimation from './StartupAnimation';
import { useSplash } from '@/contexts/SplashContext';
import { JudgeEntryModal } from '@/components/auth/JudgeEntryModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { startJudgeSession, resetJudgeData } from '@/lib/demo/judgeSession';
import { supabase } from '@/lib/db/supabase';
import { Loader2 } from 'lucide-react';

enum BootState {
  LOADING,
  AUTH_REQUIRED,
  DISPLAY_NAME_REQUIRED,
  ONBOARDING_REQUIRED,
  READY
}

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showSplash, setShowSplash } = useSplash();
  const [bootState, setBootState] = useState<BootState>(BootState.LOADING);
  const initialized = useRef(false);

  // Failsafe logger for boot transitions
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[BOOT]", BootState[bootState]);
    }
  }, [bootState]);

  const bootstrap = async () => {
    if (typeof window === 'undefined') return;

    // Check Judge Mode instantly
    const hasJudge = !!localStorage.getItem("optimus_judge");
    const isJudgeUrl = new URLSearchParams(window.location.search).get("mode") === "judge";
    
    if (hasJudge || isJudgeUrl) {
      if (isJudgeUrl) {
        startJudgeSession('url');
      }
      console.log("[JUDGE] START");
      setBootState(BootState.READY);
      return;
    }

    // Check real session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setBootState(BootState.AUTH_REQUIRED);
      return;
    }

    // If authenticated, check Onboarding
    const metadata = session.user.user_metadata;
    if (metadata?.optimus_onboarding_complete) {
      setBootState(BootState.READY);
      return;
    }

    // Determine onboarding step
    if (metadata?.optimus_display_name) {
      setBootState(BootState.ONBOARDING_REQUIRED);
    } else {
      setBootState(BootState.DISPLAY_NAME_REQUIRED);
    }
  };

  useEffect(() => {
    if (!showSplash && !initialized.current) {
      initialized.current = true;
      bootstrap();
    }
  }, [showSplash]);

  useEffect(() => {
    // Only subscribe to detect actual auth state changes after initial load
    // We do NOT call bootstrap() here blindly to avoid loops.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If user logs in while waiting on AUTH_REQUIRED
      if (session && bootState === BootState.AUTH_REQUIRED) {
        bootstrap(); // re-evaluate the state now that we have a session
      }
      // If user signs out while READY
      if (!session && bootState === BootState.READY) {
        setBootState(BootState.AUTH_REQUIRED);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [bootState]);

  const handleCompleteSplash = () => {
    setShowSplash(false);
  };

  const [judgeInitializing, setJudgeInitializing] = useState(false);

  const handleEnterJudgeMode = async () => {
    setJudgeInitializing(true);
    console.log("[JUDGE] START");

    const timeout = new Promise(resolve => setTimeout(resolve, 2000));
    await Promise.race([resetJudgeData(), timeout]);
    
    console.log("[JUDGE] DATA SEEDED");
    localStorage.setItem("optimus_judge", "true");
    setBootState(BootState.READY);
    setJudgeInitializing(false);

    // Let DemoTour know it should start automatically
    setTimeout(() => {
      window.dispatchEvent(new Event('start-judge-tour'));
    }, 500);
  };

  const handleOnboardingComplete = () => {
    // Force transition to READY.
    // Ensure we don't trigger window.location.reload()
    setBootState(BootState.READY);
    router.replace('/');
  };

  return (
    <>
      {showSplash && <StartupAnimation onComplete={handleCompleteSplash} />}
      
      {!showSplash && bootState === BootState.LOADING && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[var(--color-accent-primary)]" size={32} />
          <p className="text-xs font-bold font-orbitron tracking-widest text-[var(--color-text-secondary)] uppercase">
            AUTHENTICATING OPERATOR...
          </p>
        </div>
      )}
      
      {!showSplash && bootState === BootState.AUTH_REQUIRED && !judgeInitializing && (
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

      {!showSplash && (bootState === BootState.DISPLAY_NAME_REQUIRED || bootState === BootState.ONBOARDING_REQUIRED) && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          initialStep={bootState === BootState.ONBOARDING_REQUIRED ? 2 : 1} 
        />
      )}
      
      {!showSplash && bootState === BootState.READY && children}
    </>
  );
}
