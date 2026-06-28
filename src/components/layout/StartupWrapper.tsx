'use client';

import StartupAnimation from './StartupAnimation';
import { useSplash } from '@/contexts/SplashContext';
import { JudgeEntryModal } from '@/components/auth/JudgeEntryModal';
import { useState, useEffect } from 'react';
import { startJudgeSession, isJudgeMode, resetJudgeData } from '@/lib/demo/judgeSession';

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const { showSplash, setShowSplash } = useSplash();
  const [showAuthGate, setShowAuthGate] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'judge') {
        startJudgeSession('url');
        const t = setTimeout(() => setShowAuthGate(false), 0);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const handleCompleteSplash = () => {
    setShowSplash(false);
    
    // Auth Gate logic
    if (typeof window !== 'undefined') {
      const hasAuth = !!localStorage.getItem("optimus_auth");
      const hasJudge = !!localStorage.getItem("optimus_judge");
      const isJudgeUrl = new URLSearchParams(window.location.search).get("mode") === "judge";
      
      if (!hasAuth && !hasJudge && !isJudgeUrl) {
        setShowAuthGate(true);
      }
    }
  };

  const handleLogin = () => {
    localStorage.setItem("optimus_auth", "true");
    setShowAuthGate(false);
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
      {!showSplash && showAuthGate && (
        <JudgeEntryModal onLogin={handleLogin} onEnterJudgeMode={handleEnterJudgeMode} />
      )}
      {!showSplash && !showAuthGate && children}
    </>
  );
}
