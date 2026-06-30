'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { Share2, Zap, CheckCircle2, XCircle, Link2, MessageCircle, Users } from 'lucide-react'
import { useSimulationEngine } from '@/hooks/useSimulationEngine'
import { runDiscoveryAction, runClassroomDiscoveryAction, runCalendarDiscoveryAction } from '@/app/actions/discovery'
import { useState } from 'react'

export default function SocialsPage() {
  const { isGmailConnected, gmailAccountEmail, isClassroomConnected, isCalendarConnected } = useSimulationEngine()
  
  const handleSweep = async (e: React.MouseEvent<HTMLButtonElement>, action: () => Promise<any>, scanningText: string, cleanText: string) => {
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = scanningText;
    btn.disabled = true;
    const res = await action();
    if (res.success) {
      const count = res.newObligations ?? 0;
      btn.innerHTML = count > 0 ? `Found ${count} New` : cleanText;
    } else {
      btn.innerHTML = 'Error!';
    }
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }

  return (
    <PageContainer id="socials-page">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 uppercase tracking-widest flex items-center gap-2"
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          <Share2 size={24} className="text-[var(--color-accent-primary)]" />
          Socials & Integrations
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
          Manage your connected platforms and communication channels
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Active Integrations */}
        <div className="intel-card p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-elevated)]">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-border)]">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `var(--color-accent-primary)15`, border: `1px solid var(--color-accent-primary)30` }}
            >
              <Link2 size={15} strokeWidth={1.5} className="text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Active Data Pipelines</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Connect platforms and manually trigger discovery sweeps</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gmail */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--color-border-subtle)] gap-4">
              <div>
                <p className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-2">
                  Gmail Inbox
                  {isGmailConnected && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-risk-safe-bg)] text-[var(--color-risk-safe)] border border-[var(--color-risk-safe)]">CONNECTED</span>}
                </p>
                {gmailAccountEmail && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{gmailAccountEmail}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!isGmailConnected ? (
                  <a href="/api/integrations/gmail/connect" className="px-4 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors inline-block text-center font-bold tracking-wider uppercase">
                    Connect
                  </a>
                ) : (
                  <button 
                    onClick={(e) => handleSweep(e, runDiscoveryAction, 'Scanning Inbox...', 'Inbox Clean')}
                    className="px-4 py-2 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase tracking-wider"
                  >
                    <Zap size={14} /> Run Sweep
                  </button>
                )}
              </div>
            </div>

            {/* Google Classroom */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--color-border-subtle)] gap-4">
              <div>
                <p className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-2">
                  Google Classroom
                  {isClassroomConnected && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-risk-safe-bg)] text-[var(--color-risk-safe)] border border-[var(--color-risk-safe)]">CONNECTED</span>}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Academic assignments and deadlines</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!isClassroomConnected ? (
                  <a href="/api/integrations/classroom/connect" className="px-4 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors inline-block text-center font-bold tracking-wider uppercase">
                    Connect
                  </a>
                ) : (
                  <button 
                    onClick={(e) => handleSweep(e, runClassroomDiscoveryAction, 'Scanning Courses...', 'Courses Clean')}
                    className="px-4 py-2 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase tracking-wider"
                  >
                    <Zap size={14} /> Run Sweep
                  </button>
                )}
              </div>
            </div>

            {/* Google Calendar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--color-border-subtle)] gap-4">
              <div>
                <p className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-2">
                  Google Calendar
                  {isCalendarConnected && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-risk-safe-bg)] text-[var(--color-risk-safe)] border border-[var(--color-risk-safe)]">CONNECTED</span>}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Events and scheduling conflicts</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!isCalendarConnected ? (
                  <a href="/api/integrations/calendar/connect" className="px-4 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors inline-block text-center font-bold tracking-wider uppercase">
                    Connect
                  </a>
                ) : (
                  <button 
                    onClick={(e) => handleSweep(e, runCalendarDiscoveryAction, 'Scanning Calendar...', 'Calendar Clean')}
                    className="px-4 py-2 rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-xs font-bold hover:bg-[var(--color-accent-secondary)] transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase tracking-wider"
                  >
                    <Zap size={14} /> Run Sweep
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="intel-card p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-elevated)] opacity-70">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-border)]">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `var(--color-risk-monitor)15`, border: `1px solid var(--color-risk-monitor)30` }}
            >
              <MessageCircle size={15} strokeWidth={1.5} className="text-[var(--color-risk-monitor)]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Upcoming Channels</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Integrations currently in development</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between py-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/30">
                  <MessageCircle size={18} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">WhatsApp</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Automated chat discovery & response</p>
                </div>
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase bg-[var(--color-bg-surface)] px-2 py-1 rounded text-[var(--color-text-muted)] border border-[var(--color-border)]">COMING SOON</span>
            </div>

            {/* Microsoft Teams */}
            <div className="flex items-center justify-between py-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#6264A7]/10 flex items-center justify-center border border-[#6264A7]/30">
                  <Users size={18} className="text-[#6264A7]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Microsoft Teams</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Enterprise collaboration sync</p>
                </div>
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase bg-[var(--color-bg-surface)] px-2 py-1 rounded text-[var(--color-text-muted)] border border-[var(--color-border)]">COMING SOON</span>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  )
}
