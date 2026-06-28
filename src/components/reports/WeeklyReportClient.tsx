'use client'

import { WeeklyExecutiveReport } from '@/types'
import { Printer, TrendingDown, TrendingUp, AlertTriangle, Target, Brain, BrainCircuit, Activity } from 'lucide-react'

interface WeeklyReportClientProps {
  report: WeeklyExecutiveReport
}

export function WeeklyReportClient({ report }: WeeklyReportClientProps) {
  
  // Trend Visualization
  const renderTrendChart = () => {
    const points = report.trendData.map((d, i) => {
      const x = i * (100 / 6) // spread across 100% width
      const y = 100 - d.risk // invert risk for SVG y-axis
      return `${x},${y}`
    }).join(' ')

    const isImproving = report.riskReduction > 0
    const strokeColor = isImproving ? 'var(--color-risk-safe)' : 'var(--color-risk-critical)'

    return (
      <div className="w-full h-32 relative mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2" />
          ))}
          {/* Trend Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Data Points HTML Overlay */}
        {report.trendData.map((d, i) => {
          const x = i * (100 / 6)
          const y = 100 - d.risk
          return (
            <div 
              key={i}
              className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 bg-[var(--color-bg-primary)] group z-10 hover:scale-125 transition-transform cursor-pointer"
              style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                borderColor: strokeColor 
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                {d.risk} Risk
              </div>
            </div>
          )
        })}

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-muted)] font-mono uppercase">
          {report.trendData.map(d => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .intel-card {
            border: 1px solid #ccc !important;
            background: white !important;
            page-break-inside: avoid;
            break-inside: avoid;
            box-shadow: none !important;
            margin-bottom: 20px;
          }
          [class*="md:grid-cols-4"] {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          [class*="md:grid-cols-2"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          * {
            color: black !important;
            border-color: #ccc !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}} />

      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-orbitron uppercase tracking-widest">EXECUTIVE REPORT</h1>
            <p className="text-sm text-[var(--color-text-muted)] font-mono">{report.weekLabel}</p>
          </div>
          <button 
            onClick={handlePrint}
            className="print-hide flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-all uppercase text-xs font-bold tracking-wider"
          >
            <Printer size={14} /> EXPORT PDF
          </button>
        </div>

        <div id="printable-report" className="space-y-8">
          
          {/* Executive Summary */}
          <section className="intel-card p-6">
            <h2 className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity size={12} /> EXECUTIVE SUMMARY
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded">
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Completed</p>
                <p className="text-xl font-bold font-orbitron text-[var(--color-risk-safe)]">{report.completedCount} <span className="text-[10px] text-[var(--color-text-muted)]">obs</span></p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Missed</p>
                <p className="text-xl font-bold font-orbitron text-[var(--color-risk-critical)]">{report.missedCount} <span className="text-[10px] text-[var(--color-text-muted)]">obs</span></p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Productivity Score</p>
                <p className="text-xl font-bold font-orbitron text-[var(--color-accent-primary)]">{report.productivityScore}%</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Highest Risk Area</p>
                <p className="text-xl font-bold font-orbitron text-[var(--color-risk-high)]">{report.highestRiskCategory}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {report.executiveSummary}
            </p>
          </section>

          {/* Productivity Metrics & Risk Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="intel-card p-6">
              <h2 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Target size={12} /> RISK EXPOSURE
              </h2>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-3xl font-bold font-orbitron text-[var(--color-text-primary)]">
                  {report.trendData.length > 0 ? report.trendData[0].risk : '--'} <span className="text-[var(--color-text-muted)]">→</span> {report.trendData.length > 0 ? report.trendData[report.trendData.length - 1].risk : '--'}
                </p>
                {report.riskReduction > 0 ? (
                  <div className="flex items-center gap-1 text-[var(--color-risk-safe)] bg-[var(--color-risk-safe-bg)] px-2 py-1 rounded text-xs font-bold">
                    <TrendingDown size={14} /> {-report.riskReduction}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)] px-2 py-1 rounded text-xs font-bold">
                    <TrendingUp size={14} /> +{-report.riskReduction}
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">Weekly risk progression</p>
              
              {/* SVG Trend Chart */}
              {renderTrendChart()}
            </section>

            {/* Chief Assessment */}
            <section className="intel-card p-6 border-l-4 border-l-[var(--color-accent-primary)]">
              <h2 className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Brain size={12} /> CHIEF ASSESSMENT
              </h2>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-text-primary)] mb-4 whitespace-pre-line">
                {report.chiefAssessment.summary}
              </p>
              
              <div className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded mb-4">
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Recommendation</p>
                <p className="text-sm text-[var(--color-text-primary)] font-bold">{report.chiefAssessment.recommendation}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-4">
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Overall Grade</p>
                  <p className="text-xl font-bold font-orbitron text-[var(--color-accent-primary)]">{report.chiefAssessment.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Confidence</p>
                  <p className="text-xl font-bold font-orbitron text-[var(--color-text-primary)]">{report.chiefAssessment.confidence}%</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Memory Insights */}
            <section className="intel-card p-6">
              <h2 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <BrainCircuit size={12} /> HISTORICAL PATTERNS
              </h2>
              <ul className="space-y-4">
                {report.memoryInsights.map((insight, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-[var(--color-text-primary)] leading-relaxed">
                    <span className="text-[var(--color-accent-primary)]">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </section>

            {/* Strategic Recommendations */}
            <section className="intel-card p-6">
              <h2 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Target size={12} /> STRATEGIC RECOMMENDATIONS
              </h2>
              <div className="space-y-6">
                {report.strategicRecommendations.map((rec, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">Priority {idx + 1}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono">Conf: {rec.confidence}%</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1 leading-snug">{rec.recommendation}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Reason: {rec.reason}</p>
                  </div>
                ))}
                {report.strategicRecommendations.length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)] italic">No strategic recommendations available at this time.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
