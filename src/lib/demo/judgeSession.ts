export const JUDGE_KEY = 'optimus_judge_mode';

export function startJudgeSession(mode: "manual" | "url") {
  if (typeof window !== 'undefined') {
    localStorage.setItem(JUDGE_KEY, 'true');
    document.cookie = `${JUDGE_KEY}=true; path=/`;
    window.dispatchEvent(new Event('judge-mode-changed'));
  }
}

export function isJudgeMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(JUDGE_KEY) === 'true';
}

export function exitJudgeSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JUDGE_KEY);
    document.cookie = `${JUDGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.dispatchEvent(new Event('judge-mode-changed'));
    window.location.href = '/';
  }
}

export function lockEditing(e?: any): boolean {
  if (isJudgeMode()) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.warn("Action blocked: System is in Read-Only Judge Mode.");
    return true;
  }
  return false;
}

export async function resetJudgeData() {
  try {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    return true;
  } catch (error) {
    console.error('Failed to reset judge data:', error);
    return false;
  }
}
