'use client';

import StartupAnimation from './StartupAnimation';
import { useSplash } from '@/contexts/SplashContext';

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const { showSplash, setShowSplash } = useSplash();

  const handleComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <StartupAnimation onComplete={handleComplete} />}
      {children}
    </>
  );
}
