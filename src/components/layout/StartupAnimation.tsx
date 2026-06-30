'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Calendar, CheckSquare, GraduationCap, FileText } from 'lucide-react';

function CircuitLines({ phase }: { phase: number }) {
  return (
    <motion.svg
      className="absolute right-full mr-4 w-[200px] h-[300px] opacity-40 text-[var(--color-accent-primary)] z-0"
      viewBox="0 0 200 300"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <motion.path
        d="M 0 50 H 50 L 80 80 H 150"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.circle cx="150" cy="80" r="3" fill="currentColor" 
        initial={{ scale: 0 }} animate={{ scale: phase >= 1 ? 1 : 0 }} transition={{ delay: 1.5 }} />

      <motion.path
        d="M 0 150 H 80 L 110 120 H 180"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.circle cx="180" cy="120" r="3" fill="currentColor" 
        initial={{ scale: 0 }} animate={{ scale: phase >= 1 ? 1 : 0 }} transition={{ delay: 1.7 }} />

      <motion.path
        d="M 0 250 H 60 L 90 280 H 160"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
      />
      <motion.circle cx="160" cy="280" r="3" fill="currentColor" 
        initial={{ scale: 0 }} animate={{ scale: phase >= 1 ? 1 : 0 }} transition={{ delay: 1.9 }} />
    </motion.svg>
  );
}

export default function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [
      setTimeout(() => setPhase(1), 800),   // Scene 2: Grid, Light, Circuits (0.8s)
      setTimeout(() => setPhase(2), 1800),  // Scene 3: Icons Materialize (1.8s)
      setTimeout(() => setPhase(3), 2800),  // Scene 4: Logo Reveal & Shockwave (2.8s)
      setTimeout(() => setPhase(4), 3800),  // Scene 5: Typography (3.8s)
      setTimeout(() => {
        setPhase(5); // Fade out (5.3s)
        setTimeout(onComplete, 800);
      }, 5300)
    ];
    return () => timings.forEach(clearTimeout);
  }, [onComplete]);

  // Deterministic particles
  const particles = Array.from({ length: 50 }).map((_, i) => {
    // seeded random-like distribution
    const x = ((i * 13) % 400) - 200;
    const y = ((i * 27) % 400) - 200;
    const size = ((i * 7) % 3) + 1.5;
    const delay = ((i * 3) % 10) * 0.1;
    return { id: i, x, y, size, delay };
  });

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 5 ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* SCENE 2: Volumetric Light */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.4 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,var(--color-accent-primary)_0%,transparent_60%)] mix-blend-screen filter blur-[100px]" />
      </motion.div>

      {/* SCENE 2: Digital Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* SCENE 1 & 2: Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-[var(--color-accent-primary)] rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.8)]"
            style={{ width: p.size, height: p.size, left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
            initial={{ opacity: 0, x: -80 }}
            animate={
              phase >= 3 
                ? { opacity: 0, x: 0, scale: 0 } // Scene 4: converge
                : { opacity: phase >= 0 ? [0, 1, 0.2] : 0, x: phase >= 1 ? 40 : 0 } // Scene 2: flow right
            }
            transition={{
              opacity: { duration: 1.5, delay: p.delay, repeat: phase < 3 ? Infinity : 0, repeatType: 'reverse' },
              x: { duration: 3, ease: "linear", repeat: phase < 3 ? Infinity : 0 },
              scale: { duration: 0.8, ease: "backIn" }
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center w-full h-[400px] z-10">
        
        {/* SCENE 2: Circuit Lines */}
        <CircuitLines phase={phase} />

        {/* SCENE 3: Orbiting Icons */}
        <AnimatePresence>
          {phase >= 2 && phase < 5 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, rotate: -30, scale: 0.9 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Semicircle orbit path */}
              <div className="absolute w-[420px] h-[420px] rounded-full border-r border-dashed border-[var(--color-accent-primary)]/10" />
              
              {/* Execution System Icons */}
              {[Mail, Calendar, CheckSquare, GraduationCap, FileText].map((Icon, i, arr) => {
                const angle = -60 + (120 / (arr.length - 1)) * i; // Distribute on the right side
                const radius = 210; // Slightly larger than logo
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={i}
                    className="absolute flex items-center justify-center w-11 h-11 rounded-xl bg-[#0a0a0a]/80 border border-[var(--color-accent-primary)]/20 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15, duration: 0.6, type: "spring", bounce: 0.4 }}
                  >
                    <Icon size={18} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 4: Logo Assembly / Reveal */}
        <motion.div
          className="absolute z-20"
          initial={{ clipPath: 'inset(0% 100% 0% 0%)', opacity: 0, filter: 'brightness(2) contrast(1.2)' }}
          animate={
            phase >= 3 
              ? { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, filter: 'brightness(1) contrast(1)' } 
              : { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }
          }
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image 
            src="/optimus-logo.png" 
            alt="OPTIMUS Logo" 
            width={320}
            height={320}
            className="object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]"
            priority
          />
        </motion.div>

        {/* SCENE 4: Energy Pulse / Shockwave (Internal Checkmark simulator) */}
        {phase === 3 && (
          <motion.div
            className="absolute z-30 rounded-full border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 mix-blend-screen pointer-events-none"
            style={{ width: 100, height: 100 }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 6, opacity: 0, borderWidth: "0px" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          />
        )}
      </div>

      {/* SCENE 5: Typography (Final Hero Shot) */}
      <div className="absolute bottom-16 flex flex-col items-center justify-center text-center w-full z-20">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white tracking-[0.35em] font-orbitron uppercase mb-3"
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={phase >= 4 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
        >
          OPTIMUS
        </motion.h1>
        
        <motion.p
          className="text-[12px] md:text-[14px] font-mono text-[var(--color-accent-primary)] tracking-[0.4em] uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Your AI Chief of Staff
        </motion.p>

        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <p className="text-[10px] md:text-xs text-zinc-500 font-light tracking-widest italic" style={{ letterSpacing: '0.2em' }}>
            &quot;AI ACTS FIRST. HUMANS APPROVE.&quot;
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
