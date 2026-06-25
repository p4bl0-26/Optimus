import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Settings, Link2, Bell, Palette, User } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your OPTIMUS preferences and integrations',
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  color = 'var(--color-accent-primary)',
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <div className="intel-card p-5">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-border)]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={15} strokeWidth={1.5} style={{ color }} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[var(--color-text-primary)]">{title}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SettingsRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-[12px] text-[var(--color-text-secondary)]">{label}</span>
      {value ? (
        <span className="text-[11px] text-[var(--color-text-muted)]">{value}</span>
      ) : (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          Phase 2
        </span>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <PageContainer id="settings-page">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-lg font-bold text-[var(--color-text-primary)] mb-0.5"
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          Settings
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Manage your OPTIMUS preferences and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appearance */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Theme and display preferences"
          color="var(--color-accent-primary)"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[12px] font-medium text-[var(--color-text-primary)]">Theme</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Dark or light command center</p>
              </div>
              <ThemeToggle />
            </div>
            <SettingsRow label="Sidebar default state" value="Expanded" />
            <SettingsRow label="Compact mode" />
            <SettingsRow label="Matrix background" value="Subtle (default)" />
          </div>
        </SettingsSection>

        {/* Profile */}
        <SettingsSection
          icon={User}
          title="Profile"
          description="Your identity and preferences"
          color="var(--color-accent-secondary)"
        >
          <div className="space-y-0">
            <SettingsRow label="Display name" />
            <SettingsRow label="Email" />
            <SettingsRow label="Timezone" />
            <SettingsRow label="Language" value="English" />
          </div>
        </SettingsSection>

        {/* Integrations */}
        <SettingsSection
          icon={Link2}
          title="Integrations"
          description="Connect your sources to OPTIMUS"
          color="var(--color-risk-monitor)"
        >
          {['Gmail', 'Google Calendar', 'Google Classroom', 'WhatsApp'].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-0"
            >
              <span className="text-[12px] text-[var(--color-text-secondary)]">{name}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Phase 2
              </span>
            </div>
          ))}
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Intervention and alert settings"
          color="var(--color-risk-critical)"
        >
          <div className="space-y-0">
            <SettingsRow label="Morning briefing" />
            <SettingsRow label="Evening briefing" />
            <SettingsRow label="Critical risk alerts" />
            <SettingsRow label="WhatsApp escalation" />
            <SettingsRow label="Risk threshold (critical)" value="86%" />
          </div>
        </SettingsSection>
      </div>

      {/* Version badge */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
        <Settings size={12} strokeWidth={1.5} />
        <span>OPTIMUS Phase 1 Foundation — Build v0.1.0</span>
      </div>
    </PageContainer>
  )
}
