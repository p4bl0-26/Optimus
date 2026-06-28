'use client';

// ============================================================
// OPTIMUS — Responsibility Matrix (v2)
// Core Innovation Hero Section
// Source-based clustering • Animated data-flow lines
// Critical path ON by default • Auto-centered
// NO ReactFlow — pure Framer Motion + SVG
// ============================================================

import { useState, useMemo, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Link2, Crosshair, Layers, RotateCcw, Mail, BookOpen, Calendar, AlertTriangle, Zap,
} from 'lucide-react';
import { isJudgeMode } from '@/lib/demo/judgeSession';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface ObligationData {
  obligation_id: string;
  risk_band: string;
  risk_score?: number;
  obligation: { title: string; source?: string; type?: string } | null;
}

interface ResponsibilityMapProps {
  data: ObligationData[];
}

// ─── Source Cluster Definitions ──────────────────────────────
const SOURCE_CLUSTERS = {
  gmail: {
    label: 'Communication',
    sublabel: 'Gmail',
    color: '#4285F4',
    bgColor: '#4285F420',
    borderColor: '#4285F460',
    icon: Mail,
    orbitIndex: 0,
  },
  classroom: {
    label: 'Academic',
    sublabel: 'Classroom',
    color: '#9C27B0',
    bgColor: '#9C27B020',
    borderColor: '#9C27B060',
    icon: BookOpen,
    orbitIndex: 1,
  },
  calendar: {
    label: 'Scheduling',
    sublabel: 'Calendar',
    color: '#76C043',
    bgColor: '#76C04320',
    borderColor: '#76C04360',
    icon: Calendar,
    orbitIndex: 2,
  },
  escalation: {
    label: 'Escalations',
    sublabel: 'Manual',
    color: '#FF9800',
    bgColor: '#FF980020',
    borderColor: '#FF980060',
    icon: AlertTriangle,
    orbitIndex: 3,
  },
  critical: {
    label: 'Critical Risk',
    sublabel: 'Immediate',
    color: '#FF4444',
    bgColor: '#FF444420',
    borderColor: '#FF444460',
    icon: Zap,
    orbitIndex: 4,
  },
} as const;

type ClusterKey = keyof typeof SOURCE_CLUSTERS;

function getClusterKey(d: ObligationData): ClusterKey {
  if (d.risk_band === 'Critical') return 'critical';
  const src = (d.obligation?.source || '').toLowerCase();
  if (src.includes('gmail') || src.includes('email')) return 'gmail';
  if (src.includes('classroom') || src.includes('course') || src.includes('academic')) return 'classroom';
  if (src.includes('calendar') || src.includes('event') || src.includes('meeting')) return 'calendar';
  if (d.risk_band === 'High Risk') return 'escalation';
  // Distribute evenly by index if no source match
  return 'gmail';
}

// ─── Node positioning ────────────────────────────────────────
interface PositionedNode extends ObligationData {
  x: number;
  y: number;
  clusterKey: ClusterKey;
  nodeSize: number;
}

function computeNodePositions(data: ObligationData[], baseRadius: number): PositionedNode[] {
  // Group by cluster
  const clusters: Record<ClusterKey, ObligationData[]> = {
    gmail: [], classroom: [], calendar: [], escalation: [], critical: [],
  };
  data.slice(0, 14).forEach(d => {
    const k = getClusterKey(d);
    clusters[k].push(d);
  });

  const positions: PositionedNode[] = [];

  // For each cluster: place nodes in an arc around a cluster center
  const clusterKeys = Object.keys(clusters) as ClusterKey[];
  const clusterCount = clusterKeys.filter(k => clusters[k].length > 0).length || 1;
  let clusterIdx = 0;

  clusterKeys.forEach(clusterKey => {
    const clusterNodes = clusters[clusterKey];
    if (clusterNodes.length === 0) return;

    // Cluster center is evenly distributed around the main circle
    const clusterAngle = (clusterIdx / clusterCount) * 2 * Math.PI - Math.PI / 2;
    const clusterCenterX = Math.cos(clusterAngle) * baseRadius * 0.55;
    const clusterCenterY = Math.sin(clusterAngle) * baseRadius * 0.55;
    clusterIdx++;

    // Place each node in the cluster in a smaller arc around its center
    clusterNodes.forEach((d, i) => {
      const spreadRadius = clusterNodes.length > 1 ? baseRadius * 0.35 : 0;
      const nodeAngle = (i / clusterNodes.length) * 2 * Math.PI - Math.PI / 2;
      const isCritical = d.risk_band === 'Critical';
      const isHigh = d.risk_band === 'High Risk';

      positions.push({
        ...d,
        x: clusterCenterX + Math.cos(nodeAngle) * spreadRadius,
        y: clusterCenterY + Math.sin(nodeAngle) * spreadRadius,
        clusterKey,
        nodeSize: isCritical ? 56 : isHigh ? 48 : 40,
      });
    });
  });

  return positions;
}

