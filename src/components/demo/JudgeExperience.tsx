'use client';

import { useState, useEffect } from 'react';
import { DemoTour } from './DemoTour';
import { JudgeQuickActions } from './JudgeQuickActions';
import { ArchitectureOverlay } from './ArchitectureOverlay';
import { TourEndScreen } from './TourEndScreen';
import { isJudgeMode } from '@/lib/demo/judgeSession';

export function JudgeExperience() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isJudgeActive, setIsJudgeActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsJudgeActive(isJudgeMode()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleStartTour = () => {
      setIsJudgeActive(true);
      setIsTourOpen(true);
      setIsArchOpen(false);
      setIsEndOpen(false);
    };

    const handleModeChange = () => {
      setIsJudgeActive(isJudgeMode());
    };

    window.addEventListener('start-judge-tour', handleStartTour);
    window.addEventListener('judge-mode-changed', handleModeChange);

    return () => {
      window.removeEventListener('start-judge-tour', handleStartTour);
      window.removeEventListener('judge-mode-changed', handleModeChange);
    };
  }, []);

  if (!isJudgeActive) return null;

  return (
    <>
      <DemoTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenArchitecture={() => {
          setIsTourOpen(false);
          setIsArchOpen(true);
        }}
        onTourComplete={() => {
          setIsTourOpen(false);
          setIsEndOpen(true);
        }}
      />

      <ArchitectureOverlay
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />

      <TourEndScreen
        isOpen={isEndOpen}
        onExploreFreely={() => setIsEndOpen(false)}
        onRestartDemo={() => {
          setIsEndOpen(false);
          setIsTourOpen(true);
        }}
        onViewArchitecture={() => {
          setIsEndOpen(false);
          setIsArchOpen(true);
        }}
      />

      {/* Show Quick Actions if any part of the Judge Experience is active (except End Screen where buttons already exist, or show always) */}
      <JudgeQuickActions
        onRestartTour={() => {
          setIsArchOpen(false);
          setIsEndOpen(false);
          setIsTourOpen(true);
        }}
        onSkipToFeature={(idx) => {
          setIsArchOpen(false);
          setIsEndOpen(false);
          setIsTourOpen(true);
          // To truly support skipping to feature, DemoTour would need an exported ref or a context. 
          // For now, restarting tour is sufficient, or we need to pass a step override event.
          window.dispatchEvent(new CustomEvent('judge-skip-to', { detail: { step: idx } }));
        }}
        onViewArchitecture={() => {
          setIsTourOpen(false);
          setIsEndOpen(false);
          setIsArchOpen(true);
        }}
      />
    </>
  );
}
