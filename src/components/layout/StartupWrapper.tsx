'use client';

import { useState, useEffect } from 'react';
import StartupAnimation from './StartupAnimation';

export function StartupWrapper({ children }: { children: React.ReactNode }) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Animation will now run on every page load as requested
    setShowAnimation(true);
  }, []);

  const handleComplete = () => {
    setShowAnimation(false);
    sessionStorage.setItem('optimus_startup_seen', 'true');
  };

  return (
    <>
      {showAnimation && <StartupAnimation onComplete={handleComplete} />}
      {children}
    </>
  );
}