// ─── Animated Connection Line ─────────────────────────────────
function FlowLine({
  x2, y2, color, isCritical, delay = 0,
}: {
  x2: number; y2: number; color: string; isCritical: boolean; delay?: number;
}) {
  const id = useId();
  const length = Math.sqrt(x2 * x2 + y2 * y2);

  return (
    <svg
      className="absolute overflow-visible pointer-events-none"
      style={{ left: 0, top: 0, width: 0, height: 0 }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.05" />
          <stop offset="50%" stopColor={color} stopOpacity={isCritical ? 0.5 : 0.25} />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Base line */}
      <motion.line
        x1="0" y1="0" x2={x2} y2={y2}
        stroke={`url(#grad-${id})`}
        strokeWidth={isCritical ? 2 : 1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay, ease: 'easeInOut' }}
      />

      {/* Animated dash pulse for data flow */}
      <motion.line
        x1="0" y1="0" x2={x2} y2={y2}
        stroke={color}
        strokeWidth={isCritical ? 1.5 : 1}
        strokeDasharray={`${length * 0.15} ${length * 0.85}`}
        strokeOpacity={isCritical ? 0.6 : 0.3}
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -length }}
        transition={{
          duration: isCritical ? 2.5 : 4,
          delay,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 0.5,
        }}
      />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────
