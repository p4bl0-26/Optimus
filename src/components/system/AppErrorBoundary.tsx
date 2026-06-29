'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/lib/db/supabase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleResetSession = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  private handleReturnToCommandCenter = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4">
          <div className="intel-card max-w-lg w-full p-8 border border-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)]/20 shadow-[0_0_50px_rgba(255,68,68,0.1)] text-center">
            <h1 className="text-3xl font-bold font-orbitron text-[var(--color-risk-critical)] tracking-widest uppercase mb-4">
              SYSTEM FAILURE
            </h1>
            <p className="text-sm font-mono text-[var(--color-text-primary)] mb-2 uppercase tracking-wide">
              React render pipeline interrupted.
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-8 font-mono">
              {this.state.error?.message || "An unexpected system error occurred."}
            </p>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={this.handleReturnToCommandCenter}
                className="w-full px-6 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors text-xs font-bold uppercase tracking-widest"
              >
                [ RETURN TO COMMAND CENTER ]
              </button>
              
              <button
                onClick={this.handleResetSession}
                className="w-full px-6 py-3 bg-[var(--color-risk-critical)] text-[var(--color-bg-primary)] hover:bg-[var(--color-risk-critical)]/90 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                [ RESET SESSION ]
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
