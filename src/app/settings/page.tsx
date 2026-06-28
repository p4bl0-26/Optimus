import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { Settings, Link2, Bell, Palette, User, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/db/supabase'
import { getActiveUserId } from '@/lib/auth'

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
    <div className="intel-card p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-elevated)]">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-border)]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={15} strokeWidth={1.5} style={{ color }} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">{title}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SettingsRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{label}</span>
      {value && (
        <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] uppercase">{value}</span>
      )}
      {children}
    </div>
  )
}

export default async function SettingsPage() {
  const userId = await getActiveUserId()
  let profile = { displayName: 'Operator', email: 'Unknown', timezone: 'UTC', language: 'English' }
  let dbIntegrations: any[] = []

  if (userId) {
    // 1. Fetch user metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } }))
    
    // Fallback to active session if admin fails (which it might in client mode, but this is a server component)
    // Actually, `supabase.auth.getSession()` is safer for the active user.
    const { data: { session } } = await supabase.auth.getSession()
    const activeUser = session?.user

    if (activeUser) {
      const metadata = activeUser.user_metadata
      const fullName = metadata?.full_name || metadata?.name || ''
      profile.displayName = metadata?.optimus_display_name || fullName.split(' ')[0] || 'Operator'
      profile.email = activeUser.email || 'abc@gmail.com'
      profile.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
      profile.language = 'English'
    }

    // 2. Fetch Integrations
    const { data: intData } = await supabase
      .from('integrations')
      .select('provider')
      .eq('user_id', userId)

    dbIntegrations = intData || []
  }

  const isConnected = (provider: string) => dbIntegrations.some(i => i.provider === provider)

  const providers = [
    { id: 'gmail', name: 'GMAIL', comingSoon: false },
    { id: 'calendar', name: 'GOOGLE CALENDAR', comingSoon: false },
    { id: 'classroom', name: 'GOOGLE CLASSROOM', comingSoon: false },
    { id: 'whatsapp', name: 'WHATSAPP', comingSoon: true }
  ]

  return (
    <PageContainer id="settings-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          System Settings
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
          Manage your OPTIMUS preferences and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Profile */}
          <SettingsSection
            icon={User}
            title="Identity Profile"
            description="Your identity and personal parameters"
            color="var(--color-accent-secondary)"
          >
            <div className="space-y-1">
              <SettingsRow label="Display Name" value={profile.displayName} />
              <SettingsRow label="Email Address" value={profile.email} />
              <SettingsRow label="Timezone" value={profile.timezone} />
              <SettingsRow label="Language" value={profile.language} />
            </div>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Visual engine preferences"
            color="var(--color-accent-primary)"
          >
            <div className="space-y-1">
              <SettingsRow label="Theme" value="OPTIMUS Dark (Default)" />
              <SettingsRow label="Sidebar default state" value="Expanded" />
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          {/* Integrations */}
          <SettingsSection
            icon={Link2}
            title="Intelligence Sources"
            description="Active data pipelines"
            color="var(--color-risk-monitor)"
          >
            <div className="space-y-2">
              {providers.map(p => {
                const connected = isConnected(p.id)
                return (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[var(--color-border-subtle)] last:border-0 gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[12px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.comingSoon ? (
                            <span className="text-[9px] font-bold tracking-widest uppercase bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">COMING SOON</span>
                          ) : connected ? (
                            <>
                              <CheckCircle2 size={10} className="text-[var(--color-accent-primary)]" />
                              <span className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-accent-primary)]">CONNECTED</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={10} className="text-[var(--color-risk-critical)]" />
                              <span className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-risk-critical)]">NOT CONNECTED</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!p.comingSoon && (
                      <div>
                        {connected ? (
                          <a 
                            href={`/api/integrations/${p.id}/disconnect`}
                            className="inline-flex h-8 items-center justify-center px-4 rounded-md border border-[var(--color-risk-critical)]/30 text-[9px] font-bold tracking-widest text-[var(--color-risk-critical)] uppercase hover:bg-[var(--color-risk-critical)] hover:text-[var(--color-text-inverse)] transition-colors"
                          >
                            DISCONNECT
                          </a>
                        ) : (
                          <a 
                            href={`/api/integrations/${p.id}/connect`}
                            className="inline-flex h-8 items-center justify-center px-4 rounded-md bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 text-[9px] font-bold tracking-widest text-[var(--color-accent-primary)] uppercase hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-text-inverse)] transition-colors"
                          >
                            CONNECT
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={Bell}
            title="Notification Engine"
            description="Intervention and alert parameters"
            color="var(--color-risk-critical)"
          >
            <div className="space-y-1">
              <SettingsRow label="Critical Risk Alerts" value="Active" />
              <SettingsRow label="Morning Briefing" value="08:00 Local" />
              <SettingsRow label="Evening Briefing" value="20:00 Local" />
            </div>
          </SettingsSection>
        </div>
      </div>
    </PageContainer>
  )
}
