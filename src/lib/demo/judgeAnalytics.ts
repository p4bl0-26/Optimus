'use client';

const ANALYTICS_KEY = 'optimus_judge_analytics';

interface JudgeAnalytics {
  tourStartedAt: string | null;
  stepsViewed: Record<string, number>;
  featuresSkipped: string[];
  tourCompletedAt: string | null;
  architectureViews: number;
  autoPlayUsed: boolean;
  exitReason: string | null;
}

function getAnalytics(): JudgeAnalytics {
  if (typeof window === 'undefined') return defaultAnalytics();
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return defaultAnalytics();
}

function saveAnalytics(data: JudgeAnalytics) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

function defaultAnalytics(): JudgeAnalytics {
  return {
    tourStartedAt: null,
    stepsViewed: {},
    featuresSkipped: [],
    tourCompletedAt: null,
    architectureViews: 0,
    autoPlayUsed: false,
    exitReason: null,
  };
}

export function recordTourStart() {
  const data = getAnalytics();
  if (!data.tourStartedAt) {
    data.tourStartedAt = new Date().toISOString();
  }
  saveAnalytics(data);
}

export function recordStepView(stepId: string, timeSpentSeconds: number) {
  const data = getAnalytics();
  data.stepsViewed[stepId] = (data.stepsViewed[stepId] || 0) + timeSpentSeconds;
  saveAnalytics(data);
}

export function recordFeatureSkipped(stepId: string) {
  const data = getAnalytics();
  if (!data.featuresSkipped.includes(stepId)) {
    data.featuresSkipped.push(stepId);
  }
  saveAnalytics(data);
}

export function recordTourCompletion() {
  const data = getAnalytics();
  data.tourCompletedAt = new Date().toISOString();
  saveAnalytics(data);
}

export function recordArchitectureView() {
  const data = getAnalytics();
  data.architectureViews++;
  saveAnalytics(data);
}

export function recordAutoPlayUsage() {
  const data = getAnalytics();
  data.autoPlayUsed = true;
  saveAnalytics(data);
}

export function recordJudgeExitReason(reason: string) {
  const data = getAnalytics();
  data.exitReason = reason;
  saveAnalytics(data);
}