export function ResponsibilityMap({ data }: ResponsibilityMapProps) {
  const judgeMode = isJudgeMode();
  const [showDependencies, setShowDependencies] = useState(true);
  const [highlightCritical, setHighlightCritical] = useState(true); // ON by default
  const [showClusters, setShowClusters] = useState(true);
  const [centerKey, setCenterKey] = useState(0); // Increment to re-trigger centering

  const hasCritical = data.some(n => n.risk_band === 'Critical' || n.risk_band === 'High Risk');
  const criticalCount = data.filter(n => n.risk_band === 'Critical').length;

  // Dynamic base radius from data count
  const baseRadius = useMemo(() => {
    const n = Math.min(data.length, 14);
    if (n <= 4) return 180;
    if (n <= 8) return 240;
    return 300;
  }, [data.length]);

  const nodes = useMemo(() => computeNodePositions(data, baseRadius), [data, baseRadius]);

  const shouldFade = (n: PositionedNode) =>
    highlightCritical && (n.risk_band !== 'Critical' && n.risk_band !== 'High Risk');

  const getNodeColor = (n: PositionedNode): string => {
    if (n.risk_band === 'Critical') return '#FF4444';
    if (n.risk_band === 'High Risk') return '#FF9800';
    return SOURCE_CLUSTERS[n.clusterKey]?.color || 'var(--color-text-primary)';
  };

  // Controls
  const btnBase = 'flex items-center gap-2 h-8 px-3 rounded-lg border text-[10px] font-bold tracking-widest uppercase transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const btnActive = 'bg-[var(--color-accent-primary)]/15 border-[var(--color-accent-primary)]/50 text-[var(--color-accent-primary)]';
  const btnInactive = 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)]';

  return (
    <div
      id="responsibilityMap"
      className="w-full mx-auto flex flex-col relative overflow-hidden rounded-2xl border border-[rgba(118,192,67,0.15)] shadow-2xl bg-[var(--color-bg-primary)]"
      style={{ minHeight: '900px', maxWidth: '1800px' }}
    >
      {/* ── Background matrix grid ───────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(118,192,67,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Subtle radial glow from center */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(118,192,67,0.04) 0%, transparent 70%)',
        }}
      />

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-8 pointer-events-none">
        {/* Title block */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2
              className="text-4xl font-bold tracking-widest uppercase text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
            >
              Responsibility Matrix
            </h2>
            <span className="px-3 py-1.5 rounded-lg border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary)]/10 text-[10px] font-bold tracking-widest text-[var(--color-accent-primary)] uppercase shadow-[0_0_20px_rgba(118,192,67,0.15)]">
              CORE INNOVATION
            </span>
            {hasCritical && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF4444]/40 bg-[#FF4444]/10 text-[10px] font-bold tracking-widest text-[#FF4444] uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4444]" />
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] tracking-[0.15em] uppercase opacity-70">
            Unified Obligation Graph — The Core Intelligence Layer
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
          <button
            onClick={() => setCenterKey(k => k + 1)}
            className={cn(btnBase, btnInactive)}
            title="Center Graph"
            disabled={judgeMode}
          >
            <RotateCcw size={12} />
            CENTER
          </button>
          <button
            onClick={() => !judgeMode && setShowDependencies(s => !s)}
            className={cn(btnBase, showDependencies ? btnActive : btnInactive)}
            title="Show connection lines"
            disabled={judgeMode}
          >
            <Link2 size={12} />
            DEPENDENCIES
          </button>
          <button
            onClick={() => !judgeMode && setHighlightCritical(s => !s)}
            className={cn(
              btnBase,
              highlightCritical
                ? 'bg-[#FF4444]/15 border-[#FF4444]/50 text-[#FF4444]'
                : btnInactive
            )}
            title="Highlight critical path"
            disabled={judgeMode || !hasCritical}
          >
            <Crosshair size={12} />
            CRITICAL PATH
          </button>
          <button
            onClick={() => !judgeMode && setShowClusters(s => !s)}
            className={cn(btnBase, showClusters ? btnActive : btnInactive)}
            title="Show source clusters"
            disabled={judgeMode}
          >
            <Layers size={12} />
            CLUSTERS
          </button>
        </div>
      </div>

      {/* ── Main Graph Canvas ────────────────────────────────── */}
      <div
        key={centerKey}
        className="flex-1 flex items-center justify-center relative z-10"
        style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '700px' }}
      >
        <div className="relative" style={{ width: '100%', maxWidth: `${baseRadius * 2 + 400}px`, height: `${baseRadius * 2 + 200}px`, margin: '0 auto' }}>

          {/* ── Cluster Labels (outer ring) ─────────────────── */}
          <AnimatePresence>
            {showClusters && Object.entries(SOURCE_CLUSTERS).map(([key, cluster]) => {
              const clusterNodes = nodes.filter(n => n.clusterKey === key);
              if (clusterNodes.length === 0) return null;
              // Average position of all nodes in this cluster
              const cx = clusterNodes.reduce((s, n) => s + n.x, 0) / clusterNodes.length;
              const cy = clusterNodes.reduce((s, n) => s + n.y, 0) / clusterNodes.length;
              const angle = Math.atan2(cy, cx);
              const labelR = baseRadius * 0.92;
              const lx = Math.cos(angle) * labelR;
              const ly = Math.sin(angle) * labelR;
              const ClusterIcon = cluster.icon;

              return (
                <motion.div
                  key={`cluster-label-${key}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `calc(50% + ${lx}px)`,
                    top: `calc(50% + ${ly}px)`,
                  }}
                >
                  <div
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border backdrop-blur-sm"
                    style={{
                      background: cluster.bgColor,
                      borderColor: cluster.borderColor,
                    }}
                  >
                    <ClusterIcon size={12} style={{ color: cluster.color }} />
                    <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: cluster.color }}>
                      {cluster.sublabel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ── Connection Lines ─────────────────────────────── */}
          <div className="absolute" style={{ left: '50%', top: '50%' }}>
            <AnimatePresence>
              {showDependencies && nodes.map((node, i) => {
                const faded = shouldFade(node);
                if (faded) return null;
                const color = getNodeColor(node);
                return (
                  <FlowLine
                    key={`line-${node.obligation_id}`}
                    x2={node.x}
                    y2={node.y}
                    color={color}
                    isCritical={node.risk_band === 'Critical'}
                    delay={i * 0.07}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Central Hub ─────────────────────────────────── */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: '50%', top: '50%' }}
          >
            {/* Orbital rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed pointer-events-none"
              style={{
                left: '50%', top: '50%',
                width: baseRadius * 1.85, height: baseRadius * 1.85,
                borderColor: 'rgba(118,192,67,0.06)',
              }}
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
              style={{
                left: '50%', top: '50%',
                width: baseRadius * 1.2, height: baseRadius * 1.2,
                borderColor: 'rgba(118,192,67,0.08)',
              }}
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
              style={{
                left: '50%', top: '50%',
                width: baseRadius * 0.5, height: baseRadius * 0.5,
                borderColor: 'rgba(118,192,67,0.12)',
              }}
            />

            {/* Core */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring', damping: 12 }}
              className="relative flex flex-col items-center justify-center"
              style={{ width: 96, height: 96, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center relative border"
                style={{
                  background: 'var(--color-bg-base)',
                  borderColor: 'rgba(118,192,67,0.4)',
                  boxShadow: hasCritical
                    ? '0 0 48px rgba(255,68,68,0.15), 0 0 24px rgba(118,192,67,0.1)'
                    : '0 0 48px rgba(118,192,67,0.1)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Shield size={40} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
                {hasCritical && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full animate-pulse"
                    style={{ background: '#FF4444', boxShadow: '0 0 12px #FF4444' }}
                  />
                )}
              </div>
              <div
                className="absolute -bottom-10 text-[10px] font-bold tracking-widest text-[var(--color-accent-primary)] uppercase whitespace-nowrap"
                style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
              >
                Obligation Graph
              </div>
            </motion.div>
          </div>

          {/* ── Nodes ────────────────────────────────────────── */}
          {nodes.map((node, i) => {
            const color = getNodeColor(node);
            const faded = shouldFade(node);
            const isCritical = node.risk_band === 'Critical';
            const isHigh = node.risk_band === 'High Risk';
            const size = node.nodeSize;

            return (
              <motion.div
                key={node.obligation_id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: faded ? 0.15 : 1,
                  scale: faded ? 0.85 : 1,
                  x: node.x,
                  y: node.y,
                }}
                transition={{ duration: 0.7, delay: i * 0.05, type: 'spring', damping: 14 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-30"
                style={{ left: '50%', top: '50%' }}
              >
                <Link href={`/obligations/${node.obligation_id}`}>
                  <div className="flex flex-col items-center gap-2 cursor-pointer relative">
                    {/* Node bubble */}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="relative flex items-center justify-center rounded-full border-2 transition-shadow"
                      style={{
                        width: size,
                        height: size,
                        background: `${color}18`,
                        borderColor: `${color}70`,
                        boxShadow: isCritical
                          ? `0 0 20px ${color}50, 0 0 8px ${color}30`
                          : `0 0 8px ${color}20`,
                      }}
                    >
                      <span
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: isCritical ? 14 : isHigh ? 12 : 10,
                          height: isCritical ? 14 : isHigh ? 12 : 10,
                          background: color,
                        }}
                      />
                      {/* Pulse ring for critical */}
                      {isCritical && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping opacity-30"
                          style={{ border: `2px solid ${color}` }}
                        />
                      )}
                      {/* Second ring for high risk */}
                      {isHigh && (
                        <motion.span
                          className="absolute inset-0 rounded-full opacity-20"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          style={{ border: `2px solid ${color}` }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <div
                      className="absolute whitespace-nowrap max-w-[150px] text-center px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-all shadow-md border overflow-hidden"
                      style={{
                        top: size + 8,
                        background: 'var(--color-bg-elevated)',
                        borderColor: `${color}30`,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span className="block truncate max-w-[130px]">
                        {node.obligation?.title || 'Unknown Obligation'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40">
              <Shield size={32} className="text-[var(--color-accent-primary)]" strokeWidth={1} />
              <p className="text-sm text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
                No obligations tracked yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: Flow Pipeline ───────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex justify-center pb-6 px-8">
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-xl border overflow-x-auto max-w-full backdrop-blur-sm"
          style={{
            background: 'var(--color-bg-secondary)',
            borderColor: 'rgba(118,192,67,0.15)',
          }}
        >
          {/* Source legend */}
          {showClusters && Object.entries(SOURCE_CLUSTERS).map(([key, cluster]) => {
            const has = nodes.some(n => n.clusterKey === key);
            if (!has) return null;
            return (
              <div key={key} className="flex items-center gap-1.5 whitespace-nowrap opacity-80">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cluster.color }} />
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: cluster.color }}>
                  {cluster.sublabel}
                </span>
              </div>
            );
          })}

          <span className="text-[var(--color-accent-primary)]/30 text-xs px-1">|</span>

          {/* Flow labels */}
          {[
            { label: 'Discovery Agents', color: 'var(--color-text-secondary)' },
            { label: '→', color: 'rgba(118,192,67,0.4)' },
            { label: 'Obligation Graph', color: 'var(--color-accent-primary)', glow: true },
            { label: '→', color: 'rgba(118,192,67,0.4)' },
            { label: 'Risk Engine', color: '#FF4444' },
            { label: '→', color: 'rgba(118,192,67,0.4)' },
            { label: 'Future Outcomes', color: 'var(--color-text-secondary)' },
            { label: '→', color: 'rgba(118,192,67,0.4)' },
            { label: 'Chief of Staff', color: 'var(--color-text-secondary)' },
            { label: '→', color: 'rgba(118,192,67,0.4)' },
            { label: 'Execution', color: 'var(--color-risk-safe)' },
          ].map((item, i) => (
            <span
              key={i}
              className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap"
              style={{
                color: item.color,
                textShadow: item.glow ? '0 0 8px var(--color-accent-primary)' : undefined,
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
