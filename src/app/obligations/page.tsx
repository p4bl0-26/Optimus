import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Target, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { fetchObligationsAction } from '@/app/actions/optimus'

export const metadata: Metadata = {
  title: 'Obligations',
  description: 'All tracked commitments and deadlines',
}

export default async function ObligationsPage() {
  const obligations = await fetchObligationsAction()

  return (
    <PageContainer id="obligations-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-lg font-bold text-[var(--color-text-primary)] mb-0.5"
            style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
          >
            Obligations
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            All tracked commitments, deadlines, and work items
          </p>
        </div>

        {/* Add Obligation CTA — placeholder */}
        <button
          id="add-obligation-btn"
          className="flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold
            bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
            hover:opacity-90 transition-opacity duration-150 cursor-not-allowed opacity-60"
          title="Add Obligation"
        >
          <Plus size={14} strokeWidth={2} />
          Add Obligation
        </button>
      </div>

      {/* Filter tabs — placeholder */}
      <SectionContainer spacing="md">
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'High Risk', 'Due Today', 'This Week'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150
                ${tab === 'All'
                  ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </SectionContainer>

      {/* Obligations List */}
      <div className="space-y-3 mt-4">
        {obligations.length === 0 ? (
          <div className="intel-card flex flex-col items-center justify-center p-16 text-center mt-2">
            <div
              className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
              style={{ background: 'var(--color-accent-glow)', border: '1px solid rgba(0,245,102,0.2)' }}
            >
              <Target size={24} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
              No Obligations Tracked
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)] max-w-[280px] leading-relaxed">
              Connect your Gmail, Calendar, or manually add obligations. OPTIMUS will
              discover, analyze, and monitor them automatically.
            </p>
            <div
              className="mt-6 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider
                border border-[var(--color-border)] text-[var(--color-text-muted)]"
            >
              Integrations available in future phases
            </div>
          </div>
        ) : (
          obligations.map((ob) => (
            <Link key={ob.id} href={`/obligations/${ob.id}`} className="block">
              <div className="intel-card p-4 hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between group cursor-pointer">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{ob.title}</h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{ob.description || 'No description provided'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Priority</p>
                    <p className="text-xs font-semibold mt-0.5 uppercase" style={{
                      color: ob.priority === 'critical' ? 'var(--color-risk-critical)' : 
                             ob.priority === 'high' ? 'var(--color-risk-high)' : 
                             ob.priority === 'medium' ? 'var(--color-risk-monitor)' : 'var(--color-risk-safe)'
                    }}>{ob.priority}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageContainer>
  )
}
