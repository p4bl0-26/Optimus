'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SplashContextType {
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  hasSeenSplash: boolean;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash screen in this session
    const hasSeen = sessionStorage.getItem('optimus_startup_seen');
    if (hasSeen === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSplash(false);
      setHasSeenSplash(true);
    }
  }, []);

  useEffect(() => {
    if (!showSplash && !hasSeenSplash) {
      sessionStorage.setItem('optimus_startup_seen', 'true');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSeenSplash(true);
    }
  }, [showSplash, hasSeenSplash]);

  return (
    <SplashContext.Provider value={{ showSplash, setShowSplash, hasSeenSplash }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
